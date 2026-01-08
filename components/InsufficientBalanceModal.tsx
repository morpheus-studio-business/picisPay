'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface InsufficientBalanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentBalance?: number;
    requiredAmount?: number;
}

export default function InsufficientBalanceModal({
    isOpen,
    onClose,
    currentBalance = 0,
    requiredAmount = 0
}: InsufficientBalanceModalProps) {
    const router = useRouter();

    const handleTopUp = () => {
        onClose();
        router.push('/topup');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-sm"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Title */}
                        <h2 className="text-xl font-bold text-white text-center mb-2">
                            Saldo Tidak Cukup
                        </h2>

                        {/* Description */}
                        <p className="text-neutral-400 text-sm text-center mb-6">
                            Saldo kamu tidak mencukupi untuk melakukan transaksi ini. Silakan isi saldo terlebih dahulu.
                        </p>

                        {/* Balance Info */}
                        {(currentBalance > 0 || requiredAmount > 0) && (
                            <div className="bg-neutral-800 rounded-xl p-4 mb-6 space-y-2">
                                {currentBalance > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-400">Saldo Saat Ini</span>
                                        <span className="text-white font-medium">
                                            Rp {currentBalance.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                )}
                                {requiredAmount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-400">Harga Produk</span>
                                        <span className="text-white font-medium">
                                            Rp {requiredAmount.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                )}
                                {currentBalance > 0 && requiredAmount > 0 && (
                                    <div className="flex justify-between text-sm pt-2 border-t border-neutral-700">
                                        <span className="text-neutral-400">Kekurangan</span>
                                        <span className="text-red-400 font-medium">
                                            Rp {(requiredAmount - currentBalance).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 px-4 rounded-xl bg-neutral-800 text-white font-medium hover:bg-neutral-700 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleTopUp}
                                className="flex-1 py-3 px-4 rounded-xl bg-[#bef264] text-black font-bold hover:bg-[#a8d94e] transition-colors"
                            >
                                Isi Saldo
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
