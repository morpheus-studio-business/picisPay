"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Bell } from "lucide-react";
import { useState, useEffect } from "react";

export function SiteHeader() {
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        // Simple fetch for notification count if needed, or just static for now
        // We can duplicate the fetch logic or keep it simple
        if (session?.user) {
            fetch('/api/notifications')
                .then(res => res.json())
                .then(data => {
                    if (data.success) setNotifications(data.data);
                })
                .catch(err => console.error(err));
        }
    }, [session]);

    return (
        <nav className="hidden md:flex items-center justify-between px-8 py-5 bg-black border-b border-white/10 sticky top-0 z-30 backdrop-blur-md bg-opacity-80">
            <div className="flex items-center gap-12">
                <Link href="/" className="text-2xl font-bold tracking-tighter text-white">
                    picis<span className="text-[#bef264]">Pay</span>
                </Link>
                <div className="flex gap-6 text-sm font-medium text-neutral-400">
                    <Link href="/" className="text-white hover:text-[#bef264] transition-colors">Home</Link>
                    <Link href="/history" className="hover:text-[#bef264] transition-colors">Riwayat</Link>
                    <Link href="/mutasi" className="hover:text-[#bef264] transition-colors">Mutasi</Link>
                    <Link href="/support" className="hover:text-[#bef264] transition-colors">Bantuan</Link>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <Link href="/notifications" className="relative cursor-pointer hover:opacity-80 transition-opacity">
                    <Bell className="w-5 h-5 text-neutral-400" />
                    {notifications.length > 0 && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-lime-400 rounded-full border-2 border-black"></div>}
                </Link>
                {session?.user ? (
                    <Link href="/profile" className="flex items-center gap-3 pl-6 border-l border-white/10">
                        <div className="text-right hidden lg:block">
                            <p className="text-xs text-neutral-400">Halo,</p>
                            <p className="text-sm font-bold text-white">{session.user.name}</p>
                        </div>
                        <div className="w-9 h-9 bg-[#bef264] rounded-full flex items-center justify-center text-black font-bold">
                            {session.user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                    </Link>
                ) : (
                    <Link href="/login" className="text-sm font-bold text-[#bef264] hover:text-[#bef264]/80 transition-colors">
                        Masuk / Daftar
                    </Link>
                )}
            </div>
        </nav>
    );
}
