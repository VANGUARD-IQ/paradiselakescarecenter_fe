import { Box } from '@chakra-ui/react';

/**
 * Animated sunshine rays background effect
 * Creates diagonal light beams with flickering god rays
 */
export const SunshineBackground = () => {
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      pointerEvents="none"
      zIndex={0}
      overflow="hidden"
    >
      {/* Main wide sunshine beam */}
      <Box
        position="absolute"
        top="-30%"
        left="0%"
        width="0"
        height="0"
        borderStyle="solid"
        borderWidth="0 25vw 150vh 25vw"
        borderColor="transparent transparent rgba(255, 255, 255, 0.25) transparent"
        transform="rotate(-15deg)"
        transformOrigin="top center"
        animation="sunshine 12s ease-in-out infinite"
        filter="blur(40px)"
        sx={{
          '@keyframes sunshine': {
            '0%, 100%': { opacity: 0.4 },
            '50%': { opacity: 0.7 },
          },
        }}
      />

      {/* Flickering God Rays */}
      <Box
        position="absolute"
        top="-10%"
        left="12%"
        width="1.5px"
        height="120%"
        background="rgba(255, 255, 255, 0.12)"
        transform="rotate(-15deg)"
        transformOrigin="top left"
        animation="flicker1 6s ease-in-out infinite"
        filter="blur(1px)"
        sx={{
          '@keyframes flicker1': {
            '0%': { opacity: 0 },
            '10%': { opacity: 0.5 },
            '30%': { opacity: 0.3 },
            '50%': { opacity: 0 },
            '70%': { opacity: 0.4 },
            '100%': { opacity: 0 },
          },
        }}
      />
      <Box
        position="absolute"
        top="-10%"
        left="18%"
        width="1px"
        height="120%"
        background="rgba(255, 255, 255, 0.1)"
        transform="rotate(-15deg)"
        transformOrigin="top left"
        animation="flicker2 8s ease-in-out infinite 1s"
        filter="blur(1px)"
        sx={{
          '@keyframes flicker2': {
            '0%': { opacity: 0.3 },
            '25%': { opacity: 0 },
            '40%': { opacity: 0.5 },
            '60%': { opacity: 0.2 },
            '85%': { opacity: 0 },
            '100%': { opacity: 0.3 },
          },
        }}
      />
      <Box
        position="absolute"
        top="-10%"
        left="24%"
        width="1.5px"
        height="120%"
        background="rgba(255, 255, 255, 0.15)"
        transform="rotate(-15deg)"
        transformOrigin="top left"
        animation="flicker3 7s ease-in-out infinite 2s"
        filter="blur(1px)"
        sx={{
          '@keyframes flicker3': {
            '0%': { opacity: 0 },
            '20%': { opacity: 0.6 },
            '45%': { opacity: 0 },
            '65%': { opacity: 0.3 },
            '90%': { opacity: 0.5 },
            '100%': { opacity: 0 },
          },
        }}
      />
      <Box
        position="absolute"
        top="-10%"
        left="30%"
        width="1px"
        height="120%"
        background="rgba(255, 255, 255, 0.08)"
        transform="rotate(-15deg)"
        transformOrigin="top left"
        animation="flicker4 9s ease-in-out infinite 3s"
        filter="blur(1px)"
        sx={{
          '@keyframes flicker4': {
            '0%': { opacity: 0.4 },
            '30%': { opacity: 0 },
            '55%': { opacity: 0.3 },
            '75%': { opacity: 0 },
            '95%': { opacity: 0.2 },
            '100%': { opacity: 0.4 },
          },
        }}
      />
      <Box
        position="absolute"
        top="-10%"
        left="36%"
        width="1.5px"
        height="120%"
        background="rgba(255, 255, 255, 0.13)"
        transform="rotate(-15deg)"
        transformOrigin="top left"
        animation="flicker5 5.5s ease-in-out infinite 1.5s"
        filter="blur(1px)"
        sx={{
          '@keyframes flicker5': {
            '0%': { opacity: 0 },
            '15%': { opacity: 0.4 },
            '40%': { opacity: 0.6 },
            '60%': { opacity: 0 },
            '80%': { opacity: 0.3 },
            '100%': { opacity: 0 },
          },
        }}
      />
      <Box
        position="absolute"
        top="-10%"
        left="42%"
        width="1px"
        height="120%"
        background="rgba(255, 255, 255, 0.09)"
        transform="rotate(-15deg)"
        transformOrigin="top left"
        animation="flicker6 10s ease-in-out infinite 4s"
        filter="blur(1px)"
        sx={{
          '@keyframes flicker6': {
            '0%': { opacity: 0.2 },
            '25%': { opacity: 0.5 },
            '50%': { opacity: 0 },
            '70%': { opacity: 0.4 },
            '90%': { opacity: 0 },
            '100%': { opacity: 0.2 },
          },
        }}
      />
      <Box
        position="absolute"
        top="-10%"
        left="48%"
        width="1.5px"
        height="120%"
        background="rgba(255, 255, 255, 0.11)"
        transform="rotate(-15deg)"
        transformOrigin="top left"
        animation="flicker7 6.5s ease-in-out infinite 2.5s"
        filter="blur(1px)"
        sx={{
          '@keyframes flicker7': {
            '0%': { opacity: 0 },
            '20%': { opacity: 0.5 },
            '45%': { opacity: 0.3 },
            '70%': { opacity: 0 },
            '85%': { opacity: 0.6 },
            '100%': { opacity: 0 },
          },
        }}
      />
    </Box>
  );
};
