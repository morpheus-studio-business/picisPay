import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Bantuan & Support | PicisPay",
    description: "Pusat bantuan PicisPay. Hubungi kami via WhatsApp, Telegram, atau Email untuk kendala transaksi, deposit, dan pertanyaan lainnya.",
};

export default function SupportLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
