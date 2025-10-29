import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  HStack,
  Text,
  useToast,
  Box,
  Divider,
  Radio,
  RadioGroup,
  Stack,
  InputGroup,
  InputLeftAddon,
  FormHelperText,
  useColorMode,
} from '@chakra-ui/react';
import { useMutation, useQuery, gql } from '@apollo/client';
import { brandConfig, getColor, getComponent } from '../../brandConfig';

const GET_CLIENTS = gql`
  query GetClients {
    clients {
      id
      fName
      lName
      email
      phoneNumber
    }
  }
`;

const CREATE_CLIENT = gql`
  mutation CreateClient($input: ClientInput!) {
    createClient(input: $input) {
      id
      fName
      lName
      email
      phoneNumber
    }
  }
`;

// Country codes for phone number formatting
const COUNTRY_CODES = [
  { name: "Australia", code: "+61", flag: "🇦🇺" },
  { name: "United States", code: "+1", flag: "🇺🇸" },
  { name: "United Kingdom", code: "+44", flag: "🇬🇧" },
  { name: "Canada", code: "+1", flag: "🇨🇦" },
  { name: "New Zealand", code: "+64", flag: "🇳🇿" },
  { name: "Germany", code: "+49", flag: "🇩🇪" },
  { name: "France", code: "+33", flag: "🇫🇷" },
  { name: "Japan", code: "+81", flag: "🇯🇵" },
  { name: "Singapore", code: "+65", flag: "🇸🇬" },
];

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMemberAdded: (clientId: string, clientName: string) => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose, onMemberAdded }) => {
  const toast = useToast();
  const { colorMode } = useColorMode();
  const [memberType, setMemberType] = useState<'existing' | 'new'>('existing');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]); // Default to Australia
  const [localPhoneNumber, setLocalPhoneNumber] = useState("");
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState("");
  const [newMember, setNewMember] = useState({
    fName: '',
    lName: '',
    email: '',
    phoneNumber: '',
  });

  const { data: clientsData, loading: clientsLoading } = useQuery(GET_CLIENTS);
  const [createClient] = useMutation(CREATE_CLIENT);

  const handleCountryChange = (countryCode: string) => {
    const country = COUNTRY_CODES.find(c => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
      setLocalPhoneNumber("");
    }
  };

  // Format phone number when country or local number changes
  useEffect(() => {
    if (!localPhoneNumber.trim()) {
      setFormattedPhoneNumber("");
      setNewMember(prev => ({ ...prev, phoneNumber: "" }));
      return;
    }

    let cleanedLocal = localPhoneNumber.trim();
    cleanedLocal = cleanedLocal.replace(/[\s\-\(\)]/g, "");

    if (cleanedLocal.startsWith("+")) {
      cleanedLocal = cleanedLocal.substring(1);
    }

    const countryCodeWithoutPlus = selectedCountry.code.substring(1);
    if (cleanedLocal.startsWith(countryCodeWithoutPlus)) {
      cleanedLocal = cleanedLocal.substring(countryCodeWithoutPlus.length);
    }

    const completeNumber = selectedCountry.code + cleanedLocal;
    setFormattedPhoneNumber(completeNumber);
    setNewMember(prev => ({ ...prev, phoneNumber: completeNumber }));
  }, [selectedCountry, localPhoneNumber]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalPhoneNumber(e.target.value);
  };

  const handleAddMember = async () => {
    try {
      if (memberType === 'existing') {
        if (!selectedClientId) {
          toast({
            title: 'Please select a member',
            status: 'warning',
            duration: 3000,
            isClosable: true,
          });
          return;
        }
        const selectedClient = clientsData.clients.find((c: any) => c.id === selectedClientId);
        const fullName = `${selectedClient.fName} ${selectedClient.lName}`.trim();
        onMemberAdded(selectedClientId, fullName);
        toast({
          title: 'Member added successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onClose();
        setSelectedClientId('');
      } else {
        if (!newMember.fName || !newMember.email) {
          toast({
            title: 'Please enter required fields',
            description: 'First name and email are required',
            status: 'warning',
            duration: 3000,
            isClosable: true,
          });
          return;
        }
        
        // Phone validation if provided
        if (formattedPhoneNumber && !formattedPhoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
          toast({
            title: 'Invalid Phone Number',
            description: 'Please enter a valid phone number',
            status: 'error',
            duration: 3000,
          });
          return;
        }
        
        const { data } = await createClient({
          variables: {
            input: {
              fName: newMember.fName.trim(),
              lName: newMember.lName.trim(),
              email: newMember.email.trim(),
              phoneNumber: formattedPhoneNumber || undefined,
            }
          }
        });
        const fullName = `${data.createClient.fName} ${data.createClient.lName}`.trim();
        onMemberAdded(data.createClient.id, fullName);
        toast({
          title: 'New member created and added',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onClose();
        setNewMember({ fName: '', lName: '', email: '', phoneNumber: '' });
        setLocalPhoneNumber('');
        setFormattedPhoneNumber('');
        setSelectedCountry(COUNTRY_CODES[0]);
      }
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: 'Error adding member',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Theme-aware styling from brandConfig
  const bg = getColor(colorMode === 'light' ? "background.lightCard" : "background.main", colorMode);
  const cardBorder = getColor(colorMode === 'light' ? "border.lightCard" : "border.darkCard", colorMode);
  const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
  const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
  const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(10px)" />
      <ModalContent
        bg={colorMode === 'light' ? "white" : "rgba(30, 30, 30, 0.98)"}
        backdropFilter="blur(20px)"
        borderColor={cardBorder}
        border="1px solid"
        boxShadow={colorMode === 'light' ? "0 8px 32px 0 rgba(0, 0, 0, 0.2)" : "0 8px 32px 0 rgba(0, 0, 0, 0.5)"}
      >
        <ModalHeader borderBottom="1px" borderColor={cardBorder}>
          <Text color={textPrimary} fontFamily={brandConfig.fonts.heading}>
            Add Team Member
          </Text>
        </ModalHeader>
        <ModalCloseButton 
          color={textSecondary}
          _hover={{ color: textPrimary, bg: "rgba(255, 255, 255, 0.1)" }}
        />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <RadioGroup value={memberType} onChange={(value) => setMemberType(value as 'existing' | 'new')}>
              <Stack direction="row" spacing={4}>
                <Radio value="existing" colorScheme="purple">
                  <Text color={textPrimary}>Existing Member</Text>
                </Radio>
                <Radio value="new" colorScheme="purple">
                  <Text color={textPrimary}>New Member</Text>
                </Radio>
              </Stack>
            </RadioGroup>

            <Divider borderColor={cardBorder} />

            {memberType === 'existing' ? (
              <FormControl>
                <FormLabel color={textPrimary}>Select Member</FormLabel>
                <Select
                  placeholder="Choose a member"
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  bg={colorMode === 'light' ? "white" : "rgba(0, 0, 0, 0.2)"}
                  border="1px"
                  borderColor={cardBorder}
                  color={textPrimary}
                  borderRadius="lg"
                  _placeholder={{ color: textMuted }}
                  _focus={{
                    borderColor: textSecondary,
                    boxShadow: colorMode === 'light' ? "0 0 0 1px rgba(66, 153, 225, 0.6)" : "0 0 0 1px rgba(255, 255, 255, 0.1)"
                  }}
                  _hover={{
                    borderColor: textSecondary
                  }}
                >
                  {clientsData?.clients?.map((client: any) => (
                    <option key={client.id} value={client.id} style={{ backgroundColor: '#2a2a2a', color: '#E5E5E5' }}>
                      {`${client.fName} ${client.lName}`.trim()} - {client.email || 'No email'} {client.phoneNumber ? `- ${client.phoneNumber}` : ''}
                    </option>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <VStack spacing={3}>
                <FormControl isRequired>
                  <FormLabel color={textPrimary}>First Name<Text as="span" color="red.400">*</Text></FormLabel>
                  <Input
                    value={newMember.fName}
                    onChange={(e) => setNewMember({ ...newMember, fName: e.target.value })}
                    placeholder="Enter first name"
                    bg={colorMode === 'light' ? "white" : "rgba(0, 0, 0, 0.2)"}
                    border="1px"
                    borderColor={cardBorder}
                    color={textPrimary}
                    borderRadius="lg"
                    _placeholder={{ color: textMuted }}
                    _focus={{
                      borderColor: textSecondary,
                      boxShadow: colorMode === 'light' ? "0 0 0 1px rgba(66, 153, 225, 0.6)" : "0 0 0 1px rgba(255, 255, 255, 0.1)"
                    }}
                    _hover={{
                      borderColor: textSecondary
                    }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color={textPrimary}>Last Name</FormLabel>
                  <Input
                    value={newMember.lName}
                    onChange={(e) => setNewMember({ ...newMember, lName: e.target.value })}
                    placeholder="Enter last name"
                    bg={colorMode === 'light' ? "white" : "rgba(0, 0, 0, 0.2)"}
                    border="1px"
                    borderColor={cardBorder}
                    color={textPrimary}
                    borderRadius="lg"
                    _placeholder={{ color: textMuted }}
                    _focus={{
                      borderColor: textSecondary,
                      boxShadow: colorMode === 'light' ? "0 0 0 1px rgba(66, 153, 225, 0.6)" : "0 0 0 1px rgba(255, 255, 255, 0.1)"
                    }}
                    _hover={{
                      borderColor: textSecondary
                    }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel color={textPrimary}>Email<Text as="span" color="red.400">*</Text></FormLabel>
                  <Input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    placeholder="Enter email address"
                    bg={colorMode === 'light' ? "white" : "rgba(0, 0, 0, 0.2)"}
                    border="1px"
                    borderColor={cardBorder}
                    color={textPrimary}
                    borderRadius="lg"
                    _placeholder={{ color: textMuted }}
                    _focus={{
                      borderColor: textSecondary,
                      boxShadow: colorMode === 'light' ? "0 0 0 1px rgba(66, 153, 225, 0.6)" : "0 0 0 1px rgba(255, 255, 255, 0.1)"
                    }}
                    _hover={{
                      borderColor: textSecondary
                    }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color={textPrimary}>Phone Number</FormLabel>
                  <VStack spacing={2} align="stretch">
                    <Select
                      value={selectedCountry.code}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      bg={colorMode === 'light' ? "white" : "rgba(0, 0, 0, 0.2)"}
                      border="1px"
                      borderColor={cardBorder}
                      color={textPrimary}
                      borderRadius="lg"
                      _focus={{
                        borderColor: textSecondary,
                        boxShadow: colorMode === 'light' ? "0 0 0 1px rgba(66, 153, 225, 0.6)" : "0 0 0 1px rgba(255, 255, 255, 0.1)"
                      }}
                      _hover={{
                        borderColor: textSecondary
                      }}
                    >
                      {COUNTRY_CODES.map((country) => (
                        <option key={country.code} value={country.code} style={{ backgroundColor: '#2a2a2a', color: '#E5E5E5' }}>
                          {country.flag} {country.name} ({country.code})
                        </option>
                      ))}
                    </Select>
                    <InputGroup>
                      <InputLeftAddon
                        bg={colorMode === 'light' ? "gray.100" : "rgba(0, 0, 0, 0.3)"}
                        borderColor={cardBorder}
                        color={textPrimary}
                      >
                        {selectedCountry.code}
                      </InputLeftAddon>
                      <Input
                        type="tel"
                        value={localPhoneNumber}
                        onChange={handlePhoneChange}
                        placeholder="Enter phone number"
                        bg={colorMode === 'light' ? "white" : "rgba(0, 0, 0, 0.2)"}
                        border="1px"
                        borderColor={cardBorder}
                        color={textPrimary}
                        _placeholder={{ color: textMuted }}
                        _focus={{
                          borderColor: textSecondary,
                          boxShadow: colorMode === 'light' ? "0 0 0 1px rgba(66, 153, 225, 0.6)" : "0 0 0 1px rgba(255, 255, 255, 0.1)"
                        }}
                        _hover={{
                          borderColor: textSecondary
                        }}
                      />
                    </InputGroup>
                    {formattedPhoneNumber && (
                      <FormHelperText color={textSecondary}>
                        Formatted: {formattedPhoneNumber}
                      </FormHelperText>
                    )}
                  </VStack>
                </FormControl>
              </VStack>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button
              variant="outline"
              onClick={onClose}
              borderColor={cardBorder}
              color={textPrimary}
              bg={colorMode === 'light' ? "white" : "rgba(0, 0, 0, 0.2)"}
              _hover={{
                borderColor: textSecondary,
                bg: colorMode === 'light' ? "gray.50" : "rgba(255, 255, 255, 0.05)"
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddMember}
              bg={getColor("components.button.primaryBg")}
              color="white"
              _hover={{ 
                bg: getColor("components.button.primaryHover"),
                transform: "translateY(-2px)"
              }}
              isLoading={clientsLoading}
              loadingText="Adding..."
              boxShadow="0 2px 4px rgba(0, 122, 255, 0.2)"
            >
              {memberType === 'existing' ? 'Add Member' : 'Create & Add Member'}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};