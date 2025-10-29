import React, { useState } from 'react';
import {
  Box,
  Button,
  Heading,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Text,
  Badge,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  useColorMode,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Progress,
  Divider,
  Input,
  FormControl,
  FormLabel,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Flex,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowBackIcon,
  DownloadIcon,
  CalendarIcon,
  TimeIcon,
  ChevronDownIcon,
  ViewIcon,
  RepeatIcon,
} from '@chakra-ui/icons';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { getColor } from '../../brandConfig';
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import { usePageTitle } from '../../hooks/useDocumentTitle';
import researchAndDesignModuleConfig from './moduleConfig';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

const ResearchAndDesignReports: React.FC = () => {
  usePageTitle("R&D Reports");
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const toast = useToast();
  
  // Consistent styling from brandConfig
  const bg = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor("text.primaryDark", colorMode);
  const textSecondary = getColor("text.secondaryDark", colorMode);
  const textMuted = getColor("text.mutedDark", colorMode);

  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [selectedProject, setSelectedProject] = useState('all');
  const [reportType, setReportType] = useState('summary');

  // Mock data for reports
  const projects = [
    { id: '1', name: 'AI-Powered Analytics Engine', code: 'AI-2024-001' },
    { id: '2', name: 'Machine Learning Platform', code: 'ML-2024-002' },
    { id: '3', name: 'Blockchain Integration', code: 'BC-2024-003' },
  ];

  // Time by project data
  const timeByProject = [
    { name: 'AI Analytics', hours: 245.5, value: 61375, color: '#007AFF' },
    { name: 'ML Platform', hours: 189.0, value: 47250, color: '#5AC8FA' },
    { name: 'Blockchain', hours: 156.5, value: 39125, color: '#32ADE6' },
    { name: 'Unallocated', hours: 32.0, value: 8000, color: '#8E8E93' },
  ];

  // Time by activity type data
  const timeByType = [
    { name: 'Research', hours: 187.5, percentage: 30.1 },
    { name: 'Development', hours: 268.0, percentage: 43.0 },
    { name: 'Testing', hours: 87.5, percentage: 14.0 },
    { name: 'Documentation', hours: 56.0, percentage: 9.0 },
    { name: 'Meetings', hours: 24.0, percentage: 3.9 },
  ];

  // Weekly time trend data
  const weeklyTrend = [
    { week: 'Week 1', hours: 142.5, projects: 2 },
    { week: 'Week 2', hours: 156.0, projects: 3 },
    { week: 'Week 3', hours: 168.5, projects: 3 },
    { week: 'Week 4', hours: 156.0, projects: 3 },
  ];

  // Project details for detailed report
  const projectDetails = [
    {
      id: '1',
      name: 'AI-Powered Analytics Engine',
      code: 'AI-2024-001',
      status: 'in-progress',
      totalHours: 245.5,
      estimatedValue: 61375,
      completionPercentage: 65,
      activities: 12,
      evidence: 28,
      team: ['John Doe', 'Jane Smith', 'Bob Johnson'],
      lastActivity: '2024-01-25',
    },
    {
      id: '2',
      name: 'Machine Learning Platform',
      code: 'ML-2024-002',
      status: 'documenting',
      totalHours: 189.0,
      estimatedValue: 47250,
      completionPercentage: 80,
      activities: 8,
      evidence: 24,
      team: ['Jane Smith', 'Alice Brown'],
      lastActivity: '2024-01-24',
    },
    {
      id: '3',
      name: 'Blockchain Integration',
      code: 'BC-2024-003',
      status: 'in-progress',
      totalHours: 156.5,
      estimatedValue: 39125,
      completionPercentage: 45,
      activities: 10,
      evidence: 15,
      team: ['Bob Johnson', 'Charlie Davis'],
      lastActivity: '2024-01-23',
    },
  ];

  // Activity breakdown for detailed report
  const activityBreakdown = [
    {
      activity: 'Algorithm Research & Selection',
      project: 'AI-Powered Analytics Engine',
      hours: 48.5,
      completionStatus: 'completed',
      evidenceCount: 8,
    },
    {
      activity: 'Distributed Architecture Design',
      project: 'AI-Powered Analytics Engine',
      hours: 36.0,
      completionStatus: 'in-progress',
      evidenceCount: 5,
    },
    {
      activity: 'ML Model Development',
      project: 'Machine Learning Platform',
      hours: 64.0,
      completionStatus: 'in-progress',
      evidenceCount: 12,
    },
    {
      activity: 'Smart Contract Development',
      project: 'Blockchain Integration',
      hours: 42.5,
      completionStatus: 'in-progress',
      evidenceCount: 6,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress': return 'blue';
      case 'documenting': return 'orange';
      case 'completed': return 'green';
      default: return 'gray';
    }
  };

  const handleExportReport = (format: string) => {
    toast({
      title: `Exporting ${format.toUpperCase()} Report`,
      description: 'Your report is being generated...',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    // TODO: Implement actual export functionality
  };

  const handleRefreshData = () => {
    toast({
      title: 'Refreshing Data',
      description: 'Report data has been updated.',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
    // TODO: Implement actual data refresh
  };

  return (
    <Box bg={bg} minHeight="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <Box p={{ base: 4, md: 6, lg: 8 }} maxW="1600px" mx="auto" flex="1" w="100%">
        <ModuleBreadcrumb moduleConfig={researchAndDesignModuleConfig} />
        {/* Header */}
        <HStack mb={6}>
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="outline"
            borderColor={cardBorder}
            color={textPrimary}
            bg="rgba(0, 0, 0, 0.2)"
            _hover={{
              borderColor: textSecondary,
              bg: "rgba(255, 255, 255, 0.05)"
            }}
            onClick={() => navigate('/researchanddesign')}
            size={{ base: "sm", md: "md" }}
          >
            Back to Dashboard
          </Button>
        </HStack>

        <VStack spacing={6} align="stretch">
          {/* Page Header */}
          <HStack justify="space-between" flexWrap={{ base: "wrap", md: "nowrap" }} gap={4}>
            <VStack align="start" spacing={1} flex="1">
              <Heading size={{ base: "lg", md: "xl" }} color={textPrimary}>
                📊 R&D Reports & Analytics
              </Heading>
              <Text color={textSecondary} fontSize={{ base: "sm", md: "md" }}>
                Comprehensive insights into your R&D activities and time allocation
              </Text>
            </VStack>
            
            <HStack spacing={{ base: 2, md: 3 }}>
              <IconButton
                aria-label="Refresh data"
                icon={<RepeatIcon />}
                variant="outline"
                borderColor={cardBorder}
                color={textPrimary}
                bg="rgba(0, 0, 0, 0.2)"
                _hover={{
                  borderColor: textSecondary,
                  bg: "rgba(255, 255, 255, 0.05)"
                }}
                onClick={handleRefreshData}
                size={{ base: "sm", md: "md" }}
              />
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<DownloadIcon />}
                  bg={getColor("components.button.primaryBg", colorMode)}
                  color="white"
                  _hover={{ bg: getColor("components.button.primaryHover", colorMode) }}
                  size={{ base: "sm", md: "md" }}
                >
                  Export Report
                </MenuButton>
                <MenuList 
                  bg="rgba(30, 30, 30, 0.98)"
                  backdropFilter="blur(20px)"
                  borderColor={cardBorder}
                  border="1px solid"
                  boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.5)"
                >
                  <MenuItem color={textPrimary} _hover={{ bg: "rgba(255,255,255,0.12)" }} onClick={() => handleExportReport('pdf')}>
                    Export as PDF
                  </MenuItem>
                  <MenuItem color={textPrimary} _hover={{ bg: "rgba(255,255,255,0.12)" }} onClick={() => handleExportReport('excel')}>
                    Export as Excel
                  </MenuItem>
                  <MenuItem color={textPrimary} _hover={{ bg: "rgba(255,255,255,0.12)" }} onClick={() => handleExportReport('csv')}>
                    Export as CSV
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </HStack>

          {/* Filters */}
          <Card 
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px"
            borderColor={cardBorder}
          >
            <CardBody>
              <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(auto-fit, minmax(200px, 1fr))" }} gap={4}>
                <FormControl>
                  <FormLabel fontSize="sm" color={textSecondary}>Date Range - Start</FormLabel>
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    size="sm"
                    bg="rgba(0, 0, 0, 0.2)"
                    border="1px"
                    borderColor={cardBorder}
                    color={textPrimary}
                    _hover={{ borderColor: textSecondary }}
                    _focus={{
                      borderColor: textSecondary,
                      boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                    }}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel fontSize="sm" color={textSecondary}>Date Range - End</FormLabel>
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    size="sm"
                    bg="rgba(0, 0, 0, 0.2)"
                    border="1px"
                    borderColor={cardBorder}
                    color={textPrimary}
                    _hover={{ borderColor: textSecondary }}
                    _focus={{
                      borderColor: textSecondary,
                      boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                    }}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel fontSize="sm" color={textSecondary}>Project Filter</FormLabel>
                  <Select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    size="sm"
                    bg="rgba(0, 0, 0, 0.2)"
                    border="1px"
                    borderColor={cardBorder}
                    color={textPrimary}
                    _hover={{ borderColor: textSecondary }}
                    _focus={{
                      borderColor: textSecondary,
                      boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                    }}
                  >
                    <option value="all" style={{ backgroundColor: '#1a1a1a' }}>All Projects</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id} style={{ backgroundColor: '#1a1a1a' }}>
                        {project.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel fontSize="sm" color={textSecondary}>Report Type</FormLabel>
                  <Select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    size="sm"
                    bg="rgba(0, 0, 0, 0.2)"
                    border="1px"
                    borderColor={cardBorder}
                    color={textPrimary}
                    _hover={{ borderColor: textSecondary }}
                    _focus={{
                      borderColor: textSecondary,
                      boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)"
                    }}
                  >
                    <option value="summary" style={{ backgroundColor: '#1a1a1a' }}>Summary Report</option>
                    <option value="detailed" style={{ backgroundColor: '#1a1a1a' }}>Detailed Report</option>
                    <option value="compliance" style={{ backgroundColor: '#1a1a1a' }}>Compliance Report</option>
                  </Select>
                </FormControl>
              </Grid>
            </CardBody>
          </Card>

          {/* Summary Stats */}
          <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(auto-fit, minmax(250px, 1fr))" }} gap={{ base: 4, md: 6 }}>
            <Card 
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
            >
              <CardBody>
                <Stat>
                  <StatLabel color={textSecondary}>Total Hours Logged</StatLabel>
                  <StatNumber color={textPrimary}>623.0h</StatNumber>
                  <StatHelpText color={textMuted}>
                    <StatArrow type="increase" />
                    12.5% from last period
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            
            <Card 
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
            >
              <CardBody>
                <Stat>
                  <StatLabel color={textSecondary}>Estimated R&D Value</StatLabel>
                  <StatNumber color={textPrimary}>$155,750</StatNumber>
                  <StatHelpText color={textMuted}>
                    Based on $250/hour
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            
            <Card 
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
            >
              <CardBody>
                <Stat>
                  <StatLabel color={textSecondary}>Active Projects</StatLabel>
                  <StatNumber color={textPrimary}>3</StatNumber>
                  <StatHelpText color={textMuted}>
                    2 in progress, 1 documenting
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            
            <Card 
              bg={cardGradientBg}
              backdropFilter="blur(10px)"
              boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
              border="1px"
              borderColor={cardBorder}
            >
              <CardBody>
                <Stat>
                  <StatLabel color={textSecondary}>Evidence Items</StatLabel>
                  <StatNumber color={textPrimary}>67</StatNumber>
                  <StatHelpText color={textMuted}>
                    <StatArrow type="increase" />
                    15 added this week
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </Grid>

          {/* Report Content */}
          <Tabs variant="soft-rounded" colorScheme="blue">
            <TabList bg="rgba(0, 0, 0, 0.2)" p={2} borderRadius="lg">
              <Tab color={textSecondary} _selected={{ color: "white", bg: getColor("components.button.primaryBg", colorMode) }}>Time Analysis</Tab>
              <Tab color={textSecondary} _selected={{ color: "white", bg: getColor("components.button.primaryBg", colorMode) }}>Project Progress</Tab>
              <Tab color={textSecondary} _selected={{ color: "white", bg: getColor("components.button.primaryBg", colorMode) }}>Activity Breakdown</Tab>
              <Tab color={textSecondary} _selected={{ color: "white", bg: getColor("components.button.primaryBg", colorMode) }}>Team Performance</Tab>
            </TabList>

            <TabPanels>
              {/* Time Analysis Tab */}
              <TabPanel px={0}>
                <VStack spacing={6} align="stretch">
                  {/* Time by Project Chart */}
                  <Card 
                    bg={cardGradientBg}
                    backdropFilter="blur(10px)"
                    boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                    border="1px"
                    borderColor={cardBorder}
                  >
                    <CardHeader borderBottom="1px" borderColor={cardBorder}>
                      <Heading size="md" color={textPrimary}>Time Allocation by Project</Heading>
                    </CardHeader>
                    <CardBody>
                      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
                        <Box height="300px">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={timeByProject}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(entry) => `${entry.name}: ${entry.hours}h`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="hours"
                              >
                                {timeByProject.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                        
                        <VStack align="stretch" spacing={3}>
                          {timeByProject.map((project, index) => (
                            <HStack key={index} justify="space-between">
                              <HStack>
                                <Box w="12px" h="12px" bg={project.color} borderRadius="sm" />
                                <Text color={textPrimary}>{project.name}</Text>
                              </HStack>
                              <VStack align="end" spacing={0}>
                                <Text fontWeight="semibold" color={textPrimary}>{project.hours}h</Text>
                                <Text fontSize="sm" color={textSecondary}>
                                  ${project.value.toLocaleString()}
                                </Text>
                              </VStack>
                            </HStack>
                          ))}
                        </VStack>
                      </Grid>
                    </CardBody>
                  </Card>

                  {/* Time by Type Chart */}
                  <Card 
                    bg={cardGradientBg}
                    backdropFilter="blur(10px)"
                    boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                    border="1px"
                    borderColor={cardBorder}
                  >
                    <CardHeader borderBottom="1px" borderColor={cardBorder}>
                      <Heading size="md" color={textPrimary}>Time by Activity Type</Heading>
                    </CardHeader>
                    <CardBody>
                      <Box height="300px">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={timeByType}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="hours" fill={getColor("primary", colorMode)} />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardBody>
                  </Card>

                  {/* Weekly Trend Chart */}
                  <Card 
                    bg={cardGradientBg}
                    backdropFilter="blur(10px)"
                    boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                    border="1px"
                    borderColor={cardBorder}
                  >
                    <CardHeader borderBottom="1px" borderColor={cardBorder}>
                      <Heading size="md" color={textPrimary}>Weekly Time Trend</Heading>
                    </CardHeader>
                    <CardBody>
                      <Box height="300px">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={weeklyTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="week" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="hours" stroke={getColor("primary", colorMode)} />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>

              {/* Project Progress Tab */}
              <TabPanel px={0}>
                <Card 
                  bg={cardGradientBg}
                  backdropFilter="blur(10px)"
                  boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                  border="1px"
                  borderColor={cardBorder}
                >
                  <CardBody p={0}>
                    <Table variant="simple">
                      <Thead bg="rgba(0, 0, 0, 0.2)">
                        <Tr>
                          <Th color={textSecondary} borderColor={cardBorder}>Project</Th>
                          <Th color={textSecondary} borderColor={cardBorder}>Status</Th>
                          <Th color={textSecondary} borderColor={cardBorder}>Progress</Th>
                          <Th color={textSecondary} borderColor={cardBorder}>Hours</Th>
                          <Th color={textSecondary} borderColor={cardBorder}>Value</Th>
                          <Th color={textSecondary} borderColor={cardBorder}>Activities</Th>
                          <Th color={textSecondary} borderColor={cardBorder}>Evidence</Th>
                          <Th color={textSecondary} borderColor={cardBorder}>Last Activity</Th>
                          <Th color={textSecondary} borderColor={cardBorder}>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {projectDetails.map((project) => (
                          <Tr key={project.id} _hover={{ bg: "rgba(255, 255, 255, 0.02)" }}>
                            <Td color={textPrimary} borderColor={cardBorder}>
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="semibold">{project.name}</Text>
                                <Text fontSize="sm" color={getColor("text.secondary", colorMode)}>
                                  {project.code}
                                </Text>
                              </VStack>
                            </Td>
                            <Td borderColor={cardBorder}>
                              <Badge colorScheme={getStatusColor(project.status)}>
                                {project.status.replace('-', ' ')}
                              </Badge>
                            </Td>
                            <Td borderColor={cardBorder}>
                              <VStack align="start" spacing={1}>
                                <Text fontSize="sm">{project.completionPercentage}%</Text>
                                <Progress
                                  value={project.completionPercentage}
                                  size="sm"
                                  colorScheme="green"
                                  w="80px"
                                />
                              </VStack>
                            </Td>
                            <Td color={textPrimary} borderColor={cardBorder}>{project.totalHours}h</Td>
                            <Td color={textPrimary} borderColor={cardBorder}>${project.estimatedValue.toLocaleString()}</Td>
                            <Td color={textPrimary} borderColor={cardBorder}>{project.activities}</Td>
                            <Td color={textPrimary} borderColor={cardBorder}>{project.evidence}</Td>
                            <Td color={textPrimary} borderColor={cardBorder}>{project.lastActivity}</Td>
                            <Td borderColor={cardBorder}>
                              <IconButton
                                aria-label="View project"
                                icon={<ViewIcon />}
                                size="sm"
                                variant="ghost"
                                onClick={() => navigate(`/researchanddesign/projects/${project.id}`)}
                              />
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>
              </TabPanel>

              {/* Activity Breakdown Tab */}
              <TabPanel px={0}>
                <Card 
                  bg={cardGradientBg}
                  backdropFilter="blur(10px)"
                  boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                  border="1px"
                  borderColor={cardBorder}
                >
                  <CardBody p={0}>
                    <Table variant="simple">
                      <Thead bg="rgba(0, 0, 0, 0.2)">
                        <Tr>
                          <Th color={textSecondary} borderColor={cardBorder}>Activity</Th>
                          <Th color={textSecondary} borderColor={cardBorder}>Project</Th>
                          <Th color={textSecondary} borderColor={cardBorder}>Hours</Th>
                          <Th color={textSecondary} borderColor={cardBorder}>Status</Th>
                          <Th color={textSecondary} borderColor={cardBorder}>Evidence</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {activityBreakdown.map((activity, index) => (
                          <Tr key={index} _hover={{ bg: "rgba(255, 255, 255, 0.02)" }}>
                            <Td color={textPrimary} borderColor={cardBorder}>{activity.activity}</Td>
                            <Td color={textPrimary} borderColor={cardBorder}>{activity.project}</Td>
                            <Td color={textPrimary} borderColor={cardBorder}>{activity.hours}h</Td>
                            <Td borderColor={cardBorder}>
                              <Badge colorScheme={getStatusColor(activity.completionStatus)}>
                                {activity.completionStatus}
                              </Badge>
                            </Td>
                            <Td color={textPrimary} borderColor={cardBorder}>{activity.evidenceCount}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>
              </TabPanel>

              {/* Team Performance Tab */}
              <TabPanel px={0}>
                <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={4}>
                  <Card 
                    bg={cardGradientBg}
                    backdropFilter="blur(10px)"
                    boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                    border="1px"
                    borderColor={cardBorder}
                  >
                    <CardHeader borderBottom="1px" borderColor={cardBorder}>
                      <Heading size="sm" color={textPrimary}>John Doe</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        <HStack justify="space-between">
                          <Text>Total Hours</Text>
                          <Text fontWeight="semibold">186.5h</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Projects</Text>
                          <Text fontWeight="semibold">2</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Avg Hours/Week</Text>
                          <Text fontWeight="semibold">46.6h</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Primary Activity</Text>
                          <Badge>Development</Badge>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card 
                    bg={cardGradientBg}
                    backdropFilter="blur(10px)"
                    boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                    border="1px"
                    borderColor={cardBorder}
                  >
                    <CardHeader borderBottom="1px" borderColor={cardBorder}>
                      <Heading size="sm" color={textPrimary}>Jane Smith</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        <HStack justify="space-between">
                          <Text>Total Hours</Text>
                          <Text fontWeight="semibold">164.0h</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Projects</Text>
                          <Text fontWeight="semibold">2</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Avg Hours/Week</Text>
                          <Text fontWeight="semibold">41.0h</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Primary Activity</Text>
                          <Badge>Research</Badge>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card 
                    bg={cardGradientBg}
                    backdropFilter="blur(10px)"
                    boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
                    border="1px"
                    borderColor={cardBorder}
                  >
                    <CardHeader borderBottom="1px" borderColor={cardBorder}>
                      <Heading size="sm" color={textPrimary}>Bob Johnson</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        <HStack justify="space-between">
                          <Text>Total Hours</Text>
                          <Text fontWeight="semibold">142.5h</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Projects</Text>
                          <Text fontWeight="semibold">2</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Avg Hours/Week</Text>
                          <Text fontWeight="semibold">35.6h</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>Primary Activity</Text>
                          <Badge>Testing</Badge>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                </Grid>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Box>
      <FooterWithFourColumns />
    </Box>
  );
};

export default ResearchAndDesignReports;