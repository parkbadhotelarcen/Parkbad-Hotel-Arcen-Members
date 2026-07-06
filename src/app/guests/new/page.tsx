import { createGuest } from "@/lib/actions";
import { requireEmployee } from "@/lib/auth";
import { Shell } from "@/components/ui";

export default async function NewGuestPage() {
  const employee = await requireEmployee();
  return (
    <Shell employee={employee}>
      <h1 className="text-3xl font-black text-landal-900">Nieuwe gast toevoegen</h1>
      <form action={createGuest} className="card mt-6 grid max-w-3xl gap-5 p-6 md:grid-cols-2">
        <div><label>Voornaam</label><input name="first_name" required /></div>
        <div><label>Achternaam</label><input name="last_name" required /></div>
        <div><label>E-mailadres</label><input name="email" type="email" required /></div>
        <div><label>Telefoonnummer</label><input name="phone" /></div>
        <div><label>Reserveringsnummer optioneel</label><input name="reservation_number" /></div>
        <div><label>Kamernummer optioneel</label><input name="room_number" /></div>
        <div className="md:col-span-2"><button className="btn-primary">Conceptprofiel aanmaken</button></div>
      </form>
    </Shell>
  );
}
