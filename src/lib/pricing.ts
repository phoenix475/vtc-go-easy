// Grille tarifaire Gotaxii — tarifs VTC classiques en Île-de-France.
// Pour changer les prix : modifie juste les nombres ci-dessous, rien d'autre à toucher.

export type VehicleClass = "van";
export type TripType = "one_way" | "round_trip";

export const PRICING = {
  van: {
    // Aucun forfait minimum : le prix est purement au kilomètre.
    basePrice: 0,
    includedKm: 0,
    // En dessous de 15km, tarif majoré à 3€/km. À partir de 15km, 2,50€/km.
    perKmUnder15: 3,
    perKm: 2.5,
  },
} satisfies Record<VehicleClass, { basePrice: number; includedKm: number; perKmUnder15: number; perKm: number }>;

export function calculatePrice(params: {
  vehicleClass: VehicleClass;
  tripType: TripType;
  distanceKm?: number;
}): number {
  const grid = PRICING[params.vehicleClass];

  const distanceKm = Math.max(params.distanceKm ?? 0, 0);
  const effectiveDistanceKm = params.tripType === "round_trip" ? distanceKm * 2 : distanceKm;
  const rate = effectiveDistanceKm < 15 ? grid.perKmUnder15 : grid.perKm;
  return round2(effectiveDistanceKm * rate);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
