'use client';

import { Html5Qrcode } from 'html5-qrcode';
import { Camera, ChevronLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function ScanPage() {
    const router = useRouter();
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);

    const startScanner = async () => {
        try {
            setError(null);

            // Check if camera is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setError('Kamera tidak didukung di browser ini');
                return;
            }

            const html5Qrcode = new Html5Qrcode("reader");
            scannerRef.current = html5Qrcode;

            // Try to get back camera first (for mobile)
            const cameras = await Html5Qrcode.getCameras();

            if (cameras.length === 0) {
                setError('Tidak ada kamera yang terdeteksi');
                return;
            }

            // Prefer back camera on mobile
            const backCamera = cameras.find(cam =>
                cam.label.toLowerCase().includes('back') ||
                cam.label.toLowerCase().includes('belakang') ||
                cam.label.toLowerCase().includes('rear')
            );

            const cameraId = backCamera?.id || cameras[0].id;

            await html5Qrcode.start(
                cameraId,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                },
                (decodedText) => {
                    // On scan success
                    html5Qrcode.stop().then(() => {
                        setIsScanning(false);
                        setScanResult(decodedText);
                        handleScanResult(decodedText);
                    }).catch(console.error);
                },
                () => { } // Ignore scan failures
            );

            setIsScanning(true);
        } catch (err: any) {
            console.error('Camera error:', err);
            if (err.message?.includes('Permission denied') || err.name === 'NotAllowedError') {
                setError('Izin kamera ditolak. Silakan izinkan akses kamera di pengaturan browser.');
            } else if (err.message?.includes('NotReadableError')) {
                setError('Kamera sedang digunakan oleh aplikasi lain.');
            } else {
                setError(`Gagal memulai kamera: ${err.message || 'Unknown error'}`);
            }
        }
    };

    const handleScanResult = (decodedText: string) => {
        setTimeout(() => {
            // 1. URL Check
            if (decodedText.startsWith('http')) {
                const confirmOpen = window.confirm(`Buka link: ${decodedText}?`);
                if (confirmOpen) {
                    window.open(decodedText, '_blank');
                }
                return;
            }

            // 2. QRIS Check (Standard QRIS usually starts with 000201)
            if (decodedText.startsWith('000201')) {
                alert('Fitur Bayar QRIS (Outbound) belum tersedia saat ini. Silakan gunakan aplikasi e-wallet utama Anda.');
                return;
            }

            // 3. Default: Voucher SN / Phone Number -> Aktivasi
            router.push(`/aktivasi?sn=${encodeURIComponent(decodedText)}`);
        }, 500);
    };

    const stopScanner = async () => {
        if (scannerRef.current && isScanning) {
            try {
                await scannerRef.current.stop();
                setIsScanning(false);
            } catch (err) {
                console.error('Failed to stop scanner:', err);
            }
        }
    };

    const resetScanner = () => {
        setScanResult(null);
        setError(null);
    };

    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => { });
            }
        };
    }, []);

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
                {/* Scanner Container */}
                <div id="reader" className="w-full max-w-sm min-h-[300px] overflow-hidden rounded-3xl border-2 border-neutral-800 bg-neutral-900"></div>

                {/* Error Message */}
                {error && (
                    <div className="mt-4 bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-xl text-sm text-center max-w-sm">
                        {error}
                    </div>
                )}

                {/* Start Button (if not scanning) */}
                {!isScanning && !scanResult && (
                    <button
                        onClick={startScanner}
                        className="mt-8 bg-[#bef264] text-black px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-[#a3d74f] transition-colors"
                    >
                        <Camera className="w-6 h-6" />
                        Mulai Scan
                    </button>
                )}

                {/* Scanning indicator */}
                {isScanning && !scanResult && (
                    <p className="mt-8 text-neutral-400 text-sm text-center max-w-xs">
                        Arahkan kamera ke QR Code atau Barcode Voucher untuk memindai otomatis.
                    </p>
                )}

                {/* Scan Result */}
                {scanResult && (
                    <div className="mt-8 flex flex-col items-center gap-4">
                        <div className="bg-[#bef264] text-black px-6 py-3 rounded-xl font-bold">
                            Kode Terdeteksi: {scanResult}
                        </div>
                        <button
                            onClick={resetScanner}
                            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Scan Lagi
                        </button>
                    </div>
                )}
            </div>

            <style jsx global>{`
                #reader video {
                    border-radius: 1.5rem !important;
                }
                #reader__scan_region {
                    background: transparent !important;
                }
            `}</style>
        </div>
    );
}
