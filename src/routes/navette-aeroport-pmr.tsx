import { createFileRoute } from "@tanstack/react-router";
import { SeoLanding, JsonLd, seoBusinessSchema } from "@/components/seo-landing";

export const Route = createFileRoute("/navette-aeroport-pmr")({
  head: () => ({
    meta: [
      { title: "Navette aéroport PMR — CDG & Orly | Gotaxii" },
      {
        name: "description",
        content:
          "Navette PMR CDG et navette PMR Orly : transfert aéroport porte-à-porte en véhicule adapté fauteuil roulant, suivi de vol, chauffeur formé à l'accompagnement.",
      },
    ],
  }),
  component: NavetteAeroportPmr,
});

function NavetteAeroportPmr() {
  return (
    <>
      <JsonLd data={seoBusinessSchema({ name: "Gotaxii — Navette aéroport PMR CDG et Orly" })} />
      <SeoLanding
        eyebrow="Navette aéroport PMR"
        title={
          <>
            Navette aéroport PMR
            <br />
            <span className="text-brand">CDG & Orly, porte-à-porte.</span>
          </>
        }
        intro="Un transfert aéroport pensé pour les personnes à mobilité réduite : prise en charge dans le hall ou à votre domicile, rampe d'accès, arrimage fauteuil roulant et suivi de votre numéro de vol pour s'adapter à un retard ou une avance."
        features={[
          "Suivi de vol inclus",
          "Prise en charge dans le hall",
          "Rampe d'accès & arrimage fauteuil",
          "Prix fixe garanti",
        ]}
      >
        <section>
          <h2 className="font-display text-xl font-bold text-ink mb-2">
            Navette PMR Roissy-Charles-de-Gaulle
          </h2>
          <p>
            Pour un départ ou une arrivée à CDG, indiquez votre numéro de vol lors de la réservation
            : notre chauffeur ajuste l'heure de prise en charge en cas de retard et vous retrouve
            directement dans le hall des arrivées avec le véhicule adapté.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold text-ink mb-2">Navette PMR Orly</h2>
          <p>
            Même service pour l'aéroport d'Orly : transfert domicile-aéroport ou aéroport-domicile
            en van équipé d'une rampe d'accès et d'un système d'arrimage pour fauteuil manuel ou
            électrique, avec un chauffeur formé à l'accompagnement porte-à-porte.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold text-ink mb-2">Comment réserver</h2>
          <p>
            Indiquez l'aéroport, le terminal si vous le connaissez, votre numéro de vol et l'heure
            prévue : vous obtenez un prix fixe instantané, sans supplément de dernière minute.
          </p>
        </section>
      </SeoLanding>
    </>
  );
}
