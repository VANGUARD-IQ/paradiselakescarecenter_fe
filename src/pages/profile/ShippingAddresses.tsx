import React, { useState } from "react";
import {
    Box,
    Button,
    Container,
    Heading,
    VStack,
    HStack,
    Text,
    Card,
    CardBody,
    CardHeader,
    IconButton,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    Select,
    useToast,
    Badge,
    Divider,
} from "@chakra-ui/react";
import { FiPlus, FiEdit2, FiTrash2, FiMapPin } from "react-icons/fi";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { getColor, brandConfig } from "../../brandConfig";

interface ShippingAddress {
    id: string;
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
}

const ShippingAddresses: React.FC = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(null);
    const toast = useToast();
    
    // Consistent styling from brandConfig
    const bg = getColor("background.main");
    const cardGradientBg = getColor("background.cardGradient");
    const cardBorder = getColor("border.darkCard");
    const textPrimary = getColor("text.primaryDark");
    const textSecondary = getColor("text.secondaryDark");
    const textMuted = getColor("text.mutedDark");

    // Mock data - in real app this would come from GraphQL
    const [addresses, setAddresses] = useState<ShippingAddress[]>([
        {
            id: "1",
            name: "Home Address",
            addressLine1: "123 Main Street",
            addressLine2: "Apt 4B",
            city: "Sydney",
            state: "NSW",
            postalCode: "2000",
            country: "Australia",
            isDefault: true,
        },
        {
            id: "2",
            name: "Work Address",
            addressLine1: "456 Business Ave",
            city: "Melbourne",
            state: "VIC",
            postalCode: "3000",
            country: "Australia",
            isDefault: false,
        },
    ]);

    const [formData, setFormData] = useState({
        name: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "Australia",
    });

    const handleAddAddress = () => {
        setEditingAddress(null);
        setFormData({
            name: "",
            addressLine1: "",
            addressLine2: "",
            city: "",
            state: "",
            postalCode: "",
            country: "Australia",
        });
        onOpen();
    };

    const handleEditAddress = (address: ShippingAddress) => {
        setEditingAddress(address);
        setFormData({
            name: address.name,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2 || "",
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
        });
        onOpen();
    };

    const handleDeleteAddress = (addressId: string) => {
        setAddresses(addresses.filter(addr => addr.id !== addressId));
        toast({
            title: "Address deleted",
            status: "success",
            duration: 3000,
            isClosable: true,
        });
    };

    const handleSetDefault = (addressId: string) => {
        setAddresses(addresses.map(addr => ({
            ...addr,
            isDefault: addr.id === addressId,
        })));
        toast({
            title: "Default address updated",
            status: "success",
            duration: 3000,
            isClosable: true,
        });
    };

    const handleSaveAddress = () => {
        if (editingAddress) {
            // Update existing address
            setAddresses(addresses.map(addr => 
                addr.id === editingAddress.id 
                    ? { ...addr, ...formData }
                    : addr
            ));
            toast({
                title: "Address updated",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } else {
            // Add new address
            const newAddress: ShippingAddress = {
                id: Date.now().toString(),
                ...formData,
                isDefault: addresses.length === 0, // First address is default
            };
            setAddresses([...addresses, newAddress]);
            toast({
                title: "Address added",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        }
        onClose();
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    return (
        <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <Container maxW="container.lg" py={8} flex="1">
                <VStack spacing={6} align="stretch">
                    <Box>
                        <VStack spacing={4} align="stretch" mb={4}>
                            <VStack align="start" spacing={2}>
                                <Heading size="lg" color={textPrimary}>
                                    📦 Shipping Addresses
                                </Heading>
                                <Text color={textSecondary}>
                                    Manage your shipping addresses for product orders and deliveries.
                                </Text>
                            </VStack>
                            
                            {/* Mobile-responsive button container */}
                            <Box display="flex" justifyContent={{ base: "stretch", md: "flex-end" }}>
                                <Button
                                    leftIcon={<FiPlus />}
                                    bg="white"
                                    color="black"
                                    _hover={{ 
                                        bg: "gray.100",
                                        transform: "translateY(-2px)"
                                    }}
                                    onClick={handleAddAddress}
                                    boxShadow="0 2px 4px rgba(255, 255, 255, 0.1)"
                                    width={{ base: "100%", md: "auto" }}
                                    minW={{ md: "140px" }}
                                    flexShrink={0}
                                >
                                    Add Address
                                </Button>
                            </Box>
                        </VStack>
                    </Box>

                    <VStack spacing={4} align="stretch">
                        {addresses.length === 0 ? (
                            <Card
                                bg={cardGradientBg}
                                backdropFilter="blur(10px)"
                                boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                                border="1px"
                                borderColor={cardBorder}
                            >
                                <CardBody textAlign="center" py={8}>
                                    <Box display="inline-block">
                                        <FiMapPin size={48} color={textMuted} />
                                    </Box>
                                    <Text mt={4} color={textMuted}>
                                        No shipping addresses yet
                                    </Text>
                                    <Button
                                        mt={4}
                                        leftIcon={<FiPlus />}
                                        bg="white"
                                        color="black"
                                        _hover={{ 
                                            bg: "gray.100",
                                            transform: "translateY(-2px)"
                                        }}
                                        onClick={handleAddAddress}
                                        width={{ base: "100%", sm: "auto" }}
                                        minW={{ sm: "200px" }}
                                    >
                                        Add Your First Address
                                    </Button>
                                </CardBody>
                            </Card>
                        ) : (
                            addresses.map((address) => (
                                <Card 
                                    key={address.id}
                                    bg={cardGradientBg}
                                    backdropFilter="blur(10px)"
                                    boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                                    border="1px"
                                    borderColor={cardBorder}
                                >
                                    <CardHeader borderBottom="1px" borderColor={cardBorder}>
                                        <HStack justify="space-between">
                                            <HStack>
                                                <Text fontWeight="bold" color={textPrimary}>{address.name}</Text>
                                                {address.isDefault && (
                                                    <Badge 
                                                        bg="rgba(34, 197, 94, 0.2)"
                                                        color="#22C55E"
                                                        border="1px solid"
                                                        borderColor="rgba(34, 197, 94, 0.3)"
                                                    >Default</Badge>
                                                )}
                                            </HStack>
                                            <HStack>
                                                <IconButton
                                                    aria-label="Edit address"
                                                    icon={<FiEdit2 />}
                                                    size="sm"
                                                    variant="ghost"
                                                    color="#3B82F6"
                                                    _hover={{ bg: "rgba(59, 130, 246, 0.2)", color: "#3B82F6" }}
                                                    onClick={() => handleEditAddress(address)}
                                                />
                                                <IconButton
                                                    aria-label="Delete address"
                                                    icon={<FiTrash2 />}
                                                    size="sm"
                                                    variant="ghost"
                                                    color="#EF4444"
                                                    _hover={{ bg: "rgba(239, 68, 68, 0.2)", color: "#EF4444" }}
                                                    onClick={() => handleDeleteAddress(address.id)}
                                                    isDisabled={address.isDefault}
                                                />
                                            </HStack>
                                        </HStack>
                                    </CardHeader>
                                    <CardBody pt={0}>
                                        <VStack align="start" spacing={1}>
                                            <Text color={textPrimary}>{address.addressLine1}</Text>
                                            {address.addressLine2 && (
                                                <Text color={textPrimary}>{address.addressLine2}</Text>
                                            )}
                                            <Text color={textSecondary}>
                                                {address.city}, {address.state} {address.postalCode}
                                            </Text>
                                            <Text color={textSecondary}>{address.country}</Text>
                                        </VStack>
                                        {!address.isDefault && (
                                            <>
                                                <Divider my={3} borderColor={cardBorder} />
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    borderColor={cardBorder}
                                                    color={textPrimary}
                                                    _hover={{
                                                        borderColor: textSecondary,
                                                        bg: "rgba(255, 255, 255, 0.05)"
                                                    }}
                                                    onClick={() => handleSetDefault(address.id)}
                                                >
                                                    Set as Default
                                                </Button>
                                            </>
                                        )}
                                    </CardBody>
                                </Card>
                            ))
                        )}
                    </VStack>
                </VStack>
            </Container>

            {/* Add/Edit Address Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalOverlay bg="rgba(0, 0, 0, 0.8)" />
                <ModalContent 
                    bg={cardGradientBg}
                    backdropFilter="blur(10px)"
                    border="1px"
                    borderColor={cardBorder}
                >
                    <ModalHeader color={textPrimary} borderBottom="1px" borderColor={cardBorder}>
                        {editingAddress ? "Edit Address" : "Add New Address"}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel color={textPrimary}>Address Name</FormLabel>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    placeholder="e.g., Home, Work, Office"
                                    bg="rgba(0, 0, 0, 0.2)"
                                    border="1px"
                                    borderColor={cardBorder}
                                    color={textPrimary}
                                    _placeholder={{ color: textMuted }}
                                    _focus={{
                                        borderColor: textSecondary,
                                        boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                                    }}
                                    _hover={{
                                        borderColor: textSecondary
                                    }}
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel color={textPrimary}>Address Line 1</FormLabel>
                                <Input
                                    value={formData.addressLine1}
                                    onChange={(e) => handleInputChange("addressLine1", e.target.value)}
                                    placeholder="Street address"
                                    bg="rgba(0, 0, 0, 0.2)"
                                    border="1px"
                                    borderColor={cardBorder}
                                    color={textPrimary}
                                    _placeholder={{ color: textMuted }}
                                    _focus={{
                                        borderColor: textSecondary,
                                        boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                                    }}
                                    _hover={{
                                        borderColor: textSecondary
                                    }}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel color={textPrimary}>Address Line 2</FormLabel>
                                <Input
                                    value={formData.addressLine2}
                                    onChange={(e) => handleInputChange("addressLine2", e.target.value)}
                                    placeholder="Apartment, suite, etc. (optional)"
                                    bg="rgba(0, 0, 0, 0.2)"
                                    border="1px"
                                    borderColor={cardBorder}
                                    color={textPrimary}
                                    _placeholder={{ color: textMuted }}
                                    _focus={{
                                        borderColor: textSecondary,
                                        boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                                    }}
                                    _hover={{
                                        borderColor: textSecondary
                                    }}
                                />
                            </FormControl>

                            <HStack width="100%">
                                <FormControl isRequired>
                                    <FormLabel color={textPrimary}>City</FormLabel>
                                    <Input
                                        value={formData.city}
                                        onChange={(e) => handleInputChange("city", e.target.value)}
                                        bg="rgba(0, 0, 0, 0.2)"
                                        border="1px"
                                        borderColor={cardBorder}
                                        color={textPrimary}
                                        _placeholder={{ color: textMuted }}
                                        _focus={{
                                            borderColor: textSecondary,
                                            boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                                        }}
                                        _hover={{
                                            borderColor: textSecondary
                                        }}
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel color={textPrimary}>State</FormLabel>
                                    <Select
                                        value={formData.state}
                                        onChange={(e) => handleInputChange("state", e.target.value)}
                                        bg="rgba(0, 0, 0, 0.2)"
                                        border="1px"
                                        borderColor={cardBorder}
                                        color={textPrimary}
                                        _hover={{ borderColor: textSecondary }}
                                        _focus={{
                                            borderColor: textSecondary,
                                            boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                                        }}
                                    >
                                        <option value="" style={{ backgroundColor: '#1a1a1a' }}>Select State</option>
                                        <option value="NSW" style={{ backgroundColor: '#1a1a1a' }}>NSW</option>
                                        <option value="VIC" style={{ backgroundColor: '#1a1a1a' }}>VIC</option>
                                        <option value="QLD" style={{ backgroundColor: '#1a1a1a' }}>QLD</option>
                                        <option value="WA" style={{ backgroundColor: '#1a1a1a' }}>WA</option>
                                        <option value="SA" style={{ backgroundColor: '#1a1a1a' }}>SA</option>
                                        <option value="TAS" style={{ backgroundColor: '#1a1a1a' }}>TAS</option>
                                        <option value="ACT" style={{ backgroundColor: '#1a1a1a' }}>ACT</option>
                                        <option value="NT" style={{ backgroundColor: '#1a1a1a' }}>NT</option>
                                    </Select>
                                </FormControl>
                            </HStack>

                            <HStack width="100%">
                                <FormControl isRequired>
                                    <FormLabel color={textPrimary}>Postal Code</FormLabel>
                                    <Input
                                        value={formData.postalCode}
                                        onChange={(e) => handleInputChange("postalCode", e.target.value)}
                                        bg="rgba(0, 0, 0, 0.2)"
                                        border="1px"
                                        borderColor={cardBorder}
                                        color={textPrimary}
                                        _placeholder={{ color: textMuted }}
                                        _focus={{
                                            borderColor: textSecondary,
                                            boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                                        }}
                                        _hover={{
                                            borderColor: textSecondary
                                        }}
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel color={textPrimary}>Country</FormLabel>
                                    <Select
                                        value={formData.country}
                                        onChange={(e) => handleInputChange("country", e.target.value)}
                                        bg="rgba(0, 0, 0, 0.2)"
                                        border="1px"
                                        borderColor={cardBorder}
                                        color={textPrimary}
                                        _hover={{ borderColor: textSecondary }}
                                        _focus={{
                                            borderColor: textSecondary,
                                            boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                                        }}
                                    >
                                        <option value="Australia" style={{ backgroundColor: '#1a1a1a' }}>Australia</option>
                                        <option value="New Zealand" style={{ backgroundColor: '#1a1a1a' }}>New Zealand</option>
                                        <option value="United States" style={{ backgroundColor: '#1a1a1a' }}>United States</option>
                                        <option value="Canada" style={{ backgroundColor: '#1a1a1a' }}>Canada</option>
                                        <option value="United Kingdom" style={{ backgroundColor: '#1a1a1a' }}>United Kingdom</option>
                                    </Select>
                                </FormControl>
                            </HStack>
                        </VStack>
                    </ModalBody>
                    <ModalFooter borderTop="1px" borderColor={cardBorder}>
                        <Button 
                            variant="ghost" 
                            mr={3} 
                            onClick={onClose}
                            color={textPrimary}
                            _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
                        >
                            Cancel
                        </Button>
                        <Button
                            bg="white"
                            color="black"
                            _hover={{ 
                                bg: "gray.100",
                                transform: "translateY(-2px)"
                            }}
                            onClick={handleSaveAddress}
                            isDisabled={!formData.name || !formData.addressLine1 || !formData.city || !formData.state || !formData.postalCode}
                        >
                            {editingAddress ? "Update" : "Add"} Address
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <FooterWithFourColumns />
        </Box>
    );
};

export default ShippingAddresses;