import * as React from "react"
import {
  Image,
} from "@chakra-ui/react"
import { brandConfig } from "./brandConfig"

// Main Logo component
export const Logo = React.forwardRef<HTMLImageElement, any>((props, ref) => {
  return (
    <Image
      ref={ref}
      src="/plcc/plcclogo.jpg"
      alt={`${brandConfig.siteName} Logo`}
      height={{ base: "40px", md: "50px" }}
      objectFit="contain"
      transition="all 0.3s ease"
      _hover={{
        transform: "scale(1.05)",
      }}
      {...props}
    />
  )
})

Logo.displayName = 'Logo'

export default Logo;