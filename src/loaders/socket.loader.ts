import { userChatSocketMessageCombinedService } from '@combinedServices'
import {
  ActionToTakeTypes,
  LoggedInModes,
  SOCKET_EVENTS,
  UserRole
} from '@commonTypes'
import { SOCKET_ERROR_MESSAGES } from '@constants'
import { AppSocket, AppSocketServer, JwtObject } from '@contracts'
import { loggerService, socketService, userService } from '@services'

import { verifyJwt } from '@utils'

export const initializeSocket = (io: AppSocketServer) => {
  socketService.setIO(io)
  io.on(SOCKET_EVENTS.CONNECT, async (socket: AppSocket) => {
    const token = socket.handshake.headers.authorization
    if (token) {
      let userId: string = ''
      let loggedInMode: (typeof LoggedInModes)[keyof typeof LoggedInModes] =
        LoggedInModes.USER
      try {
        const data = verifyJwt<JwtObject>(token!)
        userId = data.id
        loggedInMode = data.mode
      } catch {
        socket.emit(
          SOCKET_EVENTS.ERROR,
          new Error(SOCKET_ERROR_MESSAGES.UNAUTHORIZED)
        )
        return
      }
      // Handle user events
      const user = await userService.readOne(
        { _id: userId },
        { throwErrorIf: ActionToTakeTypes.NotFound }
      )
      if (!user) {
        socket.emit(
          SOCKET_EVENTS.ERROR,
          new Error(SOCKET_ERROR_MESSAGES.UNAUTHORIZED)
        )
        return
      }
      socket.data.user = user!
      socket.data.loggedInMode = loggedInMode
      if (user?.role === UserRole.Admin || user?.role === UserRole.Support) {
        loggerService.info(`Support staff connected: ${userId}`)
      }
      await userService.update(
        { _id: userId },
        {
          chatMeta: {
            online: true
          }
        },
        {
          actor: userId
        }
      )
      userChatSocketMessageCombinedService.handleUserOnline(socket)
      // Handle user events
      // Handle disconnection or offline
      socket.on(SOCKET_EVENTS.DISCONNECT, async () => {
        userChatSocketMessageCombinedService.handleUserOffline(socket)
      })

      // Handle chat events
      // Join chat rooms
      socket.on(SOCKET_EVENTS.JOIN_CHAT, ({ chatId }) => {
        userChatSocketMessageCombinedService.handleJoinChat(socket, chatId)
      })
      // Leave chat rooms
      socket.on(SOCKET_EVENTS.LEAVE_CHAT, ({ chatId }) => {
        userChatSocketMessageCombinedService.handleLeaveChat(socket, chatId)
      })

      // Handle new messages
      socket.on(SOCKET_EVENTS.NEW_MESSAGE, async (data) => {
        userChatSocketMessageCombinedService.handleNewMessage(socket, data)
      })

      // Handle deleted messages
      socket.on(SOCKET_EVENTS.DELETE_MESSAGE, (data) => {
        userChatSocketMessageCombinedService.handleDeleteMessage(
          socket,
          data.messageId
        )
      })

      // Handle user typing
      socket.on(SOCKET_EVENTS.USER_TYPING, (data) => {
        userChatSocketMessageCombinedService.handleUserTyping(socket, data)
      })

      // Handle user stop typing
      socket.on(SOCKET_EVENTS.USER_STOP_TYPING, (data) => {
        userChatSocketMessageCombinedService.handleUserStopTyping(socket, data)
      })
    }
    // add user to socket for guest analytics
  })
}
