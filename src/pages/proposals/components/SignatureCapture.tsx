import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  useColorMode,
} from '@chakra-ui/react';
import { getColor } from '../../../brandConfig';

interface SignatureCaptureProps {
  onSignatureCapture: (signature: string) => void;
  disabled?: boolean;
}

export const SignatureCapture: React.FC<SignatureCaptureProps> = ({
  onSignatureCapture,
  disabled = false,
}) => {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const { colorMode } = useColorMode();

  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const cardBorder = colorMode === 'light'
    ? "rgba(0, 0, 0, 0.1)"
    : "rgba(255, 255, 255, 0.1)";

  const clear = () => {
    console.log('🧹 Clearing signature canvas');
    sigCanvas.current?.clear();
    setIsEmpty(true);
    console.log('✅ Signature canvas cleared');
  };

  const save = () => {
    console.log('💾 ========== SAVE SIGNATURE CLICKED ==========');
    console.log('💾 Canvas ref exists:', !!sigCanvas.current);
    console.log('💾 Canvas is empty:', sigCanvas.current?.isEmpty());

    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const signature = sigCanvas.current.toDataURL('image/png');
      console.log('💾 Signature captured:', {
        length: signature.length,
        preview: signature.substring(0, 50) + '...',
        isBase64: signature.startsWith('data:image')
      });

      onSignatureCapture(signature);
      setIsEmpty(false);

      console.log('✅ Signature saved and callback executed');
      console.log('💾 ========== END SAVE SIGNATURE ==========');
    } else {
      console.log('⚠️ Cannot save - canvas is empty or ref is null');
    }
  };

  const handleEnd = () => {
    console.log('✏️ Signature drawing ended');
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      setIsEmpty(false);
      console.log('✏️ Canvas marked as not empty');
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <Text fontWeight="bold" fontSize="md" color={textPrimary}>
        Draw your signature below:
      </Text>

      <Box
        borderWidth="2px"
        borderColor={cardBorder}
        borderRadius="md"
        bg={colorMode === 'light' ? 'white' : 'gray.800'}
        p={2}
        opacity={disabled ? 0.5 : 1}
        pointerEvents={disabled ? 'none' : 'auto'}
      >
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            width: 500,
            height: 200,
            className: 'signature-canvas',
            style: {
              border: '1px dashed #ccc',
              borderRadius: '4px',
            },
          }}
          onEnd={handleEnd}
        />
      </Box>

      <HStack spacing={3}>
        <Button
          size="sm"
          variant="outline"
          onClick={clear}
          isDisabled={isEmpty || disabled}
        >
          Clear Signature
        </Button>
        <Button
          size="sm"
          colorScheme="blue"
          onClick={save}
          isDisabled={isEmpty || disabled}
        >
          Confirm Signature
        </Button>
      </HStack>

      <Text fontSize="xs" color="gray.500">
        By signing, you agree to the terms and conditions outlined in this Service Level Agreement.
      </Text>
    </VStack>
  );
};

export default SignatureCapture;
