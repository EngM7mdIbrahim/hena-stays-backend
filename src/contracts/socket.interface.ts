import {
  LoggedInModes,
  SocketClientToServerMap,
  SocketServerToClientMap
} from '@commonTypes'
import { Server, Socket } from 'socket.io'

import { IUserDocument } from './user.interface'

export interface SocketData {
  user: IUserDocument
  loggedInMode: (typeof LoggedInModes)[keyof typeof LoggedInModes]
}

export type AppSocketServer = Server<
  SocketClientToServerMap,
  SocketServerToClientMap,
  any,
  SocketData
>

export type AppSocket = Socket<
  SocketClientToServerMap,
  SocketServerToClientMap,
  any,
  SocketData
>
