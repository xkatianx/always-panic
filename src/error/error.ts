import { MyErrorBase } from './base.js'

export enum MyErrorCode {
  /** some errors thrown by others' packages not dealt */
  OTHERS,
  /** not used for now */
  placeholder,
}

export class MyError<C extends MyErrorCode> extends MyErrorBase<C> {
  protected causeForUnwrap = true

  constructor(code: C, message: string) {
    super(code, message)
    this.name = 'MyError'
  }

  static override fromAny(e: unknown) {
    const err = new MyError(
      MyErrorCode.OTHERS,
      Error.isError(e) ? e.message : String(e),
    )
    err.cause = e
    return err
  }
}
