'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, Gamepad2, Ticket, CreditCard } from 'lucide-react';
import Link from 'next/link';

const gameMenus = [
    {
        id: 1,
        name: 'Top Up Games',
        description: 'Top up langsung ke akun game (ML, FF, PUBG, dll)',
        icon: Gamepad2,
        href: '/games/topup',
        color: 'bg-neutral-800',
    },
    {
        id: 2,
        name: 'Voucher Games',
        description: 'Voucher code game (Garena, Unipin, Razer Gold, dll)',
        icon: Ticket,
        href: '/games/voucher',
        color: 'bg-neutral-800',
    },
    {
        id: 3,
        name: 'Voucher Platform',
        description: 'Google Play, Xbox, PlayStation, Steam, iTunes',
        icon: CreditCard,
        href: '/games/platform',
        color: 'bg-neutral-800',
    },
];

export default function GamesPage() {
    return (
        <div className="min-h-screen bg-black text-white pb-24 font-sans">
            <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-6 pt-8 pb-4 flex items-center gap-4">
                <Link href="/" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white hover:bg-[#bef264] hover:text-black transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-lg font-bold">Games</h1>
            </header>

            <div className="px-6 py-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">
                    Pilih Kategori
                </h3>

                <div className="flex flex-col gap-4">
                    {gameMenus.map((menu, idx) => (
                        <Link href={menu.href} key={menu.id} className="block">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 cursor-pointer hover:border-[#bef264] hover:bg-neutral-800 transition-all group flex items-center gap-4"
                            >
                                <div className={`w-14 h-14 ${menu.color} rounded-2xl flex items-center justify-center shrink-0`}>
                                    <menu.icon className="w-7 h-7 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-white text-base group-hover:text-[#bef264]">{menu.name}</h3>
                                    <p className="text-xs text-neutral-500 mt-1">{menu.description}</p>
                                </div>
                                <ChevronLeft className="w-5 h-5 text-neutral-600 rotate-180" />
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
