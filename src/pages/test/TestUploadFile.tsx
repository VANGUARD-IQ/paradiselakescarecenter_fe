import React, { useState } from "react";
// Lighthouse removed - functionality disabled
import {
  Container,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Text,
  Code,
  Box,
  Progress,
  useToast,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";

const TestUploadFile: React.FC = () => {
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const toast = useToast();

  const progressCallback = (progressData: any) => {
    let percentageDone = 0;
    if (progressData?.total && progressData?.uploaded) {
      const fraction = progressData.uploaded / progressData.total;
      percentageDone = parseFloat((fraction * 100).toFixed(2));
    }
    console.log("Upload progress:", percentageDone);
    setUploadProgress(percentageDone);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    // Lighthouse functionality disabled
    toast({
      title: "Feature Disabled",
      description: "Lighthouse upload functionality has been removed from this project",
      status: "warning",
      duration: 5000,
    });
  };

  return (
    <>
      <NavbarWithCallToAction />
      <Container maxW="container.md" py={8}>
        <VStack spacing={6} align="stretch">
          <Heading>Test File Upload</Heading>
          
          <Alert status="warning">
            <AlertIcon />
            Lighthouse upload functionality has been removed from this project
          </Alert>

          <FormControl>
            <FormLabel>Select File</FormLabel>
            <Input
              type="file"
              onChange={handleFileChange}
              accept="*/*"
              disabled={isUploading}
            />
          </FormControl>

          {isUploading && (
            <Box>
              <Text>Uploading... {uploadProgress.toFixed(2)}%</Text>
              <Progress value={uploadProgress} size="sm" colorScheme="blue" />
            </Box>
          )}

          {uploadResult && (
            <Box mt={4} p={4} borderWidth={1} borderRadius="md">
              <Text fontWeight="bold">Upload Result:</Text>
              <Code display="block" whiteSpace="pre" p={2} mt={2}>
                {JSON.stringify(uploadResult, null, 2)}
              </Code>
              {uploadResult.data.Hash && (
                <Text mt={2}>
                  View file at:{" "}
                  <a
                    href={`https://gateway.lighthouse.storage/ipfs/${uploadResult.data.Hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://gateway.lighthouse.storage/ipfs/{uploadResult.data.Hash}
                  </a>
                </Text>
              )}
            </Box>
          )}
        </VStack>
      </Container>
      <FooterWithFourColumns />
    </>
  );
};

export default TestUploadFile; 