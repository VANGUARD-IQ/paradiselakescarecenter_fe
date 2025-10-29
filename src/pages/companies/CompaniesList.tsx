import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import {
    Box,
    Container,
    Heading,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Badge,
    IconButton,
    HStack,
    VStack,
    Text,
    useToast,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    InputGroup,
    InputLeftElement,
    Input,
    Select,
    Card,
    CardBody,
    Stat,
    StatLabel,
    StatNumber,
    StatGroup,
    Flex,
    SimpleGrid,
    useBreakpointValue,
    Skeleton,
    Tag,
    Wrap,
    WrapItem,
    Divider,
    useColorMode,
} from "@chakra-ui/react";
import {
    AddIcon,
    EditIcon,
    DeleteIcon,
    ViewIcon,
    SearchIcon,
    ChevronDownIcon,
    EmailIcon,
    PhoneIcon,
    ExternalLinkIcon,
    AtSignIcon,
} from "@chakra-ui/icons";
import { getColor, brandConfig } from "../../brandConfig";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import companiesModuleConfig from "./moduleConfig";
import { Company } from "../../generated/graphql";

const GET_COMPANIES = gql`
    query GetCompanies {
        companies {
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
            physicalAddress {
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
            }
            numberOfEmployees
            employeeCount
            assetCount
            passwordCount
            tags
            isActive
        }
        companyStats
    }
`;

const DELETE_COMPANY = gql`
    mutation DeleteCompany($id: ID!) {
        deleteCompany(id: $id)
    }
`;

interface CompanyAddress {
    street?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
}

interface CompanyContact {
    name?: string;
    position?: string;
    email?: string;
    phone?: string;
}


const CompaniesList: React.FC = () => {
    usePageTitle("Companies");

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

    // State
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [industryFilter, setIndustryFilter] = useState("ALL");

    // Responsive values
    const isMobile = useBreakpointValue({ base: true, md: false });
    const tableSize = useBreakpointValue({ base: "sm", md: "md" });

    // Queries and mutations
    const { data, loading, error, refetch } = useQuery(GET_COMPANIES);
    const [deleteCompany] = useMutation(DELETE_COMPANY, {
        onCompleted: () => {
            toast({
                title: "Company deleted",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            refetch();
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

    // Filter companies
    const filteredCompanies = data?.companies?.filter((company: Company) => {
        const matchesSearch = searchTerm === "" || 
            company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.tradingName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.abn?.includes(searchTerm) ||
            company.email?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === "ALL" || company.status === statusFilter;
        const matchesType = typeFilter === "ALL" || company.type === typeFilter;
        const matchesIndustry = industryFilter === "ALL" || company.industry === industryFilter;
        
        return matchesSearch && matchesStatus && matchesType && matchesIndustry;
    }) || [];

    // Get unique industries
    const industries: string[] = Array.from(new Set(data?.companies?.map((c: Company) => c.industry).filter(Boolean))) as string[] || [];

    // Handle delete
    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete ${name}?`)) {
            await deleteCompany({ variables: { id } });
        }
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

    if (error) {
        return (
            <Box bg={bgMain} minH="100vh">
                <Text color={errorRed}>Error loading companies: {error.message}</Text>
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
                        <Heading color={textPrimary} fontFamily={brandConfig.fonts.heading} size={{ base: "md", md: "lg" }}>
                            Company Management
                        </Heading>
                        <Button
                            leftIcon={<AddIcon />}
                            bg={primaryColor}
                            color="white"
                            _hover={{ bg: primaryHover }}
                            onClick={() => navigate("/companies/new")}
                            size={{ base: "sm", md: "md" }}
                        >
                            Add Company
                        </Button>
                    </Flex>

                    {/* Stats Cards */}
                    {data?.companyStats && (
                        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={{ base: 3, md: 4 }}>
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
                                        <StatLabel color={textMuted} fontSize={{ base: "xs", md: "sm" }}>Total Companies</StatLabel>
                                        <StatNumber color={textPrimary} fontSize={{ base: "xl", md: "2xl" }}>
                                            {data.companyStats[0] || 0}
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
                                        <StatLabel color={textMuted} fontSize={{ base: "xs", md: "sm" }}>New (24h)</StatLabel>
                                        <StatNumber color={successGreen} fontSize={{ base: "xl", md: "2xl" }}>
                                            {data.companyStats[1] || 0}
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
                                        <StatLabel color={textMuted} fontSize={{ base: "xs", md: "sm" }}>This Week</StatLabel>
                                        <StatNumber color={textPrimary} fontSize={{ base: "xl", md: "2xl" }}>
                                            {data.companyStats[2] || 0}
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
                                        <StatLabel color={textMuted} fontSize={{ base: "xs", md: "sm" }}>This Month</StatLabel>
                                        <StatNumber color={textPrimary} fontSize={{ base: "xl", md: "2xl" }}>
                                            {data.companyStats[3] || 0}
                                        </StatNumber>
                                    </Stat>
                                </CardBody>
                            </Card>
                        </SimpleGrid>
                    )}

                    {/* Filters */}
                    <Card
                        bg={cardGradientBg}
                        backdropFilter="blur(10px)"
                        boxShadow="0 4px 6px 0 rgba(0, 0, 0, 0.2)"
                        border="1px"
                        borderColor={cardBorder}
                        borderRadius="lg"
                    >
                        <CardBody>
                            <Flex gap={{ base: 3, md: 4 }} wrap="wrap">
                                <InputGroup flex={{ base: "1 1 100%", md: "1" }} size={{ base: "sm", md: "md" }}>
                                    <InputLeftElement pointerEvents="none">
                                        <SearchIcon color={textMuted} />
                                    </InputLeftElement>
                                    <Input
                                        placeholder="Search companies..."
                                        bg="rgba(255, 255, 255, 0.05)"
                                        borderColor={cardBorder}
                                        color={textPrimary}
                                        _placeholder={{ color: textMuted }}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </InputGroup>
                                
                                <Select
                                    bg="rgba(255, 255, 255, 0.05)"
                                    borderColor={cardBorder}
                                    color={textPrimary}
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    width={{ base: "100%", md: "180px" }}
                                    size={{ base: "sm", md: "md" }}
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="SUSPENDED">Suspended</option>
                                </Select>
                                
                                <Select
                                    bg="rgba(255, 255, 255, 0.05)"
                                    borderColor={cardBorder}
                                    color={textPrimary}
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    width={{ base: "100%", md: "180px" }}
                                    size={{ base: "sm", md: "md" }}
                                >
                                    <option value="ALL">All Types</option>
                                    <option value="CORPORATION">Corporation</option>
                                    <option value="PARTNERSHIP">Partnership</option>
                                    <option value="SOLE_TRADER">Sole Trader</option>
                                    <option value="TRUST">Trust</option>
                                    <option value="NON_PROFIT">Non-Profit</option>
                                    <option value="GOVERNMENT">Government</option>
                                    <option value="OTHER">Other</option>
                                </Select>
                                
                                {industries.length > 0 && (
                                    <Select
                                        bg="rgba(255, 255, 255, 0.05)"
                                        borderColor={cardBorder}
                                        color={textPrimary}
                                        value={industryFilter}
                                        onChange={(e) => setIndustryFilter(e.target.value)}
                                        width={{ base: "100%", md: "180px" }}
                                        size={{ base: "sm", md: "md" }}
                                    >
                                        <option value="ALL">All Industries</option>
                                        {industries.map((industry) => (
                                            <option key={industry} value={industry}>{industry}</option>
                                        ))}
                                    </Select>
                                )}
                            </Flex>
                        </CardBody>
                    </Card>

                    {/* Companies Table/Cards */}
                    <Card
                        bg={cardGradientBg}
                        backdropFilter="blur(10px)"
                        boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                        border="1px"
                        borderColor={cardBorder}
                        borderRadius="lg"
                    >
                        <CardBody p={{ base: 0, md: 6 }}>
                            {loading ? (
                                <VStack spacing={4} p={4}>
                                    <Skeleton height="60px" />
                                    <Skeleton height="60px" />
                                    <Skeleton height="60px" />
                                </VStack>
                            ) : isMobile ? (
                                // Mobile view - Cards
                                <VStack spacing={4} p={4}>
                                    {filteredCompanies.length === 0 ? (
                                        <Text color={textMuted} textAlign="center" py={8}>
                                            No companies found
                                        </Text>
                                    ) : (
                                        filteredCompanies.map((company: Company) => (
                                            <Card
                                                key={company.id}
                                                bg="rgba(255, 255, 255, 0.03)"
                                                borderColor={cardBorder}
                                                borderWidth="1px"
                                                borderRadius="md"
                                                w="100%"
                                            >
                                                <CardBody p={4}>
                                                    <VStack align="stretch" spacing={3}>
                                                        <HStack justify="space-between">
                                                            <VStack align="start" spacing={0}>
                                                                <Text color={textPrimary} fontWeight="bold" fontSize="md">
                                                                    {company.name}
                                                                </Text>
                                                                {company.tradingName && (
                                                                    <Text color={textSecondary} fontSize="sm">
                                                                        Trading as: {company.tradingName}
                                                                    </Text>
                                                                )}
                                                            </VStack>
                                                            <Badge colorScheme={getStatusColor(company.status)}>
                                                                {company.status || "Active"}
                                                            </Badge>
                                                        </HStack>
                                                        
                                                        {company.industry && (
                                                            <Tag size="sm" variant="outline" colorScheme="blue">
                                                                {company.industry}
                                                            </Tag>
                                                        )}
                                                        
                                                        <HStack spacing={4} fontSize="sm" wrap="wrap">
                                                            {company.email && (
                                                                <HStack spacing={1}>
                                                                    <EmailIcon color={textMuted} boxSize={3} />
                                                                    <Text color={textSecondary} noOfLines={1}>
                                                                        {company.email}
                                                                    </Text>
                                                                </HStack>
                                                            )}
                                                            {company.phone && (
                                                                <HStack spacing={1}>
                                                                    <PhoneIcon color={textMuted} boxSize={3} />
                                                                    <Text color={textSecondary}>
                                                                        {company.phone}
                                                                    </Text>
                                                                </HStack>
                                                            )}
                                                        </HStack>

                                                        <HStack spacing={4} fontSize="xs" color={textMuted}>
                                                            <Text>Employees: {company.employeeCount || 0}</Text>
                                                            <Text>Assets: {company.assetCount || 0}</Text>
                                                            <Text>Passwords: {company.passwordCount || 0}</Text>
                                                        </HStack>
                                                        
                                                        <Divider borderColor={cardBorder} />
                                                        
                                                        <HStack justify="space-between">
                                                            <HStack spacing={2}>
                                                                <IconButton
                                                                    aria-label="View"
                                                                    icon={<ViewIcon />}
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    color={textPrimary}
                                                                    onClick={() => navigate(`/companies/${company.id}`)}
                                                                />
                                                                <IconButton
                                                                    aria-label="Edit"
                                                                    icon={<EditIcon />}
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    color={textPrimary}
                                                                    onClick={() => navigate(`/companies/edit/${company.id}`)}
                                                                />
                                                                <IconButton
                                                                    aria-label="Delete"
                                                                    icon={<DeleteIcon />}
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    color={errorRed}
                                                                    onClick={() => handleDelete(company.id, company.name)}
                                                                />
                                                            </HStack>
                                                            {company.abn && (
                                                                <Text color={textMuted} fontSize="xs">
                                                                    ABN: {company.abn}
                                                                </Text>
                                                            )}
                                                        </HStack>
                                                    </VStack>
                                                </CardBody>
                                            </Card>
                                        ))
                                    )}
                                </VStack>
                            ) : (
                                // Desktop view - Table
                                <TableContainer>
                                    <Table variant="simple" size={tableSize}>
                                        <Thead>
                                            <Tr>
                                                <Th color={textMuted}>Company</Th>
                                                <Th color={textMuted}>Contact</Th>
                                                <Th color={textMuted}>Type</Th>
                                                <Th color={textMuted}>Industry</Th>
                                                <Th color={textMuted}>Stats</Th>
                                                <Th color={textMuted}>Status</Th>
                                                <Th color={textMuted}>Actions</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {filteredCompanies.length === 0 ? (
                                                <Tr>
                                                    <Td colSpan={7}>
                                                        <Text color={textMuted} textAlign="center" py={8}>
                                                            No companies found
                                                        </Text>
                                                    </Td>
                                                </Tr>
                                            ) : (
                                                filteredCompanies.map((company: Company) => (
                                                    <Tr key={company.id}>
                                                        <Td>
                                                            <VStack align="start" spacing={0}>
                                                                <Text color={textPrimary} fontWeight="medium">
                                                                    {company.name}
                                                                </Text>
                                                                {company.tradingName && (
                                                                    <Text color={textMuted} fontSize="sm">
                                                                        Trading as: {company.tradingName}
                                                                    </Text>
                                                                )}
                                                                {company.abn && (
                                                                    <Text color={textMuted} fontSize="xs">
                                                                        ABN: {company.abn}
                                                                    </Text>
                                                                )}
                                                            </VStack>
                                                        </Td>
                                                        <Td>
                                                            <VStack align="start" spacing={0}>
                                                                {company.primaryContact?.name && (
                                                                    <Text color={textSecondary} fontSize="sm">
                                                                        {company.primaryContact.name}
                                                                    </Text>
                                                                )}
                                                                {company.email && (
                                                                    <HStack spacing={1}>
                                                                        <EmailIcon color={textMuted} boxSize={3} />
                                                                        <Text color={textMuted} fontSize="sm">
                                                                            {company.email}
                                                                        </Text>
                                                                    </HStack>
                                                                )}
                                                                {company.phone && (
                                                                    <HStack spacing={1}>
                                                                        <PhoneIcon color={textMuted} boxSize={3} />
                                                                        <Text color={textMuted} fontSize="sm">
                                                                            {company.phone}
                                                                        </Text>
                                                                    </HStack>
                                                                )}
                                                            </VStack>
                                                        </Td>
                                                        <Td>
                                                            <Text color={textSecondary} fontSize="sm">
                                                                {getTypeLabel(company.type || '')}
                                                            </Text>
                                                        </Td>
                                                        <Td>
                                                            {company.industry ? (
                                                                <Tag size="sm" variant="outline" colorScheme="blue">
                                                                    {company.industry}
                                                                </Tag>
                                                            ) : (
                                                                <Text color={textMuted}>-</Text>
                                                            )}
                                                        </Td>
                                                        <Td>
                                                            <VStack align="start" spacing={0} fontSize="xs">
                                                                <Text color={textSecondary}>
                                                                    Employees: {company.employeeCount || 0}
                                                                </Text>
                                                                <Text color={textSecondary}>
                                                                    Assets: {company.assetCount || 0}
                                                                </Text>
                                                                <Text color={textSecondary}>
                                                                    Passwords: {company.passwordCount || 0}
                                                                </Text>
                                                            </VStack>
                                                        </Td>
                                                        <Td>
                                                            <Badge colorScheme={getStatusColor(company.status)}>
                                                                {company.status || "Active"}
                                                            </Badge>
                                                        </Td>
                                                        <Td>
                                                            <Menu>
                                                                <MenuButton
                                                                    as={IconButton}
                                                                    icon={<ChevronDownIcon />}
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    color={textPrimary}
                                                                />
                                                                <MenuList bg={cardGradientBg} borderColor={cardBorder}>
                                                                    <MenuItem
                                                                        icon={<ViewIcon />}
                                                                        onClick={() => navigate(`/companies/${company.id}`)}
                                                                        _hover={{ bg: colorMode === 'light' ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.1)" }}
                                                                        color={textPrimary}
                                                                    >
                                                                        View Details
                                                                    </MenuItem>
                                                                    <MenuItem
                                                                        icon={<EditIcon />}
                                                                        onClick={() => navigate(`/companies/edit/${company.id}`)}
                                                                        _hover={{ bg: colorMode === 'light' ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.1)" }}
                                                                        color={textPrimary}
                                                                    >
                                                                        Edit
                                                                    </MenuItem>
                                                                    {company.website && (
                                                                        <MenuItem
                                                                            icon={<ExternalLinkIcon />}
                                                                            onClick={() => window.open(company.website || '', '_blank')}
                                                                            _hover={{ bg: colorMode === 'light' ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.1)" }}
                                                                            color={textPrimary}
                                                                        >
                                                                            Visit Website
                                                                        </MenuItem>
                                                                    )}
                                                                    <MenuItem
                                                                        icon={<DeleteIcon />}
                                                                        onClick={() => handleDelete(company.id, company.name)}
                                                                        _hover={{ bg: colorMode === 'light' ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.1)" }}
                                                                        color={errorRed}
                                                                    >
                                                                        Delete
                                                                    </MenuItem>
                                                                </MenuList>
                                                            </Menu>
                                                        </Td>
                                                    </Tr>
                                                ))
                                            )}
                                        </Tbody>
                                    </Table>
                                </TableContainer>
                            )}
                        </CardBody>
                    </Card>
                </VStack>
            </Container>

            <FooterWithFourColumns />
        </Box>
    );
};

export default CompaniesList;