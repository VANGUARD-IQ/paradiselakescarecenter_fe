// IPFS Configuration
export const IPFS_CONFIG = {
  // Your private Pinata gateway
  PRIVATE_GATEWAY_URL: 'https://scarlet-professional-perch-484.mypinata.cloud/ipfs',

  // Public gateway fallback (if needed)
  PUBLIC_GATEWAY_URL: 'https://gateway.pinata.cloud/ipfs',

  // Helper function to construct IPFS URL
  getIPFSUrl: (cid: string, usePrivate: boolean = true): string => {
    const gateway = usePrivate ? IPFS_CONFIG.PRIVATE_GATEWAY_URL : IPFS_CONFIG.PUBLIC_GATEWAY_URL;
    return `${gateway}/${cid}`;
  }
};

export default IPFS_CONFIG;