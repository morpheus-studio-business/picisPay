import { motion } from 'framer-motion';
import { ChevronLeft, MessageCircle, Phone, Mail, HelpCircle, ChevronRight, Send } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

useEffect(() => {
    const fetchConfig = async () => {
        try {
            const res = await fetch('/api/config');
            const json = await res.json();
            if (json.success) {
                const waConfig = json.data.find((c: any) => c.key === 'wa_admin');
                const tgConfig = json.data.find((c: any) => c.key === 'telegram_admin');
                if (waConfig) setWaNumber(waConfig.value);
                if (tgConfig) setTelegramUsername(tgConfig.value);
            }
        } catch (error) {
            console.error("Failed to fetch config", error);
        }
    };
    fetchConfig();
}, []);

const handleWaClick = () => {
    const number = waNumber || '6281234567890';
    window.open(`https://wa.me/${number}`, '_blank');
};

const handleTelegramClick = () => {
    if (!telegramUsername) return;
    // Handle "https://t.me/username" or just "username"
    const username = telegramUsername.replace('https://t.me/', '').replace('@', '');
    window.open(`https://t.me/${username}`, '_blank');
};

// Logic to determine layout
const showWa = !!waNumber;
const showTg = !!telegramUsername;
// Default to WA if neither is set (fallback mode)
const isFallback = !showWa && !showTg;

// If fallback, show WA dummy. If specific one set, show it. If both, show both.
const shouldShowWa = showWa || isFallback;
const shouldShowTg = showTg;

const gridCols = (shouldShowWa && shouldShowTg) ? 'grid-cols-2' : 'grid-cols-1';

return (
    <div className="min-h-screen bg-black text-white pb-24 font-sans">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4 flex items-center gap-4">
            <Link href="/" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors">
                <ChevronLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-lg font-bold">Bantuan & Support</h1>
        </header>

        {/* Hero Section */}
        <div className="px-6 py-8 text-center">
            <div className="w-20 h-20 bg-[#bef264]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-10 h-10 text-[#bef264]" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Butuh Bantuan?</h2>
            <p className="text-neutral-400 text-sm">Tim support kami siap membantu Anda 24/7. Pilih metode dibawah ini.</p>
        </div>

        {/* Contact Options */}
        <div className="px-6 space-y-4">
            {/* Dynamic Grid for Chat Options */}
            <div className={`grid ${gridCols} gap-4`}>
                {shouldShowWa && (
                    <motion.div
                        onClick={handleWaClick}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-[#bef264] text-black rounded-3xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-[#bef264]/90 transition-colors text-center aspect-[4/3] sm:aspect-auto sm:flex-row sm:text-left shadow-lg shadow-[#bef264]/10"
                    >
                        <div className="w-12 h-12 bg-black/10 rounded-2xl flex items-center justify-center mb-1 sm:mb-0">
                            <MessageCircle className="w-6 h-6 fill-current text-black" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold leading-tight">WhatsApp</h3>
                            <p className="text-[10px] text-black/70 leading-tight">Respon Cepat</p>
                        </div>
                    </motion.div>
                )}

                {shouldShowTg && (
                    <motion.div
                        onClick={handleTelegramClick}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-[#229ED9] text-white rounded-3xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-[#229ED9]/90 transition-colors text-center aspect-[4/3] sm:aspect-auto sm:flex-row sm:text-left shadow-lg shadow-[#229ED9]/20"
                    >
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-1 sm:mb-0">
                            <Send className="w-6 h-6 fill-current text-white -ml-0.5 mt-0.5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold leading-tight">Telegram</h3>
                            <p className="text-[10px] text-white/80 leading-tight">Alternative</p>
                        </div>
                    </motion.div>
                )}
            </div>

            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 flex items-center gap-4 cursor-pointer hover:border-[#bef264]/50 transition-colors"
            >
                <div className="w-12 h-12 bg-neutral-800 rounded-2xl flex items-center justify-center text-white">
                    <Mail className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold">Email Support</h3>
                    <p className="text-xs text-neutral-500">support@picispay.id</p>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-600" />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 flex items-center gap-4 cursor-pointer hover:border-[#bef264]/50 transition-colors"
            >
                <div className="w-12 h-12 bg-neutral-800 rounded-2xl flex items-center justify-center text-white">
                    <Phone className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold">Call Center</h3>
                    <p className="text-xs text-neutral-500">021-555-0123</p>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-600" />
            </motion.div>
        </div>

        {/* FAQ Link */}
        <div className="px-6 mt-8">
            <div className="bg-neutral-900/50 rounded-2xl p-4 flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-neutral-400" />
                <p className="text-sm text-neutral-400 flex-1">Punya pertanyaan umum?</p>
                <span className="text-sm font-bold text-[#bef264] cursor-pointer">Lihat FAQ</span>
            </div>
        </div>
    </div>
);
}
