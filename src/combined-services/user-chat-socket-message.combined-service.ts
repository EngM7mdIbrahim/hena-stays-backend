import {
  Message,
  NotificationTitles,
  NotificationTypes,
  SOCKET_EVENTS,
  SocketClientToServerMap,
  User
} from '@commonTypes'
import { MESSAGES, SOCKET_ERROR_MESSAGES, SOCKET_ROOMS } from '@constants'
import { AppSocket } from '@contracts'
import {
  chatService,
  loggerService,
  messageService,
  socketService,
  userService
} from '@services'

import { getActorDataFromSocket, serializeDto } from '@utils'

import { notificationDeviceCombinedService } from './notification-device.combined-service'

class UserChatSocketMessageCombinedService {
  constructor() {}

  // Socket Chat Events
  async handleLeaveChat(socket: AppSocket, chatId: string) {
    try {
      socket.leave(`${SOCKET_ROOMS.CHAT_PREFIX}${chatId}`)
      loggerService.info(
        `User with id ${socket.data.user._id} left chat: ${chatId}`
      )
    } catch (error: any) {
      loggerService.error(`Error leaving chat: ${error?.message}`)
    }
  }

  async handleJoinChat(socket: AppSocket, chatId: string) {
    try {
      const chat = await chatService.readOne({
        _id: chatId
      })

      if (!chat) {
        socket.emit(
          SOCKET_EVENTS.ERROR,
          new Error(SOCKET_ERROR_MESSAGES.CHAT_NOT_FOUND)
        )
        return
      }

      socket.join(`${SOCKET_ROOMS.CHAT_PREFIX}${chatId}`)
      loggerService.info(`User joined chat: ${chatId}`)
    } catch (error: any) {
      loggerService.error(`Error joining chat: ${error?.message}`)
      socket.emit(
        SOCKET_EVENTS.ERROR,
        new Error(SOCKET_ERROR_MESSAGES.INVALID_DATA)
      )
    }
  }

  // Socket Chat Message Events
  async handleNewMessage(
    socket: AppSocket,
    data: Parameters<
      SocketClientToServerMap[typeof SOCKET_EVENTS.NEW_MESSAGE]
    >[0]
  ) {
    const roomName = `${SOCKET_ROOMS.CHAT_PREFIX}${data.message.chat}`
    try {
      const { message: inputMessage } = data

      // Verify chat exists and user is a participant
      const chat = await chatService.readOne({
        _id: inputMessage.chat,
        users: { $in: [socket.data.user._id] }
      })

      if (!chat) {
        socket.emit(
          SOCKET_EVENTS.ERROR,
          new Error(SOCKET_ERROR_MESSAGES.CHAT_NOT_FOUND)
        )
        return
      }
      const message = await messageService.create(
        {
          ...inputMessage,
          sender: socket.data.user._id.toString(),
          readBy: [socket.data.user._id.toString()]
        },
        { actor: getActorDataFromSocket(socket) }
      )
      socketService.emitToRoom(roomName, SOCKET_EVENTS.NEW_MESSAGE, {
        message: {
          ...serializeDto<Message>(message),
          sender: serializeDto<User>(socket.data.user)
        }
      })
      // Notify the other users in the chat that not in the room
      const userIdsInRoom = socketService
        .getUsersInRoom(roomName)
        .map((id) => id.toString())
      const usersNotInRoom = chat.users.filter(
        (id) => !userIdsInRoom.includes(id.toString())
      )
      await Promise.all(
        usersNotInRoom.map((id) => {
          notificationDeviceCombinedService.sendPushNotificationToUser(
            NotificationTypes.Message,
            {
              userId: id.toString(),
              notificationData: {
                title: NotificationTitles.Message,
                body: `${socket.data.user.name}: ${inputMessage.text}`,
                image: message.media?.[0]?.url,
                payload: {
                  _id: message._id.toString(),
                  chat: chat._id.toString(),
                  sender: socket.data.user._id.toString()
                }
              }
            }
          )
        })
      )
    } catch (error) {
      if (error instanceof Error) {
        loggerService.error(`Error sending message: ${error?.message}`)
      } else {
        loggerService.error(
          `Unknown error happened while sending message to chat: ${data.message.chat} from user: ${getActorDataFromSocket(socket)}`
        )
      }
      socket.emit(
        SOCKET_EVENTS.ERROR,
        new Error(SOCKET_ERROR_MESSAGES.INVALID_DATA)
      )
    }
  }

  async handleDeleteMessage(socket: AppSocket, messageId: string) {
    try {
      const existingMessage = await messageService.readOne({
        _id: messageId,
        sender: socket.data.user._id.toString()
      })

      if (!existingMessage) {
        socket.emit(
          SOCKET_EVENTS.ERROR,
          new Error(MESSAGES.notFound('Message'))
        )
        return
      }

      await messageService.delete(
        { _id: messageId },
        {
          actor: getActorDataFromSocket(socket)
        }
      )
      // Emit to all participants in the chat
      socketService.emitToRoom(
        `${SOCKET_ROOMS.CHAT_PREFIX}${existingMessage.chat}`,
        SOCKET_EVENTS.DELETE_MESSAGE,
        {
          messageId: existingMessage._id.toString()
        }
      )
    } catch (error) {
      if (error instanceof Error) {
        loggerService.error(`Error deleting message: ${error?.message}`)
      } else {
        loggerService.error(
          `Unknown error happened while deleting message: ${messageId}`
        )
      }
      socket.emit(
        SOCKET_EVENTS.ERROR,
        new Error(SOCKET_ERROR_MESSAGES.INVALID_DATA)
      )
    }
  }

  async handleUserOnline(socket: AppSocket) {
    socketService.emitToAll(SOCKET_EVENTS.USER_ONLINE, {
      user: serializeDto<User>(socket.data.user)
    })
    loggerService.info(`User ${getActorDataFromSocket(socket)} is online`)
  }

  async handleUserOffline(socket: AppSocket) {
    const user = await userService.update(
      { _id: socket.data.user._id },
      {
        chatMeta: {
          online: false
        }
      },
      { actor: getActorDataFromSocket(socket) }
    )
    socketService.emitToAll(SOCKET_EVENTS.USER_OFFLINE, {
      user: serializeDto<User>(user)
    })
    const rooms = Array.from(socket.rooms)
    for (const room of rooms) {
      socket.leave(room)
    }
    loggerService.info(`User ${getActorDataFromSocket(socket)} is offline`)
  }

  async handleUserTyping(
    socket: AppSocket,
    data: {
      chatId: string
    }
  ) {
    await userService.update(
      { _id: socket.data.user._id },
      { 'chatMeta.typing': true },
      { actor: getActorDataFromSocket(socket) }
    )
    socketService.emitToRoom(
      `${SOCKET_ROOMS.CHAT_PREFIX}${data.chatId}`,
      SOCKET_EVENTS.USER_TYPING,
      {
        user: serializeDto<User>(socket.data.user),
        chatId: data.chatId
      }
    )
  }

  async handleUserStopTyping(
    socket: AppSocket,
    data: {
      chatId: string
    }
  ) {
    await userService.update(
      { _id: socket.data.user._id },
      { 'chatMeta.typing': false },
      { actor: getActorDataFromSocket(socket) }
    )
    socketService.emitToRoom(
      `${SOCKET_ROOMS.CHAT_PREFIX}${data.chatId}`,
      SOCKET_EVENTS.USER_STOP_TYPING,
      {
        user: serializeDto<User>(socket.data.user),
        chatId: data.chatId
      }
    )
  }
}

export const userChatSocketMessageCombinedService =
  new UserChatSocketMessageCombinedService()
