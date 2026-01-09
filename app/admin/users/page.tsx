"use client";

import { useEffect, useState } from "react";
import { Search, RefreshCw, Plus, Minus, Loader2 } from "lucide-react";

interface User {
    id: string;
    phone: string | null;
    name: string | null;
    balance: number;
    createdAt: string;
    role?: string;
    level?: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Edit Level Modal
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editForm, setEditForm] = useState({ role: '', level: '' });
    const [saving, setSaving] = useState(false);

    // Balance Modal
    const [balanceUser, setBalanceUser] = useState<User | null>(null);
    const [balanceType, setBalanceType] = useState<'add' | 'subtract'>('add');
    const [balanceAmount, setBalanceAmount] = useState('');
    const [balanceReason, setBalanceReason] = useState('');
    const [balanceSaving, setBalanceSaving] = useState(false);

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

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setEditForm({
            role: user.role || 'user',
            level: user.level || 'member'
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
                fetchUsers();
            } else {
                alert('Gagal update user');
            }
        } catch (error) {
            console.error('Failed to update:', error);
        } finally {
            setSaving(false);
        }
    };

    // Balance Adjustment Handlers
    const openBalanceModal = (user: User, type: 'add' | 'subtract') => {
        setBalanceUser(user);
        setBalanceType(type);
        setBalanceAmount('');
        setBalanceReason('');
    };

    const handleBalanceAdjust = async () => {
        if (!balanceUser || !balanceAmount || !balanceReason) {
            alert('Isi nominal dan alasan');
            return;
        }
        setBalanceSaving(true);
        try {
            const res = await fetch('/api/admin/users/balance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: balanceUser.id,
                    amount: parseInt(balanceAmount),
                    type: balanceType,
                    reason: balanceReason
                })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Saldo berhasil ${balanceType === 'add' ? 'ditambah' : 'dikurangi'}!\nSaldo baru: Rp ${data.data.balanceAfter.toLocaleString('id-ID')}`);
                setBalanceUser(null);
                fetchUsers();
            } else {
                alert(data.error || 'Gagal adjust saldo');
            }
        } catch (error) {
            console.error('Failed to adjust balance:', error);
            alert('Terjadi kesalahan');
        } finally {
            setBalanceSaving(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID').format(amount);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Users</h1>
                    <p className="text-neutral-500 text-sm mt-1">
                        Kelola pengguna, level, dan saldo
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
                                <th className="text-center px-6 py-4 text-sm font-medium text-neutral-500">Aksi</th>
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
                                                ${user.level === 'vip' ? 'bg-yellow-500/10 text-yellow-500' :
                                                    user.level === 'reseller' ? 'bg-blue-500/10 text-blue-500' : 'bg-neutral-800 text-neutral-400'}`}>
                                                {user.level?.toUpperCase() || 'MEMBER'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right font-semibold text-[#bef264]">
                                            Rp {formatCurrency(user.balance)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-500">
                                            {new Date(user.createdAt).toLocaleDateString("id-ID")}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => openBalanceModal(user, 'add')}
                                                    className="w-8 h-8 bg-green-500/10 text-green-500 rounded-lg flex items-center justify-center hover:bg-green-500/20"
                                                    title="Tambah Saldo"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openBalanceModal(user, 'subtract')}
                                                    className="w-8 h-8 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-500/20"
                                                    title="Kurangi Saldo"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="text-[#bef264] hover:underline text-xs"
                                                >
                                                    Edit
                                                </button>
                                            </div>
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
                                    <div className="text-[#bef264] font-bold">Rp {formatCurrency(user.balance)}</div>
                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold
                                        ${user.level === 'vip' ? 'bg-yellow-500/10 text-yellow-500' :
                                            user.level === 'reseller' ? 'bg-blue-500/10 text-blue-500' : 'bg-neutral-800 text-neutral-400'}`}>
                                        {user.level?.toUpperCase() || 'MEMBER'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => openBalanceModal(user, 'add')}
                                    className="flex-1 py-2 bg-green-500/10 text-green-500 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                                >
                                    <Plus className="w-4 h-4" /> Tambah
                                </button>
                                <button
                                    onClick={() => openBalanceModal(user, 'subtract')}
                                    className="flex-1 py-2 bg-red-500/10 text-red-500 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                                >
                                    <Minus className="w-4 h-4" /> Kurangi
                                </button>
                                <button
                                    onClick={() => handleEdit(user)}
                                    className="px-4 py-2 bg-neutral-800 rounded-lg text-sm font-medium hover:bg-neutral-700 transition-colors"
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Edit Level Modal */}
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

            {/* Balance Adjustment Modal */}
            {balanceUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-2">
                            {balanceType === 'add' ? '➕ Tambah Saldo' : '➖ Kurangi Saldo'}
                        </h3>
                        <p className="text-sm text-neutral-400 mb-4">
                            User: <span className="text-white font-medium">{balanceUser.name || balanceUser.phone}</span>
                            <br />
                            Saldo saat ini: <span className="text-[#bef264] font-semibold">Rp {formatCurrency(balanceUser.balance)}</span>
                        </p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Nominal (Rp)</label>
                                <input
                                    type="number"
                                    value={balanceAmount}
                                    onChange={(e) => setBalanceAmount(e.target.value)}
                                    placeholder="Contoh: 50000"
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-3 focus:border-[#bef264] outline-none text-lg font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Alasan / Keterangan *</label>
                                <input
                                    type="text"
                                    value={balanceReason}
                                    onChange={(e) => setBalanceReason(e.target.value)}
                                    placeholder="Contoh: Transfer Bank BCA"
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 focus:border-[#bef264] outline-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setBalanceUser(null)}
                                    className="px-4 py-2 text-neutral-400 hover:text-white"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleBalanceAdjust}
                                    disabled={balanceSaving}
                                    className={`px-4 py-2 font-bold rounded-lg flex items-center gap-2
                                        ${balanceType === 'add'
                                            ? 'bg-green-500 text-white hover:bg-green-600'
                                            : 'bg-red-500 text-white hover:bg-red-600'}`}
                                >
                                    {balanceSaving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : balanceType === 'add' ? (
                                        <>
                                            <Plus className="w-4 h-4" /> Tambah
                                        </>
                                    ) : (
                                        <>
                                            <Minus className="w-4 h-4" /> Kurangi
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
