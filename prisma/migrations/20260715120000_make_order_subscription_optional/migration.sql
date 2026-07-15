-- AlterTable
-- Orders can now be created directly for a one-off "Buy Now" medicine
-- purchase, without going through a subscription refill cycle.
ALTER TABLE "Order" ALTER COLUMN "subscriptionId" DROP NOT NULL;