'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, Wallet, Loader2, QrCode, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { useSession } from '@/lib/auth-client';

const amounts = [
    { value: 10000, label: '10.000' },
    { value: 20000, label: '20.000' },
    { value: 50000, label: '50.000' },
    { value: 100000, label: '100.000' },
    { value: 250000, label: '250.000' },
    { value: 500000, label: '500.000' },
];

const paymentMethods = [
    { id: 'qris', name: 'QRIS', icon: QrCode, desc: 'Scan dengan e-wallet' },
];

interface PaymentData {
    order_id: string;
    amount: number;
    fee: number;
    total_payment: number;
    payment_method: string;
    payment_number: string;
    expired_at: string;
}

export default function TopUpPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [selectedAmount, setSelectedAmount] = useState(0);
    const [selectedMethod, setSelectedMethod] = useState('qris');
    const [loading, setLoading] = useState(false);
    const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
    const [error, setError] = useState('');
    const [userBalance, setUserBalance] = useState(0);

    // Fetch current user balance
    useEffect(() => {
        if (session?.user) {
            setUserBalance((session.user as any).balance || 0);
        }
    }, [session]);

    const minimumTopup = 10000;

    const handleTopUp = async () => {
        if (selectedAmount < minimumTopup) {
            setError(`Minimum top-up Rp ${minimumTopup.toLocaleString('id-ID')}`);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/pakasir', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: selectedAmount,
                    payment_method: selectedMethod,
                }),
            });

            const data = await res.json();

            if (data.success) {
                setPaymentData(data.data);
            } else {
                setError(data.error || 'Gagal membuat pembayaran');
            }
        } catch (err) {
            setError('Terjadi kesalahan');
        } finally {
            setLoading(false);
        }
    };

    const resetPayment = () => {
        setPaymentData(null);
        setSelectedAmount(0);
    };

    // Payment Success Screen
    if (paymentData) {
        return (
            <div className="min-h-screen bg-black text-white pb-24 font-sans">
                <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4 flex items-center gap-4">
                    <button onClick={resetPayment} className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg font-bold">Pembayaran</h1>
                </header>

                <div className="px-6 py-6">
                    {/* Payment URL Redirection Mode */}
                    <div className="bg-white rounded-3xl p-6 mb-6 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-[#bef264] rounded-full flex items-center justify-center mb-4">
                            <Wallet className="w-8 h-8 text-black" />
                        </div>
                        <h2 className="text-black font-bold text-xl mb-2">Scan QRIS</h2>
                        <p className="text-neutral-600 text-sm mb-6 max-w-xs">
                            Scan QR Code di bawah ini menggunakan e-wallet (GoPay, OVO, Dana, dll) atau M-Banking.
                        </p>

                        <div className="bg-white p-4 rounded-xl border-2 border-dashed border-neutral-300 mb-6">
                            <QRCodeSVG
                                value={paymentData.payment_number}
                                size={220}
                                level='M'
                                includeMargin={true}
                            />
                        </div>

                        <p className="text-black font-extrabold text-3xl mb-2">
                            Rp {paymentData.total_payment.toLocaleString('id-ID')}
                        </p>
                        <p className="text-xs text-neutral-500 mb-4">Total Pembayaran</p>

                        <div className="w-full bg-yellow-50 text-yellow-800 text-xs px-4 py-3 rounded-xl border border-yellow-200">
                            ⚠️ Pembayaran akan otomatis terdeteksi dalam 1-5 menit. Jangan tutup halaman ini sebelum pembayaran berhasil.
                        </div>
                    </div>

                    {/* Order Info */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3 mb-6">
                        <div className="flex justify-between text-sm">
                            <span className="text-neutral-500">Order ID</span>
                            <span className="font-mono text-xs text-white">{paymentData.order_id}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-neutral-500">Nominal</span>
                            <span>Rp {paymentData.amount.toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6">
                        <button
                            onClick={async () => {
                                if (!paymentData) return;

                                const btn = document.getElementById('btn-check-status') as HTMLButtonElement;
                                if (btn) btn.disabled = true;
                                const originalText = btn ? btn.innerText : '';
                                if (btn) btn.innerText = 'Memeriksa...';

                                try {
                                    // Call our internal API which checks Pakasir
                                    const res = await fetch(`/api/pakasir/status?order_id=${paymentData.order_id}&amount=${paymentData.total_payment}`);
                                    const data = await res.json();

                                    if (data.success && data.data) {
                                        const status = data.data.status;
                                        if (status === 'success' || status === 'paid' || status === 'completed') {
                                            alert('✅ Pembayaran Berhasil! Saldo telah ditambahkan.');
                                            router.refresh(); // Refresh to update balance in UI
                                            resetPayment();
                                        } else if (status === 'mismatch') {
                                            alert('⚠️ Pembayaran terdeteksi namun nominal tidak sesuai. Hubungi Admin.');
                                        } else {
                                            alert('⏳ Pembayaran belum terkonfirmasi. Silakan tunggu beberapa saat lagi.');
                                        }
                                    } else {
                                        alert('⏳ Belum ada pembayaran masuk. Pastikan nominal transfer sesuai.');
                                    }
                                } catch (err) {
                                    console.error(err);
                                    alert('Gagal mengecek status. Silakan coba lagi.');
                                } finally {
                                    if (btn) {
                                        btn.disabled = false;
                                        btn.innerText = originalText;
                                    }
                                }
                            }}
                            id="btn-check-status"
                            className="w-full bg-neutral-800 border border-neutral-700 text-white font-semibold rounded-2xl py-4 hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            🔄 Saya Sudah Bayar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pb-24 font-sans">
            <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4 flex items-center gap-4">
                <Link href="/" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-lg font-bold">Isi Saldo</h1>
            </header>

            <div className="px-6 py-6">
                {/* Current Balance */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 mb-8 text-center">
                    <h2 className="text-neutral-500 text-sm font-medium mb-1">Saldo Saat Ini</h2>
                    <p className="text-3xl font-black text-white">Rp 0</p>
                </div>

                {/* Select Amount */}
                <h3 className="font-bold mb-4 text-sm tracking-widest text-neutral-500 uppercase">Pilih Nominal</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    {amounts.map((amt) => (
                        <button
                            key={amt.value}
                            onClick={() => setSelectedAmount(amt.value)}
                            className={`p-4 rounded-2xl border transition-all font-bold text-lg
                    ${selectedAmount === amt.value
                                    ? 'bg-[#bef264] text-black border-[#bef264]'
                                    : 'bg-neutral-900 border-neutral-800 text-white hover:border-[#bef264]/50'}`}
                        >
                            {amt.label}
                        </button>
                    ))}
                </div>

                {/* Custom Amount */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 mb-6">
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">Nominal Lainnya</label>
                    <div className="flex items-center gap-3">
                        <span className="text-white font-bold text-xl">Rp</span>
                        <input
                            type="number"
                            placeholder="0"
                            value={selectedAmount || ''}
                            onChange={(e) => setSelectedAmount(Number(e.target.value))}
                            className="w-full bg-transparent text-white focus:outline-none font-bold text-2xl"
                        />
                    </div>
                </div>

                {/* Payment Method */}
                <h3 className="font-bold mb-4 text-sm tracking-widest text-neutral-500 uppercase">Metode Pembayaran</h3>
                <div className="space-y-3 mb-8">
                    {paymentMethods.map((method) => (
                        <button
                            key={method.id}
                            onClick={() => setSelectedMethod(method.id)}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${selectedMethod === method.id
                                ? 'bg-[#bef264]/10 border-[#bef264]'
                                : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedMethod === method.id ? 'bg-[#bef264] text-black' : 'bg-neutral-800'}`}>
                                <method.icon className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold">{method.name}</p>
                                <p className="text-xs text-neutral-500">{method.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl mb-4 text-sm">
                        {error}
                    </div>
                )}

                {/* Submit */}
                <button
                    onClick={handleTopUp}
                    disabled={loading || selectedAmount < 10000}
                    className="w-full bg-[#bef264] text-black font-bold rounded-2xl py-4 hover:bg-[#bef264]/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            <Wallet className="w-5 h-5" />
                            Lanjut Pembayaran
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
