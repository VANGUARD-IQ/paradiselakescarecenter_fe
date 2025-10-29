import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  useToast,
} from "@chakra-ui/react";
import { gql, useMutation } from "@apollo/client";

const ADD_SHIPPING_ADDRESS = gql`
  mutation AddShippingAddress($input: ClientShippingDetailsInput!) {
    addClientShippingAddress(input: $input) {
      id
      shippingAddresses {
        name
        phone
        address {
          street
          city
          state
          postcode
          country
        }
        isDefault
        instructions
      }
    }
  }
`;

interface ShippingAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientData: {
    fName: string;
    lName: string;
    phoneNumber: string;
  };
  onAddressAdded: () => void;
}

export const ShippingAddressModal: React.FC<ShippingAddressModalProps> = ({
  isOpen,
  onClose,
  clientData,
  onAddressAdded
}) => {
  const [formData, setFormData] = React.useState({
    name: `${clientData.fName} ${clientData.lName}`,
    phone: clientData.phoneNumber || "",
    street: "",
    city: "",
    state: "",
    postcode: "",
    country: "",
    instructions: "",
  });
  const toast = useToast();

  const [addShippingAddress, { loading }] = useMutation(ADD_SHIPPING_ADDRESS);

  const handleSubmit = async () => {
    try {
      await addShippingAddress({
        variables: {
          input: {
            name: formData.name,
            phone: formData.phone,
            address: {
              street: formData.street,
              city: formData.city,
              state: formData.state,
              postcode: formData.postcode,
              country: formData.country,
            },
            instructions: formData.instructions,
            isDefault: true, // Make this the default address since it's the first one
          },
        },
      });

      toast({
        title: "Success",
        description: "Shipping address added successfully",
        status: "success",
        duration: 3000,
      });
      
      onAddressAdded();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add shipping address",
        status: "error",
        duration: 5000,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Shipping Address</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Full Name</FormLabel>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Phone Number</FormLabel>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Street Address</FormLabel>
              <Input
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              />
            </FormControl>

            <FormControl>
              <FormLabel>City</FormLabel>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </FormControl>

            <FormControl>
              <FormLabel>State</FormLabel>
              <Input
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Postal Code</FormLabel>
              <Input
                value={formData.postcode}
                onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Country</FormLabel>
              <Input
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Delivery Instructions (Optional)</FormLabel>
              <Input
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              />
            </FormControl>

            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={loading}
              w="full"
            >
              Add Address
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}; 