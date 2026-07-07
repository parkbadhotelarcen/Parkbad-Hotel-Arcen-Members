import Image from "next/image";
import { qrDataUrl } from "@/lib/actions";

export async function QrCard({ url, label, guestNumber, showUrl = true }: { url: string; label: string; guestNumber?: string; showUrl?: boolean }) {
  const src = await qrDataUrl(url);
  return (
    <div className="card p-5 text-center">
      <Image src={src} alt={label} width={220} height={220} className="mx-auto rounded-lg border border-landal-100 bg-white p-2" />
      <div className="mt-3 text-sm font-bold text-landal-800">{label}</div>
      {guestNumber && <div className="mt-1 text-lg font-black text-landal-900">{guestNumber}</div>}
      {showUrl && <div className="mt-1 break-all text-xs text-slate-500">{url}</div>}
    </div>
  );
}
