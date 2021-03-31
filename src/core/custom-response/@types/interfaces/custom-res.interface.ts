import { ErrCodes, ResponseStatus } from "../enums";

export interface CustomError {
  code: ErrCodes;
  msg?: string | string[];
}

export interface CustomResponse<T> {
  status: ResponseStatus;
  data: T;
  error: CustomError;
  namespace: string;
}