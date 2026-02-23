import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { OrderStatus } from './enums/order-status.enum';
import { Role } from '../common/enums/role.enum';
import { BusinessException } from '../common/exceptions/business.exception';
import { ErrorCode } from '../common/exceptions/error-code';

const mockProduct = {
  id: 'product-id',
  name: '테스트 상품',
  price: 10000,
  stock: 10,
  description: null,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCartItem = {
  id: 'cart-item-id',
  userId: 'user-id',
  productId: 'product-id',
  quantity: 2,
  createdAt: new Date(),
  updatedAt: new Date(),
  product: mockProduct,
};

const mockOrder = {
  id: 'order-id',
  userId: 'user-id',
  status: OrderStatus.PAID,
  totalPrice: 20000,
  createdAt: new Date(),
  updatedAt: new Date(),
  items: [],
};

describe('OrderService', () => {
  let service: OrderService;
  let cartService: jest.Mocked<CartService>;
  let prismaMock: {
    order: { findMany: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prismaMock = {
      order: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PrismaService, useValue: prismaMock },
        {
          provide: CartService,
          useValue: { findMyCart: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    cartService = module.get(CartService);
    jest.clearAllMocks();
  });

  describe('createFromCart', () => {
    it('장바구니 아이템으로 주문 생성 성공', async () => {
      cartService.findMyCart.mockResolvedValue([mockCartItem]);
      prismaMock.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          order: { create: jest.fn().mockResolvedValue(mockOrder) },
          product: { update: jest.fn().mockResolvedValue(mockProduct) },
          cartItem: { deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
        };
        return fn(tx);
      });

      const result = await service.createFromCart('user-id');

      expect(result).toEqual(mockOrder);
    });

    it('장바구니가 비어있으면 CART_EMPTY 예외 발생', async () => {
      cartService.findMyCart.mockResolvedValue([]);

      const error = await service.createFromCart('user-id').catch((e: BusinessException) => e);
      expect(error.getErrorCode()).toBe(ErrorCode.CART_EMPTY);
    });

    it('상품 재고 부족이면 INSUFFICIENT_STOCK 예외 발생', async () => {
      const outOfStockItem = {
        ...mockCartItem,
        quantity: 20,
        product: { ...mockProduct, stock: 5 },
      };
      cartService.findMyCart.mockResolvedValue([outOfStockItem]);

      const error = await service.createFromCart('user-id').catch((e: BusinessException) => e);
      expect(error.getErrorCode()).toBe(ErrorCode.INSUFFICIENT_STOCK);
    });
  });

  describe('findById', () => {
    it('본인 주문 조회 성공', async () => {
      prismaMock.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.findById('order-id', 'user-id', Role.USER);

      expect(result).toEqual(mockOrder);
    });

    it('어드민은 타인 주문 조회 가능', async () => {
      prismaMock.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.findById('order-id', 'other-user-id', Role.ADMIN);

      expect(result).toEqual(mockOrder);
    });

    it('존재하지 않는 주문이면 ORDER_NOT_FOUND 예외 발생', async () => {
      prismaMock.order.findUnique.mockResolvedValue(null);

      const error = await service
        .findById('no-id', 'user-id', Role.USER)
        .catch((e: BusinessException) => e);
      expect(error.getErrorCode()).toBe(ErrorCode.ORDER_NOT_FOUND);
    });

    it('다른 사용자의 주문이면 ORDER_FORBIDDEN 예외 발생', async () => {
      prismaMock.order.findUnique.mockResolvedValue(mockOrder);

      const error = await service
        .findById('order-id', 'other-user-id', Role.USER)
        .catch((e: BusinessException) => e);
      expect(error.getErrorCode()).toBe(ErrorCode.ORDER_FORBIDDEN);
    });
  });

  describe('cancel', () => {
    it('PAID 상태 주문 취소 성공', async () => {
      const cancelledOrder = { ...mockOrder, status: OrderStatus.CANCELLED };
      prismaMock.order.findUnique.mockResolvedValue(mockOrder);
      prismaMock.order.update.mockResolvedValue(cancelledOrder);

      const result = await service.cancel('order-id', 'user-id', Role.USER);

      expect(result.status).toBe(OrderStatus.CANCELLED);
    });

    it('DELIVERED 상태 주문 취소 시 ORDER_INVALID_STATUS 예외 발생', async () => {
      prismaMock.order.findUnique.mockResolvedValue({ ...mockOrder, status: OrderStatus.DELIVERED });

      const error = await service
        .cancel('order-id', 'user-id', Role.USER)
        .catch((e: BusinessException) => e);
      expect(error.getErrorCode()).toBe(ErrorCode.ORDER_INVALID_STATUS);
    });
  });

  describe('ship', () => {
    it('PAID → SHIPPING 상태 변경 성공', async () => {
      prismaMock.order.findUnique.mockResolvedValue(mockOrder);
      prismaMock.order.update.mockResolvedValue({ ...mockOrder, status: OrderStatus.SHIPPING });

      const result = await service.ship('order-id');

      expect(result.status).toBe(OrderStatus.SHIPPING);
    });

    it('SHIPPING 상태에서 SHIPPING으로 변경 시 ORDER_INVALID_STATUS 예외 발생', async () => {
      prismaMock.order.findUnique.mockResolvedValue({ ...mockOrder, status: OrderStatus.SHIPPING });

      const error = await service.ship('order-id').catch((e: BusinessException) => e);
      expect(error.getErrorCode()).toBe(ErrorCode.ORDER_INVALID_STATUS);
    });

    it('존재하지 않는 주문이면 ORDER_NOT_FOUND 예외 발생', async () => {
      prismaMock.order.findUnique.mockResolvedValue(null);

      const error = await service.ship('no-id').catch((e: BusinessException) => e);
      expect(error.getErrorCode()).toBe(ErrorCode.ORDER_NOT_FOUND);
    });
  });

  describe('deliver', () => {
    it('SHIPPING → DELIVERED 상태 변경 성공', async () => {
      prismaMock.order.findUnique.mockResolvedValue({ ...mockOrder, status: OrderStatus.SHIPPING });
      prismaMock.order.update.mockResolvedValue({ ...mockOrder, status: OrderStatus.DELIVERED });

      const result = await service.deliver('order-id');

      expect(result.status).toBe(OrderStatus.DELIVERED);
    });

    it('PAID 상태에서 DELIVERED로 변경 시 ORDER_INVALID_STATUS 예외 발생', async () => {
      prismaMock.order.findUnique.mockResolvedValue(mockOrder);

      const error = await service.deliver('order-id').catch((e: BusinessException) => e);
      expect(error.getErrorCode()).toBe(ErrorCode.ORDER_INVALID_STATUS);
    });
  });
});
