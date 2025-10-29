/**
 * Ensures a URL has the https:// protocol
 * @param url - The URL to normalize
 * @returns The URL with https:// protocol
 */
export const ensureHttps = (url: string): string => {
    if (!url) return url;

    // If it already has a protocol, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    // If it doesn't have a protocol, add https://
    return `https://${url}`;
};

/**
 * Normalizes an image URL for display
 * @param url - The image URL to normalize
 * @returns The normalized URL with proper protocol
 */
export const normalizeImageUrl = (url?: string): string => {
    if (!url) return '';
    return ensureHttps(url);
}; 