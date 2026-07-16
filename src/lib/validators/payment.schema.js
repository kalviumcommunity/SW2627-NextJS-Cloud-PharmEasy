import { z } from "zod";

// Validates the *shape* of a simulated card so the checkout flow feels real.
// Nothing here is a real payment credential, and none of these fields are
// ever written to the database — see attemptPayment() in payment.service.js,
// which only ever records a status (SUCCESS/FAILED/RETRYING), never card data.
export const paymentSchema = z.object({
  cardName: z
    .string()
    .trim()
    .min(2, "Enter the name on the card")
    .max(60, "Name is too long"),
  cardNumber: z
    .string()
    .transform((val) => val.replace(/\s+/g, ""))
    .refine((val) => /^\d{16}$/.test(val), "Card number must be 16 digits"),
  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry must be in MM/YY format")
    .refine((val) => {
      const [month, year] = val.split("/").map(Number);
      const expiryDate = new Date(2000 + year, month); // first day of month after expiry
      return expiryDate > new Date();
    }, "Card has expired"),
  cvv: z.string().regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits"),
});

export function validatePayment(data) {
  return paymentSchema.safeParse(data);
}

// Used when saving a card to the profile — same shape as paymentSchema,
// minus cvv, since a saved card is never allowed to store the CVV.
export const savedCardSchema = paymentSchema.omit({ cvv: true });