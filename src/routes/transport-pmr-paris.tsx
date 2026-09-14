import { createFileRoute } from "@tanstack/react-router";
import { SeoLanding, JsonLd, seoBusinessSchema } from "@/components/seo-landing";

export const Route = createFileRoute("/transport-pmr-paris")({
  head: () => ({
    meta: [
      { title: "Transport PMR Paris — Taxi fauteuil roulant | Gotaxii" },
      {
        name: "description",
        content:
          "Transport PMR à Paris : chauffeur privé, véhicule adapté avec rampe d'accès et arrimage fauteuil roulant. Réservation en ligne, prix fixe, porte-à-porte.",
      },
    ],
  }),
  component: TransportPmrParis,
});

function TransportPmrParis() {
  return (
    <>
      <JsonLd
        data={seoBusinessSchema({
          name: "Gotaxii — Transport PMR Paris",
          areaServed: "Paris (75)",
        })}
      />
      <SeoLanding
        eyebrow="Transport PMR Paris"
        title={
          <>
            Transport PMR à Paris,
            <br />
            <span className="text-brand">chauffeur privé et véhicule adapté.</span>
          </>
        }
        intro="Gotaxii propose un service de taxi fauteuil roulant à Paris : un chauffeur privé, un van équipé d'une rampe d'accès et d'un système d'arrimage pour fauteuil roulant, et un accompagnement porte-à-porte pour tous vos déplacements dans la capitale."
        features={[
          "Rampe d'accès intégrée",
          "Arrimage fauteuil roulant",
          "Chauffeurs formés PSH",
          "Prix fixe garanti",
        ]}
      >
        <section>
          <h2 className="font-display text-xl font-bold text-ink mb-2">
            Un chauffeur PMR à Paris, disponible sur réservation
          </h2>
          <p>
            Que vous vous déplaciez en fauteuil manuel ou électrique, notre chauffeur PMR vous prend
            en charge à l'adresse de votre choix à Paris (domicile, hôtel, cabinet médical) et vous
            accompagne jusqu'à destination. Le véhicule adapté fauteuil roulant dispose d'une rampe
            latérale et d'un espace dédié avec arrimage, pour un transfert en toute sécurité.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold text-ink mb-2">Pour quels trajets ?</h2>
          <p>
            Rendez-vous médicaux, sorties, trajets vers une gare parisienne ou un aéroport,
            déplacements réguliers : notre transport handicapé Paris s'adapte à votre emploi du
            temps. Le tarif est communiqué avant la réservation, sans supplément surprise.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold text-ink mb-2">Important à savoir</h2>
          <p>
            Gotaxii est un service de VTC (transport privé) équipé, et non un transport sanitaire
            (VSL/ambulance) conventionné par l'Assurance Maladie : nos courses ne sont pas prises en
            charge par la CPAM et ne nécessitent pas de prescription médicale.
          </p>
        </section>
      </SeoLanding>
    </>
  );
}
