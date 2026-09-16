import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { format, isToday, isTomorrow, setHours, setMinutes, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Accessibility,
  Hospital,
  PartyPopper,
  Plane,
  MapPin,
  Wallet,
  Headphones,
  ArrowRight,
  Check,
  Users,
  Luggage,
  Star,
  Banknote,
  CreditCard,
  HandHelping,
  Building2,
  Calendar as CalendarIcon,
} from "lucide-react";
import heroImg from "@/assets/hero-day.jpg";
import serviceAirport from "@/assets/service-airport.jpg";
import serviceBusiness from "@/assets/service-business.jpg";
import serviceFacility from "@/assets/service-facility.jpg";
import serviceEvent from "@/assets/service-event.jpg";
import fleetBusiness from "@/assets/fleet-business.jpg";
import fleetVan from "@/assets/fleet-van.jpg";
import fleetFirst from "@/assets/fleet-first.jpg";
import { createReservation } from "@/lib/reservations.functions";
import { calculateTrip } from "@/lib/distance.functions";
import { calculatePrice } from "@/lib/pricing";
import { useAddressAutocomplete, type SelectedPlace } from "@/lib/places";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gotaxii — VTC adapté PMR, chauffeur pour personnes à mobilité réduite" },
      {
        name: "description",
        content:
          "Réservez votre VTC adapté PMR à Paris et partout en France en 2 minutes. Van avec rampe d'accès, arrimage fauteuil roulant, chauffeurs formés à l'accompagnement, prix fixe garanti, 24h/24.",
      },
      { property: "og:title", content: "Gotaxii — VTC adapté pour personnes à mobilité réduite" },
      {
        property: "og:description",
        content: "Rampe d'accès, chauffeurs formés, prix fixe garanti, 24h/24.",
      },
      { property: "og:image", content: heroImg },
    ],
  }),
  component: Home,
});

type Vehicle = "van";
type Trip = "one_way" | "round_trip";

const VEHICLES = {
  van: {
    name: "Van PMR",
    img: fleetVan,
    pax: 4,
    bags: 4,
    description: "LEVC TX adapté PMR — rampe d'accès et arrimage fauteuil roulant",
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
      <SiteHeader />
      <Hero />
      <TrustStrip />
      <Services />
      <HowItWorks />
      <Fleet />
      <WhyUs />
      <Business />
      <Testimonials />
      <SiteFooter />
    </div>
  );
}

/* -------------------- HERO + BOOKING -------------------- */
function Hero() {
  return (
    <section id="reserver" className="relative">
      <div className="absolute inset-0 -z-10">
        <img
          src={heroImg}
          alt="LEVC TX blanche, le taxi londonien 100% électrique adapté PMR utilisé par Gotaxii"
          width={1920}
          height={1280}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/60 to-white" />
      </div>

      <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-14 pb-24 lg:pt-20 lg:pb-32 grid lg:grid-cols-2 gap-10 items-start">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 bg-brand-soft text-brand text-xs font-semibold px-3 py-1.5 rounded-full">
            <Accessibility className="w-3.5 h-3.5" /> Spécialiste du transport PMR depuis 2019
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mt-5 leading-[1.05] text-ink">
            Le VTC adapté aux
            <br />
            <span className="text-brand">personnes à mobilité réduite.</span>
          </h1>
          <p className="text-lg text-ink-soft mt-5 leading-relaxed">
            Van avec rampe d'accès, arrimage fauteuil roulant certifié et chauffeurs formés à
            l'accompagnement. Prix fixe garanti, porte-à-porte, à Paris et partout en France.
          </p>
          <ul className="mt-6 grid grid-cols-2 gap-3 text-sm text-ink">
            {[
              "Rampe d'accès intégrée",
              "Arrimage fauteuil certifié",
              "Chauffeurs formés PSH",
              "Accompagnement porte-à-porte",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-brand" /> {t}
              </li>
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
      <span className="block text-[11px] uppercase tracking-wide text-ink-soft font-semibold mb-1.5">
        {label}
      </span>
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
                onChange(
                  combine(
                    day,
                    value?.getHours() ?? minDate.getHours(),
                    value?.getMinutes() ?? minDate.getMinutes(),
                  ),
                );
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>

        <select
          value={value?.getHours() ?? ""}
          onChange={(e) =>
            onChange(
              combine(
                value ?? minDate,
                +e.target.value,
                value?.getMinutes() ?? minuteOptions[0] ?? 0,
              ),
            )
          }
          className="bg-brand-soft/30 hover:bg-brand-soft/60 transition-all px-3 py-3 rounded-xl border border-transparent text-sm outline-none"
        >
          <option value="" disabled>
            --
          </option>
          {hourOptions.map((h) => (
            <option key={h} value={h}>
              {String(h).padStart(2, "0")}
            </option>
          ))}
        </select>

        <select
          value={value?.getMinutes() ?? ""}
          onChange={(e) =>
            onChange(combine(value ?? minDate, value?.getHours() ?? minHour, +e.target.value))
          }
          className="bg-brand-soft/30 hover:bg-brand-soft/60 transition-all px-3 py-3 rounded-xl border border-transparent text-sm outline-none"
        >
          <option value="" disabled>
            --
          </option>
          {minuteOptions.map((m) => (
            <option key={m} value={m}>
              {String(m).padStart(2, "0")}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function BookingCard() {
  const now = new Date();
  const navigate = useNavigate();
  const submit = useServerFn(createReservation);
  const calculateDistance = useServerFn(calculateTrip);
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [trip, setTrip] = useState<Trip>("one_way");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<{ distanceKm: number; durationMinutes: number } | null>(
    null,
  );
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
      // Pas de paiement en ligne : la réservation est déjà enregistrée, on
      // redirige vers la vraie page de confirmation (mesurable par Google Ads).
      navigate({ to: "/reservation-confirmee", search: { ref: res.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden">
      {/* Trip type tabs */}
      <div className="grid grid-cols-2 border-b border-black/5 text-sm font-semibold">
        {(
          [
            ["one_way", "Aller simple"],
            ["round_trip", "Aller-retour"],
          ] as const
        ).map(([k, label]) => (
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
                required
                value={pickup}
                onChange={(e) => {
                  setPickup(e.target.value);
                  setPickupCoords(null);
                }}
                placeholder="Aéroport CDG, 1 av. des Champs-Élysées…"
                className="w-full bg-transparent outline-none placeholder:text-ink-soft/50"
              />
            </Field>
            <Field label="Adresse d'arrivée" icon={<MapPin className="w-4 h-4 text-brand" />}>
              <input
                ref={dropoffInputRef}
                required
                value={dropoff}
                onChange={(e) => {
                  setDropoff(e.target.value);
                  setDropoffCoords(null);
                }}
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
                <select
                  value={passengers}
                  onChange={(e) => setPassengers(+e.target.value)}
                  className="w-full bg-transparent outline-none"
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n} passager{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Bagages" icon={<Luggage className="w-4 h-4" />}>
                <select
                  value={luggage}
                  onChange={(e) => setLuggage(+e.target.value)}
                  className="w-full bg-transparent outline-none"
                >
                  {[0, 1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n} bagage{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="flex items-center gap-3 bg-brand-soft/30 px-4 py-3 rounded-xl border border-transparent">
              <img src={VEHICLES.van.img} alt="Van" className="w-14 h-10 object-cover rounded-lg" />
              <div>
                <div className="text-sm font-semibold">{VEHICLES.van.name}</div>
                <div className="text-[11px] text-ink-soft">
                  1 fauteuil roulant + {VEHICLES.van.pax} passagers · {VEHICLES.van.bags} bagages ·{" "}
                  {VEHICLES.van.description}
                </div>
              </div>
            </div>

            {error && <p className="text-xs font-medium text-red-600">{error}</p>}

            <div className="flex items-center justify-between pt-2">
              <div>
                <div className="text-[10px] uppercase tracking-wide text-ink-soft font-semibold">
                  Prix estimé
                </div>
                <div className="text-2xl font-display font-extrabold text-brand">
                  {distance ? `${price} €` : ""}
                </div>
                {distance && (
                  <div className="text-[11px] text-ink-soft mt-0.5">
                    {distance.distanceKm} km · ≈ {distance.durationMinutes} min
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={next}
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
              <span className="text-ink-soft">
                {pickup} → {dropoff}
              </span>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-brand font-semibold text-xs hover:underline"
              >
                Modifier
              </button>
            </div>
            <Field label="Nom complet">
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Marie Dupont"
                className="w-full bg-transparent outline-none"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email">
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="marie@email.com"
                  className="w-full bg-transparent outline-none"
                />
              </Field>
              <Field label="Téléphone">
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+33 6 12 34 56 78"
                  className="w-full bg-transparent outline-none"
                />
              </Field>
            </div>
            <Field label="N° de vol (optionnel)">
              <input
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                placeholder="AF1234"
                className="w-full bg-transparent outline-none"
              />
            </Field>
            <Field label="Besoin d'assistance (optionnel)">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Type de fauteuil (manuel, électrique, pliant…), aide au transfert, accompagnateur…"
                className="w-full bg-transparent outline-none resize-none"
              />
            </Field>

            <div>
              <label className="block text-xs font-semibold text-ink-soft uppercase tracking-wide mb-2">
                Mode de paiement
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cash")}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${paymentMethod === "cash" ? "border-brand bg-brand-soft/50" : "border-black/10 hover:border-brand/40"}`}
                >
                  <Banknote className="w-4 h-4 text-brand" />
                  <span className="text-sm font-semibold">Payer sur place</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("online")}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${paymentMethod === "online" ? "border-brand bg-brand-soft/50" : "border-black/10 hover:border-brand/40"}`}
                >
                  <CreditCard className="w-4 h-4 text-brand" />
                  <span className="text-sm font-semibold">Payer en ligne</span>
                </button>
              </div>
            </div>

            {error && <p className="text-xs font-medium text-red-600">{error}</p>}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm font-semibold text-ink-soft hover:text-ink"
              >
                ← Retour
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 bg-brand text-white font-semibold px-6 py-3 rounded-full hover:bg-brand-dark transition-colors disabled:opacity-60"
              >
                {loading
                  ? "Envoi…"
                  : paymentMethod === "online"
                    ? `Payer ${price} €`
                    : `Confirmer (${price} €)`}{" "}
                {!loading && <Check className="w-4 h-4" />}
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

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-wide text-ink-soft font-semibold mb-1.5">
        {label}
      </span>
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
    ["17 839", "Trajets PMR réalisés"],
    ["4,97/5", "Note moyenne en 10 ans et 9 mois"],
    ["100%", "Chauffeurs formés PSH"],
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
    {
      icon: <Hospital className="w-5 h-5" />,
      title: "Rendez-vous médicaux",
      desc: "Hôpital, dialyse, kiné, radiothérapie. Accompagnement jusqu'à la porte du service.",
      img: serviceBusiness,
    },
    {
      icon: <Plane className="w-5 h-5" />,
      title: "Aéroport & gare accessibles",
      desc: "CDG, Orly, gares parisiennes. Suivi de vol, prise en charge dans le hall.",
      img: serviceAirport,
    },
    {
      icon: <PartyPopper className="w-5 h-5" />,
      title: "Sorties & événements",
      desc: "Famille, loisirs, mariages, spectacles. Un van adapté pour ne rien manquer.",
      img: serviceEvent,
    },
    {
      icon: <Building2 className="w-5 h-5" />,
      title: "Établissements & trajets réguliers",
      desc: "EHPAD, ESAT, centres médico-sociaux. Contrats de transport récurrent.",
      img: heroImg,
    },
  ];
  return (
    <section id="services" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-brand">
            Nos services
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold mt-3">
            Un VTC adapté pour chaque déplacement
          </h2>
          <p className="text-ink-soft mt-3">
            Du rendez-vous médical à la sortie en famille, notre van aménagé s'adapte à toutes vos
            occasions.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
          {services.map((s) => (
            <article
              key={s.title}
              className="group rounded-2xl overflow-hidden bg-white ring-1 ring-black/5 hover:shadow-xl transition-all"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={s.img}
                  alt={s.title}
                  loading="lazy"
                  width={1280}
                  height={960}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <div className="w-9 h-9 rounded-lg bg-brand-soft text-brand grid place-items-center mb-3">
                  {s.icon}
                </div>
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
    {
      n: "01",
      t: "Vous réservez en ligne",
      d: "Indiquez votre trajet, votre besoin d'assistance (fauteuil manuel, électrique…) et obtenez un prix fixe instantané.",
    },
    {
      n: "02",
      t: "Nous confirmons",
      d: "Un chauffeur formé à l'accompagnement PSH vous est attribué. Vous recevez ses coordonnées par SMS.",
    },
    {
      n: "03",
      t: "Vous voyagez en toute sécurité",
      d: "Rampe d'accès, arrimage certifié du fauteuil, accompagnement porte-à-porte jusqu'à destination.",
    },
  ];
  return (
    <section className="py-20 lg:py-28 bg-brand-soft/40">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-brand">
            Comment ça marche
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold mt-3">
            Une réservation en 3 étapes
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {steps.map((s, i) => (
            <div key={s.n} className="relative bg-white rounded-2xl p-7 ring-1 ring-black/5">
              <div className="font-display text-5xl font-extrabold text-brand/15">{s.n}</div>
              <h3 className="font-display font-bold text-xl mt-2">{s.t}</h3>
              <p className="text-ink-soft mt-2 text-sm leading-relaxed">{s.d}</p>
              {i < 2 && (
                <ArrowRight className="hidden md:block absolute -right-3 top-1/2 text-brand/30 w-6 h-6" />
              )}
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
            <span className="text-xs font-bold uppercase tracking-widest text-brand">
              Notre véhicule
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold mt-3">
              Un van aménagé, pensé pour l'accessibilité
            </h2>
          </div>
          <a
            href="#reserver"
            className="text-sm font-semibold text-brand hover:underline self-start"
          >
            Voir les tarifs →
          </a>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {(Object.entries(VEHICLES) as [Vehicle, (typeof VEHICLES)[Vehicle]][]).map(([key, v]) => (
            <article
              key={key}
              className="rounded-2xl overflow-hidden ring-1 ring-black/5 bg-white group hover:shadow-xl transition-all"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-brand-soft/40">
                <img
                  src={v.img}
                  alt="Rampe d'accès déployée sur un LEVC TX adapté PMR (photo d'illustration, véhicule similaire)"
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-ink/80 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                  Photo d'illustration — véhicule similaire
                </span>
              </div>
              <div className="p-6">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display font-bold text-xl">{v.name}</h3>
                  <div className="text-brand font-extrabold">dès 25€</div>
                </div>
                <p className="text-sm text-ink-soft mt-1">{v.description}</p>
                <div className="flex items-center gap-4 mt-4 text-xs text-ink-soft">
                  <span className="flex items-center gap-1">
                    <Accessibility className="w-3.5 h-3.5" /> 1 fauteuil roulant
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {v.pax} pax
                  </span>
                  <span className="flex items-center gap-1">
                    <Luggage className="w-3.5 h-3.5" /> {v.bags} bagages
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
        <p className="text-[11px] text-ink-soft/60 mt-4">
          Photo non contractuelle : rampe d'accès d'un véhicule LEVC TX similaire au nôtre, en
          attendant les photos de notre propre véhicule.
        </p>
      </div>
    </section>
  );
}

/* -------------------- WHY US -------------------- */
function WhyUs() {
  const items = [
    {
      i: <Accessibility className="w-5 h-5" />,
      t: "Véhicule 100% adapté",
      d: "Rampe d'accès et système d'arrimage certifié pour fauteuil manuel ou électrique.",
    },
    {
      i: <HandHelping className="w-5 h-5" />,
      t: "Chauffeurs formés PSH",
      d: "Accompagnement porte-à-porte, aide au transfert, patience et bienveillance.",
    },
    {
      i: <Wallet className="w-5 h-5" />,
      t: "Prix fixe garanti",
      d: "Tarif annoncé dès la réservation, aucun supplément surprise.",
    },
    {
      i: <Headphones className="w-5 h-5" />,
      t: "Support 24h/24",
      d: "Une équipe disponible à toute heure pour vous accompagner.",
    },
  ];
  return (
    <section className="py-20 lg:py-28 bg-ink text-white">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="max-w-xl">
          <span className="text-xs font-bold uppercase tracking-widest text-sun">
            Pourquoi Gotaxii
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold mt-3">
            Le VTC pensé pour l'accessibilité, sans compromis sur le service.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {items.map((it) => (
            <div key={it.t}>
              <div className="w-11 h-11 rounded-xl bg-white/10 text-sun grid place-items-center">
                {it.i}
              </div>
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
          <img
            src={serviceFacility}
            alt="Chauffeur aidant une passagère en fauteuil roulant à monter dans un LEVC TX adapté PMR, pour les trajets vers établissements médico-sociaux (photo d'illustration)"
            loading="lazy"
            width={1280}
            height={960}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand">
            Gotaxii pour les établissements
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold mt-3">
            Une solution dédiée aux EHPAD, ESAT et structures médico-sociales
          </h2>
          <p className="text-ink-soft mt-3 leading-relaxed">
            Centralisez les trajets réguliers de vos résidents ou usagers (consultations, activités,
            retours de week-end) avec une plateforme dédiée, des tarifs négociés au volume et un
            interlocuteur unique.
          </p>
          <ul className="grid sm:grid-cols-2 gap-3 mt-6 text-sm">
            {[
              "Facturation centralisée",
              "Reporting mensuel",
              "Tarifs négociés au volume",
              "Interlocuteur dédié",
              "Trajets récurrents planifiés",
              "Chauffeurs formés PSH",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-brand" /> {f}
              </li>
            ))}
          </ul>
          <a
            href="mailto:business@gotaxii.com"
            className="inline-flex items-center gap-2 bg-brand text-white font-semibold mt-8 px-6 py-3 rounded-full hover:bg-brand-dark transition-colors"
          >
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
    {
      n: "Camille R.",
      c: "Le chauffeur a pris le temps d'installer et d'arrimer le fauteuil de ma mère, aucun stress pour le rendez-vous à l'hôpital.",
      r: 5,
    },
    {
      n: "Julien M.",
      c: "Enfin un VTC vraiment adapté : rampe en bon état, chauffeur patient et à l'écoute. On l'utilise chaque semaine pour la dialyse.",
      r: 5,
    },
    {
      n: "Sophie K.",
      c: "Notre EHPAD a basculé tous les trajets résidents sur Gotaxii. Reporting nickel, chauffeurs formés, équipe très réactive.",
      r: 5,
    },
  ];
  return (
    <section id="avis" className="py-20 lg:py-28 bg-brand-soft/40">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-brand">
            Ils nous ont fait confiance
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold mt-3">
            4,97 / 5 sur 17 839 avis
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {reviews.map((r) => (
            <figure key={r.n} className="bg-white rounded-2xl p-6 ring-1 ring-black/5">
              <div className="flex gap-0.5 text-sun">
                {Array.from({ length: r.r }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-sun" />
                ))}
              </div>
              <blockquote className="text-ink mt-3 leading-relaxed">« {r.c} »</blockquote>
              <figcaption className="text-sm font-semibold text-ink-soft mt-4">— {r.n}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
