'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from '@/lib/auth-client';
import { Bell, X, CheckCircle, AlertCircle, Info, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

interface ToastNotification extends Notification {
    show: boolean;
}

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [unreadCount, setUnreadCount] = useState(0);
    const [toasts, setToasts] = useState<ToastNotification[]>([]);
    const seenIds = useRef<Set<string>>(new Set());
    const eventSourceRef = useRef<EventSource | null>(null);

    const connectSSE = useCallback(() => {
        if (!session?.user) return;

        // Close existing connection
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        const eventSource = new EventSource('/api/notifications/stream');
        eventSourceRef.current = eventSource;

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === 'connected') {
                    console.log('SSE Connected');
                    return;
                }

                if (data.type === 'notifications') {
                    setUnreadCount(data.count);

                    // Show toast for NEW notifications (not seen before)
                    data.items.forEach((notif: Notification) => {
                        if (!seenIds.current.has(notif.id)) {
                            seenIds.current.add(notif.id);

                            // Only show toast for very recent notifications (last 30 seconds)
                            const notifTime = new Date(notif.createdAt).getTime();
                            const now = Date.now();
                            if (now - notifTime < 30000) {
                                setToasts(prev => [...prev, { ...notif, show: true }]);

                                // Auto-dismiss after 5 seconds
                                setTimeout(() => {
                                    setToasts(prev => prev.filter(t => t.id !== notif.id));
                                }, 5000);
                            }
                        }
                    });
                }
            } catch (error) {
                console.error('SSE parse error:', error);
            }
        };

        eventSource.onerror = (error) => {
            console.error('SSE Error:', error);
            eventSource.close();

            // Reconnect after 5 seconds
            setTimeout(() => {
                if (session?.user) {
                    connectSSE();
                }
            }, 5000);
        };
    }, [session]);

    useEffect(() => {
        if (session?.user) {
            connectSSE();
        }

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, [session, connectSSE]);

    const dismissToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'topup_success': return <Wallet className="w-5 h-5 text-[#bef264]" />;
            case 'transaction_success': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'transaction_failed': return <AlertCircle className="w-5 h-5 text-red-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    return (
        <>
            {children}

            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 100, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.9 }}
                            className="bg-neutral-900 border border-neutral-700 rounded-2xl p-4 shadow-2xl flex items-start gap-3"
                        >
                            <div className="mt-0.5">
                                {getIcon(toast.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{toast.title}</p>
                                <p className="text-xs text-neutral-400 mt-0.5 line-clamp-2">{toast.message}</p>
                            </div>
                            <button
                                onClick={() => dismissToast(toast.id)}
                                className="text-neutral-500 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Notification Badge (if needed elsewhere, can export unreadCount) */}
        </>
    );
}
