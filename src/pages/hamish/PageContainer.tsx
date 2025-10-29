import React from 'react';
import { Box } from '@chakra-ui/react';

interface PageContainerProps {
  title: string;
  children: React.ReactNode;
}

const PageContainer: React.FC<PageContainerProps> = ({ 
  title, 
  children
}) => {
  React.useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <Box>
      {children}
    </Box>
  );
};

export default PageContainer;