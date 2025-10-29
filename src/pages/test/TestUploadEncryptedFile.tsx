import React, { useState, useEffect } from "react";
import { gql, useMutation, useLazyQuery } from "@apollo/client";
import {
  Container,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Code,
  Box,
  useToast,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";

const UPLOAD_ENCRYPTED_FILE = gql`
  mutation UploadFile($file: Upload!) {
    uploadFile(file: $file)
  }
`;

const GET_FILE = gql`
  query GetFile($hash: String!) {
    getFile(hash: $hash)
  }
`;

const TestUploadEncryptedFile: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const toast = useToast();

  const [uploadFile, { loading: isUploading }] = useMutation(UPLOAD_ENCRYPTED_FILE);
  const [getFile, { loading: isLoading }] = useLazyQuery(GET_FILE);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      const { data } = await uploadFile({
        variables: { file },
        context: {
          headers: {
            "apollo-require-preflight": "true",
            "x-apollo-operation-name": "UploadFile"
          }
        }
      });

      console.log("Upload response:", data);
      setUploadResult(data.uploadFile);

      toast({
        title: "Upload successful",
        description: "File encrypted and uploaded successfully!",
        status: "success",
        duration: 5000,
      });

    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleViewFile = async (hash: string) => {
    try {
      const { data } = await getFile({
        variables: { hash }
      });

      if (data?.getFile) {
        // Convert base64 to blob
        const binaryString = window.atob(data.getFile);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes]);
        const url = URL.createObjectURL(blob);
        
        // Set the file content for rendering
        setFileContent(url);
      }
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        status: "error",
        duration: 5000,
      });
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup blob URL when component unmounts or when fileContent changes
      if (fileContent) {
        URL.revokeObjectURL(fileContent);
      }
    };
  }, [fileContent]);

  return (
    <>
      <NavbarWithCallToAction />
      <Container maxW="container.md" py={8}>
        <VStack spacing={6} align="stretch">
          <Heading>Test Encrypted File Upload (Backend)</Heading>

          <FormControl>
            <FormLabel>Select File to Encrypt & Upload</FormLabel>
            <Input
              type="file"
              onChange={handleFileChange}
              accept="*/*"
              disabled={isUploading}
            />
          </FormControl>

          {file && (
            <Box>
              <Text>Selected file: {file.name}</Text>
              <Text>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</Text>
            </Box>
          )}

          <Button
            colorScheme="blue"
            onClick={handleUpload}
            isLoading={isUploading}
            loadingText="Uploading..."
            disabled={!file}
          >
            Upload Encrypted File
          </Button>

          {uploadResult && (
            <Box mt={4} p={4} borderWidth={1} borderRadius="md">
              <Text fontWeight="bold">Upload Result:</Text>
              <Code display="block" whiteSpace="pre" p={2} mt={2}>
                File Hash: {uploadResult}
                <RouterLink to={`/file/${uploadResult}`} target="_blank">
                  <Button size="sm" ml={2}>
                    Open in new tab
                  </Button>
                </RouterLink>
              </Code>
            </Box>
          )}
        </VStack>
      </Container>
      <FooterWithFourColumns />
    </>
  );
};

export default TestUploadEncryptedFile;
