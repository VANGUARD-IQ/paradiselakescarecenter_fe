import * as React from "react"
import {
  Text,
  HStack,
  Box,
  Icon,
  useColorMode,
} from "@chakra-ui/react"
import { getColor, brandConfig } from "./brandConfig"


// Lightning bolt SVG icon
const LightningIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M7 2v11h3v9l7-12h-4l4-8z"
    />
  </Icon>
)

// Custom Lightning Logo Component
const LightningLogo = ({ size = 32 }: { size?: number }) => {
  return (
    <Box 
      display="inline-flex" 
      alignItems="center" 
      justifyContent="center"
      w={`${size}px`}
      h={`${size}px`}
      position="relative"
      transition="all 0.3s ease"
      _hover={{
        transform: "scale(1.1)",
      }}
    >
      <LightningIcon 
        w={`${size * 0.8}px`}
        h={`${size * 0.8}px`}
        color="#369eff"
        filter="drop-shadow(0 2px 4px rgba(54, 158, 255, 0.3))"
      />
    </Box>
  )
}

// Main Logo component
export const Logo = React.forwardRef<HTMLDivElement, any>((props, ref) => {
  const { colorMode } = useColorMode();

  return (
    <HStack spacing={2} align="center" ref={ref} {...props}>
      <LightningLogo size={28} />
      <Text
        fontSize={{ base: "lg", md: "xl" }}
        fontWeight="600"
        color={colorMode === 'light' ? "#1A202C" : "white"}
        letterSpacing="-0.02em"
        whiteSpace="nowrap"
        fontFamily="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
      >
        {brandConfig.siteName}
      </Text>
    </HStack>
  )
})

Logo.displayName = 'Logo'

export default Logo;