import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Check, MapPin, ArrowRight } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { getReservationSummary } from "@/lib/reservations.functions";
import { trackConversion } from "@/lib/analytics";

const searchSchema = z.object({
  ref: z.string().uuid().optional(),
  payment: z.enum(["success", "cancelled"]).optional(),
});

export const Route = createFileRoute("/reservation-confirmee")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Réservation confirmée — Gotaxii" },
      {
        name: "description",
        content:
          "Votre réservation de VTC adapté PMR Gotaxii est confirmée. Un chauffeur formé à l'accompagnement PSH vous contactera avant la prise en charge.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReservationConfirmee,
});

type Summary = Awaited<ReturnType<typeof getReservationSummary>>;

function ReservationConfirmee() {
  const { ref, payment } = Route.useSearch();
  const getSummary = useServerFn(getReservationSummary);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [notFound, setNotFound] = useState(false);
  const tracked = useRef(false);

  useEffect(() => {
    if (!ref) {
      setNotFound(true);
      return;
    }
    getSummary({ data: { id: ref } })
      .then((row) => setSummary(row))
      .catch(() => setNotFound(true));
  }, [ref]);

  // Conversion Google Ads "réservation terminée" — déclenchée une seule fois,
  // dès que le résumé (et donc le montant réel facturé) est disponible.
  useEffect(() => {
    if (!summary || tracked.current) return;
    if (payment === "cancelled") return;
    tracked.current = true;
    trackConversion("booking_completed", {
      value: summary.estimated_price_cents ? summary.estimated_price_cents / 100 : undefined,
      transactionId: summary.id,
    });
  }, [summary, payment]);

  return (
    <div className="min-h-screen bg-white font-sans text-ink antialiased flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-5 py-16 lg:py-24 bg-brand-soft/30">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 p-8 text-center">
          {notFound ? (
            <>
              <h1 className="font-display text-2xl font-extrabold">Réservation introuvable</h1>
              <p className="text-ink-soft mt-2 text-sm">
                Le lien utilisé n'est plus valide. Si vous venez de réserver, vérifiez l'email de
                confirmation reçu.
              </p>
            </>
          ) : !summary ? (
            <p className="text-ink-soft text-sm">Chargement de votre réservation…</p>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-brand-soft text-brand grid place-items-center mx-auto">
                <Check className="w-7 h-7" strokeWidth={3} />
              </div>
              <h1 className="font-display text-2xl font-extrabold mt-4">
                {payment === "cancelled" ? "Paiement annulé" : "Réservation confirmée"}
              </h1>
              <p className="text-ink-soft mt-2 text-sm">
                {payment === "cancelled"
                  ? "Votre réservation reste enregistrée en attente de paiement."
                  : "Un chauffeur formé à l'accompagnement PSH sera assigné à votre trajet. Un récapitulatif vous a été envoyé par email."}
                <br />
                Référence :{" "}
                <code className="bg-brand-soft text-brand px-2 py-0.5 rounded text-xs">
                  {summary.id.slice(0, 8).toUpperCase()}
                </code>
              </p>
              <div className="bg-brand-soft/60 rounded-xl p-4 mt-6 text-left text-sm space-y-1.5">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <span className="font-semibold">
                    {summary.pickup_address} → {summary.dropoff_address}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-soft">Prise en charge</span>
                  <span className="font-semibold">
                    {format(new Date(summary.pickup_at), "d MMMM yyyy à HH'h'mm", { locale: fr })}
                  </span>
                </div>
                {summary.estimated_price_cents != null && (
                  <div className="flex justify-between">
                    <span className="text-ink-soft">Prix estimé</span>
                    <span className="font-semibold text-brand">
                      {(summary.estimated_price_cents / 100).toFixed(2)} €
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
          <Link
            to="/"
            hash="reserver"
            className="inline-flex items-center gap-2 mt-8 text-sm font-semibold text-brand hover:underline"
          >
            {notFound ? "Retour à l'accueil" : "Faire une nouvelle réservation"}{" "}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
