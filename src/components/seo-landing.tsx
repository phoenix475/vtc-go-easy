// Gabarit commun aux pages SEO dédiées (transport-pmr-paris, navette-aeroport-pmr,
// etc.) : même charte que la page d'accueil, contenu spécifique passé en props/children.
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Check, ArrowRight, Accessibility } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

export function seoBusinessSchema(overrides: Record<string, unknown> = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "TaxiService",
    name: "Gotaxii",
    description:
      "VTC adapté aux personnes à mobilité réduite (PMR) : véhicule avec rampe d'accès et arrimage fauteuil roulant, chauffeurs formés à l'accompagnement.",
    telephone: "+33753185641",
    areaServed: "Île-de-France",
    ...overrides,
  };
}

export function SeoLanding({
  eyebrow,
  title,
  intro,
  features,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro: string;
  features: string[];
  children?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white font-sans text-ink antialiased">
      <SiteHeader />
      <section className="py-16 lg:py-24 bg-brand-soft/30">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white text-brand text-xs font-semibold px-3 py-1.5 rounded-full ring-1 ring-brand/10">
            <Accessibility className="w-3.5 h-3.5" /> {eyebrow}
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight mt-5 leading-[1.1] text-ink">
            {title}
          </h1>
          <p className="text-lg text-ink-soft mt-5 leading-relaxed max-w-2xl mx-auto">{intro}</p>
          <ul className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-ink">
            {features.map((f) => (
              <li
                key={f}
                className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full ring-1 ring-black/5"
              >
                <Check className="w-4 h-4 text-brand" /> {f}
              </li>
            ))}
          </ul>
          <Link
            to="/"
            hash="reserver"
            className="inline-flex items-center gap-2 bg-brand text-white font-semibold mt-8 px-6 py-3 rounded-full hover:bg-brand-dark transition-colors"
          >
            Réserver ce trajet <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <main className="max-w-3xl mx-auto px-5 lg:px-8 py-16 lg:py-20 space-y-10 text-ink-soft leading-relaxed">
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}
