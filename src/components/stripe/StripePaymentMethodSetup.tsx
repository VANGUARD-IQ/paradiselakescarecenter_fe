import React, { useState } from 'react';
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import {
    Box,
    Button,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Text,
    VStack,
    useToast
} from '@chakra-ui/react';
import { getColor, getComponent, brandConfig } from '../../brandConfig';

// Stripe promise will be created dynamically with the tenant's key
const stripePromiseCache: { [key: string]: Promise<any> } = {};

interface StripePaymentMethodSetupProps {
    clientSecret: string;
    onSuccess: (paymentMethodId: string, customerId?: string) => void;
    onError: (error: string) => void;
    clientName: string;
    stripePublicKey: string;
}

const PaymentMethodForm: React.FC<StripePaymentMethodSetupProps> = ({
    onSuccess,
    onError,
    clientName,
    stripePublicKey
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            onError('Stripe has not loaded yet');
            return;
        }

        setIsLoading(true);

        try {
            console.log('🔄 Starting payment method setup...');

            // Confirm the setup intent
            const { error, setupIntent } = await stripe.confirmSetup({
                elements,
                confirmParams: {
                    // This return URL is required but won't be used for our flow
                    return_url: `${window.location.origin}/payment-methods-success`
                },
                redirect: 'if_required' // Avoid redirect for successful card setups
            });

            if (error) {
                console.error('❌ Setup failed:', error);
                onError(error.message || 'Failed to save payment method');
                toast({
                    title: 'Payment Method Setup Failed',
                    description: error.message,
                    status: 'error',
                    duration: 5000,
                    isClosable: true
                });
            } else if (setupIntent && setupIntent.status === 'succeeded') {
                const paymentMethodId = setupIntent.payment_method;
                const customerId = (setupIntent as any).customer; // Safely access customer property
                console.log('✅ Setup successful:', {
                    paymentMethodId,
                    customerId,
                    setupIntentId: setupIntent.id
                });
                onSuccess(paymentMethodId as string, customerId || undefined);
                toast({
                    title: 'Payment Method Added Successfully!',
                    description: `Credit card saved securely for ${clientName}`,
                    status: 'success',
                    duration: 5000,
                    isClosable: true
                });
            } else {
                console.error('❌ Setup completed but with unexpected status:', setupIntent?.status);
                onError('Setup completed but with unexpected status');
            }
        } catch (err) {
            console.error('❌ Unexpected error during setup:', err);
            onError('An unexpected error occurred');
        }

        setIsLoading(false);
    };

    return (
        <Box as="form" onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
                {/* Security Notice */}
                <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Box>
                        <AlertTitle fontSize="sm">🔒 Secure Payment Method Setup</AlertTitle>
                        <AlertDescription fontSize="sm">
                            <VStack align="start" spacing={1}>
                                <Text>
                                    Your card details are encrypted and securely processed by Stripe.
                                    We never see or store your full card information.
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    Using Stripe Key: {stripePublicKey ? stripePublicKey.substring(0, 20) + '...' : 'Loading...'}
                                </Text>
                            </VStack>
                        </AlertDescription>
                    </Box>
                </Alert>

                {/* Client Info */}
                <Box p={3} bg={getColor("background.light")} borderRadius="md">
                    <Text fontSize="sm" fontWeight="medium">
                        Adding payment method for: <strong>{clientName}</strong>
                    </Text>
                </Box>

                {/* Stripe Payment Element */}
                <Box
                    p={4}
                    border="1px"
                    borderColor={getColor("border.light")}
                    borderRadius="lg"
                    bg={getColor("background.card")}
                >
                    <PaymentElement
                        options={{
                            layout: 'accordion',
                            paymentMethodOrder: ['card']
                        }}
                    />
                </Box>

                {/* Test Card Notice */}
                <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    <Box>
                        <AlertTitle fontSize="sm">🧪 Testing Mode</AlertTitle>
                        <AlertDescription fontSize="sm">
                            Use test card: <strong>4242 4242 4242 4242</strong> with any future expiry and CVC.
                            No real charges will be made.
                        </AlertDescription>
                    </Box>
                </Alert>

                {/* Submit Button */}
                <Button
                    type="submit"
                    bg={getComponent("button", "primaryBg")}
                    color={getColor("text.inverse")}
                    _hover={{ bg: getComponent("button", "primaryHover") }}
                    _active={{ transform: "translateY(1px)" }}
                    isLoading={isLoading}
                    loadingText="Saving Payment Method..."
                    size="lg"
                    borderRadius="lg"
                    fontWeight="600"
                    boxShadow="0 2px 4px rgba(0, 122, 255, 0.2)"
                    fontFamily={brandConfig.fonts.body}
                    isDisabled={!stripe || !elements}
                >
                    Save Payment Method
                </Button>
            </VStack>
        </Box>
    );
};

export const StripePaymentMethodSetup: React.FC<StripePaymentMethodSetupProps> = (props) => {
    // Validate that we have a valid Stripe public key
    if (!props.stripePublicKey || typeof props.stripePublicKey !== 'string' || !props.stripePublicKey.startsWith('pk_')) {
        return (
            <Alert status="error" borderRadius="md">
                <AlertIcon />
                <Box>
                    <AlertTitle>❌ Stripe Configuration Error</AlertTitle>
                    <AlertDescription>
                        {!props.stripePublicKey ? (
                            <Text>Stripe public key is not available. Please ensure Stripe is configured for this tenant.</Text>
                        ) : (
                            <Text>Invalid Stripe public key format. The key should start with 'pk_'.</Text>
                        )}
                    </AlertDescription>
                </Box>
            </Alert>
        );
    }

    // Create or get cached Stripe promise for this key
    const getStripePromise = (publicKey: string) => {
        if (!stripePromiseCache[publicKey]) {
            console.log('🔑 Creating new Stripe instance with key:', publicKey.substring(0, 20) + '...');
            stripePromiseCache[publicKey] = loadStripe(publicKey);
        }
        return stripePromiseCache[publicKey];
    };

    const stripePromise = getStripePromise(props.stripePublicKey);

    const options = {
        clientSecret: props.clientSecret,
        appearance: {
            theme: 'stripe' as const,
            variables: {
                colorPrimary: getColor("primary"),
                colorBackground: getColor("background.card"),
                colorText: getColor("text.primary"),
                colorDanger: getColor("status.error"),
                fontFamily: brandConfig.fonts.body,
                borderRadius: '8px'
            }
        },
        loader: 'auto' as const
    };

    return (
        <Elements stripe={stripePromise} options={options}>
            <PaymentMethodForm {...props} />
        </Elements>
    );
}; 