import { Brand } from "@/components/brand";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-cream p-4">
      <div className="mx-auto max-w-3xl py-8">
        <Brand />
        <section className="card mt-8 p-6">
          <h1 className="text-3xl font-black text-landal-900">Privacy en voorwaarden</h1>
          <p className="mt-4 text-slate-700">Deelname aan Parkbad Hotel Arcen Members is vrijwillig. We bewaren alleen noodzakelijke gegevens voor uw ledenstatus, bezoeken, badges en beloningen.</p>
          <p className="mt-4 text-slate-700">U kunt bij de receptie deelname beëindigen of verwijdering/anonimisering aanvragen. Medewerkers hebben alleen toegang na login en acties worden gelogd.</p>
        </section>
      </div>
    </main>
  );
}
