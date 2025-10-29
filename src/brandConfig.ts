/**
 * Available Backend Brand Identifiers:
 * - "LifeEssentialsClub" (support@lifeessentials.club)
 * - "TomMillerServices" (contact@tommillerservices.com)
 * - "ByronBayToken" (support@byronbaytoken.com)
 * - "TheConnectionCode" (support@theconnectioncode.com)
 * 
 * Each brand has its own email templates, logos, and sender configurations
 * on the backend. The brandIdentifier must match exactly.
 */

export interface BrandConfig {
  // Core Brand Identity
  siteName: string;                // Main site/brand name displayed in headers and titles
  tagline: string;                 // Short brand slogan or value proposition
  description: string;             // Longer brand description for about sections and meta tags

  // Technical Configuration
  tenantId: string;                // Unique MongoDB tenant ID for data isolation
  apiUrl?: string;                 // Optional override for GraphQL API endpoint
  brandIdentifier: string;         // Backend brand identifier for email templates and notifications

  // Logo and Images
  logo: {
    src: string;                  // Logo image URL or emoji/icon
    alt: string;                  // Alt text for accessibility
    favicon: string;              // Browser favicon path
  };

  // Contact Information
  contact: {
    businessType: string;         // Type of business (e.g., "Business & Blockchain Solutions")
    industry: string;             // Industry category (e.g., "Technology")
    email?: string;               // Primary contact email
    phone?: string;               // Primary contact phone
    address?: string;             // Business physical address
    contactName?: string;         // Primary contact person name
    businessName?: string;        // Legal business name
  };

  // Color Palette
  colors: {
    // Additional accent colors (used throughout the app)
    accentBlue?: string;          // Secondary blue accent color
    primaryBlue?: string;         // Main blue for CTAs and highlights
    primaryBlueHover?: string;    // Hover state for primary blue elements
    starYellow?: string;          // Color for star/favorite icons
    starYellowHover?: string;     // Hover state for star icons
    successGreen?: string;        // Success indicators and checkmarks
    purpleAccent?: string;        // Purple accent for special highlights
    
    // Email module specific colors
    taskCardBg?: string;          // Background for task cards in task lists
    emailPreviewBg?: string;      // Background for email content preview areas
    darkCardBg?: string;          // Dark background for cards in dark theme
    darkBorderSubtle?: string;    // Subtle borders in dark theme
    
    // Highlight colors (for text highlighting and badges)
    highlightYellow?: string;     // Yellow highlight background
    highlightGreen?: string;      // Green highlight background
    highlightBlue?: string;       // Blue highlight background
    highlightPurple?: string;     // Purple highlight background
    highlightRed?: string;        // Red highlight background
    
    badges?: any;                 // Badge color schemes with bg, color, and border
    
    // Primary brand colors
    primary: string;              // Main brand color (buttons, links, primary actions)
    primaryHover: string;         // Hover state for primary color elements
    secondary: string;            // Secondary brand color (secondary actions)
    secondaryHover: string;       // Hover state for secondary color elements

    // Accent colors
    accent: string;               // Accent color for highlights and special elements
    accentLight: string;          // Lighter variant of accent color

    // Background colors
    background: {
      main: string;               // Main page background color
      light: string;              // Light background for sections
      card: string;               // Card/panel background color
      overlay: string;            // Modal/overlay background with transparency
      surface: string;            // Surface color for elevated elements
      darkSurface?: string;       // Dark theme surface color
      cardGradient?: string;      // Gradient background for cards in dark theme
      darkOverlay?: string;       // Dark overlay with transparency
      taskCard?: string;          // Task item background in task lists
      previewBg?: string;         // Email/content preview area background
    };

    // Status colors
    status: {
      success: string;            // Success states, confirmations, completed items
      warning: string;            // Warning states, caution indicators
      error: string;              // Error states, failed operations, deletions
      info: string;               // Informational states, hints, tips
      draft?: string;             // Draft email/document status
      sent?: string;              // Sent email status
      failed?: string;            // Failed email/operation status
      scheduled?: string;         // Scheduled email/task status
      inbound?: string;           // Inbound/received email status
    };

    // Text colors
    text: {
      primary: string;            // Primary text color (headings, important text)
      secondary: string;          // Secondary text color (body text)
      muted: string;              // Muted text (hints, placeholders, less important)
      inverse: string;            // Inverse text (white text on dark backgrounds)
      primaryDark?: string;       // Primary text for dark theme
      secondaryDark?: string;     // Secondary text for dark theme
      mutedDark?: string;         // Muted text for dark theme
    };

    // Border colors
    border: {
      light: string;              // Light borders (subtle separators)
      medium: string;             // Medium borders (standard borders)
      dark: string;               // Dark borders (emphasized borders)
      darkCard?: string;          // Card borders in dark theme
    };
  };

  // Typography
  fonts: {
    heading: string;              // Font family for headings (h1-h6)
    body: string;                 // Font family for body text and UI elements
  };

  // Component styling
  components: {
    button: {
      primaryBg: string;          // Primary button background color
      primaryHover: string;       // Primary button hover background
      secondaryBg: string;        // Secondary button background color
      secondaryHover: string;     // Secondary button hover background
      whiteBg?: string;           // White button background (for dark backgrounds)
      whiteText?: string;         // White button text color
      whiteHover?: string;        // White button hover background
      blueBg?: string;            // Blue button background (email module)
      blueHover?: string;         // Blue button hover background
    };
    tooltip?: {
      bg: string;                 // Tooltip background color
      color: string;              // Tooltip text color
      errorBg?: string;           // Error tooltip background
      darkBg?: string;            // Dark theme tooltip background
    };
    menu?: {
      bg: string;                 // Dropdown menu background
      itemBg: string;             // Menu item background
      itemColor: string;          // Menu item text color
      itemHoverBg: string;        // Menu item hover background
      itemHoverColor: string;     // Menu item hover text color
      borderColor: string;        // Menu border color
    };
    card: {
      bg: string;                 // Card background color
      border: string;             // Card border color
      shadow: string;             // Card shadow (elevation)
      darkShadow?: string;        // Card shadow in dark theme
      backdropFilter?: string;    // Backdrop filter for glass effect
      hoverShadow?: string;       // Card shadow on hover
    };
    navbar: {
      bg: string;                 // Navigation bar background
      text: string;               // Navigation bar text color
      shadow: string;             // Navigation bar shadow
    };
    footer: {
      bg: string;                 // Footer background color
      text: string;               // Footer text color
      linkColor: string;          // Footer link color
      linkHover: string;          // Footer link hover color
    };
    form: {
      bg: string;                 // Form background color
      fieldBg: string;            // Input field background
      fieldBorder: string;        // Input field border
      fieldBorderFocus: string;   // Input field border when focused
      fieldShadow: string;        // Input field shadow
      fieldShadowFocus: string;   // Input field shadow when focused
      labelColor: string;         // Form label text color
      placeholderColor: string;   // Input placeholder text color
    };
  };

  // Business specific
  membership: {
    totalLegacyMemberships: number;  // Total number of legacy members
    memberBenefits: {
      discount: string;               // Member discount description
      features: string[];             // List of member benefits/features
    };
  };
}

// Paradise Lakes Care Center Configuration
export const brandConfig: BrandConfig = {
  // Core Brand Identity
  siteName: "Paradise Lakes Care Center",
  tagline: "Quality Care & Support Services",
  description: "Dedicated to providing exceptional care and support services in a welcoming environment.",

  // Technical Configuration
  tenantId: "68f85b375932556228e4cbb8",
  brandIdentifier: "ParadiseLakesCareCenter",

  // Logo and Images
  logo: {
    src: "/plcc/plcclogo.jpg", // Paradise Lakes Care Center logo
    alt: "Paradise Lakes Care Center Logo",
    favicon: "%PUBLIC_URL%/favicon.ico"
  },

  // Contact Information
  contact: {
    businessType: "Care Center",
    industry: "Healthcare",
    email: "support@paradiselakescarecentre.com.au",
    phone: "+61 481076242",
    address: "Paradise Lakes Care Center, Australia",
    contactName: "Paradise Lakes Care Center",
    businessName: "Paradise Lakes Care Center"
  },

  // Color Palette - Paradise Lakes Care Center Blue
  colors: {
    // Primary brand colors (Care Center blue)
    primary: "#5bbce9",        // Paradise Lakes primary blue
    primaryHover: "#4aa8d5",   // Darker blue on hover
    secondary: "#7fd4f0",      // Light blue accent
    secondaryHover: "#5bbce9", // Darker light blue

    // Accent colors
    accent: "#5bbce9",
    accentLight: "#d4f1fa",    // Very light blue

    // Background colors (Light theme)
    background: {
      main: "#FFFFFF",         // White background
      light: "#FAFAFA",        // Off-white
      card: "#FFFFFF",         // White cards
      overlay: "rgba(0, 122, 255, 0.05)", // Light blue overlay
      surface: "#F5F5F7",      // Mac surface gray
      // New dark theme additions
      darkSurface: "#08090a",
      cardGradient: "linear-gradient(135deg, rgba(20, 20, 20, 0.8) 0%, rgba(30, 30, 30, 0.6) 50%, rgba(20, 20, 20, 0.8) 100%)",
      darkOverlay: "rgba(0, 0, 0, 0.2)",
      taskCard: "rgba(45, 45, 55, 0.3)",     // Dark gray for task items
      previewBg: "rgba(45, 45, 55, 0.3)"      // Email preview background
    },

    // Status colors (Mac system colors)
    status: {
      success: "#30D158",      // Mac green
      warning: "#FF9F0A",      // Mac orange
      error: "#FF3B30",        // Mac red
      info: "#007AFF",         // Mac blue
      draft: "#6B7280",        // Gray for draft status
      sent: "#22C55E",         // Green for sent
      failed: "#EF4444",       // Red for failed
      scheduled: "#3B82F6",    // Blue for scheduled
      inbound: "#8B5CF6"       // Purple for inbound
    },

    // Text colors (Mac-like typography)
    text: {
      primary: "#1D1D1F",      // Mac primary text
      secondary: "#6E6E73",    // Mac secondary text
      muted: "#8E8E93",        // Mac tertiary text
      inverse: "#FFFFFF",      // White text
      // Dark theme text colors
      primaryDark: "#FFFFFF",
      secondaryDark: "rgba(255, 255, 255, 0.7)",
      mutedDark: "rgba(255, 255, 255, 0.5)"
    },

    // Border colors (Subtle Mac borders)
    border: {
      light: "rgba(0, 0, 0, 0.05)",   // Very light border
      medium: "rgba(0, 0, 0, 0.1)",   // Light border
      dark: "rgba(0, 0, 0, 0.2)",     // Medium border
      // Dark theme borders
      darkCard: "rgba(255, 255, 255, 0.1)"
    },
    
    // Additional colors (shared across themes)
    accentBlue: "#369eff",
    primaryBlue: "#3B82F6",
    primaryBlueHover: "#2563EB",
    starYellow: "#FBBF24",
    starYellowHover: "#F59E0B",
    successGreen: "#22C55E",
    purpleAccent: "#A855F7",
    
    // Email module specific colors
    taskCardBg: "rgba(45, 45, 55, 0.3)",
    emailPreviewBg: "rgba(45, 45, 55, 0.3)",
    darkCardBg: "rgba(20, 20, 20, 0.9)",
    darkBorderSubtle: "rgba(255, 255, 255, 0.05)",
    highlightYellow: "#FEF3C7",
    highlightGreen: "#D1FAE5",
    highlightBlue: "#DBEAFE",
    highlightPurple: "#E9D5FF",
    highlightRed: "#FEE2E2",
    
    // Badge colors with transparency
    badges: {
      blue: {
        bg: "rgba(59, 130, 246, 0.2)",
        color: "#3B82F6",
        border: "rgba(59, 130, 246, 0.3)"
      },
      green: {
        bg: "rgba(34, 197, 94, 0.2)",
        color: "#22C55E",
        border: "rgba(34, 197, 94, 0.3)"
      },
      purple: {
        bg: "rgba(168, 85, 247, 0.2)",
        color: "#A855F7",
        border: "rgba(168, 85, 247, 0.3)"
      },
      yellow: {
        bg: "rgba(251, 191, 36, 0.2)",
        color: "#FBBF24",
        border: "rgba(251, 191, 36, 0.3)"
      },
      gray: {
        bg: "rgba(107, 114, 128, 0.2)",
        color: "#6B7280",
        border: "rgba(107, 114, 128, 0.3)"
      },
      orange: {
        bg: "rgba(251, 146, 60, 0.2)",
        color: "#FB923C",
        border: "rgba(251, 146, 60, 0.3)"
      },
      teal: {
        bg: "rgba(20, 184, 166, 0.2)",
        color: "#14B8A6",
        border: "rgba(20, 184, 166, 0.3)"
      },
      cyan: {
        bg: "rgba(6, 182, 212, 0.2)",
        color: "#06B6D4",
        border: "rgba(6, 182, 212, 0.3)"
      }
    }
  },

  // Typography (Thunder Compute uses Geist font)
  fonts: {
    heading: "Geist, -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
    body: "Geist, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif"
  },

  // Component styling
  components: {
    button: {
      primaryBg: "#5bbce9",
      primaryHover: "#4aa8d5",
      secondaryBg: "rgba(91, 188, 233, 0.1)",
      secondaryHover: "rgba(91, 188, 233, 0.2)",
      // Dark theme button styles (actually for light buttons on dark backgrounds)
      whiteBg: "#FFFFFF",
      whiteText: "#000000",
      whiteHover: "#F5F5F5",
      // Email module specific buttons
      blueBg: "#3B82F6",
      blueHover: "#2563EB"
    },
    tooltip: {
      bg: "#3B82F6",
      color: "#FFFFFF",
      errorBg: "#EF4444",
      darkBg: "#1a1a2e"
    },
    menu: {
      bg: "rgba(60, 60, 60, 0.98)",           // Silver-ish dark background
      itemBg: "transparent",                   // Transparent item background
      itemColor: "#E5E5E5",                   // Light silver text
      itemHoverBg: "rgba(192, 192, 192, 0.2)", // Silver hover background
      itemHoverColor: "#FFFFFF",               // White text on hover
      borderColor: "rgba(192, 192, 192, 0.3)"  // Silver border
    },
    card: {
      bg: "#FFFFFF",
      border: "rgba(0, 0, 0, 0.06)",
      shadow: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
      // Dark theme card styles
      darkShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      hoverShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
      backdropFilter: "blur(10px)"
    },
    navbar: {
      bg: "#FFFFFF",
      text: "#1A202C",
      shadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
    },
    footer: {
      bg: "#F7FAFC",
      text: "#4A5568",
      linkColor: "#5bbce9",
      linkHover: "#4aa8d5"
    },
    form: {
      bg: "#FFFFFF",
      fieldBg: "#FFFFFF",
      fieldBorder: "rgba(0, 0, 0, 0.1)",
      fieldBorderFocus: "#5bbce9",
      fieldShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
      fieldShadowFocus: "0 0 0 3px rgba(91, 188, 233, 0.1), 0 1px 2px rgba(0, 0, 0, 0.05)",
      labelColor: "#1D1D1F",
      placeholderColor: "#8E8E93"
    }
  },

  // Business specific
  membership: {
    totalLegacyMemberships: 0,
    memberBenefits: {
      discount: "Care services",
      features: [
        "Quality Care Services",
        "Professional Support",
        "Personalized Assistance",
        "Dedicated Staff"
      ]
    }
  },
};

// Theme-specific color configurations
export const lightTheme = {
  // Primary brand colors
  primary: "#5bbce9",
  primaryHover: "#4aa8d5",
  secondary: "#7fd4f0",
  secondaryHover: "#5bbce9",

  // Accent colors
  accent: "#5bbce9",
  accentLight: "#d4f1fa",

  // Background colors (Light theme)
  background: {
    main: "#FFFFFF",
    light: "#F7FAFC",
    card: "#FFFFFF",
    overlay: "rgba(0, 0, 0, 0.05)",
    surface: "#F5F5F7",
    cardGradient: "linear-gradient(135deg, #FFFFFF 0%, #F7FAFC 100%)",
    darkOverlay: "rgba(0, 0, 0, 0.1)",
    taskCard: "#F7FAFC",
    previewBg: "#F7FAFC"
  },

  // Text colors (Light theme)
  text: {
    primary: "#1A202C",
    secondary: "#4A5568",
    muted: "#718096",
    inverse: "#FFFFFF",
    primaryDark: "#1A202C",
    secondaryDark: "#4A5568",
    mutedDark: "#718096"
  },

  // Border colors (Light theme)
  border: {
    light: "#E2E8F0",
    medium: "#CBD5E0",
    dark: "#A0AEC0",
    darkCard: "#E2E8F0"
  },

  // Component colors (Light theme)
  components: {
    card: {
      bg: "#FFFFFF",
      border: "#E2E8F0",
      shadow: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
      darkShadow: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
      hoverShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
      backdropFilter: "none"
    },
    navbar: {
      bg: "#FFFFFF",
      text: "#1A202C",
      shadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
    },
    footer: {
      bg: "#F7FAFC",
      text: "#4A5568",
      linkColor: "#5bbce9",
      linkHover: "#4aa8d5"
    },
    button: {
      primaryBg: "#5bbce9",
      primaryHover: "#4aa8d5",
      secondaryBg: "rgba(91, 188, 233, 0.1)",
      secondaryHover: "rgba(91, 188, 233, 0.2)",
      whiteBg: "#1A202C",
      whiteText: "#FFFFFF",
      whiteHover: "#2D3748",
      blueBg: "#5bbce9",
      blueHover: "#4aa8d5"
    }
  }
};

export const darkTheme = {
  // Primary brand colors
  primary: "#5bbce9",
  primaryHover: "#4aa8d5",
  secondary: "#7fd4f0",
  secondaryHover: "#5bbce9",

  // Accent colors
  accent: "#5bbce9",
  accentLight: "#d4f1fa",

  // Background colors (Dark theme - current values)
  background: {
    main: "#08090a",
    light: "#FAFAFA",
    card: "#FFFFFF",
    overlay: "rgba(0, 122, 255, 0.05)",
    surface: "#F5F5F7",
    darkSurface: "#08090a",
    cardGradient: "linear-gradient(135deg, rgba(20, 20, 20, 0.8) 0%, rgba(30, 30, 30, 0.6) 50%, rgba(20, 20, 20, 0.8) 100%)",
    darkOverlay: "rgba(0, 0, 0, 0.2)",
    taskCard: "rgba(45, 45, 55, 0.3)",
    previewBg: "rgba(45, 45, 55, 0.3)"
  },

  // Text colors (Dark theme - current values)
  text: {
    primary: "#1D1D1F",
    secondary: "#6E6E73",
    muted: "#8E8E93",
    inverse: "#FFFFFF",
    primaryDark: "#FFFFFF",
    secondaryDark: "rgba(255, 255, 255, 0.7)",
    mutedDark: "rgba(255, 255, 255, 0.5)"
  },

  // Border colors (Dark theme - current values)
  border: {
    light: "rgba(0, 0, 0, 0.05)",
    medium: "rgba(0, 0, 0, 0.1)",
    dark: "rgba(0, 0, 0, 0.2)",
    darkCard: "rgba(255, 255, 255, 0.1)"
  },

  // Component colors (Dark theme)
  components: {
    card: {
      bg: "#FFFFFF",
      border: "rgba(0, 0, 0, 0.06)",
      shadow: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
      darkShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      hoverShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
      backdropFilter: "blur(10px)"
    },
    navbar: {
      bg: "#08090a",
      text: "#FFFFFF",
      shadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
    },
    footer: {
      bg: "#141414",
      text: "rgba(255, 255, 255, 0.7)",
      linkColor: "#5bbce9",
      linkHover: "#7fd4f0"
    },
    button: {
      primaryBg: "#5bbce9",
      primaryHover: "#4aa8d5",
      secondaryBg: "rgba(91, 188, 233, 0.1)",
      secondaryHover: "rgba(91, 188, 233, 0.2)",
      whiteBg: "#FFFFFF",
      whiteText: "#000000",
      whiteHover: "#F5F5F5",
      blueBg: "#5bbce9",
      blueHover: "#4aa8d5"
    },
    form: {
      bg: "rgba(20, 20, 20, 0.8)",
      fieldBg: "rgba(30, 30, 35, 0.8)",
      fieldBorder: "rgba(255, 255, 255, 0.1)",
      fieldBorderFocus: "#007AFF",
      fieldShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
      fieldShadowFocus: "0 0 0 3px rgba(0, 122, 255, 0.2), 0 1px 2px rgba(0, 0, 0, 0.3)",
      labelColor: "#FFFFFF"
    }
  }
};

// Helper function with color mode support
export const getColor = (path: string, colorMode?: 'light' | 'dark'): string => {
  // If no color mode specified, try to get it from localStorage or default to dark
  const mode = colorMode || (localStorage.getItem('chakra-ui-color-mode') as 'light' | 'dark') || 'dark';
  const theme = mode === 'light' ? lightTheme : darkTheme;

  const keys = path.split(".");

  // Special handling for component paths
  if (keys[0] === "components") {
    let value: any = theme;
    for (const key of keys) {
      value = value[key];
      if (value === undefined) {
        // Try to find in brandConfig.colors for backwards compatibility
        let fallback: any = brandConfig.colors;
        const colorKeys = keys.slice(1);
        for (const key of colorKeys) {
          fallback = fallback[key];
          if (fallback === undefined) break;
        }
        if (fallback !== undefined) return fallback;

        console.warn(`Color path "${path}" not found in theme config for mode: ${mode}`);
        return "#007AFF"; // Fallback to primary
      }
    }
    return value;
  }

  // Default handling for colors object
  let value: any = theme;
  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      // Try to find in brandConfig.colors for backwards compatibility
      let fallback: any = brandConfig.colors;
      for (const key of keys) {
        fallback = fallback[key];
        if (fallback === undefined) break;
      }
      if (fallback !== undefined) return fallback;

      console.warn(`Color path "${path}" not found in theme config for mode: ${mode}`);
      return "#007AFF"; // Fallback to primary
    }
  }

  return value;
};

export const getBrandValue = (path: string): any => {
  const keys = path.split(".");
  let value: any = brandConfig;

  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Brand config path "${path}" not found`);
      return null;
    }
  }

  return value;
};

export const getComponent = (component: string, property: string, colorMode?: 'light' | 'dark'): string => {
  // If no color mode specified, try to get it from localStorage or default to dark
  const mode = colorMode || (localStorage.getItem('chakra-ui-color-mode') as 'light' | 'dark') || 'dark';
  const theme = mode === 'light' ? lightTheme : darkTheme;

  const componentConfig = (theme.components as any)?.[component];
  if (!componentConfig) {
    // Fall back to brandConfig for backwards compatibility
    const fallbackConfig = (brandConfig.components as any)[component];
    if (fallbackConfig) {
      const value = fallbackConfig[property];
      if (value) return value;
    }
    console.warn(`Component "${component}" not found in theme config for mode: ${mode}`);
    return "#007AFF";
  }

  const value = componentConfig[property];
  if (!value) {
    // Fall back to brandConfig for backwards compatibility
    const fallbackConfig = (brandConfig.components as any)[component];
    if (fallbackConfig) {
      const fallbackValue = fallbackConfig[property];
      if (fallbackValue) return fallbackValue;
    }
    console.warn(`Property "${property}" not found for component "${component}" in mode: ${mode}`);
    return "#007AFF";
  }

  return value;
};


// CSS Custom Properties Generator
export const generateCSSCustomProperties = (): string => {
  const { colors } = brandConfig;

  return `
    :root {
      --brand-primary: ${colors.primary};
      --brand-primary-hover: ${colors.primaryHover};
      --brand-secondary: ${colors.secondary};
      --brand-secondary-hover: ${colors.secondaryHover};
      --brand-accent: ${colors.accent};
      --brand-accent-light: ${colors.accentLight};
      
      --brand-bg-main: ${colors.background.main};
      --brand-bg-light: ${colors.background.light};
      --brand-bg-card: ${colors.background.card};
      --brand-bg-overlay: ${colors.background.overlay};
      --brand-bg-surface: ${colors.background.surface};
      
      --brand-success: ${colors.status.success};
      --brand-warning: ${colors.status.warning};
      --brand-error: ${colors.status.error};
      --brand-info: ${colors.status.info};
      
      --brand-text-primary: ${colors.text.primary};
      --brand-text-secondary: ${colors.text.secondary};
      --brand-text-muted: ${colors.text.muted};
      --brand-text-inverse: ${colors.text.inverse};
      
      --brand-border-light: ${colors.border.light};
      --brand-border-medium: ${colors.border.medium};
      --brand-border-dark: ${colors.border.dark};
      
      --brand-font-heading: ${brandConfig.fonts.heading};
      --brand-font-body: ${brandConfig.fonts.body};
    }
  `;
};

export default brandConfig; 