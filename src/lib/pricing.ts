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
    // Tarif au km, quelle que soit la distance : 40€ pile pour 15 km.
    perKm: 40 / 15,
    // Tarif au km quand le départ ou l'arrivée est Orly, Roissy-CDG ou Beauvais
    // (sur tout le trajet, aller-retour compris).
    perKmAirport: 3,
  },
} satisfies Record<VehicleClass, { minimumFare: number; perKm: number; perKmAirport: number }>;

// Zones GPS des aéroports (Orly, Roissy-CDG, Beauvais) : polygones [lat, lng]
// qui couvrent terminaux, gares, dépose-minute et parkings officiels, sans
// déborder sur les villes voisines (Paray-Vieille-Poste, Orly, Roissy-en-France,
// Le Mesnil-Amelot, Mauregard, Tillé…). On se base sur la position plutôt que
// sur le texte : Google place les terminaux dans des communes variées (Terminal
// 2G à Mitry-Mory, Orly 4 à Paray-Vieille-Poste…) et n'importe quel commerce
// peut avoir « aéroport » dans son nom.
type LatLng = { lat: number; lng: number };

const AIRPORT_ZONES: Record<"ORY" | "CDG" | "BVA", [number, number][]> = {
  ORY: [
    [48.737, 2.352],
    [48.737, 2.38],
    [48.722, 2.38],
    [48.722, 2.352],
  ],
  CDG: [
    [49.0185, 2.535],
    [49.0185, 2.56],
    [49.0125, 2.575],
    [49.0125, 2.612],
    [48.998, 2.612],
    [48.998, 2.535],
  ],
  BVA: [
    [49.462, 2.105],
    [49.462, 2.123],
    [49.452, 2.123],
    [49.452, 2.105],
  ],
};

function isInPolygon(point: LatLng, polygon: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [latI, lngI] = polygon[i];
    const [latJ, lngJ] = polygon[j];
    if (
      latI > point.lat !== latJ > point.lat &&
      point.lng < ((lngJ - lngI) * (point.lat - latI)) / (latJ - latI) + lngI
    ) {
      inside = !inside;
    }
  }
  return inside;
}

export function isAirportLocation(point?: LatLng | null): boolean {
  if (!point) return false;
  return Object.values(AIRPORT_ZONES).some((zone) => isInPolygon(point, zone));
}

export function calculatePrice(params: {
  vehicleClass: VehicleClass;
  tripType: TripType;
  distanceKm?: number;
  pickupLocation?: LatLng | null;
  dropoffLocation?: LatLng | null;
}): number {
  const grid = PRICING[params.vehicleClass];

  const distanceKm = Math.max(params.distanceKm ?? 0, 0);
  const effectiveDistanceKm = params.tripType === "round_trip" ? distanceKm * 2 : distanceKm;

  const isAirport =
    isAirportLocation(params.pickupLocation) || isAirportLocation(params.dropoffLocation);
  const distanceCost = effectiveDistanceKm * (isAirport ? grid.perKmAirport : grid.perKm);

  return round2(Math.max(distanceCost, grid.minimumFare));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
