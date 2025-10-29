import React, { useEffect, useState } from "react";
import { gql, useLazyQuery } from "@apollo/client";
import { 
  Box, 
  SimpleGrid, 
  Image, 
  Spinner, 
  Icon,
  useToast
} from "@chakra-ui/react";
import { AttachmentIcon } from "@chakra-ui/icons";

interface FilePreviewListProps {
  hashes: string[];
}

export const FilePreviewList: React.FC<FilePreviewListProps> = ({ hashes }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [imageDataMap, setImageDataMap] = useState<Record<string, string>>({});
  const toast = useToast();

const GET_FILES = gql`
  query GetFiles($hashes: [String!]!) {
    getFiles(hashes: $hashes)
  }
`;

  const [getFiles] = useLazyQuery(GET_FILES, {
    onError: (error) => {
      console.error("Error loading files:", error);
      toast({
        title: "Error loading files",
        description: error.message,
        status: "error",
        duration: 5000,
      });
      setIsLoading(false);
    }
  });

  useEffect(() => {
    const loadFiles = async () => {
      if (hashes.length === 0) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        const { data } = await getFiles({
          variables: { hashes }
        });

        if (data?.getFiles) {
          const newImageDataMap: Record<string, string> = {};
          data.getFiles.forEach((base64Data: string, index: number) => {
            if (base64Data) {
              newImageDataMap[hashes[index]] = `data:image/png;base64,${base64Data}`;
            }
          });
          setImageDataMap(newImageDataMap);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadFiles();
  }, [hashes.join(","), getFiles]);

  const handleImageClick = (hash: string) => {
    window.open(`/file/${hash}`, "_blank");
  };

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
      {hashes.map(hash => (
        <Box 
          key={hash} 
          position="relative"
          borderRadius="md"
          overflow="hidden"
          boxShadow="sm"
        >
          {isLoading ? (
            <Box 
              height="120px" 
              bg="gray.100" 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
            >
              <Spinner size="md" />
            </Box>
          ) : imageDataMap[hash] ? (
            <Image
              src={imageDataMap[hash]}
              alt="Attachment preview"
              objectFit="cover"
              width="100%"
              height="120px"
              onClick={() => handleImageClick(hash)}
              cursor="pointer"
              transition="transform 0.2s"
              _hover={{
                transform: "scale(1.05)"
              }}
            />
          ) : (
            <Box 
              height="120px" 
              bg="gray.100" 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
            >
              <Icon as={AttachmentIcon} boxSize="6" color="gray.500" />
            </Box>
          )}
        </Box>
      ))}
    </SimpleGrid>
  );
}; 