"use client";

import { useEffect, useState } from "react";
import { Search, RefreshCw, Plus, Trash2, Loader2, X, Save } from "lucide-react";
import Image from "next/image";

interface Brand {
    id: string;
    name: string;
    category: string;
    iconHome: string | null;
    iconDetail: string | null;
    color: string | null;
    isActive: boolean;
    priority: number;
}

const categories = [
    { id: "all", name: "Semua" },
    { id: "data", name: "Data/Pulsa" },
    { id: "streaming", name: "Streaming" },
    { id: "games", name: "Games" },
    { id: "ewallet", name: "E-Wallet" },
];

export default function BrandsPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");

    // Modal state
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [isNewBrand, setIsNewBrand] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchBrands();
    }, [activeCategory]);

    const fetchBrands = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/brands?category=${activeCategory}`);
            const data = await res.json();
            if (data.success) {
                setBrands(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch brands:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBrands = brands.filter(
        (b) =>
            b.name.toLowerCase().includes(search.toLowerCase()) ||
            b.id.toLowerCase().includes(search.toLowerCase())
    );

    const handleNew = () => {
        setIsNewBrand(true);
        setEditingBrand({
            id: "",
            name: "",
            category: "data",
            iconHome: null,
            iconDetail: null,
            color: null,
            isActive: true,
            priority: 0,
        });
    };

    const handleEdit = (brand: Brand) => {
        setIsNewBrand(false);
        setEditingBrand({ ...brand });
    };

    const handleSave = async () => {
        if (!editingBrand) return;
        if (!editingBrand.id || !editingBrand.name || !editingBrand.category) {
            alert("ID, Nama, dan Kategori wajib diisi");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch("/api/admin/brands", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingBrand),
            });
            const data = await res.json();
            if (data.success) {
                setEditingBrand(null);
                fetchBrands();
            } else {
                alert(data.error || "Gagal menyimpan");
            }
        } catch (error) {
            console.error("Save error:", error);
            alert("Terjadi kesalahan");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(`Hapus brand "${id}"?`)) return;
        try {
            const res = await fetch(`/api/admin/brands?id=${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                fetchBrands();
            } else {
                alert(data.error || "Gagal menghapus");
            }
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Brands</h1>
                    <p className="text-neutral-500 text-sm mt-1">
                        Kelola icon/logo untuk homepage dan halaman detail
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchBrands}
                        className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                    <button
                        onClick={handleNew}
                        className="flex items-center gap-2 px-4 py-2 bg-[#bef264] text-black font-bold rounded-xl hover:bg-[#a3cf53] transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah
                    </button>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors
                            ${activeCategory === cat.id
                                ? "bg-[#bef264] text-black"
                                : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"}`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                    type="text"
                    placeholder="Cari ID atau nama brand..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-[#bef264]"
                />
            </div>

            {/* Brands Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#bef264]" />
                </div>
            ) : filteredBrands.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                    Belum ada brand. Klik "Tambah" untuk membuat.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredBrands.map((brand) => (
                        <div
                            key={brand.id}
                            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 hover:border-neutral-700 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    {brand.iconHome ? (
                                        <img
                                            src={brand.iconHome}
                                            alt={brand.name}
                                            className="w-12 h-12 rounded-xl object-contain bg-neutral-800"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-600 text-xs">
                                            No Icon
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-white">{brand.name}</h3>
                                        <p className="text-xs text-neutral-500">{brand.id}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold
                                    ${brand.isActive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                                    {brand.isActive ? "Aktif" : "Nonaktif"}
                                </span>
                            </div>

                            <div className="flex gap-2 mb-3">
                                <div className="flex-1 text-center">
                                    <p className="text-[10px] text-neutral-500 mb-1">Home</p>
                                    {brand.iconHome ? (
                                        <img src={brand.iconHome} className="w-10 h-10 mx-auto rounded-lg object-contain bg-neutral-800" />
                                    ) : (
                                        <div className="w-10 h-10 mx-auto rounded-lg bg-neutral-800"></div>
                                    )}
                                </div>
                                <div className="flex-1 text-center">
                                    <p className="text-[10px] text-neutral-500 mb-1">Detail</p>
                                    {brand.iconDetail ? (
                                        <img src={brand.iconDetail} className="w-10 h-10 mx-auto rounded-lg object-contain bg-neutral-800" />
                                    ) : (
                                        <div className="w-10 h-10 mx-auto rounded-lg bg-neutral-800"></div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(brand)}
                                    className="flex-1 py-2 bg-neutral-800 rounded-lg text-sm font-medium hover:bg-neutral-700"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(brand.id)}
                                    className="w-10 h-10 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-500/20"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {editingBrand && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold">
                                {isNewBrand ? "Tambah Brand Baru" : `Edit: ${editingBrand.name}`}
                            </h3>
                            <button onClick={() => setEditingBrand(null)} className="text-neutral-500 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-neutral-400 mb-1">ID (slug) *</label>
                                    <input
                                        type="text"
                                        value={editingBrand.id}
                                        onChange={(e) => setEditingBrand({ ...editingBrand, id: e.target.value.toLowerCase().replace(/\s/g, "") })}
                                        disabled={!isNewBrand}
                                        placeholder="axis, mobilelegends"
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 focus:border-[#bef264] outline-none disabled:text-neutral-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-neutral-400 mb-1">Nama *</label>
                                    <input
                                        type="text"
                                        value={editingBrand.name}
                                        onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
                                        placeholder="Axis"
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 focus:border-[#bef264] outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-neutral-400 mb-1">Kategori *</label>
                                    <select
                                        value={editingBrand.category}
                                        onChange={(e) => setEditingBrand({ ...editingBrand, category: e.target.value })}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 focus:border-[#bef264] outline-none"
                                    >
                                        <option value="data">Data/Pulsa</option>
                                        <option value="streaming">Streaming</option>
                                        <option value="games">Games</option>
                                        <option value="ewallet">E-Wallet</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-neutral-400 mb-1">Prioritas</label>
                                    <input
                                        type="number"
                                        value={editingBrand.priority}
                                        onChange={(e) => setEditingBrand({ ...editingBrand, priority: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 focus:border-[#bef264] outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Icon Homepage (URL)</label>
                                <input
                                    type="text"
                                    value={editingBrand.iconHome || ""}
                                    onChange={(e) => setEditingBrand({ ...editingBrand, iconHome: e.target.value || null })}
                                    placeholder="https://example.com/icon-home.png"
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 focus:border-[#bef264] outline-none"
                                />
                                <p className="text-[10px] text-neutral-600 mt-1">Icon untuk tampilan di halaman depan (bisa monochrome/themed)</p>
                            </div>

                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Icon Detail (URL)</label>
                                <input
                                    type="text"
                                    value={editingBrand.iconDetail || ""}
                                    onChange={(e) => setEditingBrand({ ...editingBrand, iconDetail: e.target.value || null })}
                                    placeholder="https://example.com/icon-color.png"
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 focus:border-[#bef264] outline-none"
                                />
                                <p className="text-[10px] text-neutral-600 mt-1">Icon untuk halaman detail produk (warna asli)</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-neutral-400 mb-1">Warna Brand (Hex)</label>
                                    <input
                                        type="text"
                                        value={editingBrand.color || ""}
                                        onChange={(e) => setEditingBrand({ ...editingBrand, color: e.target.value || null })}
                                        placeholder="#800080"
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 focus:border-[#bef264] outline-none"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editingBrand.isActive}
                                            onChange={(e) => setEditingBrand({ ...editingBrand, isActive: e.target.checked })}
                                            className="w-5 h-5 rounded accent-[#bef264]"
                                        />
                                        <span className="text-sm">Aktif</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-neutral-800">
                                <button
                                    onClick={() => setEditingBrand(null)}
                                    className="px-4 py-2 text-neutral-400 hover:text-white"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-6 py-2 bg-[#bef264] text-black font-bold rounded-lg hover:bg-[#a3cf53] flex items-center gap-2"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Simpan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
