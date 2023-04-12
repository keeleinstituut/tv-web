export const assertNever = (x: never): never => {
  throw new Error(`Unexpected object: ${x}`)
}

export type SimpleUnionOmit<
  T,
  K extends string | number | symbol
> = T extends unknown ? Omit<T, K> : never

export type Only<T, U> = {
  [P in keyof T]: T[P]
} & {
  [P in keyof U]?: never
}

export type Either<T, U> = Only<T, U> | Only<U, T>
