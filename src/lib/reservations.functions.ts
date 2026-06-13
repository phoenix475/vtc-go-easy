import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const reservationSchema = z.object({
  trip_type: z.enum(["one_way", "round_trip", "hourly"]).default("one_way"),
  pickup_address: z.string().trim().min(3).max(300),
  dropoff_address: z.string().trim().min(3).max(300),
  pickup_at: z.string().min(1),
  return_at: z.string().optional().nullable(),
  passengers: z.number().int().min(1).max(8),
  luggage: z.number().int().min(0).max(10),
  vehicle_class: z.enum(["business", "van", "first"]),
  full_name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(6).max(30),
  flight_number: z.string().trim().max(20).optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
  estimated_price_cents: z.number().int().min(0).max(1_000_000).optional().nullable(),
});

export const createReservation = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => reservationSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("reservations")
      .insert({
        ...data,
        pickup_at: new Date(data.pickup_at).toISOString(),
        return_at: data.return_at ? new Date(data.return_at).toISOString() : null,
      })
      .select("id")
      .single();
    if (error) {
      console.error("createReservation error", error);
      throw new Error("Impossible d'enregistrer votre réservation. Réessayez.");
    }
    return { id: row.id };
  });
