import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { enforceRateLimit } from "@/lib/rate-limit.server";

const tripInputSchema = z.object({
  originLat: z.number(),
  originLng: z.number(),
  destinationLat: z.number(),
  destinationLng: z.number(),
});

// Calcule la distance et la durée routière entre deux points via l'API
// Google Distance Matrix. Clé serveur dédiée (jamais exposée au navigateur).
export const calculateTrip = createServerFn({ method: "POST" })
  .validator((data: unknown) => tripInputSchema.parse(data))
  .handler(async ({ data }) => {
    enforceRateLimit("calculateTrip", 30, 5 * 60 * 1000);

    const apiKey = process.env.GOOGLE_MAPS_SERVER_KEY;
    if (!apiKey) {
      throw new Error("Configuration manquante: GOOGLE_MAPS_SERVER_KEY.");
    }

    const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
    url.searchParams.set("origins", `${data.originLat},${data.originLng}`);
    url.searchParams.set("destinations", `${data.destinationLat},${data.destinationLng}`);
    url.searchParams.set("units", "metric");
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error("Impossible de calculer la distance du trajet.");
    }

    const json = await response.json();
    const element = json?.rows?.[0]?.elements?.[0];
    if (json.status !== "OK" || !element || element.status !== "OK") {
      throw new Error("Itinéraire introuvable entre ces deux adresses.");
    }

    return {
      distanceKm: round2(element.distance.value / 1000),
      durationMinutes: Math.round(element.duration.value / 60),
    };
  });

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
