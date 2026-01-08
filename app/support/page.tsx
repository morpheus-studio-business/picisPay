'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, MessageCircle, Phone, Mail, HelpCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function SupportPage() {
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
                <motion.a
                    href="https://wa.me/"
                    target="_blank"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-[#bef264] text-black rounded-3xl p-5 flex items-center gap-4 cursor-pointer hover:bg-[#bef264]/90 transition-colors"
                >
                    <div className="w-12 h-12 bg-black/10 rounded-2xl flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 fill-current text-black" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold">Chat WhatsApp</h3>
                        <p className="text-xs text-black/70">Respon cepat (Recommended)</p>
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-70" />
                </motion.a>

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
