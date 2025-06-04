import { AppSocket } from '@contracts'
import { Request } from 'express'

export const getActorData = (req?: Request<any, any, any, any>) => {
  const payload = {
    userId: req?.user?._id.toString(),
    name: req?.user?.name,
    mode: `${req?.loggedInMode ?? ''} mode`.toUpperCase(),
    company: req?.user?.company?.name
  }

  return req?.user ? Object.values(payload).join(' - ') : 'System'
}

export const getActorDataFromSocket = (socket: AppSocket) => {
  const payload = {
    userId: socket.data.user._id,
    name: socket.data.user.name,
    mode: `${socket?.data.loggedInMode ?? ''} mode`.toUpperCase(),
    company: socket.data.user.company?.name ?? ''
  }

  return Object.values(payload).join(' - ')
}
