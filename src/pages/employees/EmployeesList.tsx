import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
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
    Divider,
    Flex,
    SimpleGrid,
    useBreakpointValue,
    Skeleton,
    SkeletonText,
    useColorMode,
} from "@chakra-ui/react";
import {
    AddIcon,
    EditIcon,
    DeleteIcon,
    ViewIcon,
    SearchIcon,
    ChevronDownIcon,
    PhoneIcon,
    EmailIcon,
    CalendarIcon,
} from "@chakra-ui/icons";
import { getColor, brandConfig } from "../../brandConfig";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import employeesModuleConfig from "./moduleConfig";
import { Employee, EmployeeStatus } from "../../generated/graphql";
import { usePageTitle } from "../../hooks/useDocumentTitle";

const GET_EMPLOYEES = gql`
    query GetEmployees {
        employees {
            id
            employeeNumber
            fName
            lName
            email
            phoneNumber
            mobileNumber
            role
            department
            position
            status
            startDate
            contractType
            hourlyRate
            annualSalary
            company {
                id
                name
            }
        }
        employeeStats
    }
`;

const DELETE_EMPLOYEE = gql`
    mutation DeleteEmployee($id: ID!) {
        deleteEmployee(id: $id)
    }
`;


const EmployeesList: React.FC = () => {
    usePageTitle("Employees");

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
    const warningColor = getColor("status.warning", colorMode);

    // State
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [departmentFilter, setDepartmentFilter] = useState("ALL");

    // Responsive values
    const isMobile = useBreakpointValue({ base: true, md: false });
    const tableSize = useBreakpointValue({ base: "sm", md: "md" });

    // Queries and mutations
    const { data, loading, error, refetch } = useQuery(GET_EMPLOYEES);
    const [deleteEmployee] = useMutation(DELETE_EMPLOYEE, {
        onCompleted: () => {
            toast({
                title: "Employee deleted",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            refetch();
        },
        onError: (error) => {
            toast({
                title: "Error deleting employee",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        },
    });

    // Filter employees
    const filteredEmployees = data?.employees?.filter((employee: Employee) => {
        const matchesSearch = searchTerm === "" || 
            `${employee.fName} ${employee.lName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.employeeNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === "ALL" || employee.status === statusFilter;
        const matchesDepartment = departmentFilter === "ALL" || employee.department === departmentFilter;
        
        return matchesSearch && matchesStatus && matchesDepartment;
    }) || [];

    // Get unique departments
    const departments: string[] = Array.from(new Set(data?.employees?.map((e: Employee) => e.department).filter(Boolean))) as string[] || [];

    // Handle delete
    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete ${name}?`)) {
            await deleteEmployee({ variables: { id } });
        }
    };

    // Get status color
    const getStatusColor = (status?: string) => {
        switch (status) {
            case "ACTIVE": return "green";
            case "INACTIVE": return "gray";
            case "ON_LEAVE": return "orange";
            case "TERMINATED": return "red";
            default: return "gray";
        }
    };

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
        return new Date(date).toLocaleDateString('en-AU');
    };

    if (error) {
        return (
            <Box bg={bgMain} minH="100vh">
                <NavbarWithCallToAction />
                <ModuleBreadcrumb moduleConfig={employeesModuleConfig} />
                <Text color={errorRed}>Error loading employees: {error.message}</Text>
            </Box>
        );
    }

    return (
        <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={employeesModuleConfig} />

            <Container maxW="container.xl" px={{ base: 4, md: 8 }} py={{ base: 6, md: 8 }} flex="1">
                <VStack spacing={{ base: 4, md: 6 }} align="stretch">
                    {/* Header */}
                    <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                        <Heading color={textPrimary} fontFamily={brandConfig.fonts.heading} size={{ base: "md", md: "lg" }}>
                            Employee Management
                        </Heading>
                        <Button
                            leftIcon={<AddIcon />}
                            bg={primaryColor}
                            color="white"
                            _hover={{ bg: primaryHover }}
                            onClick={() => navigate("/employees/new")}
                            size={{ base: "sm", md: "md" }}
                        >
                            Add Employee
                        </Button>
                    </Flex>

                    {/* Stats Cards */}
                    {data?.employeeStats && (
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
                                        <StatLabel color={textMuted} fontSize={{ base: "xs", md: "sm" }}>Total Employees</StatLabel>
                                        <StatNumber color={textPrimary} fontSize={{ base: "xl", md: "2xl" }}>
                                            {data.employeeStats[0] || 0}
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
                                            {data.employeeStats[1] || 0}
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
                                            {data.employeeStats[2] || 0}
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
                                            {data.employeeStats[3] || 0}
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
                                        placeholder="Search employees..."
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
                                    width={{ base: "100%", md: "200px" }}
                                    size={{ base: "sm", md: "md" }}
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                    <option value="ON_LEAVE">On Leave</option>
                                    <option value="TERMINATED">Terminated</option>
                                </Select>
                                
                                <Select
                                    bg="rgba(255, 255, 255, 0.05)"
                                    borderColor={cardBorder}
                                    color={textPrimary}
                                    value={departmentFilter}
                                    onChange={(e) => setDepartmentFilter(e.target.value)}
                                    width={{ base: "100%", md: "200px" }}
                                    size={{ base: "sm", md: "md" }}
                                >
                                    <option value="ALL">All Departments</option>
                                    {departments.map((dept) => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </Select>
                            </Flex>
                        </CardBody>
                    </Card>

                    {/* Employees Table/Cards */}
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
                                    {filteredEmployees.length === 0 ? (
                                        <Text color={textMuted} textAlign="center" py={8}>
                                            No employees found
                                        </Text>
                                    ) : (
                                        filteredEmployees.map((employee: Employee) => (
                                            <Card
                                                key={employee.id}
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
                                                                <Text
                                                                    color={textPrimary}
                                                                    fontWeight="bold"
                                                                    fontSize="md"
                                                                    cursor="pointer"
                                                                    _hover={{ color: primaryColor, textDecoration: "underline" }}
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        window.open(`/employees/${employee.id}`, '_blank');
                                                                    }}
                                                                >
                                                                    {employee.fName} {employee.lName}
                                                                </Text>
                                                                {employee.position && (
                                                                    <Text color={textSecondary} fontSize="sm">
                                                                        {employee.position}
                                                                    </Text>
                                                                )}
                                                            </VStack>
                                                            <Badge colorScheme={getStatusColor(employee.status || '')}>
                                                                {employee.status || "Unknown"}
                                                            </Badge>
                                                        </HStack>

                                                        {(employee as any).company?.name && (
                                                            <Text color={textSecondary} fontSize="sm">
                                                                <Text as="span" color={textMuted}>Company:</Text> {(employee as any).company.name}
                                                            </Text>
                                                        )}

                                                        {employee.department && (
                                                            <Text color={textMuted} fontSize="sm">
                                                                {employee.department}
                                                            </Text>
                                                        )}
                                                        
                                                        <HStack spacing={4} fontSize="sm">
                                                            {employee.email && (
                                                                <HStack spacing={1}>
                                                                    <EmailIcon color={textMuted} />
                                                                    <Text color={textSecondary} noOfLines={1}>
                                                                        {employee.email}
                                                                    </Text>
                                                                </HStack>
                                                            )}
                                                            {employee.mobileNumber && (
                                                                <HStack spacing={1}>
                                                                    <PhoneIcon color={textMuted} />
                                                                    <Text color={textSecondary}>
                                                                        {employee.mobileNumber}
                                                                    </Text>
                                                                </HStack>
                                                            )}
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
                                                                    onClick={() => navigate(`/employees/${employee.id}`)}
                                                                />
                                                                <IconButton
                                                                    aria-label="Edit"
                                                                    icon={<EditIcon />}
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    color={textPrimary}
                                                                    onClick={() => navigate(`/employees/edit/${employee.id}`)}
                                                                />
                                                                <IconButton
                                                                    aria-label="Delete"
                                                                    icon={<DeleteIcon />}
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    color={errorRed}
                                                                    onClick={() => handleDelete(employee.id, `${employee.fName} ${employee.lName}`)}
                                                                />
                                                            </HStack>
                                                            {employee.employeeNumber && (
                                                                <Text color={textMuted} fontSize="xs">
                                                                    #{employee.employeeNumber}
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
                                                <Th color={textMuted}>Employee</Th>
                                                <Th color={textMuted}>Company</Th>
                                                <Th color={textMuted}>Contact</Th>
                                                <Th color={textMuted}>Department</Th>
                                                <Th color={textMuted}>Position</Th>
                                                <Th color={textMuted}>Status</Th>
                                                <Th color={textMuted}>Start Date</Th>
                                                <Th color={textMuted}>Actions</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {filteredEmployees.length === 0 ? (
                                                <Tr>
                                                    <Td colSpan={8}>
                                                        <Text color={textMuted} textAlign="center" py={8}>
                                                            No employees found
                                                        </Text>
                                                    </Td>
                                                </Tr>
                                            ) : (
                                                filteredEmployees.map((employee: Employee) => (
                                                    <Tr key={employee.id}>
                                                        <Td>
                                                            <VStack align="start" spacing={0}>
                                                                <Text
                                                                    color={textPrimary}
                                                                    fontWeight="medium"
                                                                    cursor="pointer"
                                                                    _hover={{ color: primaryColor, textDecoration: "underline" }}
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        window.open(`/employees/${employee.id}`, '_blank');
                                                                    }}
                                                                >
                                                                    {employee.fName} {employee.lName}
                                                                </Text>
                                                                {employee.employeeNumber && (
                                                                    <Text color={textMuted} fontSize="sm">
                                                                        #{employee.employeeNumber}
                                                                    </Text>
                                                                )}
                                                            </VStack>
                                                        </Td>
                                                        <Td color={textSecondary}>
                                                            {(employee as any).company?.name || "-"}
                                                        </Td>
                                                        <Td>
                                                            <VStack align="start" spacing={0}>
                                                                {employee.email && (
                                                                    <Text color={textSecondary} fontSize="sm">
                                                                        {employee.email}
                                                                    </Text>
                                                                )}
                                                                {employee.mobileNumber && (
                                                                    <Text color={textMuted} fontSize="sm">
                                                                        {employee.mobileNumber}
                                                                    </Text>
                                                                )}
                                                            </VStack>
                                                        </Td>
                                                        <Td color={textSecondary}>
                                                            {employee.department || "-"}
                                                        </Td>
                                                        <Td color={textSecondary}>
                                                            {employee.position || "-"}
                                                        </Td>
                                                        <Td>
                                                            <Badge colorScheme={getStatusColor(employee.status || '')}>
                                                                {employee.status || "Unknown"}
                                                            </Badge>
                                                        </Td>
                                                        <Td color={textSecondary}>
                                                            {formatDate(employee.startDate || '')}
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
                                                                        onClick={() => navigate(`/employees/${employee.id}`)}
                                                                        _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                                                                        color={textPrimary}
                                                                    >
                                                                        View Details
                                                                    </MenuItem>
                                                                    <MenuItem
                                                                        icon={<EditIcon />}
                                                                        onClick={() => navigate(`/employees/edit/${employee.id}`)}
                                                                        _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                                                                        color={textPrimary}
                                                                    >
                                                                        Edit
                                                                    </MenuItem>
                                                                    <MenuItem
                                                                        icon={<DeleteIcon />}
                                                                        onClick={() => handleDelete(employee.id, `${employee.fName} ${employee.lName}`)}
                                                                        _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
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

export default EmployeesList;