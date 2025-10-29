import React, { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import {
  Container,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Text,
  Box,
  Progress,
  useToast,
  Image,
} from "@chakra-ui/react";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";

export const UPLOAD_TASK_MEDIA = gql`
  mutation UploadTaskMedia($file: Upload!) {
    uploadTaskMedia(file: $file) {
      url
      description
      fileType
    }
  }
`;

const TestUploadFileToPinata: React.FC = () => {
  const [media, setMedia] = useState<Array<{ url: string; fileType: string; description?: string }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const toast = useToast();

  const [uploadTaskMedia] = useMutation(UPLOAD_TASK_MEDIA, {
    onCompleted: (data) => {
      console.log("Upload completed:", data);
      setUploadProgress(100);
      toast({
        title: "Upload successful",
        status: "success",
        duration: 5000,
      });
    },
    onError: (error) => {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    }
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "video/mp4"
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image, PDF, or MP4 file",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 100);

      const { data } = await uploadTaskMedia({
        variables: { file }
      });

      clearInterval(progressInterval);

      if (data.uploadTaskMedia) {
        setMedia([...media, data.uploadTaskMedia]);
      }

    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const renderMediaPreview = (mediaItem: { url: string; fileType: string }) => {
    if (mediaItem.fileType.startsWith("image/")) {
      return (
        <Image
          src={mediaItem.url}
          alt="Uploaded media"
          maxW="100%"
          maxH="400px"
          objectFit="contain"
          borderRadius="md"
          border="1px solid"
          borderColor="gray.200"
        />
      );
    } else if (mediaItem.fileType === "application/pdf") {
      return (
        <iframe
          src={mediaItem.url}
          width="100%"
          height="500px"
          title="PDF preview"
        />
      );
    } else if (mediaItem.fileType === "video/mp4") {
      return (
        <video controls width="100%">
          <source src={mediaItem.url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    }
    
    return (
      <Text>
        This file type cannot be previewed. <a href={mediaItem.url} target="_blank" rel="noopener noreferrer">Click here to view the file</a>
      </Text>
    );
  };

  return (
    <>
      <NavbarWithCallToAction />
      <Container maxW="container.md" py={8}>
        <VStack spacing={6} align="stretch">
          <Heading>Test Media Upload</Heading>

          <FormControl>
            <FormLabel>Select File</FormLabel>
            <Input
              type="file"
              onChange={handleFileChange}
              accept="image/*,application/pdf,video/mp4"
              disabled={isUploading}
            />
          </FormControl>

          {isUploading && (
            <Box>
              <Text>Uploading... {uploadProgress.toFixed(2)}%</Text>
              <Progress value={uploadProgress} size="sm" colorScheme="blue" />
            </Box>
          )}

          {media.length > 0 && (
            <VStack spacing={4} align="stretch">
              <Text fontWeight="bold">Uploaded Media:</Text>
              {media.map((item, index) => (
                <Box key={index} p={4} borderWidth={1} borderRadius="md">
                  {renderMediaPreview(item)}
                  <Text mt={2}>Type: {item.fileType}</Text>
                  {item.description && <Text>Description: {item.description}</Text>}
                </Box>
              ))}
            </VStack>
          )}
        </VStack>
      </Container>
      <FooterWithFourColumns />
    </>
  );
};

export default TestUploadFileToPinata; 