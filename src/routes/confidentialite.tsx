import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({
    meta: [
      { title: "Politique de confidentialité & cookies — Gotaxii" },
      {
        name: "description",
        content:
          "Comment Gotaxii traite vos données personnelles et utilise les cookies (mesure d'audience, Google Ads) sur ce site.",
      },
    ],
  }),
  component: Confidentialite,
});

function Confidentialite() {
  return (
    <div className="min-h-screen bg-white font-sans text-ink antialiased">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-5 lg:px-8 py-16 lg:py-24">
        <h1 className="font-display text-3xl md:text-4xl font-extrabold">
          Politique de confidentialité & cookies
        </h1>
        <p className="text-ink-soft mt-3 text-sm">Dernière mise à jour : septembre 2026.</p>

        <div className="mt-10 space-y-10 text-ink-soft leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-bold text-ink mb-2">
              Qui traite vos données ?
            </h2>
            <p>
              Gotaxii, service de VTC adapté aux personnes à mobilité réduite, est responsable du
              traitement des données collectées sur ce site. Pour toute question relative à vos
              données, contactez-nous à{" "}
              <a href="mailto:contact@gotaxii.com" className="text-brand hover:underline">
                contact@gotaxii.com
              </a>{" "}
              ou au 07 53 18 56 41.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-ink mb-2">
              Quelles données sont collectées ?
            </h2>
            <p>
              Lorsque vous effectuez une réservation, nous collectons : votre nom, votre email,
              votre téléphone, les adresses de départ et d'arrivée, la date et l'heure du trajet, et
              les informations que vous nous donnez volontairement (besoin d'assistance, type de
              fauteuil, numéro de vol). Ces données sont nécessaires à l'exécution de votre course
              et sont stockées de façon sécurisée (hébergement Supabase).
            </p>
            <p className="mt-2">
              Si vous payez en ligne, le paiement est traité directement par notre prestataire
              Stripe ; nous ne stockons jamais vos coordonnées bancaires.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-ink mb-2">Vos droits</h2>
            <p>
              Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement
              et de portabilité de vos données, ainsi que d'un droit d'opposition. Vous pouvez
              exercer ces droits à tout moment en nous écrivant à{" "}
              <a href="mailto:contact@gotaxii.com" className="text-brand hover:underline">
                contact@gotaxii.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-ink mb-2">
              Cookies et mesure d'audience
            </h2>
            <p>Ce site utilise :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5">
              <li>
                <b>Un cookie technique de consentement</b> (stocké dans votre navigateur) pour
                mémoriser votre choix concernant les cookies.
              </li>
              <li>
                <b>La balise Google Ads (gtag.js)</b>, qui nous permet de mesurer l'efficacité de
                nos campagnes publicitaires (par exemple : combien de réservations proviennent d'une
                annonce Google). Cette balise ne dépose des cookies publicitaires que si vous donnez
                votre consentement via la bannière affichée en bas de page.
              </li>
            </ul>
            <p className="mt-2">
              Tant que vous n'avez pas donné votre consentement, aucun cookie de mesure publicitaire
              n'est déposé (Google Consent Mode). Vous pouvez modifier votre choix à tout moment en
              effaçant les cookies de ce site dans votre navigateur.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-ink mb-2">Sécurité</h2>
            <p>
              Vos données sont hébergées chez des prestataires qui appliquent des mesures de
              sécurité techniques et organisationnelles (chiffrement des échanges, accès restreint).
              Les paiements en ligne sont exclusivement traités par Stripe, certifié PCI-DSS.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
