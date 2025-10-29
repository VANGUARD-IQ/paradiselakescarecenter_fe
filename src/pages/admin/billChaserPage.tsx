import React, { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import {
    Box,
    Container,
    Heading,
    VStack,
    HStack,
    Text,
    Badge,
    Card,
    CardHeader,
    CardBody,
    Skeleton,
    Alert,
    AlertIcon,
    SimpleGrid,
    Switch,
    useToast,
    Button,
    Input,
    FormControl,
    FormLabel,
    Textarea,
    Divider,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Progress,
    Checkbox,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    List,
    ListItem,
    ListIcon,
    useColorMode,
} from "@chakra-ui/react";
import { CheckCircleIcon, WarningIcon, TimeIcon, SettingsIcon } from "@chakra-ui/icons";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { getColor } from "../../brandConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";

// TypeScript interfaces
interface BillChaserRunResult {
    success: boolean;
    message: string;
    startTime: string;
    endTime: string;
    duration: number;
    totalBillsFound: number;
    billsProcessed: number;
    billsSkipped: number;
    clientSmsSuccessful: number;
    clientSmsFailed: number;
    issuerSmsSuccessful: number;
    issuerSmsFailed: number;
    clientEmailsSuccessful: number;
    clientEmailsFailed: number;
    issuerEmailsSuccessful: number;
    issuerEmailsFailed: number;
    systemErrors: string[];
}

// GraphQL Queries and Mutations
const GET_BILL_CHASER_CONFIG = gql`
  query GetBillChaserConfiguration {
    getBillChaserConfiguration {
      enabled
      cronSchedule
      timezone
      sendToClients
      sendToIssuers
      sendSms
      sendEmails
      maxBillsPerRun
      minBillAgeInDays
      scheduleDescription
    }
  }
`;

const RUN_BILL_CHASER_MANUALLY = gql`
  mutation RunBillChaserManually($input: BillChaserRunInput) {
    runBillChaserManually(input: $input) {
      success
      message
      startTime
      endTime
      duration
      totalBillsFound
      billsProcessed
      billsSkipped
      clientSmsSuccessful
      clientSmsFailed
      issuerSmsSuccessful
      issuerSmsFailed
      clientEmailsSuccessful
      clientEmailsFailed
      issuerEmailsSuccessful
      issuerEmailsFailed
      systemErrors
    }
  }
`;

const UPDATE_BILL_CHASER_CONFIG = gql`
  mutation UpdateBillChaserConfiguration($input: BillChaserConfigInput!) {
    updateBillChaserConfiguration(input: $input) {
      enabled
      cronSchedule
      timezone
      sendToClients
      sendToIssuers
      maxBillsPerRun
      minBillAgeInDays
      scheduleDescription
    }
  }
`;

const ENABLE_BILL_CHASER = gql`
  mutation EnableBillChaser($enabled: Boolean!) {
    enableBillChaser(enabled: $enabled) {
      enabled
      scheduleDescription
    }
  }
`;

const CONFIGURE_NOTIFICATIONS = gql`
  mutation ConfigureBillChaserNotifications($sendToClients: Boolean!, $sendToIssuers: Boolean!) {
    configureBillChaserNotifications(sendToClients: $sendToClients, sendToIssuers: $sendToIssuers) {
      sendToClients
      sendToIssuers
      scheduleDescription
    }
  }
`;

const SET_SAFETY_LIMITS = gql`
  mutation SetBillChaserSafetyLimits($maxBillsPerRun: Float!, $minBillAgeInDays: Float!) {
    setBillChaserSafetyLimits(maxBillsPerRun: $maxBillsPerRun, minBillAgeInDays: $minBillAgeInDays) {
      maxBillsPerRun
      minBillAgeInDays
      scheduleDescription
    }
  }
`;

const BillChaserPage = () => {
    usePageTitle("Bill Chaser");

    const { colorMode } = useColorMode();
    const toast = useToast();
    const bg = getColor("background.main", colorMode);

    // Consistent styling from brandConfig
    const cardGradientBg = getColor("background.cardGradient", colorMode);
    const cardBorder = getColor("border.darkCard", colorMode);
    const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
    const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
    const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [runResults, setRunResults] = useState<BillChaserRunResult | null>(null);

    // Form states - match backend defaults
    const [runConfig, setRunConfig] = useState({
        sendSms: false,  // Match backend default
        sendEmails: true, // Match backend default
        sendToClients: true,
        sendToIssuers: true,
        maxBillsPerRun: 10,
        minBillAgeInDays: 0
    });

    const [configUpdate, setConfigUpdate] = useState({
        maxBillsPerRun: 100,
        minBillAgeInDays: 1
    });

    // GraphQL hooks
    const { loading, error, data, refetch } = useQuery(GET_BILL_CHASER_CONFIG, {
        pollInterval: 30000 // Refresh every 30 seconds
    });

    const [runBillChaser, { loading: running }] = useMutation(RUN_BILL_CHASER_MANUALLY);
    const [updateConfig, { loading: updating }] = useMutation(UPDATE_BILL_CHASER_CONFIG);
    const [enableChaser, { loading: toggling }] = useMutation(ENABLE_BILL_CHASER);
    const [configureNotifications] = useMutation(CONFIGURE_NOTIFICATIONS);
    const [setSafetyLimits] = useMutation(SET_SAFETY_LIMITS);

    // Event handlers
    const handleManualRun = async () => {
        try {
            console.log('🚀 Starting manual bill chaser run with config:', runConfig);

            const { data } = await runBillChaser({
                variables: {
                    input: runConfig
                }
            });

            console.log('📧 Bill chaser results:', data.runBillChaserManually);
            console.log('📊 Email stats:', {
                clientEmailsSuccessful: data.runBillChaserManually.clientEmailsSuccessful,
                clientEmailsFailed: data.runBillChaserManually.clientEmailsFailed,
                issuerEmailsSuccessful: data.runBillChaserManually.issuerEmailsSuccessful,
                issuerEmailsFailed: data.runBillChaserManually.issuerEmailsFailed
            });

            setRunResults(data.runBillChaserManually);
            onOpen(); // Open results modal

            toast({
                title: data.runBillChaserManually.success ? "Bill Chaser Run Completed" : "Bill Chaser Run Had Issues",
                description: data.runBillChaserManually.message,
                status: data.runBillChaserManually.success ? "success" : "warning",
                duration: 5000,
                isClosable: true,
            });

            refetch(); // Refresh configuration
        } catch (error) {
            console.error('❌ Manual run failed:', error);
            toast({
                title: "Bill Chaser Run Failed",
                description: error instanceof Error ? error.message : "Unknown error occurred",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleToggleEnable = async () => {
        try {
            const newEnabled = !data?.getBillChaserConfiguration?.enabled;
            await enableChaser({
                variables: { enabled: newEnabled }
            });

            toast({
                title: `Bill Chaser ${newEnabled ? 'Enabled' : 'Disabled'}`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            refetch();
        } catch (error) {
            toast({
                title: "Error updating bill chaser",
                description: error instanceof Error ? error.message : "Unknown error occurred",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleUpdateSafetyLimits = async () => {
        try {
            await setSafetyLimits({
                variables: {
                    maxBillsPerRun: configUpdate.maxBillsPerRun,
                    minBillAgeInDays: configUpdate.minBillAgeInDays
                }
            });

            toast({
                title: "Safety limits updated",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            refetch();
        } catch (error) {
            toast({
                title: "Error updating safety limits",
                description: error instanceof Error ? error.message : "Unknown error occurred",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleUpdateNotifications = async (sendToClients: boolean, sendToIssuers: boolean) => {
        try {
            await configureNotifications({
                variables: { sendToClients, sendToIssuers }
            });

            toast({
                title: "Notification settings updated",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            refetch();
        } catch (error) {
            toast({
                title: "Error updating notifications",
                description: error instanceof Error ? error.message : "Unknown error occurred",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    if (loading) {
        return (
            <>
                <NavbarWithCallToAction />
                <Container maxW="container.xl" py={8}>
                    <VStack spacing={6}>
                        <Skeleton height="60px" width="100%" />
                        <Skeleton height="200px" width="100%" />
                        <Skeleton height="300px" width="100%" />
                    </VStack>
                </Container>
            </>
        );
    }

    if (error) {
        return (
            <>
                <NavbarWithCallToAction />
                <Container maxW="container.xl" py={8}>
                    <Alert status="error">
                        <AlertIcon />
                        Error loading bill chaser configuration: {error.message}
                    </Alert>
                </Container>
            </>
        );
    }

    const config = data?.getBillChaserConfiguration;

    return (
        <>
            <NavbarWithCallToAction />
            <Container maxW="container.xl" py={8}>
                <VStack spacing={6} align="stretch">

                    {/* Header */}
                    <Card bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px">
                        <CardHeader>
                            <HStack justify="space-between">
                                <VStack align="start" spacing={2}>
                                    <Heading size="lg" color={textPrimary}>📱📧 Bill Chaser System</Heading>
                                    <Text color={getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)}>Automated unpaid bill reminders via SMS and Email notifications</Text>
                                </VStack>
                                <VStack spacing={3}>
                                    <HStack>
                                        <Text fontWeight="bold">System Status:</Text>
                                        <Badge
                                            colorScheme={config?.enabled ? "green" : "red"}
                                            fontSize="md"
                                            p={2}
                                            borderRadius="md"
                                        >
                                            {config?.enabled ? "🟢 ENABLED" : "🔴 DISABLED"}
                                        </Badge>
                                    </HStack>
                                    <Switch
                                        size="lg"
                                        isChecked={config?.enabled || false}
                                        onChange={handleToggleEnable}
                                        isDisabled={toggling}
                                        colorScheme="green"
                                    />
                                </VStack>
                            </HStack>
                        </CardHeader>
                    </Card>

                    {/* Current Configuration */}
                    <Card bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px">
                        <CardHeader>
                            <HStack>
                                <SettingsIcon />
                                <Heading size="md" color={textPrimary}>Current Configuration</Heading>
                            </HStack>
                        </CardHeader>
                        <CardBody>
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                                <Stat>
                                    <StatLabel>Schedule</StatLabel>
                                    <StatNumber fontSize="md">{config?.scheduleDescription}</StatNumber>
                                    <StatHelpText>{config?.timezone}</StatHelpText>
                                </Stat>
                                <Stat>
                                    <StatLabel>Max Bills Per Run</StatLabel>
                                    <StatNumber>{config?.maxBillsPerRun}</StatNumber>
                                    <StatHelpText>Safety limit</StatHelpText>
                                </Stat>
                                <Stat>
                                    <StatLabel>Min Bill Age</StatLabel>
                                    <StatNumber>{config?.minBillAgeInDays} days</StatNumber>
                                    <StatHelpText>Before chasing</StatHelpText>
                                </Stat>
                                <Stat>
                                    <StatLabel>Send to Clients</StatLabel>
                                    <StatNumber>
                                        <Badge colorScheme={config?.sendToClients ? "green" : "red"}>
                                            {config?.sendToClients ? "✅ YES" : "❌ NO"}
                                        </Badge>
                                    </StatNumber>
                                    <StatHelpText>
                                        {config?.sendToClients ? (
                                            <>
                                                {config?.sendSms && "📱 SMS"}
                                                {config?.sendSms && config?.sendEmails && " + "}
                                                {config?.sendEmails && "📧 Email"}
                                                {!config?.sendSms && !config?.sendEmails && "⚠️ No notification methods enabled"}
                                            </>
                                        ) : "Payment reminders disabled"}
                                    </StatHelpText>
                                </Stat>
                                <Stat>
                                    <StatLabel>Send to Issuers</StatLabel>
                                    <StatNumber>
                                        <Badge colorScheme={config?.sendToIssuers ? "green" : "red"}>
                                            {config?.sendToIssuers ? "✅ YES" : "❌ NO"}
                                        </Badge>
                                    </StatNumber>
                                    <StatHelpText>
                                        {config?.sendToIssuers ? (
                                            <>
                                                {config?.sendSms && "📱 SMS"}
                                                {config?.sendSms && config?.sendEmails && " + "}
                                                {config?.sendEmails && "📧 Email"}
                                                {!config?.sendSms && !config?.sendEmails && "⚠️ No notification methods enabled"}
                                            </>
                                        ) : "Issuer notifications disabled"}
                                    </StatHelpText>
                                </Stat>
                                <Stat>
                                    <StatLabel>Cron Schedule</StatLabel>
                                    <StatNumber fontSize="sm">{config?.cronSchedule}</StatNumber>
                                    <StatHelpText>Raw cron expression</StatHelpText>
                                </Stat>
                            </SimpleGrid>
                        </CardBody>
                    </Card>

                    {/* Manual Run Section */}
                    <Card bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px">
                        <CardHeader>
                            <HStack>
                                <TimeIcon />
                                <Heading size="md" color={textPrimary}>Manual Run</Heading>
                            </HStack>
                        </CardHeader>
                        <CardBody>
                            <VStack spacing={4} align="stretch">
                                <Text color={getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode)}>
                                    Run the bill chaser immediately with custom settings. This will override the scheduled run.
                                </Text>

                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                    <VStack align="stretch" spacing={4}>
                                        <FormControl>
                                            <FormLabel>Notification Types</FormLabel>
                                            <VStack align="start">
                                                <Checkbox
                                                    isChecked={runConfig.sendSms}
                                                    onChange={(e) => setRunConfig(prev => ({ ...prev, sendSms: e.target.checked }))}
                                                >
                                                    📱 Send SMS Notifications
                                                </Checkbox>
                                                <Text fontSize="sm" color={getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)} ml={6}>
                                                    Quick text message alerts to clients and issuers
                                                </Text>
                                                <Checkbox
                                                    isChecked={runConfig.sendEmails}
                                                    onChange={(e) => setRunConfig(prev => ({ ...prev, sendEmails: e.target.checked }))}
                                                >
                                                    📧 Send Email Notifications
                                                </Checkbox>
                                                <Text fontSize="sm" color={getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode)} ml={6}>
                                                    Professional HTML emails to clients and issuers
                                                </Text>
                                            </VStack>
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel>Send To</FormLabel>
                                            <VStack align="start">
                                                <Checkbox
                                                    isChecked={runConfig.sendToClients}
                                                    onChange={(e) => setRunConfig(prev => ({ ...prev, sendToClients: e.target.checked }))}
                                                >
                                                    Clients (payment reminders)
                                                </Checkbox>
                                                <Checkbox
                                                    isChecked={runConfig.sendToIssuers}
                                                    onChange={(e) => setRunConfig(prev => ({ ...prev, sendToIssuers: e.target.checked }))}
                                                >
                                                    Bill Issuers (notifications)
                                                </Checkbox>
                                            </VStack>
                                        </FormControl>
                                    </VStack>

                                    <VStack align="stretch" spacing={4}>
                                        <FormControl>
                                            <FormLabel>Max Bills to Process</FormLabel>
                                            <NumberInput
                                                value={runConfig.maxBillsPerRun}
                                                onChange={(_, num) => setRunConfig(prev => ({ ...prev, maxBillsPerRun: num || 10 }))}
                                                min={1}
                                                max={100}
                                            >
                                                <NumberInputField />
                                                <NumberInputStepper>
                                                    <NumberIncrementStepper />
                                                    <NumberDecrementStepper />
                                                </NumberInputStepper>
                                            </NumberInput>
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel>Min Bill Age (days)</FormLabel>
                                            <NumberInput
                                                value={runConfig.minBillAgeInDays}
                                                onChange={(_, num) => setRunConfig(prev => ({ ...prev, minBillAgeInDays: num || 0 }))}
                                                min={0}
                                                max={30}
                                            >
                                                <NumberInputField />
                                                <NumberInputStepper>
                                                    <NumberIncrementStepper />
                                                    <NumberDecrementStepper />
                                                </NumberInputStepper>
                                            </NumberInput>
                                        </FormControl>
                                    </VStack>
                                </SimpleGrid>

                                <Button
                                    colorScheme="blue"
                                    size="lg"
                                    onClick={handleManualRun}
                                    isLoading={running}
                                    loadingText="Running Bill Chaser..."
                                    leftIcon={<TimeIcon />}
                                >
                                    Run Bill Chaser Now
                                </Button>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Configuration Management */}
                    <Card bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px">
                        <CardHeader>
                            <HStack>
                                <SettingsIcon />
                                <Heading size="md" color={textPrimary}>Configuration Management</Heading>
                            </HStack>
                        </CardHeader>
                        <CardBody>
                            <Accordion allowToggle>
                                <AccordionItem>
                                    <AccordionButton>
                                        <Box flex="1" textAlign="left">
                                            <Text fontWeight="bold">Safety Limits</Text>
                                        </Box>
                                        <AccordionIcon />
                                    </AccordionButton>
                                    <AccordionPanel pb={4}>
                                        <VStack spacing={4} align="stretch">
                                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                                <FormControl>
                                                    <FormLabel>Max Bills Per Run</FormLabel>
                                                    <NumberInput
                                                        value={configUpdate.maxBillsPerRun}
                                                        onChange={(_, num) => setConfigUpdate(prev => ({ ...prev, maxBillsPerRun: num || 100 }))}
                                                        min={1}
                                                        max={1000}
                                                    >
                                                        <NumberInputField />
                                                        <NumberInputStepper>
                                                            <NumberIncrementStepper />
                                                            <NumberDecrementStepper />
                                                        </NumberInputStepper>
                                                    </NumberInput>
                                                </FormControl>

                                                <FormControl>
                                                    <FormLabel>Min Bill Age (days)</FormLabel>
                                                    <NumberInput
                                                        value={configUpdate.minBillAgeInDays}
                                                        onChange={(_, num) => setConfigUpdate(prev => ({ ...prev, minBillAgeInDays: num || 1 }))}
                                                        min={0}
                                                        max={365}
                                                    >
                                                        <NumberInputField />
                                                        <NumberInputStepper>
                                                            <NumberIncrementStepper />
                                                            <NumberDecrementStepper />
                                                        </NumberInputStepper>
                                                    </NumberInput>
                                                </FormControl>
                                            </SimpleGrid>

                                            <Button
                                                colorScheme="green"
                                                onClick={handleUpdateSafetyLimits}
                                                isLoading={updating}
                                            >
                                                Update Safety Limits
                                            </Button>
                                        </VStack>
                                    </AccordionPanel>
                                </AccordionItem>

                                <AccordionItem>
                                    <AccordionButton>
                                        <Box flex="1" textAlign="left">
                                            <Text fontWeight="bold">Notification Settings</Text>
                                        </Box>
                                        <AccordionIcon />
                                    </AccordionButton>
                                    <AccordionPanel pb={4}>
                                        <VStack spacing={4} align="stretch">
                                            <Text color={getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode)}>
                                                Configure who receives notifications when bills are chased.
                                            </Text>

                                            <HStack spacing={8}>
                                                <Button
                                                    colorScheme={config?.sendToClients ? "green" : "gray"}
                                                    variant={config?.sendToClients ? "solid" : "outline"}
                                                    onClick={() => handleUpdateNotifications(!config?.sendToClients, config?.sendToIssuers)}
                                                >
                                                    {config?.sendToClients ? "✅" : "❌"} Send to Clients
                                                </Button>

                                                <Button
                                                    colorScheme={config?.sendToIssuers ? "green" : "gray"}
                                                    variant={config?.sendToIssuers ? "solid" : "outline"}
                                                    onClick={() => handleUpdateNotifications(config?.sendToClients, !config?.sendToIssuers)}
                                                >
                                                    {config?.sendToIssuers ? "✅" : "❌"} Send to Issuers
                                                </Button>
                                            </HStack>
                                        </VStack>
                                    </AccordionPanel>
                                </AccordionItem>
                            </Accordion>
                        </CardBody>
                    </Card>

                    {/* System Information */}
                    <Card bg={cardGradientBg} borderColor={cardBorder} borderWidth="1px">
                        <CardHeader>
                            <Heading size="md" color={textPrimary}>ℹ️ System Information</Heading>
                        </CardHeader>
                        <CardBody>
                            <VStack align="stretch" spacing={4}>
                                <Text>
                                    <Text as="span" fontWeight="bold">Purpose:</Text> The Bill Chaser automatically finds unpaid bills
                                    and sends SMS and email reminders to clients and notifications to bill issuers.
                                </Text>

                                <Divider />

                                <Text fontWeight="bold">How it works:</Text>
                                <List spacing={2}>
                                    <ListItem>
                                        <ListIcon as={CheckCircleIcon} color={getColor("status.success", colorMode)} />
                                        Finds bills marked as 'SENT' but not paid
                                    </ListItem>
                                    <ListItem>
                                        <ListIcon as={CheckCircleIcon} color={getColor("status.success", colorMode)} />
                                        Sends SMS to clients with payment links
                                    </ListItem>
                                    <ListItem>
                                        <ListIcon as={CheckCircleIcon} color={getColor("status.success", colorMode)} />
                                        Sends professional email reminders to clients
                                    </ListItem>
                                    <ListItem>
                                        <ListIcon as={CheckCircleIcon} color={getColor("status.success", colorMode)} />
                                        Notifies bill issuers via SMS and email about unpaid bills
                                    </ListItem>
                                    <ListItem>
                                        <ListIcon as={CheckCircleIcon} color={getColor("status.success", colorMode)} />
                                        Uses tenant-specific branding and URLs
                                    </ListItem>
                                    <ListItem>
                                        <ListIcon as={WarningIcon} color={getColor("status.warning", colorMode)} />
                                        Respects safety limits and bill age requirements
                                    </ListItem>
                                </List>
                            </VStack>
                        </CardBody>
                    </Card>

                </VStack>
            </Container>

            {/* Results Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent bg={cardGradientBg} color={textPrimary} borderColor={cardBorder} borderWidth="1px">
                    <ModalHeader color={textPrimary}>📊 Bill Chaser Run Results</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {runResults && (
                            <VStack spacing={4} align="stretch">
                                <HStack justify="space-between">
                                    <Text fontWeight="bold">Status:</Text>
                                    <Badge colorScheme={runResults.success ? "green" : "red"} fontSize="md" p={2}>
                                        {runResults.success ? "✅ SUCCESS" : "⚠️ ISSUES"}
                                    </Badge>
                                </HStack>

                                <Text>
                                    <Text as="span" fontWeight="bold">Message:</Text> {runResults.message}
                                </Text>

                                <Text>
                                    <Text as="span" fontWeight="bold">Duration:</Text> {runResults.duration}ms
                                </Text>

                                <Divider />

                                <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
                                    <Stat>
                                        <StatLabel>Bills Found</StatLabel>
                                        <StatNumber>{runResults.totalBillsFound}</StatNumber>
                                    </Stat>
                                    <Stat>
                                        <StatLabel>Bills Processed</StatLabel>
                                        <StatNumber>{runResults.billsProcessed}</StatNumber>
                                    </Stat>
                                    <Stat>
                                        <StatLabel>Bills Skipped</StatLabel>
                                        <StatNumber>{runResults.billsSkipped}</StatNumber>
                                    </Stat>
                                </SimpleGrid>

                                <Text fontWeight="bold" mt={4} mb={2}>📱 SMS Notifications</Text>
                                <SimpleGrid columns={2} spacing={4}>
                                    <Stat>
                                        <StatLabel>Client SMS</StatLabel>
                                        <StatNumber color={getColor("status.success", colorMode)}>{runResults.clientSmsSuccessful}</StatNumber>
                                        <StatHelpText>
                                            {runResults.clientSmsFailed > 0 && (
                                                <Text color={getColor("status.error", colorMode)}>{runResults.clientSmsFailed} failed</Text>
                                            )}
                                        </StatHelpText>
                                    </Stat>
                                    <Stat>
                                        <StatLabel>Issuer SMS</StatLabel>
                                        <StatNumber color={getColor("status.success", colorMode)}>{runResults.issuerSmsSuccessful}</StatNumber>
                                        <StatHelpText>
                                            {runResults.issuerSmsFailed > 0 && (
                                                <Text color={getColor("status.error", colorMode)}>{runResults.issuerSmsFailed} failed</Text>
                                            )}
                                        </StatHelpText>
                                    </Stat>
                                </SimpleGrid>

                                <Text fontWeight="bold" mt={4} mb={2}>📧 Email Notifications</Text>
                                <SimpleGrid columns={2} spacing={4}>
                                    <Stat>
                                        <StatLabel>Client Emails</StatLabel>
                                        <StatNumber color={getColor("status.success", colorMode)}>{runResults.clientEmailsSuccessful}</StatNumber>
                                        <StatHelpText>
                                            {runResults.clientEmailsFailed > 0 && (
                                                <Text color={getColor("status.error", colorMode)}>{runResults.clientEmailsFailed} failed</Text>
                                            )}
                                        </StatHelpText>
                                    </Stat>
                                    <Stat>
                                        <StatLabel>Issuer Emails</StatLabel>
                                        <StatNumber color={getColor("status.success", colorMode)}>{runResults.issuerEmailsSuccessful}</StatNumber>
                                        <StatHelpText>
                                            {runResults.issuerEmailsFailed > 0 && (
                                                <Text color={getColor("status.error", colorMode)}>{runResults.issuerEmailsFailed} failed</Text>
                                            )}
                                        </StatHelpText>
                                    </Stat>
                                </SimpleGrid>

                                {runResults.systemErrors && runResults.systemErrors.length > 0 && (
                                    <>
                                        <Divider />
                                        <Alert status="error">
                                            <AlertIcon />
                                            <VStack align="start" spacing={1}>
                                                <Text fontWeight="bold">System Errors:</Text>
                                                {runResults.systemErrors.map((error: string, index: number) => (
                                                    <Text key={index} fontSize="sm">• {error}</Text>
                                                ))}
                                            </VStack>
                                        </Alert>
                                    </>
                                )}
                            </VStack>
                        )}
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" onClick={onClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <FooterWithFourColumns />
        </>
    );
};

export default BillChaserPage;
