import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import {
    Box,
    Container,
    Heading,
    Card,
    CardBody,
    VStack,
    HStack,
    FormControl,
    FormLabel,
    FormHelperText,
    Input,
    Textarea,
    Select,
    Button,
    useToast,
    Divider,
    Text,
    Grid,
    GridItem,
    NumberInput,
    NumberInputField,
    Tag,
    TagLabel,
    TagCloseButton,
    Wrap,
    useBreakpointValue,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Checkbox,
    CheckboxGroup,
    Stack,
    useColorMode,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { getColor, brandConfig } from "../../brandConfig";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import companiesModuleConfig from "./moduleConfig";
import { Client } from "../../generated/graphql";

const GET_CLIENTS = gql`
    query GetClients {
        clients {
            id
            fName
            lName
            email
        }
    }
`;

const CREATE_COMPANY = gql`
    mutation CreateCompany($input: CompanyInput!) {
        createCompany(input: $input) {
            id
            name
            status
        }
    }
`;


const NewCompany: React.FC = () => {
    usePageTitle("New Company");

    const navigate = useNavigate();
    const toast = useToast();
    const { colorMode } = useColorMode();
    
    // Brand styling
    const bgMain = getColor("background.main", colorMode);
    const cardGradientBg = getColor("background.cardGradient", colorMode);
    const cardBorder = getColor("border.darkCard", colorMode);
    const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
    const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
    const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);
    const primaryColor = getColor("primary", colorMode);
    const primaryHover = getColor("primaryHover", colorMode);

    // Responsive values
    const buttonSize = useBreakpointValue({ base: "sm", md: "md" });

    // Form state - Basic Information
    const [name, setName] = useState("");
    const [tradingName, setTradingName] = useState("");
    const [abn, setAbn] = useState("");
    const [acn, setAcn] = useState("");
    const [type, setType] = useState("CORPORATION");
    const [status, setStatus] = useState("ACTIVE");
    const [industry, setIndustry] = useState("");
    const [website, setWebsite] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [fax, setFax] = useState("");

    // Physical Address
    const [physicalStreet, setPhysicalStreet] = useState("");
    const [physicalCity, setPhysicalCity] = useState("");
    const [physicalState, setPhysicalState] = useState("");
    const [physicalPostcode, setPhysicalPostcode] = useState("");
    const [physicalCountry, setPhysicalCountry] = useState("Australia");

    // Postal Address
    const [postalSameAsPhysical, setPostalSameAsPhysical] = useState(true);
    const [postalStreet, setPostalStreet] = useState("");
    const [postalCity, setPostalCity] = useState("");
    const [postalState, setPostalState] = useState("");
    const [postalPostcode, setPostalPostcode] = useState("");
    const [postalCountry, setPostalCountry] = useState("Australia");

    // Primary Contact
    const [contactName, setContactName] = useState("");
    const [contactPosition, setContactPosition] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [contactPhone, setContactPhone] = useState("");
    const [contactMobile, setContactMobile] = useState("");

    // Employees
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

    // Financial & Additional
    const [establishedDate, setEstablishedDate] = useState("");
    const [financialYearEnd, setFinancialYearEnd] = useState("30 June");
    const [numberOfEmployees, setNumberOfEmployees] = useState("");
    const [annualRevenue, setAnnualRevenue] = useState("");
    const [billingEmail, setBillingEmail] = useState("");
    const [taxNumber, setTaxNumber] = useState("");
    const [accountManager, setAccountManager] = useState("");
    const [notes, setNotes] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState("");

    // Queries and mutations
    const { data: clientsData, loading: clientsLoading } = useQuery(GET_CLIENTS);
    const [createCompany, { loading: creating }] = useMutation(CREATE_COMPANY, {
        onCompleted: (data) => {
            toast({
                title: "Company created successfully",
                description: `${data.createCompany.name} has been added`,
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            navigate("/companies");
        },
        onError: (error) => {
            toast({
                title: "Error creating company",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        },
    });

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!name) {
            toast({
                title: "Missing required fields",
                description: "Company name is required",
                status: "error",
                duration: 3000,
            });
            return;
        }

        const input: any = {
            name,
            type,
            status,
        };

        // Add optional fields
        if (tradingName) input.tradingName = tradingName;
        if (abn) input.abn = abn;
        if (acn) input.acn = acn;
        if (industry) input.industry = industry;
        if (website) input.website = website;
        if (email) input.email = email;
        if (phone) input.phone = phone;
        if (fax) input.fax = fax;
        if (notes) input.notes = notes;

        // Physical Address
        if (physicalStreet || physicalCity || physicalState || physicalPostcode) {
            input.physicalAddress = {
                street: physicalStreet,
                city: physicalCity,
                state: physicalState,
                postcode: physicalPostcode,
                country: physicalCountry,
            };
        }

        // Postal Address
        if (!postalSameAsPhysical && (postalStreet || postalCity || postalState || postalPostcode)) {
            input.postalAddress = {
                street: postalStreet,
                city: postalCity,
                state: postalState,
                postcode: postalPostcode,
                country: postalCountry,
            };
        } else if (postalSameAsPhysical && input.physicalAddress) {
            input.postalAddress = input.physicalAddress;
        }

        // Primary Contact
        if (contactName || contactEmail || contactPhone) {
            input.primaryContact = {
                name: contactName,
                position: contactPosition,
                email: contactEmail,
                phone: contactPhone,
                mobile: contactMobile,
            };
        }

        // Additional fields
        if (selectedEmployees.length > 0) input.employees = selectedEmployees;
        if (establishedDate) input.establishedDate = new Date(establishedDate);
        if (financialYearEnd) input.financialYearEnd = financialYearEnd;
        if (numberOfEmployees) input.numberOfEmployees = parseInt(numberOfEmployees);
        if (annualRevenue) input.annualRevenue = parseFloat(annualRevenue);
        if (billingEmail) input.billingEmail = billingEmail;
        if (taxNumber) input.taxNumber = taxNumber;
        if (accountManager) input.accountManager = accountManager;
        if (tags.length > 0) input.tags = tags;

        await createCompany({ variables: { input } });
    };

    // Add tag
    const addTag = () => {
        if (currentTag.trim() && !tags.includes(currentTag.trim())) {
            setTags([...tags, currentTag.trim()]);
            setCurrentTag("");
        }
    };

    return (
        <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={companiesModuleConfig} />
            
            <Container maxW="container.xl" px={{ base: 4, md: 8 }} py={{ base: 6, md: 8 }} flex="1">
                <VStack spacing={{ base: 4, md: 6 }} align="stretch">
                    <Heading color={textPrimary} fontFamily={brandConfig.fonts.heading} size={{ base: "md", md: "lg" }}>
                        New Company
                    </Heading>
                    
                    <Card
                        bg={cardGradientBg}
                        backdropFilter="blur(10px)"
                        boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                        border="1px"
                        borderColor={cardBorder}
                        borderRadius="lg"
                    >
                        <CardBody>
                            <form onSubmit={handleSubmit}>
                                <Tabs isFitted variant="enclosed" colorScheme="purple">
                                    <TabList mb={6}>
                                        <Tab color={textPrimary} _selected={{ color: primaryColor, borderColor: primaryColor }}>
                                            Basic Info
                                        </Tab>
                                        <Tab color={textPrimary} _selected={{ color: primaryColor, borderColor: primaryColor }}>
                                            Contact
                                        </Tab>
                                        <Tab color={textPrimary} _selected={{ color: primaryColor, borderColor: primaryColor }}>
                                            Employees
                                        </Tab>
                                        <Tab color={textPrimary} _selected={{ color: primaryColor, borderColor: primaryColor }}>
                                            Additional
                                        </Tab>
                                    </TabList>

                                    <TabPanels>
                                        {/* Basic Information Tab */}
                                        <TabPanel p={0}>
                                            <VStack spacing={6} align="stretch">
                                                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                                                    <GridItem colSpan={{ base: 1, md: 2 }}>
                                                        <FormControl isRequired>
                                                            <FormLabel color={textPrimary}>Company Name</FormLabel>
                                                            <Input
                                                                placeholder="Enter company name"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                _placeholder={{ color: textMuted }}
                                                                value={name}
                                                                onChange={(e) => setName(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Trading Name</FormLabel>
                                                            <Input
                                                                placeholder="DBA or trading as"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                _placeholder={{ color: textMuted }}
                                                                value={tradingName}
                                                                onChange={(e) => setTradingName(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Industry</FormLabel>
                                                            <Input
                                                                placeholder="e.g., Technology, Healthcare"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                _placeholder={{ color: textMuted }}
                                                                value={industry}
                                                                onChange={(e) => setIndustry(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>ABN</FormLabel>
                                                            <Input
                                                                placeholder="XX XXX XXX XXX"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                _placeholder={{ color: textMuted }}
                                                                value={abn}
                                                                onChange={(e) => setAbn(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>ACN</FormLabel>
                                                            <Input
                                                                placeholder="XXX XXX XXX"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                _placeholder={{ color: textMuted }}
                                                                value={acn}
                                                                onChange={(e) => setAcn(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Company Type</FormLabel>
                                                            <Select
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                value={type}
                                                                onChange={(e) => setType(e.target.value)}
                                                            >
                                                                <option value="CORPORATION">Corporation</option>
                                                                <option value="PARTNERSHIP">Partnership</option>
                                                                <option value="SOLE_TRADER">Sole Trader</option>
                                                                <option value="TRUST">Trust</option>
                                                                <option value="NON_PROFIT">Non-Profit</option>
                                                                <option value="GOVERNMENT">Government</option>
                                                                <option value="OTHER">Other</option>
                                                            </Select>
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Status</FormLabel>
                                                            <Select
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                value={status}
                                                                onChange={(e) => setStatus(e.target.value)}
                                                            >
                                                                <option value="ACTIVE">Active</option>
                                                                <option value="INACTIVE">Inactive</option>
                                                                <option value="PENDING">Pending</option>
                                                                <option value="SUSPENDED">Suspended</option>
                                                            </Select>
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Website</FormLabel>
                                                            <Input
                                                                type="url"
                                                                placeholder="https://example.com"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                _placeholder={{ color: textMuted }}
                                                                value={website}
                                                                onChange={(e) => setWebsite(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Main Email</FormLabel>
                                                            <Input
                                                                type="email"
                                                                placeholder="contact@example.com"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                _placeholder={{ color: textMuted }}
                                                                value={email}
                                                                onChange={(e) => setEmail(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Phone</FormLabel>
                                                            <Input
                                                                placeholder="(07) 0000 0000"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                _placeholder={{ color: textMuted }}
                                                                value={phone}
                                                                onChange={(e) => setPhone(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>
                                                </Grid>

                                                <Divider borderColor={cardBorder} />

                                                <Text color={textPrimary} fontSize="lg" fontWeight="bold">
                                                    Physical Address
                                                </Text>

                                                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                                                    <GridItem colSpan={{ base: 1, md: 2 }}>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Street Address</FormLabel>
                                                            <Input
                                                                placeholder="123 Main Street"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                _placeholder={{ color: textMuted }}
                                                                value={physicalStreet}
                                                                onChange={(e) => setPhysicalStreet(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>City</FormLabel>
                                                            <Input
                                                                placeholder="Brisbane"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                _placeholder={{ color: textMuted }}
                                                                value={physicalCity}
                                                                onChange={(e) => setPhysicalCity(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>State</FormLabel>
                                                            <Select
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                value={physicalState}
                                                                onChange={(e) => setPhysicalState(e.target.value)}
                                                                placeholder="Select state"
                                                            >
                                                                <option value="QLD">Queensland</option>
                                                                <option value="NSW">New South Wales</option>
                                                                <option value="VIC">Victoria</option>
                                                                <option value="WA">Western Australia</option>
                                                                <option value="SA">South Australia</option>
                                                                <option value="TAS">Tasmania</option>
                                                                <option value="ACT">Australian Capital Territory</option>
                                                                <option value="NT">Northern Territory</option>
                                                            </Select>
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Postcode</FormLabel>
                                                            <Input
                                                                placeholder="4000"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                _placeholder={{ color: textMuted }}
                                                                value={physicalPostcode}
                                                                onChange={(e) => setPhysicalPostcode(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>
                                                </Grid>

                                                <Checkbox
                                                    isChecked={postalSameAsPhysical}
                                                    onChange={(e) => setPostalSameAsPhysical(e.target.checked)}
                                                    color={textPrimary}
                                                >
                                                    Postal address same as physical address
                                                </Checkbox>
                                            </VStack>
                                        </TabPanel>

                                        {/* Contact Tab */}
                                        <TabPanel p={0}>
                                            <VStack spacing={6} align="stretch">
                                                <Text color={textPrimary} fontSize="lg" fontWeight="bold">
                                                    Primary Contact
                                                </Text>

                                                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Contact Name</FormLabel>
                                                            <Input
                                                                placeholder="John Smith"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                _placeholder={{ color: textMuted }}
                                                                value={contactName}
                                                                onChange={(e) => setContactName(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Position</FormLabel>
                                                            <Input
                                                                placeholder="e.g., Managing Director"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                _placeholder={{ color: textMuted }}
                                                                value={contactPosition}
                                                                onChange={(e) => setContactPosition(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Email</FormLabel>
                                                            <Input
                                                                type="email"
                                                                placeholder="john@example.com"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                _placeholder={{ color: textMuted }}
                                                                value={contactEmail}
                                                                onChange={(e) => setContactEmail(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Phone</FormLabel>
                                                            <Input
                                                                placeholder="(07) 0000 0000"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                _placeholder={{ color: textMuted }}
                                                                value={contactPhone}
                                                                onChange={(e) => setContactPhone(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Mobile</FormLabel>
                                                            <Input
                                                                placeholder="0400 000 000"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                _placeholder={{ color: textMuted }}
                                                                value={contactMobile}
                                                                onChange={(e) => setContactMobile(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>
                                                </Grid>
                                            </VStack>
                                        </TabPanel>

                                        {/* Employees Tab */}
                                        <TabPanel p={0}>
                                            <VStack spacing={6} align="stretch">
                                                <Text color={textPrimary} fontSize="lg" fontWeight="bold">
                                                    Assign Employees
                                                </Text>
                                                <Text color={textSecondary} fontSize="sm">
                                                    Select clients who are employees of this company
                                                </Text>

                                                <FormControl>
                                                    <FormLabel color={textPrimary}>Employees</FormLabel>
                                                    <CheckboxGroup value={selectedEmployees} onChange={(values) => setSelectedEmployees(values as string[])}>
                                                        <Stack spacing={2} maxH="300px" overflowY="auto" p={4} bg="rgba(255, 255, 255, 0.02)" borderRadius="md">
                                                            {clientsData?.clients?.map((client: Client) => (
                                                                <Checkbox key={client.id} value={client.id} color={textPrimary}>
                                                                    {client.fName} {client.lName} ({client.email})
                                                                </Checkbox>
                                                            ))}
                                                        </Stack>
                                                    </CheckboxGroup>
                                                    <FormHelperText color={textMuted}>
                                                        {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''} selected
                                                    </FormHelperText>
                                                </FormControl>
                                            </VStack>
                                        </TabPanel>

                                        {/* Additional Tab */}
                                        <TabPanel p={0}>
                                            <VStack spacing={6} align="stretch">
                                                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Established Date</FormLabel>
                                                            <Input
                                                                type="date"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                value={establishedDate}
                                                                onChange={(e) => setEstablishedDate(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Financial Year End</FormLabel>
                                                            <Select
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                value={financialYearEnd}
                                                                onChange={(e) => setFinancialYearEnd(e.target.value)}
                                                            >
                                                                <option value="30 June">30 June</option>
                                                                <option value="31 December">31 December</option>
                                                                <option value="31 March">31 March</option>
                                                                <option value="Other">Other</option>
                                                            </Select>
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Number of Employees</FormLabel>
                                                            <NumberInput min={0}>
                                                                <NumberInputField
                                                                    bg="rgba(255, 255, 255, 0.05)"
                                                                    borderColor={cardBorder}
                                                                    color={textPrimary}
                                                                    value={numberOfEmployees}
                                                                    onChange={(e) => setNumberOfEmployees(e.target.value)}
                                                                />
                                                            </NumberInput>
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Tax Number (GST/VAT)</FormLabel>
                                                            <Input
                                                                placeholder="Tax registration number"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                _placeholder={{ color: textMuted }}
                                                                value={taxNumber}
                                                                onChange={(e) => setTaxNumber(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>
                                                </Grid>

                                                <FormControl>
                                                    <FormLabel color={textPrimary}>Tags</FormLabel>
                                                    <HStack>
                                                        <Input
                                                            placeholder="Add a tag"
                                                            bg="rgba(255, 255, 255, 0.05)"
                                                            borderColor={cardBorder}
                                                            color={textPrimary}
                                                            _placeholder={{ color: textMuted }}
                                                            value={currentTag}
                                                            onChange={(e) => setCurrentTag(e.target.value)}
                                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                                        />
                                                        <Button onClick={addTag} bg={primaryColor} color="white" _hover={{ bg: primaryHover }}>
                                                            Add
                                                        </Button>
                                                    </HStack>
                                                    <Wrap mt={2}>
                                                        {tags.map((tag, index) => (
                                                            <Tag key={index} size="md" borderRadius="full" variant="solid" colorScheme="purple">
                                                                <TagLabel>{tag}</TagLabel>
                                                                <TagCloseButton onClick={() => setTags(tags.filter((_, i) => i !== index))} />
                                                            </Tag>
                                                        ))}
                                                    </Wrap>
                                                </FormControl>

                                                <FormControl>
                                                    <FormLabel color={textPrimary}>Notes</FormLabel>
                                                    <Textarea
                                                        placeholder="Additional notes about the company..."
                                                        bg="rgba(255, 255, 255, 0.05)"
                                                        borderColor={cardBorder}
                                                        color={textPrimary}
                                                        _placeholder={{ color: textMuted }}
                                                        value={notes}
                                                        onChange={(e) => setNotes(e.target.value)}
                                                        rows={4}
                                                    />
                                                </FormControl>
                                            </VStack>
                                        </TabPanel>
                                    </TabPanels>
                                </Tabs>

                                <Divider my={6} borderColor={cardBorder} />

                                {/* Submit Buttons */}
                                <HStack spacing={4} justify="flex-end">
                                    <Button
                                        variant="outline"
                                        borderColor={cardBorder}
                                        color={textPrimary}
                                        onClick={() => navigate("/companies")}
                                        size={buttonSize}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        bg={primaryColor}
                                        color="white"
                                        _hover={{ bg: primaryHover }}
                                        isLoading={creating}
                                        loadingText="Creating..."
                                        leftIcon={<AddIcon />}
                                        size={buttonSize}
                                    >
                                        Create Company
                                    </Button>
                                </HStack>
                            </form>
                        </CardBody>
                    </Card>
                </VStack>
            </Container>

            <FooterWithFourColumns />
        </Box>
    );
};

export default NewCompany;