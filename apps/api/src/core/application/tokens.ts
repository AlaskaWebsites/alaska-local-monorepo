export const TOKENS = {
  DATABASE_SERVICE: Symbol('IDatabaseService'),
  TENANT_REPOSITORY: Symbol('ITenantRepository'),
  PRODUCT_REPOSITORY: Symbol('IProductRepository'),
  ORDER_REPOSITORY: Symbol('IOrderRepository'),
  BOOKING_REPOSITORY: Symbol('IBookingRepository'),
  PIX_GATEWAY: Symbol('IPixGateway')
} as const
