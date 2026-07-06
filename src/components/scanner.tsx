"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export function Scanner() {
  const [result, setResult] = useState("");
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
    scanner.render(
      (decoded) => {
        setResult(decoded);
        window.location.href = decoded;
      },
      () => undefined,
    );
    return () => {
      scanner.clear().catch(() => undefined);
    };
  }, []);
  return (
    <div className="card p-4">
      <div id="qr-reader" className="overflow-hidden rounded-lg" />
      {result && <p className="mt-3 break-all text-sm text-landal-700">{result}</p>}
    </div>
  );
}
