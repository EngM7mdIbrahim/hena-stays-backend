import { ActionToTakeTypes, EntityActions } from '@commonTypes'
import { MESSAGES, UserIDs } from '@constants'
import {
  AppError,
  CreateExtraConfig,
  DeleteExtraConfig,
  FindAllExtraConfig,
  ReadOneExtraConfig,
  UpdateExtraConfig
} from '@contracts'
import { EntityLogModel } from '@models'
import { Document, FilterQuery, MergeType, Model, UpdateQuery } from 'mongoose'

import { logDifferences } from '@utils'

import { loggerService } from './logger.service'

export type ActionToTakeType =
  (typeof ActionToTakeTypes)[keyof typeof ActionToTakeTypes]

// Generic BaseService class
export class BaseService<T extends Document, TCreate extends object> {
  // Inject the model and logger as dependencies
  constructor(
    private readonly model: Model<T> // The Mongoose model injected into the service
  ) {}

  private getActorMessage(actor: string) {
    if (actor === 'System') {
      return `The system has`
    }
    const actorParts = actor.split(' - ')
    let logMessage = `The user ${actorParts[1]} with ID ${actorParts[0]}:`
    if (actorParts[2] && actorParts[2].includes('ADMIN')) {
      logMessage = `The ADMIN logged in as user ${actorParts[1]} with ID ${actorParts[0]}:`
    }
    if (actorParts[3]) {
      logMessage += ` and company ${actorParts[3]}:`
    }
    return `${logMessage} has`
  }

  private generateLogMessage(
    action: keyof typeof EntityActions,
    startMessage: string,
    entityId: string,
    diffrences?: string
  ) {
    let logMessage = `${startMessage} ${action}d ${this.model.modelName} with the ID ${entityId}`
    if (diffrences) {
      logMessage += ` with the following changes: ${diffrences}`
    }
    return logMessage
  }

  private getActorId(actor: string) {
    return actor === 'System' ? UserIDs.SYSTEM_ID : actor.split(' - ')[0]
  }

  async findAll<Paths>(
    filter: FilterQuery<T>,
    extraConfig: FindAllExtraConfig = {}
  ) {
    const {
      sort = {},
      limit = 10,
      page = 1,
      populateFields = [],
      select,
      includeDeleted = false
    } = extraConfig
    let query = this.model
      .find({ ...filter, ...(!includeDeleted && { deletedAt: null }) })
      .populate<Paths>(populateFields)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)

    if (select) {
      query = query.select(select) as unknown as typeof query
    }
    const totalResults = await this.count({ filter })
    const results = await query.exec()
    loggerService.info(
      `Found ${results.length} documents in ${this.model.modelName}`
    )
    return {
      results,
      page,
      limit,
      totalResults,
      totalPages: Math.ceil(totalResults / limit)
    }
  }
  async readOne<Paths>(
    filter: FilterQuery<T>,
    extraConfig: Omit<ReadOneExtraConfig, 'throwErrorIf'> & {
      throwErrorIf: typeof ActionToTakeTypes.NotFound
    }
  ): Promise<MergeType<T, Paths>>
  async readOne<Paths>(
    filter: FilterQuery<T>,
    extraConfig?: ReadOneExtraConfig
  ): Promise<MergeType<T, Paths> | null>
  async readOne<Paths>(
    filter: FilterQuery<T>,
    extraConfig: ReadOneExtraConfig = {}
  ): Promise<MergeType<T, Paths> | null> {
    const {
      throwErrorIf = ActionToTakeTypes.Nothing,
      populateFields = [],
      sort = { createdAt: -1 },
      includeDeleted = false,
      session = null
    } = extraConfig

    const query = this.model
      .findOne({ ...filter, ...(!includeDeleted && { deletedAt: null }) })
      .sort(sort)
      .session(session)
      .populate<Paths>(populateFields)

    const result = await query.exec()

    loggerService.info(
      result
        ? `Found ${result._id?.toString()} document in ${this.model.modelName}`
        : `No document found in ${this.model.modelName} with this filter: ${JSON.stringify(
            filter,
            null,
            2
          )}`
    )
    if (throwErrorIf === ActionToTakeTypes.NotFound && !result) {
      loggerService.error(
        `No document found in ${this.model.modelName} with this filter: ${JSON.stringify(
          filter,
          null,
          2
        )}`
      )
      throw new AppError(MESSAGES.notFound(this.model.modelName), 404)
    }
    if (throwErrorIf === ActionToTakeTypes.Found && result) {
      loggerService.error(
        `Document found in ${this.model.modelName} with this filter: ${JSON.stringify(
          filter,
          null,
          2
        )}`
      )
      throw new AppError(MESSAGES.alreadyExists(this.model.modelName), 400)
    }
    return result
  }

  async count({ filter }: { filter: FilterQuery<T> }) {
    const totalResults = await this.model.countDocuments({
      ...filter,
      deletedAt: null
    })
    return totalResults
  }
  // Create method
  async create(item: TCreate, extraConfig: CreateExtraConfig): Promise<T> {
    const { session = null, actor = UserIDs.SYSTEM_ID } = extraConfig
    const createdItem = new this.model(item)
    const result = await createdItem.save({ session: session })
    const logMessage = this.generateLogMessage(
      EntityActions.Create,
      this.getActorMessage(actor),
      result._id as string
    )
    await EntityLogModel.create({
      action: EntityActions.Create,
      entity: this.model.modelName,
      entityId: result._id as string,
      message: logMessage,
      user: this.getActorId(actor)
    })
    loggerService.info(logMessage)
    return result
  }

  async update(
    filter: FilterQuery<T>,
    item: UpdateQuery<T>,
    extraConfig: UpdateExtraConfig
  ): Promise<T> {
    const {
      session = null,
      actor = UserIDs.SYSTEM_ID,
      includeDeleted = false
    } = extraConfig
    const originalDocument = await this.model
      .findOne(filter)
      .session(session)
      .exec()
    if (!originalDocument) {
      throw new AppError(MESSAGES.notFound(this.model.modelName), 404)
    }
    const updateDocument = await this.model
      .findOneAndUpdate(
        { ...filter, ...(!includeDeleted && { deletedAt: null }) },
        item,
        {
          new: true
        }
      )
      .session(session)
      .exec()
    if (
      extraConfig?.throwErrorIf === ActionToTakeTypes.NotFound &&
      !updateDocument
    ) {
      loggerService.error(
        `No document found in ${this.model.modelName} with this filter: ${JSON.stringify(
          filter,
          null,
          2
        )}`
      )
      throw new AppError(MESSAGES.notFound(this.model.modelName), 404)
    }
    let differences = ''
    let logMessage = ''
    if (originalDocument) {
      const originalJson = originalDocument.toObject()
      const updatedJson = updateDocument ? updateDocument.toObject() : {}

      differences = logDifferences(originalJson, updatedJson)
      logMessage = this.generateLogMessage(
        EntityActions.Update,
        this.getActorMessage(actor),
        updateDocument?._id?.toString() as string,
        differences
      )
      await EntityLogModel.create({
        action: EntityActions.Update,
        entity: this.model.modelName,
        entityId: updateDocument?._id?.toString() as string,
        message: logMessage,
        user: this.getActorId(actor)
      })
    }
    loggerService.info(logMessage)
    if (!updateDocument) {
      throw new AppError(MESSAGES.notFound(this.model.modelName), 404)
    }
    return updateDocument
  }

  async updateMany(
    filter: FilterQuery<T>,
    item: UpdateQuery<T>,
    extraConfig: UpdateExtraConfig
  ): Promise<T[]> {
    const {
      session = null,
      actor = UserIDs.SYSTEM_ID,
      includeDeleted = false
    } = extraConfig

    const originalDocuments = await this.model
      .find({ ...filter, ...(!includeDeleted && { deletedAt: null }) })
      .session(session)
      .exec()

    if (originalDocuments.length === 0) {
      throw new AppError(MESSAGES.notFound(this.model.modelName), 404)
    }

    const updatedDocuments = await this.model
      .updateMany(
        { ...filter, ...(!includeDeleted && { deletedAt: null }) },
        item,
        { new: true }
      )
      .session(session)
      .exec()

    if (
      extraConfig?.throwErrorIf === ActionToTakeTypes.NotFound &&
      updatedDocuments.modifiedCount === 0
    ) {
      loggerService.error(
        `No documents found in ${this.model.modelName} with this filter: ${JSON.stringify(
          filter,
          null,
          2
        )}`
      )
      throw new AppError(MESSAGES.notFound(this.model.modelName), 404)
    }

    // Get the updated documents to create logs
    const updatedDocs = await this.model
      .find({ ...filter, ...(!includeDeleted && { deletedAt: null }) })
      .session(session)
      .exec()

    // Create logs for each updated document
    const logsCreationPayload = originalDocuments.map((originalDoc, index) => {
      const updatedDoc = updatedDocs[index]
      const originalJson = originalDoc.toObject()
      const updatedJson = updatedDoc ? updatedDoc.toObject() : {}

      const differences = logDifferences(originalJson, updatedJson)
      const logMessage = this.generateLogMessage(
        EntityActions.Update,
        this.getActorMessage(actor),
        updatedDoc?._id?.toString() as string,
        differences
      )

      loggerService.info(logMessage)

      return {
        action: EntityActions.Update,
        entity: this.model.modelName,
        entityId: updatedDoc?._id?.toString() as string,
        message: logMessage,
        user: this.getActorId(actor)
      }
    })

    await EntityLogModel.insertMany(logsCreationPayload)

    return updatedDocs
  }

  async delete(
    filter: FilterQuery<T>,
    extraConfig: DeleteExtraConfig
  ): Promise<T> {
    const { actor = UserIDs.SYSTEM_ID, includeDeleted = false } = extraConfig
    loggerService.info(`Deleting ${this.model.modelName}...`)
    loggerService.info(`filter: ${JSON.stringify(filter, null, 2)}`)
    const checkIfDeleted = await this.model
      .findOne({ ...filter, ...(!includeDeleted && { deletedAt: null }) })
      .session(extraConfig?.session || null)
      .exec()
    if (!checkIfDeleted) {
      throw new AppError(MESSAGES.notFound(this.model.modelName), 404)
    }
    const result = await this.model
      .findOneAndUpdate(
        { ...filter, ...(!includeDeleted && { deletedAt: null }) },
        { deletedAt: new Date() },
        { new: true }
      )
      .session(extraConfig?.session || null)
      .exec()
    if (!result) {
      throw new AppError(MESSAGES.notFound(this.model.modelName), 404)
    }
    const logMessage = this.generateLogMessage(
      EntityActions.Delete,
      this.getActorMessage(actor),
      result?._id?.toString() as string
    )

    loggerService.info(`${this.model.modelName} deleted with ID ${result?._id}`)
    loggerService.info(logMessage)
    await EntityLogModel.create({
      action: EntityActions.Delete,
      entity: this.model.modelName,
      entityId: (result?._id?.toString() as string) || '',
      message: logMessage,
      user: this.getActorId(actor)
    })

    return result
  }
  async deleteMany(
    filter: FilterQuery<T>,
    extraConfig: DeleteExtraConfig
  ): Promise<void> {
    const {
      actor = UserIDs.SYSTEM_ID,
      includeDeleted = false,
      session = null
    } = extraConfig
    const data = await this.model
      .find({ ...filter, ...(!includeDeleted && { deletedAt: null }) })
      .session(session)
      .exec()
    await this.model
      .updateMany(
        { ...filter, ...(!includeDeleted && { deletedAt: null }) },
        { deletedAt: new Date() },
        { new: true }
      )
      .session(session)
      .exec()
    const logsCreationPayload = data.map((item) => {
      loggerService.info(
        `The system has deleted ${this.model.modelName} with ID ${item?._id?.toString()}`
      )
      return {
        action: EntityActions.Delete,
        entity: this.model.modelName,
        entityId: item?._id?.toString() as string,
        message: `The system has deleted ${this.model.modelName} with the ID ${item?._id?.toString()}`,
        user: this.getActorId(actor)
      }
    })
    await EntityLogModel.insertMany(logsCreationPayload)
  }

  async hardDelete(
    filter: FilterQuery<T>,
    extraConfig: DeleteExtraConfig
  ): Promise<void> {
    const { actor = UserIDs.SYSTEM_ID, session = null } = extraConfig
    const result = await this.readOne(filter, {
      throwErrorIf: ActionToTakeTypes.NotFound,
      ...extraConfig
    })
    await this.model.deleteOne(filter).session(session).exec()
    const logMessage = this.generateLogMessage(
      EntityActions.HardDelete,
      this.getActorMessage(actor),
      result?._id?.toString() as string
    )

    if (!result) {
      return
    }

    loggerService.info(logMessage)
    loggerService.info(
      `${this.model.modelName} hardly deleted with ID ${result?._id}`
    )
    await EntityLogModel.create({
      action: EntityActions.HardDelete,
      entity: this.model.modelName,
      entityId: result?._id?.toString() as string,
      message: logMessage,
      user: this.getActorId(actor)
    })
  }

  async hardDeleteMany(
    filter: FilterQuery<T>,
    extraConfig: DeleteExtraConfig
  ): Promise<void> {
    const { actor = UserIDs.SYSTEM_ID, session = null } = extraConfig
    const result = await this.model.find(filter).session(session).exec()

    await this.model.deleteMany(filter).session(session).exec()
    const logsCreationPayload = result.map((item) => {
      const logMessage = this.generateLogMessage(
        EntityActions.HardDelete,
        this.getActorMessage(actor),
        item?._id?.toString() as string
      )
      loggerService.info(logMessage)

      loggerService.info(
        `${this.model.modelName} hardly deleted with ID ${item?._id}`
      )
      return {
        action: EntityActions.Delete,
        entity: this.model.modelName,
        entityId: item?._id?.toString() as string,
        message: logMessage,
        user: this.getActorId(actor)
      }
    })

    await EntityLogModel.insertMany(logsCreationPayload)
  }
}
