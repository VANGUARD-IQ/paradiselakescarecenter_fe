import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
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
    useColorMode,
} from "@chakra-ui/react";
import {
    EditIcon,
    DeleteIcon,
    ArrowBackIcon,
    EmailIcon,
    PhoneIcon,
    CalendarIcon,
} from "@chakra-ui/icons";
import { getColor, brandConfig } from "../../brandConfig";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import employeesModuleConfig from "./moduleConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";

const GET_EMPLOYEE = gql`
    query GetEmployee($id: ID!) {
        employee(id: $id) {
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
            endDate
            hourlyRate
            annualSalary
            address {
                street
                city
                state
                postcode
                country
            }
            dateOfBirth
            taxFileNumber
            superannuationFund
            bankAccountName
            bankAccountNumber
            bankBSB
            emergencyContact {
                name
                relationship
                phone
                email
            }
            qualifications
            certifications
            notes
            contractType
            workingRights
            createdAt
            updatedAt
        }
    }
`;

const DELETE_EMPLOYEE = gql`
    mutation DeleteEmployee($id: ID!) {
        deleteEmployee(id: $id)
    }
`;

const EmployeeDetails: React.FC = () => {
    usePageTitle("Employee Details");

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
    const { data, loading, error } = useQuery(GET_EMPLOYEE, {
        variables: { id },
        skip: !id,
    });

    const [deleteEmployee] = useMutation(DELETE_EMPLOYEE, {
        onCompleted: () => {
            toast({
                title: "Employee deleted",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            navigate("/employees");
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

    const employee = data?.employee;

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

    // Calculate employment duration
    const calculateDuration = () => {
        if (!employee?.startDate) return "-";
        const start = new Date(employee.startDate);
        const end = employee.endDate ? new Date(employee.endDate) : new Date();
        const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        if (years > 0) {
            return `${years} year${years > 1 ? 's' : ''}${remainingMonths > 0 ? `, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`;
        }
        return `${months} month${months !== 1 ? 's' : ''}`;
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

    // Handle delete
    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${employee?.fName} ${employee?.lName}?`)) {
            await deleteEmployee({ variables: { id } });
        }
    };

    if (loading) {
        return (
            <Box bg={bgMain} minH="100vh">
                <NavbarWithCallToAction />
                <ModuleBreadcrumb moduleConfig={employeesModuleConfig} />
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

    if (error || !employee) {
        return (
            <Box bg={bgMain} minH="100vh">
                <NavbarWithCallToAction />
                <ModuleBreadcrumb moduleConfig={employeesModuleConfig} />
                <Container maxW="container.xl" py={8}>
                    <Text color={errorRed}>
                        {error ? `Error: ${error.message}` : "Employee not found"}
                    </Text>
                </Container>
                <FooterWithFourColumns />
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
                        <HStack>
                            <IconButton
                                aria-label="Back"
                                icon={<ArrowBackIcon />}
                                variant="ghost"
                                color={textPrimary}
                                onClick={() => navigate("/employees")}
                                size={buttonSize}
                            />
                            <VStack align="start" spacing={0}>
                                <Heading color={textPrimary} fontFamily={brandConfig.fonts.heading} size={{ base: "md", md: "lg" }}>
                                    {employee.fName} {employee.lName}
                                </Heading>
                                {employee.position && (
                                    <Text color={textSecondary} fontSize={{ base: "sm", md: "md" }}>
                                        {employee.position}
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
                                onClick={() => navigate(`/employees/edit/${id}`)}
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
                    <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={{ base: 3, md: 4 }}>
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
                                    <Badge colorScheme={getStatusColor(employee.status)} fontSize={{ base: "sm", md: "md" }} mt={1}>
                                        {employee.status || "Unknown"}
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
                                    <StatLabel color={textMuted} fontSize={{ base: "xs", md: "sm" }}>Employee #</StatLabel>
                                    <StatNumber color={textPrimary} fontSize={{ base: "md", md: "lg" }}>
                                        {employee.employeeNumber || "N/A"}
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
                                    <StatLabel color={textMuted} fontSize={{ base: "xs", md: "sm" }}>Department</StatLabel>
                                    <StatNumber color={textPrimary} fontSize={{ base: "md", md: "lg" }}>
                                        {employee.department || "N/A"}
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
                                    <StatLabel color={textMuted} fontSize={{ base: "xs", md: "sm" }}>Duration</StatLabel>
                                    <StatNumber color={textPrimary} fontSize={{ base: "md", md: "lg" }}>
                                        {calculateDuration()}
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
                                        Personal
                                    </Tab>
                                    <Tab color={textPrimary} _selected={{ color: primaryColor, borderColor: primaryColor }} fontSize={{ base: "sm", md: "md" }}>
                                        Employment
                                    </Tab>
                                    <Tab color={textPrimary} _selected={{ color: primaryColor, borderColor: primaryColor }} fontSize={{ base: "sm", md: "md" }}>
                                        Financial
                                    </Tab>
                                    <Tab color={textPrimary} _selected={{ color: primaryColor, borderColor: primaryColor }} fontSize={{ base: "sm", md: "md" }}>
                                        Other
                                    </Tab>
                                </TabList>

                                <TabPanels>
                                    {/* Personal Information */}
                                    <TabPanel>
                                        <VStack spacing={6} align="stretch">
                                            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={{ base: 4, md: 6 }}>
                                                <GridItem>
                                                    <Text color={textMuted} fontSize="sm" mb={1}>Full Name</Text>
                                                    <Text color={textPrimary} fontSize={{ base: "md", md: "lg" }}>
                                                        {employee.fName} {employee.lName}
                                                    </Text>
                                                </GridItem>
                                                <GridItem>
                                                    <Text color={textMuted} fontSize="sm" mb={1}>Date of Birth</Text>
                                                    <Text color={textPrimary} fontSize={{ base: "md", md: "lg" }}>
                                                        {formatDate(employee.dateOfBirth)}
                                                    </Text>
                                                </GridItem>
                                                <GridItem>
                                                    <Text color={textMuted} fontSize="sm" mb={1}>Email</Text>
                                                    <HStack>
                                                        <EmailIcon color={textMuted} boxSize={{ base: 3, md: 4 }} />
                                                        <Text color={textPrimary} fontSize={{ base: "md", md: "lg" }}>
                                                            {employee.email || "-"}
                                                        </Text>
                                                    </HStack>
                                                </GridItem>
                                                <GridItem>
                                                    <Text color={textMuted} fontSize="sm" mb={1}>Mobile</Text>
                                                    <HStack>
                                                        <PhoneIcon color={textMuted} boxSize={{ base: 3, md: 4 }} />
                                                        <Text color={textPrimary} fontSize={{ base: "md", md: "lg" }}>
                                                            {employee.mobileNumber || "-"}
                                                        </Text>
                                                    </HStack>
                                                </GridItem>
                                            </Grid>

                                            {employee.address && (employee.address.street || employee.address.city) && (
                                                <>
                                                    <Divider borderColor={cardBorder} />
                                                    <Box>
                                                        <Text color={textMuted} fontSize="sm" mb={2}>Address</Text>
                                                        <Text color={textPrimary}>
                                                            {employee.address.street && `${employee.address.street}, `}
                                                            {employee.address.city && `${employee.address.city}, `}
                                                            {employee.address.state && `${employee.address.state} `}
                                                            {employee.address.postcode}
                                                        </Text>
                                                        {employee.address.country && (
                                                            <Text color={textSecondary} fontSize="sm">
                                                                {employee.address.country}
                                                            </Text>
                                                        )}
                                                    </Box>
                                                </>
                                            )}

                                            {employee.emergencyContact && employee.emergencyContact.name && (
                                                <>
                                                    <Divider borderColor={cardBorder} />
                                                    <Box>
                                                        <Text color={textMuted} fontSize="sm" mb={2}>Emergency Contact</Text>
                                                        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3}>
                                                            <GridItem>
                                                                <Text color={textPrimary}>
                                                                    {employee.emergencyContact.name}
                                                                </Text>
                                                                {employee.emergencyContact.relationship && (
                                                                    <Text color={textSecondary} fontSize="sm">
                                                                        {employee.emergencyContact.relationship}
                                                                    </Text>
                                                                )}
                                                            </GridItem>
                                                            <GridItem>
                                                                {employee.emergencyContact.phone && (
                                                                    <HStack>
                                                                        <PhoneIcon color={textMuted} boxSize={3} />
                                                                        <Text color={textSecondary} fontSize="sm">
                                                                            {employee.emergencyContact.phone}
                                                                        </Text>
                                                                    </HStack>
                                                                )}
                                                                {employee.emergencyContact.email && (
                                                                    <HStack>
                                                                        <EmailIcon color={textMuted} boxSize={3} />
                                                                        <Text color={textSecondary} fontSize="sm">
                                                                            {employee.emergencyContact.email}
                                                                        </Text>
                                                                    </HStack>
                                                                )}
                                                            </GridItem>
                                                        </Grid>
                                                    </Box>
                                                </>
                                            )}
                                        </VStack>
                                    </TabPanel>

                                    {/* Employment Information */}
                                    <TabPanel>
                                        <VStack spacing={6} align="stretch">
                                            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={{ base: 4, md: 6 }}>
                                                <GridItem>
                                                    <Text color={textMuted} fontSize="sm" mb={1}>Role</Text>
                                                    <Text color={textPrimary} fontSize={{ base: "md", md: "lg" }}>
                                                        {employee.role?.replace(/_/g, ' ') || "-"}
                                                    </Text>
                                                </GridItem>
                                                <GridItem>
                                                    <Text color={textMuted} fontSize="sm" mb={1}>Department</Text>
                                                    <Text color={textPrimary} fontSize={{ base: "md", md: "lg" }}>
                                                        {employee.department || "-"}
                                                    </Text>
                                                </GridItem>
                                                <GridItem>
                                                    <Text color={textMuted} fontSize="sm" mb={1}>Position</Text>
                                                    <Text color={textPrimary} fontSize={{ base: "md", md: "lg" }}>
                                                        {employee.position || "-"}
                                                    </Text>
                                                </GridItem>
                                                <GridItem>
                                                    <Text color={textMuted} fontSize="sm" mb={1}>Contract Type</Text>
                                                    <Text color={textPrimary} fontSize={{ base: "md", md: "lg" }}>
                                                        {employee.contractType || "-"}
                                                    </Text>
                                                </GridItem>
                                                <GridItem>
                                                    <Text color={textMuted} fontSize="sm" mb={1}>Start Date</Text>
                                                    <HStack>
                                                        <CalendarIcon color={textMuted} boxSize={{ base: 3, md: 4 }} />
                                                        <Text color={textPrimary} fontSize={{ base: "md", md: "lg" }}>
                                                            {formatDate(employee.startDate)}
                                                        </Text>
                                                    </HStack>
                                                </GridItem>
                                                <GridItem>
                                                    <Text color={textMuted} fontSize="sm" mb={1}>End Date</Text>
                                                    <Text color={textPrimary} fontSize={{ base: "md", md: "lg" }}>
                                                        {employee.endDate ? formatDate(employee.endDate) : "Ongoing"}
                                                    </Text>
                                                </GridItem>
                                                <GridItem>
                                                    <Text color={textMuted} fontSize="sm" mb={1}>Working Rights</Text>
                                                    <Text color={textPrimary} fontSize={{ base: "md", md: "lg" }}>
                                                        {employee.workingRights || "-"}
                                                    </Text>
                                                </GridItem>
                                                <GridItem>
                                                    <Text color={textMuted} fontSize="sm" mb={1}>Employment Duration</Text>
                                                    <Text color={textPrimary} fontSize={{ base: "md", md: "lg" }}>
                                                        {calculateDuration()}
                                                    </Text>
                                                </GridItem>
                                            </Grid>
                                        </VStack>
                                    </TabPanel>

                                    {/* Financial Information */}
                                    <TabPanel>
                                        <VStack spacing={6} align="stretch">
                                            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={{ base: 4, md: 6 }}>
                                                <GridItem>
                                                    <Text color={textMuted} fontSize="sm" mb={1}>Hourly Rate</Text>
                                                    <Text color={textPrimary} fontSize={{ base: "md", md: "lg" }}>
                                                        {formatCurrency(employee.hourlyRate)}
                                                    </Text>
                                                </GridItem>
                                                <GridItem>
                                                    <Text color={textMuted} fontSize="sm" mb={1}>Annual Salary</Text>
                                                    <Text color={textPrimary} fontSize={{ base: "md", md: "lg" }}>
                                                        {formatCurrency(employee.annualSalary)}
                                                    </Text>
                                                </GridItem>
                                                <GridItem>
                                                    <Text color={textMuted} fontSize="sm" mb={1}>Tax File Number</Text>
                                                    <Text color={textPrimary} fontSize={{ base: "md", md: "lg" }}>
                                                        {employee.taxFileNumber ? "***-***-" + employee.taxFileNumber.slice(-3) : "-"}
                                                    </Text>
                                                </GridItem>
                                                <GridItem>
                                                    <Text color={textMuted} fontSize="sm" mb={1}>Superannuation Fund</Text>
                                                    <Text color={textPrimary} fontSize={{ base: "md", md: "lg" }}>
                                                        {employee.superannuationFund || "-"}
                                                    </Text>
                                                </GridItem>
                                            </Grid>

                                            {(employee.bankAccountName || employee.bankBSB || employee.bankAccountNumber) && (
                                                <>
                                                    <Divider borderColor={cardBorder} />
                                                    <Box>
                                                        <Text color={textMuted} fontSize="sm" mb={2}>Bank Account Details</Text>
                                                        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={3}>
                                                            <GridItem>
                                                                <Text color={textSecondary} fontSize="xs">Account Name</Text>
                                                                <Text color={textPrimary}>
                                                                    {employee.bankAccountName || "-"}
                                                                </Text>
                                                            </GridItem>
                                                            <GridItem>
                                                                <Text color={textSecondary} fontSize="xs">BSB</Text>
                                                                <Text color={textPrimary}>
                                                                    {employee.bankBSB || "-"}
                                                                </Text>
                                                            </GridItem>
                                                            <GridItem>
                                                                <Text color={textSecondary} fontSize="xs">Account Number</Text>
                                                                <Text color={textPrimary}>
                                                                    {employee.bankAccountNumber ? "****" + employee.bankAccountNumber.slice(-4) : "-"}
                                                                </Text>
                                                            </GridItem>
                                                        </Grid>
                                                    </Box>
                                                </>
                                            )}
                                        </VStack>
                                    </TabPanel>

                                    {/* Other Information */}
                                    <TabPanel>
                                        <VStack spacing={6} align="stretch">
                                            {employee.qualifications && employee.qualifications.length > 0 && (
                                                <Box>
                                                    <Text color={textMuted} fontSize="sm" mb={2}>Qualifications</Text>
                                                    <Wrap>
                                                        {employee.qualifications.map((qual: string, index: number) => (
                                                            <WrapItem key={index}>
                                                                <Tag size="md" variant="solid" colorScheme="purple">
                                                                    {qual}
                                                                </Tag>
                                                            </WrapItem>
                                                        ))}
                                                    </Wrap>
                                                </Box>
                                            )}

                                            {employee.certifications && employee.certifications.length > 0 && (
                                                <Box>
                                                    <Text color={textMuted} fontSize="sm" mb={2}>Certifications</Text>
                                                    <Wrap>
                                                        {employee.certifications.map((cert: string, index: number) => (
                                                            <WrapItem key={index}>
                                                                <Tag size="md" variant="solid" colorScheme="green">
                                                                    {cert}
                                                                </Tag>
                                                            </WrapItem>
                                                        ))}
                                                    </Wrap>
                                                </Box>
                                            )}

                                            {employee.notes && (
                                                <Box>
                                                    <Text color={textMuted} fontSize="sm" mb={2}>Notes</Text>
                                                    <Text color={textPrimary} whiteSpace="pre-wrap">
                                                        {employee.notes}
                                                    </Text>
                                                </Box>
                                            )}

                                            <Divider borderColor={cardBorder} />

                                            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3}>
                                                <GridItem>
                                                    <Text color={textMuted} fontSize="sm">Created</Text>
                                                    <Text color={textSecondary}>
                                                        {formatDate(employee.createdAt)}
                                                    </Text>
                                                </GridItem>
                                                <GridItem>
                                                    <Text color={textMuted} fontSize="sm">Last Updated</Text>
                                                    <Text color={textSecondary}>
                                                        {formatDate(employee.updatedAt)}
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

export default EmployeeDetails;