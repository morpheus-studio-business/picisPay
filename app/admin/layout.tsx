"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    CreditCard,
    ShoppingCart,
    Settings,
    LogOut,
    Menu,
    X,
    Package,
    Layers,
    Loader2,
    Image,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";

const menuItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Transactions", href: "/admin/transactions", icon: ShoppingCart },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Deposits", href: "/admin/topups", icon: CreditCard },
    { name: "Banners", href: "/admin/banners", icon: Image },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Check admin access
    useEffect(() => {
        if (!isPending) {
            if (!session?.user) {
                router.replace('/login');
            } else if ((session.user as any).role !== 'admin') {
                router.replace('/');
            }
        }
    }, [session, isPending, router]);

    // Loading state
    if (isPending) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#bef264]" />
            </div>
        );
    }

    // Not admin - will redirect
    if (!session?.user || (session.user as any).role !== 'admin') {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 font-bold mb-2">Akses Ditolak</p>
                    <p className="text-neutral-500 text-sm">Hanya admin yang bisa mengakses halaman ini</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-white flex">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-neutral-900 border-r border-neutral-800 transform transition-transform lg:transform-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                    }`}
            >
                <div className="p-6">
                    <h1 className="text-lg font-bold text-white tracking-widest uppercase">Admin</h1>
                </div>

                <nav className="p-4 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`block px-4 py-2.5 rounded-lg text-sm transition-colors ${isActive
                                    ? "bg-white text-black font-medium"
                                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                                    }`}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-800">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-red-500 hover:bg-neutral-800 rounded-xl transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Kembali ke App</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 flex flex-col min-h-screen">
                {/* Top Bar */}
                <header className="h-16 bg-neutral-900 border-b border-neutral-800 flex items-center px-4 lg:px-6 gap-4">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 hover:bg-neutral-800 rounded-lg"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="flex-1" />
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#bef264] rounded-full flex items-center justify-center text-black font-bold text-sm">
                            {session.user.name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <span className="text-sm text-neutral-400 hidden sm:block">{session.user.name || 'Admin'}</span>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 p-4 lg:p-6 overflow-x-hidden overflow-y-auto max-w-full">{children}</div>
            </main>
        </div>
    );
}
