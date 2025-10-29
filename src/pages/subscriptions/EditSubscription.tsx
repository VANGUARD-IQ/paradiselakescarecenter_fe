import React from "react";
import {
    Box,
    Container,
    Heading,
    VStack,
    HStack,
    Button,
    FormControl,
    FormLabel,
    Input,
    Select,
    NumberInput,
    NumberInputField,
    useToast,
    Card,
    CardHeader,
    CardBody,
    Text,
    Divider,
    Badge,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { gql, useQuery, useMutation } from "@apollo/client";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { getColor, getComponent } from "../../brandConfig";
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import subscriptionsModuleConfig from './moduleConfig';
import { usePageTitle } from "../../hooks/useDocumentTitle";

// GraphQL Operations
const GET_SUBSCRIPTION = gql`
    query GetSubscription($id: ID!) {
        subscription(id: $id) {
            id
            client {
                id
                fName
                lName
                email
                businessName
            }
            plan {
                name
                description
                amount
                interval
                tier
                maxUsers
                maxClients
            }
            status
            startDate
            endDate
            trialEndsAt
            nextBillingDate
            canceledAt
            pausedAt
            cancellationReason
            notes
        }
    }
`;

const UPDATE_SUBSCRIPTION = gql`
    mutation UpdateSubscription($id: ID!, $input: UpdateSubscriptionInput!) {
        updateSubscription(id: $id, input: $input) {
            id
            status
            plan {
                name
                description
                amount
                interval
                tier
            }
            nextBillingDate
            endDate
            cancellationReason
            notes
        }
    }
`;

const EditSubscription = () => {
    usePageTitle("Edit Subscription");
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();
    const bg = getColor("background.surface");

    const { data, loading, error } = useQuery(GET_SUBSCRIPTION, {
        variables: { id },
        fetchPolicy: "network-only"
    });

    const [updateSubscription] = useMutation(UPDATE_SUBSCRIPTION, {
        onCompleted: () => {
            toast({
                title: "Subscription Updated",
                description: "The subscription has been updated successfully",
                status: "success",
                duration: 3000
            });
            navigate("/subscriptions/manage");
        },
        onError: (error) => {
            toast({
                title: "Update Failed",
                description: error.message,
                status: "error",
                duration: 5000
            });
        }
    });

    const [formData, setFormData] = React.useState({
        status: "",
        planName: "",
        planDescription: "",
        planAmount: 0,
        planInterval: "",
        planTier: "",
        nextBillingDate: "",
        endDate: "",
        notes: "",
        cancellationReason: ""
    });

    React.useEffect(() => {
        if (data?.subscription) {
            const sub = data.subscription;
            setFormData({
                status: sub.status,
                planName: sub.plan.name,
                planDescription: sub.plan.description || "",
                planAmount: sub.plan.amount,
                planInterval: sub.plan.interval,
                planTier: sub.plan.tier,
                nextBillingDate: sub.nextBillingDate ? new Date(sub.nextBillingDate).toISOString().split('T')[0] : "",
                endDate: sub.endDate ? new Date(sub.endDate).toISOString().split('T')[0] : "",
                notes: sub.notes || "",
                cancellationReason: sub.cancellationReason || ""
            });
        }
    }, [data]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const input = {
            status: formData.status,
            plan: {
                name: formData.planName,
                description: formData.planDescription,
                amount: Number(formData.planAmount),
                interval: formData.planInterval,
                tier: formData.planTier
            },
            nextBillingDate: formData.nextBillingDate,
            endDate: formData.endDate,
            notes: formData.notes,
            cancellationReason: formData.cancellationReason
        };

        await updateSubscription({
            variables: {
                id,
                input
            }
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'green';
            case 'CANCELED': return 'red';
            case 'PAST_DUE': return 'orange';
            case 'TRIALING': return 'blue';
            case 'PAUSED': return 'yellow';
            default: return 'gray';
        }
    };

    if (loading) return <Text>Loading subscription details...</Text>;
    if (error) return <Text color="red.500">Error: {error.message}</Text>;
    if (!data?.subscription) return <Text>Subscription not found</Text>;

    const subscription = data.subscription;

    return (
        <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={subscriptionsModuleConfig} />
            <Container maxW="container.xl" py={12} flex="1">
                <VStack spacing={8} align="stretch">
                    <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                            <Heading size="lg">Edit Subscription</Heading>
                            <Text color={getColor("text.muted")}>
                                Update subscription details for {subscription.client.businessName ||
                                    `${subscription.client.fName} ${subscription.client.lName}`}
                            </Text>
                        </VStack>
                        <Button
                            onClick={() => navigate("/subscriptions/manage")}
                            variant="outline"
                        >
                            Back to List
                        </Button>
                    </HStack>

                    <Card>
                        <CardHeader>
                            <HStack justify="space-between">
                                <Heading size="md">Client Information</Heading>
                                <Badge colorScheme={getStatusColor(subscription.status)}>
                                    {subscription.status}
                                </Badge>
                            </HStack>
                        </CardHeader>
                        <CardBody>
                            <VStack align="start" spacing={4}>
                                <Text>
                                    <strong>Name:</strong> {subscription.client.businessName ||
                                        `${subscription.client.fName} ${subscription.client.lName}`}
                                </Text>
                                <Text>
                                    <strong>Email:</strong> {subscription.client.email}
                                </Text>
                                <Text>
                                    <strong>Start Date:</strong> {new Date(subscription.startDate).toLocaleDateString()}
                                </Text>
                                {subscription.trialEndsAt && (
                                    <Text>
                                        <strong>Trial Ends:</strong> {new Date(subscription.trialEndsAt).toLocaleDateString()}
                                    </Text>
                                )}
                            </VStack>
                        </CardBody>
                    </Card>

                    <form onSubmit={handleSubmit}>
                        <Card>
                            <CardHeader>
                                <Heading size="md">Subscription Details</Heading>
                            </CardHeader>
                            <CardBody>
                                <VStack spacing={6}>
                                    <FormControl>
                                        <FormLabel>Status</FormLabel>
                                        <Select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="ACTIVE">Active</option>
                                            <option value="CANCELED">Canceled</option>
                                            <option value="PAST_DUE">Past Due</option>
                                            <option value="TRIALING">Trialing</option>
                                            <option value="PAUSED">Paused</option>
                                        </Select>
                                    </FormControl>

                                    <Divider />

                                    <FormControl>
                                        <FormLabel>Plan Name</FormLabel>
                                        <Input
                                            value={formData.planName}
                                            onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Plan Description</FormLabel>
                                        <Input
                                            value={formData.planDescription}
                                            onChange={(e) => setFormData({ ...formData, planDescription: e.target.value })}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Amount</FormLabel>
                                        <NumberInput
                                            value={formData.planAmount}
                                            onChange={(_, value) => setFormData({ ...formData, planAmount: value })}
                                        >
                                            <NumberInputField />
                                        </NumberInput>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Billing Interval</FormLabel>
                                        <Select
                                            value={formData.planInterval}
                                            onChange={(e) => setFormData({ ...formData, planInterval: e.target.value })}
                                        >
                                            <option value="MONTHLY">Monthly</option>
                                            <option value="YEARLY">Yearly</option>
                                            <option value="ONE_TIME">One Time</option>
                                        </Select>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Tier</FormLabel>
                                        <Select
                                            value={formData.planTier}
                                            onChange={(e) => setFormData({ ...formData, planTier: e.target.value })}
                                        >
                                            <option value="FREE">Free</option>
                                            <option value="BASIC">Basic</option>
                                            <option value="PREMIUM">Premium</option>
                                            <option value="ENTERPRISE">Enterprise</option>
                                        </Select>
                                    </FormControl>

                                    <Divider />

                                    <FormControl>
                                        <FormLabel>Next Billing Date</FormLabel>
                                        <Input
                                            type="date"
                                            value={formData.nextBillingDate}
                                            onChange={(e) => setFormData({ ...formData, nextBillingDate: e.target.value })}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>End Date</FormLabel>
                                        <Input
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Notes</FormLabel>
                                        <Input
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        />
                                    </FormControl>

                                    {(formData.status === "CANCELED" || subscription.status === "CANCELED") && (
                                        <FormControl>
                                            <FormLabel>Cancellation Reason</FormLabel>
                                            <Input
                                                value={formData.cancellationReason}
                                                onChange={(e) => setFormData({ ...formData, cancellationReason: e.target.value })}
                                            />
                                        </FormControl>
                                    )}

                                    <HStack spacing={4} width="100%" justify="flex-end">
                                        <Button
                                            variant="outline"
                                            onClick={() => navigate("/subscriptions/manage")}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            colorScheme="blue"
                                            type="submit"
                                        >
                                            Save Changes
                                        </Button>
                                    </HStack>
                                </VStack>
                            </CardBody>
                        </Card>
                    </form>
                </VStack>
            </Container>
            <FooterWithFourColumns />
        </Box>
    );
};

export default EditSubscription; 