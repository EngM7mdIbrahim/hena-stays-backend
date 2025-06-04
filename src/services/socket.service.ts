import { SocketClientToServerMap, SocketServerToClientMap } from '@commonTypes'
import { IUserDocument } from '@contracts'
import { Server } from 'socket.io'

class SocketService {
  private static instance: SocketService
  private io: Server<SocketClientToServerMap, SocketServerToClientMap> | null =
    null

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService()
    }
    return SocketService.instance
  }

  setIO(io: Server) {
    this.io = io
  }

  getIO(): Server {
    if (!this.io) {
      throw new Error('Socket.IO has not been initialized')
    }
    return this.io
  }

  // Emit to specific room
  emitToRoom<K extends keyof SocketServerToClientMap>(
    room: string,
    event: K,
    ...data: Parameters<SocketServerToClientMap[K]>
  ) {
    this.getIO()
      .to(room)
      .emit(event, ...data)
  }

  // Emit to all connected clients
  emitToAll<K extends keyof SocketServerToClientMap>(
    event: K,
    ...data: Parameters<SocketServerToClientMap[K]>
  ) {
    this.getIO().emit(event, ...data)
  }

  emitToUsers<K extends keyof SocketServerToClientMap>(
    users: string[],
    event: K,
    ...data: Parameters<SocketServerToClientMap[K]>
  ) {
    this.getIO().sockets.sockets.forEach((socket) => {
      if (users.includes(socket.data.user._id)) {
        socket.emit(event, ...data)
      }
    })
  }

  getUsersInRoom(room: string): IUserDocument['_id'][] {
    return Array.from(this.getIO().sockets.sockets.values())
      .filter((socket) => socket.rooms.has(room))
      .map((socket) => socket.data.user._id)
  }
}

export const socketService = SocketService.getInstance()
