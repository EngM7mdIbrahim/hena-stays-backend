import {
  CreateMessageRequest,
  CreateMessageResponse,
  DeleteMessageByIdRequestParams,
  DeleteMessageByIdResponse,
  Message
} from '@commonTypes'
import { MESSAGES } from '@constants'
import { AppError } from '@contracts'
import { chatService, messageService } from '@services'
import { Request, Response } from 'express'
import mongoose from 'mongoose'

import { getLoggedInUserId, sendSuccessResponse, serializeDto } from '@utils'

class MessagesController {
  /**
   * Sends a new message to a chat.
   * Only for offline purposes
   */
  async create(
    req: Request<any, any, any, CreateMessageRequest>,
    res: Response<CreateMessageResponse>
  ) {
    const { chatId, text, media } = req.body

    const senderId = getLoggedInUserId(req)

    const chat = await chatService.readOne({
      _id: chatId,
      users: { $in: [senderId] }
    })
    if (!chat) {
      throw new AppError(MESSAGES.CHATS.NOT_FOUND, 404)
    }

    const participants = chat.users.filter(
      (id: mongoose.Types.ObjectId) => !id.equals(senderId)
    )
    if (participants.length === 0) {
      throw new AppError(MESSAGES.CHATS.NO_PARTICIPANTS, 400)
    }
    const message = await messageService.create(
      {
        chat: chat._id.toString(),
        sender: senderId,
        text,
        media,
        readBy: []
      },
      { actor: senderId }
    )

    // Emit new messages to chat room
    const serializedResponse = serializeDto<Message>(message)

    return sendSuccessResponse(res, { message: serializedResponse })
  }

  async deleteMessage(
    req: Request<DeleteMessageByIdRequestParams, any, any>,
    res: Response<DeleteMessageByIdResponse>
  ) {
    const { id: messageId } = req.params

    const message = await messageService.delete(
      {
        _id: messageId,
        sender: getLoggedInUserId(req)
      },
      { actor: getLoggedInUserId(req) }
    )
    return sendSuccessResponse(res, { message: serializeDto<Message>(message) })
  }
}

export const messageController = new MessagesController()
