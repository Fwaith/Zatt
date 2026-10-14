// Owner: Person A — camera barcode scanner.
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats as F } from "html5-qrcode";

const FORMATS = [F.EAN_13, F.EAN_8, F.UPC_A, F.UPC_E];

export default function Scanner({ onDetected }) {
  const [error, setError] = useState("");
  const onDetectedRef = useRef(onDetected);
  onDetectedRef.current = onDetected;

  useEffect(() => {
    const scanner = new Html5Qrcode("scanner-view", { formatsToSupport: FORMATS, verbose: false });
    let done = false;

    const started = scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 260, height: 140 } },
        (code) => {
          if (done) return;
          done = true;
          onDetectedRef.current(code);
        },
        () => {} // per-frame "no barcode found" — ignore
      )
      .catch((err) => {
        setError(
          String(err).includes("NotAllowed")
            ? "Camera permission denied. Type the barcode below instead."
            : "Camera unavailable (needs HTTPS or localhost). Type the barcode below instead."
        );
      });

    return () => {
      started.then(() => {
        if (scanner.isScanning) scanner.stop().then(() => scanner.clear()).catch(() => {});
      });
    };
  }, []);

  return (
    <div className="scanner">
      <div id="scanner-view" />
      {error && <p className="scanner-error">{error}</p>}
    </div>
  );
}
