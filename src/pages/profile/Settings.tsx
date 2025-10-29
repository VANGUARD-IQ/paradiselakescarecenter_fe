import React from "react";
import {
    Box,
    Container,
    Heading,
    VStack,
    HStack,
    Text,
    Card,
    CardHeader,
    CardBody,
    Button,
    FormControl,
    FormLabel,
    Switch,
    Select,
    useToast,
    Alert,
    AlertIcon,
    Spinner,
    Divider,
    Badge,
    useColorMode,
    SimpleGrid,
    Icon,
} from "@chakra-ui/react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { ArrowBackIcon, CheckIcon, MoonIcon, SunIcon, BellIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { getColor, getComponent } from "../../brandConfig";

const GET_CLIENT_SETTINGS = gql`
    query GetClient($id: ID!) {
        client(id: $id) {
            id
            fName
            lName
            email
            phoneNumber
            permissions
            createdAt
        }
    }
`;

const Settings = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const { user } = useAuth();
    const { colorMode, toggleColorMode } = useColorMode();
    const bg = getColor("background.surface");

    const [settings, setSettings] = React.useState({
        emailNotifications: true,
        smsNotifications: false,
        marketingEmails: false,
        securityAlerts: true,
        language: "en",
        timezone: "Australia/Sydney",
        currency: "AUD",
        twoFactorEnabled: false,
        sessionTimeout: "24h",
    });

    const { data, loading: queryLoading } = useQuery(GET_CLIENT_SETTINGS, {
        variables: { id: user?.id },
        skip: !user?.id
    });

    const handleSettingChange = (setting: string, value: boolean | string) => {
        setSettings(prev => ({
            ...prev,
            [setting]: value
        }));

        // Show toast for immediate feedback
        toast({
            title: "Setting Updated",
            description: `${setting.replace(/([A-Z])/g, ' $1').toLowerCase()} has been updated`,
            status: "success",
            duration: 2000,
        });
    };

    const handleExportData = () => {
        toast({
            title: "Data Export Requested",
            description: "Your data export will be sent to your email within 24 hours",
            status: "info",
            duration: 5000,
        });
    };

    const handleDeleteAccount = () => {
        toast({
            title: "Account Deletion",
            description: "Please contact support to delete your account",
            status: "warning",
            duration: 5000,
        });
    };

    if (queryLoading) {
        return (
            <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <Container maxW="container.xl" py={12} flex="1">
                    <VStack spacing={8}>
                        <Spinner size="xl" />
                        <Text>Loading settings...</Text>
                    </VStack>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    const client = data?.client;

    return (
        <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <Container maxW="container.xl" py={12} flex="1">
                <VStack spacing={8} align="stretch">
                    {/* Header */}
                    <HStack justify="space-between">
                        <VStack align="start" spacing={2}>
                            <Button
                                variant="ghost"
                                onClick={() => navigate("/profile")}
                                leftIcon={<ArrowBackIcon />}
                            >
                                Back to Profile
                            </Button>
                            <Heading size="lg">⚙️ Settings</Heading>
                            <Text color="gray.600">Manage your account preferences and security settings</Text>
                        </VStack>
                    </HStack>

                    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
                        {/* Account Information */}
                        <Card>
                            <CardHeader>
                                <HStack>
                                    {/* <Icon as={SecurityIcon} color={getColor("primary")} /> */}
                                    <Heading size="md">Account Information</Heading>
                                </HStack>
                            </CardHeader>
                            <CardBody>
                                <VStack align="start" spacing={4}>
                                    <Box>
                                        <Text fontWeight="bold">Name</Text>
                                        <Text>{client?.fName} {client?.lName}</Text>
                                    </Box>
                                    <Box>
                                        <Text fontWeight="bold">Email</Text>
                                        <Text>{client?.email}</Text>
                                    </Box>
                                    <Box>
                                        <Text fontWeight="bold">Phone</Text>
                                        <Text>{client?.phoneNumber}</Text>
                                    </Box>
                                    <Box>
                                        <Text fontWeight="bold">Member Since</Text>
                                        <Text>{client?.createdAt ? new Date(client.createdAt).toLocaleDateString() : "N/A"}</Text>
                                    </Box>
                                    <Box>
                                        <Text fontWeight="bold">Permissions</Text>
                                        <HStack spacing={2} flexWrap="wrap">
                                            {client?.permissions?.map((permission: string) => (
                                                <Badge key={permission} colorScheme="blue">
                                                    {permission}
                                                </Badge>
                                            ))}
                                        </HStack>
                                    </Box>
                                </VStack>
                            </CardBody>
                        </Card>

                        {/* Appearance Settings */}
                        <Card>
                            <CardHeader>
                                <HStack>
                                    <Icon as={colorMode === 'light' ? SunIcon : MoonIcon} color={getColor("primary")} />
                                    <Heading size="md">Appearance</Heading>
                                </HStack>
                            </CardHeader>
                            <CardBody>
                                <VStack spacing={6}>
                                    <FormControl display="flex" alignItems="center" justifyContent="space-between">
                                        <FormLabel htmlFor="dark-mode" mb="0">
                                            Dark Mode
                                        </FormLabel>
                                        <Switch
                                            id="dark-mode"
                                            isChecked={colorMode === 'dark'}
                                            onChange={toggleColorMode}
                                            colorScheme="blue"
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Language</FormLabel>
                                        <Select
                                            value={settings.language}
                                            onChange={(e) => handleSettingChange("language", e.target.value)}
                                            bg={getComponent("form", "fieldBg")}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                        >
                                            <option value="en">English</option>
                                            <option value="es">Spanish</option>
                                            <option value="fr">French</option>
                                            <option value="de">German</option>
                                            <option value="ja">Japanese</option>
                                        </Select>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Timezone</FormLabel>
                                        <Select
                                            value={settings.timezone}
                                            onChange={(e) => handleSettingChange("timezone", e.target.value)}
                                            bg={getComponent("form", "fieldBg")}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                        >
                                            <option value="Australia/Sydney">Sydney (UTC+10)</option>
                                            <option value="Australia/Melbourne">Melbourne (UTC+10)</option>
                                            <option value="Australia/Perth">Perth (UTC+8)</option>
                                            <option value="America/New_York">New York (UTC-5)</option>
                                            <option value="America/Los_Angeles">Los Angeles (UTC-8)</option>
                                            <option value="Europe/London">London (UTC+0)</option>
                                            <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
                                        </Select>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Currency</FormLabel>
                                        <Select
                                            value={settings.currency}
                                            onChange={(e) => handleSettingChange("currency", e.target.value)}
                                            bg={getComponent("form", "fieldBg")}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                        >
                                            <option value="AUD">Australian Dollar (AUD)</option>
                                            <option value="USD">US Dollar (USD)</option>
                                            <option value="EUR">Euro (EUR)</option>
                                            <option value="GBP">British Pound (GBP)</option>
                                            <option value="JPY">Japanese Yen (JPY)</option>
                                        </Select>
                                    </FormControl>
                                </VStack>
                            </CardBody>
                        </Card>

                        {/* Notification Settings */}
                        <Card>
                            <CardHeader>
                                <HStack>
                                    <Icon as={BellIcon} color={getColor("primary")} />
                                    <Heading size="md">Notifications</Heading>
                                </HStack>
                            </CardHeader>
                            <CardBody>
                                <VStack spacing={6}>
                                    <FormControl display="flex" alignItems="center" justifyContent="space-between">
                                        <FormLabel htmlFor="email-notifications" mb="0">
                                            <VStack align="start" spacing={1}>
                                                <Text>Email Notifications</Text>
                                                <Text fontSize="sm" color="gray.500">
                                                    Receive important updates via email
                                                </Text>
                                            </VStack>
                                        </FormLabel>
                                        <Switch
                                            id="email-notifications"
                                            isChecked={settings.emailNotifications}
                                            onChange={(e) => handleSettingChange("emailNotifications", e.target.checked)}
                                            colorScheme="blue"
                                        />
                                    </FormControl>

                                    <FormControl display="flex" alignItems="center" justifyContent="space-between">
                                        <FormLabel htmlFor="sms-notifications" mb="0">
                                            <VStack align="start" spacing={1}>
                                                <Text>SMS Notifications</Text>
                                                <Text fontSize="sm" color="gray.500">
                                                    Receive urgent alerts via SMS
                                                </Text>
                                            </VStack>
                                        </FormLabel>
                                        <Switch
                                            id="sms-notifications"
                                            isChecked={settings.smsNotifications}
                                            onChange={(e) => handleSettingChange("smsNotifications", e.target.checked)}
                                            colorScheme="blue"
                                        />
                                    </FormControl>

                                    <FormControl display="flex" alignItems="center" justifyContent="space-between">
                                        <FormLabel htmlFor="marketing-emails" mb="0">
                                            <VStack align="start" spacing={1}>
                                                <Text>Marketing Emails</Text>
                                                <Text fontSize="sm" color="gray.500">
                                                    Receive promotional content and offers
                                                </Text>
                                            </VStack>
                                        </FormLabel>
                                        <Switch
                                            id="marketing-emails"
                                            isChecked={settings.marketingEmails}
                                            onChange={(e) => handleSettingChange("marketingEmails", e.target.checked)}
                                            colorScheme="blue"
                                        />
                                    </FormControl>

                                    <FormControl display="flex" alignItems="center" justifyContent="space-between">
                                        <FormLabel htmlFor="security-alerts" mb="0">
                                            <VStack align="start" spacing={1}>
                                                <Text>Security Alerts</Text>
                                                <Text fontSize="sm" color="gray.500">
                                                    Receive notifications about account security
                                                </Text>
                                            </VStack>
                                        </FormLabel>
                                        <Switch
                                            id="security-alerts"
                                            isChecked={settings.securityAlerts}
                                            onChange={(e) => handleSettingChange("securityAlerts", e.target.checked)}
                                            colorScheme="blue"
                                        />
                                    </FormControl>
                                </VStack>
                            </CardBody>
                        </Card>

                        {/* Security Settings */}
                        <Card>
                            <CardHeader>
                                <HStack>
                                    {/* <Icon as={SecurityIcon} color={getColor("primary")} /> */}
                                    <Heading size="md">Security</Heading>
                                </HStack>
                            </CardHeader>
                            <CardBody>
                                <VStack spacing={6}>
                                    <FormControl display="flex" alignItems="center" justifyContent="space-between">
                                        <FormLabel htmlFor="two-factor" mb="0">
                                            <VStack align="start" spacing={1}>
                                                <Text>Two-Factor Authentication</Text>
                                                <Text fontSize="sm" color="gray.500">
                                                    Add an extra layer of security
                                                </Text>
                                            </VStack>
                                        </FormLabel>
                                        <Switch
                                            id="two-factor"
                                            isChecked={settings.twoFactorEnabled}
                                            onChange={(e) => handleSettingChange("twoFactorEnabled", e.target.checked)}
                                            colorScheme="blue"
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Session Timeout</FormLabel>
                                        <Select
                                            value={settings.sessionTimeout}
                                            onChange={(e) => handleSettingChange("sessionTimeout", e.target.value)}
                                            bg={getComponent("form", "fieldBg")}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                        >
                                            <option value="1h">1 Hour</option>
                                            <option value="8h">8 Hours</option>
                                            <option value="24h">24 Hours</option>
                                            <option value="7d">7 Days</option>
                                            <option value="30d">30 Days</option>
                                        </Select>
                                    </FormControl>

                                    <Divider />

                                    <VStack spacing={4} width="100%">
                                        <Button
                                            onClick={() => navigate("/profile/edit")}
                                            variant="outline"
                                            width="100%"
                                        >
                                            Change Email or Phone
                                        </Button>

                                        <Button
                                            onClick={handleExportData}
                                            variant="outline"
                                            width="100%"
                                        >
                                            Export My Data
                                        </Button>
                                    </VStack>
                                </VStack>
                            </CardBody>
                        </Card>
                    </SimpleGrid>

                    {/* Danger Zone */}
                    <Card borderColor="red.300">
                        <CardHeader>
                            <Heading size="md" color="red.500">⚠️ Danger Zone</Heading>
                        </CardHeader>
                        <CardBody>
                            <Alert status="warning" mb={4}>
                                <AlertIcon />
                                <Text>
                                    These actions are permanent and cannot be undone. Please proceed with caution.
                                </Text>
                            </Alert>

                            <VStack spacing={4} align="stretch">
                                <Box p={4} border="1px" borderColor="red.200" borderRadius="md">
                                    <VStack align="start" spacing={2}>
                                        <Text fontWeight="bold" color="red.600">Delete Account</Text>
                                        <Text fontSize="sm" color="gray.600">
                                            Permanently delete your account and all associated data. This action cannot be undone.
                                        </Text>
                                        <Button
                                            colorScheme="red"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleDeleteAccount}
                                        >
                                            Request Account Deletion
                                        </Button>
                                    </VStack>
                                </Box>
                            </VStack>
                        </CardBody>
                    </Card>
                </VStack>
            </Container>
            <FooterWithFourColumns />
        </Box>
    );
};

export default Settings; 