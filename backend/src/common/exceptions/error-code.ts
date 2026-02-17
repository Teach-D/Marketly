export enum ErrorCode {
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  INVALID_TOKEN = 'INVALID_TOKEN',
  UNAUTHORIZED = 'UNAUTHORIZED',
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  CART_ITEM_NOT_FOUND = 'CART_ITEM_NOT_FOUND',
  CART_EMPTY = 'CART_EMPTY',
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  ORDER_FORBIDDEN = 'ORDER_FORBIDDEN',
  ORDER_INVALID_STATUS = 'ORDER_INVALID_STATUS',
}

export const ErrorMessage: Record<ErrorCode, string> = {
  [ErrorCode.USER_ALREADY_EXISTS]: '이미 존재하는 이메일입니다.',
  [ErrorCode.USER_NOT_FOUND]: '존재하지 않는 사용자입니다.',
  [ErrorCode.INVALID_CREDENTIALS]: '이메일 또는 비밀번호가 올바르지 않습니다.',
  [ErrorCode.INVALID_TOKEN]: '유효하지 않은 토큰입니다.',
  [ErrorCode.UNAUTHORIZED]: '인증이 필요합니다.',
  [ErrorCode.PRODUCT_NOT_FOUND]: '존재하지 않는 상품입니다.',
  [ErrorCode.INSUFFICIENT_STOCK]: '재고가 부족합니다.',
  [ErrorCode.CART_ITEM_NOT_FOUND]: '장바구니에 존재하지 않는 상품입니다.',
  [ErrorCode.CART_EMPTY]: '장바구니가 비어 있습니다.',
  [ErrorCode.ORDER_NOT_FOUND]: '존재하지 않는 주문입니다.',
  [ErrorCode.ORDER_FORBIDDEN]: '주문에 대한 접근 권한이 없습니다.',
  [ErrorCode.ORDER_INVALID_STATUS]: '현재 상태에서 허용되지 않는 상태 변경입니다.',
};
