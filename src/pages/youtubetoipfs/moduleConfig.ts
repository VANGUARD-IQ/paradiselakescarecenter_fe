import React from "react";
import { ModuleConfig } from "../../types/ModuleConfig";

// Import components (lazy-loaded for performance)
const VideoGallery = React.lazy(() => import("./VideoGallery"));
const UploadVideo = React.lazy(() => import("./UploadVideo"));
const AddVideoByCID = React.lazy(() => import("./AddVideoByCID"));
const VideoViewer = React.lazy(() => import("./VideoViewer"));
const IPFSVideosAdmin = React.lazy(() => import("./IPFSVideosAdmin"));
const EditVideoDetails = React.lazy(() => import("./EditVideoDetails"));

const youtubeToIPFSModuleConfig: ModuleConfig = {
    // 🏷️ MODULE IDENTITY
    id: "youtubetoipfs",
    name: "IPFS Videos",
    description: "Upload and manage videos on IPFS decentralized storage",
    version: "1.0.0",
    enabled: true,
    category: "media",
    order: 10,
    icon: "🎬",
    color: "#8B5CF6",

    // 🛣️ ROUTES
    routes: [
        {
            path: "/youtubetoipfs",
            component: VideoGallery,
            permissions: ["IPFS_ADMIN", "IPFS_USER"]
        },
        {
            path: "/youtubetoipfs/upload",
            component: UploadVideo,
            permissions: ["IPFS_ADMIN", "IPFS_USER"]
        },
        {
            path: "/youtubetoipfs/add-by-cid",
            component: AddVideoByCID,
            permissions: ["IPFS_ADMIN", "IPFS_USER"]
        },
        {
            path: "/youtubetoipfs/video/:id/edit",
            component: EditVideoDetails,
            permissions: ["IPFS_ADMIN", "IPFS_USER"]
        },
        {
            path: "/youtubetoipfs/video/:id",
            component: VideoViewer,
            permissions: [] // Public - anyone can view shared videos
        },
        {
            path: "/youtubetoipfs/admin",
            component: IPFSVideosAdmin,
            permissions: ["IPFS_ADMIN"]
        }
    ],

    // 🧭 NAVIGATION
    navigation: [
        {
            label: "Video Gallery",
            path: "/youtubetoipfs",
            icon: "🎬",
            permissions: ["IPFS_ADMIN", "IPFS_USER"]
        },
        {
            label: "Upload Video",
            path: "/youtubetoipfs/upload",
            icon: "⬆️",
            permissions: ["IPFS_ADMIN", "IPFS_USER"]
        },
        {
            label: "Add by CID",
            path: "/youtubetoipfs/add-by-cid",
            icon: "#️⃣",
            permissions: ["IPFS_ADMIN", "IPFS_USER"]
        },
        {
            label: "Admin Dashboard",
            path: "/youtubetoipfs/admin",
            icon: "⚙️",
            permissions: ["IPFS_ADMIN"]
        }
    ],

    // 🔐 PERMISSIONS
    permissions: {
        view: ["IPFS_ADMIN", "IPFS_USER"],
        create: ["IPFS_ADMIN", "IPFS_USER"],
        edit: ["IPFS_ADMIN", "IPFS_USER"],
        delete: ["IPFS_ADMIN", "IPFS_USER"],
        admin: ["IPFS_ADMIN"]
    },

    // ⚡ QUICK ACTIONS
    quickActions: [
        {
            label: "Upload Video",
            path: "/youtubetoipfs/upload",
            icon: "⬆️",
            description: "Upload a video to IPFS"
        },
        {
            label: "Add by CID",
            path: "/youtubetoipfs/add-by-cid",
            icon: "#️⃣",
            description: "Register existing IPFS video by CID"
        },
        {
            label: "View Gallery",
            path: "/youtubetoipfs",
            icon: "🎬",
            description: "Browse your IPFS video collection"
        },
        {
            label: "Admin Dashboard",
            path: "/youtubetoipfs/admin",
            icon: "⚙️",
            description: "Manage all IPFS videos across users"
        }
    ]
};

export default youtubeToIPFSModuleConfig;