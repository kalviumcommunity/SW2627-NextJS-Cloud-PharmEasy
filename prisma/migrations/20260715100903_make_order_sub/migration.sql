-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_subscriptionId_fkey";

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
