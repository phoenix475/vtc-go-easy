// Balise Google Ads (gtag.js) + Consent Mode — voir src/routes/__root.tsx pour
// le chargement du script et src/components/ConsentBanner.tsx pour la bannière RGPD.
export const GOOGLE_ADS_ID = "AW-18443711118";

// Libellés des actions de conversion Google Ads (format "AW-18443711118/xxxxxxxxxx"),
// à créer dans Google Ads > Outils > Conversions > Nouvelle action > Site web,
// puis à coller ici. Tant qu'un libellé est vide, l'événement est seulement
// poussé dans le dataLayer (exploitable par Analytics/GTM) sans déclencher de
// conversion Ads — aucun risque à déployer avant d'avoir les libellés.
const CONVERSION_LABELS: Record<ConversionEvent, string> = {
  booking_completed: "",
  phone_click: "",
  whatsapp_click: "",
};

export type ConversionEvent = "booking_completed" | "phone_click" | "whatsapp_click";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function gtag(...args: unknown[]) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

export function updateConsent(granted: boolean) {
  const state = granted ? "granted" : "denied";
  gtag("consent", "update", {
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
    analytics_storage: state,
  });
}

export function trackConversion(
  event: ConversionEvent,
  params: { value?: number; transactionId?: string } = {},
) {
  gtag("event", event, {
    value: params.value,
    currency: "EUR",
    transaction_id: params.transactionId,
  });

  const label = CONVERSION_LABELS[event];
  if (!label) return;
  gtag("event", "conversion", {
    send_to: `${GOOGLE_ADS_ID}/${label}`,
    value: params.value,
    currency: "EUR",
    transaction_id: params.transactionId,
  });
}
