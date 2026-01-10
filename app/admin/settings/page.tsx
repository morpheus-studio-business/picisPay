'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, Globe, Phone, DollarSign, AlertTriangle, Megaphone, Send, Mail } from 'lucide-react';

interface Config {
    key: string;
    value: string;
    description: string;
}

export default function SettingsPage() {
    const [configs, setConfigs] = useState<Config[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            const data = await res.json();
            if (data.success) {
                // Ensure all standard keys exist
                const standardKeys = [
                    { key: 'site_name', description: 'Nama Website', value: '' },
                    { key: 'announcement_text', description: 'Teks Pengumuman', value: '' },
                    { key: 'wa_admin', description: 'Nomor WhatsApp Admin (628...)', value: '' },
                    { key: 'telegram_admin', description: 'Username Telegram Admin', value: '' },
                    { key: 'email_support', description: 'Email Support', value: '' },
                    { key: 'global_margin', description: 'Margin Global (%)', value: '0' },
                    { key: 'maintenance_mode', description: 'Mode Maintenance', value: 'false' },
                ];

                const mergedConfigs = standardKeys.map(std => {
                    const existing = data.data.find((c: any) => c.key === std.key);
                    return existing ? existing : std;
                });

                // Add any extra custom keys that might exist in DB but not in standardKeys
                const extraKeys = data.data.filter((c: any) => !standardKeys.find(std => std.key === c.key));

                setConfigs([...mergedConfigs, ...extraKeys]);
            }
        } catch (error) {
            console.error('Failed to fetch configs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (key: string, value: string) => {
        setSaving(key);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value }),
            });
            if (!res.ok) throw new Error('Failed');
            await fetchConfigs(); // Refresh
        } catch (error) {
            alert('Gagal menyimpan pengaturan');
        } finally {
            setSaving(null);
        }
    };

    const getIcon = (key: string) => {
        switch (key) {
            case 'site_name': return <Globe className="w-5 h-5 text-blue-400" />;
            case 'wa_admin': return <Phone className="w-5 h-5 text-green-400" />;
            case 'telegram_admin': return <Send className="w-5 h-5 text-sky-400" />;
            case 'email_support': return <Megaphone className="w-5 h-5 text-orange-400" />; // Reusing Megaphone or need Mail? Mail is better.
            case 'global_margin': return <DollarSign className="w-5 h-5 text-yellow-400" />;
            case 'maintenance_mode': return <AlertTriangle className="w-5 h-5 text-red-400" />;
            case 'announcement_text': return <Megaphone className="w-5 h-5 text-purple-400" />;
            default: return <Globe className="w-5 h-5 text-neutral-400" />;
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Pengaturan Website</h1>
                <p className="text-neutral-500">Kelola identitas dan konfigurasi sistem PicisPay</p>
            </div>

            <div className="grid gap-6">
                {configs.map((config) => (
                    <motion.div
                        key={config.key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] text-neutral-600 font-mono uppercase tracking-widest">{config.key}</span>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="mt-1 p-2 bg-neutral-800 rounded-lg">
                                {getIcon(config.key)}
                            </div>
                            <div className="flex-1 space-y-3">
                                <div>
                                    <h3 className="font-semibold text-white capitalize">
                                        {config.key.replace(/_/g, ' ')}
                                    </h3>
                                    <p className="text-xs text-neutral-500">{config.description}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    {config.key === 'maintenance_mode' ? (
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleSave(config.key, 'true')}
                                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${config.value === 'true'
                                                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                                                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                                                    }`}
                                            >
                                                Maintenance ON
                                            </button>
                                            <button
                                                onClick={() => handleSave(config.key, 'false')}
                                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${config.value === 'false'
                                                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                                                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                                                    }`}
                                            >
                                                Live (Normal)
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex gap-2">
                                            <input
                                                type="text"
                                                defaultValue={config.value}
                                                onBlur={(e) => {
                                                    if (e.target.value !== config.value) {
                                                        handleSave(config.key, e.target.value);
                                                    }
                                                }}
                                                className="w-full bg-black/50 border border-neutral-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#bef264] transition-colors"
                                            />
                                            {saving === config.key && (
                                                <div className="flex items-center text-[#bef264]">
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
