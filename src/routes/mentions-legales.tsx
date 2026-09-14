import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const Route = createFileRoute("/mentions-legales")({
  head: () => ({
    meta: [
      { title: "Mentions légales — Gotaxii" },
      {
        name: "description",
        content: "Mentions légales du site Gotaxii : éditeur, hébergeur, propriété intellectuelle.",
      },
    ],
  }),
  component: MentionsLegales,
});

function MentionsLegales() {
  return (
    <div className="min-h-screen bg-white font-sans text-ink antialiased">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-5 lg:px-8 py-16 lg:py-24">
        <h1 className="font-display text-3xl md:text-4xl font-extrabold">Mentions légales</h1>

        <div className="mt-10 space-y-10 text-ink-soft leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-bold text-ink mb-2">Éditeur du site</h2>
            <p>
              Le site Gotaxii (nom commercial) est édité par Mafaly Diop, entrepreneur individuel.
              <br />
              SIRET : 989 211 214 00014
              <br />
              Adresse : 55 rue Michelet, 94700 Maisons-Alfort, France
              <br />
              Téléphone : 07 53 18 56 41
              <br />
              Email :{" "}
              <a href="mailto:contact@gotaxii.com" className="text-brand hover:underline">
                contact@gotaxii.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-ink mb-2">
              Directeur de la publication
            </h2>
            <p>Mafaly Diop.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-ink mb-2">Hébergeur</h2>
            <p>
              Render Services, Inc.
              <br />
              525 Brannan Street, Suite 300, San Francisco, CA 94107, États-Unis
              <br />
              <a
                href="https://render.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand hover:underline"
              >
                render.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-ink mb-2">Activité</h2>
            <p>
              Gotaxii est un service de VTC (transport privé de personnes) équipé pour l'accueil des
              personnes à mobilité réduite, et non un transport sanitaire (VSL/ambulance)
              conventionné par l'Assurance Maladie. Nos courses ne sont pas prises en charge par la
              CPAM et ne nécessitent pas de prescription médicale.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-ink mb-2">
              Propriété intellectuelle
            </h2>
            <p>
              L'ensemble des contenus présents sur ce site (textes, logo, mise en page) est la
              propriété de Gotaxii, sauf mention contraire. Toute reproduction sans autorisation
              préalable est interdite.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-ink mb-2">Données personnelles</h2>
            <p>
              Le traitement de vos données personnelles et l'utilisation des cookies sont détaillés
              sur notre page{" "}
              <a href="/confidentialite" className="text-brand hover:underline">
                Politique de confidentialité & cookies
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
