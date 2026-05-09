import { ZodError, z } from "zod";

import type { FormState } from "@/lib/types";

export const categories = [
  "Music",
  "Workshop",
  "Wellness",
  "Food",
  "Sports",
  "Community"
] as const;

const requiredNumber = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .transform((value) => Number(value))
    .pipe(z.number().finite(`${label} must be a valid number.`));

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Full name is required.").max(120, "Name is too long."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password is too long."),
  role: z.enum(["organiser", "attendee"])
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required.")
});

export const eventSchema = z
  .object({
    title: z.string().trim().min(4, "Title is required.").max(160, "Title is too long."),
    category: z.enum(categories),
    venue: z.string().trim().min(2, "Venue is required.").max(160, "Venue is too long."),
    city: z.string().trim().min(2, "City is required.").max(120, "City is too long."),
    startsAt: z.string().trim().min(1, "Start date is required."),
    endsAt: z.string().trim().min(1, "End date is required."),
    price: requiredNumber("Ticket price").pipe(z.number().min(0, "Ticket price cannot be negative.")),
    capacity: requiredNumber("Capacity")
      .pipe(z.number().int("Capacity must be a whole number.").min(1, "Capacity must be at least 1.").max(5000, "Capacity is too large.")),
    excerpt: z.string().trim().min(12, "Add a short summary.").max(220, "Summary is too long."),
    description: z.string().trim().min(40, "Description should be more detailed.").max(5000, "Description is too long."),
    status: z.enum(["scheduled", "cancelled"]).default("scheduled")
  })
  .superRefine((value, ctx) => {
    const now = new Date();
    const startsAt = new Date(value.startsAt);
    const endsAt = new Date(value.endsAt);

    if (startsAt <= now) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startsAt"],
        message: "Start time must be in the future."
      });
    }

    if (endsAt <= startsAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endsAt"],
        message: "End time must be after the start time."
      });
    }
  });

export const bookingSchema = z.object({
  eventId: requiredNumber("Event").pipe(z.number().int().positive()),
  seats: requiredNumber("Seats")
    .pipe(z.number().int("Seats must be a whole number.").min(1, "Reserve at least one seat.").max(6, "You can reserve up to 6 seats at once."))
});

export const roleUpdateSchema = z.object({
  userId: requiredNumber("User").pipe(z.number().int().positive()),
  role: z.enum(["admin", "organiser", "attendee"])
});

export const userDeleteSchema = z.object({
  userId: requiredNumber("User").pipe(z.number().int().positive())
});

export const eventDeleteSchema = z.object({
  eventId: requiredNumber("Event").pipe(z.number().int().positive())
});

export const bookingCancelSchema = z.object({
  bookingId: requiredNumber("Booking").pipe(z.number().int().positive())
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Full name is required.").max(120, "Name is too long."),
  email: z.string().trim().email("Enter a valid email address."),
  message: z.string().trim().min(10, "Message must be at least 10 characters.").max(2000, "Message is too long.")
});

export const ticketResolveSchema = z.object({
  ticketId: requiredNumber("Ticket").pipe(z.number().int().positive())
});

export function validationErrorState(error: ZodError): FormState {
  return {
    status: "error",
    message: "Please review the highlighted fields.",
    fieldErrors: error.flatten().fieldErrors
  };
}

export const idleFormState: FormState = {
  status: "idle"
};
