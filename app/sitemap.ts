import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://picispay.id';

    // Static routes
    const routes = [
        '',
        '/games/topup',
        '/games/voucher',
        '/pulsa',
        '/data',
        '/pln',
        '/ewallet',
        '/support',
        '/history',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    return routes;
}
