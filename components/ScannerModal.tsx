'use client';

import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScanSuccess: (code: string) => void;
}

export default function ScannerModal({ isOpen, onClose, onScanSuccess }: ScannerModalProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);

    const startScanner = async () => {
        try {
            setError(null);

            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setError('Kamera tidak didukung di browser ini');
                return;
            }

            const html5Qrcode = new Html5Qrcode("scanner-reader");
            scannerRef.current = html5Qrcode;

            // Langsung start dengan facingMode - lebih cepat dari getCameras()
            await html5Qrcode.start(
                { facingMode: "environment" }, // Langsung pakai kamera belakang
                {
                    fps: 30, // Tinggi = lebih responsif
                    qrbox: { width: 280, height: 150 }, // Wider untuk barcode
                    aspectRatio: 1.0,
                },
                (decodedText) => {
                    html5Qrcode.stop().then(() => {
                        setIsScanning(false);
                        onScanSuccess(decodedText);
                        onClose();
                    }).catch(console.error);
                },
                () => { }
            );

            setIsScanning(true);
        } catch (err: any) {
            console.error('Camera error:', err);
            if (err.message?.includes('Permission denied') || err.name === 'NotAllowedError') {
                setError('Izin kamera ditolak. Izinkan akses kamera di pengaturan browser.');
            } else {
                setError(`Gagal memulai kamera: ${err.message || 'Unknown error'}`);
            }
        }
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

    useEffect(() => {
        if (!isOpen) {
            stopScanner();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <h2 className="text-white font-bold">Scan Kode Voucher</h2>
                <button
                    onClick={() => {
                        stopScanner();
                        onClose();
                    }}
                    className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-white"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Scanner */}
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div id="scanner-reader" className="w-full max-w-xs min-h-[250px] rounded-2xl overflow-hidden bg-neutral-900"></div>

                {error && (
                    <div className="mt-4 bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-xl text-sm text-center">
                        {error}
                    </div>
                )}

                {!isScanning && (
                    <button
                        onClick={startScanner}
                        className="mt-6 bg-[#bef264] text-black px-8 py-4 rounded-2xl font-bold flex items-center gap-3"
                    >
                        <Camera className="w-6 h-6" />
                        Mulai Scan
                    </button>
                )}

                {isScanning && (
                    <p className="mt-4 text-neutral-400 text-sm text-center">
                        Arahkan kamera ke kode voucher
                    </p>
                )}
            </div>

            <style jsx global>{`
                #scanner-reader video {
                    border-radius: 1rem !important;
                }
            `}</style>
        </div>
    );
}
