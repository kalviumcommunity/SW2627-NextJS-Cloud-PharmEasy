import { z } from "zod";
import { FREQUENCY } from "@/lib/utils/constants";

export const subscriptionSchema = z.object({
  medicineId: z.string().min(1, "Medicine is required"),
  frequency: z.enum([FREQUENCY.DAILY, FREQUENCY.WEEKLY, FREQUENCY.MONTHLY], {
    errorMap: () => ({ message: "Frequency must be Daily, Weekly, or Monthly" }),
  }),
});

export function validateSubscription(data) {
  return subscriptionSchema.safeParse(data);
}