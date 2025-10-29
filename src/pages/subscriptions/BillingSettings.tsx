import React, { useState } from "react";
import {
    Container,
    Card,
    CardHeader,
    CardBody,
    Heading,
    VStack,
    HStack,
    FormControl,
    FormLabel,
    Input,
    Switch,
    Button,
    Text,
    Divider,
    useToast,
    Select,
    Textarea,
    Box
} from "@chakra-ui/react";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { getColor, getComponent, brandConfig } from "../../brandConfig";
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import subscriptionsModuleConfig from './moduleConfig';
import { usePageTitle } from "../../hooks/useDocumentTitle";

const BillingSettings = () => {
    usePageTitle("Billing Settings");
    const toast = useToast();

    const [settings, setSettings] = useState({
        // General settings
        defaultCurrency: "USD",
        taxRate: 0,

        // Invoice settings
        invoicePrefix: "INV",
        invoiceNumberStart: 1000,
        invoiceTerms: "Payment is due within 30 days of invoice date.",

        // Email notifications
        sendInvoiceEmails: true,
        sendPaymentReminders: true,
        sendPaymentConfirmations: true,

        // Reminder settings
        reminderDaysBefore: 7,
        reminderDaysAfter: 3,

        // Company information
        companyName: "",
        companyAddress: "",
        companyEmail: "",
        companyPhone: "",

        // Stripe settings
        stripePublicKey: "",
        stripeSecretKey: "",
        stripeWebhookSecret: ""
    });

    const bg = getColor("background.surface");

    const handleSave = () => {
        // Implementation would save settings via GraphQL mutation
        toast({
            title: "Settings Saved",
            description: "Your billing settings have been updated successfully",
            status: "success",
            duration: 3000
        });
    };

    return (
        <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={subscriptionsModuleConfig} />
            <Container maxW="container.md" py={12} flex="1">
                <VStack spacing={6} align="stretch">
                    {/* General Settings */}
                    <Card
                        bg={getColor("background.card")}
                        boxShadow={getComponent("card", "shadow")}
                        border="1px"
                        borderColor={getColor("border.light")}
                    >
                        <CardHeader>
                            <Heading size="md" color={getColor("text.primary")}>General Settings</Heading>
                        </CardHeader>
                        <CardBody>
                            <VStack spacing={4} align="stretch">
                                <HStack spacing={4}>
                                    <FormControl>
                                        <FormLabel
                                            color={getComponent("form", "labelColor")}
                                            fontWeight="500"
                                            fontSize="sm"
                                            mb={2}
                                        >
                                            Default Currency
                                        </FormLabel>
                                        <Select
                                            value={settings.defaultCurrency}
                                            onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                                            bg={getComponent("form", "fieldBg")}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            borderRadius="lg"
                                            boxShadow={getComponent("form", "fieldShadow")}
                                            _focus={{
                                                borderColor: getComponent("form", "fieldBorderFocus"),
                                                boxShadow: getComponent("form", "fieldShadowFocus"),
                                                outline: "none"
                                            }}
                                            _hover={{
                                                borderColor: getColor("border.medium")
                                            }}
                                            size="lg"
                                            fontFamily={brandConfig.fonts.body}
                                        >
                                            <option value="USD">USD - US Dollar</option>
                                            <option value="EUR">EUR - Euro</option>
                                            <option value="GBP">GBP - British Pound</option>
                                            <option value="AUD">AUD - Australian Dollar</option>
                                            <option value="CAD">CAD - Canadian Dollar</option>
                                        </Select>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel
                                            color={getComponent("form", "labelColor")}
                                            fontWeight="500"
                                            fontSize="sm"
                                            mb={2}
                                        >
                                            Default Tax Rate (%)
                                        </FormLabel>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={settings.taxRate}
                                            onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
                                            bg={getComponent("form", "fieldBg")}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            borderRadius="lg"
                                            boxShadow={getComponent("form", "fieldShadow")}
                                            _placeholder={{ color: getComponent("form", "placeholderColor") }}
                                            _focus={{
                                                borderColor: getComponent("form", "fieldBorderFocus"),
                                                boxShadow: getComponent("form", "fieldShadowFocus"),
                                                outline: "none"
                                            }}
                                            _hover={{
                                                borderColor: getColor("border.medium")
                                            }}
                                            size="lg"
                                            fontFamily={brandConfig.fonts.body}
                                        />
                                    </FormControl>
                                </HStack>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Invoice Settings */}
                    <Card
                        bg={getColor("background.card")}
                        boxShadow={getComponent("card", "shadow")}
                        border="1px"
                        borderColor={getColor("border.light")}
                    >
                        <CardHeader>
                            <Heading size="md" color={getColor("text.primary")}>Invoice Settings</Heading>
                        </CardHeader>
                        <CardBody>
                            <VStack spacing={4} align="stretch">
                                <HStack spacing={4}>
                                    <FormControl>
                                        <FormLabel
                                            color={getComponent("form", "labelColor")}
                                            fontWeight="500"
                                            fontSize="sm"
                                            mb={2}
                                        >
                                            Invoice Number Prefix
                                        </FormLabel>
                                        <Input
                                            value={settings.invoicePrefix}
                                            onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                                            placeholder="INV"
                                            bg={getComponent("form", "fieldBg")}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            borderRadius="lg"
                                            boxShadow={getComponent("form", "fieldShadow")}
                                            _placeholder={{ color: getComponent("form", "placeholderColor") }}
                                            _focus={{
                                                borderColor: getComponent("form", "fieldBorderFocus"),
                                                boxShadow: getComponent("form", "fieldShadowFocus"),
                                                outline: "none"
                                            }}
                                            _hover={{
                                                borderColor: getColor("border.medium")
                                            }}
                                            size="lg"
                                            fontFamily={brandConfig.fonts.body}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel
                                            color={getComponent("form", "labelColor")}
                                            fontWeight="500"
                                            fontSize="sm"
                                            mb={2}
                                        >
                                            Starting Number
                                        </FormLabel>
                                        <Input
                                            type="number"
                                            value={settings.invoiceNumberStart}
                                            onChange={(e) => setSettings({ ...settings, invoiceNumberStart: parseInt(e.target.value) })}
                                            bg={getComponent("form", "fieldBg")}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            borderRadius="lg"
                                            boxShadow={getComponent("form", "fieldShadow")}
                                            _placeholder={{ color: getComponent("form", "placeholderColor") }}
                                            _focus={{
                                                borderColor: getComponent("form", "fieldBorderFocus"),
                                                boxShadow: getComponent("form", "fieldShadowFocus"),
                                                outline: "none"
                                            }}
                                            _hover={{
                                                borderColor: getColor("border.medium")
                                            }}
                                            size="lg"
                                            fontFamily={brandConfig.fonts.body}
                                        />
                                    </FormControl>
                                </HStack>

                                <FormControl>
                                    <FormLabel
                                        color={getComponent("form", "labelColor")}
                                        fontWeight="500"
                                        fontSize="sm"
                                        mb={2}
                                    >
                                        Payment Terms
                                    </FormLabel>
                                    <Textarea
                                        value={settings.invoiceTerms}
                                        onChange={(e) => setSettings({ ...settings, invoiceTerms: e.target.value })}
                                        placeholder="Payment terms and conditions..."
                                        rows={3}
                                        bg={getComponent("form", "fieldBg")}
                                        border="1px"
                                        borderColor={getComponent("form", "fieldBorder")}
                                        borderRadius="lg"
                                        boxShadow={getComponent("form", "fieldShadow")}
                                        _placeholder={{ color: getComponent("form", "placeholderColor") }}
                                        _focus={{
                                            borderColor: getComponent("form", "fieldBorderFocus"),
                                            boxShadow: getComponent("form", "fieldShadowFocus"),
                                            outline: "none"
                                        }}
                                        _hover={{
                                            borderColor: getColor("border.medium")
                                        }}
                                        fontFamily={brandConfig.fonts.body}
                                    />
                                </FormControl>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Email Notifications */}
                    <Card
                        bg={getColor("background.card")}
                        boxShadow={getComponent("card", "shadow")}
                        border="1px"
                        borderColor={getColor("border.light")}
                    >
                        <CardHeader>
                            <Heading size="md" color={getColor("text.primary")}>Email Notifications</Heading>
                        </CardHeader>
                        <CardBody>
                            <VStack spacing={4} align="stretch">
                                <HStack justify="space-between">
                                    <VStack align="start" spacing={0}>
                                        <Text fontWeight="medium" color={getColor("text.primary")}>Send Invoice Emails</Text>
                                        <Text fontSize="sm" color={getColor("text.muted")}>
                                            Automatically email invoices to clients when created
                                        </Text>
                                    </VStack>
                                    <Switch
                                        isChecked={settings.sendInvoiceEmails}
                                        onChange={(e) => setSettings({ ...settings, sendInvoiceEmails: e.target.checked })}
                                    />
                                </HStack>

                                <HStack justify="space-between">
                                    <VStack align="start" spacing={0}>
                                        <Text fontWeight="medium" color={getColor("text.primary")}>Payment Reminders</Text>
                                        <Text fontSize="sm" color={getColor("text.muted")}>
                                            Send automatic payment reminders for overdue invoices
                                        </Text>
                                    </VStack>
                                    <Switch
                                        isChecked={settings.sendPaymentReminders}
                                        onChange={(e) => setSettings({ ...settings, sendPaymentReminders: e.target.checked })}
                                    />
                                </HStack>

                                <HStack justify="space-between">
                                    <VStack align="start" spacing={0}>
                                        <Text fontWeight="medium" color={getColor("text.primary")}>Payment Confirmations</Text>
                                        <Text fontSize="sm" color={getColor("text.muted")}>
                                            Send confirmation emails when payments are received
                                        </Text>
                                    </VStack>
                                    <Switch
                                        isChecked={settings.sendPaymentConfirmations}
                                        onChange={(e) => setSettings({ ...settings, sendPaymentConfirmations: e.target.checked })}
                                    />
                                </HStack>

                                <Divider />

                                <HStack spacing={4}>
                                    <FormControl>
                                        <FormLabel
                                            color={getComponent("form", "labelColor")}
                                            fontWeight="500"
                                            fontSize="sm"
                                            mb={2}
                                        >
                                            Reminder Days Before Due
                                        </FormLabel>
                                        <Input
                                            type="number"
                                            value={settings.reminderDaysBefore}
                                            onChange={(e) => setSettings({ ...settings, reminderDaysBefore: parseInt(e.target.value) })}
                                            bg={getComponent("form", "fieldBg")}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            borderRadius="lg"
                                            boxShadow={getComponent("form", "fieldShadow")}
                                            _placeholder={{ color: getComponent("form", "placeholderColor") }}
                                            _focus={{
                                                borderColor: getComponent("form", "fieldBorderFocus"),
                                                boxShadow: getComponent("form", "fieldShadowFocus"),
                                                outline: "none"
                                            }}
                                            _hover={{
                                                borderColor: getColor("border.medium")
                                            }}
                                            size="lg"
                                            fontFamily={brandConfig.fonts.body}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel
                                            color={getComponent("form", "labelColor")}
                                            fontWeight="500"
                                            fontSize="sm"
                                            mb={2}
                                        >
                                            Reminder Days After Due
                                        </FormLabel>
                                        <Input
                                            type="number"
                                            value={settings.reminderDaysAfter}
                                            onChange={(e) => setSettings({ ...settings, reminderDaysAfter: parseInt(e.target.value) })}
                                            bg={getComponent("form", "fieldBg")}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            borderRadius="lg"
                                            boxShadow={getComponent("form", "fieldShadow")}
                                            _placeholder={{ color: getComponent("form", "placeholderColor") }}
                                            _focus={{
                                                borderColor: getComponent("form", "fieldBorderFocus"),
                                                boxShadow: getComponent("form", "fieldShadowFocus"),
                                                outline: "none"
                                            }}
                                            _hover={{
                                                borderColor: getColor("border.medium")
                                            }}
                                            size="lg"
                                            fontFamily={brandConfig.fonts.body}
                                        />
                                    </FormControl>
                                </HStack>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Company Information */}
                    <Card
                        bg={getColor("background.card")}
                        boxShadow={getComponent("card", "shadow")}
                        border="1px"
                        borderColor={getColor("border.light")}
                    >
                        <CardHeader>
                            <Heading size="md" color={getColor("text.primary")}>Company Information</Heading>
                        </CardHeader>
                        <CardBody>
                            <VStack spacing={4} align="stretch">
                                <FormControl>
                                    <FormLabel
                                        color={getComponent("form", "labelColor")}
                                        fontWeight="500"
                                        fontSize="sm"
                                        mb={2}
                                    >
                                        Company Name
                                    </FormLabel>
                                    <Input
                                        value={settings.companyName}
                                        onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                                        placeholder="Your Company Name"
                                        bg={getComponent("form", "fieldBg")}
                                        border="1px"
                                        borderColor={getComponent("form", "fieldBorder")}
                                        borderRadius="lg"
                                        boxShadow={getComponent("form", "fieldShadow")}
                                        _placeholder={{ color: getComponent("form", "placeholderColor") }}
                                        _focus={{
                                            borderColor: getComponent("form", "fieldBorderFocus"),
                                            boxShadow: getComponent("form", "fieldShadowFocus"),
                                            outline: "none"
                                        }}
                                        _hover={{
                                            borderColor: getColor("border.medium")
                                        }}
                                        size="lg"
                                        fontFamily={brandConfig.fonts.body}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel
                                        color={getComponent("form", "labelColor")}
                                        fontWeight="500"
                                        fontSize="sm"
                                        mb={2}
                                    >
                                        Company Address
                                    </FormLabel>
                                    <Textarea
                                        value={settings.companyAddress}
                                        onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
                                        placeholder="123 Business St, City, State 12345"
                                        rows={3}
                                        bg={getComponent("form", "fieldBg")}
                                        border="1px"
                                        borderColor={getComponent("form", "fieldBorder")}
                                        borderRadius="lg"
                                        boxShadow={getComponent("form", "fieldShadow")}
                                        _placeholder={{ color: getComponent("form", "placeholderColor") }}
                                        _focus={{
                                            borderColor: getComponent("form", "fieldBorderFocus"),
                                            boxShadow: getComponent("form", "fieldShadowFocus"),
                                            outline: "none"
                                        }}
                                        _hover={{
                                            borderColor: getColor("border.medium")
                                        }}
                                        fontFamily={brandConfig.fonts.body}
                                    />
                                </FormControl>

                                <HStack spacing={4}>
                                    <FormControl>
                                        <FormLabel
                                            color={getComponent("form", "labelColor")}
                                            fontWeight="500"
                                            fontSize="sm"
                                            mb={2}
                                        >
                                            Email
                                        </FormLabel>
                                        <Input
                                            type="email"
                                            value={settings.companyEmail}
                                            onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
                                            placeholder="billing@company.com"
                                            bg={getComponent("form", "fieldBg")}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            borderRadius="lg"
                                            boxShadow={getComponent("form", "fieldShadow")}
                                            _placeholder={{ color: getComponent("form", "placeholderColor") }}
                                            _focus={{
                                                borderColor: getComponent("form", "fieldBorderFocus"),
                                                boxShadow: getComponent("form", "fieldShadowFocus"),
                                                outline: "none"
                                            }}
                                            _hover={{
                                                borderColor: getColor("border.medium")
                                            }}
                                            size="lg"
                                            fontFamily={brandConfig.fonts.body}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel
                                            color={getComponent("form", "labelColor")}
                                            fontWeight="500"
                                            fontSize="sm"
                                            mb={2}
                                        >
                                            Phone
                                        </FormLabel>
                                        <Input
                                            type="tel"
                                            value={settings.companyPhone}
                                            onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
                                            placeholder="+1 (555) 123-4567"
                                            bg={getComponent("form", "fieldBg")}
                                            border="1px"
                                            borderColor={getComponent("form", "fieldBorder")}
                                            borderRadius="lg"
                                            boxShadow={getComponent("form", "fieldShadow")}
                                            _placeholder={{ color: getComponent("form", "placeholderColor") }}
                                            _focus={{
                                                borderColor: getComponent("form", "fieldBorderFocus"),
                                                boxShadow: getComponent("form", "fieldShadowFocus"),
                                                outline: "none"
                                            }}
                                            _hover={{
                                                borderColor: getColor("border.medium")
                                            }}
                                            size="lg"
                                            fontFamily={brandConfig.fonts.body}
                                        />
                                    </FormControl>
                                </HStack>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Stripe Configuration */}
                    <Card
                        bg={getColor("background.card")}
                        boxShadow={getComponent("card", "shadow")}
                        border="1px"
                        borderColor={getColor("border.light")}
                    >
                        <CardHeader>
                            <Heading size="md" color={getColor("text.primary")}>Stripe Configuration</Heading>
                        </CardHeader>
                        <CardBody>
                            <VStack spacing={4} align="stretch">
                                <FormControl>
                                    <FormLabel
                                        color={getComponent("form", "labelColor")}
                                        fontWeight="500"
                                        fontSize="sm"
                                        mb={2}
                                    >
                                        Stripe Publishable Key
                                    </FormLabel>
                                    <Input
                                        type="password"
                                        value={settings.stripePublicKey}
                                        onChange={(e) => setSettings({ ...settings, stripePublicKey: e.target.value })}
                                        placeholder="pk_live_..."
                                        bg={getComponent("form", "fieldBg")}
                                        border="1px"
                                        borderColor={getComponent("form", "fieldBorder")}
                                        borderRadius="lg"
                                        boxShadow={getComponent("form", "fieldShadow")}
                                        _placeholder={{ color: getComponent("form", "placeholderColor") }}
                                        _focus={{
                                            borderColor: getComponent("form", "fieldBorderFocus"),
                                            boxShadow: getComponent("form", "fieldShadowFocus"),
                                            outline: "none"
                                        }}
                                        _hover={{
                                            borderColor: getColor("border.medium")
                                        }}
                                        size="lg"
                                        fontFamily={brandConfig.fonts.body}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel
                                        color={getComponent("form", "labelColor")}
                                        fontWeight="500"
                                        fontSize="sm"
                                        mb={2}
                                    >
                                        Stripe Secret Key
                                    </FormLabel>
                                    <Input
                                        type="password"
                                        value={settings.stripeSecretKey}
                                        onChange={(e) => setSettings({ ...settings, stripeSecretKey: e.target.value })}
                                        placeholder="sk_live_..."
                                        bg={getComponent("form", "fieldBg")}
                                        border="1px"
                                        borderColor={getComponent("form", "fieldBorder")}
                                        borderRadius="lg"
                                        boxShadow={getComponent("form", "fieldShadow")}
                                        _placeholder={{ color: getComponent("form", "placeholderColor") }}
                                        _focus={{
                                            borderColor: getComponent("form", "fieldBorderFocus"),
                                            boxShadow: getComponent("form", "fieldShadowFocus"),
                                            outline: "none"
                                        }}
                                        _hover={{
                                            borderColor: getColor("border.medium")
                                        }}
                                        size="lg"
                                        fontFamily={brandConfig.fonts.body}
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel
                                        color={getComponent("form", "labelColor")}
                                        fontWeight="500"
                                        fontSize="sm"
                                        mb={2}
                                    >
                                        Webhook Secret
                                    </FormLabel>
                                    <Input
                                        type="password"
                                        value={settings.stripeWebhookSecret}
                                        onChange={(e) => setSettings({ ...settings, stripeWebhookSecret: e.target.value })}
                                        placeholder="whsec_..."
                                        bg={getComponent("form", "fieldBg")}
                                        border="1px"
                                        borderColor={getComponent("form", "fieldBorder")}
                                        borderRadius="lg"
                                        boxShadow={getComponent("form", "fieldShadow")}
                                        _placeholder={{ color: getComponent("form", "placeholderColor") }}
                                        _focus={{
                                            borderColor: getComponent("form", "fieldBorderFocus"),
                                            boxShadow: getComponent("form", "fieldShadowFocus"),
                                            outline: "none"
                                        }}
                                        _hover={{
                                            borderColor: getColor("border.medium")
                                        }}
                                        size="lg"
                                        fontFamily={brandConfig.fonts.body}
                                    />
                                </FormControl>
                            </VStack>
                        </CardBody>
                    </Card>

                    {/* Save Button */}
                    <Button
                        bg={getComponent("button", "primaryBg")}
                        color={getColor("text.inverse")}
                        _hover={{ bg: getComponent("button", "primaryHover") }}
                        _active={{ transform: "translateY(1px)" }}
                        size="lg"
                        borderRadius="lg"
                        fontWeight="600"
                        boxShadow="0 2px 4px rgba(0, 122, 255, 0.2)"
                        fontFamily={brandConfig.fonts.body}
                        onClick={handleSave}
                    >
                        Save Settings
                    </Button>
                </VStack>
            </Container>
            <FooterWithFourColumns />
        </Box>
    );
};

export default BillingSettings;