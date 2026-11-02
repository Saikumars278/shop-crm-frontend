"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { FiX, FiCamera, FiCheck, FiAlertCircle, FiZap } from "react-icons/fi";

type BarcodeScannerModalProps = {
  open: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  title?: string;
};

export default function BarcodeScannerModal({
  open,
  onClose,
  onScan,
  title = "Scan Product Barcode",
}: BarcodeScannerModalProps) {
  const [manualCode, setManualCode] = useState("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const elementId = "html5-barcode-scanner-region";

  useEffect(() => {
    if (!open) return;

    let html5Qrcode: Html5Qrcode | null = null;
    let isSubscribed = true;

    const startScanner = async () => {
      setCameraError(null);
      setIsScanning(true);

      try {
        html5Qrcode = new Html5Qrcode(elementId);
        scannerRef.current = html5Qrcode;

        await html5Qrcode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 160 },
            aspectRatio: 1.777,
          },
          (decodedText) => {
            if (isSubscribed && decodedText) {
              stopAndFinish(decodedText);
            }
          },
          () => {
            // Ignore scan attempt failures (normal while seeking)
          }
        );
      } catch (err) {
        if (isSubscribed) {
          console.warn("Camera scanner start error:", err);
          setCameraError(
            "Could not access camera. Please allow camera permissions or use a USB scanner / manual input."
          );
          setIsScanning(false);
        }
      }
    };

    const timer = setTimeout(startScanner, 200);

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            scannerRef.current?.clear();
          });
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const stopAndFinish = async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;

    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {
        // ignore stop error
      }
    }
    onScan(trimmed);
    onClose();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      stopAndFinish(manualCode.trim());
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <FiCamera size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {title}
              </h3>
              <p className="text-[11px] text-slate-400">
                Camera & USB Barcode Scanner Supported
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Camera Scanner Region */}
        <div className="p-5 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-950/40">
          <div className="relative w-full overflow-hidden rounded-xl border-2 border-dashed border-blue-500/40 bg-slate-900 shadow-inner flex flex-col items-center justify-center min-h-[220px]">
            <div id={elementId} className="w-full h-full" />

            {cameraError && (
              <div className="p-4 text-center text-xs font-semibold text-rose-400 flex flex-col items-center gap-1.5">
                <FiAlertCircle size={20} />
                <span>{cameraError}</span>
              </div>
            )}
          </div>

          <p className="mt-2 text-[11px] text-slate-400 text-center flex items-center gap-1">
            <FiZap size={12} className="text-amber-500" /> Point camera at product barcode or scan with USB handheld scanner
          </p>
        </div>

        {/* USB Scanner & Manual Code Input */}
        <form
          onSubmit={handleManualSubmit}
          className="border-t border-slate-100 dark:border-slate-800 p-4 space-y-3 bg-white dark:bg-slate-900"
        >
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Or Type / USB Scan Barcode:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Enter barcode number..."
              autoFocus
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40"
            />
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              <FiCheck size={14} /> Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
