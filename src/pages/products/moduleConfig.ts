import React from "react";
import { ModuleConfig } from "../../types/ModuleConfig";

// Import product components (lazy-loaded for performance)
const AllProducts = React.lazy(() => import("./AllProducts"));
const NewProductForm = React.lazy(() => import("./NewProductForm"));
const ProductView = React.lazy(() => import("./ProductView"));
const Cart = React.lazy(() => import("./Cart"));
const OrderDetails = React.lazy(() => import("./OrderDetails"));

const productsModuleConfig: ModuleConfig = {
    // 🏷️ MODULE IDENTITY
    id: "products",
    name: "Products & Inventory",
    description: "Sell products and manage inventory",
    version: "1.2.1",
    enabled: true,
    category: "ecommerce",
    order: 4,
    icon: "🛒",
    color: "#D69E2E",

    // 🛣️ ROUTES
    routes: [
        {
            path: "/products",
            component: AllProducts,
            permissions: ["ADMIN", "MANAGER"]
        },
        {
            path: "/products/new",
            component: NewProductForm,
            permissions: ["ADMIN", "MANAGER"]
        },
        {
            path: "/products/:id",
            component: ProductView,
            permissions: ["ADMIN", "MANAGER"]
        },
        {
            path: "/cart",
            component: Cart,
            permissions: ["ADMIN", "MANAGER"]
        },
        {
            path: "/order/:id",
            component: OrderDetails,
            permissions: ["ADMIN", "MANAGER"]
        }
    ],

    // 🧭 NAVIGATION
    navigation: [
        {
            label: "All Products",
            path: "/products",
            icon: "📦",
            permissions: ["ADMIN", "MANAGER"]
        },
        {
            label: "New Product",
            path: "/products/new",
            icon: "➕",
            permissions: ["ADMIN", "MANAGER"]
        },
        {
            label: "Shopping Cart",
            path: "/cart",
            icon: "🛒",
            permissions: ["ADMIN", "MANAGER"]
        }
    ],

    // 🔐 PERMISSIONS
    permissions: {
        view: ["USER", "ADMIN", "MANAGER"],
        create: ["ADMIN", "MANAGER"],
        edit: ["ADMIN", "MANAGER"],
        delete: ["ADMIN"]
    },

    // ⚡ QUICK ACTIONS
    quickActions: [
        {
            label: "Add Product",
            path: "/products/new",
            icon: "➕",
            description: "Add a new product to your catalog"
        },
        {
            label: "View Cart",
            path: "/cart",
            icon: "🛒",
            description: "Review items in shopping cart"
        }
    ]
};

export default productsModuleConfig;