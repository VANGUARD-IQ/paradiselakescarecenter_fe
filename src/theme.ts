import { extendTheme } from "@chakra-ui/react";
import { brandConfig } from "./brandConfig";

/**
 * Centralized Chakra UI Theme Configuration
 *
 * This theme file integrates brandConfig fonts and ensures consistent typography
 * across the entire application.
 */

const theme = extendTheme({
  // Color mode configuration
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },

  // Typography configuration from brandConfig
  fonts: {
    heading: brandConfig.fonts.heading,
    body: brandConfig.fonts.body,
  },

  // Global styles
  styles: {
    global: {
      // Body-level styles
      body: {
        fontFamily: brandConfig.fonts.body,
      },
      // Heading styles
      "h1, h2, h3, h4, h5, h6": {
        fontFamily: brandConfig.fonts.heading,
      },
    },
  },

  // Component-specific overrides
  components: {
    Heading: {
      baseStyle: {
        fontFamily: brandConfig.fonts.heading,
      },
    },
    Text: {
      baseStyle: {
        fontFamily: brandConfig.fonts.body,
      },
    },
    Button: {
      baseStyle: {
        fontFamily: brandConfig.fonts.body,
      },
    },
  },
});

export default theme;
