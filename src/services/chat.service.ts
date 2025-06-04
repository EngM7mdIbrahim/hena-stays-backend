import { ChatTypes } from '@commonTypes'
import { CreateChatDto, IChatDocument } from '@contracts'
import { ChatModel } from '@models'

import { BaseService } from './base.service'

class ChatService extends BaseService<IChatDocument, CreateChatDto> {
  constructor() {
    super(ChatModel)
  }

  async findOrCreateSupportChat(userId: string) {
    const chat = await ChatModel.findOne({
      type: ChatTypes.SUPPORT,
      users: userId
    })
    if (!chat) {
      return await this.create(
        {
          users: [userId],
          type: ChatTypes.SUPPORT
        },
        {
          actor: userId
        }
      )
    }
    return chat
  }
}

export const chatService = new ChatService()
