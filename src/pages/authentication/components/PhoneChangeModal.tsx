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
import { REQUEST_PHONE_CHANGE, VERIFY_PHONE_CHANGE } from "../queries";

interface PhoneChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientId: string;
    newPhoneNumber: string;
    onSuccess: () => void;
}

export const PhoneChangeModal: React.FC<PhoneChangeModalProps> = ({
    isOpen,
    onClose,
    clientId,
    newPhoneNumber,
    onSuccess,
}) => {
    const [verificationWords, setVerificationWords] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const toast = useToast();

    const [requestPhoneChange, { loading: requesting }] = useMutation(REQUEST_PHONE_CHANGE);
    const [verifyPhoneChange, { loading: verifying }] = useMutation(VERIFY_PHONE_CHANGE);

    // Request verification on mount
    React.useEffect(() => {
        if (isOpen && clientId && newPhoneNumber) {
            requestPhoneChange({
                variables: {
                    input: {
                        clientId,
                        newPhoneNumber
                    }
                }
            }).then(() => {
                setIsVerifying(true);
                toast({
                    title: "Verification SMS Sent",
                    description: `Check ${newPhoneNumber} for your verification words`,
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
    }, [isOpen, clientId, newPhoneNumber]);

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
            const result = await verifyPhoneChange({
                variables: {
                    input: {
                        clientId,
                        newPhoneNumber,
                        words: verificationWords
                    }
                }
            });

            if (result.data?.verifyPhoneChange) {
                toast({
                    title: "Phone Number Updated",
                    description: "Your phone number has been successfully updated",
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
                <ModalHeader>Verify New Phone Number</ModalHeader>
                <ModalBody>
                    <VStack spacing={4}>
                        <Text>
                            We've sent verification words via SMS to:
                        </Text>
                        <Text fontWeight="bold">{newPhoneNumber}</Text>
                        
                        {isVerifying && (
                            <FormControl>
                                <FormLabel>Verification Words</FormLabel>
                                <Input
                                    placeholder="Enter the two words from your SMS"
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
                            Verify Phone
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};