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
  return_at?: string | null;
  trip_type: string;
  passengers: number;
  luggage: number;
  flight_number?: string | null;
  notes?: string | null;
  distance_km?: number | null;
  priceEuros: number;
  // cash : paiement sur place. online_pending : le client vient d'être envoyé
  // sur Stripe (pas encore payé). online_paid : Stripe a confirmé le paiement.
  payment: "cash" | "online_pending" | "online_paid";
}): Promise<void> {
  const tripLabel = reservation.trip_type === "round_trip" ? "Aller-retour" : "Aller simple";
  const formatDate = (value: string) =>
    new Date(value).toLocaleString("fr-FR", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "Europe/Paris",
    });
  const pickupDate = formatDate(reservation.pickup_at);
  const distanceLabel =
    reservation.distance_km == null
      ? "non calculée"
      : reservation.trip_type === "round_trip"
        ? `${reservation.distance_km} km par trajet (${Math.round(reservation.distance_km * 200) / 100} km facturés)`
        : `${reservation.distance_km} km`;

  const { title, paymentLabel, subjectPrefix } = {
    cash: {
      title: "Nouvelle réservation Gotaxii (paiement sur place)",
      paymentLabel: "sur place",
      subjectPrefix: "Nouvelle réservation",
    },
    online_pending: {
      title: "Nouvelle réservation Gotaxii (paiement en ligne en attente)",
      paymentLabel: "en ligne — PAS ENCORE PAYÉ, le client est sur la page Stripe",
      subjectPrefix: "Nouvelle réservation (paiement en attente)",
    },
    online_paid: {
      title: "Paiement en ligne confirmé ✅",
      paymentLabel: "en ligne — PAYÉ via Stripe",
      subjectPrefix: "Paiement confirmé",
    },
  }[reservation.payment];

  const html = `
    <h2>${title}</h2>
    <p><b>Référence :</b> ${reservation.id}</p>
    <p><b>Client :</b> ${escapeHtml(reservation.full_name)} — ${escapeHtml(reservation.email)} — ${escapeHtml(reservation.phone)}</p>
    <p><b>Trajet :</b> ${tripLabel}<br/>
    ${escapeHtml(reservation.pickup_address)} → ${escapeHtml(reservation.dropoff_address)}</p>
    <p><b>Prise en charge :</b> ${pickupDate}</p>
    ${reservation.return_at ? `<p><b>Retour :</b> ${formatDate(reservation.return_at)}</p>` : ""}
    <p><b>Passagers :</b> ${reservation.passengers} · <b>Bagages :</b> ${reservation.luggage}</p>
    ${reservation.flight_number ? `<p><b>N° de vol :</b> ${escapeHtml(reservation.flight_number)}</p>` : ""}
    ${reservation.notes ? `<p><b>Notes :</b> ${escapeHtml(reservation.notes)}</p>` : ""}
    <p><b>Prix :</b> ${reservation.priceEuros} € · <b>Distance :</b> ${distanceLabel} · <b>Paiement :</b> ${paymentLabel}</p>
  `;

  await sendEmail({
    to: NOTIFICATION_EMAIL,
    subject: `${subjectPrefix} — ${reservation.full_name}`,
    html,
  });
}

// Accusé de réception envoyé au client : la réservation reste provisoire tant
// que le chauffeur n'a pas vérifié son agenda et rappelé le client.
export async function sendCustomerConfirmationEmail(reservation: {
  id: string;
  full_name: string;
  email: string;
  pickup_address: string;
  dropoff_address: string;
  pickup_at: string;
  passengers: number;
  luggage: number;
  flight_number?: string | null;
  priceEuros: number;
  payment: "cash" | "online_paid";
}): Promise<void> {
  const pickupDate = new Date(reservation.pickup_at).toLocaleString("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  });
  const paymentLabel = reservation.payment === "cash" ? "à régler sur place" : "payé en ligne";

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;max-width:560px">
      <h2>Merci pour votre réservation, ${escapeHtml(reservation.full_name)} !</h2>
      <p>Nous avons bien reçu votre demande de course. Elle est <b>confirmée à titre provisoire</b>,
      sous réserve de vérification de la disponibilité de notre agenda.</p>
      <p><b>La confirmation définitive vous sera donnée par appel téléphonique</b> dans les plus brefs délais.</p>
      <h3>Récapitulatif</h3>
      <p><b>Référence :</b> ${reservation.id}<br/>
      <b>Départ :</b> ${escapeHtml(reservation.pickup_address)}<br/>
      <b>Arrivée :</b> ${escapeHtml(reservation.dropoff_address)}<br/>
      <b>Prise en charge :</b> ${pickupDate}<br/>
      <b>Passagers :</b> ${reservation.passengers} · <b>Bagages :</b> ${reservation.luggage}<br/>
      ${reservation.flight_number ? `<b>N° de vol :</b> ${escapeHtml(reservation.flight_number)}<br/>` : ""}
      <b>Prix :</b> ${reservation.priceEuros} € (${paymentLabel})</p>
      <p>Pour toute question, appelez-nous au <a href="tel:+33753185641">07 53 18 56 41</a>
      ou répondez simplement à cet email.</p>
      <p>À bientôt,<br/>L'équipe Gotaxii</p>
    </div>
  `;

  await sendEmail({
    to: reservation.email,
    subject: "Votre réservation Gotaxii — confirmation provisoire",
    html,
    replyTo: "contact@gotaxii.com",
  });
}

async function sendEmail(message: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getResendApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getFromEmail(),
      to: message.to,
      subject: message.subject,
      html: message.html,
      ...(message.replyTo ? { reply_to: message.replyTo } : {}),
    }),
  });

  if (!response.ok) {
    const json = await response.json().catch(() => null);
    console.error("Resend API error", json);
    throw new Error("Échec de l'envoi de l'email.");
  }
}
