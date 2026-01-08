import { NextRequest, NextResponse } from "next/server";

// Game-specific API endpoints for nickname checking
const GAME_APIs: Record<string, { url: string; needsZone: boolean; name: string }> = {
    'ml': {
        url: 'https://api.isan.eu.org/nickname/ml',
        needsZone: true,
        name: 'Mobile Legends'
    },
    'ff': {
        url: 'https://api.isan.eu.org/nickname/ff',
        needsZone: false,
        name: 'Free Fire'
    },
    'pubg': {
        url: 'https://api.isan.eu.org/nickname/pubg',
        needsZone: false,
        name: 'PUBG Mobile'
    },
    'genshin': {
        url: 'https://api.isan.eu.org/nickname/genshin',
        needsZone: true,
        name: 'Genshin Impact'
    },
    'hok': {
        url: 'https://api.isan.eu.org/nickname/hok',
        needsZone: true,
        name: 'Honor of Kings'
    },
    'valorant': {
        url: 'https://api.isan.eu.org/nickname/valorant',
        needsZone: false,
        name: 'Valorant'
    },
};

export async function POST(request: NextRequest) {
    try {
        const { userId, zoneId, game } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "User ID is required" },
                { status: 400 }
            );
        }

        // Default to Mobile Legends if no game specified
        const gameKey = (game || 'ml').toLowerCase();
        const gameConfig = GAME_APIs[gameKey];

        if (!gameConfig) {
            return NextResponse.json({
                success: false,
                error: `Game "${game}" tidak didukung untuk cek nickname`
            });
        }

        // Build API URL based on game requirements
        let apiUrl = `${gameConfig.url}?id=${userId}`;
        if (gameConfig.needsZone && zoneId) {
            apiUrl += `&zone=${zoneId}`;
        }

        console.log(`Checking ${gameConfig.name} nickname: ${apiUrl}`);

        const response = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/json',
            }
        });

        const text = await response.text();
        console.log("API raw response:", text);

        // Try to parse as JSON
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            return NextResponse.json({
                success: false,
                error: "API tidak tersedia saat ini"
            });
        }

        console.log("Parsed API response:", data);

        // Handle various response formats from different APIs
        if (data.success !== false && (data.name || data.nickname || data.data?.name)) {
            return NextResponse.json({
                success: true,
                data: {
                    nickname: data.name || data.nickname || data.data?.name || "Unknown Player",
                    game: gameConfig.name
                }
            });
        } else {
            return NextResponse.json({
                success: false,
                error: data.message || data.error || "User tidak ditemukan"
            });
        }

    } catch (error) {
        console.error("Nickname check error:", error);
        return NextResponse.json(
            { success: false, error: "Gagal mengecek nickname" },
            { status: 500 }
        );
    }
}
