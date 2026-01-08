'use client';

import { Html5QrcodeScanner } from 'html5-qrcode';
import { ChevronLeft, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function ScanPage() {
    const router = useRouter();
    const [scanResult, setScanResult] = useState<string | null>(null);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        // Initialize Scanner
        // Use a small timeout to ensure DOM is ready
        const timeoutId = setTimeout(() => {
            const scanner = new Html5QrcodeScanner(
                "reader",
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                    showTorchButtonIfSupported: true
                },
                /* verbose= */ false
            );

            scanner.render(onScanSuccess, onScanFailure);
            scannerRef.current = scanner;
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            if (scannerRef.current) {
                scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
            }
        };
    }, []);

    const onScanSuccess = (decodedText: string, decodedResult: any) => {
        if (scannerRef.current) {
            scannerRef.current.clear().catch(console.error);
        }

        setScanResult(decodedText);

        // Smart Logic
        setTimeout(() => {
            // 1. URL Check
            if (decodedText.startsWith('http')) {
                const confirmOpen = window.confirm(`Buka link: ${decodedText}?`);
                if (confirmOpen) {
                    window.open(decodedText, '_blank');
                    window.location.reload(); // Reset scanner
                } else {
                    window.location.reload();
                }
                return;
            }

            // 2. QRIS Check (Standard QRIS usually starts with 000201)
            if (decodedText.startsWith('000201')) {
                alert('Fitur Bayar QRIS (Outbound) belum tersedia saat ini. Silakan gunakan aplikasi e-wallet utama Anda.');
                window.location.reload();
                return;
            }

            // 3. Default: Voucher SN / Phone Number -> Aktivasi
            router.push(`/aktivasi?sn=${encodeURIComponent(decodedText)}`);
        }, 500);
    };

    const onScanFailure = (error: any) => {
        // handle scan failure, usually better to ignore and keep scanning.
        // console.warn(`Code scan error = ${error}`);
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col">
            {/* Header */}
            <div className="p-6 flex items-center justify-between z-10">
                <Link href="/" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-lg font-bold">Scan QR / Barcode</h1>
                <div className="w-10" />
            </div>

            {/* Scanner Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
                <div id="reader" className="w-full max-w-sm overflow-hidden rounded-3xl border-2 border-neutral-800 bg-neutral-900"></div>

                {/* Overlay Guide */}
                {!scanResult && (
                    <p className="mt-8 text-neutral-400 text-sm text-center max-w-xs">
                        Arahkan kamera ke QR Code atau Barcode Voucher untuk memindai otomatis.
                    </p>
                )}

                {scanResult && (
                    <div className="mt-8 bg-[#bef264] text-black px-6 py-3 rounded-xl font-bold animate-pulse">
                        Kode Terdeteksi: {scanResult}
                    </div>
                )}
            </div>

            <style jsx global>{`
                #reader__scan_region {
                    background: transparent !important;
                }
                #reader__dashboard_section_csr span {
                    display: none !important;
                } 
                #reader__dashboard_section_swaplink {
                    display: none !important; 
                }
                /* Customize HTML5-QRCode Buttons */
                #reader button {
                    background-color: #bef264 !important;
                    color: black !important;
                    padding: 8px 16px !important;
                    border-radius: 8px !important;
                    border: none !important;
                    font-weight: bold !important;
                    margin-top: 10px !important;
                }
                #reader select {
                    background-color: #262626 !important;
                    color: white !important;
                    border: 1px solid #404040 !important;
                    padding: 8px !important;
                    border-radius: 8px !important;
                    margin-bottom: 10px !important;
                }
            `}</style>
        </div>
    );
}
