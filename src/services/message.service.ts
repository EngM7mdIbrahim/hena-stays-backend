import { CreateMessageDto, IMessageDocument } from '@contracts'
import { MessageModel } from '@models'

import { BaseService } from './base.service'

class MessageService extends BaseService<IMessageDocument, CreateMessageDto> {
  constructor() {
    super(MessageModel)
  }
}

export const messageService = new MessageService()
