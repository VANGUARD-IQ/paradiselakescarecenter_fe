import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Text,
    Input,
    Flex,
    useClipboard,
    useToast,
    VStack,
    Collapse,
    useDisclosure,
    Icon,
    useColorModeValue,
    Heading,
} from "@chakra-ui/react";
import { FaCopy, FaQrcode, FaUserFriends } from "react-icons/fa";
import QRCode from "qrcode.react";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "react-router-dom";

const InviteLink: React.FC = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [showQR, setShowQR] = useState(false);
    const toast = useToast();
    const [inviteUrl, setInviteUrl] = useState("");
    const { isOpen, onToggle } = useDisclosure();

    const bgColor = useColorModeValue("green.50", "green.900");
    const cardBgColor = useColorModeValue("white", "green.800");
    const textColor = useColorModeValue("gray.800", "white");

    const borderColor = useColorModeValue("green.200", "green.600");

    const generateInviteUrl = () => {
        const baseUrl = window.location.origin;
        const currentPath = location.pathname;
        return `${baseUrl}${currentPath}?inviteCode=${user?.inviteCode || ""}`;
    };

    useEffect(() => {
        if (user?.inviteCode) {
            setInviteUrl(generateInviteUrl());
        } else {
            setInviteUrl("");
        }
    }, [user?.inviteCode, location.pathname]);

    const { hasCopied, onCopy } = useClipboard(inviteUrl);

    const handleGenerateQR = () => {
        if (user?.inviteCode) {
            setShowQR(!showQR);
        } else {
            toast({
                title: "Not logged in",
                description: "Please log in to generate an invite link.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const excludedPaths = ["/wallet", "/buybitcoin", "/profiledetails", "/allusers", "/alluserspurchases", "/mybtcpurchases"];
    if (excludedPaths.includes(location.pathname)) {
        return null;
    }

    if (!user) {
        return null;
    }

    return (
        <Box mt={8} mb={8}>
            <Button
                leftIcon={<Icon as={FaUserFriends} />}
                colorScheme="green"
                onClick={onToggle}
                width="full"
                size="lg"
                boxShadow="md"
                _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
                transition="all 0.2s"
            >
                Share and Earn with Friends
            </Button>
            <Collapse in={isOpen} animateOpacity>
                <Box
                    mt={4}
                    p={6}
                    borderWidth={1}
                    borderRadius="lg"
                    borderColor={borderColor}
                    bg={cardBgColor}
                    boxShadow="xl"
                    color={textColor}
                >
                    <VStack spacing={6} align="stretch">
                        <Heading as="h3" size="md" textAlign="center">
                            Invite Friends, Grow Together!
                        </Heading>
                        <Text fontSize="lg" textAlign="center">
                            Share your unique link and earn rewards when friends join our community!
                        </Text>
                        <Box>
                            <Text fontWeight="bold" mb={2}>Your Invite Link:</Text>
                            <Flex>
                                <Input value={inviteUrl} isReadOnly mr={2} bg={bgColor} />
                                <Button
                                    onClick={onCopy}
                                    leftIcon={<Icon as={FaCopy} />}
                                    colorScheme="green"
                                >
                                    {hasCopied ? "Copied!" : "Copy"}
                                </Button>
                            </Flex>
                        </Box>
                        <Button
                            onClick={handleGenerateQR}
                            leftIcon={<Icon as={FaQrcode} />}
                            colorScheme="green"
                            variant="outline"
                        >
                            {showQR ? "Hide QR Code" : "Show QR Code"}
                        </Button>
                        {showQR && (
                            <Flex justifyContent="center" mt={4} bg={bgColor} p={4} borderRadius="md">
                                <QRCode value={inviteUrl} size={200} />
                            </Flex>
                        )}
                        <Text fontSize="sm" textAlign="center" fontStyle="italic">
                            Spread the word and help build a stronger, more resilient community!
                        </Text>
                    </VStack>
                </Box>
            </Collapse>
        </Box>
    );
};

export default InviteLink;