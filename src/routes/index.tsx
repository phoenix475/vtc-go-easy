import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import heroImg from "@/assets/hero-night.jpg";
import fleetBusiness from "@/assets/fleet-business.jpg";
import fleetVan from "@/assets/fleet-van.jpg";
import fleetFirst from "@/assets/fleet-first.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Noire Private — VTC & Chauffeur Privé à Paris" },
      {
        name: "description",
        content:
          "Réservez votre VTC à Paris. Chauffeurs professionnels, berlines et vans de prestige, tarifs fixes et discrétion absolue.",
      },
      { property: "og:title", content: "Noire Private — VTC de Prestige" },
      { property: "og:description", content: "Service de chauffeur privé haut de gamme à Paris." },
      { property: "og:image", content: heroImg },
    ],
  }),
  component: Index,
});

function Index() {
  const [form, setForm] = useState({
    pickup: "",
    dropoff: "",
    when: "",
    vehicle: "Business Class",
  });
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-onyx">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-black/5 relative z-20 bg-white/80 backdrop-blur">
        <a href="#" className="text-2xl font-display tracking-tight font-semibold italic uppercase">
          Noire Private
        </a>
        <div className="hidden md:flex gap-8 text-sm font-medium tracking-wide uppercase">
          <a href="#services" className="hover:text-gold transition-colors">Services</a>
          <a href="#flotte" className="hover:text-gold transition-colors">Notre Flotte</a>
          <a href="#entreprises" className="hover:text-gold transition-colors">Entreprises</a>
        </div>
        <button className="px-6 py-2 border border-onyx text-xs font-semibold uppercase tracking-widest hover:bg-onyx hover:text-white transition-all">
          Espace Client
        </button>
      </nav>

      {/* Hero & Booking */}
      <section className="relative min-h-[88vh] flex flex-col items-center justify-center px-4 py-20">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <img
            src={heroImg}
            alt="Berline noire de prestige dans une rue parisienne nocturne"
            width={1920}
            height={1080}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-black/30" />
        </div>

        <div className="max-w-4xl w-full text-center mb-12">
          <span className="text-gold text-xs font-bold uppercase tracking-[0.3em]">VTC de prestige · Paris</span>
          <h1 className="font-display text-5xl md:text-7xl mt-6 mb-6 leading-[1.05] italic">
            L'excellence du transport
            <br />
            sur mesure à Paris
          </h1>
          <p className="text-lg text-onyx/70 max-w-xl mx-auto font-light leading-relaxed">
            Chauffeurs professionnels, discrétion absolue et confort inégalé pour vos déplacements
            privés et professionnels.
          </p>
        </div>

        {/* Booking Widget */}
        <form
          onSubmit={onSubmit}
          className="w-full max-w-5xl bg-white shadow-2xl p-2 md:p-3 ring-1 ring-black/5"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <label className="px-6 py-4 border border-black/5 block cursor-text">
              <span className="block text-[10px] uppercase tracking-widest text-gold font-semibold mb-1">
                Départ
              </span>
              <input
                type="text"
                required
                value={form.pickup}
                onChange={(e) => setForm({ ...form, pickup: e.target.value })}
                placeholder="Aéroport CDG, Paris..."
                className="w-full bg-transparent focus:outline-none text-sm placeholder:text-onyx/30"
              />
            </label>
            <label className="px-6 py-4 border border-black/5 block cursor-text">
              <span className="block text-[10px] uppercase tracking-widest text-gold font-semibold mb-1">
                Arrivée
              </span>
              <input
                type="text"
                required
                value={form.dropoff}
                onChange={(e) => setForm({ ...form, dropoff: e.target.value })}
                placeholder="Hôtel ou adresse..."
                className="w-full bg-transparent focus:outline-none text-sm placeholder:text-onyx/30"
              />
            </label>
            <label className="px-6 py-4 border border-black/5 block cursor-text">
              <span className="block text-[10px] uppercase tracking-widest text-gold font-semibold mb-1">
                Date & Heure
              </span>
              <input
                type="datetime-local"
                required
                value={form.when}
                onChange={(e) => setForm({ ...form, when: e.target.value })}
                className="w-full bg-transparent focus:outline-none text-sm text-onyx placeholder:text-onyx/30"
              />
            </label>
            <button
              type="submit"
              className="bg-onyx text-white uppercase text-xs font-bold tracking-widest py-4 md:py-0 hover:bg-gold transition-colors"
            >
              {submitted ? "Demande envoyée ✓" : "Estimer le prix"}
            </button>
          </div>
        </form>
      </section>

      {/* Fleet */}
      <section id="flotte" className="py-24 px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-16 gap-6">
          <div>
            <span className="text-gold text-xs font-bold uppercase tracking-widest">
              Notre sélection
            </span>
            <h2 className="font-display text-4xl md:text-5xl mt-2 italic">Une flotte d'exception</h2>
          </div>
          <a
            href="#"
            className="text-xs font-bold uppercase tracking-widest border-b-2 border-gold pb-1 self-start"
          >
            Voir tout
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {[
            {
              img: fleetBusiness,
              alt: "Mercedes Classe S noire en studio",
              name: "Business Class",
              model: "Mercedes Classe E ou équivalent",
              pax: "3 Passagers",
              bags: "2 Bagages",
            },
            {
              img: fleetVan,
              alt: "Intérieur en cuir d'un van Mercedes Classe V",
              name: "Van Excellence",
              model: "Mercedes Classe V",
              pax: "7 Passagers",
              bags: "7 Bagages",
            },
            {
              img: fleetFirst,
              alt: "Mercedes Maybach devant un hôtel parisien",
              name: "First Class",
              model: "Mercedes Classe S ou Maybach",
              pax: "2 Passagers",
              bags: "2 Bagages",
            },
          ].map((v) => (
            <article key={v.name} className="group cursor-pointer">
              <div className="overflow-hidden mb-6">
                <img
                  src={v.img}
                  alt={v.alt}
                  width={1024}
                  height={768}
                  loading="lazy"
                  className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <h3 className="text-xl font-medium mb-2">{v.name}</h3>
              <p className="text-sm text-onyx/60 font-light mb-4 italic">{v.model}</p>
              <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-tighter">
                <span>{v.pax}</span>
                <span className="w-1 h-1 bg-gold rounded-full" />
                <span>{v.bags}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="services" className="bg-onyx text-white py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-4 gap-12 text-center md:text-left">
            {[
              {
                t: "Prix Fixe",
                d: "Aucun supplément, même en cas de retard de vol ou de trafic intense.",
              },
              {
                t: "Attente Incluse",
                d: "60 minutes d'attente gratuites aux aéroports et 15 minutes en ville.",
              },
              {
                t: "Chauffeurs",
                d: "Professionnels bilingues rigoureusement sélectionnés et formés.",
              },
              {
                t: "Sur Mesure",
                d: "Boissons, presse et services personnalisés à bord de chaque véhicule.",
              },
            ].map((f) => (
              <div key={f.t}>
                <div className="w-8 h-px bg-gold mb-6 mx-auto md:mx-0" />
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4">{f.t}</h3>
                <p className="text-sm text-white/50 leading-relaxed font-light italic">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Entreprises CTA */}
      <section id="entreprises" className="py-24 px-8 max-w-7xl mx-auto text-center">
        <span className="text-gold text-xs font-bold uppercase tracking-widest">Entreprises</span>
        <h2 className="font-display text-4xl md:text-5xl italic mt-2 mb-6 max-w-2xl mx-auto">
          Un compte dédié pour vos collaborateurs et invités
        </h2>
        <p className="text-onyx/60 font-light max-w-xl mx-auto mb-10">
          Facturation centralisée, reporting mensuel, tarifs négociés et gestionnaire de compte
          personnel.
        </p>
        <a
          href="mailto:contact@noire-private.fr"
          className="inline-block px-10 py-4 bg-onyx text-white uppercase text-xs font-bold tracking-widest hover:bg-gold transition-colors"
        >
          Nous contacter
        </a>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-xl font-display italic font-semibold tracking-tight uppercase">
          Noire Private
        </div>
        <p className="text-[10px] text-onyx/40 uppercase tracking-widest italic">
          © 2026 Service de Transport Privé de Prestige
        </p>
        <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest">
          <a href="#" className="hover:text-gold">Mentions</a>
          <a href="#" className="hover:text-gold">CGV</a>
          <a href="#" className="hover:text-gold">Contact</a>
        </div>
      </footer>
    </div>
  );
}
