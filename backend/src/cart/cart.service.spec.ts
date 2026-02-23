import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProductService } from '../product/product.service';
import { BusinessException } from '../common/exceptions/business.exception';
import { ErrorCode } from '../common/exceptions/error-code';

const mockProduct = {
  id: 'product-id',
  name: '테스트 상품',
  description: null,
  price: 10000,
  stock: 10,
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

const prismaMock = {
  cartItem: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
} as unknown as PrismaService;

const productServiceMock = {
  findById: jest.fn(),
} as unknown as ProductService;

describe('CartService', () => {
  let service: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ProductService, useValue: productServiceMock },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    jest.clearAllMocks();
  });

  describe('findMyCart', () => {
    it('사용자의 장바구니 아이템 목록 반환', async () => {
      (prismaMock.cartItem.findMany as jest.Mock).mockResolvedValue([mockCartItem]);

      const result = await service.findMyCart('user-id');

      expect(result).toHaveLength(1);
      expect(prismaMock.cartItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-id' } }),
      );
    });
  });

  describe('addItem', () => {
    it('상품 존재 확인 후 장바구니에 추가 (upsert)', async () => {
      (productServiceMock.findById as jest.Mock).mockResolvedValue(mockProduct);
      (prismaMock.cartItem.upsert as jest.Mock).mockResolvedValue(mockCartItem);

      const result = await service.addItem('user-id', { productId: 'product-id', quantity: 2 });

      expect(productServiceMock.findById).toHaveBeenCalledWith('product-id');
      expect(result).toEqual(mockCartItem);
    });

    it('존재하지 않는 상품이면 ProductService에서 예외 전파', async () => {
      (productServiceMock.findById as jest.Mock).mockRejectedValue(
        new BusinessException(ErrorCode.PRODUCT_NOT_FOUND),
      );

      await expect(service.addItem('user-id', { productId: 'no-id', quantity: 1 })).rejects.toBeInstanceOf(
        BusinessException,
      );
    });
  });

  describe('updateQuantity', () => {
    it('본인 아이템 수량 변경 성공', async () => {
      (prismaMock.cartItem.findFirst as jest.Mock).mockResolvedValue(mockCartItem);
      (prismaMock.cartItem.update as jest.Mock).mockResolvedValue({ ...mockCartItem, quantity: 5 });

      const result = await service.updateQuantity('user-id', 'cart-item-id', { quantity: 5 });

      expect(result.quantity).toBe(5);
    });

    it('다른 사용자의 아이템이면 CART_ITEM_NOT_FOUND 예외 발생', async () => {
      (prismaMock.cartItem.findFirst as jest.Mock).mockResolvedValue(null);

      const error = await service
        .updateQuantity('other-user-id', 'cart-item-id', { quantity: 1 })
        .catch((e: BusinessException) => e);
      expect(error.getErrorCode()).toBe(ErrorCode.CART_ITEM_NOT_FOUND);
    });
  });

  describe('removeItem', () => {
    it('본인 아이템 삭제 성공', async () => {
      (prismaMock.cartItem.findFirst as jest.Mock).mockResolvedValue(mockCartItem);
      (prismaMock.cartItem.delete as jest.Mock).mockResolvedValue(mockCartItem);

      await service.removeItem('user-id', 'cart-item-id');

      expect(prismaMock.cartItem.delete).toHaveBeenCalledWith({ where: { id: 'cart-item-id' } });
    });

    it('존재하지 않는 아이템이면 CART_ITEM_NOT_FOUND 예외 발생', async () => {
      (prismaMock.cartItem.findFirst as jest.Mock).mockResolvedValue(null);

      const error = await service
        .removeItem('user-id', 'no-item-id')
        .catch((e: BusinessException) => e);
      expect(error.getErrorCode()).toBe(ErrorCode.CART_ITEM_NOT_FOUND);
    });
  });

  describe('clearCart', () => {
    it('사용자의 장바구니 전체 삭제', async () => {
      (prismaMock.cartItem.deleteMany as jest.Mock).mockResolvedValue({ count: 3 });

      await service.clearCart('user-id');

      expect(prismaMock.cartItem.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-id' } });
    });
  });
});
