import {
  ActionToTakeTypes,
  Chat,
  ChatTypes,
  CreateChatRequestBody,
  CreateChatResponse,
  FindAllChatsRequestQuery,
  FindAllChatsResponse,
  FindAllMessagesByChatQuery,
  FindAllMessagesByChatRequestParams,
  FindAllMessagesByChatResponse,
  FindChatByIdRequestParams,
  FindChatByIdResponse,
  Message,
  UserRole
} from '@commonTypes'
import { MESSAGES, USER_ROLES_IN_SUPPORT_CHATS } from '@constants'
import {
  AppError,
  IChatDocument,
  IUserDocument,
  PopulatedChatDocument,
  PopulatedMessageDocument
} from '@contracts'
import { chatService, messageService, userService } from '@services'
import { Request, Response } from 'express'
import { RootFilterQuery, RootQuerySelector, Schema } from 'mongoose'

import {
  buildFilters,
  getActorData,
  getLoggedInUserId,
  getPaginationData,
  populationBuilder,
  sendSuccessResponse,
  serializeDto
} from '@utils'

const serializeAndAddChatMeta = async (chats: PopulatedChatDocument[]) => {
  const serializedChats = chats.map((chat) => serializeDto<Chat>(chat))
  for (const chat of serializedChats) {
    const lastMessage = await messageService.readOne(
      {
        chat: chat._id
      },
      { sort: { createdAt: -1 } }
    )
    chat.lastMessage = lastMessage ? serializeDto<Message>(lastMessage) : null
  }
  return serializedChats
}
const getAllSupportUsers = async () => {
  return userService.findAll(
    {
      role: { $in: USER_ROLES_IN_SUPPORT_CHATS }
    },
    {
      limit: Number.MAX_SAFE_INTEGER
    }
  )
}
async function checkAndAddSupportUsersInSupportChats(
  chat: IChatDocument
): Promise<IChatDocument>
async function checkAndAddSupportUsersInSupportChats(
  chat: PopulatedChatDocument
): Promise<PopulatedChatDocument>
async function checkAndAddSupportUsersInSupportChats(
  chat: IChatDocument | PopulatedChatDocument
) {
  const allSupportUsers = await getAllSupportUsers()
  const supportUserIds = allSupportUsers.results.map((user) =>
    user._id.toString()
  )
  const chatUsers = chat.users.map((user) => user._id.toString())
  const missingUserIds = supportUserIds.filter((id) => !chatUsers.includes(id))
  if (missingUserIds.length > 0) {
    return await chatService.update(
      { _id: chat._id },
      { users: Array.from(new Set([...chatUsers, ...missingUserIds])) },
      { actor: getActorData() }
    )
  }
  return chat
}
const bulkCheckAndAddSupportUsersInSupportChats = async (
  chats: PopulatedChatDocument[]
) => {
  const allSupportUsers = await userService.count({
    filter: {
      role: { $in: USER_ROLES_IN_SUPPORT_CHATS }
    }
  })
  return await Promise.all(
    chats.map(async (chat) => {
      if (
        chat.type === ChatTypes.SUPPORT &&
        chat.users.length !== allSupportUsers + 1
      ) {
        return await checkAndAddSupportUsersInSupportChats(chat)
      }
      return chat
    })
  )
}
async function filterProtection(
  filters: RootFilterQuery<Chat>,
  user?: IUserDocument
) {
  const { $text, ...restFilters } = filters as RootQuerySelector<Chat>
  let interestedUserIds: Schema.Types.ObjectId[] = []
  if ($text) {
    const { $search } = $text
    interestedUserIds = (
      await userService.findAll(
        {
          name: {
            $regex: $search,
            $options: 'i'
          }
        },
        { limit: Number.MAX_SAFE_INTEGER }
      )
    ).results.map((user) => user._id)
  }
  const searchUserFilter =
    interestedUserIds.length > 0
      ? {
          $or: interestedUserIds.map((id) => ({
            users: { $all: [user?._id, id] }
          }))
        }
      : {}
  if (user?.role === UserRole.Admin) {
    if (interestedUserIds.length > 0) {
      return {
        ...restFilters,
        ...searchUserFilter
      }
    }
    return restFilters
  }
  const userFiltersForOtherUsers =
    interestedUserIds.length > 0
      ? searchUserFilter
      : { users: { $in: [user?._id] } }
  return {
    ...restFilters,
    ...userFiltersForOtherUsers
  }
}
class ChatsController {
  async create(
    req: Request<any, any, CreateChatRequestBody>,
    res: Response<CreateChatResponse>
  ) {
    const { user, type } = req.body
    let chat: IChatDocument
    // Normal chat
    if (type === ChatTypes.NORMAL) {
      if (!user) {
        throw new AppError(MESSAGES.GENERAL_ERROR.BAD_REQUEST, 400)
      }
      if (user === getLoggedInUserId(req)) {
        throw new AppError(MESSAGES.CHATS.CANNOT_CHAT_WITH_SELF, 400)
      }

      const otherUser = await userService.readOne(
        { _id: user },
        { throwErrorIf: ActionToTakeTypes.NotFound }
      )
      // All operator is used to check regardless of the order of the users
      const existingChat = await chatService.readOne({
        users: {
          $all: [req.user?._id, otherUser._id]
        },
        type: ChatTypes.NORMAL
      })

      if (!existingChat) {
        chat = await chatService.create(
          {
            users: [getLoggedInUserId(req), user],
            type
          },
          {
            actor: getActorData(req)
          }
        )
      } else {
        chat = existingChat
      }
    } else {
      const existingChat = await chatService.readOne({
        type: ChatTypes.SUPPORT,
        users: { $in: [getLoggedInUserId(req)] }
      })
      if (!existingChat) {
        chat = await chatService.create(
          {
            type: ChatTypes.SUPPORT,
            users: [
              getLoggedInUserId(req),
              ...(await getAllSupportUsers()).results.map((user) =>
                user._id?.toString()
              )
            ]
          },
          {
            actor: getActorData(req)
          }
        )
      } else {
        chat = await checkAndAddSupportUsersInSupportChats(existingChat)
      }
    }
    const serializedResponse = serializeDto<Chat>(chat)
    return sendSuccessResponse(res, { chat: serializedResponse })
  }

  async getChatById(
    req: Request<FindChatByIdRequestParams>,
    res: Response<FindChatByIdResponse>
  ) {
    const { id: chatId } = req.params
    const populateFields = populationBuilder(req.query.showFields)
    const chat = await chatService.readOne<PopulatedChatDocument>(
      {
        _id: chatId,
        users: { $in: [getLoggedInUserId(req)] }
      },
      { throwErrorIf: ActionToTakeTypes.NotFound, populateFields }
    )
    const [serializedResponse] = await serializeAndAddChatMeta([chat])
    if (!serializedResponse) {
      throw new AppError(MESSAGES.GENERAL_ERROR.INTERNAL_SERVER_ERROR, 500)
    }
    return sendSuccessResponse(res, { chat: serializedResponse })
  }

  async readAll(
    req: Request<any, any, any, FindAllChatsRequestQuery>,
    res: Response<FindAllChatsResponse>
  ) {
    const { support, ...rest } = req.query
    if (!support && req.user?.role === UserRole.Support) {
      throw new AppError(MESSAGES.CHATS.NOT_SUPPORT_CHAT_NOT_ALLOWED, 400)
    }
    const { page, limit, sort, filter: baseFilter } = getPaginationData(rest)
    const filter = await filterProtection(baseFilter, req.user)
    const populateFields = populationBuilder(req.query.showFields)
    const {
      results: chats,
      totalResults,
      totalPages
    } = await chatService.findAll<PopulatedChatDocument>(
      {
        ...filter,
        ...(!support && { type: { $ne: ChatTypes.SUPPORT } })
      },
      { populateFields, sort, page, limit }
    )
    const serializedResponse = await serializeAndAddChatMeta(
      await bulkCheckAndAddSupportUsersInSupportChats(chats)
    )
    return sendSuccessResponse(res, {
      items: serializedResponse,
      total: totalResults,
      limit,
      page,
      totalPages,
      nextPage: page < totalPages ? page + 1 : undefined,
      hasNext: page < totalPages
    })
  }

  async getChatMessages(
    req: Request<
      FindAllMessagesByChatRequestParams,
      any,
      any,
      FindAllMessagesByChatQuery
    >,
    res: Response<FindAllMessagesByChatResponse>
  ) {
    const { id: chatId } = req.params
    const { limit, sort, page } = getPaginationData(req.query)
    let filter: any = {}
    if (req.query?.filter) {
      filter = buildFilters<Message>(req.query.filter)
    }
    const populateFields = populationBuilder(req.query.showFields)
    const userId = getLoggedInUserId(req)
    await chatService.readOne(
      { _id: chatId, users: { $in: [userId] } },
      { throwErrorIf: ActionToTakeTypes.NotFound }
    )

    const {
      results: messages,
      totalPages,
      totalResults
    } = await messageService.findAll<PopulatedMessageDocument>(
      {
        ...filter,
        chat: chatId
      },
      { sort, limit, page, populateFields }
    )
    const messagesToRead = messages.filter(
      (message) => !message.readBy.includes(userId)
    )
    await Promise.all(
      messagesToRead.map(async (message) => {
        message.readBy.push(userId)
        await message.save()
      })
    )

    const serializedResponse = messages.map((message) =>
      serializeDto<Message>(message)
    )
    return sendSuccessResponse(res, {
      items: serializedResponse,
      total: totalResults,
      limit,
      page,
      totalPages,
      nextPage: page < totalPages ? page + 1 : undefined,
      hasNext: page < totalPages
    })
  }
}

export const chatsController = new ChatsController()
