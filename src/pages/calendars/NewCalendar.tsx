import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, gql } from '@apollo/client';
import {
  Container,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  Stack,
  Alert,
  AlertIcon,
  Box,
  HStack,
  Switch,
  Text,
  VStack,
  Divider,
  useToast,
  useBreakpointValue,
  FormHelperText,
  InputGroup,
  InputLeftAddon,
  Badge,
  useColorMode
} from '@chakra-ui/react';
import { ArrowBackIcon, CalendarIcon, CheckIcon } from '@chakra-ui/icons';
import { useAuth } from '../../contexts/AuthContext';
import { getColor, brandConfig } from '../../brandConfig';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import { calendarsModuleConfig } from './moduleConfig';
import { usePageTitle } from '../../hooks/useDocumentTitle';
import { CalendarType, CalendarVisibility } from '../../generated/graphql';

const CREATE_CALENDAR = gql`
  mutation CreateCalendar($input: BusinessCalendarInput!) {
    createCalendar(input: $input) {
      id
      name
      type
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

const GET_EMPLOYEES = gql`
  query GetEmployees {
    employees {
      id
      fName
      lName
      email
    }
  }
`;

const NewCalendar: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const { colorMode } = useColorMode();
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Brand styling variables
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
  const infoBlue = getColor("status.info", colorMode);

  // Update page title
  usePageTitle('New Calendar');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'BUSINESS',
    color: '#4A90E2',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    isShared: false,
    publicRead: false,
    publicWrite: false,
    requireAuth: true,
    allowedUsers: [],
    linkedCompanyId: '',
    linkedEmployeeId: '',
    defaultReminders: true,
    reminderMinutes: 15,
    workingHoursStart: '09:00',
    workingHoursEnd: '17:00',
    workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
  });

  const { data: companiesData } = useQuery(GET_COMPANIES);
  const { data: employeesData } = useQuery(GET_EMPLOYEES);

  // Get enum values from generated types
  const calendarTypes = Object.entries(CalendarType).map(([key, value]) => ({
    name: value,
    label: key.replace(/([A-Z])/g, ' $1').trim(), // Convert "SharedExternal" to "Shared External"
  }));

  const calendarVisibilities = Object.entries(CalendarVisibility).map(([key, value]) => ({
    name: value,
    label: key,
  }));

  const [createCalendar, { loading }] = useMutation(CREATE_CALENDAR, {
    onCompleted: (data) => {
      toast({
        title: 'Calendar created',
        description: `${data.createCalendar.name} has been created successfully`,
        status: 'success',
        duration: 3000
      });
      navigate(`/calendars/${data.createCalendar.id}/view`);
    },
    onError: (error) => {
      toast({
        title: 'Error creating calendar',
        description: error.message,
        status: 'error',
        duration: 5000
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const input: any = {
      name: formData.name,
      description: formData.description,
      type: formData.type,
      color: formData.color
    };

    // Set settings object
    input.settings = {
      timezone: formData.timezone,
      defaultReminderMinutes: formData.defaultReminders ? formData.reminderMinutes : 0,
      workingHoursStart: formData.workingHoursStart,
      workingHoursEnd: formData.workingHoursEnd,
      workingDays: formData.workingDays
    };

    // Handle sharing settings
    if (formData.isShared) {
      input.isPublic = formData.publicRead;
      // Shares array would be populated if we have specific users to share with
      if (formData.allowedUsers && formData.allowedUsers.length > 0) {
        input.shares = formData.allowedUsers.map((userId: string) => ({
          sharedWithId: userId,
          sharedWithType: 'Client',
          permissions: formData.publicWrite ? ['READ', 'WRITE'] : ['READ']
        }));
      }
    }

    // Handle linked entities
    if (formData.type === 'COMPANY' && formData.linkedCompanyId) {
      input.companyId = formData.linkedCompanyId;
    } else if (formData.type === 'EMPLOYEE' && formData.linkedEmployeeId) {
      // Since we don't have an employeeId field, we might need to store this in moduleData
      // Or handle it differently based on backend requirements
    }

    createCalendar({ variables: { input } });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (field: string) => (checked: boolean) => {
    setFormData(prev => ({ ...prev, [field]: checked }));
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day]
    }));
  };

  const weekDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  return (
    <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
      <NavbarWithCallToAction />
      <ModuleBreadcrumb moduleConfig={calendarsModuleConfig} />
      <Container maxW={{ base: "container.sm", md: "container.md", lg: "container.lg" }} py={{ base: 6, md: 8 }} flex="1">
      <Stack spacing={{ base: 4, md: 6 }}>
        <VStack align="stretch" spacing={4}>
          <HStack justify="space-between" flexDirection={{ base: "column", md: "row" }} spacing={{ base: 3, md: 0 }} align={{ base: "stretch", md: "center" }}>
            <Heading 
              size={{ base: "md", md: "lg" }} 
              color={textPrimary}
              fontFamily={brandConfig.fonts.heading}
            >
              <HStack>
                <CalendarIcon color={primaryColor} />
                <Text>Create New Calendar</Text>
              </HStack>
            </Heading>
            <Button
              leftIcon={<ArrowBackIcon />}
              bg="rgba(255, 255, 255, 0.1)"
              color={textPrimary}
              _hover={{ bg: "rgba(255, 255, 255, 0.2)", transform: "translateY(-2px)" }}
              _active={{ transform: "translateY(0)" }}
              transition="all 0.2s"
              onClick={() => navigate('/calendars')}
              size={{ base: "md", md: "lg" }}
              width={{ base: "100%", md: "auto" }}
              minW={{ md: "100px" }}
            >
              Back
            </Button>
          </HStack>
        </VStack>

        <Box 
          as="form" 
          onSubmit={handleSubmit}
          bg={cardGradientBg}
          backdropFilter="blur(10px)"
          boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
          border="1px"
          borderColor={cardBorder}
          borderRadius="lg"
          p={{ base: 4, md: 6 }}
        >
          <Stack spacing={6}>
            {/* Basic Information */}
            <Stack spacing={4}>
              <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color={textPrimary}>Basic Information</Text>
              
              <FormControl isRequired>
                <FormLabel color={textSecondary} fontSize={{ base: "sm", md: "md" }}>Calendar Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Company Events, Team Schedule"
                  bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                  borderColor={cardBorder}
                  color={textPrimary}
                  _placeholder={{ color: textMuted }}
                  _hover={{ borderColor: textSecondary }}
                  _focus={{
                    borderColor: colorMode === 'light' ? "#007AFF" : "#3B82F6",
                    boxShadow: `0 0 0 1px ${colorMode === 'light' ? "#007AFF" : "#3B82F6"}`,
                  }}
                  size={{ base: "md", md: "lg" }}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textSecondary} fontSize={{ base: "sm", md: "md" }}>Description</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the purpose of this calendar"
                  rows={3}
                  bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                  borderColor={cardBorder}
                  color={textPrimary}
                  _placeholder={{ color: textMuted }}
                  _hover={{ borderColor: textSecondary }}
                  _focus={{
                    borderColor: colorMode === 'light' ? "#007AFF" : "#3B82F6",
                    boxShadow: `0 0 0 1px ${colorMode === 'light' ? "#007AFF" : "#3B82F6"}`,
                  }}
                  fontSize={{ base: "sm", md: "md" }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color={textSecondary} fontSize={{ base: "sm", md: "md" }}>Calendar Type</FormLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  bg="rgba(255, 255, 255, 0.05)"
                  borderColor={cardBorder}
                  color={textPrimary}
                  _hover={{ borderColor: textSecondary }}
                  _focus={{
                    borderColor: primaryColor,
                    boxShadow: `0 0 0 1px ${primaryColor}`,
                  }}
                  size={{ base: "md", md: "lg" }}
                >
                  {calendarTypes.map((type) => (
                    <option key={type.name} value={type.name}>
                      {type.label}
                    </option>
                  ))}
                </Select>
                <FormHelperText color={textMuted} fontSize={{ base: "xs", md: "sm" }}>
                  Choose the type that best fits your calendar's purpose
                </FormHelperText>
              </FormControl>

              {formData.type === 'COMPANY' && companiesData?.companies && (
                <FormControl>
                  <FormLabel color={textSecondary} fontSize={{ base: "sm", md: "md" }}>Link to Company</FormLabel>
                  <Select
                    name="linkedCompanyId"
                    value={formData.linkedCompanyId}
                    onChange={handleChange}
                    bg="rgba(255, 255, 255, 0.05)"
                    borderColor={cardBorder}
                    color={textPrimary}
                    _hover={{ borderColor: textSecondary }}
                    _focus={{ 
                      borderColor: primaryColor,
                      boxShadow: `0 0 0 1px ${primaryColor}`,
                    }}
                    size={{ base: "md", md: "lg" }}
                  >
                    <option value="">Select a company</option>
                    {companiesData.companies.map((company: any) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              )}

              {formData.type === 'EMPLOYEE' && employeesData?.employees && (
                <FormControl>
                  <FormLabel color={textSecondary} fontSize={{ base: "sm", md: "md" }}>Link to Employee</FormLabel>
                  <Select
                    name="linkedEmployeeId"
                    value={formData.linkedEmployeeId}
                    onChange={handleChange}
                    bg="rgba(255, 255, 255, 0.05)"
                    borderColor={cardBorder}
                    color={textPrimary}
                    _hover={{ borderColor: textSecondary }}
                    _focus={{ 
                      borderColor: primaryColor,
                      boxShadow: `0 0 0 1px ${primaryColor}`,
                    }}
                    size={{ base: "md", md: "lg" }}
                  >
                    <option value="">Select an employee</option>
                    {employeesData.employees.map((employee: any) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.fName} {employee.lName} ({employee.email})
                      </option>
                    ))}
                  </Select>
                </FormControl>
              )}

              <FormControl>
                <FormLabel color={textSecondary} fontSize={{ base: "sm", md: "md" }}>Calendar Color</FormLabel>
                <HStack spacing={{ base: 2, md: 3 }}>
                  <Input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    width={{ base: "80px", md: "100px" }}
                    bg="rgba(255, 255, 255, 0.05)"
                    borderColor={cardBorder}
                    _hover={{ borderColor: textSecondary }}
                  />
                  <Input
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    placeholder="#4A90E2"
                    bg="rgba(255, 255, 255, 0.05)"
                    borderColor={cardBorder}
                    color={textPrimary}
                    _placeholder={{ color: textMuted }}
                    _hover={{ borderColor: textSecondary }}
                    _focus={{ 
                      borderColor: primaryColor,
                      boxShadow: `0 0 0 1px ${primaryColor}`,
                    }}
                    size={{ base: "md", md: "lg" }}
                  />
                </HStack>
              </FormControl>

              <FormControl>
                <FormLabel color={textSecondary} fontSize={{ base: "sm", md: "md" }}>Timezone</FormLabel>
                <Select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleChange}
                  bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
                  borderColor={colorMode === 'light' ? "gray.300" : cardBorder}
                  color={colorMode === 'light' ? "gray.900" : textPrimary}
                  _hover={{ borderColor: primaryColor }}
                  size={{ base: "md", md: "lg" }}
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                  <option value="Australia/Sydney">Sydney</option>
                  <option value="Australia/Brisbane">Brisbane</option>
                </Select>
              </FormControl>
            </Stack>

            <Divider borderColor={cardBorder} />

            {/* Sharing Settings */}
            <Stack spacing={4}>
              <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color={textPrimary}>Sharing Settings</Text>
              
              <FormControl>
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <FormLabel mb={0} color={textSecondary} fontSize={{ base: "sm", md: "md" }}>Share Calendar</FormLabel>
                    <Text fontSize={{ base: "xs", md: "sm" }} color={textMuted}>
                      Allow others to view or edit this calendar
                    </Text>
                  </VStack>
                  <Switch
                    isChecked={formData.isShared}
                    onChange={(e) => handleSwitchChange('isShared')(e.target.checked)}
                  />
                </HStack>
              </FormControl>

              {formData.isShared && (
                <>
                  <FormControl>
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <FormLabel mb={0} color={textSecondary} fontSize={{ base: "sm", md: "md" }}>Public Read Access</FormLabel>
                        <Text fontSize={{ base: "xs", md: "sm" }} color={textMuted}>
                          Anyone can view events
                        </Text>
                      </VStack>
                      <Switch
                        isChecked={formData.publicRead}
                        onChange={(e) => handleSwitchChange('publicRead')(e.target.checked)}
                      />
                    </HStack>
                  </FormControl>

                  <FormControl>
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <FormLabel mb={0} color={textSecondary} fontSize={{ base: "sm", md: "md" }}>Public Write Access</FormLabel>
                        <Text fontSize={{ base: "xs", md: "sm" }} color={textMuted}>
                          Anyone can create events
                        </Text>
                      </VStack>
                      <Switch
                        isChecked={formData.publicWrite}
                        onChange={(e) => handleSwitchChange('publicWrite')(e.target.checked)}
                      />
                    </HStack>
                  </FormControl>

                  <FormControl>
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <FormLabel mb={0} color={textSecondary} fontSize={{ base: "sm", md: "md" }}>Require Authentication</FormLabel>
                        <Text fontSize={{ base: "xs", md: "sm" }} color={textMuted}>
                          Users must be logged in to access
                        </Text>
                      </VStack>
                      <Switch
                        isChecked={formData.requireAuth}
                        onChange={(e) => handleSwitchChange('requireAuth')(e.target.checked)}
                      />
                    </HStack>
                  </FormControl>
                </>
              )}
            </Stack>

            <Divider borderColor={cardBorder} />

            {/* Working Hours */}
            <Stack spacing={4}>
              <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color={textPrimary}>Working Hours</Text>
              
              <HStack spacing={{ base: 2, md: 4 }} flexDirection={{ base: "column", md: "row" }} align={{ base: "stretch", md: "center" }}>
                <FormControl>
                  <FormLabel color={textSecondary} fontSize={{ base: "sm", md: "md" }}>Start Time</FormLabel>
                  <Input
                    type="time"
                    name="workingHoursStart"
                    value={formData.workingHoursStart}
                    onChange={handleChange}
                    bg="rgba(255, 255, 255, 0.05)"
                    borderColor={cardBorder}
                    color={textPrimary}
                    _hover={{ borderColor: textSecondary }}
                    _focus={{ 
                      borderColor: primaryColor,
                      boxShadow: `0 0 0 1px ${primaryColor}`,
                    }}
                    size={{ base: "md", md: "lg" }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color={textSecondary} fontSize={{ base: "sm", md: "md" }}>End Time</FormLabel>
                  <Input
                    type="time"
                    name="workingHoursEnd"
                    value={formData.workingHoursEnd}
                    onChange={handleChange}
                    bg="rgba(255, 255, 255, 0.05)"
                    borderColor={cardBorder}
                    color={textPrimary}
                    _hover={{ borderColor: textSecondary }}
                    _focus={{ 
                      borderColor: primaryColor,
                      boxShadow: `0 0 0 1px ${primaryColor}`,
                    }}
                    size={{ base: "md", md: "lg" }}
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel color={textSecondary} fontSize={{ base: "sm", md: "md" }}>Working Days</FormLabel>
                <HStack wrap="wrap" spacing={2}>
                  {weekDays.map(day => (
                    <Badge
                      key={day}
                      bg={formData.workingDays.includes(day) ? "rgba(59, 130, 246, 0.2)" : "rgba(156, 163, 175, 0.2)"}
                      color={formData.workingDays.includes(day) ? primaryColor : textMuted}
                      border="1px solid"
                      borderColor={formData.workingDays.includes(day) ? "rgba(59, 130, 246, 0.3)" : "rgba(156, 163, 175, 0.3)"}
                      px={3}
                      py={1}
                      cursor="pointer"
                      onClick={() => handleDayToggle(day)}
                    >
                      {day.slice(0, 3)}
                    </Badge>
                  ))}
                </HStack>
              </FormControl>
            </Stack>

            <Divider borderColor={cardBorder} />

            {/* Default Reminders */}
            <Stack spacing={4}>
              <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color={textPrimary}>Default Reminders</Text>
              
              <FormControl>
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <FormLabel mb={0} color={textSecondary} fontSize={{ base: "sm", md: "md" }}>Enable Default Reminders</FormLabel>
                    <Text fontSize={{ base: "xs", md: "sm" }} color={textMuted}>
                      Automatically add reminders to new events
                    </Text>
                  </VStack>
                  <Switch
                    isChecked={formData.defaultReminders}
                    onChange={(e) => handleSwitchChange('defaultReminders')(e.target.checked)}
                  />
                </HStack>
              </FormControl>

              {formData.defaultReminders && (
                <FormControl>
                  <FormLabel color={textSecondary} fontSize={{ base: "sm", md: "md" }}>Reminder Time</FormLabel>
                  <InputGroup size={{ base: "md", md: "lg" }}>
                    <Input
                      type="number"
                      name="reminderMinutes"
                      value={formData.reminderMinutes}
                      onChange={handleChange}
                      min={1}
                      bg="rgba(255, 255, 255, 0.05)"
                      borderColor={cardBorder}
                      color={textPrimary}
                      _hover={{ borderColor: textSecondary }}
                      _focus={{ 
                        borderColor: primaryColor,
                        boxShadow: `0 0 0 1px ${primaryColor}`,
                      }}
                    />
                    <InputLeftAddon 
                      bg="rgba(255, 255, 255, 0.03)"
                      borderColor={cardBorder}
                      color={textSecondary}
                    >
                      minutes before
                    </InputLeftAddon>
                  </InputGroup>
                </FormControl>
              )}
            </Stack>

            {/* Submit Buttons */}
            <HStack spacing={{ base: 2, md: 4 }} justify="flex-end" flexDirection={{ base: "column-reverse", md: "row" }} align={{ base: "stretch", md: "center" }}>
              <Button
                bg="rgba(255, 255, 255, 0.1)"
                color={textPrimary}
                _hover={{ bg: "rgba(255, 255, 255, 0.2)" }}
                onClick={() => navigate('/calendars')}
                width={{ base: "100%", md: "auto" }}
                size={{ base: "md", md: "lg" }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                bg={primaryColor}
                color="white"
                _hover={{ bg: primaryHover, transform: "translateY(-2px)" }}
                _active={{ transform: "translateY(0)" }}
                transition="all 0.2s"
                fontWeight="semibold"
                isLoading={loading}
                leftIcon={<CheckIcon />}
                width={{ base: "100%", md: "auto" }}
                minW={{ md: "160px" }}
                size={{ base: "md", md: "lg" }}
              >
                Create Calendar
              </Button>
            </HStack>
          </Stack>
        </Box>
      </Stack>
      </Container>
      <FooterWithFourColumns />
    </Box>
  );
};

export default NewCalendar;