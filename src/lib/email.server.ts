// Helper email côté serveur — appel REST direct à l'API Resend (pas de SDK
// npm), même approche que stripe.server.ts. Import uniquement depuis du code
// serveur (handlers de createServerFn, routes API serveur).
import process from "node:process";

const NOTIFICATION_EMAIL = "biodeur@gmail.com";

function getResendApiKey(): string {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("Configuration manquante: RESEND_API_KEY.");
  return key;
}

function getFromEmail(): string {
  // onboarding@resend.dev fonctionne sans domaine vérifié sur Resend.
  return process.env.RESEND_FROM_EMAIL || "Gotaxii <onboarding@resend.dev>";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendReservationNotificationEmail(reservation: {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  pickup_address: string;
  dropoff_address: string;
  pickup_at: string;
  trip_type: "one_way" | "round_trip";
  passengers: number;
  luggage: number;
  flight_number?: string | null;
  notes?: string | null;
  distance_km?: number | null;
  priceEuros: number;
}): Promise<void> {
  const tripLabel = reservation.trip_type === "round_trip" ? "Aller-retour" : "Aller simple";
  const pickupDate = new Date(reservation.pickup_at).toLocaleString("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const html = `
    <h2>Nouvelle réservation Gotaxii (paiement sur place)</h2>
    <p><b>Référence :</b> ${reservation.id}</p>
    <p><b>Client :</b> ${escapeHtml(reservation.full_name)} — ${escapeHtml(reservation.email)} — ${escapeHtml(reservation.phone)}</p>
    <p><b>Trajet :</b> ${tripLabel}<br/>
    ${escapeHtml(reservation.pickup_address)} → ${escapeHtml(reservation.dropoff_address)}</p>
    <p><b>Prise en charge :</b> ${pickupDate}</p>
    <p><b>Passagers :</b> ${reservation.passengers} · <b>Bagages :</b> ${reservation.luggage}</p>
    ${reservation.distance_km ? `<p><b>Distance :</b> ${reservation.distance_km} km</p>` : ""}
    ${reservation.flight_number ? `<p><b>N° de vol :</b> ${escapeHtml(reservation.flight_number)}</p>` : ""}
    ${reservation.notes ? `<p><b>Notes :</b> ${escapeHtml(reservation.notes)}</p>` : ""}
    <p><b>Prix :</b> ${reservation.priceEuros} € · <b>Paiement :</b> sur place</p>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getResendApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getFromEmail(),
      to: NOTIFICATION_EMAIL,
      subject: `Nouvelle réservation — ${reservation.full_name}`,
      html,
    }),
  });

  if (!response.ok) {
    const json = await response.json().catch(() => null);
    console.error("Resend API error", json);
    throw new Error("Échec de l'envoi de l'email de notification.");
  }
}
