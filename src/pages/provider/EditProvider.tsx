import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { gql, useQuery, useMutation } from "@apollo/client";
import {
    Box,
    Container,
    Grid,
    Text,
    Button,
    Heading,
    Stack,
    VStack,
    HStack,
    Input,
    FormControl,
    FormLabel,
    Textarea,
    SimpleGrid,
    useToast,
    Switch,
    Badge,
    Card,
    Divider,
    CardHeader,
    CardBody,
    IconButton,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Select,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Spinner,
    Center,
    FormErrorMessage,
    Tooltip,
} from "@chakra-ui/react";
import { 
    AddIcon, 
    DeleteIcon, 
    CheckIcon, 
    ArrowBackIcon,
    ViewIcon,
    InfoIcon
} from "@chakra-ui/icons";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { useAuth } from "../../contexts/AuthContext";
import { getColor, getComponent, brandConfig } from "../../brandConfig";
import { useColorMode } from "@chakra-ui/react";

const GET_MY_PROVIDER = gql`
  query GetMyProvider {
    myProvider {
      id
      title
      tagline
      description
      avatar
      heroImage
      roles {
        role
        organization
      }
      experience {
        title
        company
        period
        description
        achievements
      }
      education {
        degree
        institution
        year
        description
      }
      skills {
        name
        level
        endorsements
      }
      expertise
      achievements
      testimonials {
        name
        location
        rating
        text
        avatar
      }
      contactInfo {
        email
        phone
        website
        linkedIn
        twitter
        instagram
        facebook
      }
      availability {
        schedule
        timezone
        notes
      }
      featuredProductIds
      status
      aboutStory
      portfolioUrl
      urlSlug
      isPublic
      client {
        id
        fName
        lName
        email
      }
    }
  }
`;

const CREATE_PROVIDER = gql`
  mutation CreateProvider($input: CreateProviderInput!) {
    createProvider(input: $input) {
      id
      title
      tagline
      description
      status
      isPublic
    }
  }
`;

const UPDATE_PROVIDER = gql`
  mutation UpdateProvider($id: ID!, $input: UpdateProviderInput!) {
    updateProvider(id: $id, input: $input) {
      id
      title
      tagline
      description
      status
      isPublic
    }
  }
`;

const UPLOAD_UNENCRYPTED_FILE = gql`
  mutation UploadUnencrypted($file: Upload!) {
    uploadUnencryptedFile(file: $file)
  }
`;

const IMPROVE_TEXT = gql`
  mutation ImproveText($text: String!, $type: String!, $context: String) {
    improveText(text: $text, type: $type, context: $context)
  }
`;

const IMPROVE_TAGLINE = gql`
  mutation ImproveTagline($text: String!, $context: String) {
    improveTagline(text: $text, context: $context)
  }
`;

const IMPROVE_DESCRIPTION = gql`
  mutation ImproveDescription($text: String!, $context: String) {
    improveDescription(text: $text, context: $context)
  }
`;

const GENERATE_HERO_IMAGE = gql`
  mutation GenerateHeroImage($prompt: String!, $style: String) {
    generateHeroImage(prompt: $prompt, style: $style)
  }
`;

const UPDATE_PROVIDER_URL_SLUG = gql`
  mutation UpdateProviderUrlSlug($id: ID!, $urlSlug: String!) {
    updateProviderUrlSlug(id: $id, urlSlug: $urlSlug)
  }
`;

const IS_URL_SLUG_AVAILABLE = gql`
  query IsUrlSlugAvailable($urlSlug: String!, $excludeId: ID) {
    isUrlSlugAvailable(urlSlug: $urlSlug, excludeId: $excludeId)
  }
`;

const skillLevels = [
    { value: "BEGINNER", label: "Beginner" },
    { value: "INTERMEDIATE", label: "Intermediate" },
    { value: "ADVANCED", label: "Advanced" },
    { value: "EXPERT", label: "Expert" }
];

const statusOptions = [
    { value: "DRAFT", label: "Draft" },
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" }
];

const timezoneOptions = [
    { value: "", label: "Select Timezone" },
    // Americas
    { value: "America/New_York", label: "Eastern Time (US & Canada)" },
    { value: "America/Chicago", label: "Central Time (US & Canada)" },
    { value: "America/Denver", label: "Mountain Time (US & Canada)" },
    { value: "America/Los_Angeles", label: "Pacific Time (US & Canada)" },
    { value: "America/Phoenix", label: "Arizona" },
    { value: "America/Toronto", label: "Eastern Time (Canada)" },
    { value: "America/Vancouver", label: "Pacific Time (Canada)" },
    { value: "America/Mexico_City", label: "Mexico City" },
    { value: "America/Sao_Paulo", label: "São Paulo" },
    { value: "America/Buenos_Aires", label: "Buenos Aires" },
    
    // Europe
    { value: "Europe/London", label: "London" },
    { value: "Europe/Paris", label: "Paris" },
    { value: "Europe/Berlin", label: "Berlin" },
    { value: "Europe/Rome", label: "Rome" },
    { value: "Europe/Madrid", label: "Madrid" },
    { value: "Europe/Amsterdam", label: "Amsterdam" },
    { value: "Europe/Stockholm", label: "Stockholm" },
    { value: "Europe/Moscow", label: "Moscow" },
    { value: "Europe/Athens", label: "Athens" },
    { value: "Europe/Dublin", label: "Dublin" },
    
    // Asia
    { value: "Asia/Tokyo", label: "Tokyo" },
    { value: "Asia/Seoul", label: "Seoul" },
    { value: "Asia/Shanghai", label: "Shanghai" },
    { value: "Asia/Hong_Kong", label: "Hong Kong" },
    { value: "Asia/Singapore", label: "Singapore" },
    { value: "Asia/Bangkok", label: "Bangkok" },
    { value: "Asia/Mumbai", label: "Mumbai" },
    { value: "Asia/Dubai", label: "Dubai" },
    { value: "Asia/Jakarta", label: "Jakarta" },
    { value: "Asia/Manila", label: "Manila" },
    { value: "Asia/Kolkata", label: "Kolkata" },
    { value: "Asia/Karachi", label: "Karachi" },
    
    // Australia & Pacific
    { value: "Australia/Sydney", label: "Sydney" },
    { value: "Australia/Melbourne", label: "Melbourne" },
    { value: "Australia/Brisbane", label: "Brisbane" },
    { value: "Australia/Perth", label: "Perth" },
    { value: "Australia/Adelaide", label: "Adelaide" },
    { value: "Australia/Darwin", label: "Darwin" },
    { value: "Pacific/Auckland", label: "Auckland" },
    { value: "Pacific/Honolulu", label: "Honolulu" },
    { value: "Pacific/Fiji", label: "Fiji" },
    
    // Africa
    { value: "Africa/Cairo", label: "Cairo" },
    { value: "Africa/Johannesburg", label: "Johannesburg" },
    { value: "Africa/Lagos", label: "Lagos" },
    { value: "Africa/Nairobi", label: "Nairobi" },
    
    // Middle East
    { value: "Asia/Jerusalem", label: "Jerusalem" },
    { value: "Asia/Tehran", label: "Tehran" },
    { value: "Asia/Riyadh", label: "Riyadh" },
    
    // UTC
    { value: "UTC", label: "UTC (Coordinated Universal Time)" }
];

const scheduleTemplates = [
    { value: "", label: "Select a schedule template" },
    { value: "Monday - Friday, 9:00 AM - 5:00 PM", label: "Standard Business Hours (9-5, Mon-Fri)" },
    { value: "Monday - Friday, 8:00 AM - 6:00 PM", label: "Extended Business Hours (8-6, Mon-Fri)" },
    { value: "Monday - Friday, 9:00 AM - 5:00 PM\nSaturday, 9:00 AM - 1:00 PM", label: "Business Hours + Saturday Morning" },
    { value: "Monday - Saturday, 9:00 AM - 5:00 PM", label: "Six Days a Week (9-5, Mon-Sat)" },
    { value: "Monday - Friday, 6:00 AM - 10:00 AM\nMonday - Friday, 6:00 PM - 9:00 PM", label: "Early Morning & Evening (Mon-Fri)" },
    { value: "Monday - Friday, 7:00 PM - 10:00 PM\nWeekends, 9:00 AM - 5:00 PM", label: "Evenings & Weekends" },
    { value: "Available by appointment only", label: "By Appointment Only" },
    { value: "24/7 availability for urgent matters", label: "24/7 Availability" },
    { value: "Flexible hours - please contact to schedule", label: "Flexible Hours" },
    { value: "custom", label: "Custom Schedule (write your own)" }
];

interface FormData {
    title: string;
    tagline: string;
    description: string;
    avatar: string;
    heroImage: string;
    roles: Array<{
        role: string;
        organization: string;
    }>;
    experience: Array<{
        title: string;
        company: string;
        period: string;
        description: string;
        achievements: string[];
    }>;
    education: Array<{
        degree: string;
        institution: string;
        year: string;
        description: string;
    }>;
    skills: Array<{
        name: string;
        level: string;
        endorsements: number;
    }>;
    expertise: string[];
    achievements: string[];
    testimonials: Array<{
        name: string;
        location: string;
        rating: number;
        text: string;
        avatar: string;
    }>;
    contactInfo: {
        email: string;
        phone: string;
        website: string;
        linkedIn: string;
        twitter: string;
        instagram: string;
        facebook: string;
    };
    availability: {
        schedule: string;
        timezone: string;
        notes: string;
    };
    featuredProductIds: string[];
    status: string;
    aboutStory: string;
    portfolioUrl: string;
    urlSlug: string;
    isPublic: boolean;
    allowedEditors: string[];
}

const EditProvider = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const { isAuthenticated, user } = useAuth();
    const { colorMode } = useColorMode();

    // Theme-aware colors
    const bg = getColor(colorMode === 'light' ? "background.main" : "background.main", colorMode);
    const cardGradientBg = getColor(colorMode === 'light' ? "background.card" : "background.cardGradient", colorMode);
    const cardBorder = getColor(colorMode === 'light' ? "border.light" : "border.darkCard", colorMode);
    const textPrimary = getColor(colorMode === 'light' ? "text.primary" : "text.primaryDark", colorMode);
    const textSecondary = getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode);
    const textMuted = getColor(colorMode === 'light' ? "text.muted" : "text.mutedDark", colorMode);

    const [formData, setFormData] = useState<FormData>({
        title: "",
        tagline: "",
        description: "",
        avatar: "",
        heroImage: "",
        roles: [],
        experience: [],
        education: [],
        skills: [],
        expertise: [],
        achievements: [],
        testimonials: [],
        contactInfo: {
            email: "",
            phone: "",
            website: "",
            linkedIn: "",
            twitter: "",
            instagram: "",
            facebook: ""
        },
        availability: {
            schedule: "",
            timezone: "",
            notes: ""
        },
        featuredProductIds: [],
        status: "DRAFT",
        aboutStory: "",
        portfolioUrl: "",
        urlSlug: "",
        isPublic: false,
        allowedEditors: []
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // AI improvement states
    const [isImprovingTitle, setIsImprovingTitle] = useState(false);
    const [isImprovingTagline, setIsImprovingTagline] = useState(false);
    const [isImprovingDescription, setIsImprovingDescription] = useState(false);
    const [isImprovingAboutStory, setIsImprovingAboutStory] = useState(false);
    const [improvingExperienceIndex, setImprovingExperienceIndex] = useState<number | null>(null);
    const [improvingEducationIndex, setImprovingEducationIndex] = useState<number | null>(null);
    
    // Hero image generation states
    const [heroImagePrompt, setHeroImagePrompt] = useState("");
    const [isGeneratingHeroImage, setIsGeneratingHeroImage] = useState(false);
    
    // URL slug save state
    const [isSavingUrlSlug, setIsSavingUrlSlug] = useState(false);
    
    // Section save states
    const [isSavingRoles, setIsSavingRoles] = useState(false);
    const [isSavingExperience, setIsSavingExperience] = useState(false);
    const [isSavingEducation, setIsSavingEducation] = useState(false);
    const [isSavingSkills, setIsSavingSkills] = useState(false);
    const [isSavingExpertise, setIsSavingExpertise] = useState(false);
    const [isSavingAchievements, setIsSavingAchievements] = useState(false);
    
    // Schedule template state
    const [isCustomSchedule, setIsCustomSchedule] = useState(false);

    const { loading, error, data } = useQuery(GET_MY_PROVIDER, {
        skip: !isAuthenticated,
        fetchPolicy: 'cache-and-network'
    });

    const [createProvider] = useMutation(CREATE_PROVIDER);
    const [updateProvider] = useMutation(UPDATE_PROVIDER);
    const [uploadFile] = useMutation(UPLOAD_UNENCRYPTED_FILE);
    
    // AI improvement mutations
    const [improveTextMutation] = useMutation(IMPROVE_TEXT);
    const [improveTaglineMutation] = useMutation(IMPROVE_TAGLINE);
    const [improveDescriptionMutation] = useMutation(IMPROVE_DESCRIPTION);
    const [generateHeroImageMutation] = useMutation(GENERATE_HERO_IMAGE);
    
    // URL slug mutations
    const [updateUrlSlugMutation] = useMutation(UPDATE_PROVIDER_URL_SLUG);
    const { refetch: checkSlugAvailability } = useQuery(IS_URL_SLUG_AVAILABLE, {
        skip: true
    });

    const isEditing = !!data?.myProvider;

    useEffect(() => {
        if (data?.myProvider) {
            const provider = data.myProvider;
            setFormData({
                title: provider.title || "",
                tagline: provider.tagline || "",
                description: provider.description || "",
                avatar: provider.avatar || "",
                heroImage: provider.heroImage || "",
                roles: provider.roles || [],
                experience: provider.experience || [],
                education: provider.education || [],
                skills: provider.skills || [],
                expertise: provider.expertise || [],
                achievements: provider.achievements || [],
                testimonials: provider.testimonials || [],
                contactInfo: provider.contactInfo || {
                    email: "",
                    phone: "",
                    website: "",
                    linkedIn: "",
                    twitter: "",
                    instagram: "",
                    facebook: ""
                },
                availability: provider.availability || {
                    schedule: "",
                    timezone: "",
                    notes: ""
                },
                featuredProductIds: provider.featuredProductIds || [],
                status: provider.status || "DRAFT",
                aboutStory: provider.aboutStory || "",
                portfolioUrl: provider.portfolioUrl || "",
                urlSlug: provider.urlSlug || "",
                isPublic: provider.isPublic || false,
                allowedEditors: []
            });
        }
    }, [data]);

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = `${isEditing ? 'Edit' : 'Create'} Provider Profile | ${brandConfig.siteName}`;
    }, [isEditing]);

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ""
            }));
        }
    };

    const handleNestedInputChange = (field: string, subField: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: {
                ...prev[field as keyof FormData] as any,
                [subField]: value
            }
        }));
    };

    const handleScheduleTemplateChange = (templateValue: string) => {
        if (templateValue === "custom") {
            setIsCustomSchedule(true);
            // Don't change the schedule value, let user write their own
        } else {
            setIsCustomSchedule(false);
            if (templateValue !== "") {
                handleNestedInputChange("availability", "schedule", templateValue);
            }
        }
    };

    const handleArrayInputChange = (field: string, index: number, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: (prev[field as keyof FormData] as any[]).map((item, i) =>
                i === index ? value : item
            )
        }));
    };

    const addArrayItem = (field: string, template: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...(prev[field as keyof FormData] as any[]), template]
        }));
    };

    const removeArrayItem = (field: string, index: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: (prev[field as keyof FormData] as any[]).filter((_, i) => i !== index)
        }));
    };


    const handleImageUpload = async (file: File, field: string) => {
        try {
            // Upload the file to IPFS
            const { data: uploadData } = await uploadFile({
                variables: { file },
                context: {
                    headers: {
                        "apollo-require-preflight": "true",
                        "x-apollo-operation-name": "UploadUnencryptedFile"
                    }
                }
            });

            const hash = uploadData.uploadUnencryptedFile;
            const imageUrl = `https://gateway.lighthouse.storage/ipfs/${hash}`;
            
            // Update the form data immediately
            handleInputChange(field, imageUrl);
            
            // Auto-save to MongoDB if editing existing provider
            if (isEditing && data?.myProvider) {
                try {
                    await updateProvider({
                        variables: {
                            id: data.myProvider.id,
                            input: {
                                [field]: imageUrl
                            }
                        }
                    });
                    
                    toast({
                        title: "✅ Image uploaded and saved!",
                        description: `${field === 'avatar' ? 'Profile avatar' : 'Hero image'} updated successfully`,
                        status: "success",
                        duration: 3000,
                    });
                } catch (saveError) {
                    toast({
                        title: "Image uploaded but save failed",
                        description: "The image was uploaded but couldn't be saved to your profile. Please try updating your profile manually.",
                        status: "warning",
                        duration: 5000,
                    });
                }
            } else {
                toast({
                    title: "Image uploaded successfully",
                    description: "Image ready - remember to save your profile to keep it",
                    status: "success",
                    duration: 3000,
                });
            }

        } catch (error) {
            toast({
                title: "Upload failed",
                description: error instanceof Error ? error.message : "Unknown error occurred",
                status: "error",
                duration: 5000,
            });
        }
    };

    // Helper function to clean AI responses
    const cleanAIResponse = (text: string): string => {
        // Remove surrounding quotes if present
        let cleaned = text.trim();
        if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
            (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
            cleaned = cleaned.slice(1, -1);
        }
        
        // Remove any preamble text like "Here is the improved..."
        const patterns = [
            /^Here is the improved [^:]*:\s*/i,
            /^Improved [^:]*:\s*/i,
            /^The improved [^:]*:\s*/i
        ];
        
        for (const pattern of patterns) {
            cleaned = cleaned.replace(pattern, '');
        }
        
        return cleaned.trim();
    };

    // AI improvement handlers

    const handleImproveTitle = async () => {
        const value = formData.title;
        if (!value.trim()) {
            toast({
                title: "No text to improve",
                description: "Please enter a title first",
                status: "warning",
                duration: 3000,
            });
            return;
        }

        setIsImprovingTitle(true);
        try {
            const context = `Please improve the grammar and professional tone of this title while keeping the core meaning and specific details exactly the same. Only fix grammar and make it sound more professional - do not replace with generic content. Return ONLY the improved text without any preamble, explanation, or quotes. Original title: "${value}"`;
            const { data } = await improveTaglineMutation({
                variables: { text: value, context }
            });

            if (data?.improveTagline) {
                handleInputChange('title', cleanAIResponse(data.improveTagline));
                toast({
                    title: "✨ Title improved!",
                    description: "Claude has enhanced your professional title",
                    status: "success",
                    duration: 3000,
                });
            }
        } catch (error) {
            console.error('Error improving title:', error);
            toast({
                title: "Improvement failed",
                description: error instanceof Error ? error.message : "Failed to improve title. Please try again.",
                status: "error",
                duration: 5000,
            });
        } finally {
            setIsImprovingTitle(false);
        }
    };

    const handleImproveTagline = async () => {
        const value = formData.tagline;
        if (!value.trim()) {
            toast({
                title: "No text to improve",
                description: "Please enter a tagline first",
                status: "warning",
                duration: 3000,
            });
            return;
        }

        setIsImprovingTagline(true);
        try {
            const context = `Please improve the grammar and professional tone of this tagline while keeping the core message and specific details exactly the same. Only fix grammar and make it flow better - do not replace with generic content. Return ONLY the improved text without any preamble, explanation, or quotes. Original tagline: "${value}"`;
            const { data } = await improveTaglineMutation({
                variables: { text: value, context }
            });

            if (data?.improveTagline) {
                handleInputChange('tagline', cleanAIResponse(data.improveTagline));
                toast({
                    title: "✨ Tagline improved!",
                    description: "Claude has enhanced your tagline",
                    status: "success",
                    duration: 3000,
                });
            }
        } catch (error) {
            console.error('Error improving tagline:', error);
            toast({
                title: "Improvement failed",
                description: error instanceof Error ? error.message : "Failed to improve tagline. Please try again.",
                status: "error",
                duration: 5000,
            });
        } finally {
            setIsImprovingTagline(false);
        }
    };

    const handleImproveDescription = async () => {
        const value = formData.description;
        if (!value.trim()) {
            toast({
                title: "No text to improve",
                description: "Please enter a description first",
                status: "warning",
                duration: 3000,
            });
            return;
        }

        setIsImprovingDescription(true);
        try {
            const context = `Please improve the grammar, spelling, and professional tone of this personal description while keeping ALL the original facts, personal details, and story elements exactly as written. IMPORTANT: Return the COMPLETE improved text - do not truncate or cut off any content. Keep the full length intact. Do not replace with generic content. Return ONLY the improved text without any preamble, explanation, or quotes. Full original text to improve: "${value}"`;
            const { data } = await improveDescriptionMutation({
                variables: { text: value, context }
            });

            if (data?.improveDescription) {
                handleInputChange('description', cleanAIResponse(data.improveDescription));
                toast({
                    title: "✨ Description improved!",
                    description: "Claude has enhanced your description",
                    status: "success",
                    duration: 3000,
                });
            }
        } catch (error) {
            console.error('Error improving description:', error);
            toast({
                title: "Improvement failed",
                description: error instanceof Error ? error.message : "Failed to improve description. Please try again.",
                status: "error",
                duration: 5000,
            });
        } finally {
            setIsImprovingDescription(false);
        }
    };

    const handleImproveAboutStory = async () => {
        const value = formData.aboutStory;
        if (!value.trim()) {
            toast({
                title: "No text to improve",
                description: "Please enter your story first",
                status: "warning",
                duration: 3000,
            });
            return;
        }

        setIsImprovingAboutStory(true);
        try {
            const context = `Please improve the grammar, spelling, and professional tone of this personal story while preserving ALL original personal details, locations, experiences, and narrative elements exactly as written. IMPORTANT: Return the COMPLETE improved text - do not truncate or cut off the story. Keep the full length and all content intact. Only fix grammar and make it flow better - do not replace with generic content. Return ONLY the improved text without any preamble, explanation, or quotes. Full original text to improve: "${value}"`;
            const { data } = await improveDescriptionMutation({
                variables: { text: value, context }
            });

            if (data?.improveDescription) {
                handleInputChange('aboutStory', cleanAIResponse(data.improveDescription));
                toast({
                    title: "✨ Story improved!",
                    description: "Claude has enhanced your professional story",
                    status: "success",
                    duration: 3000,
                });
            }
        } catch (error) {
            console.error('Error improving story:', error);
            toast({
                title: "Improvement failed",
                description: error instanceof Error ? error.message : "Failed to improve story. Please try again.",
                status: "error",
                duration: 5000,
            });
        } finally {
            setIsImprovingAboutStory(false);
        }
    };

    const handleGenerateHeroImage = async () => {
        if (!heroImagePrompt.trim()) {
            toast({
                title: "No prompt provided",
                description: "Please enter a description for your hero image",
                status: "warning",
                duration: 3000,
            });
            return;
        }

        setIsGeneratingHeroImage(true);
        try {
            // Generate the image via AI
            const { data } = await generateHeroImageMutation({
                variables: {
                    prompt: heroImagePrompt,
                    style: "professional"
                }
            });

            if (data?.generateHeroImage) {
                const tempImageUrl = data.generateHeroImage;
                
                // Fetch the generated image as a blob
                const response = await fetch(tempImageUrl);
                const blob = await response.blob();
                
                // Convert blob to File object
                const file = new File([blob], 'generated-hero-image.jpg', { type: 'image/jpeg' });
                
                // Upload to IPFS and save to MongoDB using existing function
                await handleImageUpload(file, 'heroImage');
                
                setHeroImagePrompt(""); // Clear the prompt
                toast({
                    title: "🎨 Hero image generated and saved!",
                    description: "Your AI-generated hero image has been uploaded and saved to your profile",
                    status: "success",
                    duration: 3000,
                });
            }
        } catch (error) {
            console.error('Error generating hero image:', error);
            toast({
                title: "Generation failed",
                description: error instanceof Error ? error.message : "Failed to generate hero image. Please try again.",
                status: "error",
                duration: 5000,
            });
        } finally {
            setIsGeneratingHeroImage(false);
        }
    };

    const handleSaveUrlSlug = async () => {
        if (!formData.urlSlug.trim()) {
            toast({
                title: "No URL slug provided",
                description: "Please enter a URL slug first",
                status: "warning",
                duration: 3000,
            });
            return;
        }

        if (!isEditing) {
            toast({
                title: "Profile not saved yet",
                description: "Please save your profile first before setting the URL slug",
                status: "warning",
                duration: 3000,
            });
            return;
        }

        setIsSavingUrlSlug(true);
        try {
            // First check if the slug is available
            const { data: availabilityData } = await checkSlugAvailability({
                urlSlug: formData.urlSlug,
                excludeId: data.myProvider.id
            });

            if (!availabilityData?.isUrlSlugAvailable) {
                toast({
                    title: "URL slug not available",
                    description: "This URL slug is already taken. Please choose another one.",
                    status: "error",
                    duration: 5000,
                });
                return;
            }

            // Save the URL slug
            await updateUrlSlugMutation({
                variables: {
                    id: data.myProvider.id,
                    urlSlug: formData.urlSlug
                }
            });

            toast({
                title: "✅ URL slug saved!",
                description: `Your profile is now available at /provider/${formData.urlSlug}`,
                status: "success",
                duration: 5000,
            });
        } catch (error) {
            console.error('Error saving URL slug:', error);
            toast({
                title: "Save failed",
                description: error instanceof Error ? error.message : "Failed to save URL slug. Please try again.",
                status: "error",
                duration: 5000,
            });
        } finally {
            setIsSavingUrlSlug(false);
        }
    };

    const handleSaveCurrentImage = async () => {
        if (!formData.heroImage) {
            toast({
                title: "No image to save",
                description: "No hero image found to save",
                status: "warning",
                duration: 3000,
            });
            return;
        }

        try {
            // Show loading state
            toast({
                title: "💾 Saving image...",
                description: "Downloading and uploading image to IPFS",
                status: "info",
                duration: 2000,
            });

            // Fetch the current image as a blob
            const response = await fetch(formData.heroImage);
            const blob = await response.blob();
            
            // Convert blob to File object
            const file = new File([blob], 'hero-image.jpg', { type: 'image/jpeg' });
            
            // Upload to IPFS and save to MongoDB using existing function
            await handleImageUpload(file, 'heroImage');
            
        } catch (error) {
            console.error('Error saving current image:', error);
            toast({
                title: "Save failed",
                description: error instanceof Error ? error.message : "Failed to save image. Please try again.",
                status: "error",
                duration: 5000,
            });
        }
    };

    const handleImproveExperienceDescription = async (index: number) => {
        const experience = formData.experience[index];
        const value = experience.description;
        
        if (!value.trim()) {
            toast({
                title: "No text to improve",
                description: "Please enter a description first",
                status: "warning",
                duration: 3000,
            });
            return;
        }

        setImprovingExperienceIndex(index);
        try {
            const context = `Please improve the grammar, spelling, and professional tone of this job experience description while preserving ALL original details, responsibilities, and achievements exactly as written. IMPORTANT: Return the COMPLETE improved text - do not truncate or cut off any content. Keep the full length intact. Only fix grammar and make it flow better - do not replace with generic content. Return ONLY the improved text without any preamble, explanation, or quotes. Job context: ${experience.title} at ${experience.company}. Full original text to improve: "${value}"`;
            
            const { data } = await improveDescriptionMutation({
                variables: { text: value, context }
            });

            if (data?.improveDescription) {
                const improvedText = cleanAIResponse(data.improveDescription);
                handleArrayInputChange("experience", index, {
                    ...experience,
                    description: improvedText
                });
                
                toast({
                    title: "✨ Experience description improved!",
                    description: "Claude has enhanced your job description",
                    status: "success",
                    duration: 3000,
                });
            }
        } catch (error) {
            console.error('Error improving experience description:', error);
            toast({
                title: "Improvement failed",
                description: error instanceof Error ? error.message : "Failed to improve description. Please try again.",
                status: "error",
                duration: 5000,
            });
        } finally {
            setImprovingExperienceIndex(null);
        }
    };

    const handleImproveEducationDescription = async (index: number) => {
        const education = formData.education[index];
        const value = education.description;
        
        if (!value.trim()) {
            toast({
                title: "No text to improve",
                description: "Please enter a description first",
                status: "warning",
                duration: 3000,
            });
            return;
        }

        setImprovingEducationIndex(index);
        try {
            const context = `Please improve the grammar, spelling, and professional tone of this education/certification description while preserving ALL original details, achievements, and learning outcomes exactly as written. IMPORTANT: Return the COMPLETE improved text - do not truncate or cut off any content. Keep the full length intact. Only fix grammar and make it flow better - do not replace with generic content. Return ONLY the improved text without any preamble, explanation, or quotes. Education context: ${education.degree} from ${education.institution} (${education.year}). Full original text to improve: "${value}"`;
            
            const { data } = await improveDescriptionMutation({
                variables: { text: value, context }
            });

            if (data?.improveDescription) {
                const improvedText = cleanAIResponse(data.improveDescription);
                handleArrayInputChange("education", index, {
                    ...education,
                    description: improvedText
                });
                
                toast({
                    title: "✨ Education description improved!",
                    description: "Claude has enhanced your education description",
                    status: "success",
                    duration: 3000,
                });
            }
        } catch (error) {
            console.error('Error improving education description:', error);
            toast({
                title: "Improvement failed",
                description: error instanceof Error ? error.message : "Failed to improve description. Please try again.",
                status: "error",
                duration: 5000,
            });
        } finally {
            setImprovingEducationIndex(null);
        }
    };

    const handleSaveRoles = async () => {
        if (!isEditing || !data?.myProvider) {
            toast({
                title: "Profile not found",
                description: "Please save your profile first",
                status: "warning",
                duration: 3000,
            });
            return;
        }

        setIsSavingRoles(true);
        try {
            // Helper function to remove __typename from objects
            const cleanObject = (obj: any): any => {
                if (Array.isArray(obj)) {
                    return obj.map(cleanObject);
                } else if (obj !== null && typeof obj === 'object') {
                    const cleaned: any = {};
                    for (const [key, value] of Object.entries(obj)) {
                        if (key !== '__typename') {
                            cleaned[key] = cleanObject(value);
                        }
                    }
                    return cleaned;
                }
                return obj;
            };

            await updateProvider({
                variables: {
                    id: data.myProvider.id,
                    input: {
                        roles: cleanObject(formData.roles)
                    }
                }
            });
            
            toast({
                title: "✅ Roles saved!",
                description: "Your current roles & organizations have been updated",
                status: "success",
                duration: 3000,
            });
        } catch (error) {
            toast({
                title: "Save failed",
                description: error instanceof Error ? error.message : "Failed to save roles",
                status: "error",
                duration: 5000,
            });
        } finally {
            setIsSavingRoles(false);
        }
    };

    const handleSaveExperience = async () => {
        if (!isEditing || !data?.myProvider) {
            toast({
                title: "Profile not found",
                description: "Please save your profile first",
                status: "warning",
                duration: 3000,
            });
            return;
        }

        setIsSavingExperience(true);
        try {
            // Helper function to remove __typename from objects
            const cleanObject = (obj: any): any => {
                if (Array.isArray(obj)) {
                    return obj.map(cleanObject);
                } else if (obj !== null && typeof obj === 'object') {
                    const cleaned: any = {};
                    for (const [key, value] of Object.entries(obj)) {
                        if (key !== '__typename') {
                            cleaned[key] = cleanObject(value);
                        }
                    }
                    return cleaned;
                }
                return obj;
            };

            await updateProvider({
                variables: {
                    id: data.myProvider.id,
                    input: {
                        experience: cleanObject(formData.experience)
                    }
                }
            });
            
            toast({
                title: "✅ Experience saved!",
                description: "Your professional experience has been updated",
                status: "success",
                duration: 3000,
            });
        } catch (error) {
            toast({
                title: "Save failed",
                description: error instanceof Error ? error.message : "Failed to save experience",
                status: "error",
                duration: 5000,
            });
        } finally {
            setIsSavingExperience(false);
        }
    };

    const handleSaveEducation = async () => {
        if (!isEditing || !data?.myProvider) {
            toast({
                title: "Profile not found",
                description: "Please save your profile first",
                status: "warning",
                duration: 3000,
            });
            return;
        }

        setIsSavingEducation(true);
        try {
            // Helper function to remove __typename from objects
            const cleanObject = (obj: any): any => {
                if (Array.isArray(obj)) {
                    return obj.map(cleanObject);
                } else if (obj !== null && typeof obj === 'object') {
                    const cleaned: any = {};
                    for (const [key, value] of Object.entries(obj)) {
                        if (key !== '__typename') {
                            cleaned[key] = cleanObject(value);
                        }
                    }
                    return cleaned;
                }
                return obj;
            };

            await updateProvider({
                variables: {
                    id: data.myProvider.id,
                    input: {
                        education: cleanObject(formData.education)
                    }
                }
            });
            
            toast({
                title: "✅ Education saved!",
                description: "Your education & certifications have been updated",
                status: "success",
                duration: 3000,
            });
        } catch (error) {
            toast({
                title: "Save failed",
                description: error instanceof Error ? error.message : "Failed to save education",
                status: "error",
                duration: 5000,
            });
        } finally {
            setIsSavingEducation(false);
        }
    };

    const handleSaveSkills = async () => {
        if (!isEditing || !data?.myProvider) {
            toast({
                title: "Profile not found",
                description: "Please save your profile first",
                status: "warning",
                duration: 3000,
            });
            return;
        }

        setIsSavingSkills(true);
        try {
            // Helper function to remove __typename from objects
            const cleanObject = (obj: any): any => {
                if (Array.isArray(obj)) {
                    return obj.map(cleanObject);
                } else if (obj !== null && typeof obj === 'object') {
                    const cleaned: any = {};
                    for (const [key, value] of Object.entries(obj)) {
                        if (key !== '__typename') {
                            cleaned[key] = cleanObject(value);
                        }
                    }
                    return cleaned;
                }
                return obj;
            };

            await updateProvider({
                variables: {
                    id: data.myProvider.id,
                    input: {
                        skills: cleanObject(formData.skills),
                        expertise: formData.expertise,
                        achievements: formData.achievements
                    }
                }
            });
            
            toast({
                title: "✅ Skills & Expertise saved!",
                description: "Your skills and expertise have been updated",
                status: "success",
                duration: 3000,
            });
        } catch (error) {
            toast({
                title: "Save failed",
                description: error instanceof Error ? error.message : "Failed to save skills",
                status: "error",
                duration: 5000,
            });
        } finally {
            setIsSavingSkills(false);
        }
    };

    const handleSaveExpertise = async () => {
        if (!isEditing || !data?.myProvider) {
            toast({
                title: "Profile not found",
                description: "Please save your profile first",
                status: "warning",
                duration: 3000,
            });
            return;
        }

        setIsSavingExpertise(true);
        try {
            await updateProvider({
                variables: {
                    id: data.myProvider.id,
                    input: {
                        expertise: formData.expertise
                    }
                }
            });
            
            toast({
                title: "✅ Expertise saved!",
                description: "Your expertise areas have been updated",
                status: "success",
                duration: 3000,
            });
        } catch (error) {
            toast({
                title: "Save failed",
                description: error instanceof Error ? error.message : "Failed to save expertise",
                status: "error",
                duration: 5000,
            });
        } finally {
            setIsSavingExpertise(false);
        }
    };

    const handleSaveAchievements = async () => {
        if (!isEditing || !data?.myProvider) {
            toast({
                title: "Profile not found",
                description: "Please save your profile first",
                status: "warning",
                duration: 3000,
            });
            return;
        }

        setIsSavingAchievements(true);
        try {
            await updateProvider({
                variables: {
                    id: data.myProvider.id,
                    input: {
                        achievements: formData.achievements
                    }
                }
            });
            
            toast({
                title: "✅ Achievements saved!",
                description: "Your key achievements have been updated",
                status: "success",
                duration: 3000,
            });
        } catch (error) {
            toast({
                title: "Save failed",
                description: error instanceof Error ? error.message : "Failed to save achievements",
                status: "error",
                duration: 5000,
            });
        } finally {
            setIsSavingAchievements(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Only validate that at least one field has content for initial creation
        const hasAnyContent = formData.title.trim() || 
                             formData.tagline.trim() || 
                             formData.description.trim() ||
                             formData.aboutStory.trim();

        if (!isEditing && !hasAnyContent) {
            newErrors.general = "Please provide at least a title, tagline, description, or about story to create your profile";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            toast({
                title: "Please add some content",
                description: errors.general || "Please add at least some basic information to create your profile",
                status: "error",
                duration: 5000,
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // Helper function to check if contact info has any data
            const hasContactInfo = formData.contactInfo.email || 
                                 formData.contactInfo.phone || 
                                 formData.contactInfo.website || 
                                 formData.contactInfo.linkedIn || 
                                 formData.contactInfo.twitter || 
                                 formData.contactInfo.instagram || 
                                 formData.contactInfo.facebook;

            // Helper function to check if availability has any data
            const hasAvailability = formData.availability.schedule || 
                                  formData.availability.timezone || 
                                  formData.availability.notes;

            // Helper function to remove __typename from objects
            const cleanObject = (obj: any): any => {
                if (Array.isArray(obj)) {
                    return obj.map(cleanObject);
                } else if (obj !== null && typeof obj === 'object') {
                    const cleaned: any = {};
                    for (const [key, value] of Object.entries(obj)) {
                        if (key !== '__typename') {
                            cleaned[key] = cleanObject(value);
                        }
                    }
                    return cleaned;
                }
                return obj;
            };

            const input = {
                title: formData.title || undefined,
                tagline: formData.tagline || undefined,
                description: formData.description || undefined,
                avatar: formData.avatar || undefined,
                heroImage: formData.heroImage || undefined,
                roles: cleanObject(formData.roles),
                experience: cleanObject(formData.experience),
                education: cleanObject(formData.education),
                skills: cleanObject(formData.skills),
                expertise: formData.expertise,
                achievements: formData.achievements,
                testimonials: cleanObject(formData.testimonials),
                contactInfo: hasContactInfo ? cleanObject(formData.contactInfo) : undefined,
                availability: hasAvailability ? cleanObject(formData.availability) : undefined,
                featuredProductIds: formData.featuredProductIds,
                status: formData.status,
                aboutStory: formData.aboutStory || undefined,
                portfolioUrl: formData.portfolioUrl || undefined,
                isPublic: formData.isPublic,
                allowedEditors: formData.allowedEditors
            };

            if (isEditing) {
                await updateProvider({
                    variables: {
                        id: data.myProvider.id,
                        input
                    }
                });
                toast({
                    title: "Profile updated successfully",
                    status: "success",
                    duration: 3000,
                });
            } else {
                await createProvider({
                    variables: { input }
                });
                toast({
                    title: "Profile created successfully",
                    status: "success",
                    duration: 3000,
                });
            }

            navigate("/provider");
        } catch (error) {
            toast({
                title: isEditing ? "Error updating profile" : "Error creating profile",
                description: error instanceof Error ? error.message : "Unknown error occurred",
                status: "error",
                duration: 5000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <Box bg={getColor("background.main")} minHeight="100vh">
                <NavbarWithCallToAction />
                <Container maxW="6xl" py={12}>
                    <Alert status="warning" borderRadius="lg">
                        <AlertIcon />
                        <AlertTitle>Authentication Required</AlertTitle>
                        <AlertDescription>
                            Please log in to edit your provider profile.
                        </AlertDescription>
                    </Alert>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    if (loading) {
        return (
            <Box bg={getColor("background.main")} minHeight="100vh">
                <NavbarWithCallToAction />
                <Container maxW="6xl" py={12}>
                    <Center>
                        <VStack spacing={4}>
                            <Spinner size="xl" color={getColor("primary")} />
                            <Text>Loading your provider profile...</Text>
                        </VStack>
                    </Center>
                </Container>
                <FooterWithFourColumns />
            </Box>
        );
    }

    return (
        <Box bg={getColor("background.main")} minHeight="100vh">
            <NavbarWithCallToAction />

            {/* Header */}
            <Box bg={getColor("background.card")} borderBottom="1px" borderColor={getColor("border.light")} py={4}>
                <Container maxW="6xl">
                    <Stack 
                        direction={{ base: "column", lg: "row" }} 
                        justify="space-between" 
                        align={{ base: "start", lg: "center" }}
                        spacing={{ base: 4, lg: 0 }}
                    >
                        <VStack align="start" spacing={3} w={{ base: "full", lg: "auto" }}>
                            <HStack>
                                <Button
                                    leftIcon={<ArrowBackIcon />}
                                    variant="ghost"
                                    size={{ base: "xs", md: "sm" }}
                                    onClick={() => navigate("/provider")}
                                    fontSize={{ base: "xs", md: "sm" }}
                                >
                                    <Text display={{ base: "none", sm: "inline" }}>Back to Profile</Text>
                                    <Text display={{ base: "inline", sm: "none" }}>Back</Text>
                                </Button>
                            </HStack>
                            <Heading 
                                size={{ base: "md", md: "lg" }} 
                                color={getColor("text.primary")}
                                fontSize={{ base: "lg", md: "xl" }}
                            >
                                {isEditing ? "Edit" : "Create"} Provider Profile
                            </Heading>
                            
                            {/* URL Slug Section */}
                            <Box w={{ base: "full", md: "auto" }}>
                                <FormControl maxW={{ base: "full", md: "500px" }}>
                                    <FormLabel fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">
                                        🔗 Custom Profile URL
                                    </FormLabel>
                                    <Stack 
                                        direction={{ base: "column", sm: "row" }}
                                        spacing={2}
                                    >
                                        <HStack spacing={0} flex="1" minW={0}>
                                            <Text 
                                                fontSize={{ base: "xs", md: "sm" }} 
                                                color={getColor("text.muted")} 
                                                whiteSpace="nowrap"
                                                display={{ base: "none", sm: "block" }}
                                            >
                                                /provider/
                                            </Text>
                                            <Input
                                                value={formData.urlSlug}
                                                onChange={(e) => handleInputChange("urlSlug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'))}
                                                placeholder="your-name"
                                                size={{ base: "sm", md: "sm" }}
                                                maxLength={50}
                                                fontSize={{ base: "sm", md: "md" }}
                                                flex="1"
                                            />
                                        </HStack>
                                        <Button
                                            onClick={handleSaveUrlSlug}
                                            isLoading={isSavingUrlSlug}
                                            loadingText="Saving..."
                                            colorScheme="blue"
                                            size={{ base: "sm", md: "sm" }}
                                            isDisabled={!formData.urlSlug.trim() || !isEditing}
                                            fontSize={{ base: "xs", md: "sm" }}
                                            px={{ base: 3, md: 4 }}
                                            w={{ base: "full", sm: "auto" }}
                                        >
                                            <Text display={{ base: "none", sm: "inline" }}>Save URL</Text>
                                            <Text display={{ base: "inline", sm: "none" }}>Save</Text>
                                        </Button>
                                    </Stack>
                                    <Text fontSize="xs" color={getColor("text.muted")} mt={1}>
                                        <Text display={{ base: "none", sm: "inline" }}>Create a friendly URL like: /provider/john-doe</Text>
                                        <Text display={{ base: "inline", sm: "none" }}>URL: /provider/{formData.urlSlug || "your-name"}</Text>
                                    </Text>
                                </FormControl>
                            </Box>
                        </VStack>
                        <Stack 
                            direction={{ base: "row", md: "row" }} 
                            spacing={2}
                            w={{ base: "full", lg: "auto" }}
                            justify={{ base: "stretch", lg: "end" }}
                        >
                            <Button
                                leftIcon={<ViewIcon />}
                                variant="outline"
                                onClick={() => navigate("/provider")}
                                isDisabled={!isEditing}
                                size={{ base: "sm", md: "md" }}
                                fontSize={{ base: "xs", md: "sm" }}
                                flex={{ base: 1, lg: "none" }}
                            >
                                <Text display={{ base: "none", sm: "inline" }}>Preview</Text>
                                <Text display={{ base: "inline", sm: "none" }}>View</Text>
                            </Button>
                            <Button
                                leftIcon={<CheckIcon />}
                                colorScheme="blue"
                                onClick={handleSubmit}
                                isLoading={isSubmitting}
                                loadingText={isEditing ? "Updating..." : "Creating..."}
                                size={{ base: "sm", md: "md" }}
                                fontSize={{ base: "xs", md: "sm" }}
                                flex={{ base: 1, lg: "none" }}
                            >
                                <Text display={{ base: "none", sm: "inline" }}>
                                    {isEditing ? "Update Profile" : "Create Profile"}
                                </Text>
                                <Text display={{ base: "inline", sm: "none" }}>
                                    {isEditing ? "Update" : "Create"}
                                </Text>
                            </Button>
                        </Stack>
                    </Stack>
                </Container>
            </Box>

            <Container maxW="6xl" py={8}>
                <Box maxW="4xl" mx="auto">
                    {/* Info Message */}
                    {!isEditing && (
                        <Alert status="info" borderRadius="lg" mb={6}>
                            <AlertIcon />
                            <Box>
                                <AlertTitle>Create Your Provider Profile!</AlertTitle>
                                <AlertDescription>
                                    You can save your profile with minimal information and complete it gradually. 
                                    Just add a title, tagline, description, or story to get started.
                                </AlertDescription>
                            </Box>
                        </Alert>
                    )}

                    <Accordion allowMultiple defaultIndex={[0, 1]} width="100%">
                        {/* Basic Information */}
                        <AccordionItem>
                            <AccordionButton>
                                <Box flex="1" textAlign="left">
                                    <Heading size="md" color={getColor("text.primary")}>
                                        📋 Basic Information
                                    </Heading>
                                </Box>
                                <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel>
                                <VStack spacing={6} align="stretch">
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                        <FormControl>
                                            <FormLabel fontSize={{ base: "sm", md: "md" }}>Professional Title</FormLabel>
                                            <Stack direction={{ base: "column", sm: "row" }} spacing={2}>
                                                <Input
                                                    value={formData.title}
                                                    onChange={(e) => handleInputChange("title", e.target.value)}
                                                    placeholder="e.g., Transformational Coach & Life Essentials Curator"
                                                    fontSize={{ base: "sm", md: "md" }}
                                                    size={{ base: "md", md: "md" }}
                                                />
                                                <Tooltip label="Improve grammar and phrasing with Claude AI" hasArrow>
                                                    <Button
                                                        onClick={handleImproveTitle}
                                                        isLoading={isImprovingTitle}
                                                        loadingText="✨"
                                                        colorScheme="purple"
                                                        variant="outline"
                                                        size={{ base: "sm", md: "md" }}
                                                        minW="auto"
                                                        px={{ base: 2, md: 3 }}
                                                        isDisabled={!formData.title.trim()}
                                                        w={{ base: "full", sm: "auto" }}
                                                        fontSize={{ base: "xs", md: "sm" }}
                                                    >
                                                        ✨ AI
                                                    </Button>
                                                </Tooltip>
                                            </Stack>
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel fontSize={{ base: "sm", md: "md" }}>Status</FormLabel>
                                            <Select
                                                value={formData.status}
                                                onChange={(e) => handleInputChange("status", e.target.value)}
                                                fontSize={{ base: "sm", md: "md" }}
                                                size={{ base: "md", md: "md" }}
                                            >
                                                {statusOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </SimpleGrid>

                                    <FormControl>
                                        <FormLabel fontSize={{ base: "sm", md: "md" }}>Tagline</FormLabel>
                                        <Stack direction={{ base: "column", sm: "row" }} spacing={2}>
                                            <Input
                                                value={formData.tagline}
                                                onChange={(e) => handleInputChange("tagline", e.target.value)}
                                                placeholder="e.g., Empowering Communities Through Direct Connections & Life Essentials"
                                                fontSize={{ base: "sm", md: "md" }}
                                                size={{ base: "md", md: "md" }}
                                            />
                                            <Tooltip label="Improve grammar and phrasing with Claude AI" hasArrow>
                                                <Button
                                                    onClick={handleImproveTagline}
                                                    isLoading={isImprovingTagline}
                                                    loadingText="✨"
                                                    colorScheme="purple"
                                                    variant="outline"
                                                    size={{ base: "sm", md: "md" }}
                                                    minW="auto"
                                                    px={{ base: 2, md: 3 }}
                                                    isDisabled={!formData.tagline.trim()}
                                                    w={{ base: "full", sm: "auto" }}
                                                    fontSize={{ base: "xs", md: "sm" }}
                                                >
                                                    ✨ AI
                                                </Button>
                                            </Tooltip>
                                        </Stack>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Professional Description</FormLabel>
                                        <VStack spacing={2} align="stretch">
                                            <Textarea
                                                value={formData.description}
                                                onChange={(e) => handleInputChange("description", e.target.value)}
                                                placeholder="Describe your professional services and what you offer..."
                                                rows={4}
                                            />
                                            <HStack justify="flex-end">
                                                <Tooltip label="Improve grammar and phrasing with Claude AI" hasArrow>
                                                    <Button
                                                        onClick={handleImproveDescription}
                                                        isLoading={isImprovingDescription}
                                                        loadingText="✨ Improving..."
                                                        colorScheme="purple"
                                                        variant="outline"
                                                        size="sm"
                                                        isDisabled={!formData.description.trim()}
                                                    >
                                                        ✨ AI Improve
                                                    </Button>
                                                </Tooltip>
                                            </HStack>
                                        </VStack>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>About Your Story</FormLabel>
                                        <VStack spacing={2} align="stretch">
                                            <Textarea
                                                value={formData.aboutStory}
                                                onChange={(e) => handleInputChange("aboutStory", e.target.value)}
                                                placeholder="Tell your professional story, journey, and what drives you..."
                                                rows={4}
                                            />
                                            <HStack justify="flex-end">
                                                <Tooltip label="Improve grammar and phrasing with Claude AI" hasArrow>
                                                    <Button
                                                        onClick={handleImproveAboutStory}
                                                        isLoading={isImprovingAboutStory}
                                                        loadingText="✨ Improving..."
                                                        colorScheme="purple"
                                                        variant="outline"
                                                        size="sm"
                                                        isDisabled={!formData.aboutStory.trim()}
                                                    >
                                                        ✨ AI Improve
                                                    </Button>
                                                </Tooltip>
                                            </HStack>
                                        </VStack>
                                    </FormControl>

                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                        <FormControl>
                                            <FormLabel>Portfolio URL</FormLabel>
                                            <Input
                                                value={formData.portfolioUrl}
                                                onChange={(e) => handleInputChange("portfolioUrl", e.target.value)}
                                                placeholder="https://yourportfolio.com"
                                                type="url"
                                            />
                                        </FormControl>

                                        <VStack align="start" spacing={2}>
                                            <FormLabel>Visibility</FormLabel>
                                            <HStack>
                                                <Switch
                                                    isChecked={formData.isPublic}
                                                    onChange={(e) => handleInputChange("isPublic", e.target.checked)}
                                                />
                                                <Text fontSize="sm">
                                                    {formData.isPublic ? "Public Profile" : "Private Profile"}
                                                </Text>
                                            </HStack>
                                            <Text fontSize="xs" color={getColor("text.muted")}>
                                                Public profiles can be viewed by anyone
                                            </Text>
                                        </VStack>
                                    </SimpleGrid>
                                </VStack>
                            </AccordionPanel>
                        </AccordionItem>

                        {/* Images */}
                        <AccordionItem>
                            <AccordionButton>
                                <Box flex="1" textAlign="left">
                                    <Heading size="md" color={getColor("text.primary")}>
                                        📸 Profile Images
                                    </Heading>
                                </Box>
                                <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                    <FormControl>
                                        <FormLabel>Profile Avatar</FormLabel>
                                        <VStack spacing={3}>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleImageUpload(file, "avatar");
                                                }}
                                            />
                                            {formData.avatar && (
                                                <Box>
                                                    <Text fontSize="sm" color={getColor("text.muted")} mb={2}>Current avatar:</Text>
                                                    <Box
                                                        width="100px"
                                                        height="100px"
                                                        borderRadius="full"
                                                        overflow="hidden"
                                                        border="2px solid"
                                                        borderColor={getColor("border.light")}
                                                        bg={getColor("background.light")}
                                                    >
                                                        <img 
                                                            src={formData.avatar} 
                                                            alt="Avatar preview"
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover'
                                                            }}
                                                        />
                                                    </Box>
                                                </Box>
                                            )}
                                        </VStack>
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>
                                            Hero Background Image 
                                            <Text as="span" fontSize="xs" color={getColor("text.muted")} ml={2}>
                                                (Recommended: 1920x1080px or 16:9 ratio)
                                            </Text>
                                        </FormLabel>
                                        <VStack spacing={4}>
                                            {/* AI Hero Image Generation */}
                                            <Box w="full" p={5} bg="blue.50" borderRadius="lg" border="2px solid" borderColor="blue.200">
                                                <VStack spacing={4}>
                                                    <HStack spacing={2} align="center">
                                                        <Text fontSize="lg" fontWeight="bold" color="blue.600">
                                                            🎨 AI Image Generator
                                                        </Text>
                                                        <Badge colorScheme="blue" variant="solid">NEW</Badge>
                                                    </HStack>
                                                    <Text fontSize="sm" color="blue.700" textAlign="center" fontWeight="medium">
                                                        Type words to describe your perfect hero image and let AI create it for you!
                                                    </Text>
                                                    <VStack w="full" spacing={3}>
                                                        <Input
                                                            value={heroImagePrompt}
                                                            onChange={(e) => setHeroImagePrompt(e.target.value)}
                                                            placeholder="e.g., Brisbane skyline, professional coaching, modern office, sunset..."
                                                            size="md"
                                                            bg="white"
                                                            border="2px solid"
                                                            borderColor="blue.300"
                                                            _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px #3182ce" }}
                                                        />
                                                        <Button
                                                            onClick={handleGenerateHeroImage}
                                                            isLoading={isGeneratingHeroImage}
                                                            loadingText="🎨 Generating..."
                                                            colorScheme="blue"
                                                            variant="solid"
                                                            size="md"
                                                            width="full"
                                                            isDisabled={!heroImagePrompt.trim()}
                                                            leftIcon={<Text>🎨</Text>}
                                                        >
                                                            Generate Hero Image
                                                        </Button>
                                                    </VStack>
                                                </VStack>
                                            </Box>
                                            
                                            {/* Divider */}
                                            <HStack w="full">
                                                <Divider />
                                                <Text fontSize="xs" color={getColor("text.muted")} px={2}>OR</Text>
                                                <Divider />
                                            </HStack>
                                            
                                            {/* Manual Upload */}
                                            <Box w="full" p={4} bg={getColor("background.light")} borderRadius="md" border="1px" borderColor={getColor("border.light")}>
                                                <VStack spacing={3}>
                                                    <Text fontSize="sm" fontWeight="semibold" color={getColor("text.primary")}>
                                                        📁 Upload Your Own Image
                                                    </Text>
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) handleImageUpload(file, "heroImage");
                                                        }}
                                                    />
                                                    <Text fontSize="xs" color={getColor("text.muted")} textAlign="center">
                                                        Upload JPG, PNG, or WebP files. Best size: 1920x1080px
                                                    </Text>
                                                </VStack>
                                            </Box>
                                            
                                            {formData.heroImage && (
                                                <Box w="full" p={4} bg="green.50" borderRadius="md" border="1px" borderColor="green.200">
                                                    <VStack spacing={3} align="start">
                                                        <Text fontSize="sm" fontWeight="semibold" color="green.700">✅ Hero image set:</Text>
                                                        
                                                        {/* Image Preview */}
                                                        <Box w="full" maxW="400px" mx="auto">
                                                            <Box
                                                                w="full"
                                                                h="225px" // 16:9 ratio for 400px width
                                                                bg="gray.100"
                                                                borderRadius="8px"
                                                                border="2px solid #48BB78"
                                                                overflow="hidden"
                                                                position="relative"
                                                            >
                                                                <img 
                                                                    src={formData.heroImage} 
                                                                    alt="Hero image preview"
                                                                    style={{
                                                                        width: '100%',
                                                                        height: '100%',
                                                                        objectFit: 'cover'
                                                                    }}
                                                                    onLoad={(e) => {
                                                                        // Image loaded successfully
                                                                        console.log('Image loaded:', formData.heroImage);
                                                                    }}
                                                                    onError={(e) => {
                                                                        // If image fails to load, show fallback
                                                                        console.log('Image failed to load:', formData.heroImage);
                                                                        e.currentTarget.style.display = 'none';
                                                                        // Show fallback message
                                                                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                                                        if (fallback) fallback.style.display = 'flex';
                                                                    }}
                                                                />
                                                                <Box
                                                                    position="absolute"
                                                                    top="0"
                                                                    left="0"
                                                                    w="full"
                                                                    h="full"
                                                                    bg="blue.100"
                                                                    display="none"
                                                                    alignItems="center"
                                                                    justifyContent="center"
                                                                    flexDirection="column"
                                                                >
                                                                    <Text fontSize="lg" mb={2}>🖼️</Text>
                                                                    <Text fontSize="sm" color="blue.600" textAlign="center">
                                                                        Image Preview
                                                                    </Text>
                                                                    <Text fontSize="xs" color="blue.500" textAlign="center" mt={1}>
                                                                        (Preview may not work with placeholder URLs)
                                                                    </Text>
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                        
                                                        <VStack spacing={1} align="start" w="full">
                                                            <Text fontSize="xs" color="green.600" fontWeight="medium">Image URL:</Text>
                                                            <Text fontSize="xs" color="green.600" isTruncated w="full" fontFamily="mono">
                                                                {formData.heroImage}
                                                            </Text>
                                                        </VStack>
                                                        
                                                        {formData.heroImage.includes('placeholder') && (
                                                            <Text fontSize="xs" color="orange.600" mt={1}>
                                                                💡 This is a demo placeholder. Ready for DALL-E/Midjourney integration!
                                                            </Text>
                                                        )}
                                                        
                                                        {/* Action buttons */}
                                                        <HStack spacing={2}>
                                                            <Button
                                                                size="xs"
                                                                variant="outline"
                                                                colorScheme="blue"
                                                                onClick={handleSaveCurrentImage}
                                                            >
                                                                💾 Save Image
                                                            </Button>
                                                            <Button
                                                                size="xs"
                                                                variant="outline"
                                                                colorScheme="red"
                                                                onClick={() => handleInputChange('heroImage', '')}
                                                            >
                                                                🗑️ Remove Image
                                                            </Button>
                                                        </HStack>
                                                    </VStack>
                                                </Box>
                                            )}
                                        </VStack>
                                    </FormControl>
                                </SimpleGrid>
                            </AccordionPanel>
                        </AccordionItem>

                        {/* Current Roles & Organisations */}
                        <AccordionItem>
                            <AccordionButton>
                                <Box flex="1" textAlign="left">
                                    <Heading size="md" color={getColor("text.primary")}>
                                        👔 Current Roles & Organisations
                                    </Heading>
                                </Box>
                                <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel>
                                <VStack spacing={4} align="stretch">
                                    <HStack justify="space-between">
                                        <Button
                                            leftIcon={<AddIcon />}
                                            onClick={() => addArrayItem("roles", { role: "", organization: "" })}
                                        >
                                            Add Role & Organization
                                        </Button>
                                        <Button
                                            leftIcon={<CheckIcon />}
                                            colorScheme="green"
                                            variant="outline"
                                            onClick={handleSaveRoles}
                                            isLoading={isSavingRoles}
                                            loadingText="Saving..."
                                            size="sm"
                                        >
                                            Save Roles
                                        </Button>
                                    </HStack>

                                    {formData.roles.map((roleItem, index) => (
                                        <Card key={index} shadow="sm" border="1px" borderColor={getColor("border.light")}>
                                            <CardHeader>
                                                <HStack justify="space-between">
                                                    <Heading size="sm">Role {index + 1}</Heading>
                                                    <IconButton
                                                        aria-label="Remove role"
                                                        icon={<DeleteIcon />}
                                                        size="sm"
                                                        colorScheme="red"
                                                        variant="ghost"
                                                        onClick={() => removeArrayItem("roles", index)}
                                                    />
                                                </HStack>
                                            </CardHeader>
                                            <CardBody>
                                                <VStack spacing={4}>
                                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                                                        <FormControl>
                                                            <FormLabel>Role/Title</FormLabel>
                                                            <Input
                                                                value={roleItem.role || ''}
                                                                onChange={(e) => {
                                                                    handleArrayInputChange("roles", index, { ...roleItem, role: e.target.value });
                                                                }}
                                                                placeholder="e.g., Chief Technology Officer"
                                                            />
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>Organization</FormLabel>
                                                            <Input
                                                                value={roleItem.organization || ''}
                                                                onChange={(e) => {
                                                                    handleArrayInputChange("roles", index, { ...roleItem, organization: e.target.value });
                                                                }}
                                                                placeholder="e.g., Microsoft Corporation"
                                                            />
                                                        </FormControl>
                                                    </SimpleGrid>
                                                </VStack>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </VStack>
                            </AccordionPanel>
                        </AccordionItem>

                        {/* Experience */}
                        <AccordionItem>
                            <AccordionButton>
                                <Box flex="1" textAlign="left">
                                    <Heading size="md" color={getColor("text.primary")}>
                                        💼 Professional Experience
                                    </Heading>
                                </Box>
                                <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel>
                                <VStack spacing={4} align="stretch">
                                    <HStack justify="space-between">
                                        <Button
                                            leftIcon={<AddIcon />}
                                            onClick={() => addArrayItem("experience", {
                                                title: "",
                                                company: "",
                                                period: "",
                                                description: "",
                                                achievements: []
                                            })}
                                        >
                                            Add Experience
                                        </Button>
                                        <Button
                                            leftIcon={<CheckIcon />}
                                            colorScheme="green"
                                            variant="outline"
                                            onClick={handleSaveExperience}
                                            isLoading={isSavingExperience}
                                            loadingText="Saving..."
                                            size="sm"
                                        >
                                            Save Experience
                                        </Button>
                                    </HStack>

                                    {formData.experience.map((exp, index) => (
                                        <Card key={index} shadow="sm" border="1px" borderColor={getColor("border.light")}>
                                            <CardHeader>
                                                <HStack justify="space-between">
                                                    <Heading size="sm">Experience {index + 1}</Heading>
                                                    <IconButton
                                                        aria-label="Remove experience"
                                                        icon={<DeleteIcon />}
                                                        size="sm"
                                                        colorScheme="red"
                                                        variant="ghost"
                                                        onClick={() => removeArrayItem("experience", index)}
                                                    />
                                                </HStack>
                                            </CardHeader>
                                            <CardBody>
                                                <VStack spacing={4}>
                                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                                                        <FormControl>
                                                            <FormLabel>Job Title</FormLabel>
                                                            <Input
                                                                value={exp.title}
                                                                onChange={(e) => handleArrayInputChange("experience", index, {
                                                                    ...exp,
                                                                    title: e.target.value
                                                                })}
                                                                placeholder="e.g., Director of Prosperous Passions"
                                                            />
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>Company</FormLabel>
                                                            <Input
                                                                value={exp.company}
                                                                onChange={(e) => handleArrayInputChange("experience", index, {
                                                                    ...exp,
                                                                    company: e.target.value
                                                                })}
                                                                placeholder="e.g., Prosperous Passions"
                                                            />
                                                        </FormControl>
                                                    </SimpleGrid>
                                                    <FormControl>
                                                        <FormLabel>Period</FormLabel>
                                                        <Input
                                                            value={exp.period}
                                                            onChange={(e) => handleArrayInputChange("experience", index, {
                                                                ...exp,
                                                                period: e.target.value
                                                            })}
                                                            placeholder="e.g., 2020 - Present"
                                                        />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel>Description</FormLabel>
                                                        <VStack spacing={2} align="stretch">
                                                            <Textarea
                                                                value={exp.description}
                                                                onChange={(e) => handleArrayInputChange("experience", index, {
                                                                    ...exp,
                                                                    description: e.target.value
                                                                })}
                                                                placeholder="Describe your role and responsibilities..."
                                                                rows={3}
                                                            />
                                                            <HStack justify="flex-end">
                                                                <Tooltip label="Improve grammar and phrasing with Claude AI" hasArrow>
                                                                    <Button
                                                                        onClick={() => handleImproveExperienceDescription(index)}
                                                                        isLoading={improvingExperienceIndex === index}
                                                                        loadingText="✨ Improving..."
                                                                        colorScheme="purple"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        isDisabled={!exp.description.trim()}
                                                                    >
                                                                        ✨ AI Improve
                                                                    </Button>
                                                                </Tooltip>
                                                            </HStack>
                                                        </VStack>
                                                    </FormControl>
                                                    <Box w="full">
                                                        <HStack justify="space-between" mb={2}>
                                                            <FormLabel mb={0}>Key Achievements</FormLabel>
                                                            <Button
                                                                size="xs"
                                                                leftIcon={<AddIcon />}
                                                                onClick={() => {
                                                                    const achievement = window.prompt("Add achievement:");
                                                                    if (achievement?.trim()) {
                                                                        handleArrayInputChange("experience", index, {
                                                                            ...exp,
                                                                            achievements: [...exp.achievements, achievement.trim()]
                                                                        });
                                                                    }
                                                                }}
                                                            >
                                                                Add
                                                            </Button>
                                                        </HStack>
                                                        <VStack spacing={1}>
                                                            {exp.achievements.map((achievement, achIndex) => (
                                                                <HStack key={achIndex} w="full">
                                                                    <Text flex="1" fontSize="sm" p={2} bg={getColor("background.light")} borderRadius="md">
                                                                        {achievement}
                                                                    </Text>
                                                                    <IconButton
                                                                        aria-label="Remove achievement"
                                                                        icon={<DeleteIcon />}
                                                                        size="xs"
                                                                        colorScheme="red"
                                                                        variant="ghost"
                                                                        onClick={() => {
                                                                            const newAchievements = exp.achievements.filter((_, i) => i !== achIndex);
                                                                            handleArrayInputChange("experience", index, {
                                                                                ...exp,
                                                                                achievements: newAchievements
                                                                            });
                                                                        }}
                                                                    />
                                                                </HStack>
                                                            ))}
                                                        </VStack>
                                                    </Box>
                                                </VStack>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </VStack>
                            </AccordionPanel>
                        </AccordionItem>

                        {/* Education */}
                        <AccordionItem>
                            <AccordionButton>
                                <Box flex="1" textAlign="left">
                                    <Heading size="md" color={getColor("text.primary")}>
                                        🎓 Education & Certifications
                                    </Heading>
                                </Box>
                                <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel>
                                <VStack spacing={4} align="stretch">
                                    <HStack justify="space-between">
                                        <Button
                                            leftIcon={<AddIcon />}
                                            onClick={() => addArrayItem("education", {
                                                degree: "",
                                                institution: "",
                                                year: "",
                                                description: ""
                                            })}
                                        >
                                            Add Education
                                        </Button>
                                        <Button
                                            leftIcon={<CheckIcon />}
                                            colorScheme="green"
                                            variant="outline"
                                            onClick={handleSaveEducation}
                                            isLoading={isSavingEducation}
                                            loadingText="Saving..."
                                            size="sm"
                                        >
                                            Save Education
                                        </Button>
                                    </HStack>

                                    {formData.education.map((edu, index) => (
                                        <Card key={index} shadow="sm" border="1px" borderColor={getColor("border.light")}>
                                            <CardHeader>
                                                <HStack justify="space-between">
                                                    <Heading size="sm">Education {index + 1}</Heading>
                                                    <IconButton
                                                        aria-label="Remove education"
                                                        icon={<DeleteIcon />}
                                                        size="sm"
                                                        colorScheme="red"
                                                        variant="ghost"
                                                        onClick={() => removeArrayItem("education", index)}
                                                    />
                                                </HStack>
                                            </CardHeader>
                                            <CardBody>
                                                <VStack spacing={4}>
                                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                                                        <FormControl>
                                                            <FormLabel>Degree/Certification</FormLabel>
                                                            <Input
                                                                value={edu.degree}
                                                                onChange={(e) => handleArrayInputChange("education", index, {
                                                                    ...edu,
                                                                    degree: e.target.value
                                                                })}
                                                                placeholder="e.g., Certificate in Transformational Coaching"
                                                            />
                                                        </FormControl>
                                                        <FormControl>
                                                            <FormLabel>Institution</FormLabel>
                                                            <Input
                                                                value={edu.institution}
                                                                onChange={(e) => handleArrayInputChange("education", index, {
                                                                    ...edu,
                                                                    institution: e.target.value
                                                                })}
                                                                placeholder="e.g., International Coach Federation"
                                                            />
                                                        </FormControl>
                                                    </SimpleGrid>
                                                    <FormControl>
                                                        <FormLabel>Year</FormLabel>
                                                        <Input
                                                            value={edu.year}
                                                            onChange={(e) => handleArrayInputChange("education", index, {
                                                                ...edu,
                                                                year: e.target.value
                                                            })}
                                                            placeholder="e.g., 2019"
                                                        />
                                                    </FormControl>
                                                    <FormControl>
                                                        <FormLabel>Description</FormLabel>
                                                        <VStack spacing={2} align="stretch">
                                                            <Textarea
                                                                value={edu.description}
                                                                onChange={(e) => handleArrayInputChange("education", index, {
                                                                    ...edu,
                                                                    description: e.target.value
                                                                })}
                                                                placeholder="Describe what you learned or achieved..."
                                                                rows={3}
                                                            />
                                                            <HStack justify="flex-end">
                                                                <Tooltip label="Improve grammar and phrasing with Claude AI" hasArrow>
                                                                    <Button
                                                                        onClick={() => handleImproveEducationDescription(index)}
                                                                        isLoading={improvingEducationIndex === index}
                                                                        loadingText="✨ Improving..."
                                                                        colorScheme="purple"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        isDisabled={!edu.description.trim()}
                                                                    >
                                                                        ✨ AI Improve
                                                                    </Button>
                                                                </Tooltip>
                                                            </HStack>
                                                        </VStack>
                                                    </FormControl>
                                                </VStack>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </VStack>
                            </AccordionPanel>
                        </AccordionItem>

                        {/* Skills */}
                        <AccordionItem>
                            <AccordionButton>
                                <Box flex="1" textAlign="left">
                                    <Heading size="md" color={getColor("text.primary")}>
                                        ⚡ Skills & Expertise
                                    </Heading>
                                </Box>
                                <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel>
                                <VStack spacing={6} align="stretch">
                                    {/* Section Header with Save Button */}
                                    <HStack justify="space-between">
                                        <Box></Box>
                                        <Button
                                            leftIcon={<CheckIcon />}
                                            colorScheme="green"
                                            variant="outline"
                                            onClick={handleSaveSkills}
                                            isLoading={isSavingSkills}
                                            loadingText="Saving..."
                                            size="sm"
                                        >
                                            Save Skills & Expertise
                                        </Button>
                                    </HStack>
                                    
                                    {/* Skills */}
                                    <Box>
                                        <Button
                                            leftIcon={<AddIcon />}
                                            onClick={() => addArrayItem("skills", {
                                                name: "",
                                                level: "INTERMEDIATE",
                                                endorsements: 0
                                            })}
                                            mb={4}
                                        >
                                            Add Skill
                                        </Button>

                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                            {formData.skills.map((skill, index) => (
                                                <Card key={index} shadow="sm" border="1px" borderColor={getColor("border.light")}>
                                                    <CardBody>
                                                        <VStack spacing={3}>
                                                            <HStack w="full" justify="space-between">
                                                                <Heading size="xs">Skill {index + 1}</Heading>
                                                                <IconButton
                                                                    aria-label="Remove skill"
                                                                    icon={<DeleteIcon />}
                                                                    size="xs"
                                                                    colorScheme="red"
                                                                    variant="ghost"
                                                                    onClick={() => removeArrayItem("skills", index)}
                                                                />
                                                            </HStack>
                                                            <FormControl>
                                                                <FormLabel>Skill Name</FormLabel>
                                                                <Input
                                                                    value={skill.name}
                                                                    onChange={(e) => handleArrayInputChange("skills", index, {
                                                                        ...skill,
                                                                        name: e.target.value
                                                                    })}
                                                                    placeholder="e.g., Transformational Coaching"
                                                                    size="sm"
                                                                />
                                                            </FormControl>
                                                            <FormControl>
                                                                <FormLabel>Level</FormLabel>
                                                                <Select
                                                                    value={skill.level}
                                                                    onChange={(e) => handleArrayInputChange("skills", index, {
                                                                        ...skill,
                                                                        level: e.target.value
                                                                    })}
                                                                    size="sm"
                                                                >
                                                                    {skillLevels.map(level => (
                                                                        <option key={level.value} value={level.value}>
                                                                            {level.label}
                                                                        </option>
                                                                    ))}
                                                                </Select>
                                                            </FormControl>
                                                            <FormControl>
                                                                <FormLabel>Endorsements</FormLabel>
                                                                <NumberInput
                                                                    value={skill.endorsements}
                                                                    onChange={(_, value) => handleArrayInputChange("skills", index, {
                                                                        ...skill,
                                                                        endorsements: value || 0
                                                                    })}
                                                                    min={0}
                                                                    max={1000}
                                                                    size="sm"
                                                                >
                                                                    <NumberInputField />
                                                                    <NumberInputStepper>
                                                                        <NumberIncrementStepper />
                                                                        <NumberDecrementStepper />
                                                                    </NumberInputStepper>
                                                                </NumberInput>
                                                            </FormControl>
                                                        </VStack>
                                                    </CardBody>
                                                </Card>
                                            ))}
                                        </SimpleGrid>
                                    </Box>

                                    <Divider />

                                    {/* Expertise Areas */}
                                    <VStack spacing={4} align="stretch">
                                        <HStack justify="space-between">
                                            <FormLabel>Expertise Areas</FormLabel>
                                            <HStack spacing={2}>
                                                <Button
                                                    size="sm"
                                                    leftIcon={<AddIcon />}
                                                    onClick={() => {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            expertise: [...prev.expertise, ""]
                                                        }));
                                                    }}
                                                >
                                                    Add Expertise
                                                </Button>
                                                <Button
                                                    leftIcon={<CheckIcon />}
                                                    colorScheme="green"
                                                    variant="outline"
                                                    onClick={handleSaveExpertise}
                                                    isLoading={isSavingExpertise}
                                                    loadingText="Saving..."
                                                    size="sm"
                                                >
                                                    Save Expertise
                                                </Button>
                                            </HStack>
                                        </HStack>
                                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                                            {formData.expertise.map((item, index) => (
                                                <Card key={index} shadow="sm" border="1px" borderColor={getColor("border.light")}>
                                                    <CardHeader>
                                                        <HStack justify="space-between">
                                                            <Heading size="sm">Expertise {index + 1}</Heading>
                                                            <IconButton
                                                                aria-label="Remove expertise"
                                                                icon={<DeleteIcon />}
                                                                size="sm"
                                                                colorScheme="red"
                                                                variant="ghost"
                                                                onClick={() => {
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        expertise: prev.expertise.filter((_, i) => i !== index)
                                                                    }));
                                                                }}
                                                            />
                                                        </HStack>
                                                    </CardHeader>
                                                    <CardBody>
                                                        <FormControl>
                                                            <Input
                                                                value={item}
                                                                onChange={(e) => {
                                                                    const newExpertise = [...formData.expertise];
                                                                    newExpertise[index] = e.target.value;
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        expertise: newExpertise
                                                                    }));
                                                                }}
                                                                placeholder="e.g., Digital Marketing, Web Development, etc."
                                                            />
                                                        </FormControl>
                                                    </CardBody>
                                                </Card>
                                            ))}
                                        </SimpleGrid>
                                    </VStack>

                                    <Divider />

                                    {/* Key Achievements */}
                                    <VStack spacing={4} align="stretch">
                                        <HStack justify="space-between">
                                            <FormLabel>Key Achievements</FormLabel>
                                            <HStack spacing={2}>
                                                <Button
                                                    size="sm"
                                                    leftIcon={<AddIcon />}
                                                    onClick={() => {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            achievements: [...prev.achievements, ""]
                                                        }));
                                                    }}
                                                >
                                                    Add Achievement
                                                </Button>
                                                <Button
                                                    leftIcon={<CheckIcon />}
                                                    colorScheme="green"
                                                    variant="outline"
                                                    onClick={handleSaveAchievements}
                                                    isLoading={isSavingAchievements}
                                                    loadingText="Saving..."
                                                    size="sm"
                                                >
                                                    Save Achievements
                                                </Button>
                                            </HStack>
                                        </HStack>
                                        <VStack spacing={3}>
                                            {formData.achievements.map((achievement, index) => (
                                                <Card key={index} shadow="sm" border="1px" borderColor={getColor("border.light")} w="full">
                                                    <CardHeader>
                                                        <HStack justify="space-between">
                                                            <Heading size="sm">Achievement {index + 1}</Heading>
                                                            <IconButton
                                                                aria-label="Remove achievement"
                                                                icon={<DeleteIcon />}
                                                                size="sm"
                                                                colorScheme="red"
                                                                variant="ghost"
                                                                onClick={() => {
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        achievements: prev.achievements.filter((_, i) => i !== index)
                                                                    }));
                                                                }}
                                                            />
                                                        </HStack>
                                                    </CardHeader>
                                                    <CardBody>
                                                        <FormControl>
                                                            <Textarea
                                                                value={achievement}
                                                                onChange={(e) => {
                                                                    const newAchievements = [...formData.achievements];
                                                                    newAchievements[index] = e.target.value;
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        achievements: newAchievements
                                                                    }));
                                                                }}
                                                                placeholder="e.g., Increased company revenue by 150% through strategic marketing campaigns"
                                                                rows={2}
                                                            />
                                                        </FormControl>
                                                    </CardBody>
                                                </Card>
                                            ))}
                                        </VStack>
                                    </VStack>
                                </VStack>
                            </AccordionPanel>
                        </AccordionItem>

                        {/* Contact Information */}
                        <AccordionItem>
                            <AccordionButton>
                                <Box flex="1" textAlign="left">
                                    <Heading size="md" color={getColor("text.primary")}>
                                        📞 Contact Information
                                    </Heading>
                                </Box>
                                <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel>
                                <VStack spacing={4} align="stretch">
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                        <FormControl>
                                            <FormLabel>Email</FormLabel>
                                            <Input
                                                type="email"
                                                value={formData.contactInfo.email}
                                                onChange={(e) => handleNestedInputChange("contactInfo", "email", e.target.value)}
                                                placeholder="your@email.com"
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Phone</FormLabel>
                                            <Input
                                                type="tel"
                                                value={formData.contactInfo.phone}
                                                onChange={(e) => handleNestedInputChange("contactInfo", "phone", e.target.value)}
                                                placeholder="+61 4XX XXX XXX"
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Website</FormLabel>
                                            <Input
                                                type="url"
                                                value={formData.contactInfo.website}
                                                onChange={(e) => handleNestedInputChange("contactInfo", "website", e.target.value)}
                                                placeholder="https://yourwebsite.com"
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>LinkedIn</FormLabel>
                                            <Input
                                                type="url"
                                                value={formData.contactInfo.linkedIn}
                                                onChange={(e) => handleNestedInputChange("contactInfo", "linkedIn", e.target.value)}
                                                placeholder="https://linkedin.com/in/yourprofile"
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Twitter</FormLabel>
                                            <Input
                                                type="url"
                                                value={formData.contactInfo.twitter}
                                                onChange={(e) => handleNestedInputChange("contactInfo", "twitter", e.target.value)}
                                                placeholder="https://twitter.com/yourusername"
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Instagram</FormLabel>
                                            <Input
                                                type="url"
                                                value={formData.contactInfo.instagram}
                                                onChange={(e) => handleNestedInputChange("contactInfo", "instagram", e.target.value)}
                                                placeholder="https://instagram.com/yourusername"
                                            />
                                        </FormControl>
                                    </SimpleGrid>
                                </VStack>
                            </AccordionPanel>
                        </AccordionItem>

                        {/* Availability */}
                        <AccordionItem>
                            <AccordionButton>
                                <Box flex="1" textAlign="left">
                                    <Heading size="md" color={getColor("text.primary")}>
                                        ⏰ Availability
                                    </Heading>
                                </Box>
                                <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel>
                                <VStack spacing={4} align="stretch">
                                    <FormControl>
                                        <FormLabel>Schedule Template</FormLabel>
                                        <Select
                                            placeholder="Choose a schedule template"
                                            onChange={(e) => handleScheduleTemplateChange(e.target.value)}
                                        >
                                            {scheduleTemplates.map((template) => (
                                                <option key={template.value} value={template.value}>
                                                    {template.label}
                                                </option>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    
                                    <FormControl>
                                        <FormLabel>
                                            {isCustomSchedule ? "Custom Schedule" : "Schedule"}
                                        </FormLabel>
                                        <Textarea
                                            value={formData.availability.schedule}
                                            onChange={(e) => handleNestedInputChange("availability", "schedule", e.target.value)}
                                            placeholder={isCustomSchedule ? "Write your custom schedule..." : "e.g., Monday - Friday, 9AM - 5PM"}
                                            rows={3}
                                        />
                                    </FormControl>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                        <FormControl>
                                            <FormLabel>Timezone</FormLabel>
                                            <Select
                                                value={formData.availability.timezone}
                                                onChange={(e) => handleNestedInputChange("availability", "timezone", e.target.value)}
                                                placeholder="Select your timezone"
                                            >
                                                {timezoneOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Additional Notes</FormLabel>
                                            <Input
                                                value={formData.availability.notes}
                                                onChange={(e) => handleNestedInputChange("availability", "notes", e.target.value)}
                                                placeholder="e.g., Available for emergency consultations"
                                            />
                                        </FormControl>
                                    </SimpleGrid>
                                </VStack>
                            </AccordionPanel>
                        </AccordionItem>
                    </Accordion>

                    {/* Save Actions */}
                    <Card mt={8} shadow="lg">
                        <CardBody>
                            <VStack spacing={4}>
                                <Heading size="md" color={getColor("text.primary")}>
                                    Ready to {isEditing ? "Update" : "Create"} Your Profile?
                                </Heading>
                                <Text color={getColor("text.muted")} textAlign="center">
                                    {isEditing 
                                        ? "Update your provider profile to reflect your latest experience and services."
                                        : "Create your professional provider profile to showcase your expertise and connect with clients."
                                    }
                                </Text>
                                <HStack spacing={4}>
                                    <Button
                                        leftIcon={<ArrowBackIcon />}
                                        variant="outline"
                                        onClick={() => navigate("/provider")}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        leftIcon={<CheckIcon />}
                                        colorScheme="blue"
                                        size="lg"
                                        onClick={handleSubmit}
                                        isLoading={isSubmitting}
                                        loadingText={isEditing ? "Updating..." : "Creating..."}
                                    >
                                        {isEditing ? "Update Profile" : "Create Profile"}
                                    </Button>
                                </HStack>
                            </VStack>
                        </CardBody>
                    </Card>
                </Box>
            </Container>

            <FooterWithFourColumns />
        </Box>
    );
};

export default EditProvider;