import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
    VStack,
    HStack,
    FormControl,
    FormLabel,
    Input,
    Textarea,
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
    useToast,
    Text,
    Box,
    Badge,
    Divider,
    Spinner,
    Alert,
    AlertIcon,
    Switch,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
} from '@chakra-ui/react';
import { useMutation, gql } from '@apollo/client';
import { FiPlus, FiTrash2, FiPackage, FiDollarSign, FiClock, FiCheck } from 'react-icons/fi';
import { getColor } from '../../../brandConfig';

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
        }
    }
`;

const CREATE_PROJECT = gql`
    mutation CreateProject($input: ProjectInput!) {
        createProject(input: $input) {
            id
            projectName
            projectGoal
            suggestedPrice
            upfrontPayment
        }
    }
`;

const CREATE_TASK = gql`
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
        }
    }
`;

interface Task {
    title: string;
    description: string;
    estimatedHours: number;
    order: number;
    category: string;
}

interface ProjectProposal {
    projectName: string;
    projectSummary: string;
    clientName: string;
    clientEmail?: string;
    clientPhone?: string;
    tasks: Task[];
    suggestedPrice: number;
    upfrontPayment: number;
    finalPayment: number;
    deliveryTimeline: string;
    deliverables: string[];
    specialRequirements?: string;
}

interface ConvertToProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    email: {
        id: string;
        subject: string;
        bodyMarkdown: string;
        from: string;
    };
}

export const ConvertToProjectModal: React.FC<ConvertToProjectModalProps> = ({
    isOpen,
    onClose,
    email
}) => {
    const toast = useToast();
    const [proposal, setProposal] = useState<ProjectProposal | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [createInvoice, setCreateInvoice] = useState(true);
    const [activeTab, setActiveTab] = useState(0);

    const [scanEmail] = useMutation(SCAN_EMAIL_FOR_PROJECT);
    const [createProject] = useMutation(CREATE_PROJECT);
    const [createTask] = useMutation(CREATE_TASK);
    const [createBill] = useMutation(CREATE_BILL);

    // Styling
    const textPrimary = getColor('textPrimary');
    const textSecondary = getColor('textSecondary');
    const bg = getColor('background');
    const cardBorder = getColor('cardBorder');

    useEffect(() => {
        if (isOpen && !proposal && !isAnalyzing) {
            analyzeEmail();
        }
    }, [isOpen]);

    const analyzeEmail = async () => {
        setIsAnalyzing(true);
        try {
            const result = await scanEmail({
                variables: {
                    emailContent: email.bodyMarkdown || '',
                    emailSubject: email.subject || '',
                    senderName: email.from?.split('<')[0].trim() || '',
                    senderEmail: email.from?.match(/<(.+)>/)?.[1] || email.from || ''
                }
            });

            if (result.data?.scanEmailAndGenerateProjectProposal) {
                setProposal(result.data.scanEmailAndGenerateProjectProposal);
                toast({
                    title: 'Analysis Complete',
                    description: 'AI has extracted project details from the email',
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
                projectName: email.subject || 'New Project',
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
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleCreateProject = async () => {
        if (!proposal) return;
        
        setIsCreating(true);
        try {
            // Create the project with proposal fields
            const projectResult = await createProject({
                variables: {
                    input: {
                        projectName: proposal.projectName,
                        projectGoal: proposal.projectSummary,
                        projectDescription: proposal.specialRequirements || '',
                        billingClient: '000000000000000000000000', // Default/placeholder client
                        // Proposal fields
                        clientEmail: proposal.clientEmail,
                        clientPhone: proposal.clientPhone,
                        suggestedPrice: proposal.suggestedPrice,
                        upfrontPayment: proposal.upfrontPayment,
                        finalPayment: proposal.finalPayment,
                        deliveryTimeline: proposal.deliveryTimeline,
                        deliverables: proposal.deliverables,
                        specialRequirements: proposal.specialRequirements,
                        sourceEmailId: email.id,
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
                        await createBill({
                            variables: {
                                input: {
                                    projectId,
                                    isPaid: false,
                                    status: 'DRAFT',
                                    currency: 'AUD',
                                    showPaymentDetails: false,
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
                    } catch (billError) {
                        console.error('Failed to create draft invoice:', billError);
                    }
                }

                toast({
                    title: 'Project Created! 🎉',
                    description: `Created project with ${proposal.tasks.length} tasks${createInvoice ? ' and draft invoice' : ''}`,
                    status: 'success',
                    duration: 5000
                });

                // Open project in new tab
                window.open(`/projects/${projectId}`, '_blank');
                
                // Close modal
                onClose();
            }
        } catch (error) {
            console.error('Failed to create project:', error);
            toast({
                title: 'Failed to create project',
                description: 'Please try again',
                status: 'error',
                duration: 5000
            });
        } finally {
            setIsCreating(false);
        }
    };

    const addTask = () => {
        if (!proposal) return;
        const newTask: Task = {
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

    const updateTask = (index: number, field: keyof Task, value: any) => {
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

    const totalHours = proposal?.tasks.reduce((sum, task) => sum + task.estimatedHours, 0) || 0;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="6xl">
            <ModalOverlay />
            <ModalContent bg={bg} borderColor={cardBorder}>
                <ModalHeader color={textPrimary}>
                    <HStack>
                        <FiPackage />
                        <Text>Convert Email to Project</Text>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton color={textSecondary} />

                <ModalBody>
                    {isAnalyzing ? (
                        <VStack spacing={4} py={8}>
                            <Spinner size="xl" color={getColor('primaryBlue')} />
                            <Text color={textSecondary}>AI is analyzing email content...</Text>
                            <Text fontSize="sm" color={textSecondary}>Extracting project details and tasks</Text>
                        </VStack>
                    ) : proposal ? (
                        <Tabs index={activeTab} onChange={setActiveTab}>
                            <TabList>
                                <Tab color={textSecondary}>Project Details</Tab>
                                <Tab color={textSecondary}>Tasks ({proposal.tasks.length})</Tab>
                                <Tab color={textSecondary}>Pricing</Tab>
                            </TabList>

                            <TabPanels>
                                {/* Project Details Tab */}
                                <TabPanel>
                                    <VStack spacing={4} align="stretch">
                                        <FormControl>
                                            <FormLabel color={textSecondary}>Project Name</FormLabel>
                                            <Input
                                                value={proposal.projectName}
                                                onChange={(e) => setProposal({ ...proposal, projectName: e.target.value })}
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
                                                bg={bg}
                                                borderColor={cardBorder}
                                                color={textPrimary}
                                                rows={3}
                                            />
                                        </FormControl>

                                        <HStack spacing={4}>
                                            <FormControl>
                                                <FormLabel color={textSecondary}>Client Name</FormLabel>
                                                <Input
                                                    value={proposal.clientName}
                                                    onChange={(e) => setProposal({ ...proposal, clientName: e.target.value })}
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
                                                    bg={bg}
                                                    borderColor={cardBorder}
                                                    color={textPrimary}
                                                />
                                            </FormControl>
                                        </HStack>

                                        <FormControl>
                                            <FormLabel color={textSecondary}>
                                                <FiClock style={{ display: 'inline', marginRight: '8px' }} />
                                                Delivery Timeline
                                            </FormLabel>
                                            <Input
                                                value={proposal.deliveryTimeline}
                                                onChange={(e) => setProposal({ ...proposal, deliveryTimeline: e.target.value })}
                                                bg={bg}
                                                borderColor={cardBorder}
                                                color={textPrimary}
                                            />
                                        </FormControl>
                                    </VStack>
                                </TabPanel>

                                {/* Tasks Tab */}
                                <TabPanel>
                                    <VStack spacing={4} align="stretch">
                                        <HStack justify="space-between">
                                            <Text color={textSecondary}>
                                                Total Hours: <Badge colorScheme="blue">{totalHours}h</Badge>
                                            </Text>
                                            <Button
                                                size="sm"
                                                leftIcon={<FiPlus />}
                                                variant="outline"
                                                onClick={addTask}
                                            >
                                                Add Task
                                            </Button>
                                        </HStack>

                                        <Box maxH="300px" overflowY="auto">
                                            <Table size="sm">
                                                <Thead>
                                                    <Tr>
                                                        <Th color={textSecondary}>Task</Th>
                                                        <Th color={textSecondary}>Description</Th>
                                                        <Th color={textSecondary} isNumeric>Hours</Th>
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
                                                                    width="80px"
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
                                                                <IconButton
                                                                    aria-label="Remove task"
                                                                    icon={<FiTrash2 />}
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    colorScheme="red"
                                                                    onClick={() => removeTask(index)}
                                                                />
                                                            </Td>
                                                        </Tr>
                                                    ))}
                                                </Tbody>
                                            </Table>
                                        </Box>
                                    </VStack>
                                </TabPanel>

                                {/* Pricing Tab */}
                                <TabPanel>
                                    <VStack spacing={4} align="stretch">
                                        <Alert status="info" variant="subtle">
                                            <AlertIcon />
                                            <Box>
                                                <Text fontWeight="bold">AI Pricing Recommendation</Text>
                                                <Text fontSize="sm">Based on {totalHours} hours of work</Text>
                                            </Box>
                                        </Alert>

                                        <HStack spacing={4}>
                                            <FormControl>
                                                <FormLabel color={textSecondary}>
                                                    <FiDollarSign style={{ display: 'inline' }} /> Total Price
                                                </FormLabel>
                                                <NumberInput
                                                    value={proposal.suggestedPrice}
                                                    onChange={(_, value) => setProposal({ 
                                                        ...proposal, 
                                                        suggestedPrice: value,
                                                        upfrontPayment: Math.round(value * 0.5),
                                                        finalPayment: Math.round(value * 0.5)
                                                    })}
                                                    min={0}
                                                    step={100}
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
                                                <FormLabel color={textSecondary}>50% Upfront</FormLabel>
                                                <NumberInput
                                                    value={proposal.upfrontPayment}
                                                    onChange={(_, value) => setProposal({ ...proposal, upfrontPayment: value })}
                                                    min={0}
                                                    step={100}
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
                                                <FormLabel color={textSecondary}>50% Final</FormLabel>
                                                <NumberInput
                                                    value={proposal.finalPayment}
                                                    onChange={(_, value) => setProposal({ ...proposal, finalPayment: value })}
                                                    min={0}
                                                    step={100}
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

                                        <Divider />

                                        <FormControl display="flex" alignItems="center">
                                            <FormLabel mb={0} color={textSecondary}>
                                                Create draft invoice for full amount
                                            </FormLabel>
                                            <Switch
                                                isChecked={createInvoice}
                                                onChange={(e) => setCreateInvoice(e.target.checked)}
                                                colorScheme="green"
                                            />
                                        </FormControl>

                                        {createInvoice && (
                                            <Alert status="success" variant="subtle">
                                                <AlertIcon />
                                                <Text fontSize="sm">
                                                    A draft invoice for ${proposal.suggestedPrice} will be created. 
                                                    You can then generate a 50% upfront invoice from it.
                                                </Text>
                                            </Alert>
                                        )}
                                    </VStack>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    ) : null}
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isCreating}>
                        Cancel
                    </Button>
                    <Button
                        leftIcon={<FiPackage />}
                        colorScheme="green"
                        onClick={handleCreateProject}
                        isLoading={isCreating}
                        isDisabled={!proposal || !proposal.projectName || isAnalyzing}
                    >
                        Create Project & Open
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};