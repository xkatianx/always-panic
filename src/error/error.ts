import { MyErrorBase } from './base.js'

export enum MyErrorCode {
  /** some errors thrown by others' packages not dealt */
  OTHERS,
  /** unreachable */
  UNREACHABLE,
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

  static unreachable(reason: string = '') {
    return new MyError(MyErrorCode.UNREACHABLE, `unreachable: ${reason}`)
  }

  /** Convert to MyErrorCode.OTHERS */
  toOthers() {
    if (this.code === MyErrorCode.OTHERS) return this
    const err = new MyError(MyErrorCode.OTHERS, this.message)
    err.cause = this.cause
    if (this.stack != null) err.stack = this.stack
    return err
  }
}
