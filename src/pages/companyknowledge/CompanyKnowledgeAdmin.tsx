import React from "react";
import { Box, Container, Heading, Text, useColorMode } from "@chakra-ui/react";
import { NavbarWithCallToAction } from "../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction";
import { FooterWithFourColumns } from "../../components/chakra/FooterWithFourColumns/FooterWithFourColumns";
import { ModuleBreadcrumb } from "../../components/ModuleBreadcrumb";
import companyKnowledgeModuleConfig from "./moduleConfig";
import { usePageTitle } from "../../hooks/useDocumentTitle";
import { getColor } from "../../brandConfig";

const CompanyKnowledgeAdmin: React.FC = () => {
    usePageTitle("Knowledge Admin");
    const { colorMode } = useColorMode();
    const bgMain = getColor("background.main", colorMode);

    return (
        <Box bg={bgMain} minH="100vh" display="flex" flexDirection="column">
            <NavbarWithCallToAction />
            <ModuleBreadcrumb moduleConfig={companyKnowledgeModuleConfig} />

            <Container maxW="container.xl" py={8} flex="1">
                <Heading mb={4}>Company Knowledge - Admin Dashboard</Heading>
                <Text>Coming soon... Admin dashboard for managing all articles.</Text>
            </Container>

            <FooterWithFourColumns />
        </Box>
    );
};

export default CompanyKnowledgeAdmin;
