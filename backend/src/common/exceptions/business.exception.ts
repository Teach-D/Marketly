import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode, ErrorMessage } from './error-code';

export class BusinessException extends HttpException {
  constructor(
    private readonly errorCode: ErrorCode,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(
      {
        success: false,
        data: null,
        error: {
          code: errorCode,
          message: ErrorMessage[errorCode],
        },
      },
      status,
    );
  }

  getErrorCode(): ErrorCode {
    return this.errorCode;
  }
}
