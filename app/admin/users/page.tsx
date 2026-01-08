"use client";

import { useEffect, useState } from "react";
import { Search, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

interface User {
    id: string;
    phone: string | null;
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
            (u.phone && u.phone.includes(search)) ||
            (u.name && u.name.toLowerCase().includes(search.toLowerCase()))
    );

    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editForm, setEditForm] = useState({ role: '', level: '' });
    const [saving, setSaving] = useState(false);

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setEditForm({
            role: (user as any).role || 'user',
            level: (user as any).level || 'member'
        });
    };

    const handleSave = async () => {
        if (!editingUser) return;
        setSaving(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingUser.id,
                    role: editForm.role,
                    level: editForm.level
                })
            });
            const data = await res.json();
            if (data.success) {
                setEditingUser(null);
                fetchUsers(); // Refresh list
            } else {
                alert('Gagal update user');
            }
        } catch (error) {
            console.error('Failed to update:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Users</h1>
                    <p className="text-neutral-500 text-sm mt-1">
                        Kelola semua pengguna aplikasi (Level & Role)
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

            {/* Desktop Table */}
            <div className="hidden md:block bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-neutral-800">
                                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Nomor HP</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Nama</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Level</th>
                                <th className="text-right px-6 py-4 text-sm font-medium text-neutral-500">Saldo</th>
                                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Terdaftar</th>
                                <th className="text-right px-6 py-4 text-sm font-medium text-neutral-500">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-neutral-500">Loading...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-neutral-500">Belum ada user terdaftar</td></tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="border-b border-neutral-800 hover:bg-neutral-800/50">
                                        <td className="px-6 py-4 text-sm font-medium">{user.phone}</td>
                                        <td className="px-6 py-4 text-sm text-neutral-400">{user.name || "-"}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold
                                                ${(user as any).level === 'vip' ? 'bg-yellow-500/10 text-yellow-500' :
                                                    (user as any).level === 'reseller' ? 'bg-blue-500/10 text-blue-500' : 'bg-neutral-800 text-neutral-400'}`}>
                                                {(user as any).level?.toUpperCase() || 'MEMBER'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right font-semibold text-[#bef264]">
                                            Rp {user.balance.toLocaleString("id-ID")}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-500">
                                            {new Date(user.createdAt).toLocaleDateString("id-ID")}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="text-[#bef264] hover:underline"
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {loading ? (
                    <div className="text-center py-8 text-neutral-500">Loading...</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500">Belum ada user</div>
                ) : (
                    filteredUsers.map((user) => (
                        <div key={user.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-semibold text-white">{user.name || "Tanpa Nama"}</div>
                                    <div className="text-sm text-neutral-400 mt-1">{user.phone || "-"}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[#bef264] font-bold">Rp {user.balance.toLocaleString("id-ID")}</div>
                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold
                                        ${(user as any).level === 'vip' ? 'bg-yellow-500/10 text-yellow-500' :
                                            (user as any).level === 'reseller' ? 'bg-blue-500/10 text-blue-500' : 'bg-neutral-800 text-neutral-400'}`}>
                                        {(user as any).level?.toUpperCase() || 'MEMBER'}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleEdit(user)}
                                className="w-full py-2 bg-neutral-800 rounded-lg text-sm font-medium hover:bg-neutral-700 transition-colors"
                            >
                                Edit Level
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4">Edit User</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Nama</label>
                                <input disabled value={editingUser.name || ''} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-500" />
                            </div>

                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Role</label>
                                <select
                                    value={editForm.role}
                                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 focus:border-[#bef264] outline-none"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Level (Smart Pricing)</label>
                                <select
                                    value={editForm.level}
                                    onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 focus:border-[#bef264] outline-none"
                                >
                                    <option value="member">Member (Harga Normal)</option>
                                    <option value="reseller">Reseller (Diskon Rp 200)</option>
                                    <option value="vip">VIP (Diskon Rp 500)</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setEditingUser(null)}
                                    className="px-4 py-2 text-neutral-400 hover:text-white"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-4 py-2 bg-[#bef264] text-black font-bold rounded-lg hover:bg-[#a3cf53]"
                                >
                                    {saving ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
