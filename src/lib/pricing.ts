// Grille tarifaire Gotaxii — tarifs VTC classiques en Île-de-France.
// Pour changer les prix : modifie juste les nombres ci-dessous, rien d'autre à toucher.

export type VehicleClass = "business" | "van" | "first";
export type TripType = "one_way" | "round_trip" | "hourly";

export const PRICING = {
  business: {
    // Prix plancher : couvre les courses jusqu'à `includedKm` inclus.
    basePrice: 65,
    includedKm: 10,
    perKm: 1.8,
    perHour: 55,
  },
  van: {
    basePrice: 95,
    includedKm: 10,
    perKm: 2.3,
    perHour: 75,
  },
  first: {
    basePrice: 130,
    includedKm: 10,
    perKm: 3.0,
    perHour: 95,
  },
} satisfies Record<VehicleClass, { basePrice: number; includedKm: number; perKm: number; perHour: number }>;

// Mise à disposition (hourly) : nombre d'heures minimum facturé.
export const MIN_HOURLY_HOURS = 3;

/**
 * Calcule le prix en euros pour un trajet.
 * - one_way / round_trip : prix plancher + (distance au-delà des km inclus) * tarif/km.
 *   Le aller-retour double la distance parcourue.
 * - hourly : tarif horaire * nombre d'heures (minimum MIN_HOURLY_HOURS).
 */
export function calculatePrice(params: {
  vehicleClass: VehicleClass;
  tripType: TripType;
  distanceKm?: number;
  hours?: number;
}): number {
  const grid = PRICING[params.vehicleClass];

  if (params.tripType === "hourly") {
    const hours = Math.max(params.hours ?? MIN_HOURLY_HOURS, MIN_HOURLY_HOURS);
    return round2(grid.perHour * hours);
  }

  const distanceKm = Math.max(params.distanceKm ?? 0, 0);
  const effectiveDistanceKm = params.tripType === "round_trip" ? distanceKm * 2 : distanceKm;
  const extraKm = Math.max(effectiveDistanceKm - grid.includedKm, 0);
  return round2(grid.basePrice + extraKm * grid.perKm);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
