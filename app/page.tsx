"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import {
  Bell,
  Clock,
  FileText,
  Gamepad2,
  Gift,
  Headphones,
  History,
  Home as HomeIcon,
  Plus,
  QrCode,
  Smartphone,
  Tv,
  User,
  Wallet,
  Zap,
  Wifi,
  Globe,
  Info,
  X,
  Trash2,
  Ticket
} from "lucide-react";

// Provider HP - link ke halaman provider dengan menu layanan
const mobileProviders = [
  { id: 1, name: "Telkomsel", brand: "TELKOMSEL", href: "/provider/telkomsel", color: "bg-red-600", image: "/provider/tsel.png" },
  { id: 2, name: "Indosat", brand: "INDOSAT", href: "/provider/indosat", color: "bg-yellow-500", image: "/provider/indosat.png" },
  { id: 3, name: "XL", brand: "XL", href: "/provider/xl", color: "bg-blue-600", image: "/provider/xl.png" },
  { id: 4, name: "Axis", brand: "AXIS", href: "/provider/axis", color: "bg-purple-600", image: "/provider/axis.png" },
  { id: 5, name: "Tri", brand: "THREE", href: "/provider/three", color: "bg-black", image: "/provider/tri.png" },
  { id: 6, name: "Smartfren", brand: "SMARTFREN", href: "/provider/smartfren", color: "bg-pink-600", image: "/provider/smartfren.png" },
  { id: 7, name: "By.U", brand: "BY.U", href: "/provider/byu", color: "bg-purple-500", image: "/provider/byu.png" },
];

// Layanan lainnya - langsung ke halaman masing-masing
const otherServices = [
  { id: 1, name: "Pulsa", icon: Smartphone, href: "/pulsa" },
  { id: 2, name: "E-Wallet", icon: Wallet, href: "/ewallet" },
  { id: 3, name: "Games", icon: Gamepad2, href: "/games" },
  { id: 4, name: "PLN", icon: Zap, href: "/pln" },
  { id: 5, name: "TV Kabel", icon: Tv, href: "/tv" },
  { id: 6, name: "Streaming", icon: Globe, href: "/streaming" },
  { id: 7, name: "Voucher Lainnya", icon: Ticket, href: "/voucher-other" },
];




export default function Home() {
  const { data: session, isPending } = useSession();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      const data = await res.json();
      if (data.success) {
        setBalance(data.data.balance);
      }
    } catch (error) {
      console.error('Failed to fetch balance');
    }
  };

  // Fetch real notifications
  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
    }
  }, [session]);

  const fetchNotifications = async () => {
    setLoadingNotifs(true);
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications');
    } finally {
      setLoadingNotifs(false);
    }
  };

  const handleDelete = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    // Mark as read in background
    fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
  };

  const handleClearAll = async () => {
    setNotifications([]);
    fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true })
    });
  };

  const [showAuthGate, setShowAuthGate] = useState(false);

  const handleProtectedClick = (e: React.MouseEvent, href: string) => {
    if (!session?.user) {
      e.preventDefault();
      setShowAuthGate(true);
    }
  };

  return (
    <div className="pb-24 bg-black text-white min-h-screen font-sans">
      <AnimatePresence>
        {showAuthGate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
            onClick={() => setShowAuthGate(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 w-full max-w-sm text-center relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowAuthGate(false)}
                className="absolute top-4 right-4 text-neutral-500 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="w-16 h-16 bg-[#5eead4]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-[#5eead4]" />
              </div>

              <h3 className="text-xl font-bold mb-2">Harap Daftar / Masuk</h3>
              <p className="text-neutral-500 text-sm mb-6 leading-relaxed">
                Anda perlu masuk atau mendaftar akun terlebih dahulu untuk menggunakan fitur ini.
              </p>

              <div className="flex flex-col gap-3">
                <Link
                  href="/login"
                  className="w-full bg-[#5eead4] text-black font-bold py-3.5 rounded-2xl hover:bg-[#5eead4]/90 transition-colors"
                >
                  Masuk ke Akun
                </Link>
                <Link
                  href="/register"
                  className="w-full bg-transparent border border-neutral-700 text-white font-bold py-3.5 rounded-2xl hover:bg-neutral-800 transition-colors"
                >
                  Daftar Akun Baru
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex justify-between items-center bg-black sticky top-0 z-20">
        <div className="flex-1">
          {session?.user ? (
            <>
              <p className="text-xs text-neutral-400 mb-1">Selamat datang,</p>
              <h1 className="text-lg font-bold text-white">
                {session.user.name}
              </h1>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-bold text-[#5eead4] hover:text-[#5eead4]/80 transition-colors">
                Masuk / Daftar
              </Link>
            </div>
          )}
        </div>
        <div onClick={() => setShowNotifications(true)} className="relative cursor-pointer hover:opacity-80 transition-opacity">
          <Bell className="w-6 h-6 text-neutral-400" />
          {notifications.length > 0 && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-lime-400 rounded-full border-2 border-black"></div>}
        </div>
      </header>

      {/* Balance Card - Lime Green & Black */}
      <div className="px-4 mb-8">
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-linear-to-br from-[#bef264] to-[#84cc16] rounded-[2.5rem] min-h-[380px] p-8 relative overflow-hidden flex flex-col"
        >
          {/* Abstract Pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col justify-between flex-1">
            {/* Quick Actions Row (Top) - Black Icons on Green */}
            <div className="flex justify-between items-center">
              <Link href="/topup" onClick={(e) => handleProtectedClick(e, '/topup')}>
                <div className="flex flex-col items-center gap-2 cursor-pointer group">
                  <div className="w-14 h-14 bg-black rounded-[1.2rem] flex items-center justify-center transition-transform active:scale-95 border border-black/5 group-hover:bg-neutral-900 shadow-sm">
                    <Plus className="w-6 h-6 text-[#bef264] transition-colors" />
                  </div>
                  <span className="text-[11px] text-black/80 font-semibold group-hover:text-black">Isi Saldo</span>
                </div>
              </Link>
            </div>

            {/* Balance Text (Bottom Left) */}
            <div>
              <p className="text-sm text-black/70 mb-1 font-medium tracking-wide">Total Saldo</p>
              <h2 className="text-[2.75rem] leading-none font-black tracking-tighter text-black">
                <span className="text-2xl align-top mr-1 font-bold opacity-60">Rp</span>
                {balance.toLocaleString('id-ID')}
              </h2>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Provider HP Section */}
      <div className="px-6 mb-8">
        <h3 className="font-bold mb-5 text-sm tracking-widest text-neutral-500 uppercase">Provider HP</h3>
        <div className="grid grid-cols-4 gap-y-8 gap-x-2">
          {mobileProviders.map((provider, idx) => (
            <Link href={provider.href || '#'} key={provider.id} onClick={(e) => handleProtectedClick(e, provider.href || '#')}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="flex flex-col items-center gap-3 cursor-pointer group"
              >
                <div className="w-15 h-15 rounded-[1.2rem] flex items-center justify-center bg-linear-to-br from-neutral-700 to-neutral-800 border border-neutral-700 overflow-hidden p-2">
                  <img src={provider.image} alt={provider.name} className="w-full h-full object-contain" />
                </div>
                <span className="text-[11px] font-medium text-neutral-400">{provider.name}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Layanan Lainnya Section */}
      <div className="px-6 mb-8">
        <h3 className="font-bold mb-5 text-sm tracking-widest text-neutral-500 uppercase">Layanan Lainnya</h3>
        <div className="grid grid-cols-4 gap-y-8 gap-x-2">
          {otherServices.map((service, idx) => (
            <Link href={service.href || '#'} key={service.id} onClick={(e) => handleProtectedClick(e, service.href || '#')}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.05 + 0.2 }}
                className="flex flex-col items-center gap-3 cursor-pointer group"
              >
                <div className="w-15 h-15 bg-linear-to-br from-neutral-700 to-neutral-800 rounded-[1.2rem] flex items-center justify-center border border-neutral-700">
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-[11px] text-neutral-400 font-medium">{service.name}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>



      {/* Promo Banner - Yellow Accents */}


      {/* Bottom Navigation - Floating Island Style */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
        <div className="bg-neutral-900/90 backdrop-blur-xl border border-neutral-700 rounded-4xl py-3 px-6 flex items-center gap-6 pointer-events-auto shadow-2xl shadow-black/50">

          <Link href="/">
            <div className="w-14 h-14 flex items-center justify-center rounded-3xl text-neutral-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
              <HomeIcon className="w-6 h-6" />
            </div>
          </Link>

          <Link href="/history">
            <div className="w-14 h-14 flex items-center justify-center rounded-3xl text-neutral-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
              <History className="w-6 h-6" />
            </div>
          </Link>

          <Link href="/mutasi">
            <div className="w-14 h-14 flex items-center justify-center rounded-3xl text-neutral-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
              <FileText className="w-6 h-6" />
            </div>
          </Link>

          <Link href="/support">
            <div className="w-14 h-14 flex items-center justify-center rounded-3xl text-neutral-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
              <Headphones className="w-6 h-6" />
            </div>
          </Link>

          <Link href="/profile">
            <div className="w-14 h-14 flex items-center justify-center rounded-3xl text-neutral-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
              <User className="w-6 h-6" />
            </div>
          </Link>

        </div>
      </div>

      {/* Notifications Drawer */}
      <AnimatePresence>
        {showNotifications && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifications(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-[#0a0a0a] border-l border-white/5 z-50 p-6 flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-lg font-bold">Notifikasi</h2>
                <div className="flex gap-2">
                  {notifications.length > 0 && (
                    <button onClick={handleClearAll} className="p-2 bg-neutral-900 rounded-full hover:bg-neutral-800 text-red-500 transition-colors" title="Hapus Semua">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                  <button onClick={() => setShowNotifications(false)} className="p-2 bg-neutral-900 rounded-full hover:bg-neutral-800">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {notifications.map((notif, idx) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`p-4 rounded-2xl border relative group ${notif.read ? 'bg-neutral-900 border-neutral-700' : 'bg-[#5eead4]/5 border-[#5eead4]/20'}`}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(notif.id); }}
                      className="absolute top-2 right-2 p-1.5 bg-black/20 text-neutral-400 active:text-red-500 active:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 
                                        ${notif.type === 'promo' ? 'bg-yellow-500/10 text-yellow-500' :
                          notif.type === 'info' ? 'bg-blue-500/10 text-blue-500' : 'bg-[#5eead4]/10 text-[#5eead4]'}`}>
                        {notif.type === 'promo' ? <Gift className="w-5 h-5" /> :
                          notif.type === 'info' ? <Info className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className={`font-bold text-sm ${notif.read ? 'text-white' : 'text-[#5eead4]'}`}>{notif.title}</h3>
                          <span className="text-[10px] text-neutral-500 whitespace-nowrap ml-2">{notif.date}</span>
                        </div>
                        <p className="text-xs text-neutral-400 leading-relaxed">{notif.message}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div className="text-center pt-8">
                  <p className="text-xs text-neutral-600">Tidak ada notifikasi lainnya.</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
