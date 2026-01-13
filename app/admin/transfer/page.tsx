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
        setIsLoading(false);

        // Reset form NOT immediately after success so we can show receipt details
        // You might want to reset explicitly when closing modal or simulating new transfer
        // setFormData({ ... });
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
                        placeholder=""
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-[#bef264] transition-colors"
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
                        placeholder=""
                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-[#bef264] transition-colors uppercase"
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
            </form>

            {/* Receipt Modal */}
            {result && result.success && (
                <div className="mt-6 flex justify-center">
                    <button
                        onClick={() => {
                            const modal = document.getElementById("receipt-modal");
                            if (modal) modal.style.display = "flex";
                        }}
                        className="text-[#bef264] hover:text-[#a8d64f] underline text-sm"
                    >
                        Lihat Bukti Transfer
                    </button>
                </div>
            )}

            <div
                id="receipt-modal"
                className="fixed inset-0 z-50 hidden items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        e.currentTarget.style.display = "none";
                    }
                }}
            >
                <div className="bg-white text-black w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                    {/* Header */}
                    <div className="bg-[#bef264] p-6 text-center relative">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <CheckCircle className="w-8 h-8 text-[#bef264]" />
                        </div>
                        <h2 className="text-xl font-bold uppercase tracking-wider">Transfer Berhasil</h2>
                        <p className="text-xs font-mono mt-1 opacity-75">
                            {new Date().toLocaleString("id-ID", {
                                day: "numeric", month: "long", year: "numeric",
                                hour: "2-digit", minute: "2-digit", second: "2-digit"
                            })}
                        </p>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6 relative bg-white">
                        {/* Cutout effect */}
                        <div className="absolute top-0 left-0 w-4 h-4 rounded-br-full bg-black/80 -mt-2 -ml-2"></div>
                        <div className="absolute top-0 right-0 w-4 h-4 rounded-bl-full bg-black/80 -mt-2 -mr-2"></div>

                        <div className="text-center">
                            <p className="text-neutral-500 text-xs uppercase tracking-widest mb-1">Total Transfer</p>
                            <h3 className="text-3xl font-bold text-neutral-900">
                                Rp {result?.message.split("Rp ")[1]?.split(" ")[0]}
                            </h3>
                        </div>

                        <hr className="border-dashed border-neutral-300" />

                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Ref ID</span>
                                <span className="font-mono font-medium">{result?.referenceId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Bank Tujuan</span>
                                <span className="font-bold text-right">{banks.find(b => b.code === formData.bankCode)?.name || formData.bankCode}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Rekening</span>
                                <span className="font-mono text-right">{formData.accountNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Penerima</span>
                                <span className="font-bold text-right uppercase">{formData.accountName}</span>
                            </div>
                            {formData.notes && (
                                <div className="flex justify-between">
                                    <span className="text-neutral-500">Catatan</span>
                                    <span className="text-right italic text-neutral-600 max-w-[150px] truncate">{formData.notes}</span>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 text-center">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <div className="w-2 h-2 rounded-full bg-[#bef264]"></div>
                                <span className="font-bold tracking-widest text-neutral-400">PICISPAY</span>
                                <div className="w-2 h-2 rounded-full bg-[#bef264]"></div>
                            </div>
                            <p className="text-[10px] text-neutral-400">
                                Bukti transfer ini sah dan diterbitkan oleh sistem Picispay.
                            </p>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-neutral-50 p-4 border-t border-neutral-100 flex gap-3">
                        <button
                            onClick={() => {
                                // Close modal
                                const modal = document.getElementById("receipt-modal");
                                if (modal) modal.style.display = "none";
                            }}
                            className="flex-1 py-3 text-sm font-bold text-neutral-500 hover:text-neutral-800 transition-colors"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
}
