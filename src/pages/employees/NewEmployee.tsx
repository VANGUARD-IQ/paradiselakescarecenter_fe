import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
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
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Tag,
    TagLabel,
    TagCloseButton,
    Wrap,
    InputGroup,
    InputLeftAddon,
    useBreakpointValue,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    useColorMode,
} from "@chakra-ui/react";
import { AddIcon, CalendarIcon } from "@chakra-ui/icons";
import { getColor, brandConfig } from "../../brandConfig";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import employeesModuleConfig from "./moduleConfig";
import { Client } from "../../generated/graphql";
import { usePageTitle } from "../../hooks/useDocumentTitle";

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

const GET_COMPANIES = gql`
    query GetCompanies {
        companies {
            id
            name
        }
    }
`;

const GET_EMPLOYEE = gql`
    query GetEmployee($id: String!) {
        employee(id: $id) {
            id
            clientId
            companyId
            employeeNumber
            fName
            lName
            email
            phoneNumber
            mobileNumber
            dateOfBirth
            address {
                street
                city
                state
                postcode
                country
            }
            role
            department
            position
            status
            startDate
            endDate
            contractType
            workingRights
            hourlyRate
            annualSalary
            taxFileNumber
            superannuationFund
            bankAccountName
            bankAccountNumber
            bankBSB
            emergencyContact {
                name
                relationship
                phoneNumber
                email
            }
            qualifications
            certifications
            notes
        }
    }
`;

const CREATE_EMPLOYEE = gql`
    mutation CreateEmployee($input: EmployeeInput!) {
        createEmployee(input: $input) {
            id
            employeeNumber
            fName
            lName
            email
            status
        }
    }
`;

const UPDATE_EMPLOYEE = gql`
    mutation UpdateEmployee($id: String!, $input: EmployeeInput!) {
        updateEmployee(id: $id, input: $input) {
            id
            employeeNumber
            fName
            lName
            email
            status
        }
    }
`;


const NewEmployee: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;

    usePageTitle(isEditMode ? "Edit Employee" : "New Employee");

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
    const errorRed = getColor("status.error", colorMode);

    // Responsive values
    const gridColumns = useBreakpointValue({ base: 1, md: 2 });
    const buttonSize = useBreakpointValue({ base: "sm", md: "md" });

    // Form state - Basic Information
    const [clientId, setClientId] = useState("");
    const [companyId, setCompanyId] = useState("");
    const [employeeNumber, setEmployeeNumber] = useState("");
    const [fName, setFName] = useState("");
    const [lName, setLName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");

    // Address
    const [street, setStreet] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [postcode, setPostcode] = useState("");
    const [country, setCountry] = useState("Australia");

    // Employment Details
    const [role, setRole] = useState("");
    const [department, setDepartment] = useState("");
    const [position, setPosition] = useState("");
    const [status, setStatus] = useState("ACTIVE");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [contractType, setContractType] = useState("");
    const [workingRights, setWorkingRights] = useState("");

    // Compensation
    const [hourlyRate, setHourlyRate] = useState("");
    const [annualSalary, setAnnualSalary] = useState("");

    // Banking & Tax
    const [taxFileNumber, setTaxFileNumber] = useState("");
    const [superannuationFund, setSuperannuationFund] = useState("");
    const [bankAccountName, setBankAccountName] = useState("");
    const [bankAccountNumber, setBankAccountNumber] = useState("");
    const [bankBSB, setBankBSB] = useState("");

    // Emergency Contact
    const [emergencyName, setEmergencyName] = useState("");
    const [emergencyRelationship, setEmergencyRelationship] = useState("");
    const [emergencyPhone, setEmergencyPhone] = useState("");
    const [emergencyEmail, setEmergencyEmail] = useState("");

    // Additional
    const [qualifications, setQualifications] = useState<string[]>([]);
    const [certifications, setCertifications] = useState<string[]>([]);
    const [notes, setNotes] = useState("");
    const [currentQualification, setCurrentQualification] = useState("");
    const [currentCertification, setCurrentCertification] = useState("");

    // Queries and mutations
    const { data: clientsData, loading: clientsLoading } = useQuery(GET_CLIENTS);
    const { data: companiesData, loading: companiesLoading } = useQuery(GET_COMPANIES);

    const { data: employeeData, loading: employeeLoading } = useQuery(GET_EMPLOYEE, {
        variables: { id: id || "" },
        skip: !isEditMode,
    });

    const [createEmployee, { loading: creating }] = useMutation(CREATE_EMPLOYEE, {
        onCompleted: (data) => {
            toast({
                title: "Employee created successfully",
                description: `${data.createEmployee.fName} ${data.createEmployee.lName} has been added`,
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            navigate("/employees");
        },
        onError: (error) => {
            toast({
                title: "Error creating employee",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        },
    });

    const [updateEmployee, { loading: updating }] = useMutation(UPDATE_EMPLOYEE, {
        onCompleted: (data) => {
            toast({
                title: "Employee updated successfully",
                description: `${data.updateEmployee.fName} ${data.updateEmployee.lName} has been updated`,
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            navigate(`/employees/${id}`);
        },
        onError: (error) => {
            toast({
                title: "Error updating employee",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        },
    });

    // Populate form fields when editing
    useEffect(() => {
        if (isEditMode && employeeData?.employee) {
            const emp = employeeData.employee;
            setClientId(emp.clientId || "");
            setCompanyId(emp.companyId || "");
            setEmployeeNumber(emp.employeeNumber || "");
            setFName(emp.fName || "");
            setLName(emp.lName || "");
            setEmail(emp.email || "");
            setPhoneNumber(emp.phoneNumber || "");
            setMobileNumber(emp.mobileNumber || "");
            setDateOfBirth(emp.dateOfBirth || "");

            // Address
            if (emp.address) {
                setStreet(emp.address.street || "");
                setCity(emp.address.city || "");
                setState(emp.address.state || "");
                setPostcode(emp.address.postcode || "");
                setCountry(emp.address.country || "Australia");
            }

            // Employment
            setRole(emp.role || "");
            setDepartment(emp.department || "");
            setPosition(emp.position || "");
            setStatus(emp.status || "ACTIVE");
            setStartDate(emp.startDate || "");
            setEndDate(emp.endDate || "");
            setContractType(emp.contractType || "");
            setWorkingRights(emp.workingRights || "");

            // Compensation
            setHourlyRate(emp.hourlyRate?.toString() || "");
            setAnnualSalary(emp.annualSalary?.toString() || "");

            // Banking & Tax
            setTaxFileNumber(emp.taxFileNumber || "");
            setSuperannuationFund(emp.superannuationFund || "");
            setBankAccountName(emp.bankAccountName || "");
            setBankAccountNumber(emp.bankAccountNumber || "");
            setBankBSB(emp.bankBSB || "");

            // Emergency Contact
            if (emp.emergencyContact) {
                setEmergencyName(emp.emergencyContact.name || "");
                setEmergencyRelationship(emp.emergencyContact.relationship || "");
                setEmergencyPhone(emp.emergencyContact.phoneNumber || "");
                setEmergencyEmail(emp.emergencyContact.email || "");
            }

            // Additional
            setQualifications(emp.qualifications || []);
            setCertifications(emp.certifications || []);
            setNotes(emp.notes || "");
        }
    }, [isEditMode, employeeData]);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!clientId || !companyId || !fName || !lName) {
            toast({
                title: "Missing required fields",
                description: "Please fill in Client, Company, First Name, and Last Name",
                status: "error",
                duration: 3000,
            });
            return;
        }

        const input: any = {
            clientId,
            companyId,
            fName,
            lName,
            status,
        };

        // Add optional fields
        if (employeeNumber) input.employeeNumber = employeeNumber;
        if (email) input.email = email;
        if (phoneNumber) input.phoneNumber = phoneNumber;
        if (mobileNumber) input.mobileNumber = mobileNumber;
        if (dateOfBirth) input.dateOfBirth = new Date(dateOfBirth);
        if (role) input.role = role;
        if (department) input.department = department;
        if (position) input.position = position;
        if (startDate) input.startDate = new Date(startDate);
        if (endDate) input.endDate = new Date(endDate);
        if (contractType) input.contractType = contractType;
        if (workingRights) input.workingRights = workingRights;
        if (hourlyRate) input.hourlyRate = parseFloat(hourlyRate);
        if (annualSalary) input.annualSalary = parseFloat(annualSalary);
        if (taxFileNumber) input.taxFileNumber = taxFileNumber;
        if (superannuationFund) input.superannuationFund = superannuationFund;
        if (bankAccountName) input.bankAccountName = bankAccountName;
        if (bankAccountNumber) input.bankAccountNumber = bankAccountNumber;
        if (bankBSB) input.bankBSB = bankBSB;
        if (notes) input.notes = notes;

        // Address
        if (street || city || state || postcode || country) {
            input.address = {
                street,
                city,
                state,
                postcode,
                country,
            };
        }

        // Emergency contact
        if (emergencyName || emergencyPhone) {
            input.emergencyContact = {
                name: emergencyName,
                relationship: emergencyRelationship,
                phone: emergencyPhone,
                email: emergencyEmail,
            };
        }

        // Arrays
        if (qualifications.length > 0) input.qualifications = qualifications;
        if (certifications.length > 0) input.certifications = certifications;

        if (isEditMode && id) {
            await updateEmployee({ variables: { id, input } });
        } else {
            await createEmployee({ variables: { input } });
        }
    };

    // Add qualification
    const addQualification = () => {
        if (currentQualification.trim()) {
            setQualifications([...qualifications, currentQualification.trim()]);
            setCurrentQualification("");
        }
    };

    // Add certification
    const addCertification = () => {
        if (currentCertification.trim()) {
            setCertifications([...certifications, currentCertification.trim()]);
            setCurrentCertification("");
        }
    };

    return (
        <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={employeesModuleConfig} />

            <Container maxW="container.xl" px={{ base: 4, md: 8 }} py={{ base: 6, md: 8 }} flex="1">
                <VStack spacing={{ base: 4, md: 6 }} align="stretch">
                    <Heading color={textPrimary} fontFamily={brandConfig.fonts.heading} size={{ base: "md", md: "lg" }}>
                        {isEditMode ? `Edit Employee${fName && lName ? `: ${fName} ${lName}` : ''}` : 'New Employee'}
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
                                            Employment
                                        </Tab>
                                        <Tab color={textPrimary} _selected={{ color: primaryColor, borderColor: primaryColor }}>
                                            Banking & Tax
                                        </Tab>
                                        <Tab color={textPrimary} _selected={{ color: primaryColor, borderColor: primaryColor }}>
                                            Emergency & Other
                                        </Tab>
                                    </TabList>

                                    <TabPanels>
                                        {/* Basic Information Tab */}
                                        <TabPanel p={0}>
                                            <VStack spacing={6} align="stretch">
                                                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                                                    <GridItem colSpan={{ base: 1, md: 2 }}>
                                                        <FormControl isRequired>
                                                            <FormLabel color={textPrimary}>Link to Client</FormLabel>
                                                            <Select
                                                                placeholder="Select a client"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                value={clientId}
                                                                onChange={(e) => setClientId(e.target.value)}
                                                                disabled={clientsLoading}
                                                            >
                                                                {clientsData?.clients?.map((client: Client) => (
                                                                    <option key={client.id} value={client.id}>
                                                                        {client.fName} {client.lName} ({client.email})
                                                                    </option>
                                                                ))}
                                                            </Select>
                                                            <FormHelperText color={textMuted}>
                                                                Select the client account this employee belongs to
                                                            </FormHelperText>
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem colSpan={{ base: 1, md: 2 }}>
                                                        <FormControl isRequired>
                                                            <FormLabel color={textPrimary}>Company</FormLabel>
                                                            <Select
                                                                placeholder="Select a company"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                value={companyId}
                                                                onChange={(e) => setCompanyId(e.target.value)}
                                                                disabled={companiesLoading}
                                                            >
                                                                {companiesData?.companies?.map((company: any) => (
                                                                    <option key={company.id} value={company.id}>
                                                                        {company.name}
                                                                    </option>
                                                                ))}
                                                            </Select>
                                                            <FormHelperText color={textMuted}>
                                                                Select the company this employee works for
                                                            </FormHelperText>
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Employee ID</FormLabel>
                                                            <Input
                                                                placeholder="AUTO or custom ID"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                _placeholder={{ color: textMuted }}
                                                                value={employeeNumber}
                                                                onChange={(e) => setEmployeeNumber(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Date of Birth</FormLabel>
                                                            <Input
                                                                type="date"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                value={dateOfBirth}
                                                                onChange={(e) => setDateOfBirth(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl isRequired>
                                                            <FormLabel color={textPrimary}>First Name</FormLabel>
                                                            <Input
                                                                placeholder="Enter first name"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                _placeholder={{ color: textMuted }}
                                                                value={fName}
                                                                onChange={(e) => setFName(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl isRequired>
                                                            <FormLabel color={textPrimary}>Last Name</FormLabel>
                                                            <Input
                                                                placeholder="Enter last name"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                _placeholder={{ color: textMuted }}
                                                                value={lName}
                                                                onChange={(e) => setLName(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Email</FormLabel>
                                                            <Input
                                                                type="email"
                                                                placeholder="employee@example.com"
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
                                                            <FormLabel color={textPrimary}>Mobile Number</FormLabel>
                                                            <Input
                                                                placeholder="0400 000 000"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                _placeholder={{ color: textMuted }}
                                                                value={mobileNumber}
                                                                onChange={(e) => setMobileNumber(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>
                                                </Grid>

                                                <Divider borderColor={cardBorder} />

                                                <Text color={textPrimary} fontSize="lg" fontWeight="bold">
                                                    Address
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
                                                                value={street}
                                                                onChange={(e) => setStreet(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>City/Suburb</FormLabel>
                                                            <Input
                                                                placeholder="Brisbane"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                _placeholder={{ color: textMuted }}
                                                                value={city}
                                                                onChange={(e) => setCity(e.target.value)}
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
                                                                value={state}
                                                                onChange={(e) => setState(e.target.value)}
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
                                                                value={postcode}
                                                                onChange={(e) => setPostcode(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Country</FormLabel>
                                                            <Input
                                                                placeholder="Australia"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                _placeholder={{ color: textMuted }}
                                                                value={country}
                                                                onChange={(e) => setCountry(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>
                                                </Grid>
                                            </VStack>
                                        </TabPanel>

                                        {/* Employment Tab */}
                                        <TabPanel p={0}>
                                            <VStack spacing={6} align="stretch">
                                                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Role</FormLabel>
                                                            <Select
                                                                placeholder="Select role"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                value={role}
                                                                onChange={(e) => setRole(e.target.value)}
                                                            >
                                                                <option value="CARE_WORKER">Care Worker</option>
                                                                <option value="SUPPORT_WORKER">Support Worker</option>
                                                                <option value="NURSE">Nurse (RN)</option>
                                                                <option value="COORDINATOR">Coordinator</option>
                                                                <option value="MANAGER">Manager</option>
                                                                <option value="ADMIN">Admin/Management</option>
                                                                <option value="OTHER">Other</option>
                                                            </Select>
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Department</FormLabel>
                                                            <Select
                                                                placeholder="Select department"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                value={department}
                                                                onChange={(e) => setDepartment(e.target.value)}
                                                            >
                                                                <option value="Director of Care">Director of Care</option>
                                                                <option value="Nursing">Nursing</option>
                                                                <option value="Enrolled Nurse">Enrolled Nurse</option>
                                                                <option value="Care Worker">Care Worker</option>
                                                                <option value="Therapy">Therapy</option>
                                                                <option value="Catering">Catering</option>
                                                                <option value="Cleaning/Laundry">Cleaning/Laundry</option>
                                                                <option value="Maintenance">Maintenance</option>
                                                                <option value="Admin/Management">Admin/Management</option>
                                                            </Select>
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Position Title</FormLabel>
                                                            <Input
                                                                placeholder="e.g., Senior Care Worker"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                _placeholder={{ color: textMuted }}
                                                                value={position}
                                                                onChange={(e) => setPosition(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Employment Status</FormLabel>
                                                            <Select
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                value={status}
                                                                onChange={(e) => setStatus(e.target.value)}
                                                            >
                                                                <option value="ACTIVE">Active</option>
                                                                <option value="INACTIVE">Inactive</option>
                                                                <option value="ON_LEAVE">On Leave</option>
                                                                <option value="TERMINATED">Terminated</option>
                                                            </Select>
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Start Date</FormLabel>
                                                            <Input
                                                                type="date"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                value={startDate}
                                                                onChange={(e) => setStartDate(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>End Date</FormLabel>
                                                            <Input
                                                                type="date"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                value={endDate}
                                                                onChange={(e) => setEndDate(e.target.value)}
                                                            />
                                                            <FormHelperText color={textMuted}>
                                                                Leave blank for ongoing employment
                                                            </FormHelperText>
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Contract Type</FormLabel>
                                                            <Select
                                                                placeholder="Select contract type"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                value={contractType}
                                                                onChange={(e) => setContractType(e.target.value)}
                                                            >
                                                                <option value="Full-time">Full-time</option>
                                                                <option value="Part-time">Part-time</option>
                                                                <option value="Casual">Casual</option>
                                                                <option value="Contract">Contract</option>
                                                                <option value="Temporary">Temporary</option>
                                                            </Select>
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Working Rights</FormLabel>
                                                            <Select
                                                                placeholder="Select working rights"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                value={workingRights}
                                                                onChange={(e) => setWorkingRights(e.target.value)}
                                                            >
                                                                <option value="Citizen">Australian Citizen</option>
                                                                <option value="Permanent Resident">Permanent Resident</option>
                                                                <option value="Work Visa">Work Visa</option>
                                                                <option value="Student Visa">Student Visa</option>
                                                                <option value="Working Holiday">Working Holiday Visa</option>
                                                                <option value="Other">Other</option>
                                                            </Select>
                                                        </FormControl>
                                                    </GridItem>
                                                </Grid>

                                                <Divider borderColor={cardBorder} />

                                                <Text color={textPrimary} fontSize="lg" fontWeight="bold">
                                                    Compensation
                                                </Text>

                                                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Hourly Rate</FormLabel>
                                                            <InputGroup>
                                                                <InputLeftAddon bg="rgba(255, 255, 255, 0.05)" borderColor={cardBorder} color={textMuted}>
                                                                    $
                                                                </InputLeftAddon>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    placeholder="0.00"
                                                                    bg="rgba(255, 255, 255, 0.05)"
                                                                    borderColor={cardBorder}
                                                                    color={textPrimary}
                                                                    _placeholder={{ color: textMuted }}
                                                                    value={hourlyRate}
                                                                    onChange={(e) => setHourlyRate(e.target.value)}
                                                                />
                                                            </InputGroup>
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Annual Salary</FormLabel>
                                                            <InputGroup>
                                                                <InputLeftAddon bg="rgba(255, 255, 255, 0.05)" borderColor={cardBorder} color={textMuted}>
                                                                    $
                                                                </InputLeftAddon>
                                                                <Input
                                                                    type="number"
                                                                    step="1000"
                                                                    placeholder="0"
                                                                    bg="rgba(255, 255, 255, 0.05)"
                                                                    borderColor={cardBorder}
                                                                    color={textPrimary}
                                                                    _placeholder={{ color: textMuted }}
                                                                    value={annualSalary}
                                                                    onChange={(e) => setAnnualSalary(e.target.value)}
                                                                />
                                                            </InputGroup>
                                                        </FormControl>
                                                    </GridItem>
                                                </Grid>
                                            </VStack>
                                        </TabPanel>

                                        {/* Banking & Tax Tab */}
                                        <TabPanel p={0}>
                                            <VStack spacing={6} align="stretch">
                                                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Tax File Number (TFN)</FormLabel>
                                                            <Input
                                                                placeholder="XXX XXX XXX"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                _placeholder={{ color: textMuted }}
                                                                value={taxFileNumber}
                                                                onChange={(e) => setTaxFileNumber(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Superannuation Fund</FormLabel>
                                                            <Input
                                                                placeholder="Fund name"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                _placeholder={{ color: textMuted }}
                                                                value={superannuationFund}
                                                                onChange={(e) => setSuperannuationFund(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>
                                                </Grid>

                                                <Divider borderColor={cardBorder} />

                                                <Text color={textPrimary} fontSize="lg" fontWeight="bold">
                                                    Bank Account Details
                                                </Text>

                                                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                                                    <GridItem colSpan={{ base: 1, md: 2 }}>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Account Name</FormLabel>
                                                            <Input
                                                                placeholder="John Smith"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                _placeholder={{ color: textMuted }}
                                                                value={bankAccountName}
                                                                onChange={(e) => setBankAccountName(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>BSB</FormLabel>
                                                            <Input
                                                                placeholder="XXX-XXX"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                _placeholder={{ color: textMuted }}
                                                                value={bankBSB}
                                                                onChange={(e) => setBankBSB(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Account Number</FormLabel>
                                                            <Input
                                                                placeholder="XXXXXXXXX"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                _placeholder={{ color: textMuted }}
                                                                value={bankAccountNumber}
                                                                onChange={(e) => setBankAccountNumber(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>
                                                </Grid>
                                            </VStack>
                                        </TabPanel>

                                        {/* Emergency Contact & Other Tab */}
                                        <TabPanel p={0}>
                                            <VStack spacing={6} align="stretch">
                                                <Text color={textPrimary} fontSize="lg" fontWeight="bold">
                                                    Emergency Contact
                                                </Text>

                                                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Contact Name</FormLabel>
                                                            <Input
                                                                placeholder="Emergency contact name"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                _placeholder={{ color: textMuted }}
                                                                value={emergencyName}
                                                                onChange={(e) => setEmergencyName(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Relationship</FormLabel>
                                                            <Input
                                                                placeholder="e.g., Spouse, Parent"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                _placeholder={{ color: textMuted }}
                                                                value={emergencyRelationship}
                                                                onChange={(e) => setEmergencyRelationship(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Phone Number</FormLabel>
                                                            <Input
                                                                placeholder="0400 000 000"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                _placeholder={{ color: textMuted }}
                                                                value={emergencyPhone}
                                                                onChange={(e) => setEmergencyPhone(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Email</FormLabel>
                                                            <Input
                                                                type="email"
                                                                placeholder="emergency@example.com"
                                                                bg="rgba(255, 255, 255, 0.05)"
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                                _placeholder={{ color: textMuted }}
                                                                value={emergencyEmail}
                                                                onChange={(e) => setEmergencyEmail(e.target.value)}
                                                            />
                                                        </FormControl>
                                                    </GridItem>
                                                </Grid>

                                                <Divider borderColor={cardBorder} />

                                                <Text color={textPrimary} fontSize="lg" fontWeight="bold">
                                                    Qualifications & Certifications
                                                </Text>

                                                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Qualifications</FormLabel>
                                                            <HStack>
                                                                <Input
                                                                    placeholder="e.g., Bachelor of Nursing"
                                                                    bg="rgba(255, 255, 255, 0.05)"
                                                                    borderColor={cardBorder}
                                                                    color={textPrimary}
                                                                    _placeholder={{ color: textMuted }}
                                                                    value={currentQualification}
                                                                    onChange={(e) => setCurrentQualification(e.target.value)}
                                                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addQualification())}
                                                                />
                                                                <Button
                                                                    onClick={addQualification}
                                                                    size="md"
                                                                    bg={primaryColor}
                                                                    color="white"
                                                                    _hover={{ bg: primaryHover }}
                                                                >
                                                                    Add
                                                                </Button>
                                                            </HStack>
                                                            <Wrap mt={2}>
                                                                {qualifications.map((qual, index) => (
                                                                    <Tag key={index} size="md" borderRadius="full" variant="solid" colorScheme="purple">
                                                                        <TagLabel>{qual}</TagLabel>
                                                                        <TagCloseButton onClick={() => setQualifications(qualifications.filter((_, i) => i !== index))} />
                                                                    </Tag>
                                                                ))}
                                                            </Wrap>
                                                        </FormControl>
                                                    </GridItem>

                                                    <GridItem>
                                                        <FormControl>
                                                            <FormLabel color={textPrimary}>Certifications</FormLabel>
                                                            <HStack>
                                                                <Input
                                                                    placeholder="e.g., First Aid Certificate"
                                                                    bg="rgba(255, 255, 255, 0.05)"
                                                                    borderColor={cardBorder}
                                                                    color={textPrimary}
                                                                    _placeholder={{ color: textMuted }}
                                                                    value={currentCertification}
                                                                    onChange={(e) => setCurrentCertification(e.target.value)}
                                                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                                                                />
                                                                <Button
                                                                    onClick={addCertification}
                                                                    size="md"
                                                                    bg={primaryColor}
                                                                    color="white"
                                                                    _hover={{ bg: primaryHover }}
                                                                >
                                                                    Add
                                                                </Button>
                                                            </HStack>
                                                            <Wrap mt={2}>
                                                                {certifications.map((cert, index) => (
                                                                    <Tag key={index} size="md" borderRadius="full" variant="solid" colorScheme="green">
                                                                        <TagLabel>{cert}</TagLabel>
                                                                        <TagCloseButton onClick={() => setCertifications(certifications.filter((_, i) => i !== index))} />
                                                                    </Tag>
                                                                ))}
                                                            </Wrap>
                                                        </FormControl>
                                                    </GridItem>
                                                </Grid>

                                                <FormControl>
                                                    <FormLabel color={textPrimary}>Notes</FormLabel>
                                                    <Textarea
                                                        placeholder="Additional notes about the employee..."
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
                                <HStack spacing={4} justify={{ base: "center", md: "flex-end" }} wrap="wrap">
                                    <Button
                                        variant="outline"
                                        borderColor={cardBorder}
                                        color={textPrimary}
                                        onClick={() => navigate("/employees")}
                                        size={buttonSize}
                                        width={{ base: "100%", md: "auto" }}
                                        minW={{ md: "100px" }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        bg={primaryColor}
                                        color="white"
                                        _hover={{ bg: primaryHover }}
                                        isLoading={creating || updating || employeeLoading}
                                        loadingText={isEditMode ? "Updating..." : "Creating..."}
                                        leftIcon={<AddIcon />}
                                        size={buttonSize}
                                        width={{ base: "100%", md: "auto" }}
                                        minW={{ md: "150px" }}
                                    >
                                        {isEditMode ? 'Update Employee' : 'Create Employee'}
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

export default NewEmployee;