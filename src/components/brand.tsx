export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-full border-4 border-double border-landal-600 text-lg font-black text-landal-700">ll</div>
      {!compact && (
        <div>
          <div className="text-2xl font-black tracking-normal text-landal-700">Parkbad Hotel Arcen</div>
          <div className="-mt-1 text-xs font-semibold text-landal-600">Members Club</div>
        </div>
      )}
    </div>
  );
}
