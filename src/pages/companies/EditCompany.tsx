import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
    Spinner,
    Center,
    useColorMode,
} from "@chakra-ui/react";
import { EditIcon, ArrowBackIcon } from "@chakra-ui/icons";
import { getColor, brandConfig } from "../../brandConfig";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import companiesModuleConfig from "./moduleConfig";
import { Client } from "../../generated/graphql";

const GET_COMPANY = gql`
    query GetCompany($id: ID!) {
        company(id: $id) {
            id
            name
            tradingName
            abn
            acn
            type
            status
            industry
            website
            email
            phone
            fax
            physicalAddress {
                street
                city
                state
                postcode
                country
            }
            postalAddress {
                street
                city
                state
                postcode
                country
            }
            primaryContact {
                name
                position
                email
                phone
                mobile
            }
            employees
            establishedDate
            financialYearEnd
            numberOfEmployees
            annualRevenue
            billingEmail
            taxNumber
            accountManager
            notes
            tags
        }
    }
`;

const UPDATE_COMPANY = gql`
    mutation UpdateCompany($id: ID!, $input: CompanyInput!) {
        updateCompany(id: $id, input: $input) {
            id
            name
            status
        }
    }
`;

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


const EditCompany: React.FC = () => {
    usePageTitle("Edit Company");

    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
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
    
    // Query to get company data
    const { data: companyData, loading: companyLoading, error: companyError } = useQuery(GET_COMPANY, {
        variables: { id },
        onCompleted: (data) => {
            if (data?.company) {
                const company = data.company;
                setName(company.name || "");
                setTradingName(company.tradingName || "");
                setAbn(company.abn || "");
                setAcn(company.acn || "");
                setType(company.type || "CORPORATION");
                setStatus(company.status || "ACTIVE");
                setIndustry(company.industry || "");
                setWebsite(company.website || "");
                setEmail(company.email || "");
                setPhone(company.phone || "");
                setFax(company.fax || "");
                
                if (company.physicalAddress) {
                    setPhysicalStreet(company.physicalAddress.street || "");
                    setPhysicalCity(company.physicalAddress.city || "");
                    setPhysicalState(company.physicalAddress.state || "");
                    setPhysicalPostcode(company.physicalAddress.postcode || "");
                    setPhysicalCountry(company.physicalAddress.country || "Australia");
                }
                
                if (company.postalAddress) {
                    setPostalSameAsPhysical(false);
                    setPostalStreet(company.postalAddress.street || "");
                    setPostalCity(company.postalAddress.city || "");
                    setPostalState(company.postalAddress.state || "");
                    setPostalPostcode(company.postalAddress.postcode || "");
                    setPostalCountry(company.postalAddress.country || "Australia");
                }
                
                if (company.primaryContact) {
                    setContactName(company.primaryContact.name || "");
                    setContactPosition(company.primaryContact.position || "");
                    setContactEmail(company.primaryContact.email || "");
                    setContactPhone(company.primaryContact.phone || "");
                    setContactMobile(company.primaryContact.mobile || "");
                }
                
                setSelectedEmployees(company.employees || []);
                setEstablishedDate(company.establishedDate || "");
                setFinancialYearEnd(company.financialYearEnd || "30 June");
                setNumberOfEmployees(company.numberOfEmployees?.toString() || "");
                setAnnualRevenue(company.annualRevenue?.toString() || "");
                setBillingEmail(company.billingEmail || "");
                setTaxNumber(company.taxNumber || "");
                setAccountManager(company.accountManager || "");
                setNotes(company.notes || "");
                setTags(company.tags || []);
            }
        }
    });
    
    const [updateCompany, { loading: updating }] = useMutation(UPDATE_COMPANY, {
        onCompleted: (data) => {
            toast({
                title: "Company updated successfully",
                description: `${data.updateCompany.name} has been updated`,
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            navigate(`/companies/${id}`);
        },
        onError: (error) => {
            toast({
                title: "Error updating company",
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

        // Employees
        if (selectedEmployees.length > 0) input.employees = selectedEmployees;

        // Financial & Additional
        if (establishedDate) input.establishedDate = establishedDate;
        if (financialYearEnd) input.financialYearEnd = financialYearEnd;
        if (numberOfEmployees) input.numberOfEmployees = parseInt(numberOfEmployees);
        if (annualRevenue) input.annualRevenue = parseFloat(annualRevenue);
        if (billingEmail) input.billingEmail = billingEmail;
        if (taxNumber) input.taxNumber = taxNumber;
        if (accountManager) input.accountManager = accountManager;
        if (tags.length > 0) input.tags = tags;

        await updateCompany({ variables: { id, input } });
    };

    // Add tag
    const addTag = () => {
        if (currentTag.trim() && !tags.includes(currentTag.trim())) {
            setTags([...tags, currentTag.trim()]);
            setCurrentTag("");
        }
    };

    // Show loading state while fetching company data
    if (companyLoading) {
        return (
            <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <ModuleBreadcrumb moduleConfig={companiesModuleConfig} />
                <Container maxW="container.xl" px={{ base: 4, md: 8 }} py={{ base: 6, md: 8 }} flex="1">
                    <Center minH="400px">
                        <VStack spacing={4}>
                            <Spinner size="xl" color={primaryColor} thickness="4px" />
                            <Text color={textPrimary}>Loading company details...</Text>
                        </VStack>
                    </Center>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    // Show error state if company not found
    if (companyError) {
        return (
            <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <ModuleBreadcrumb moduleConfig={companiesModuleConfig} />
                <Container maxW="container.xl" px={{ base: 4, md: 8 }} py={{ base: 6, md: 8 }} flex="1">
                    <Center minH="400px">
                        <VStack spacing={4}>
                            <Text color="red.400" fontSize="lg">Error loading company details</Text>
                            <Text color={textSecondary}>{companyError.message}</Text>
                            <Button 
                                onClick={() => navigate("/companies")}
                                leftIcon={<ArrowBackIcon />}
                                variant="outline"
                                borderColor={cardBorder}
                                color={textPrimary}
                                _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
                            >
                                Back to Companies
                            </Button>
                        </VStack>
                    </Center>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    return (
        <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={companiesModuleConfig} />

            <Container maxW="container.xl" px={{ base: 4, md: 8 }} py={{ base: 6, md: 8 }} flex="1">
                <VStack spacing={{ base: 4, md: 6 }} align="stretch">
                    <HStack justify="space-between" align="center">
                        <Heading color={textPrimary} fontFamily={brandConfig.fonts.heading} size={{ base: "md", md: "lg" }}>
                            Edit Company
                        </Heading>
                        <Button
                            onClick={() => navigate(`/companies/${id}`)}
                            leftIcon={<ArrowBackIcon />}
                            variant="outline"
                            borderColor={cardBorder}
                            color={textPrimary}
                            _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
                            size={buttonSize}
                        >
                            Back to Details
                        </Button>
                    </HStack>
                    
                    <Card
                        bg={cardGradientBg}
                        backdropFilter="blur(10px)"
                        border="1px solid"
                        borderColor={cardBorder}
                        boxShadow="0 4px 16px 0 rgba(0, 0, 0, 0.2)"
                    >
                        <CardBody>
                            <form onSubmit={handleSubmit}>
                                <Tabs colorScheme="blue" variant="soft-rounded">
                                    <TabList mb={6}>
                                        <Tab color={textSecondary} _selected={{ color: "white", bg: primaryColor }}>
                                            Basic Info
                                        </Tab>
                                        <Tab color={textSecondary} _selected={{ color: "white", bg: primaryColor }}>
                                            Contact
                                        </Tab>
                                        <Tab color={textSecondary} _selected={{ color: "white", bg: primaryColor }}>
                                            Employees
                                        </Tab>
                                        <Tab color={textSecondary} _selected={{ color: "white", bg: primaryColor }}>
                                            Additional
                                        </Tab>
                                    </TabList>

                                    <TabPanels>
                                        {/* Basic Information Tab */}
                                        <TabPanel px={0}>
                                            <VStack spacing={6} align="stretch">
                                                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                                                    <FormControl isRequired>
                                                        <FormLabel color={textPrimary}>Company Name</FormLabel>
                                                        <Input
                                                            value={name}
                                                            onChange={(e) => setName(e.target.value)}
                                                            placeholder="Enter company name"
                                                            bg="rgba(0, 0, 0, 0.2)"
                                                            borderColor={cardBorder}
                                                            color={textPrimary}
                                                            _placeholder={{ color: textMuted }}
                                                            _hover={{ borderColor: primaryColor }}
                                                            _focus={{ borderColor: primaryColor, boxShadow: `0 0 0 1px ${primaryColor}` }}
                                                        />
                                                    </FormControl>

                                                    <FormControl>
                                                        <FormLabel color={textPrimary}>Trading Name</FormLabel>
                                                        <Input
                                                            value={tradingName}
                                                            onChange={(e) => setTradingName(e.target.value)}
                                                            placeholder="DBA or trading as"
                                                            bg="rgba(0, 0, 0, 0.2)"
                                                            borderColor={cardBorder}
                                                            color={textPrimary}
                                                            _placeholder={{ color: textMuted }}
                                                        />
                                                    </FormControl>

                                                    <FormControl>
                                                        <FormLabel color={textPrimary}>Industry</FormLabel>
                                                        <Input
                                                            value={industry}
                                                            onChange={(e) => setIndustry(e.target.value)}
                                                            placeholder="e.g., Technology, Healthcare"
                                                            bg="rgba(0, 0, 0, 0.2)"
                                                            borderColor={cardBorder}
                                                            color={textPrimary}
                                                            _placeholder={{ color: textMuted }}
                                                        />
                                                    </FormControl>

                                                    <FormControl>
                                                        <FormLabel color={textPrimary}>ABN</FormLabel>
                                                        <Input
                                                            value={abn}
                                                            onChange={(e) => setAbn(e.target.value)}
                                                            placeholder="XX XXX XXX XXX"
                                                            bg="rgba(0, 0, 0, 0.2)"
                                                            borderColor={cardBorder}
                                                            color={textPrimary}
                                                            _placeholder={{ color: textMuted }}
                                                        />
                                                    </FormControl>

                                                    <FormControl>
                                                        <FormLabel color={textPrimary}>ACN</FormLabel>
                                                        <Input
                                                            value={acn}
                                                            onChange={(e) => setAcn(e.target.value)}
                                                            placeholder="XXX XXX XXX"
                                                            bg="rgba(0, 0, 0, 0.2)"
                                                            borderColor={cardBorder}
                                                            color={textPrimary}
                                                            _placeholder={{ color: textMuted }}
                                                        />
                                                    </FormControl>

                                                    <FormControl>
                                                        <FormLabel color={textPrimary}>Company Type</FormLabel>
                                                        <Select
                                                            value={type}
                                                            onChange={(e) => setType(e.target.value)}
                                                            bg="rgba(0, 0, 0, 0.2)"
                                                            borderColor={cardBorder}
                                                            color={textPrimary}
                                                        >
                                                            <option value="CORPORATION">Corporation</option>
                                                            <option value="LLC">LLC</option>
                                                            <option value="PARTNERSHIP">Partnership</option>
                                                            <option value="SOLE_PROPRIETOR">Sole Proprietor</option>
                                                            <option value="NON_PROFIT">Non-Profit</option>
                                                            <option value="OTHER">Other</option>
                                                        </Select>
                                                    </FormControl>

                                                    <FormControl>
                                                        <FormLabel color={textPrimary}>Status</FormLabel>
                                                        <Select
                                                            value={status}
                                                            onChange={(e) => setStatus(e.target.value)}
                                                            bg="rgba(0, 0, 0, 0.2)"
                                                            borderColor={cardBorder}
                                                            color={textPrimary}
                                                        >
                                                            <option value="ACTIVE">Active</option>
                                                            <option value="INACTIVE">Inactive</option>
                                                            <option value="PENDING">Pending</option>
                                                            <option value="SUSPENDED">Suspended</option>
                                                        </Select>
                                                    </FormControl>

                                                    <FormControl>
                                                        <FormLabel color={textPrimary}>Website</FormLabel>
                                                        <Input
                                                            type="url"
                                                            value={website}
                                                            onChange={(e) => setWebsite(e.target.value)}
                                                            placeholder="https://example.com"
                                                            bg="rgba(0, 0, 0, 0.2)"
                                                            borderColor={cardBorder}
                                                            color={textPrimary}
                                                            _placeholder={{ color: textMuted }}
                                                        />
                                                    </FormControl>
                                                </Grid>
                                            </VStack>
                                        </TabPanel>

                                        {/* Contact Information Tab */}
                                        <TabPanel px={0}>
                                            <VStack spacing={6} align="stretch">
                                                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                                                    <GridItem colSpan={{ base: 1, md: 2 }}>
                                                        <Text color={textPrimary} fontWeight="bold" mb={4}>
                                                            Contact Details
                                                        </Text>
                                                    </GridItem>

                                                    <FormControl>
                                                        <FormLabel color={textPrimary}>Main Email</FormLabel>
                                                        <Input
                                                            type="email"
                                                            value={email}
                                                            onChange={(e) => setEmail(e.target.value)}
                                                            placeholder="contact@example.com"
                                                            bg="rgba(0, 0, 0, 0.2)"
                                                            borderColor={cardBorder}
                                                            color={textPrimary}
                                                            _placeholder={{ color: textMuted }}
                                                        />
                                                    </FormControl>

                                                    <FormControl>
                                                        <FormLabel color={textPrimary}>Phone</FormLabel>
                                                        <Input
                                                            value={phone}
                                                            onChange={(e) => setPhone(e.target.value)}
                                                            placeholder="(07) 0000 0000"
                                                            bg="rgba(0, 0, 0, 0.2)"
                                                            borderColor={cardBorder}
                                                            color={textPrimary}
                                                            _placeholder={{ color: textMuted }}
                                                        />
                                                    </FormControl>

                                                    <GridItem colSpan={{ base: 1, md: 2 }}>
                                                        <Divider borderColor={cardBorder} my={2} />
                                                        <Text color={textPrimary} fontWeight="bold" mb={4} mt={4}>
                                                            Physical Address
                                                        </Text>
                                                    </GridItem>

                                                    <GridItem colSpan={{ base: 1, md: 2 }}>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Street Address</FormLabel>
                                                            <Input
                                                                value={physicalStreet}
                                                                onChange={(e) => setPhysicalStreet(e.target.value)}
                                                                placeholder="123 Main Street"
                                                                bg="rgba(0, 0, 0, 0.2)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                _placeholder={{ color: textMuted }}
                                                            />
                                                        </FormControl>
                                                    </GridItem>

                                                    <FormControl>
                                                        <FormLabel color={textPrimary}>City</FormLabel>
                                                        <Input
                                                            value={physicalCity}
                                                            onChange={(e) => setPhysicalCity(e.target.value)}
                                                            placeholder="Brisbane"
                                                            bg="rgba(0, 0, 0, 0.2)"
                                                            borderColor={cardBorder}
                                                            color={textPrimary}
                                                            _placeholder={{ color: textMuted }}
                                                        />
                                                    </FormControl>

                                                    <FormControl>
                                                        <FormLabel color={textPrimary}>State</FormLabel>
                                                        <Select
                                                            value={physicalState}
                                                            onChange={(e) => setPhysicalState(e.target.value)}
                                                            placeholder="Select state"
                                                            bg="rgba(0, 0, 0, 0.2)"
                                                            borderColor={cardBorder}
                                                            color={textPrimary}
                                                        >
                                                            <option value="QLD">Queensland</option>
                                                            <option value="NSW">New South Wales</option>
                                                            <option value="VIC">Victoria</option>
                                                            <option value="SA">South Australia</option>
                                                            <option value="WA">Western Australia</option>
                                                            <option value="TAS">Tasmania</option>
                                                            <option value="NT">Northern Territory</option>
                                                            <option value="ACT">ACT</option>
                                                        </Select>
                                                    </FormControl>

                                                    <FormControl>
                                                        <FormLabel color={textPrimary}>Postcode</FormLabel>
                                                        <Input
                                                            value={physicalPostcode}
                                                            onChange={(e) => setPhysicalPostcode(e.target.value)}
                                                            placeholder="4000"
                                                            bg="rgba(0, 0, 0, 0.2)"
                                                            borderColor={cardBorder}
                                                            color={textPrimary}
                                                            _placeholder={{ color: textMuted }}
                                                        />
                                                    </FormControl>
                                                </Grid>
                                            </VStack>
                                        </TabPanel>

                                        {/* Employees Tab */}
                                        <TabPanel px={0}>
                                            <VStack spacing={4} align="stretch">
                                                <Text color={textPrimary} fontWeight="bold">
                                                    Select Employees
                                                </Text>
                                                {clientsLoading ? (
                                                    <Text color={textMuted}>Loading employees...</Text>
                                                ) : (
                                                    <CheckboxGroup
                                                        colorScheme="blue"
                                                        value={selectedEmployees}
                                                        onChange={(values) => setSelectedEmployees(values as string[])}
                                                    >
                                                        <Stack spacing={3} maxH="300px" overflowY="auto">
                                                            {clientsData?.clients?.map((client: Client) => (
                                                                <Checkbox
                                                                    key={client.id}
                                                                    value={client.id}
                                                                    color={textPrimary}
                                                                >
                                                                    {client.fName} {client.lName} - {client.email}
                                                                </Checkbox>
                                                            ))}
                                                        </Stack>
                                                    </CheckboxGroup>
                                                )}
                                                <Text color={textMuted} fontSize="sm">
                                                    {selectedEmployees.length} employee(s) selected
                                                </Text>
                                            </VStack>
                                        </TabPanel>

                                        {/* Additional Information Tab */}
                                        <TabPanel px={0}>
                                            <VStack spacing={6} align="stretch">
                                                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                                                    <FormControl>
                                                        <FormLabel color={textPrimary}>Notes</FormLabel>
                                                        <Textarea
                                                            value={notes}
                                                            onChange={(e) => setNotes(e.target.value)}
                                                            placeholder="Additional notes..."
                                                            rows={4}
                                                            bg="rgba(0, 0, 0, 0.2)"
                                                            borderColor={cardBorder}
                                                            color={textPrimary}
                                                            _placeholder={{ color: textMuted }}
                                                        />
                                                    </FormControl>

                                                    <FormControl>
                                                        <FormLabel color={textPrimary}>Tags</FormLabel>
                                                        <HStack mb={2}>
                                                            <Input
                                                                value={currentTag}
                                                                onChange={(e) => setCurrentTag(e.target.value)}
                                                                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                                                                placeholder="Add tag..."
                                                                bg="rgba(0, 0, 0, 0.2)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                _placeholder={{ color: textMuted }}
                                                            />
                                                            <Button
                                                                onClick={addTag}
                                                                bg={primaryColor}
                                                                color="white"
                                                                _hover={{ bg: primaryHover }}
                                                                size="md"
                                                            >
                                                                Add
                                                            </Button>
                                                        </HStack>
                                                        <Wrap>
                                                            {tags.map((tag, index) => (
                                                                <Tag
                                                                    key={index}
                                                                    size="md"
                                                                    borderRadius="full"
                                                                    variant="solid"
                                                                    bg={primaryColor}
                                                                    color="white"
                                                                >
                                                                    <TagLabel>{tag}</TagLabel>
                                                                    <TagCloseButton
                                                                        onClick={() => setTags(tags.filter((_, i) => i !== index))}
                                                                    />
                                                                </Tag>
                                                            ))}
                                                        </Wrap>
                                                    </FormControl>
                                                </Grid>
                                            </VStack>
                                        </TabPanel>
                                    </TabPanels>
                                </Tabs>

                                <HStack justify="flex-end" mt={8} spacing={4}>
                                    <Button
                                        onClick={() => navigate(`/companies/${id}`)}
                                        variant="outline"
                                        borderColor={cardBorder}
                                        color={textPrimary}
                                        _hover={{ bg: "rgba(255, 255, 255, 0.05)" }}
                                        size={buttonSize}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        bg={primaryColor}
                                        color="white"
                                        _hover={{ bg: primaryHover }}
                                        isLoading={updating}
                                        loadingText="Updating..."
                                        leftIcon={<EditIcon />}
                                        size={buttonSize}
                                    >
                                        Update Company
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

export default EditCompany;