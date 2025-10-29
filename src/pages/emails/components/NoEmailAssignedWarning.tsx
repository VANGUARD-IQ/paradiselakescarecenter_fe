import React from 'react';
import { Box, Text, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

interface NoEmailAssignedWarningProps {
    onNavigateBack?: () => void;
}

export const NoEmailAssignedWarning: React.FC<NoEmailAssignedWarningProps> = ({ onNavigateBack }) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onNavigateBack) {
            onNavigateBack();
        } else {
            navigate('/emails');
        }
    };

    return (
        <Box
            p={8}
            textAlign="center"
            bg="red.900"
            borderRadius="lg"
            border="1px solid"
            borderColor="red.600"
        >
            <Text fontSize="lg" color="red.200" mb={2}>
                ⚠️ No Email Address Assigned
            </Text>
            <Text color="red.300" mb={4}>
                You don't have any email addresses assigned to your account.
            </Text>
            <Text color="red.400" fontSize="sm">
                Please contact your system administrator to have an email address assigned to you before you can send emails.
            </Text>
            <Button
                mt={6}
                onClick={handleBack}
                variant="outline"
                borderColor="red.400"
                color="red.400"
                _hover={{ bg: "red.900" }}
            >
                Back to Inbox
            </Button>
        </Box>
    );
};