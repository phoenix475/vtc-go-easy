// Grille tarifaire Gotaxii — tarifs VTC classiques en Île-de-France.
// Pour changer les prix : modifie juste les nombres ci-dessous, rien d'autre à toucher.

export type VehicleClass = "van";
export type TripType = "one_way" | "round_trip";

export const PRICING = {
  van: {
    // Aucun forfait minimum : le prix est purement au kilomètre (2,20€/km).
    basePrice: 0,
    includedKm: 0,
    perKm: 2.2,
  },
} satisfies Record<VehicleClass, { basePrice: number; includedKm: number; perKm: number }>;

export function calculatePrice(params: {
  vehicleClass: VehicleClass;
  tripType: TripType;
  distanceKm?: number;
}): number {
  const grid = PRICING[params.vehicleClass];

  const distanceKm = Math.max(params.distanceKm ?? 0, 0);
  const effectiveDistanceKm = params.tripType === "round_trip" ? distanceKm * 2 : distanceKm;
  return round2(effectiveDistanceKm * grid.perKm);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
