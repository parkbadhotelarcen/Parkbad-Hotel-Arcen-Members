import { requireEmployee } from "@/lib/auth";
import { Shell } from "@/components/ui";
import { Scanner } from "@/components/scanner";

export default async function ScanPage() {
  const employee = await requireEmployee();
  return (
    <Shell employee={employee}>
      <h1 className="text-3xl font-black text-landal-900">QR scannen</h1>
      <p className="mt-2 text-slate-600">Scan de gastenkaart. De QR-code opent het profiel, maar registreert nooit automatisch een verblijf.</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Scanner />
        <form action="/guests" className="card p-6">
          <h2 className="text-xl font-black text-landal-900">Handmatig zoeken</h2>
          <input className="mt-4" name="q" placeholder="Gastnummer, code, naam, e-mail, reservering of kamer" />
          <button className="btn-primary mt-4">Zoeken</button>
        </form>
      </div>
    </Shell>
  );
}
