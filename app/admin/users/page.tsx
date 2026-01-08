"use client";

import { useEffect, useState } from "react";
import { Search, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

interface User {
    id: string;
    phone: string;
    name: string | null;
    balance: number;
    createdAt: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/users");
            const data = await res.json();
            if (data.success) {
                setUsers(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(
        (u) =>
            u.phone.includes(search) ||
            (u.name && u.name.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Users</h1>
                    <p className="text-neutral-500 text-sm mt-1">
                        Kelola semua pengguna aplikasi
                    </p>
                </div>
                <button
                    onClick={fetchUsers}
                    className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                    type="text"
                    placeholder="Cari nomor HP atau nama..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-[#bef264]"
                />
            </div>

            {/* Table */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-neutral-800">
                                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">
                                    Nomor HP
                                </th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">
                                    Nama
                                </th>
                                <th className="text-right px-6 py-4 text-sm font-medium text-neutral-500">
                                    Saldo
                                </th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">
                                    Terdaftar
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-neutral-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-neutral-500">
                                        Belum ada user terdaftar
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-b border-neutral-800 hover:bg-neutral-800/50"
                                    >
                                        <td className="px-6 py-4 text-sm font-medium">
                                            {user.phone}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-400">
                                            {user.name || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right font-semibold text-[#bef264]">
                                            Rp {user.balance.toLocaleString("id-ID")}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-500">
                                            {new Date(user.createdAt).toLocaleDateString("id-ID")}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
