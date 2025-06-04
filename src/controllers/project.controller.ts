import {
  ActionToTakeTypes,
  CreateProjectRequestBody,
  CreateProjectResponse,
  DeleteProjectRequestParams,
  DeleteProjectResponse,
  GetAllProjectsQuery,
  GetAllProjectsResponse,
  GetOneProjectQuery,
  GetOneProjectRequestParams,
  GetOneProjectResponse,
  Project,
  ProjectInteractions,
  ProjectStatusEnum,
  RequestTypes,
  UpdateProjectRequestBody,
  UpdateProjectRequestParams,
  UpdateProjectResponse,
  UserRole
} from '@commonTypes'
import { MESSAGES } from '@constants'
import { IUserDocument, PopulatedProjectDocument } from '@contracts'
import { projectInteractionsService, projectService } from '@services'
import { Request, Response } from 'express'
import { RootFilterQuery } from 'mongoose'

import {
  getActorData,
  getLoggedInUserId,
  getPaginationData,
  populationBuilder,
  sendSuccessResponse,
  serializeDto
} from '@utils'

function filterProtection(
  filters: RootFilterQuery<Project>,
  action: string = RequestTypes.Get,
  user?: IUserDocument,
  isMineRequested: boolean = false
) {
  if (user?.role === UserRole.Admin) {
    return filters
  }

  if (action === RequestTypes.Get) {
    if (isMineRequested) {
      if (
        user?.role === UserRole.Company ||
        user?.role === UserRole.CompanyAdmin
      ) {
        return { ...filters, company: user?.company?._id }
      }
      return { ...filters, owner: user?._id }
    } else {
      return { ...filters, status: ProjectStatusEnum.Active }
    }
  }

  if (!user) {
    throw new Error(MESSAGES.AUTH.RESTRICTION_MESSAGE)
  }

  if (user?.role === UserRole.Company || user?.role === UserRole.CompanyAdmin) {
    return { ...filters, company: user?.company }
  }
  return { ...filters, owner: user?._id }
}

function canReturnInteractionData(
  user: IUserDocument,
  project: PopulatedProjectDocument
) {
  if (user.role === UserRole.Admin || user.role === UserRole.AdminViewer) {
    return true
  }
  if (user.role === UserRole.Broker || user.role === UserRole.Agent) {
    return user._id.toString() === project.owner?._id.toString()
  }
  if (user.role === UserRole.Company || user.role === UserRole.CompanyAdmin) {
    return (
      user.company?.toString() ===
      (project.company?._id
        ? project.company?._id.toString()
        : project.company?.toString())
    )
  }
  return false
}

async function serializeProjectAndAddData(
  projects: PopulatedProjectDocument[],
  user?: IUserDocument
) {
  let serializedProjects = projects.map((project) =>
    serializeDto<GetAllProjectsResponse['items'][number]>(project)
  )
  if (user) {
    // add interactions meta
    const eligibleProjectIdsForInteractions = projects
      .filter((project) => canReturnInteractionData(user, project))
      .map((project) => project._id)
    const eligiblePropertiesInteractions = (
      await projectInteractionsService.findAll({
        project: { $in: eligibleProjectIdsForInteractions }
      })
    ).results
    const serializeProjectsInteractions = eligiblePropertiesInteractions.map(
      (interaction) => serializeDto<ProjectInteractions>(interaction)
    )
    serializedProjects = serializedProjects.map((property) => {
      const interaction = serializeProjectsInteractions.find(
        (interaction) => interaction.project.toString() === property._id
      )
      return {
        ...property,
        ...(interaction && { interaction })
      }
    })
  }
  return serializedProjects
}

class ProjectController {
  async create(
    req: Request<any, any, CreateProjectRequestBody>,
    res: Response<CreateProjectResponse>
  ) {
    const project = await projectService.create(
      {
        ...req.body,
        owner: getLoggedInUserId(req),
        company: req.user?.company ? String(req.user?.company) : undefined,
        status: ProjectStatusEnum.Hold
      },
      {
        actor: getActorData(req)
      }
    )
    return sendSuccessResponse(
      res,
      { project: serializeDto<Project>(project) },
      201
    )
  }

  async update(
    req: Request<UpdateProjectRequestParams, any, UpdateProjectRequestBody>,
    res: Response<UpdateProjectResponse>
  ) {
    const filter = filterProtection({}, RequestTypes.Update, req.user)
    const project = await projectService.update(
      { _id: req.params.id, ...filter },
      req.body,
      {
        actor: getActorData(req)
      }
    )
    if (req.body?.paymentPlan?.fullPrice?.preHandOverPercentage) {
      project.paymentPlan.projectCompletion = []
    }
    if (req.body?.paymentPlan?.projectCompletion?.length) {
      project.paymentPlan.fullPrice = null
    }
    await project.save()
    return sendSuccessResponse(res, { project: serializeDto<Project>(project) })
  }

  async delete(
    req: Request<DeleteProjectRequestParams>,
    res: Response<DeleteProjectResponse>
  ) {
    const filter = filterProtection({}, RequestTypes.Delete, req.user)
    await projectService.readOne(
      {
        _id: req.params.id,
        ...filter
      },
      {
        throwErrorIf: ActionToTakeTypes.NotFound
      }
    )
    const project = await projectService.delete(
      {
        _id: req.params.id,
        ...filter
      },
      {
        actor: getActorData(req),
        session: req.dbSession ?? null
      }
    )
    return sendSuccessResponse(
      res,
      { project: serializeDto<Project>(project) },
      204,
      req
    )
  }

  async readOne(
    req: Request<GetOneProjectRequestParams, any, any, GetOneProjectQuery>,
    res: Response<GetOneProjectResponse>
  ) {
    const isMineRequested = req.query.mine === 'true'

    const filter = filterProtection(
      {},
      RequestTypes.Get,
      req.user,
      isMineRequested
    )
    const populateFields = populationBuilder<Project>(req.query.showFields)
    const project = await projectService.readOne(
      {
        _id: req.params.id,
        ...filter
      },
      {
        throwErrorIf: ActionToTakeTypes.NotFound,
        populateFields
      }
    )
    return sendSuccessResponse(res, {
      project: serializeDto<Project>(project!)
    })
  }

  async read(
    req: Request<any, any, any, GetAllProjectsQuery>,
    res: Response<GetAllProjectsResponse>
  ) {
    const isMineRequested = req.query.mine === 'true'
    const {
      page,
      limit,
      sort,
      filter: baseFilter
    } = getPaginationData(req.query)
    const filter = filterProtection(
      baseFilter,
      RequestTypes.Get,
      req.user,
      isMineRequested
    )
    const populateFields = populationBuilder<Project>(req.query.showFields)
    const projects = await projectService.findAll<PopulatedProjectDocument>(
      { ...filter },
      {
        sort: sort ?? { createdAt: -1 },
        limit,
        page,
        populateFields
      }
    )
    const serializedProjects = await serializeProjectAndAddData(
      projects.results,
      req.user
    )
    sendSuccessResponse(res, {
      items: serializedProjects,
      total: projects.totalResults,
      limit: projects.limit,
      page: projects.page,
      totalPages: projects.totalPages,
      nextPage: page < projects.totalPages ? page + 1 : undefined,
      hasNext: page < projects.totalPages
    })
    res.locals.projects = projects.results.map((project) =>
      serializeDto<Project>(project)
    )
  }
}

export const projectController = new ProjectController()
