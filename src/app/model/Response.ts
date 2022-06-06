import { Status } from './Status';

export interface Response<T> {
  status: Status;
  data: T;
  errorMessage?: string;
}
