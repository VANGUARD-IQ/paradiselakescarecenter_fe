import React, { Suspense } from "react";
import { ChakraProvider, Spinner, Center } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "./apollo/client";
import Home from "./pages/Home";
import Podcast from "./pages/Podcast";
import OneGroupProposal from "./pages/offers/onegroup";
import WattDropProposal from "./pages/offers/wattdrop";
// import OneGroupStructuredProposal from "./pages/offers/onegroupstructured";
import { brandConfig } from "./brandConfig";
import theme from "./theme";

// Module configurations
import clientsModuleConfig from "./pages/clients/moduleConfig";
import passwordsModuleConfig from "./pages/passwords/moduleConfig";
import employeesModuleConfig from "./pages/employees/moduleConfig";
import companiesModuleConfig from "./pages/companies/moduleConfig";
import CompaniesList from "./pages/companies/CompaniesList";
import NewCompany from "./pages/companies/NewCompany";
import CompanyDetails from "./pages/companies/CompanyDetails";
import EditCompany from "./pages/companies/EditCompany";
import assetsModuleConfig from "./pages/assets/moduleConfig";
import { calendarsModuleConfig } from "./pages/calendars/moduleConfig";
import opportunitiesModuleConfig from "./pages/opportunities/moduleConfig";
import youtubeToIPFSModuleConfig from "./pages/youtubetoipfs/moduleConfig";
import meetingSummarizerModuleConfig from "./pages/meeting-summarizer/moduleConfig";
import projectsModuleConfig from "./pages/projects/moduleConfig";
import emailsModuleConfig from "./pages/emails/moduleConfig";
import transcriptionsModuleConfig from "./pages/transcriptions/moduleConfig";
import proposalsModuleConfig from "./pages/proposals/moduleConfig";
import companyKnowledgeModuleConfig from "./pages/companyknowledge/moduleConfig";
import frontendUpgradesModuleConfig from "./pages/frontend-upgrades/moduleConfig";

/*
 * MIGRATION NOTE: We are transitioning to a dynamic module routing system.
 * 
 * The Clients module has been converted as the example pattern.
 * As we update each module, we will:
 * 1. Create/update its moduleConfig.ts file (see clients/moduleConfig.ts as example)
 * 2. Import the moduleConfig here
 * 3. Add it to the modules array below
 * 4. Remove its hardcoded routes from below
 * 
 * This allows modules to be truly plug-and-play with automatic route registration
 * and centralized permission management.
 * 
 * TO CONVERT: Projects, Bills, Products, Sessions, Emails, etc.
 */

// Import other module configs here as you convert them:
import billsModuleConfig from "./pages/bills/moduleConfig";
import tenantManagementModuleConfig from "./pages/tenant-management/moduleConfig";
import adminModuleConfig from "./pages/admin/moduleConfig";
// import productsModuleConfig from "./pages/products/moduleConfig";

// Combine all module configurations
const modules = [
  clientsModuleConfig,
  passwordsModuleConfig,
  employeesModuleConfig,
  companiesModuleConfig,
  assetsModuleConfig,
  calendarsModuleConfig,
  opportunitiesModuleConfig,
  proposalsModuleConfig, // Proposals module with PROPOSALS_VIEW/CREATE/ADMIN permissions
  youtubeToIPFSModuleConfig,
  billsModuleConfig,  // Now using dynamic routing!
  meetingSummarizerModuleConfig, // Meeting summarizer with proper permissions
  transcriptionsModuleConfig, // Transcriptions module with TRANSCRIPTION_USER/ADMIN permissions
  projectsModuleConfig, // Projects module with PROJECTS_ADMIN permission
  emailsModuleConfig, // Emails module with EMAIL_ADMIN and EMAIL_USER permissions
  companyKnowledgeModuleConfig, // Company knowledge base with COMPANY_KNOWLEDGE_* permissions
  frontendUpgradesModuleConfig, // Frontend upgrade tracking with WEBSITE_MASTER permission
  tenantManagementModuleConfig, // Tenant management with ADMIN/TENANT_MASTER_ADMIN permissions
  adminModuleConfig, // System administration with ADMIN/TENANT_MASTER_ADMIN permissions
  // Add other modules here as you convert them:
  // productsModuleConfig,
];

// Protected Route Component
import { ProtectedRoute } from "./components/ProtectedRoute";

// Loading component for lazy-loaded routes
const LoadingFallback = () => (
  <Center h="100vh">
    <Spinner size="xl" color={brandConfig.colors.primary} />
  </Center>
);

// Website-related imports
import NewWebsiteForm from "./pages/tenantwebsites/NewWebsiteForm";
import WebsitesList from "./pages/tenantwebsites/WebsitesList";
import WebsiteDetails from "./pages/tenantwebsites/WebsiteDetails";

// Bill-related imports (moved to dynamic routing via billsModuleConfig)
// Special bill pages that aren't in the module
import BillPaymentSuccess from "./pages/bills/BillPaymentSuccess";
import BillChaserPage from "./pages/admin/billChaserPage";



// Product-related imports
import NewProductForm from "./pages/products/NewProductForm";
import ProductView from "./pages/products/ProductView";
import AllProducts from "./pages/products/AllProducts";
import Cart from "./pages/products/Cart";
import OrderDetails from "./pages/products/OrderDetails";

// Project-related imports - Now handled by projectsModuleConfig

// Email-related imports - Now handled by emailsModuleConfig

// Calendar-related imports
import CalendarAccountsAdmin from "./pages/calendars/CalendarAccountsAdmin";

// Knowledge Base imports
import { KnowledgeBaseList, ArticleViewer } from "./pages/knowledgebase";

// Subscription/Billing-related imports
import SubscriptionsDashboard from "./pages/subscriptions/SubscriptionsDashboard";
import ManageSubscriptions from "./pages/subscriptions/ManageSubscriptions";
import PaymentMethods from "./pages/subscriptions/PaymentMethods";
import InvoiceHistory from "./pages/subscriptions/InvoiceHistory";
import BillingSettings from "./pages/subscriptions/BillingSettings";
import CreateSubscription from "./pages/subscriptions/CreateSubscription";
import ManualCharging from "./pages/subscriptions/ManualCharging";
import EditSubscription from "./pages/subscriptions/EditSubscription";

// Admin and dashboard imports
import AdminDashboard from "./pages/AdminDashboard";
import ModuleDeployment from "./pages/tenant-management/ModuleDeployment";

// Phone System imports
import { PhoneSystemDashboard } from "./pages/phone-system/PhoneSystemDashboard";
import { PhoneNumbersList } from "./pages/phone-system/PhoneNumbersList";
import { CallRecordings } from "./pages/phone-system/CallRecordings";
import { BrowserCall } from "./pages/phone-system/BrowserCall";
import { PhoneNumberAssignmentAdmin } from "./pages/phone-system/PhoneNumberAssignmentAdmin";

// Vapi Voice AI imports
import { VapiDashboard } from "./pages/vapi/VapiDashboard";
import { WebCall } from "./pages/vapi/WebCall";
import { CallLogs } from "./pages/vapi/CallLogs";
import { CallDetails } from "./pages/vapi/CallDetails";
import { Workflows } from "./pages/vapi/Workflows";
import { VapiTodos } from "./pages/vapi/VapiTodos";

// Test and development imports
import SendTestEmail from "./pages/test/SendTestEmail";
import TestUploadFile from "./pages/test/TestUploadFile";
import TestUploadEncryptedFile from "./pages/test/TestUploadEncryptedFile";
import TestAuth from "./pages/test/TestAuth";
import TestClientCart from "./pages/test/TestClientCart";
import TestUploadFileToPinata from "./pages/test/TestUploadFileToPinata";
import TestUploadAudioToPinataAndTranscribeWithn8n from "./pages/test/TestUploadAudioToPinataAndTranscribeWithn8n";



import Event1Page from "./pages/events/tom/1";
import Event2Page from "./pages/events/tom/2";
import Event3Page from "./pages/events/tom/3";
import Event4Page from "./pages/events/tom/4";
import Block52EventPage from "./pages/events/tom/Block52";
import ChrisEventPage from "./pages/events/tom/chris";

// Contexts and Layout
import { AuthProvider } from "./contexts/AuthContext";
import CreateTenant from "./pages/tenant-management/CreateTenant";
import TenantsList from "./pages/tenant-management/TenantsList";
import EditTenant from "./pages/tenant-management/EditTenant";

// Profile-related imports
import ViewProfile from "./pages/profile/ViewProfile";
import EditProfile from "./pages/profile/EditProfile";
import Settings from "./pages/profile/Settings";
import ShippingAddresses from "./pages/profile/ShippingAddresses";
import ProfilePaymentMethods from "./pages/profile/PaymentMethods";
import SubscriptionOffers from "./pages/profile/SubscriptionOffers";
import CurrentSubscriptions from "./pages/profile/CurrentSubscriptions";

// Seller Profile imports
import NewSellerProfile from "./pages/sellerprofile/NewSellerProfile";
import SellerProfilesList from "./pages/sellerprofile/SellerProfilesList";
import SellerProfileView from "./pages/sellerprofile/SellerProfileView";

// Provider Profile imports
import ProviderView from "./pages/provider/ProviderView";
import EditProvider from "./pages/provider/EditProvider";
import DiscoverProviders from "./pages/provider/DiscoverProviders";

// Research & Development imports
import ResearchAndDesignDashboard from "./pages/researchanddesign/index";
import ResearchAndDesignProjects from "./pages/researchanddesign/projects";
import ResearchAndDesignProjectWizard from "./pages/researchanddesign/new";
import ResearchAndDesignProjectDetail from "./pages/researchanddesign/project";
import ResearchAndDesignProjectEdit from "./pages/researchanddesign/edit";
import ResearchAndDesignTimesheet from "./pages/researchanddesign/timesheet";
import ResearchAndDesignEvidence from "./pages/researchanddesign/evidence";
import ResearchAndDesignUploadEvidence from "./pages/researchanddesign/upload-evidence";
import ResearchAndDesignEvidenceDetails from "./pages/researchanddesign/evidence-details";
import ResearchAndDesignRecordAudio from "./pages/researchanddesign/record-audio";
import ResearchAndDesignGapAnalysis from "./pages/researchanddesign/gaps";
import ResearchAndDesignReports from "./pages/researchanddesign/reports";
import ResearchAndDesignNewActivity from "./pages/researchanddesign/new-activity";
import ResearchAndDesignActivityDetails from "./pages/researchanddesign/activity-details";
import ResearchAndDesignEditActivity from "./pages/researchanddesign/edit-activity";
import ResearchAndDesignTranscribe from "./pages/researchanddesign/transcribe";
// import ShippingAddresses from "./pages/profile/ShippingAddresses";

// Training Center imports
import HamishTraining from "./pages/hamish";
// import PaymentMethods from "./pages/profile/PaymentMethods";

// Meeting Summarizer imports - Now handled by meetingSummarizerModuleConfig

// Domains module imports
import { DomainsPage } from "./pages/domains/index";
import { DomainDetails } from "./pages/domains/DomainDetails";

// Offers module imports
import { MaintenanceOffer } from "./pages/offers/onegroup/maintenance";
import SiteMaintenance from "./pages/offers/onegroup/sitemaintenance";

// Public Booking imports (NO AUTH REQUIRED)
import PublicBookingPage from "./pages/calendars/booking/PublicBookingPage";
import PublicBookingEventPage from "./pages/calendars/booking/PublicBookingEventPage";
import PublicBookingConfirmPage from "./pages/calendars/booking/PublicBookingConfirmPage";
import PublicBookingSuccessPage from "./pages/calendars/booking/PublicBookingSuccessPage";
import ManageBooking from "./pages/calendars/ManageBooking";

// Floating navbar component
import { FloatingNavbar } from "./components/FloatingNavbar";
import { useAuth } from "./contexts/AuthContext";

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <>
      {/* Show floating navbar only when authenticated */}
      {isAuthenticated && <FloatingNavbar />}
      
      {/* Each page now includes its own NavbarWithCallToAction and FooterWithFourColumns for consistency */}
      <Routes>
        {/* Home page */}
        <Route path="/" element={<Home />} />

        {/* Podcast page */}
        <Route path="/podcast" element={<Podcast />} />

        {/* 📅 PUBLIC BOOKING PAGES (NO AUTH REQUIRED) */}
        {/* These routes allow public visitors to book appointments without logging in */}
        <Route path="/book/:slug" element={<PublicBookingPage />} />
        <Route path="/book/:slug/:eventTypeId" element={<PublicBookingEventPage />} />
        <Route path="/book/:slug/confirm" element={<PublicBookingConfirmPage />} />
        <Route path="/book/:slug/success" element={<PublicBookingSuccessPage />} />
        <Route path="/calendars/booking/manage/:token" element={<ManageBooking />} />

        {/* Public Proposal Pages */}
        <Route path="/offers/onegroup" element={<OneGroupProposal />} />
        <Route path="/offers/wattdrop" element={<WattDropProposal />} />
        {/* <Route path="/offers/onegroupstructured" element={<OneGroupStructuredProposal />} /> */}

        {/* Event routes */}
        <Route path="/events/tom/1" element={<Event1Page />} />
        <Route path="/events/tom/2" element={<Event2Page />} />
        <Route path="/events/tom/3" element={<Event3Page />} />
        <Route path="/events/tom/4" element={<Event4Page />} />
        <Route path="/events/tom/block52" element={<Block52EventPage />} />
        <Route path="/events/tom/chris" element={<ChrisEventPage />} />

        {/* Dynamic Module Routes */}
        {modules.map((module) => 
          module.routes?.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                route.permissions && route.permissions.length > 0 ? (
                  <ProtectedRoute requiredPermissions={route.permissions}>
                    <Suspense fallback={<LoadingFallback />}>
                      <route.component />
                    </Suspense>
                  </ProtectedRoute>
                ) : (
                  <Suspense fallback={<LoadingFallback />}>
                    <route.component />
                  </Suspense>
                )
              }
            />
          ))
        )}

        {/* Website routes */}
        <Route path="/websites/new" element={<NewWebsiteForm />} />
        <Route path="/websites" element={<WebsitesList />} />
        <Route path="/website/:id" element={<WebsiteDetails />} />

        {/* Bills module now uses dynamic routing - see billsModuleConfig */}
        {/* Special bill routes not in the module */}
        <Route path="/bill/:id/payment-success" element={<BillPaymentSuccess />} />
        <Route path="/bill-chaser" element={<BillChaserPage />} />
        
        {/* Phone System routes */}
        <Route path="/phone-system" element={<PhoneSystemDashboard />} />
        <Route path="/phone-system/browser-call" element={<BrowserCall />} />
        <Route path="/phone-system/numbers" element={<PhoneNumbersList />} />
        <Route path="/phone-system/recordings" element={<CallRecordings />} />
        <Route path="/phone-system/assignments" element={<PhoneNumberAssignmentAdmin />} />

        {/* Vapi Voice AI routes */}
        <Route path="/vapi" element={<VapiDashboard />} />
        <Route path="/vapi/web-call" element={<WebCall />} />
        <Route path="/vapi/call-logs" element={<CallLogs />} />
        <Route path="/vapi/call/:callId" element={<CallDetails />} />
        <Route path="/vapi/workflows" element={<Workflows />} />
        <Route path="/vapi/todos" element={<VapiTodos />} />

        {/* Product routes */}
        <Route path="/products/new" element={<NewProductForm />} />
        <Route path="/products/:id" element={<ProductView />} />
        <Route path="/products" element={<AllProducts />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order/:id" element={<OrderDetails />} />

        {/* Project routes - Now handled by dynamic routing via projectsModuleConfig */}

        {/* Company routes */}
        <Route path="/companies" element={<CompaniesList />} />
        <Route path="/companies/new" element={<NewCompany />} />
        <Route path="/companies/:id" element={<CompanyDetails />} />
        <Route path="/companies/edit/:id" element={<EditCompany />} />

        {/* Email routes - Now handled by dynamic routing via emailsModuleConfig */}

        {/* Calendar routes */}
        <Route path="/calendar/admin/calendars" element={<CalendarAccountsAdmin />} /> {/* MASTER ADMIN: Manage all calendars */}

        {/* Knowledge Base routes - Admin only */}
        <Route path="/knowledgebase" element={<KnowledgeBaseList />} />
        <Route path="/knowledgebase/:slug" element={<ArticleViewer />} />

        {/* Subscription/Billing routes */}
        <Route path="/subscriptions" element={<SubscriptionsDashboard />} />                    {/* ADMIN: Overview dashboard of all client subscriptions, revenue stats */}
        <Route path="/subscriptions/manage" element={<ManageSubscriptions />} />                {/* ADMIN: Manage existing subscriptions (cancel, modify, view details) */}
        <Route path="/subscriptions/create" element={<CreateSubscription />} />                 {/* ADMIN: Create new recurring subscriptions for clients */}
        <Route path="/subscriptions/payment-methods" element={<PaymentMethods />} />            {/* ADMIN: Add/remove client credit cards for future billing */}
        <Route path="/subscriptions/invoices" element={<InvoiceHistory />} />                   {/* ADMIN/CLIENT: View invoice history and payment receipts */}
        <Route path="/subscriptions/settings" element={<BillingSettings />} />                  {/* ADMIN: Configure billing settings, tax rates, company info */}
        <Route path="/subscriptions/manual-charging" element={<ManualCharging />} />            {/* ADMIN: One-time charges using saved payment methods */}
        <Route path="/subscriptions/:id/edit" element={<EditSubscription />} />                 {/* ADMIN: Edit existing subscription details */}

        {/* Admin routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/tenants" element={<TenantsList />} />
        <Route path="/admin/tenants/new" element={<CreateTenant />} />
        <Route path="/admin/tenants/:id/edit" element={<EditTenant />} />

        {/* Profile routes */}
        <Route path="/profile" element={<ViewProfile />} />                        {/* USER: View profile details */}
        <Route path="/profile/edit" element={<EditProfile />} />                  {/* USER: Edit profile information */}
        <Route path="/profile/settings" element={<Settings />} />                  {/* USER: Manage profile settings */}
        <Route path="/profile/shipping" element={<ShippingAddresses />} />         {/* USER: Manage shipping addresses */}
        <Route path="/profile/payment-methods" element={<ProfilePaymentMethods />} />     {/* USER: Manage payment methods */}
        <Route path="/profile/subscription-offers" element={<SubscriptionOffers />} />     {/* USER: View subscription offers */}
        <Route path="/profile/subscriptions" element={<CurrentSubscriptions />} />     {/* USER: Manage current subscriptions */}

        {/* Seller Profile routes */}
        <Route path="/seller-profiles" element={<SellerProfilesList />} />         {/* PUBLIC: View all seller profiles */}
        <Route path="/seller-profile/:id" element={<SellerProfileView />} />       {/* PUBLIC: View individual seller profile */}
        <Route path="/seller-profiles/new" element={<NewSellerProfile />} />       {/* USER: Create new seller profile */}

        {/* Provider Profile routes */}
        <Route path="/provider/:urlSlug" element={<ProviderView />} />             {/* PUBLIC: View provider profile by URL slug */}
        <Route path="/provider" element={<ProviderView />} />                      {/* USER: View your provider profile */}
        <Route path="/provider/edit" element={<EditProvider />} />                 {/* USER: Edit provider profile */}
        <Route path="/providers/discover" element={<DiscoverProviders />} />       {/* PUBLIC: Discover and search provider profiles */}

        {/* Research & Development routes */}
        <Route path="/researchanddesign" element={<ResearchAndDesignDashboard />} />  {/* USER: R&D dashboard and project management */}
        <Route path="/researchanddesign/projects" element={<ResearchAndDesignProjects />} />  {/* USER: R&D projects list */}
        <Route path="/researchanddesign/projects/new" element={<ResearchAndDesignProjectWizard />} />  {/* USER: Create new R&D project */}
        <Route path="/researchanddesign/projects/:id" element={<ResearchAndDesignProjectDetail />} />  {/* USER: R&D project details */}
        <Route path="/researchanddesign/projects/:id/edit" element={<ResearchAndDesignProjectEdit />} />  {/* USER: Edit R&D project */}
        <Route path="/researchanddesign/timesheet" element={<ResearchAndDesignTimesheet />} />  {/* USER: R&D time tracking */}
        <Route path="/researchanddesign/evidence" element={<ResearchAndDesignEvidence />} />  {/* USER: R&D evidence upload */}
        <Route path="/researchanddesign/evidence/upload" element={<ResearchAndDesignUploadEvidence />} />  {/* USER: Upload new evidence */}
        <Route path="/researchanddesign/evidence/:evidenceId" element={<ResearchAndDesignEvidenceDetails />} />  {/* USER: View/edit evidence details */}
        <Route path="/researchanddesign/record-audio" element={<ResearchAndDesignRecordAudio />} />  {/* USER: R&D audio recording */}
        <Route path="/researchanddesign/activities/new" element={<ResearchAndDesignNewActivity />} />  {/* USER: Create new R&D activity */}
        <Route path="/researchanddesign/activities/:id" element={<ResearchAndDesignActivityDetails />} />  {/* USER: View R&D activity details */}
        <Route path="/researchanddesign/activities/:id/edit" element={<ResearchAndDesignEditActivity />} />  {/* USER: Edit R&D activity */}
        <Route path="/researchanddesign/gaps" element={<ResearchAndDesignGapAnalysis />} />  {/* USER: R&D gap analysis */}
        <Route path="/researchanddesign/reports" element={<ResearchAndDesignReports />} />  {/* USER: R&D reports and analytics */}
        <Route path="/researchanddesign/transcribe" element={<ResearchAndDesignTranscribe />} />  {/* USER: Audio transcription tool */}

        {/* Training Center routes */}
        <Route path="/hamish" element={<HamishTraining />} />  {/* USER: Training videos and resources */}

        {/* Meeting Summarizer routes - Now handled by dynamic routing via meetingSummarizerModuleConfig */}

        {/* Domains module routes */}
        <Route path="/domains" element={<DomainsPage />} />  {/* USER: Domain search and management */}
        <Route path="/domains/:id" element={<DomainDetails />} />  {/* USER: Domain details and DNS management */}

        {/* Offers routes */}
        <Route path="/offers/maintenance" element={<MaintenanceOffer />} />  {/* PUBLIC: Business maintenance subscription offer */}
        <Route path="/offers/sitemaintenance" element={<SiteMaintenance />} />  {/* PUBLIC: Site maintenance subscription offer */}

        {/* Test routes */}
        <Route path="/test/sendemail" element={<SendTestEmail />} />
        <Route path="/test/upload" element={<TestUploadFile />} />
        <Route path="/test/upload-encrypted" element={<TestUploadEncryptedFile />} />
        <Route path="/test/auth" element={<TestAuth />} />
        <Route path="/test/cart" element={<TestClientCart />} />
        <Route path="/test/upload-pinata" element={<TestUploadFileToPinata />} />
        <Route path="/test/audio-transcribe-n8n" element={<TestUploadAudioToPinataAndTranscribeWithn8n />} />

      </Routes>
    </>
  );
};

export const App = () => {
  // Check and set tenantId if missing
  React.useEffect(() => {
    const storedTenantId = localStorage.getItem('tenantId');
    if (!storedTenantId) {
      // Use the tenantId from brandConfig as default
      if (brandConfig.tenantId) {
        localStorage.setItem('tenantId', brandConfig.tenantId);
      }
    }
  }, []);

  return (
    <Router>
      <ApolloProvider client={apolloClient}>
        <AuthProvider>
          <ChakraProvider theme={theme}>
            <AppContent />
          </ChakraProvider>
        </AuthProvider>
      </ApolloProvider>
    </Router>
  );
};
