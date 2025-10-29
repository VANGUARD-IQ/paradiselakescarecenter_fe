import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Heading,
    FormControl,
    FormLabel,
    Input,
    Button,
    VStack,
    HStack,
    Textarea,
    useToast,
    Text,
    Badge,
    Spinner,
    Divider,
    Card,
    CardBody,
    Center,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    IconButton,
    Switch,
    Progress
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, gql } from '@apollo/client';
import { FiArrowLeft, FiPlus, FiTrash2, FiPackage, FiDollarSign, FiClock } from 'react-icons/fi';
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { getColor, brandConfig } from "../../brandConfig";
import { ProjectTask } from "../../generated/graphql";

const GET_EMAIL = gql`
    query GetEmail($id: ID!) {
        email(id: $id) {
            id
            subject
            bodyMarkdown
            from
            to
        }
    }
`;

const SCAN_EMAIL_FOR_PROJECT = gql`
    mutation ScanEmailAndGenerateProjectProposal(
        $emailContent: String!
        $emailSubject: String
        $senderName: String
        $senderEmail: String
    ) {
        scanEmailAndGenerateProjectProposal(
            emailContent: $emailContent
            emailSubject: $emailSubject
            senderName: $senderName
            senderEmail: $senderEmail
        ) {
            projectName
            projectSummary
            clientName
            clientEmail
            clientPhone
            tasks {
                title
                description
                estimatedHours
                order
                category
            }
            suggestedPrice
            upfrontPayment
            finalPayment
            deliveryTimeline
            deliverables
            specialRequirements
            sourceEmailId
        }
    }
`;

const CREATE_PROJECT = gql`
    mutation CreateProject($input: ProjectInput!) {
        createProject(input: $input) {
            id
            name
            description
            status
            budget
        }
    }
`;

const CREATE_TASKS = gql`
    mutation CreateTask($input: TaskInput!) {
        createTask(input: $input) {
            id
            name
            description
            status
        }
    }
`;

const CREATE_BILL = gql`
    mutation CreateBill($input: BillInput!) {
        createBill(input: $input) {
            id
            status
            totalAmount
            projectId
        }
    }
`;

interface ProjectProposal {
    projectName: string;
    projectSummary: string;
    clientName: string;
    clientEmail?: string;
    clientPhone?: string;
    tasks: ProjectTask[];
    suggestedPrice: number;
    upfrontPayment: number;
    finalPayment: number;
    deliveryTimeline: string;
    deliverables: string[];
    specialRequirements?: string;
}

const ConvertToProject: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();
    
    const [proposal, setProposal] = useState<ProjectProposal | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [createInvoice, setCreateInvoice] = useState(true);

    // Styling
    const bg = getColor('background');
    const textPrimary = getColor('textPrimary');
    const textSecondary = getColor('textSecondary');
    const cardBg = getColor('cardBackground');
    const cardBorder = getColor('cardBorder');

    // Get email data
    const { data: emailData, loading: emailLoading } = useQuery(GET_EMAIL, {
        variables: { id }
    });

    const [scanEmail] = useMutation(SCAN_EMAIL_FOR_PROJECT);
    const [createProject] = useMutation(CREATE_PROJECT);
    const [createTask] = useMutation(CREATE_TASKS);
    const [createBill] = useMutation(CREATE_BILL);

    useEffect(() => {
        if (emailData?.email && !isAnalyzing && !proposal) {
            analyzeEmail();
        }
    }, [emailData]);

    const analyzeEmail = async () => {
        if (!emailData?.email) return;
        
        setIsAnalyzing(true);
        try {
            const result = await scanEmail({
                variables: {
                    emailContent: emailData.email.bodyMarkdown || '',
                    emailSubject: emailData.email.subject || '',
                    senderName: emailData.email.from?.split('<')[0].trim() || '',
                    senderEmail: emailData.email.from?.match(/<(.+)>/)?.[1] || emailData.email.from || ''
                }
            });

            if (result.data?.scanEmailAndGenerateProjectProposal) {
                setProposal(result.data.scanEmailAndGenerateProjectProposal);
                setEditMode(true);
                toast({
                    title: 'Email analyzed successfully',
                    description: 'Review and adjust the project proposal',
                    status: 'success',
                    duration: 3000
                });
            }
        } catch (error) {
            console.error('Failed to analyze email:', error);
            toast({
                title: 'Analysis failed',
                description: 'Could not analyze email. Please fill in details manually.',
                status: 'error',
                duration: 5000
            });
            // Set default proposal
            setProposal({
                projectName: emailData.email.subject || 'New Project',
                projectSummary: '',
                clientName: '',
                clientEmail: '',
                clientPhone: '',
                tasks: [],
                suggestedPrice: 0,
                upfrontPayment: 0,
                finalPayment: 0,
                deliveryTimeline: '2 weeks',
                deliverables: [],
                specialRequirements: ''
            });
            setEditMode(true);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleCreateProject = async () => {
        if (!proposal) return;

        try {
            // Create the project with proposal fields
            const projectResult = await createProject({
                variables: {
                    input: {
                        projectName: proposal.projectName,
                        projectGoal: proposal.projectSummary,
                        projectDescription: proposal.specialRequirements || '',
                        billingClient: '', // This needs to be set to an actual client ID
                        // Proposal fields
                        clientEmail: proposal.clientEmail,
                        clientPhone: proposal.clientPhone,
                        suggestedPrice: proposal.suggestedPrice,
                        upfrontPayment: proposal.upfrontPayment,
                        finalPayment: proposal.finalPayment,
                        deliveryTimeline: proposal.deliveryTimeline,
                        deliverables: proposal.deliverables,
                        specialRequirements: proposal.specialRequirements,
                        sourceEmailId: id, // Link back to the source email
                        proposalStatus: 'draft'
                    }
                }
            });

            const projectId = projectResult.data?.createProject?.id;

            if (projectId) {
                // Create tasks for the project
                for (const task of proposal.tasks) {
                    await createTask({
                        variables: {
                            input: {
                                projectId,
                                name: task.title,
                                description: task.description,
                                estimatedHours: task.estimatedHours,
                                order: task.order,
                                category: task.category,
                                status: 'TODO'
                            }
                        }
                    });
                }

                // Create a draft invoice if requested
                if (createInvoice && proposal.suggestedPrice > 0) {
                    try {
                        const billResult = await createBill({
                            variables: {
                                input: {
                                    projectId,
                                    isPaid: false,
                                    status: 'DRAFT',
                                    currency: 'AUD',
                                    showPaymentDetails: false, // Hide payment details initially
                                    lineItems: [
                                        {
                                            description: `${proposal.projectName} - Complete Project`,
                                            amount: proposal.suggestedPrice
                                        }
                                    ],
                                    paymentTerms: `Total project value. 50% upfront ($${proposal.upfrontPayment}), 50% on completion ($${proposal.finalPayment})`
                                }
                            }
                        });

                        const draftBillId = billResult.data?.createBill?.id;
                        
                        toast({
                            title: 'Project & Draft Invoice Created',
                            description: `Created project with ${proposal.tasks.length} tasks and draft invoice for $${proposal.suggestedPrice}`,
                            status: 'success',
                            duration: 5000
                        });
                    } catch (billError) {
                        console.error('Failed to create draft invoice:', billError);
                        toast({
                            title: 'Project created (invoice failed)',
                            description: 'Project created but draft invoice creation failed',
                            status: 'warning',
                            duration: 5000
                        });
                    }
                } else {
                    toast({
                        title: 'Project created successfully',
                        description: `Created project with ${proposal.tasks.length} tasks`,
                        status: 'success',
                        duration: 5000
                    });
                }

                // Navigate to the project page
                navigate(`/projects/${projectId}`);
            }
        } catch (error) {
            console.error('Failed to create project:', error);
            toast({
                title: 'Failed to create project',
                description: 'Please try again',
                status: 'error',
                duration: 5000
            });
        }
    };

    const addTask = () => {
        if (!proposal) return;
        const newTask: ProjectTask = {
            title: 'New Task',
            description: '',
            estimatedHours: 1,
            order: proposal.tasks.length + 1,
            category: 'Development'
        };
        setProposal({
            ...proposal,
            tasks: [...proposal.tasks, newTask]
        });
    };

    const removeTask = (index: number) => {
        if (!proposal) return;
        setProposal({
            ...proposal,
            tasks: proposal.tasks.filter((_, i) => i !== index)
        });
    };

    const updateTask = (index: number, field: keyof ProjectTask, value: any) => {
        if (!proposal) return;
        const updatedTasks = [...proposal.tasks];
        updatedTasks[index] = {
            ...updatedTasks[index],
            [field]: value
        };
        setProposal({
            ...proposal,
            tasks: updatedTasks
        });
    };

    if (emailLoading || isAnalyzing) {
        return (
            <Box minH="100vh" bg={bg} display="flex" flexDirection="column">
                <NavbarWithCallToAction />
                <Container maxW="container.xl" py={8} flex="1">
                    <Center py={20}>
                        <VStack spacing={4}>
                            <Spinner size="xl" color={getColor("primaryBlue")} />
                            <Text color={textSecondary}>
                                {isAnalyzing ? 'Analyzing email content...' : 'Loading email...'}
                            </Text>
                            {isAnalyzing && (
                                <Progress 
                                    size="xs" 
                                    isIndeterminate 
                                    colorScheme="blue" 
                                    width="200px"
                                />
                            )}
                        </VStack>
                    </Center>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    return (
        <Box minH="100vh" bg={bg} display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <Container maxW="container.xl" py={8} flex="1">
                <VStack spacing={6} align="stretch">
                    <HStack justify="space-between">
                        <HStack>
                            <Button
                                leftIcon={<FiArrowLeft />}
                                variant="outline"
                                borderColor={cardBorder}
                                color={textPrimary}
                                onClick={() => navigate(`/emails/${id}`)}
                            >
                                Back to Email
                            </Button>
                            <Heading size="lg" color={textPrimary}>
                                Convert Email to Project
                            </Heading>
                        </HStack>
                        <Button
                            leftIcon={<FiPackage />}
                            colorScheme="green"
                            onClick={handleCreateProject}
                            isDisabled={!proposal || !proposal.projectName}
                        >
                            Create Project
                        </Button>
                    </HStack>

                    {proposal && (
                        <Card bg={cardBg} borderColor={cardBorder} variant="outline">
                            <CardBody>
                                <VStack spacing={6} align="stretch">
                                    {/* Project Details */}
                                    <Box>
                                        <Heading size="md" mb={4} color={textPrimary}>
                                            Project Information
                                        </Heading>
                                        <VStack spacing={4}>
                                            <FormControl>
                                                <FormLabel color={textSecondary}>Project Name</FormLabel>
                                                <Input
                                                    value={proposal.projectName}
                                                    onChange={(e) => setProposal({ ...proposal, projectName: e.target.value })}
                                                    isReadOnly={!editMode}
                                                    bg={bg}
                                                    borderColor={cardBorder}
                                                    color={textPrimary}
                                                />
                                            </FormControl>
                                            <FormControl>
                                                <FormLabel color={textSecondary}>Project Summary</FormLabel>
                                                <Textarea
                                                    value={proposal.projectSummary}
                                                    onChange={(e) => setProposal({ ...proposal, projectSummary: e.target.value })}
                                                    isReadOnly={!editMode}
                                                    bg={bg}
                                                    borderColor={cardBorder}
                                                    color={textPrimary}
                                                    rows={4}
                                                />
                                            </FormControl>
                                            <HStack width="100%" spacing={4}>
                                                <FormControl>
                                                    <FormLabel color={textSecondary}>Client Name</FormLabel>
                                                    <Input
                                                        value={proposal.clientName}
                                                        onChange={(e) => setProposal({ ...proposal, clientName: e.target.value })}
                                                        isReadOnly={!editMode}
                                                        bg={bg}
                                                        borderColor={cardBorder}
                                                        color={textPrimary}
                                                    />
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel color={textSecondary}>Client Email</FormLabel>
                                                    <Input
                                                        value={proposal.clientEmail || ''}
                                                        onChange={(e) => setProposal({ ...proposal, clientEmail: e.target.value })}
                                                        isReadOnly={!editMode}
                                                        bg={bg}
                                                        borderColor={cardBorder}
                                                        color={textPrimary}
                                                    />
                                                </FormControl>
                                            </HStack>
                                        </VStack>
                                    </Box>

                                    <Divider />

                                    {/* Tasks */}
                                    <Box>
                                        <HStack justify="space-between" mb={4}>
                                            <Heading size="md" color={textPrimary}>
                                                Project Tasks
                                            </Heading>
                                            <Button
                                                size="sm"
                                                leftIcon={<FiPlus />}
                                                variant="outline"
                                                onClick={addTask}
                                                isDisabled={!editMode}
                                            >
                                                Add Task
                                            </Button>
                                        </HStack>
                                        <Table variant="simple">
                                            <Thead>
                                                <Tr>
                                                    <Th color={textSecondary}>Task</Th>
                                                    <Th color={textSecondary}>Description</Th>
                                                    <Th color={textSecondary} isNumeric>Hours</Th>
                                                    <Th color={textSecondary}>Category</Th>
                                                    <Th></Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {proposal.tasks.map((task, index) => (
                                                    <Tr key={index}>
                                                        <Td>
                                                            <Input
                                                                value={task.title}
                                                                onChange={(e) => updateTask(index, 'title', e.target.value)}
                                                                isReadOnly={!editMode}
                                                                size="sm"
                                                                bg={bg}
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                            />
                                                        </Td>
                                                        <Td>
                                                            <Input
                                                                value={task.description}
                                                                onChange={(e) => updateTask(index, 'description', e.target.value)}
                                                                isReadOnly={!editMode}
                                                                size="sm"
                                                                bg={bg}
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                            />
                                                        </Td>
                                                        <Td>
                                                            <NumberInput
                                                                value={task.estimatedHours}
                                                                onChange={(_, value) => updateTask(index, 'estimatedHours', value)}
                                                                min={0.5}
                                                                step={0.5}
                                                                size="sm"
                                                                isReadOnly={!editMode}
                                                            >
                                                                <NumberInputField 
                                                                    bg={bg}
                                                                    borderColor={cardBorder}
                                                                    color={textPrimary}
                                                                />
                                                                <NumberInputStepper>
                                                                    <NumberIncrementStepper />
                                                                    <NumberDecrementStepper />
                                                                </NumberInputStepper>
                                                            </NumberInput>
                                                        </Td>
                                                        <Td>
                                                            <Input
                                                                value={task.category || ""}
                                                                onChange={(e) => updateTask(index, 'category', e.target.value)}
                                                                isReadOnly={!editMode}
                                                                size="sm"
                                                                bg={bg}
                                                                borderColor={cardBorder}
                                                                color={textPrimary}
                                                            />
                                                        </Td>
                                                        <Td>
                                                            <IconButton
                                                                aria-label="Remove task"
                                                                icon={<FiTrash2 />}
                                                                size="sm"
                                                                variant="ghost"
                                                                colorScheme="red"
                                                                onClick={() => removeTask(index)}
                                                                isDisabled={!editMode}
                                                            />
                                                        </Td>
                                                    </Tr>
                                                ))}
                                            </Tbody>
                                        </Table>
                                    </Box>

                                    <Divider />

                                    {/* Pricing */}
                                    <Box>
                                        <Heading size="md" mb={4} color={textPrimary}>
                                            Pricing & Timeline
                                        </Heading>
                                        <VStack spacing={4}>
                                            <HStack width="100%" spacing={4}>
                                                <FormControl>
                                                    <FormLabel color={textSecondary}>
                                                        <FiDollarSign style={{ display: 'inline' }} /> Total Price
                                                    </FormLabel>
                                                    <NumberInput
                                                        value={proposal.suggestedPrice}
                                                        onChange={(_, value) => setProposal({ ...proposal, suggestedPrice: value })}
                                                        min={0}
                                                        step={100}
                                                        isReadOnly={!editMode}
                                                    >
                                                        <NumberInputField 
                                                            bg={bg}
                                                            borderColor={cardBorder}
                                                            color={textPrimary}
                                                        />
                                                        <NumberInputStepper>
                                                            <NumberIncrementStepper />
                                                            <NumberDecrementStepper />
                                                        </NumberInputStepper>
                                                    </NumberInput>
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel color={textSecondary}>Upfront Payment</FormLabel>
                                                    <NumberInput
                                                        value={proposal.upfrontPayment}
                                                        onChange={(_, value) => setProposal({ ...proposal, upfrontPayment: value })}
                                                        min={0}
                                                        step={100}
                                                        isReadOnly={!editMode}
                                                    >
                                                        <NumberInputField 
                                                            bg={bg}
                                                            borderColor={cardBorder}
                                                            color={textPrimary}
                                                        />
                                                        <NumberInputStepper>
                                                            <NumberIncrementStepper />
                                                            <NumberDecrementStepper />
                                                        </NumberInputStepper>
                                                    </NumberInput>
                                                </FormControl>
                                                <FormControl>
                                                    <FormLabel color={textSecondary}>Final Payment</FormLabel>
                                                    <NumberInput
                                                        value={proposal.finalPayment}
                                                        onChange={(_, value) => setProposal({ ...proposal, finalPayment: value })}
                                                        min={0}
                                                        step={100}
                                                        isReadOnly={!editMode}
                                                    >
                                                        <NumberInputField 
                                                            bg={bg}
                                                            borderColor={cardBorder}
                                                            color={textPrimary}
                                                        />
                                                        <NumberInputStepper>
                                                            <NumberIncrementStepper />
                                                            <NumberDecrementStepper />
                                                        </NumberInputStepper>
                                                    </NumberInput>
                                                </FormControl>
                                            </HStack>
                                            <FormControl>
                                                <FormLabel color={textSecondary}>
                                                    <FiClock style={{ display: 'inline' }} /> Delivery Timeline
                                                </FormLabel>
                                                <Input
                                                    value={proposal.deliveryTimeline}
                                                    onChange={(e) => setProposal({ ...proposal, deliveryTimeline: e.target.value })}
                                                    isReadOnly={!editMode}
                                                    bg={bg}
                                                    borderColor={cardBorder}
                                                    color={textPrimary}
                                                />
                                            </FormControl>
                                        </VStack>
                                    </Box>

                                    <Divider />

                                    {/* Actions */}
                                    <HStack justify="space-between">
                                        <FormControl display="flex" alignItems="center">
                                            <FormLabel mb={0} color={textSecondary}>
                                                Create invoice for upfront payment
                                            </FormLabel>
                                            <Switch
                                                isChecked={createInvoice}
                                                onChange={(e) => setCreateInvoice(e.target.checked)}
                                                colorScheme="green"
                                            />
                                        </FormControl>
                                        <HStack>
                                            <Button
                                                variant="outline"
                                                onClick={() => setEditMode(!editMode)}
                                            >
                                                {editMode ? 'Lock' : 'Edit'}
                                            </Button>
                                            <Button
                                                leftIcon={<FiPackage />}
                                                colorScheme="green"
                                                onClick={handleCreateProject}
                                                isDisabled={!proposal.projectName}
                                            >
                                                Create Project & Tasks
                                            </Button>
                                        </HStack>
                                    </HStack>
                                </VStack>
                            </CardBody>
                        </Card>
                    )}
                </VStack>
            </Container>
            <FooterWithFourColumns />
        </Box>
    );
};

export default ConvertToProject;