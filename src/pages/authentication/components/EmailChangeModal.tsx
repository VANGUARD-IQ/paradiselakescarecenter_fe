import React, { useState } from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    VStack,
    FormControl,
    FormLabel,
    Input,
    Text,
    useToast,
    HStack,
} from "@chakra-ui/react";
import { useMutation } from "@apollo/client";
import { REQUEST_EMAIL_CHANGE, VERIFY_EMAIL_CHANGE } from "../queries";

interface EmailChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientId: string;
    newEmail: string;
    onSuccess: () => void;
}

export const EmailChangeModal: React.FC<EmailChangeModalProps> = ({
    isOpen,
    onClose,
    clientId,
    newEmail,
    onSuccess,
}) => {
    const [verificationWords, setVerificationWords] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const toast = useToast();

    const [requestEmailChange, { loading: requesting }] = useMutation(REQUEST_EMAIL_CHANGE);
    const [verifyEmailChange, { loading: verifying }] = useMutation(VERIFY_EMAIL_CHANGE);

    // Request verification on mount
    React.useEffect(() => {
        if (isOpen && clientId && newEmail) {
            requestEmailChange({
                variables: {
                    input: {
                        clientId,
                        newEmail
                    }
                }
            }).then(() => {
                setIsVerifying(true);
                toast({
                    title: "Verification Email Sent",
                    description: `Check ${newEmail} for your verification words`,
                    status: "info",
                    duration: 5000,
                });
            }).catch(error => {
                toast({
                    title: "Error",
                    description: error.message,
                    status: "error",
                    duration: 5000,
                });
                onClose();
            });
        }
    }, [isOpen, clientId, newEmail]);

    const handleVerify = async () => {
        if (!verificationWords) {
            toast({
                title: "Missing Words",
                description: "Please enter your verification words",
                status: "warning",
                duration: 3000,
            });
            return;
        }

        try {
            const result = await verifyEmailChange({
                variables: {
                    input: {
                        clientId,
                        newEmail,
                        words: verificationWords
                    }
                }
            });

            if (result.data?.verifyEmailChange) {
                toast({
                    title: "Email Updated",
                    description: "Your email has been successfully updated",
                    status: "success",
                    duration: 5000,
                });
                onSuccess();
                onClose();
            } else {
                throw new Error("Verification failed");
            }
        } catch (error: any) {
            toast({
                title: "Verification Failed",
                description: error.message || "Invalid verification words",
                status: "error",
                duration: 5000,
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Verify New Email Address</ModalHeader>
                <ModalBody>
                    <VStack spacing={4}>
                        <Text>
                            We've sent verification words to:
                        </Text>
                        <Text fontWeight="bold">{newEmail}</Text>
                        
                        {isVerifying && (
                            <FormControl>
                                <FormLabel>Verification Words</FormLabel>
                                <Input
                                    placeholder="Enter the two words from your email"
                                    value={verificationWords}
                                    onChange={(e) => setVerificationWords(e.target.value)}
                                    autoFocus
                                />
                            </FormControl>
                        )}
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <HStack spacing={3}>
                        <Button variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="blue"
                            onClick={handleVerify}
                            isLoading={verifying}
                            isDisabled={!isVerifying || !verificationWords}
                        >
                            Verify Email
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};