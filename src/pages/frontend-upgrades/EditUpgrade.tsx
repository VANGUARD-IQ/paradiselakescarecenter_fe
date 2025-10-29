import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';

const EditUpgrade: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <>
      <NavbarWithCallToAction />
      <Box p={6}>
        <Text>Edit Upgrade {id} - Coming Soon</Text>
        <Text fontSize="sm" color="gray.500" mt={2}>
          For now, please create a new upgrade or update status from the detail view.
        </Text>
      </Box>
      <FooterWithFourColumns />
    </>
  );
};

export default EditUpgrade;
