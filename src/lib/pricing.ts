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

// Détection d'un aéroport à partir du texte de l'adresse (Google Places). Sont
// reconnus :
//  - un terme « aéroport » + Orly / Roissy / Charles de Gaulle / Beauvais / Tillé
//    (ex. « Aéroport de Paris-Orly, 94390 Orly » — l'auto-complétion préfixe
//    l'adresse par le nom du lieu) ;
//  - les terminaux d'Orly, que Google nomme « Orly 1 » à « Orly 4 » (souvent
//    situés à Paray-Vieille-Poste) ;
//  - les terminaux de CDG (« Terminal 2E »…), situés selon Google à Roissy,
//    Mauregard, Le Mesnil-Amelot ou Tremblay-en-France.
// La ville d'Orly seule (« Orly, France ») ne compte pas.
const AIRPORT_WORD = /\b(a[ée]roport|airport|a[ée]rogare|terminal|cdg|ory|bva)\b/;
const AIRPORT_PLACE = /\b(orly|roissy|charles[\s-]+de[\s-]+gaulle|beauvais|till[ée])(?![a-z])/;
const ORLY_TERMINAL = /\borly\s*[1-4]\b/;
const CDG_TERMINAL = /\bterminal\s*[1-3]/;
const CDG_TOWNS = /\b(roissy|mauregard|mesnil[\s-]+amelot|tremblay)\b/;

export function isAirportAddress(address?: string | null): boolean {
  if (!address) return false;
  const text = address.toLowerCase();
  return (
    (AIRPORT_WORD.test(text) && AIRPORT_PLACE.test(text)) ||
    ORLY_TERMINAL.test(text) ||
    (CDG_TERMINAL.test(text) && CDG_TOWNS.test(text))
  );
}

export function calculatePrice(params: {
  vehicleClass: VehicleClass;
  tripType: TripType;
  distanceKm?: number;
  pickupAddress?: string | null;
  dropoffAddress?: string | null;
}): number {
  const grid = PRICING[params.vehicleClass];

  const distanceKm = Math.max(params.distanceKm ?? 0, 0);
  const effectiveDistanceKm = params.tripType === "round_trip" ? distanceKm * 2 : distanceKm;

  const isAirport = isAirportAddress(params.pickupAddress) || isAirportAddress(params.dropoffAddress);
  const distanceCost = effectiveDistanceKm * (isAirport ? grid.perKmAirport : grid.perKm);

  return round2(Math.max(distanceCost, grid.minimumFare));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
