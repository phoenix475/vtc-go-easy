// Grille tarifaire Gotaxii — VTC adapté PMR (personnes à mobilité réduite) en Île-de-France.
// Pour changer les prix : modifie juste les nombres ci-dessous, rien d'autre à toucher.
//
// Positionnement marché (2026) : un trajet PMR privé (hors VSL/taxi conventionné CPAM)
// se facture en moyenne 15-35€ (<10km), 30-60€ (10-30km), 60-120€ (>30km), avec une
// prime par rapport au VTC classique liée au véhicule aménagé (rampe, arrimage fauteuil
// roulant) et à la formation des chauffeurs. Nos tarifs sont calés sur ce marché.

export type VehicleClass = "van";
export type TripType = "one_way" | "round_trip";

export const PRICING = {
  van: {
    // Forfait minimum : prise en charge, installation de la rampe d'accès et
    // arrimage du fauteuil roulant. Aucune course n'est facturée en dessous.
    minimumFare: 25,
    // Tarif dégressif : les 15 premiers km sont facturés 3,20€/km (surcoût
    // véhicule adapté), puis 2,50€/km au-delà.
    perKmUnder15: 3.2,
    perKmAbove15: 2.5,
  },
} satisfies Record<VehicleClass, { minimumFare: number; perKmUnder15: number; perKmAbove15: number }>;

export function calculatePrice(params: {
  vehicleClass: VehicleClass;
  tripType: TripType;
  distanceKm?: number;
}): number {
  const grid = PRICING[params.vehicleClass];

  const distanceKm = Math.max(params.distanceKm ?? 0, 0);
  const effectiveDistanceKm = params.tripType === "round_trip" ? distanceKm * 2 : distanceKm;

  // Barème dégressif par tranche (jamais de palier qui ferait baisser le prix
  // d'une course plus longue que sa voisine plus courte).
  const distanceCost =
    effectiveDistanceKm <= 15
      ? effectiveDistanceKm * grid.perKmUnder15
      : 15 * grid.perKmUnder15 + (effectiveDistanceKm - 15) * grid.perKmAbove15;

  return round2(Math.max(distanceCost, grid.minimumFare));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
