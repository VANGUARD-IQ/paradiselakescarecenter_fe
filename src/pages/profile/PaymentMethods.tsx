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
    Alert,
    AlertIcon,
    AlertDescription,
} from "@chakra-ui/react";
import { FiPlus, FiTrash2, FiCreditCard, FiShield } from "react-icons/fi";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { getColor, brandConfig } from "../../brandConfig";

interface PaymentMethod {
    id: string;
    type: "card" | "bank";
    lastFour: string;
    brand: string;
    expiryMonth?: number;
    expiryYear?: number;
    isDefault: boolean;
    nickname: string;
}

const PaymentMethods: React.FC = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    
    // Consistent styling from brandConfig
    const bg = getColor("background.main");
    const cardGradientBg = getColor("background.cardGradient");
    const cardBorder = getColor("border.darkCard");
    const textPrimary = getColor("text.primaryDark");
    const textSecondary = getColor("text.secondaryDark");
    const textMuted = getColor("text.mutedDark");

    // Initialize with empty array - payment methods should come from user's actual data
    // TODO: Integrate with GraphQL/Stripe to fetch user's actual payment methods
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

    const [formData, setFormData] = useState({
        cardNumber: "",
        expiryMonth: "",
        expiryYear: "",
        cvc: "",
        nickname: "",
        setAsDefault: false,
    });

    const handleAddPaymentMethod = () => {
        setFormData({
            cardNumber: "",
            expiryMonth: "",
            expiryYear: "",
            cvc: "",
            nickname: "",
            setAsDefault: false,
        });
        onOpen();
    };

    const handleDeletePaymentMethod = (methodId: string) => {
        const methodToDelete = paymentMethods.find(pm => pm.id === methodId);
        if (methodToDelete?.isDefault) {
            toast({
                title: "Cannot delete default payment method",
                description: "Please set another payment method as default first.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        setPaymentMethods(paymentMethods.filter(pm => pm.id !== methodId));
        toast({
            title: "Payment method removed",
            status: "success",
            duration: 3000,
            isClosable: true,
        });
    };

    const handleSetDefault = (methodId: string) => {
        setPaymentMethods(paymentMethods.map(pm => ({
            ...pm,
            isDefault: pm.id === methodId,
        })));
        toast({
            title: "Default payment method updated",
            status: "success",
            duration: 3000,
            isClosable: true,
        });
    };

    const handleSavePaymentMethod = () => {
        // Mock validation
        if (!formData.cardNumber || !formData.expiryMonth || !formData.expiryYear || !formData.cvc) {
            toast({
                title: "Please fill in all required fields",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        // Mock card brand detection
        const getBrand = (cardNumber: string) => {
            const firstDigit = cardNumber.charAt(0);
            if (firstDigit === "4") return "Visa";
            if (firstDigit === "5") return "Mastercard";
            if (firstDigit === "3") return "Amex";
            return "Unknown";
        };

        const newPaymentMethod: PaymentMethod = {
            id: `pm_${Date.now()}`,
            type: "card",
            lastFour: formData.cardNumber.slice(-4),
            brand: getBrand(formData.cardNumber),
            expiryMonth: parseInt(formData.expiryMonth),
            expiryYear: parseInt(formData.expiryYear),
            isDefault: formData.setAsDefault || paymentMethods.length === 0,
            nickname: formData.nickname || `${getBrand(formData.cardNumber)} ending in ${formData.cardNumber.slice(-4)}`,
        };

        if (formData.setAsDefault) {
            setPaymentMethods([
                ...paymentMethods.map(pm => ({ ...pm, isDefault: false })),
                newPaymentMethod,
            ]);
        } else {
            setPaymentMethods([...paymentMethods, newPaymentMethod]);
        }

        toast({
            title: "Payment method added",
            description: "Your new payment method has been securely saved.",
            status: "success",
            duration: 3000,
            isClosable: true,
        });

        onClose();
    };

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData({ ...formData, [field]: value });
    };

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || "";
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(" ");
        } else {
            return v;
        }
    };

    const getBrandIcon = (brand: string) => {
        switch (brand.toLowerCase()) {
            case "visa":
                return "💳";
            case "mastercard":
                return "💳";
            case "amex":
                return "💳";
            default:
                return "💳";
        }
    };

    return (
        <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <Container maxW="container.lg" py={8} flex="1">
                <VStack spacing={6} align="stretch">
                    <Box>
                        <VStack spacing={4}>
                            <VStack align="start" spacing={2} width="100%">
                                <Heading size="lg" color={textPrimary}>
                                    💳 Payment Methods
                                </Heading>
                                <Text color={textSecondary}>
                                    Manage your saved payment methods for subscriptions and purchases.
                                </Text>
                            </VStack>
                            <Box width="100%" display="flex" justifyContent={{ base: "stretch", md: "flex-end" }}>
                                <Button
                                    leftIcon={<FiPlus />}
                                    bg="white"
                                    color="black"
                                    _hover={{ 
                                        bg: "gray.100",
                                        transform: "translateY(-2px)"
                                    }}
                                    onClick={handleAddPaymentMethod}
                                    boxShadow="0 2px 4px rgba(255, 255, 255, 0.1)"
                                    width={{ base: "100%", md: "auto" }}
                                    minW={{ md: "180px" }}
                                    flexShrink={0}
                                >
                                    Add Payment Method
                                </Button>
                            </Box>
                        </VStack>
                    </Box>

                    <Alert 
                        status="info"
                        bg="rgba(59, 130, 246, 0.1)"
                        borderColor="rgba(59, 130, 246, 0.3)"
                        borderWidth="1px"
                    >
                        <AlertIcon color="#3B82F6" />
                        <AlertDescription>
                            <HStack>
                                <FiShield color="#3B82F6" />
                                <Text color={textSecondary}>
                                    Your payment information is encrypted and securely stored. We never store your full card details.
                                </Text>
                            </HStack>
                        </AlertDescription>
                    </Alert>

                    <VStack spacing={4} align="stretch">
                        {paymentMethods.length === 0 ? (
                            <Card
                                bg={cardGradientBg}
                                backdropFilter="blur(10px)"
                                boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                                border="1px"
                                borderColor={cardBorder}
                            >
                                <CardBody textAlign="center" py={8}>
                                    <Box display="inline-block">
                                        <FiCreditCard size={48} color={textMuted} />
                                    </Box>
                                    <Text mt={4} color={textMuted}>
                                        No payment methods saved
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
                                        onClick={handleAddPaymentMethod}
                                    >
                                        Add Your First Payment Method
                                    </Button>
                                </CardBody>
                            </Card>
                        ) : (
                            paymentMethods.map((method) => (
                                <Card 
                                    key={method.id}
                                    bg={cardGradientBg}
                                    backdropFilter="blur(10px)"
                                    boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                                    border="1px"
                                    borderColor={cardBorder}
                                >
                                    <CardHeader borderBottom="1px" borderColor={cardBorder}>
                                        <HStack justify="space-between" flexWrap={{ base: "wrap", md: "nowrap" }} gap={2}>
                                            <HStack flex="1" minW="0">
                                                <Text fontSize="lg" flexShrink={0}>
                                                    {getBrandIcon(method.brand)}
                                                </Text>
                                                <VStack align="start" spacing={0} minW="0" flex="1">
                                                    <HStack flexWrap="wrap">
                                                        <Text fontWeight="bold" color={textPrimary} noOfLines={1}>{method.nickname}</Text>
                                                        {method.isDefault && (
                                                            <Badge 
                                                                bg="rgba(34, 197, 94, 0.2)"
                                                                color="#22C55E"
                                                                border="1px solid"
                                                                borderColor="rgba(34, 197, 94, 0.3)"
                                                                flexShrink={0}
                                                            >Default</Badge>
                                                        )}
                                                    </HStack>
                                                    <Text color={textSecondary} fontSize={{ base: "xs", sm: "sm" }} noOfLines={2}>
                                                        {method.brand} •••• {method.lastFour}
                                                        {method.expiryMonth && method.expiryYear && (
                                                            ` • Expires ${method.expiryMonth}/${method.expiryYear}`
                                                        )}
                                                    </Text>
                                                </VStack>
                                            </HStack>
                                            <IconButton
                                                aria-label="Delete payment method"
                                                icon={<FiTrash2 />}
                                                size="sm"
                                                variant="ghost"
                                                color="#EF4444"
                                                _hover={{ bg: "rgba(239, 68, 68, 0.2)", color: "#EF4444" }}
                                                onClick={() => handleDeletePaymentMethod(method.id)}
                                                isDisabled={method.isDefault}
                                            />
                                        </HStack>
                                    </CardHeader>
                                    {!method.isDefault && (
                                        <CardBody pt={0}>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                borderColor={cardBorder}
                                                color={textPrimary}
                                                _hover={{
                                                    borderColor: textSecondary,
                                                    bg: "rgba(255, 255, 255, 0.05)"
                                                }}
                                                onClick={() => handleSetDefault(method.id)}
                                            >
                                                Set as Default
                                            </Button>
                                        </CardBody>
                                    )}
                                </Card>
                            ))
                        )}
                    </VStack>
                </VStack>
            </Container>

            {/* Add Payment Method Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "lg" }}>
                <ModalOverlay bg="rgba(0, 0, 0, 0.8)" />
                <ModalContent 
                    bg={cardGradientBg}
                    backdropFilter="blur(10px)"
                    border="1px"
                    borderColor={cardBorder}
                >
                    <ModalHeader color={textPrimary} borderBottom="1px" borderColor={cardBorder}>Add New Payment Method</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <Alert 
                                status="info" 
                                size="sm"
                                bg="rgba(59, 130, 246, 0.1)"
                                borderColor="rgba(59, 130, 246, 0.3)"
                                borderWidth="1px"
                            >
                                <AlertIcon color="#3B82F6" />
                                <AlertDescription fontSize="sm" color={textSecondary}>
                                    This is a demo. In production, this would integrate with Stripe or another secure payment processor.
                                </AlertDescription>
                            </Alert>

                            <FormControl isRequired>
                                <FormLabel color={textPrimary}>Card Number</FormLabel>
                                <Input
                                    value={formatCardNumber(formData.cardNumber)}
                                    onChange={(e) => handleInputChange("cardNumber", e.target.value.replace(/\s/g, ""))}
                                    placeholder="1234 5678 9012 3456"
                                    maxLength={19}
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

                            <HStack width="100%" flexWrap={{ base: "wrap", sm: "nowrap" }} gap={2}>
                                <FormControl isRequired flex={{ base: "1 1 45%", sm: "1" }}>
                                    <FormLabel color={textPrimary} fontSize={{ base: "sm", md: "md" }}>Expiry Month</FormLabel>
                                    <Select
                                        value={formData.expiryMonth}
                                        onChange={(e) => handleInputChange("expiryMonth", e.target.value)}
                                        placeholder="Month"
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
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <option key={i + 1} value={i + 1} style={{ backgroundColor: '#1a1a1a' }}>
                                                {(i + 1).toString().padStart(2, "0")}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl isRequired flex={{ base: "1 1 45%", sm: "1" }}>
                                    <FormLabel color={textPrimary} fontSize={{ base: "sm", md: "md" }}>Expiry Year</FormLabel>
                                    <Select
                                        value={formData.expiryYear}
                                        onChange={(e) => handleInputChange("expiryYear", e.target.value)}
                                        placeholder="Year"
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
                                        {Array.from({ length: 10 }, (_, i) => {
                                            const year = new Date().getFullYear() + i;
                                            return (
                                                <option key={year} value={year} style={{ backgroundColor: '#1a1a1a' }}>
                                                    {year}
                                                </option>
                                            );
                                        })}
                                    </Select>
                                </FormControl>

                                <FormControl isRequired flex={{ base: "1 1 100%", sm: "1" }}>
                                    <FormLabel color={textPrimary} fontSize={{ base: "sm", md: "md" }}>CVC</FormLabel>
                                    <Input
                                        value={formData.cvc}
                                        onChange={(e) => handleInputChange("cvc", e.target.value.replace(/\D/g, ""))}
                                        placeholder="123"
                                        maxLength={4}
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
                            </HStack>

                            <FormControl>
                                <FormLabel color={textPrimary}>Nickname (Optional)</FormLabel>
                                <Input
                                    value={formData.nickname}
                                    onChange={(e) => handleInputChange("nickname", e.target.value)}
                                    placeholder="e.g., Business Card, Personal Card"
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

                            {paymentMethods.length > 0 && (
                                <FormControl display="flex" alignItems="center">
                                    <FormLabel htmlFor="set-default" mb="0" color={textPrimary}>
                                        Set as default payment method
                                    </FormLabel>
                                    <input
                                        id="set-default"
                                        type="checkbox"
                                        checked={formData.setAsDefault}
                                        onChange={(e) => handleInputChange("setAsDefault", e.target.checked)}
                                        style={{ marginLeft: '8px' }}
                                    />
                                </FormControl>
                            )}
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
                            onClick={handleSavePaymentMethod}
                            isDisabled={!formData.cardNumber || !formData.expiryMonth || !formData.expiryYear || !formData.cvc}
                        >
                            Add Payment Method
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <FooterWithFourColumns />
        </Box>
    );
};

export default PaymentMethods;