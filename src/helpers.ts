// src/helpers.ts

import axios from "axios";

export const getApiUrl = () => {
  // Check for explicit GraphQL endpoint (check both variable names)
  const envEndpoint = process.env.REACT_APP_GRAPHQL_URI || process.env.REACT_APP_GRAPHQL_ENDPOINT;

  if (envEndpoint) {
    console.log("Using GraphQL endpoint from env variable:", envEndpoint);
    return envEndpoint;
  }

  // Only use localhost if EXPLICITLY set to development
  // Otherwise, ALWAYS default to production
  const isDevelopment = process.env.REACT_APP_ENV === "development";
  const endpoint = isDevelopment
    ? "http://localhost:4000/graphql"
    : "https://business-builder-backend-sy9bw.ondigitalocean.app/graphql";

  console.log(`REACT_APP_ENV: "${process.env.REACT_APP_ENV}", isDevelopment: ${isDevelopment}`);
  console.log("Using GraphQL endpoint:", endpoint);
  return endpoint;
};


export const getBitcoinPrice = async (): Promise<number> => {
  try {
    const response = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=aud");
    return response.data.bitcoin.aud;
  } catch (error) {
    console.error("Error fetching BTC price:", error);
    return 0; // Return 0 or some default value in case of an error
  }
};

export const calculateBTCAmount = (audAmount: number, btcPrice: number): number => {
  return audAmount / btcPrice;
};

/**
 * Ensures a Pinata IPFS URL has the https:// protocol
 * @param url - The Pinata URL to normalize
 * @returns The URL with https:// protocol
 */
export const normalizePinataUrl = (url: string): string => {
  if (!url) return url;

  // If it already has a protocol, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If it's a Pinata gateway URL without protocol, add https://
  if (url.includes('.mypinata.cloud')) {
    return `https://${url}`;
  }

  return url;
};

/**
 * Normalizes a media URL for display (specifically for Pinata URLs)
 * @param url - The media URL to normalize
 * @returns The normalized URL with proper protocol
 */
export const normalizeMediaUrl = (url?: string): string => {
  if (!url) return '';

  // IMPORTANT: Do NOT strip authentication tokens!
  // The backend now provides URLs with pinataGatewayToken for private gateway access
  // Stripping the token will cause 403 errors

  // Simply ensure the URL has proper protocol
  return normalizePinataUrl(url);
};