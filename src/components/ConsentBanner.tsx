import { useEffect, useState } from "react";
import { updateConsent } from "@/lib/analytics";

const STORAGE_KEY = "gotaxii_consent";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      // Stockage indisponible (navigation privée, etc.) — on affiche la bannière.
    }
    if (saved === "granted") updateConsent(true);
    else if (saved !== "denied") setVisible(true);
  }, []);

  const choose = (granted: boolean) => {
    updateConsent(granted);
    try {
      localStorage.setItem(STORAGE_KEY, granted ? "granted" : "denied");
    } catch {
      // Le choix ne sera pas mémorisé, tant pis — le consentement est appliqué pour la session.
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-5">
      <div className="max-w-3xl mx-auto bg-ink text-white rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="text-sm text-white/80 leading-relaxed flex-1">
          Nous utilisons des cookies pour mesurer l'audience du site et l'efficacité de nos
          campagnes publicitaires. Vous pouvez accepter ou refuser leur dépôt à tout moment.{" "}
          <a href="/confidentialite" className="underline hover:text-white">
            En savoir plus
          </a>
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => choose(false)}
            className="px-4 py-2 rounded-full text-sm font-semibold border border-white/30 hover:bg-white/10 transition-colors"
          >
            Refuser
          </button>
          <button
            type="button"
            onClick={() => choose(true)}
            className="px-4 py-2 rounded-full text-sm font-semibold bg-brand hover:bg-brand-dark transition-colors"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
