import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

import { calculatePrice } from "@/lib/pricing";
import { enforceRateLimit } from "@/lib/rate-limit.server";

const reservationSchema = z.object({
  trip_type: z.enum(["one_way", "round_trip"]).default("one_way"),
  pickup_address: z.string().trim().min(3).max(300),
  dropoff_address: z.string().trim().min(3).max(300),
  pickup_at: z.string().min(1),
  return_at: z.string().optional().nullable(),
  passengers: z.number().int().min(1).max(8),
  luggage: z.number().int().min(0).max(10),
  vehicle_class: z.literal("van"),
  full_name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(6).max(30),
  flight_number: z.string().trim().max(20).optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
  distance_km: z.number().min(0).max(2000).optional().nullable(),
  duration_minutes: z.number().int().min(0).max(2880).optional().nullable(),
  payment_method: z.enum(["cash", "online"]).default("cash"),
});

export const createReservation = createServerFn({ method: "POST" })
  .validator((data: unknown) => reservationSchema.parse(data))
  .handler(async ({ data }) => {
    enforceRateLimit("createReservation", 5, 10 * 60 * 1000);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Le prix fait toujours foi côté serveur — jamais celui envoyé par le client.
    const priceEuros = calculatePrice({
      vehicleClass: data.vehicle_class,
      tripType: data.trip_type,
      distanceKm: data.distance_km ?? undefined,
    });
    const estimatedPriceCents = Math.round(priceEuros * 100);

    const { data: row, error } = await supabaseAdmin
      .from("reservations")
      .insert({
        ...data,
        pickup_at: new Date(data.pickup_at).toISOString(),
        return_at: data.return_at ? new Date(data.return_at).toISOString() : null,
        estimated_price_cents: estimatedPriceCents,
      })
      .select("id")
      .single();
    if (error) {
      console.error("createReservation error", error);
      throw new Error("Impossible d'enregistrer votre réservation. Réessayez.");
    }

    if (data.payment_method === "cash") {
      const { sendReservationNotificationEmail } = await import("@/lib/email.server");
      await sendReservationNotificationEmail({
        id: row.id,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        pickup_address: data.pickup_address,
        dropoff_address: data.dropoff_address,
        pickup_at: data.pickup_at,
        trip_type: data.trip_type,
        passengers: data.passengers,
        luggage: data.luggage,
        flight_number: data.flight_number,
        notes: data.notes,
        distance_km: data.distance_km,
        priceEuros,
      }).catch((emailError) => {
        console.error("sendReservationNotificationEmail error", emailError);
      });

      return { id: row.id, checkoutUrl: null as string | null };
    }

    const { createCheckoutSession } = await import("@/lib/stripe.server");
    const origin = getRequest()?.headers.get("origin") ?? "";
    const checkout = await createCheckoutSession({
      reservationId: row.id,
      priceCents: estimatedPriceCents,
      description: `Gotaxii — ${data.pickup_address} → ${data.dropoff_address}`,
      successUrl: `${origin}/?reservation=${row.id}&payment=success`,
      cancelUrl: `${origin}/?reservation=${row.id}&payment=cancelled`,
    });

    await supabaseAdmin
      .from("reservations")
      .update({ stripe_session_id: checkout.id })
      .eq("id", row.id);

    return { id: row.id, checkoutUrl: checkout.url };
  });
