// Header, footer et logo partagés entre la page d'accueil et les pages SEO dédiées
// (transport-pmr-paris, navette-aeroport-pmr, etc.) pour garder une identité et une
// navigation cohérentes sur tout le site.
import { Link } from "@tanstack/react-router";
import { PhoneCall, ArrowRight } from "lucide-react";
import { trackConversion } from "@/lib/analytics";

const PHONE_DISPLAY = "07 53 18 56 41";
const PHONE_HREF = "tel:+33753185641";

export function Logo({ className = "", dark = false }: { className?: string; dark?: boolean }) {
  return (
    <span className={`inline-flex flex-col leading-none select-none ${className}`}>
      <span
        className={`font-display font-extrabold tracking-tight ${dark ? "text-white" : "text-ink"}`}
      >
        Gotax<span className="text-brand">ii</span>
        <span className="text-sun">.</span>
      </span>
      <svg
        viewBox="0 0 100 6"
        preserveAspectRatio="none"
        className="w-full h-[5px] mt-0.5"
        aria-hidden="true"
      >
        <path
          d="M2 4 C 20 1, 40 5, 60 2 S 90 1, 98 3"
          fill="none"
          stroke={dark ? "#5b8def" : "#0b3fb5"}
          strokeOpacity="0.55"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-black/5">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/">
          <Logo className="text-xl" />
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink-soft">
          <Link to="/" hash="services" className="hover:text-brand transition-colors">
            Services
          </Link>
          <Link to="/" hash="flotte" className="hover:text-brand transition-colors">
            Véhicule adapté
          </Link>
          <Link to="/" hash="entreprises" className="hover:text-brand transition-colors">
            Établissements
          </Link>
          <Link to="/" hash="avis" className="hover:text-brand transition-colors">
            Avis
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <a
            href={PHONE_HREF}
            onClick={() => trackConversion("phone_click")}
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-ink-soft hover:text-brand"
          >
            <PhoneCall className="w-4 h-4" /> {PHONE_DISPLAY}
          </a>
          <a
            href={PHONE_HREF}
            onClick={() => trackConversion("phone_click")}
            aria-label={`Appeler le ${PHONE_DISPLAY}`}
            className="sm:hidden inline-flex items-center justify-center w-9 h-9 rounded-full border border-brand/30 text-brand"
          >
            <PhoneCall className="w-4 h-4" />
          </a>
          <Link
            to="/"
            hash="reserver"
            className="inline-flex items-center gap-1 bg-brand text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-brand-dark transition-colors"
          >
            Réserver <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

const FOOTER_PAGES = [
  { to: "/transport-pmr-paris" as const, label: "Transport PMR Paris" },
  { to: "/transport-pmr-ile-de-france" as const, label: "Transport PMR Île-de-France" },
  { to: "/transport-pmr-hopitaux" as const, label: "Transport PMR hôpitaux & santé" },
  { to: "/navette-aeroport-pmr" as const, label: "Navette aéroport PMR" },
  { to: "/transport-pmr-gares" as const, label: "Transport PMR gares" },
];

// Barre fixe en bas d'écran sur mobile : le client choisit directement entre appeler
// le chauffeur ou réserver en ligne, sans avoir à chercher le numéro.
function MobileActionBar() {
  return (
    <div className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur border-t border-black/10 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] grid grid-cols-2 gap-3">
      <a
        href={PHONE_HREF}
        onClick={() => trackConversion("phone_click")}
        className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-brand text-brand font-semibold py-3"
      >
        <PhoneCall className="w-5 h-5" /> Appeler
      </a>
      <Link
        to="/"
        hash="reserver"
        className="inline-flex items-center justify-center gap-2 rounded-full bg-brand text-white font-semibold py-3"
      >
        Réserver <ArrowRight className="w-5 h-5" />
      </Link>
    </div>
  );
}

export function SiteFooter() {
  return (
    <>
      <MobileActionBar />
      <footer className="bg-ink text-white/70 pt-14 pb-32 md:pb-14">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 text-sm">
          <div>
            <Logo className="text-xl" dark />
            <p className="mt-4 leading-relaxed text-white/60">
              VTC adapté pour personnes à mobilité réduite, à Paris et partout en France.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Services</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" hash="services" className="hover:text-white">
                  Rendez-vous médicaux
                </Link>
              </li>
              <li>
                <Link to="/" hash="services" className="hover:text-white">
                  Aéroport & gare accessibles
                </Link>
              </li>
              <li>
                <Link to="/" hash="services" className="hover:text-white">
                  Sorties & événements
                </Link>
              </li>
              <li>
                <Link to="/" hash="entreprises" className="hover:text-white">
                  Établissements & trajets réguliers
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Zones & trajets</h4>
            <ul className="space-y-2">
              {FOOTER_PAGES.map((p) => (
                <li key={p.to}>
                  <Link to={p.to} className="hover:text-white">
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Entreprise</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" hash="entreprises" className="hover:text-white">
                  Gotaxii pour les établissements
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Devenir chauffeur
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Carrières
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Presse
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Contact</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href={PHONE_HREF}
                  onClick={() => trackConversion("phone_click")}
                  className="hover:text-white"
                >
                  {PHONE_DISPLAY}
                </a>
              </li>
              <li>contact@gotaxii.com</li>
              <li>Disponible 24h/24</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 mt-12 pt-6 border-t border-white/10 text-xs text-white/40 flex flex-col sm:flex-row justify-between gap-3">
          <span>© 2026 Gotaxii. Tous droits réservés.</span>
          <span className="space-x-4">
            <Link to="/mentions-legales" className="hover:text-white">
              Mentions légales
            </Link>
            <a href="#" className="hover:text-white">
              CGV
            </a>
            <Link to="/confidentialite" className="hover:text-white">
              Confidentialité
            </Link>
          </span>
        </div>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 mt-4 text-[11px] text-white/30 leading-relaxed">
          Gotaxii est un service de VTC (transport privé de personnes) équipé et non un transport
          sanitaire (VSL/ambulance) conventionné par l'Assurance Maladie. Nos courses ne sont pas
          prises en charge par la CPAM et ne nécessitent pas de prescription médicale.
        </div>
      </footer>
    </>
  );
}
