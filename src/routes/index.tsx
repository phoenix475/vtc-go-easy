import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { format, isToday, isTomorrow, setHours, setMinutes, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Plane,
  Briefcase,
  PartyPopper,
  MapPin,
  ShieldCheck,
  Wallet,
  Headphones,
  ArrowRight,
  Check,
  Users,
  Luggage,
  Star,
  PhoneCall,
  Banknote,
  CreditCard,
  Calendar as CalendarIcon,
} from "lucide-react";
import heroImg from "@/assets/hero-day.jpg";
import serviceAirport from "@/assets/service-airport.jpg";
import serviceBusiness from "@/assets/service-business.jpg";
import serviceEvent from "@/assets/service-event.jpg";
import fleetBusiness from "@/assets/fleet-business.jpg";
import fleetVan from "@/assets/fleet-van.jpg";
import fleetFirst from "@/assets/fleet-first.jpg";
import { createReservation } from "@/lib/reservations.functions";
import { calculateTrip } from "@/lib/distance.functions";
import { calculatePrice } from "@/lib/pricing";
import { useAddressAutocomplete, type SelectedPlace } from "@/lib/places";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gotaxii — Réservation de chauffeur privé en ligne" },
      {
        name: "description",
        content:
          "Réservez votre VTC à Paris et partout en France en 2 minutes. Prix fixe garanti, chauffeurs professionnels, berlines et vans haut de gamme, 24h/24.",
      },
      { property: "og:title", content: "Gotaxii — Chauffeur privé en 2 minutes" },
      { property: "og:description", content: "Prix fixe garanti, suivi de vol, 24h/24." },
      { property: "og:image", content: heroImg },
    ],
  }),
  component: Home,
});

type Vehicle = "van";
type Trip = "one_way" | "round_trip";

const VEHICLES = {
  van: {
    name: "Van",
    img: fleetVan,
    pax: 6,
    bags: 6,
    description: "Mercedes Classe V — idéal en famille ou en groupe",
  },
} as const;

function Home() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    if (payment === "success") {
      toast.success("Paiement reçu ! Votre réservation est confirmée.");
    } else if (payment === "cancelled") {
      toast.error("Paiement annulé. Votre réservation reste en attente.");
    }
    if (payment) {
      params.delete("payment");
      params.delete("reservation");
      const query = params.toString();
      window.history.replaceState({}, "", query ? `?${query}` : window.location.pathname);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-ink antialiased">
      <Header />
      <Hero />
      <TrustStrip />
      <Services />
      <HowItWorks />
      <Fleet />
      <WhyUs />
      <Business />
      <Testimonials />
      <Footer />
    </div>
  );
}

/* -------------------- LOGO -------------------- */
function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="gotaxiiLogoGradient" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#1554e6" />
          <stop offset="100%" stopColor="#071f5c" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#gotaxiiLogoGradient)" />
      <circle
        cx="16" cy="16" r="7.5"
        fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round"
        strokeDasharray="36 11"
        transform="rotate(-45 16 16)"
      />
      <circle cx="22.2" cy="9.8" r="2.1" fill="#ffc94d" />
    </svg>
  );
}

/* -------------------- HEADER -------------------- */
function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-black/5">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <Logo className="w-8 h-8" />
          <span className="font-display text-xl font-extrabold tracking-tight">Gotaxii<span className="text-brand">.</span></span>
        </a>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink-soft">
          <a href="#services" className="hover:text-brand transition-colors">Services</a>
          <a href="#flotte" className="hover:text-brand transition-colors">Véhicules</a>
          <a href="#entreprises" className="hover:text-brand transition-colors">Entreprises</a>
          <a href="#avis" className="hover:text-brand transition-colors">Avis</a>
        </nav>
        <div className="flex items-center gap-3">
          <a href="tel:+33180000000" className="hidden sm:flex items-center gap-2 text-sm font-medium text-ink-soft hover:text-brand">
            <PhoneCall className="w-4 h-4" /> 01 80 00 00 00
          </a>
          <a href="#reserver" className="inline-flex items-center gap-1 bg-brand text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-brand-dark transition-colors">
            Réserver <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
}

/* -------------------- HERO + BOOKING -------------------- */
function Hero() {
  return (
    <section id="reserver" className="relative">
      <div className="absolute inset-0 -z-10">
        <img
          src={heroImg}
          alt="Chauffeur Gotaxii ouvrant la portière d'une berline noire devant un hôtel parisien"
          width={1920}
          height={1280}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/60 to-white" />
      </div>

      <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-14 pb-24 lg:pt-20 lg:pb-32 grid lg:grid-cols-2 gap-10 items-start">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 bg-brand-soft text-brand text-xs font-semibold px-3 py-1.5 rounded-full">
            <Star className="w-3.5 h-3.5 fill-brand text-brand" /> 4,9/5 sur 12 800 courses
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mt-5 leading-[1.05] text-ink">
            Votre chauffeur privé,<br />
            <span className="text-brand">réservé en 2 minutes.</span>
          </h1>
          <p className="text-lg text-ink-soft mt-5 leading-relaxed">
            Prix fixe garanti dès la réservation. Suivi de vol, chauffeurs professionnels et véhicules haut de gamme à Paris, en France et en Europe.
          </p>
          <ul className="mt-6 grid grid-cols-2 gap-3 text-sm text-ink">
            {["Prix fixe garanti", "Suivi de vol inclus", "Annulation gratuite", "Service 24h/24"].map((t) => (
              <li key={t} className="flex items-center gap-2"><Check className="w-4 h-4 text-brand" /> {t}</li>
            ))}
          </ul>
        </div>

        <BookingCard />
      </div>
    </section>
  );
}

type PaymentMethod = "cash" | "online";

const MINUTE_STEPS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

function ceilToStep(value: number, step: number) {
  return Math.ceil(value / step) * step;
}

// Sélecteur date/heure/minute en 3 champs séparés, qui empêche de choisir un
// horaire déjà passé (ex: 16h alors qu'il est déjà 20h aujourd'hui).
function DateTimeField({
  label,
  value,
  onChange,
  minDate,
}: {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  minDate: Date;
}) {
  const [open, setOpen] = useState(false);
  const isMinDay = value ? startOfDay(value).getTime() === startOfDay(minDate).getTime() : false;

  const dateLabel = !value
    ? "jj/mm/aaaa"
    : isToday(value)
      ? "Aujourd'hui"
      : isTomorrow(value)
        ? "Demain"
        : format(value, "d MMM", { locale: fr });

  const minHour = isMinDay ? minDate.getHours() : 0;
  const hourOptions = Array.from({ length: 24 }, (_, h) => h).filter((h) => h >= minHour);

  const selectedHour = value?.getHours();
  const minMinute = isMinDay && selectedHour === minHour ? ceilToStep(minDate.getMinutes(), 5) : 0;
  const minuteOptions = MINUTE_STEPS.filter((m) => m >= minMinute);

  const combine = (day: Date, hour: number, minute: number) => {
    let next = setMinutes(setHours(startOfDay(day), hour), minute);
    if (next < minDate) next = setMinutes(setHours(startOfDay(day), minHour), minMinute || 0);
    return next;
  };

  return (
    <div>
      <span className="block text-[11px] uppercase tracking-wide text-ink-soft font-semibold mb-1.5">{label}</span>
      <div className="grid grid-cols-3 gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 bg-brand-soft/30 hover:bg-brand-soft/60 transition-all px-3 py-3 rounded-xl border border-transparent text-sm"
            >
              <CalendarIcon className="w-4 h-4 text-brand shrink-0" />
              <span className="truncate">{dateLabel}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value ?? undefined}
              defaultMonth={value ?? minDate}
              disabled={(date) => startOfDay(date) < startOfDay(minDate)}
              onSelect={(day) => {
                if (!day) return;
                onChange(combine(day, value?.getHours() ?? minDate.getHours(), value?.getMinutes() ?? minDate.getMinutes()));
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>

        <select
          value={value?.getHours() ?? ""}
          onChange={(e) => onChange(combine(value ?? minDate, +e.target.value, value?.getMinutes() ?? minuteOptions[0] ?? 0))}
          className="bg-brand-soft/30 hover:bg-brand-soft/60 transition-all px-3 py-3 rounded-xl border border-transparent text-sm outline-none"
        >
          <option value="" disabled>--</option>
          {hourOptions.map((h) => <option key={h} value={h}>{String(h).padStart(2, "0")}</option>)}
        </select>

        <select
          value={value?.getMinutes() ?? ""}
          onChange={(e) => onChange(combine(value ?? minDate, value?.getHours() ?? minHour, +e.target.value))}
          className="bg-brand-soft/30 hover:bg-brand-soft/60 transition-all px-3 py-3 rounded-xl border border-transparent text-sm outline-none"
        >
          <option value="" disabled>--</option>
          {minuteOptions.map((m) => <option key={m} value={m}>{String(m).padStart(2, "0")}</option>)}
        </select>
      </div>
    </div>
  );
}

function BookingCard() {
  const now = new Date();
  const submit = useServerFn(createReservation);
  const calculateDistance = useServerFn(calculateTrip);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [confirmationId, setConfirmationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [trip, setTrip] = useState<Trip>("one_way");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<{ distanceKm: number; durationMinutes: number } | null>(null);
  const [pickupAt, setPickupAt] = useState<Date | null>(null);
  const [returnAt, setReturnAt] = useState<Date | null>(null);
  const [passengers, setPassengers] = useState(2);
  const [luggage, setLuggage] = useState(2);
  const [vehicle] = useState<Vehicle>("van");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [notes, setNotes] = useState("");

  const pickupInputRef = useRef<HTMLInputElement>(null);
  const dropoffInputRef = useRef<HTMLInputElement>(null);

  useAddressAutocomplete(pickupInputRef, (place: SelectedPlace) => {
    setPickup(place.formattedAddress);
    setPickupCoords({ lat: place.lat, lng: place.lng });
  });
  useAddressAutocomplete(dropoffInputRef, (place: SelectedPlace) => {
    setDropoff(place.formattedAddress);
    setDropoffCoords({ lat: place.lat, lng: place.lng });
  });

  // Recalcule la distance routière dès que les deux adresses sont choisies.
  useEffect(() => {
    if (!pickupCoords || !dropoffCoords) {
      setDistance(null);
      return;
    }
    let cancelled = false;
    calculateDistance({
      data: {
        originLat: pickupCoords.lat,
        originLng: pickupCoords.lng,
        destinationLat: dropoffCoords.lat,
        destinationLng: dropoffCoords.lng,
      },
    })
      .then((res) => {
        if (!cancelled) setDistance(res);
      })
      .catch(() => {
        if (!cancelled) setDistance(null);
      });
    return () => {
      cancelled = true;
    };
  }, [trip, pickupCoords, dropoffCoords]);

  const price = calculatePrice({
    vehicleClass: vehicle,
    tripType: trip,
    distanceKm: distance?.distanceKm,
  });

  const next = () => {
    setError(null);
    if (!pickup.trim() || !dropoff.trim() || !pickupAt) {
      setError("Renseignez départ, arrivée et date.");
      return;
    }
    setStep(2);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await submit({
        data: {
          trip_type: trip,
          pickup_address: pickup,
          dropoff_address: dropoff,
          pickup_at: pickupAt!.toISOString(),
          return_at: trip === "round_trip" && returnAt ? returnAt.toISOString() : null,
          passengers,
          luggage,
          vehicle_class: vehicle,
          full_name: fullName,
          email,
          phone,
          flight_number: flightNumber || null,
          notes: notes || null,
          distance_km: distance?.distanceKm ?? null,
          duration_minutes: distance?.durationMinutes ?? null,
          payment_method: paymentMethod,
        },
      });
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
        return;
      }
      setConfirmationId(res.id);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  if (step === 3 && confirmationId) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-brand-soft text-brand grid place-items-center mx-auto">
          <Check className="w-7 h-7" strokeWidth={3} />
        </div>
        <h3 className="font-display text-2xl font-extrabold mt-4">Réservation confirmée</h3>
        <p className="text-ink-soft mt-2 text-sm">
          Un email récapitulatif a été envoyé à <b>{email}</b>.<br />
          Votre référence : <code className="bg-brand-soft text-brand px-2 py-0.5 rounded text-xs">{confirmationId.slice(0, 8).toUpperCase()}</code>
        </p>
        <div className="bg-brand-soft/60 rounded-xl p-4 mt-6 text-left text-sm">
          <div className="flex justify-between"><span className="text-ink-soft">Trajet</span><span className="font-semibold">{pickup} → {dropoff}</span></div>
          <div className="flex justify-between mt-1"><span className="text-ink-soft">Véhicule</span><span className="font-semibold">{VEHICLES[vehicle].name}</span></div>
          <div className="flex justify-between mt-1"><span className="text-ink-soft">Prix estimé</span><span className="font-semibold text-brand">{price} €</span></div>
        </div>
        <button
          onClick={() => { setStep(1); setConfirmationId(null); setPickup(""); setDropoff(""); setPickupAt(null); setFullName(""); setEmail(""); setPhone(""); }}
          className="mt-6 text-sm font-semibold text-brand hover:underline"
        >
          Faire une nouvelle réservation
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden">
      {/* Trip type tabs */}
      <div className="grid grid-cols-2 border-b border-black/5 text-sm font-semibold">
        {([
          ["one_way", "Aller simple"],
          ["round_trip", "Aller-retour"],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTrip(k)}
            className={`py-4 transition-colors ${trip === k ? "bg-white text-brand border-b-2 border-brand -mb-px" : "bg-brand-soft/40 text-ink-soft hover:text-ink"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="p-5 lg:p-6 space-y-4">
        {step === 1 && (
          <>
            <Field label="Adresse de départ" icon={<MapPin className="w-4 h-4" />}>
              <input
                ref={pickupInputRef}
                required value={pickup} onChange={(e) => { setPickup(e.target.value); setPickupCoords(null); }}
                placeholder="Aéroport CDG, 1 av. des Champs-Élysées…"
                className="w-full bg-transparent outline-none placeholder:text-ink-soft/50"
              />
            </Field>
            <Field label="Adresse d'arrivée" icon={<MapPin className="w-4 h-4 text-brand" />}>
              <input
                ref={dropoffInputRef}
                required value={dropoff} onChange={(e) => { setDropoff(e.target.value); setDropoffCoords(null); }}
                placeholder="Hôtel, gare, adresse…"
                className="w-full bg-transparent outline-none placeholder:text-ink-soft/50"
              />
            </Field>

            <div className={`grid gap-3 ${trip === "round_trip" ? "grid-cols-2" : "grid-cols-1"}`}>
              <DateTimeField
                label="Date & heure de prise en charge"
                value={pickupAt}
                onChange={setPickupAt}
                minDate={now}
              />
              {trip === "round_trip" && (
                <DateTimeField
                  label="Date & heure de retour"
                  value={returnAt}
                  onChange={setReturnAt}
                  minDate={pickupAt ?? now}
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Passagers" icon={<Users className="w-4 h-4" />}>
                <select value={passengers} onChange={(e) => setPassengers(+e.target.value)} className="w-full bg-transparent outline-none">
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} passager{n>1?"s":""}</option>)}
                </select>
              </Field>
              <Field label="Bagages" icon={<Luggage className="w-4 h-4" />}>
                <select value={luggage} onChange={(e) => setLuggage(+e.target.value)} className="w-full bg-transparent outline-none">
                  {[0,1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n} bagage{n>1?"s":""}</option>)}
                </select>
              </Field>
            </div>

            <div className="flex items-center gap-3 bg-brand-soft/30 px-4 py-3 rounded-xl border border-transparent">
              <img src={VEHICLES.van.img} alt="Van" className="w-14 h-10 object-cover rounded-lg" />
              <div>
                <div className="text-sm font-semibold">{VEHICLES.van.name}</div>
                <div className="text-[11px] text-ink-soft">{VEHICLES.van.pax} passagers max · {VEHICLES.van.bags} bagages · {VEHICLES.van.description}</div>
              </div>
            </div>

            {error && <p className="text-xs font-medium text-red-600">{error}</p>}

            <div className="flex items-center justify-between pt-2">
              <div>
                <div className="text-[10px] uppercase tracking-wide text-ink-soft font-semibold">Prix estimé</div>
                <div className="text-2xl font-display font-extrabold text-brand">{distance ? `${price} €` : ""}</div>
                {distance && (
                  <div className="text-[11px] text-ink-soft mt-0.5">{distance.distanceKm} km · ≈ {distance.durationMinutes} min</div>
                )}
              </div>
              <button
                type="button" onClick={next}
                className="inline-flex items-center gap-2 bg-brand text-white font-semibold px-6 py-3 rounded-full hover:bg-brand-dark transition-colors"
              >
                Étape suivante <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="rounded-xl bg-brand-soft/40 px-4 py-3 text-sm flex items-center justify-between">
              <span className="text-ink-soft">{pickup} → {dropoff}</span>
              <button type="button" onClick={() => setStep(1)} className="text-brand font-semibold text-xs hover:underline">Modifier</button>
            </div>
            <Field label="Nom complet">
              <input required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Marie Dupont" className="w-full bg-transparent outline-none" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email">
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="marie@email.com" className="w-full bg-transparent outline-none" />
              </Field>
              <Field label="Téléphone">
                <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+33 6 12 34 56 78" className="w-full bg-transparent outline-none" />
              </Field>
            </div>
            <Field label="N° de vol (optionnel)">
              <input value={flightNumber} onChange={e => setFlightNumber(e.target.value)} placeholder="AF1234" className="w-full bg-transparent outline-none" />
            </Field>
            <Field label="Demandes particulières (optionnel)">
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Siège bébé, accueil avec panneau…" className="w-full bg-transparent outline-none resize-none" />
            </Field>

            <div>
              <label className="block text-xs font-semibold text-ink-soft uppercase tracking-wide mb-2">Mode de paiement</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button" onClick={() => setPaymentMethod("cash")}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${paymentMethod === "cash" ? "border-brand bg-brand-soft/50" : "border-black/10 hover:border-brand/40"}`}
                >
                  <Banknote className="w-4 h-4 text-brand" />
                  <span className="text-sm font-semibold">Payer sur place</span>
                </button>
                <button
                  type="button" onClick={() => setPaymentMethod("online")}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${paymentMethod === "online" ? "border-brand bg-brand-soft/50" : "border-black/10 hover:border-brand/40"}`}
                >
                  <CreditCard className="w-4 h-4 text-brand" />
                  <span className="text-sm font-semibold">Payer en ligne</span>
                </button>
              </div>
            </div>

            {error && <p className="text-xs font-medium text-red-600">{error}</p>}

            <div className="flex items-center justify-between pt-2">
              <button type="button" onClick={() => setStep(1)} className="text-sm font-semibold text-ink-soft hover:text-ink">← Retour</button>
              <button
                type="submit" disabled={loading}
                className="inline-flex items-center gap-2 bg-brand text-white font-semibold px-6 py-3 rounded-full hover:bg-brand-dark transition-colors disabled:opacity-60"
              >
                {loading ? "Envoi…" : paymentMethod === "online" ? `Payer ${price} €` : `Confirmer (${price} €)`} {!loading && <Check className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-ink-soft/80 text-center pt-1">
              En confirmant, vous acceptez nos CGV. Annulation gratuite jusqu'à 1h avant la course.
            </p>
          </>
        )}
      </form>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-wide text-ink-soft font-semibold mb-1.5">{label}</span>
      <div className="flex items-center gap-2 bg-brand-soft/30 hover:bg-brand-soft/60 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand transition-all px-4 py-3 rounded-xl border border-transparent focus-within:border-brand">
        {icon && <span className="text-brand">{icon}</span>}
        <div className="flex-1">{children}</div>
      </div>
    </label>
  );
}

/* -------------------- TRUST STRIP -------------------- */
function TrustStrip() {
  const stats = [
    ["12 800+", "Courses réalisées"],
    ["4,9/5", "Note moyenne"],
    ["350+", "Chauffeurs partenaires"],
    ["24/7", "Support client"],
  ];
  return (
    <section className="border-y border-black/5 bg-white">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-6 py-10">
        {stats.map(([v, l]) => (
          <div key={l} className="text-center lg:text-left">
            <div className="font-display text-3xl font-extrabold text-brand">{v}</div>
            <div className="text-sm text-ink-soft mt-1">{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------- SERVICES -------------------- */
function Services() {
  const services = [
    { icon: <Plane className="w-5 h-5" />, title: "Transferts aéroport", desc: "CDG, Orly, Beauvais. Suivi de vol et accueil avec panneau inclus.", img: serviceAirport },
    { icon: <Briefcase className="w-5 h-5" />, title: "Trajets d'affaires", desc: "Rendez-vous, déplacements pros, facturation simplifiée pour votre entreprise.", img: serviceBusiness },
    { icon: <PartyPopper className="w-5 h-5" />, title: "Mariages & événements", desc: "Véhicules d'exception, chauffeurs habillés, prestation sur-mesure.", img: serviceEvent },
    { icon: <MapPin className="w-5 h-5" />, title: "Longue distance", desc: "Paris ↔ province ou Europe. Tarif fixe annoncé dès la réservation.", img: heroImg },
  ];
  return (
    <section id="services" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-brand">Nos services</span>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold mt-3">Un service VTC pour chaque besoin</h2>
          <p className="text-ink-soft mt-3">Du transfert aéroport au mariage, nos chauffeurs s'adaptent à toutes vos occasions.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
          {services.map((s) => (
            <article key={s.title} className="group rounded-2xl overflow-hidden bg-white ring-1 ring-black/5 hover:shadow-xl transition-all">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={s.img} alt={s.title} loading="lazy" width={1280} height={960} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-5">
                <div className="w-9 h-9 rounded-lg bg-brand-soft text-brand grid place-items-center mb-3">{s.icon}</div>
                <h3 className="font-display font-bold text-lg">{s.title}</h3>
                <p className="text-sm text-ink-soft mt-1 leading-relaxed">{s.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------- HOW IT WORKS -------------------- */
function HowItWorks() {
  const steps = [
    { n: "01", t: "Vous réservez en ligne", d: "Indiquez votre trajet, choisissez votre véhicule et obtenez un prix fixe instantané." },
    { n: "02", t: "Nous confirmons", d: "Un chauffeur professionnel vous est attribué. Vous recevez ses coordonnées par SMS." },
    { n: "03", t: "Vous voyagez l'esprit libre", d: "Suivi en temps réel, accueil ponctuel, bouteille d'eau offerte à bord." },
  ];
  return (
    <section className="py-20 lg:py-28 bg-brand-soft/40">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-brand">Comment ça marche</span>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold mt-3">Une réservation en 3 étapes</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {steps.map((s, i) => (
            <div key={s.n} className="relative bg-white rounded-2xl p-7 ring-1 ring-black/5">
              <div className="font-display text-5xl font-extrabold text-brand/15">{s.n}</div>
              <h3 className="font-display font-bold text-xl mt-2">{s.t}</h3>
              <p className="text-ink-soft mt-2 text-sm leading-relaxed">{s.d}</p>
              {i < 2 && <ArrowRight className="hidden md:block absolute -right-3 top-1/2 text-brand/30 w-6 h-6" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------- FLEET -------------------- */
function Fleet() {
  return (
    <section id="flotte" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand">Notre flotte</span>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold mt-3">Une sélection de véhicules d'exception</h2>
          </div>
          <a href="#reserver" className="text-sm font-semibold text-brand hover:underline self-start">Voir les tarifs →</a>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {(Object.entries(VEHICLES) as [Vehicle, typeof VEHICLES[Vehicle]][]).map(([key, v]) => (
            <article key={key} className="rounded-2xl overflow-hidden ring-1 ring-black/5 bg-white group hover:shadow-xl transition-all">
              <div className="aspect-[4/3] overflow-hidden bg-brand-soft/40">
                <img src={v.img} alt={v.name} loading="lazy" width={1024} height={768} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display font-bold text-xl">{v.name}</h3>
                  <div className="text-brand font-extrabold">2,20€/km</div>
                </div>
                <p className="text-sm text-ink-soft mt-1">{v.description}</p>
                <div className="flex items-center gap-4 mt-4 text-xs text-ink-soft">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {v.pax} pax</span>
                  <span className="flex items-center gap-1"><Luggage className="w-3.5 h-3.5" /> {v.bags} bagages</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------- WHY US -------------------- */
function WhyUs() {
  const items = [
    { i: <Wallet className="w-5 h-5" />, t: "Prix fixe garanti", d: "Tarif annoncé dès la réservation, aucun supplément." },
    { i: <Plane className="w-5 h-5" />, t: "Suivi de vol inclus", d: "60 minutes d'attente gratuites aux aéroports." },
    { i: <ShieldCheck className="w-5 h-5" />, t: "Chauffeurs vérifiés", d: "Professionnels certifiés VTC, expérimentés et bilingues." },
    { i: <Headphones className="w-5 h-5" />, t: "Support 24h/24", d: "Une équipe disponible à toute heure pour vous accompagner." },
  ];
  return (
    <section className="py-20 lg:py-28 bg-ink text-white">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="max-w-xl">
          <span className="text-xs font-bold uppercase tracking-widest text-sun">Pourquoi Gotaxii</span>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold mt-3">Le sérieux d'un service pro, la simplicité d'une app.</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {items.map((it) => (
            <div key={it.t}>
              <div className="w-11 h-11 rounded-xl bg-white/10 text-sun grid place-items-center">{it.i}</div>
              <h3 className="font-display font-bold text-lg mt-4">{it.t}</h3>
              <p className="text-sm text-white/60 mt-1 leading-relaxed">{it.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------- BUSINESS -------------------- */
function Business() {
  return (
    <section id="entreprises" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <div className="rounded-2xl overflow-hidden aspect-[4/3]">
          <img src={serviceBusiness} alt="Cadre travaillant à l'arrière d'une berline Gotaxii" loading="lazy" width={1280} height={960} className="w-full h-full object-cover" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand">Gotaxii Business</span>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold mt-3">Une solution dédiée à votre entreprise</h2>
          <p className="text-ink-soft mt-3 leading-relaxed">
            Centralisez les déplacements de vos collaborateurs et invités avec une plateforme dédiée, des tarifs négociés et un account manager personnel.
          </p>
          <ul className="grid sm:grid-cols-2 gap-3 mt-6 text-sm">
            {["Facturation centralisée", "Reporting mensuel", "Tarifs négociés", "Account manager dédié", "API d'intégration", "Multi-utilisateurs"].map((f) => (
              <li key={f} className="flex items-center gap-2"><Check className="w-4 h-4 text-brand" /> {f}</li>
            ))}
          </ul>
          <a href="mailto:business@gotaxii.com" className="inline-flex items-center gap-2 bg-brand text-white font-semibold mt-8 px-6 py-3 rounded-full hover:bg-brand-dark transition-colors">
            Demander une démo <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* -------------------- TESTIMONIALS -------------------- */
function Testimonials() {
  const reviews = [
    { n: "Camille R.", c: "Réservation rapide, chauffeur impeccable et ponctuel pour mon transfert CDG. Je recommande !", r: 5 },
    { n: "Julien M.", c: "Service utilisé pour mon mariage : véhicule magnifique et chauffeur très pro. Parfait.", r: 5 },
    { n: "Sophie K.", c: "Mon entreprise a basculé tous nos trajets sur Gotaxii. Reporting nickel, équipe réactive.", r: 5 },
  ];
  return (
    <section id="avis" className="py-20 lg:py-28 bg-brand-soft/40">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-brand">Ils nous ont fait confiance</span>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold mt-3">4,9 / 5 sur 12 800 avis</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {reviews.map((r) => (
            <figure key={r.n} className="bg-white rounded-2xl p-6 ring-1 ring-black/5">
              <div className="flex gap-0.5 text-sun">{Array.from({ length: r.r }).map((_, i) => <Star key={i} className="w-4 h-4 fill-sun" />)}</div>
              <blockquote className="text-ink mt-3 leading-relaxed">« {r.c} »</blockquote>
              <figcaption className="text-sm font-semibold text-ink-soft mt-4">— {r.n}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------- FOOTER -------------------- */
function Footer() {
  return (
    <footer className="bg-ink text-white/70 py-14">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 grid sm:grid-cols-2 md:grid-cols-4 gap-10 text-sm">
        <div>
          <div className="flex items-center gap-2 text-white">
            <Logo className="w-8 h-8" />
            <span className="font-display text-xl font-extrabold">Gotaxii<span className="text-brand">.</span></span>
          </div>
          <p className="mt-4 leading-relaxed text-white/60">Réservation de chauffeurs privés à Paris et partout en France.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Services</h4>
          <ul className="space-y-2">
            <li><a href="#services" className="hover:text-white">Transfert aéroport</a></li>
            <li><a href="#services" className="hover:text-white">Trajets d'affaires</a></li>
            <li><a href="#services" className="hover:text-white">Mariages & événements</a></li>
            <li><a href="#services" className="hover:text-white">Longue distance</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Entreprise</h4>
          <ul className="space-y-2">
            <li><a href="#entreprises" className="hover:text-white">Gotaxii Business</a></li>
            <li><a href="#" className="hover:text-white">Devenir chauffeur</a></li>
            <li><a href="#" className="hover:text-white">Carrières</a></li>
            <li><a href="#" className="hover:text-white">Presse</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Contact</h4>
          <ul className="space-y-2">
            <li>01 80 00 00 00</li>
            <li>contact@gotaxii.com</li>
            <li>Disponible 24h/24</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-5 lg:px-8 mt-12 pt-6 border-t border-white/10 text-xs text-white/40 flex flex-col sm:flex-row justify-between gap-3">
        <span>© 2026 Gotaxii. Tous droits réservés.</span>
        <span className="space-x-4">
          <a href="#" className="hover:text-white">Mentions légales</a>
          <a href="#" className="hover:text-white">CGV</a>
          <a href="#" className="hover:text-white">Confidentialité</a>
        </span>
      </div>
    </footer>
  );
}
