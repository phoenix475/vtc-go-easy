import { createFileRoute } from "@tanstack/react-router";
import { SeoLanding, JsonLd, seoBusinessSchema } from "@/components/seo-landing";

const DEPARTEMENTS = [
  ["75", "Paris"],
  ["92", "Hauts-de-Seine"],
  ["93", "Seine-Saint-Denis"],
  ["94", "Val-de-Marne"],
  ["91", "Essonne"],
  ["78", "Yvelines"],
  ["95", "Val-d'Oise"],
  ["77", "Seine-et-Marne"],
] as const;

export const Route = createFileRoute("/transport-pmr-ile-de-france")({
  head: () => ({
    meta: [
      { title: "Transport PMR Île-de-France — Chauffeur véhicule adapté | Gotaxii" },
      {
        name: "description",
        content:
          "Transport PMR dans toute l'Île-de-France : Paris, Hauts-de-Seine, Seine-Saint-Denis, Val-de-Marne, Essonne, Yvelines, Val-d'Oise, Seine-et-Marne. Véhicule adapté fauteuil roulant, chauffeur formé.",
      },
    ],
  }),
  component: TransportPmrIdf,
});

function TransportPmrIdf() {
  return (
    <>
      <JsonLd
        data={seoBusinessSchema({
          name: "Gotaxii — Transport PMR Île-de-France",
          areaServed: "Île-de-France",
        })}
      />
      <SeoLanding
        eyebrow="Transport PMR Île-de-France"
        title={
          <>
            Le chauffeur PMR qui couvre
            <br />
            <span className="text-brand">toute l'Île-de-France.</span>
          </>
        }
        intro="Gotaxii intervient dans les huit départements d'Île-de-France avec un véhicule adapté fauteuil roulant : rampe d'accès, arrimage et chauffeur formé à l'accompagnement, pour vos trajets du quotidien comme pour vos déplacements longue distance."
        features={[
          "8 départements couverts",
          "Trajets longue distance possibles",
          "Chauffeurs formés PSH",
          "Prix fixe garanti",
        ]}
      >
        <section>
          <h2 className="font-display text-xl font-bold text-ink mb-2">
            Les départements desservis
          </h2>
          <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {DEPARTEMENTS.map(([code, name]) => (
              <li key={code} className="bg-brand-soft/40 rounded-xl px-3 py-3 text-center">
                <div className="font-display font-extrabold text-brand text-lg">{code}</div>
                <div className="text-xs text-ink-soft mt-0.5">{name}</div>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold text-ink mb-2">
            Trajets courts, longs et inter-départementaux
          </h2>
          <p>
            Vous pouvez réserver un trajet à l'intérieur d'un même département (par exemple
            Boulogne-Billancourt → Neuilly-sur-Seine) ou une liaison entre deux départements
            (Versailles → Paris, Melun → Roissy). Le prix est calculé sur la distance réelle du
            trajet et communiqué avant la réservation.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold text-ink mb-2">
            Au-delà de l'Île-de-France
          </h2>
          <p>
            Pour un trajet longue distance vers une autre région, contactez-nous directement au 07
            53 18 56 41 : nous étudions chaque demande de transport adapté fauteuil roulant en
            France.
          </p>
        </section>
      </SeoLanding>
    </>
  );
}
