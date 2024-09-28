import {
    saleAmendments,
    saleEvents,
    saleItems,
    taxPaymentEvents,
} from './schema';

export type SaleEvent = typeof saleEvents.$inferSelect;
export type NewSaleEvent = typeof saleEvents.$inferInsert;

export type SaleItem = typeof saleItems.$inferSelect;
export type NewSaleItem = typeof saleItems.$inferInsert;

export type TaxPaymentEvent = typeof taxPaymentEvents.$inferSelect;
export type NewTaxPaymentEvent = typeof taxPaymentEvents.$inferInsert;

export type SaleAmendment = typeof saleAmendments.$inferSelect;
export type NewSaleAmendment = typeof saleAmendments.$inferInsert;
