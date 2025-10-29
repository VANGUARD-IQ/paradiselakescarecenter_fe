import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
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
    Text,
    Button,
    Badge,
    Divider,
    Grid,
    GridItem,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Stat,
    StatLabel,
    StatNumber,
    useToast,
    Skeleton,
    SkeletonText,
    IconButton,
    useBreakpointValue,
    Flex,
    Tag,
    Wrap,
    WrapItem,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Link,
    Avatar,
    AvatarGroup,
    useColorMode,
} from "@chakra-ui/react";
import {
    EditIcon,
    DeleteIcon,
    ArrowBackIcon,
    EmailIcon,
    PhoneIcon,
    CalendarIcon,
    ExternalLinkIcon,
    AddIcon,
    ViewIcon,
    AtSignIcon,
    LockIcon,
} from "@chakra-ui/icons";
import { getColor, brandConfig } from "../../brandConfig";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import companiesModuleConfig from "./moduleConfig";
import { Client, Company } from "../../generated/graphql";

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
            employeeDetails {
                id
                fName
                lName
                email
                phoneNumber
            }
            employeeCount
            assetCount
            passwordCount
            numberOfEmployees
            annualRevenue
            establishedDate
            financialYearEnd
            billingEmail
            taxNumber
            notes
            tags
            isActive
            createdAt
            updatedAt
        }
    }
`;

const DELETE_COMPANY = gql`
    mutation DeleteCompany($id: ID!) {
        deleteCompany(id: $id)
    }
`;

const REMOVE_EMPLOYEE = gql`
    mutation RemoveEmployeeFromCompany($companyId: ID!, $clientId: ID!) {
        removeEmployeeFromCompany(companyId: $companyId, clientId: $clientId) {
            id
        }
    }
`;





const CompanyDetails: React.FC = () => {
    usePageTitle("Company Details");

    const { id } = useParams<{ id: string }>();
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
    const successGreen = getColor("successGreen", colorMode);
    const errorRed = getColor("status.error", colorMode);

    // Responsive values
    const isMobile = useBreakpointValue({ base: true, md: false });
    const buttonSize = useBreakpointValue({ base: "sm", md: "md" });

    // Queries
    const { data, loading, error, refetch } = useQuery(GET_COMPANY, {
        variables: { id },
        skip: !id,
    });

    const [deleteCompany] = useMutation(DELETE_COMPANY, {
        onCompleted: () => {
            toast({
                title: "Company deleted",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate("/companies");
        },
        onError: (error) => {
            toast({
                title: "Error deleting company",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        },
    });

    const [removeEmployee] = useMutation(REMOVE_EMPLOYEE, {
        onCompleted: () => {
            toast({
                title: "Employee removed",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            refetch();
        },
        onError: (error) => {
            toast({
                title: "Error removing employee",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        },
    });

    const company = data?.company as Company;

    // Format currency
    const formatCurrency = (amount?: number) => {
        if (!amount) return "-";
        return new Intl.NumberFormat('en-AU', {
            style: 'currency',
            currency: 'AUD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Format date
    const formatDate = (date?: string) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString('en-AU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Get status color
    const getStatusColor = (status?: string) => {
        switch (status) {
            case "ACTIVE": return "green";
            case "INACTIVE": return "gray";
            case "PENDING": return "orange";
            case "SUSPENDED": return "red";
            default: return "gray";
        }
    };

    // Get type label
    const getTypeLabel = (type?: string) => {
        switch (type) {
            case "CORPORATION": return "Corporation";
            case "PARTNERSHIP": return "Partnership";
            case "SOLE_TRADER": return "Sole Trader";
            case "TRUST": return "Trust";
            case "NON_PROFIT": return "Non-Profit";
            case "GOVERNMENT": return "Government";
            default: return type || "Other";
        }
    };

    // Format address
    const formatAddress = (address?: any) => {
        if (!address || (!address.street && !address.city)) return "-";
        const parts = [];
        if (address.street) parts.push(address.street);
        if (address.city) parts.push(address.city);
        if (address.state) parts.push(address.state);
        if (address.postalCode) parts.push(address.postalCode);
        if (address.country && address.country !== "Australia") parts.push(address.country);
        return parts.join(", ");
    };

    // Handle delete
    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${company?.name}?`)) {
            await deleteCompany({ variables: { id } });
        }
    };

    // Handle remove employee
    const handleRemoveEmployee = async (clientId: string, name: string) => {
        if (window.confirm(`Remove ${name} from this company?`)) {
            await removeEmployee({ variables: { companyId: id, clientId } });
        }
    };

    if (loading) {
        return (
            <Box bg={bgMain} minH="100vh">
                <NavbarWithCallToAction />
                <ModuleBreadcrumb moduleConfig={companiesModuleConfig} />
                <Container maxW="container.xl" py={8}>
                    <VStack spacing={6} align="stretch">
                        <Skeleton height="60px" />
                        <Card bg={cardGradientBg} borderColor={cardBorder}>
                            <CardBody>
                                <VStack spacing={4}>
                                    <SkeletonText mt="4" noOfLines={4} spacing="4" />
                                    <SkeletonText mt="4" noOfLines={4} spacing="4" />
                                </VStack>
                            </CardBody>
                        </Card>
                    </VStack>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    if (error || !company) {
        return (
            <Box bg={bgMain} minH="100vh">
                <NavbarWithCallToAction />
                <ModuleBreadcrumb moduleConfig={companiesModuleConfig} />
                <Container maxW="container.xl" py={8}>
                    <Text color={errorRed}>
                        {error ? `Error: ${error.message}` : "Company not found"}
                    </Text>
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
                    {/* Header */}
                    <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                        <HStack>
                            <IconButton
                                aria-label="Back"
                                icon={<ArrowBackIcon />}
                                variant="ghost"
                                color={textPrimary}
                                onClick={() => navigate("/companies")}
                                size={buttonSize}
                            />
                            <VStack align="start" spacing={0}>
                                <Heading color={textPrimary} fontFamily={brandConfig.fonts.heading} size={{ base: "md", md: "lg" }}>
                                    {company.name}
                                </Heading>
                                {company.tradingName && (
                                    <Text color={textSecondary} fontSize={{ base: "sm", md: "md" }}>
                                        Trading as: {company.tradingName}
                                    </Text>
                                )}
                            </VStack>
                        </HStack>
                        <HStack>
                            <Button
                                leftIcon={<EditIcon />}
                                variant="outline"
                                borderColor={cardBorder}
                                color={textPrimary}
                                onClick={() => navigate(`/companies/edit/${id}`)}
                                size={buttonSize}
                            >
                                Edit
                            </Button>
                            <Button
                                leftIcon={<DeleteIcon />}
                                colorScheme="red"
                                variant="outline"
                                onClick={handleDelete}
                                size={buttonSize}
                            >
                                Delete
                            </Button>
                        </HStack>
                    </Flex>

                    {/* Quick Stats */}
                    <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(5, 1fr)" }} gap={{ base: 3, md: 4 }}>
                        <Card
                            bg={cardGradientBg}
                            backdropFilter="blur(10px)"
                            boxShadow="0 4px 6px 0 rgba(0, 0, 0, 0.2)"
                            border="1px"
                            borderColor={cardBorder}
                            borderRadius="lg"
                        >
                            <CardBody py={{ base: 3, md: 4 }} px={{ base: 3, md: 5 }}>
                                <Stat>
                                    <StatLabel color={textMuted} fontSize={{ base: "xs", md: "sm" }}>Status</StatLabel>
                                    <Badge colorScheme={getStatusColor(company.status)} fontSize={{ base: "sm", md: "md" }} mt={1}>
                                        {company.status || "Active"}
                                    </Badge>
                                </Stat>
                            </CardBody>
                        </Card>
                        <Card
                            bg={cardGradientBg}
                            backdropFilter="blur(10px)"
                            boxShadow="0 4px 6px 0 rgba(0, 0, 0, 0.2)"
                            border="1px"
                            borderColor={cardBorder}
                            borderRadius="lg"
                        >
                            <CardBody py={{ base: 3, md: 4 }} px={{ base: 3, md: 5 }}>
                                <Stat>
                                    <StatLabel color={textMuted} fontSize={{ base: "xs", md: "sm" }}>Type</StatLabel>
                                    <StatNumber color={textPrimary} fontSize={{ base: "md", md: "lg" }}>
                                        {getTypeLabel(company.type || undefined)}
                                    </StatNumber>
                                </Stat>
                            </CardBody>
                        </Card>
                        <Card
                            bg={cardGradientBg}
                            backdropFilter="blur(10px)"
                            boxShadow="0 4px 6px 0 rgba(0, 0, 0, 0.2)"
                            border="1px"
                            borderColor={cardBorder}
                            borderRadius="lg"
                        >
                            <CardBody py={{ base: 3, md: 4 }} px={{ base: 3, md: 5 }}>
                                <Stat>
                                    <StatLabel color={textMuted} fontSize={{ base: "xs", md: "sm" }}>Employees</StatLabel>
                                    <StatNumber color={textPrimary} fontSize={{ base: "md", md: "lg" }}>
                                        {company.employeeCount || 0}
                                    </StatNumber>
                                </Stat>
                            </CardBody>
                        </Card>
                        <Card
                            bg={cardGradientBg}
                            backdropFilter="blur(10px)"
                            boxShadow="0 4px 6px 0 rgba(0, 0, 0, 0.2)"
                            border="1px"
                            borderColor={cardBorder}
                            borderRadius="lg"
                        >
                            <CardBody py={{ base: 3, md: 4 }} px={{ base: 3, md: 5 }}>
                                <Stat>
                                    <StatLabel color={textMuted} fontSize={{ base: "xs", md: "sm" }}>Assets</StatLabel>
                                    <StatNumber color={textPrimary} fontSize={{ base: "md", md: "lg" }}>
                                        {company.assetCount || 0}
                                    </StatNumber>
                                </Stat>
                            </CardBody>
                        </Card>
                        <Card
                            bg={cardGradientBg}
                            backdropFilter="blur(10px)"
                            boxShadow="0 4px 6px 0 rgba(0, 0, 0, 0.2)"
                            border="1px"
                            borderColor={cardBorder}
                            borderRadius="lg"
                        >
                            <CardBody py={{ base: 3, md: 4 }} px={{ base: 3, md: 5 }}>
                                <Stat>
                                    <StatLabel color={textMuted} fontSize={{ base: "xs", md: "sm" }}>Passwords</StatLabel>
                                    <StatNumber color={textPrimary} fontSize={{ base: "md", md: "lg" }}>
                                        {company.passwordCount || 0}
                                    </StatNumber>
                                </Stat>
                            </CardBody>
                        </Card>
                    </Grid>

                    {/* Detailed Information */}
                    <Card
                        bg={cardGradientBg}
                        backdropFilter="blur(10px)"
                        boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                        border="1px"
                        borderColor={cardBorder}
                        borderRadius="lg"
                    >
                        <CardBody>
                            <Tabs isFitted variant="enclosed" colorScheme="purple">
                                <TabList>
                                    <Tab color={textPrimary} _selected={{ color: primaryColor, borderColor: primaryColor }} fontSize={{ base: "sm", md: "md" }}>
                                        Details
                                    </Tab>
                                    <Tab color={textPrimary} _selected={{ color: primaryColor, borderColor: primaryColor }} fontSize={{ base: "sm", md: "md" }}>
                                        Employees
                                    </Tab>
                                    <Tab color={textPrimary} _selected={{ color: primaryColor, borderColor: primaryColor }} fontSize={{ base: "sm", md: "md" }}>
                                        Assets
                                    </Tab>
                                    <Tab color={textPrimary} _selected={{ color: primaryColor, borderColor: primaryColor }} fontSize={{ base: "sm", md: "md" }}>
                                        Financial
                                    </Tab>
                                </TabList>

                                <TabPanels>
                                    {/* Company Details */}
                                    <TabPanel>
                                        <VStack spacing={6} align="stretch">
                                            {/* Basic Information */}
                                            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={{ base: 4, md: 6 }}>
                                                <GridItem>
                                                    <Text color={textMuted} fontSize="sm" mb={1}>Industry</Text>
                                                    <Text color={textPrimary} fontSize={{ base: "md", md: "lg" }}>
                                                        {company.industry || "-"}
                                                    </Text>
                                                </GridItem>
                                                <GridItem>
                                                    <Text color={textMuted} fontSize="sm" mb={1}>ABN</Text>
                                                    <Text color={textPrimary} fontSize={{ base: "md", md: "lg" }}>
                                                        {company.abn || "-"}
                                                    </Text>
                                                </GridItem>
                                                <GridItem>
                                                    <Text color={textMuted} fontSize="sm" mb={1}>ACN</Text>
                                                    <Text color={textPrimary} fontSize={{ base: "md", md: "lg" }}>
                                                        {company.acn || "-"}
                                                    </Text>
                                                </GridItem>
                                                <GridItem>
                                                    <Text color={textMuted} fontSize="sm" mb={1}>Website</Text>
                                                    {company.website ? (
                                                        <Link href={company.website} isExternal color={primaryColor}>
                                                            <HStack>
                                                                <Text>{company.website}</Text>
                                                                <ExternalLinkIcon />
                                                            </HStack>
                                                        </Link>
                                                    ) : (
                                                        <Text color={textPrimary}>-</Text>
                                                    )}
                                                </GridItem>
                                            </Grid>

                                            <Divider borderColor={cardBorder} />

                                            {/* Contact Information */}
                                            <Text color={textPrimary} fontSize="lg" fontWeight="bold">
                                                Contact Information
                                            </Text>
                                            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={{ base: 4, md: 6 }}>
                                                <GridItem>
                                                    <Text color={textMuted} fontSize="sm" mb={1}>Email</Text>
                                                    <HStack>
                                                        <EmailIcon color={textMuted} boxSize={{ base: 3, md: 4 }} />
                                                        <Text color={textPrimary} fontSize={{ base: "md", md: "lg" }}>
                                                            {company.email || "-"}
                                                        </Text>
                                                    </HStack>
                                                </GridItem>
                                                <GridItem>
                                                    <Text color={textMuted} fontSize="sm" mb={1}>Phone</Text>
                                                    <HStack>
                                                        <PhoneIcon color={textMuted} boxSize={{ base: 3, md: 4 }} />
                                                        <Text color={textPrimary} fontSize={{ base: "md", md: "lg" }}>
                                                            {company.phone || "-"}
                                                        </Text>
                                                    </HStack>
                                                </GridItem>
                                            </Grid>

                                            {/* Primary Contact */}
                                            {company.primaryContact && (company.primaryContact.name || company.primaryContact.email) && (
                                                <>
                                                    <Divider borderColor={cardBorder} />
                                                    <Text color={textPrimary} fontSize="lg" fontWeight="bold">
                                                        Primary Contact
                                                    </Text>
                                                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={{ base: 4, md: 6 }}>
                                                        <GridItem>
                                                            <Text color={textMuted} fontSize="sm" mb={1}>Name</Text>
                                                            <Text color={textPrimary}>
                                                                {company.primaryContact.name || "-"}
                                                            </Text>
                                                            {company.primaryContact.position && (
                                                                <Text color={textSecondary} fontSize="sm">
                                                                    {company.primaryContact.position}
                                                                </Text>
                                                            )}
                                                        </GridItem>
                                                        <GridItem>
                                                            <VStack align="start" spacing={2}>
                                                                {company.primaryContact.email && (
                                                                    <HStack>
                                                                        <EmailIcon color={textMuted} boxSize={3} />
                                                                        <Text color={textSecondary} fontSize="sm">
                                                                            {company.primaryContact.email}
                                                                        </Text>
                                                                    </HStack>
                                                                )}
                                                                {company.primaryContact.phone && (
                                                                    <HStack>
                                                                        <PhoneIcon color={textMuted} boxSize={3} />
                                                                        <Text color={textSecondary} fontSize="sm">
                                                                            {company.primaryContact.phone}
                                                                        </Text>
                                                                    </HStack>
                                                                )}
                                                            </VStack>
                                                        </GridItem>
                                                    </Grid>
                                                </>
                                            )}

                                            {/* Addresses */}
                                            <Divider borderColor={cardBorder} />
                                            <Text color={textPrimary} fontSize="lg" fontWeight="bold">
                                                Addresses
                                            </Text>
                                            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={{ base: 4, md: 6 }}>
                                                <GridItem>
                                                    <Text color={textMuted} fontSize="sm" mb={1}>Physical Address</Text>
                                                    <Text color={textPrimary} whiteSpace="pre-wrap">
                                                        {formatAddress(company.physicalAddress)}
                                                    </Text>
                                                </GridItem>
                                                <GridItem>
                                                    <Text color={textMuted} fontSize="sm" mb={1}>Postal Address</Text>
                                                    <Text color={textPrimary} whiteSpace="pre-wrap">
                                                        {formatAddress(company.postalAddress)}
                                                    </Text>
                                                </GridItem>
                                            </Grid>

                                            {/* Tags */}
                                            {company.tags && company.tags.length > 0 && (
                                                <>
                                                    <Divider borderColor={cardBorder} />
                                                    <Box>
                                                        <Text color={textMuted} fontSize="sm" mb={2}>Tags</Text>
                                                        <Wrap>
                                                            {company.tags.map((tag: string, index: number) => (
                                                                <WrapItem key={index}>
                                                                    <Tag size="md" variant="solid" colorScheme="purple">
                                                                        {tag}
                                                                    </Tag>
                                                                </WrapItem>
                                                            ))}
                                                        </Wrap>
                                                    </Box>
                                                </>
                                            )}

                                            {/* Notes */}
                                            {company.notes && (
                                                <>
                                                    <Divider borderColor={cardBorder} />
                                                    <Box>
                                                        <Text color={textMuted} fontSize="sm" mb={2}>Notes</Text>
                                                        <Text color={textPrimary} whiteSpace="pre-wrap">
                                                            {company.notes}
                                                        </Text>
                                                    </Box>
                                                </>
                                            )}
                                        </VStack>
                                    </TabPanel>

                                    {/* Employees Tab */}
                                    <TabPanel>
                                        <VStack spacing={4} align="stretch">
                                            <HStack justify="space-between">
                                                <Text color={textPrimary} fontSize="lg" fontWeight="bold">
                                                    Company Employees ({company.employeeCount || 0})
                                                </Text>
                                                <Button
                                                    leftIcon={<AddIcon />}
                                                    size="sm"
                                                    bg={primaryColor}
                                                    color="white"
                                                    _hover={{ bg: primaryHover }}
                                                    onClick={() => navigate(`/companies/edit/${id}`)}
                                                >
                                                    Add Employee
                                                </Button>
                                            </HStack>

                                            {company.employeeDetails && company.employeeDetails.length > 0 ? (
                                                isMobile ? (
                                                    // Mobile view - Cards
                                                    <VStack spacing={3}>
                                                        {company.employeeDetails.map((employee: Client) => (
                                                            <Card
                                                                key={employee.id}
                                                                bg="rgba(255, 255, 255, 0.03)"
                                                                borderColor={cardBorder}
                                                                borderWidth="1px"
                                                                borderRadius="md"
                                                                w="100%"
                                                            >
                                                                <CardBody p={4}>
                                                                    <HStack justify="space-between">
                                                                        <VStack align="start" spacing={1}>
                                                                            <Text color={textPrimary} fontWeight="bold">
                                                                                {employee.fName || ''} {employee.lName || ''}
                                                                            </Text>
                                                                            <Text color={textSecondary} fontSize="sm">
                                                                                {employee.email}
                                                                            </Text>
                                                                            {employee.phoneNumber && (
                                                                                <Text color={textMuted} fontSize="sm">
                                                                                    {employee.phoneNumber}
                                                                                </Text>
                                                                            )}
                                                                        </VStack>
                                                                        <VStack>
                                                                            <IconButton
                                                                                aria-label="View"
                                                                                icon={<ViewIcon />}
                                                                                size="sm"
                                                                                variant="ghost"
                                                                                color={textPrimary}
                                                                                onClick={() => navigate(`/clients/${employee.id}`)}
                                                                            />
                                                                            <IconButton
                                                                                aria-label="Remove"
                                                                                icon={<DeleteIcon />}
                                                                                size="sm"
                                                                                variant="ghost"
                                                                                color={errorRed}
                                                                                onClick={() => handleRemoveEmployee(employee.id, `${employee.fName || ''} ${employee.lName || ''}`.trim())}
                                                                            />
                                                                        </VStack>
                                                                    </HStack>
                                                                </CardBody>
                                                            </Card>
                                                        ))}
                                                    </VStack>
                                                ) : (
                                                    // Desktop view - Table
                                                    <TableContainer>
                                                        <Table variant="simple">
                                                            <Thead>
                                                                <Tr>
                                                                    <Th color={textMuted}>Name</Th>
                                                                    <Th color={textMuted}>Email</Th>
                                                                    <Th color={textMuted}>Phone</Th>
                                                                    <Th color={textMuted}>Actions</Th>
                                                                </Tr>
                                                            </Thead>
                                                            <Tbody>
                                                                {company.employeeDetails.map((employee: Client) => (
                                                                    <Tr key={employee.id}>
                                                                        <Td>
                                                                            <Text color={textPrimary}>
                                                                                {employee.fName || ''} {employee.lName || ''}
                                                                            </Text>
                                                                        </Td>
                                                                        <Td>
                                                                            <Text color={textSecondary}>
                                                                                {employee.email}
                                                                            </Text>
                                                                        </Td>
                                                                        <Td>
                                                                            <Text color={textSecondary}>
                                                                                {employee.phoneNumber || "-"}
                                                                            </Text>
                                                                        </Td>
                                                                        <Td>
                                                                            <HStack spacing={2}>
                                                                                <IconButton
                                                                                    aria-label="View"
                                                                                    icon={<ViewIcon />}
                                                                                    size="sm"
                                                                                    variant="ghost"
                                                                                    color={textPrimary}
                                                                                    onClick={() => navigate(`/clients/${employee.id}`)}
                                                                                />
                                                                                <IconButton
                                                                                    aria-label="Remove"
                                                                                    icon={<DeleteIcon />}
                                                                                    size="sm"
                                                                                    variant="ghost"
                                                                                    color={errorRed}
                                                                                    onClick={() => handleRemoveEmployee(employee.id, `${employee.fName || ''} ${employee.lName || ''}`.trim())}
                                                                                />
                                                                            </HStack>
                                                                        </Td>
                                                                    </Tr>
                                                                ))}
                                                            </Tbody>
                                                        </Table>
                                                    </TableContainer>
                                                )
                                            ) : (
                                                <Card bg="rgba(255, 255, 255, 0.02)" borderColor={cardBorder}>
                                                    <CardBody>
                                                        <VStack spacing={3}>
                                                            <Text color={textMuted}>No employees assigned to this company</Text>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                onClick={() => navigate(`/companies/edit/${id}`)}
                                                            >
                                                                Assign Employees
                                                            </Button>
                                                        </VStack>
                                                    </CardBody>
                                                </Card>
                                            )}
                                        </VStack>
                                    </TabPanel>

                                    {/* Assets Tab */}
                                    <TabPanel>
                                        <VStack spacing={4} align="stretch">
                                            <HStack justify="space-between">
                                                <Text color={textPrimary} fontSize="lg" fontWeight="bold">
                                                    Company Assets ({company.assetCount || 0})
                                                </Text>
                                            </HStack>

                                            <Card bg="rgba(255, 255, 255, 0.02)" borderColor={cardBorder}>
                                                <CardBody>
                                                    <VStack spacing={3}>
                                                        <Text color={textMuted}>Asset management coming soon</Text>
                                                        <Text color={textSecondary} fontSize="sm">
                                                            Track company assets, equipment, and resources
                                                        </Text>
                                                    </VStack>
                                                </CardBody>
                                            </Card>

                                            {/* Passwords Section */}
                                            <HStack justify="space-between">
                                                <Text color={textPrimary} fontSize="lg" fontWeight="bold">
                                                    Company Passwords ({company.passwordCount || 0})
                                                </Text>
                                                <Button
                                                    leftIcon={<LockIcon />}
                                                    size="sm"
                                                    bg={primaryColor}
                                                    color="white"
                                                    _hover={{ bg: primaryHover }}
                                                    onClick={() => navigate("/passwords/new")}
                                                >
                                                    Add Password
                                                </Button>
                                            </HStack>

                                            <Card bg="rgba(255, 255, 255, 0.02)" borderColor={cardBorder}>
                                                <CardBody>
                                                    <VStack spacing={3}>
                                                        <Text color={textSecondary} fontSize="sm">
                                                            Manage passwords and credentials for this company
                                                        </Text>
                                                    </VStack>
                                                </CardBody>
                                            </Card>
                                        </VStack>
                                    </TabPanel>

                                    {/* Financial Tab */}
                                    <TabPanel>
                                        <VStack spacing={6} align="stretch">
                                            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={{ base: 4, md: 6 }}>
                                                <GridItem>
                                                    <Text color={textMuted} fontSize="sm" mb={1}>Annual Revenue</Text>
                                                    <Text color={textPrimary} fontSize={{ base: "md", md: "lg" }}>
                                                        {formatCurrency(company.annualRevenue || 0)}
                                                    </Text>
                                                </GridItem>
                                                <GridItem>
                                                    <Text color={textMuted} fontSize="sm" mb={1}>Number of Employees</Text>
                                                    <Text color={textPrimary} fontSize={{ base: "md", md: "lg" }}>
                                                        {company.numberOfEmployees || "-"}
                                                    </Text>
                                                </GridItem>
                                                <GridItem>
                                                    <Text color={textMuted} fontSize="sm" mb={1}>Established Date</Text>
                                                    <HStack>
                                                        <CalendarIcon color={textMuted} boxSize={{ base: 3, md: 4 }} />
                                                        <Text color={textPrimary} fontSize={{ base: "md", md: "lg" }}>
                                                            {formatDate(company.establishedDate || '')}
                                                        </Text>
                                                    </HStack>
                                                </GridItem>
                                                <GridItem>
                                                    <Text color={textMuted} fontSize="sm" mb={1}>Financial Year End</Text>
                                                    <Text color={textPrimary} fontSize={{ base: "md", md: "lg" }}>
                                                        {company.financialYearEnd || "-"}
                                                    </Text>
                                                </GridItem>
                                                <GridItem>
                                                    <Text color={textMuted} fontSize="sm" mb={1}>Billing Email</Text>
                                                    <Text color={textPrimary} fontSize={{ base: "md", md: "lg" }}>
                                                        {company.billingEmail || "-"}
                                                    </Text>
                                                </GridItem>
                                                <GridItem>
                                                    <Text color={textMuted} fontSize="sm" mb={1}>Tax Number</Text>
                                                    <Text color={textPrimary} fontSize={{ base: "md", md: "lg" }}>
                                                        {company.taxNumber || "-"}
                                                    </Text>
                                                </GridItem>
                                            </Grid>

                                            <Divider borderColor={cardBorder} />

                                            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3}>
                                                <GridItem>
                                                    <Text color={textMuted} fontSize="sm">Created</Text>
                                                    <Text color={textSecondary}>
                                                        {formatDate(company.createdAt)}
                                                    </Text>
                                                </GridItem>
                                                <GridItem>
                                                    <Text color={textMuted} fontSize="sm">Last Updated</Text>
                                                    <Text color={textSecondary}>
                                                        {formatDate(company.updatedAt)}
                                                    </Text>
                                                </GridItem>
                                            </Grid>
                                        </VStack>
                                    </TabPanel>
                                </TabPanels>
                            </Tabs>
                        </CardBody>
                    </Card>
                </VStack>
            </Container>

            <FooterWithFourColumns />
        </Box>
    );
};

export default CompanyDetails;