export interface ILogger {
  info(message: string): void

  error(message: string): void

  warn(message: string): void

  debug(message: string): void

  verbose(message: string): void

  silly(message: string): void

  log(message: string): void

  http(message: string): void

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stream(): any
}
