import { createFileRoute } from "@tanstack/react-router";
import { SeoLanding, JsonLd, seoBusinessSchema } from "@/components/seo-landing";

const GARES = [
  "Gare du Nord",
  "Gare de Lyon",
  "Gare Montparnasse",
  "Gare Saint-Lazare",
  "Gare de l'Est",
  "Gare d'Austerlitz",
];

export const Route = createFileRoute("/transport-pmr-gares")({
  head: () => ({
    meta: [
      { title: "Transport PMR gares parisiennes | Gotaxii" },
      {
        name: "description",
        content:
          "Transport PMR vers les gares parisiennes (Gare du Nord, Gare de Lyon, Montparnasse, Saint-Lazare…) : véhicule adapté fauteuil roulant, chauffeur formé, porte-à-porte.",
      },
    ],
  }),
  component: TransportPmrGares,
});

function TransportPmrGares() {
  return (
    <>
      <JsonLd data={seoBusinessSchema({ name: "Gotaxii — Transport PMR gares parisiennes" })} />
      <SeoLanding
        eyebrow="Transport PMR gares"
        title={
          <>
            Transport PMR vers
            <br />
            <span className="text-brand">les gares parisiennes.</span>
          </>
        }
        intro="Pour ne pas manquer votre train, Gotaxii vous accompagne jusqu'au quai ou au point de rendez-vous PMR de la gare, en véhicule adapté fauteuil roulant, avec un chauffeur formé à l'accompagnement."
        features={[
          "Prise en charge à l'heure",
          "Rampe d'accès & arrimage fauteuil",
          "Chauffeurs formés PSH",
          "Prix fixe garanti",
        ]}
      >
        <section>
          <h2 className="font-display text-xl font-bold text-ink mb-2">Gares desservies</h2>
          <ul className="grid grid-cols-2 gap-3 mt-4">
            {GARES.map((g) => (
              <li
                key={g}
                className="bg-brand-soft/40 rounded-xl px-4 py-3 text-sm font-semibold text-ink"
              >
                {g}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold text-ink mb-2">Un trajet sans imprévu</h2>
          <p>
            Indiquez l'heure de votre train lors de la réservation : nous calculons l'heure de prise
            en charge en tenant compte du temps nécessaire à l'installation et à l'arrimage du
            fauteuil roulant, pour arriver sereinement sur le quai.
          </p>
        </section>
      </SeoLanding>
    </>
  );
}
