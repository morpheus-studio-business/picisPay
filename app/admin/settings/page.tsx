"use client";

import { useState } from "react";
import { Save, Eye, EyeOff } from "lucide-react";

export default function SettingsPage() {
    const [showKeys, setShowKeys] = useState(false);

    return (
        <div className="space-y-6 max-w-2xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-neutral-500 text-sm mt-1">
                    Konfigurasi sistem dan API
                </p>
            </div>

            {/* API Configuration */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
                <h3 className="font-semibold flex items-center gap-2">
                    API Configuration
                    <button
                        onClick={() => setShowKeys(!showKeys)}
                        className="p-1 hover:bg-neutral-800 rounded"
                    >
                        {showKeys ? (
                            <EyeOff className="w-4 h-4 text-neutral-500" />
                        ) : (
                            <Eye className="w-4 h-4 text-neutral-500" />
                        )}
                    </button>
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-neutral-500 mb-2">
                            Pakasir Project
                        </label>
                        <input
                            type="text"
                            value={process.env.NEXT_PUBLIC_PAKASIR_PROJECT || "***"}
                            disabled
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-neutral-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-neutral-500 mb-2">
                            Digiflazz Username
                        </label>
                        <input
                            type={showKeys ? "text" : "password"}
                            value="Configured via .env.local"
                            disabled
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-neutral-400"
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-neutral-800">
                    <p className="text-xs text-neutral-600">
                        API keys dikonfigurasi melalui file <code className="text-[#bef264]">.env.local</code>.
                        Untuk mengubah, edit file tersebut dan restart server.
                    </p>
                </div>
            </div>

            {/* Webhook URLs */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
                <h3 className="font-semibold">Webhook URLs</h3>
                <p className="text-sm text-neutral-500">
                    Setelah deploy, set URL berikut di masing-masing dashboard:
                </p>

                <div className="space-y-3">
                    <div>
                        <label className="block text-xs text-neutral-500 mb-1">
                            Pakasir Webhook
                        </label>
                        <code className="block bg-neutral-800 px-4 py-2 rounded-lg text-sm text-[#bef264] break-all">
                            https://your-domain.com/api/pakasir/webhook
                        </code>
                    </div>

                    <div>
                        <label className="block text-xs text-neutral-500 mb-1">
                            Digiflazz Webhook
                        </label>
                        <code className="block bg-neutral-800 px-4 py-2 rounded-lg text-sm text-[#bef264] break-all">
                            https://your-domain.com/api/digiflazz/webhook
                        </code>
                    </div>
                </div>
            </div>

            {/* Database */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
                <h3 className="font-semibold">Database</h3>
                <p className="text-sm text-neutral-500">
                    Menggunakan Neon PostgreSQL dengan Drizzle ORM.
                </p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-500">Connected</span>
                </div>
            </div>
        </div>
    );
}
