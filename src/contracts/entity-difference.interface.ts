export type Difference<T> = {
  [K in keyof T]?: T[K] extends object
    ? Difference<T[K]>
    : { before: T[K]; after: T[K] }
}
