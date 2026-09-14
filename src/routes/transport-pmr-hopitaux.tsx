import { createFileRoute } from "@tanstack/react-router";
import { SeoLanding, JsonLd, seoBusinessSchema } from "@/components/seo-landing";

export const Route = createFileRoute("/transport-pmr-hopitaux")({
  head: () => ({
    meta: [
      { title: "Transport PMR hôpitaux & établissements de santé | Gotaxii" },
      {
        name: "description",
        content:
          "Transport adapté fauteuil roulant vers hôpitaux, cliniques, centres médicaux et EHPAD en Île-de-France. Chauffeur formé, accompagnement porte-à-porte, prix fixe.",
      },
    ],
  }),
  component: TransportPmrHopitaux,
});

function TransportPmrHopitaux() {
  return (
    <>
      <JsonLd
        data={seoBusinessSchema({
          name: "Gotaxii — Transport PMR hôpitaux et établissements de santé",
        })}
      />
      <SeoLanding
        eyebrow="Hôpitaux & établissements de santé"
        title={
          <>
            Votre rendez-vous médical,
            <br />
            <span className="text-brand">sans stress logistique.</span>
          </>
        }
        intro="Consultation, dialyse, kinésithérapie, radiothérapie, sortie d'hospitalisation : Gotaxii vous accompagne jusqu'à la porte du service, avec un véhicule adapté fauteuil roulant et un chauffeur formé à l'accompagnement des personnes à mobilité réduite."
        features={[
          "Accompagnement porte-à-porte",
          "Rampe d'accès & arrimage fauteuil",
          "Chauffeurs formés PSH",
          "Trajets réguliers possibles",
        ]}
      >
        <section>
          <h2 className="font-display text-xl font-bold text-ink mb-2">
            Pour quels établissements ?
          </h2>
          <p>
            Hôpitaux publics et cliniques privées, centres médicaux, cabinets de kinésithérapie,
            centres de dialyse ou de radiothérapie, EHPAD, ESAT et centres médico-sociaux : notre
            service de transport PMR s'adapte à votre parcours de soin, à Paris et dans toute
            l'Île-de-France.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold text-ink mb-2">Trajets récurrents</h2>
          <p>
            Pour un traitement nécessitant plusieurs séances par semaine (dialyse, radiothérapie),
            vous pouvez planifier vos trajets à l'avance avec le même niveau d'accompagnement à
            chaque fois. Les établissements (EHPAD, ESAT, structures médico-sociales) peuvent
            également centraliser les trajets de leurs résidents ou usagers — voir la page{" "}
            <a href="/#entreprises" className="text-brand hover:underline">
              Gotaxii pour les établissements
            </a>
            .
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold text-ink mb-2">Important à savoir</h2>
          <p>
            Gotaxii est un service de VTC (transport privé) équipé, et non un transport sanitaire
            (VSL/ambulance) conventionné par l'Assurance Maladie : nos courses ne sont pas prises en
            charge par la CPAM et ne nécessitent pas de prescription médicale. Pour un transport
            médicalisé ou pris en charge par la Sécurité sociale, rapprochez-vous d'une entreprise
            de transport sanitaire agréée.
          </p>
        </section>
      </SeoLanding>
    </>
  );
}
