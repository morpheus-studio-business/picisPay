"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";

const banks = [
    { code: "BCA", name: "Bank Central Asia" },
    { code: "BRI", name: "Bank Rakyat Indonesia" },
    { code: "BNI", name: "Bank Negara Indonesia" },
    { code: "MANDIRI", name: "Bank Mandiri" },
    { code: "BSI", name: "Bank Syariah Indonesia" },
    { code: "CIMB", name: "CIMB Niaga" },
    { code: "DANAMON", name: "Bank Danamon" },
    { code: "PERMATA", name: "Permata Bank" },
    { code: "GOPAY", name: "GoPay" },
    { code: "OVO", name: "OVO" },
    { code: "DANA", name: "DANA" },
    { code: "SHOPEEPAY", name: "ShopeePay" },
];

interface TransferResult {
    success: boolean;
    message: string;
    referenceId?: string;
}

export default function AdminTransferPage() {
    const [formData, setFormData] = useState({
        bankCode: "",
        accountNumber: "",
        accountName: "",
        amount: "",
        notes: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<TransferResult | null>(null);

    const formatCurrency = (value: string) => {
        const number = value.replace(/\D/g, "");
        return new Intl.NumberFormat("id-ID").format(Number(number));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResult(null);

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Generate fake reference ID
        const refId = `TRF${Date.now().toString(36).toUpperCase()}`;

        // For now, just simulate success (in production, this would call a real disbursement API)
        setResult({
            success: true,
            message: `Transfer sebesar Rp ${formatCurrency(formData.amount)} ke ${formData.accountName} berhasil diproses!`,
            referenceId: refId,
        });

        setIsLoading(false);

        // Reset form after success
        setFormData({
            bankCode: "",
            accountNumber: "",
            accountName: "",
            amount: "",
            notes: "",
        });
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Send className="text-[#bef264]" />
                    Kirim Dana
                </h1>
                <p className="text-neutral-400 mt-1">
                    Transfer dana ke rekening bank atau e-wallet
                </p>
            </div>

            {/* Result Alert */}
            {result && (
                <div
                    className={`mb-6 p-4 rounded-xl border ${result.success
                            ? "bg-green-500/10 border-green-500/30 text-green-400"
                            : "bg-red-500/10 border-red-500/30 text-red-400"
                        }`}
                >
                    <div className="flex items-start gap-3">
                        {result.success ? (
                            <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />
                        ) : (
                            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                        )}
                        <div>
                            <p className="font-medium">{result.message}</p>
                            {result.referenceId && (
                                <p className="text-sm mt-1 opacity-75">
                                    Reference ID: {result.referenceId}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Transfer Form */}
            <form
                onSubmit={handleSubmit}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5"
            >
                {/* Bank Selection */}
                <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Bank / E-Wallet Tujuan
                    </label>
                    <select
                        value={formData.bankCode}
                        onChange={(e) =>
                            setFormData({ ...formData, bankCode: e.target.value })
                        }
                        required
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-[#bef264] transition-colors"
                    >
                        <option value="">Pilih Bank / E-Wallet</option>
                        {banks.map((bank) => (
                            <option key={bank.code} value={bank.code}>
                                {bank.name} ({bank.code})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Account Number */}
                <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Nomor Rekening / HP
                    </label>
                    <input
                        type="text"
                        value={formData.accountNumber}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                accountNumber: e.target.value.replace(/\D/g, ""),
                            })
                        }
                        required
                        placeholder="Contoh: 1234567890"
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#bef264] transition-colors"
                    />
                </div>

                {/* Account Name */}
                <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Nama Penerima
                    </label>
                    <input
                        type="text"
                        value={formData.accountName}
                        onChange={(e) =>
                            setFormData({ ...formData, accountName: e.target.value })
                        }
                        required
                        placeholder="Contoh: JOHN DOE"
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#bef264] transition-colors uppercase"
                    />
                </div>

                {/* Amount */}
                <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Jumlah Transfer
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                            Rp
                        </span>
                        <input
                            type="text"
                            value={formatCurrency(formData.amount)}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    amount: e.target.value.replace(/\D/g, ""),
                                })
                            }
                            required
                            placeholder="0"
                            className="w-full pl-12 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-right font-mono text-lg placeholder:text-neutral-500 focus:outline-none focus:border-[#bef264] transition-colors"
                        />
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Catatan (Opsional)
                    </label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) =>
                            setFormData({ ...formData, notes: e.target.value })
                        }
                        rows={2}
                        placeholder="Berita transfer..."
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#bef264] transition-colors resize-none"
                    />
                </div>

                {/* Summary */}
                {formData.bankCode && formData.accountNumber && formData.amount && (
                    <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-4 space-y-2 text-sm">
                        <div className="flex justify-between text-neutral-400">
                            <span>Bank Tujuan</span>
                            <span className="text-white font-medium">
                                {banks.find((b) => b.code === formData.bankCode)?.name}
                            </span>
                        </div>
                        <div className="flex justify-between text-neutral-400">
                            <span>Rekening</span>
                            <span className="text-white font-mono">
                                {formData.accountNumber}
                            </span>
                        </div>
                        <div className="flex justify-between text-neutral-400">
                            <span>Nama</span>
                            <span className="text-white uppercase">
                                {formData.accountName || "-"}
                            </span>
                        </div>
                        <hr className="border-neutral-700" />
                        <div className="flex justify-between text-lg font-bold">
                            <span className="text-neutral-300">Total Transfer</span>
                            <span className="text-[#bef264]">
                                Rp {formatCurrency(formData.amount)}
                            </span>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-[#bef264] text-black font-bold rounded-xl hover:bg-[#a8d64f] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Memproses...
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            Kirim Dana Sekarang
                        </>
                    )}
                </button>

                <p className="text-xs text-neutral-500 text-center">
                    ⚠️ Ini adalah fitur percobaan. Transaksi tidak akan diproses secara nyata.
                </p>
            </form>
        </div>
    );
}
