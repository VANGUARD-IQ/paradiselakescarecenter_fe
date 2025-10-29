import React from 'react';
import ProtectedResearchDesignWrapper from './ProtectedResearchDesignWrapper';

// Import all the unprotected components
import ResearchAndDesignDashboard from './index';
import ResearchAndDesignProjects from './projects';
import ResearchAndDesignProjectWizard from './new';
import ResearchAndDesignProjectDetail from './project';
import ResearchAndDesignTimesheet from './timesheet';
import ResearchAndDesignEvidence from './evidence';
import ResearchAndDesignGapAnalysis from './gaps';
import RDTIDocsPage from './docs';

// Export all protected versions from a single file
export const ProtectedResearchAndDesignDashboard: React.FC = () => (
  <ProtectedResearchDesignWrapper 
    pageTitle="R&D Dashboard"
    pageDescription="This R&D dashboard contains proprietary project tracking and tax incentive documentation. Please log in to access this content."
  >
    <ResearchAndDesignDashboard />
  </ProtectedResearchDesignWrapper>
);

export const ProtectedResearchAndDesignProjects: React.FC = () => (
  <ProtectedResearchDesignWrapper 
    pageTitle="R&D Projects"
    pageDescription="Access to R&D project documentation and tracking requires authentication. This contains proprietary project information and strategies."
  >
    <ResearchAndDesignProjects />
  </ProtectedResearchDesignWrapper>
);

export const ProtectedResearchAndDesignProjectWizard: React.FC = () => (
  <ProtectedResearchDesignWrapper 
    pageTitle="New R&D Project"
    pageDescription="Creating new R&D projects requires authentication to ensure proper documentation and compliance tracking."
  >
    <ResearchAndDesignProjectWizard />
  </ProtectedResearchDesignWrapper>
);

export const ProtectedResearchAndDesignProjectDetail: React.FC = () => (
  <ProtectedResearchDesignWrapper 
    pageTitle="R&D Project Details"
    pageDescription="R&D project details contain proprietary information and require authentication to access."
  >
    <ResearchAndDesignProjectDetail />
  </ProtectedResearchDesignWrapper>
);

export const ProtectedResearchAndDesignTimesheet: React.FC = () => (
  <ProtectedResearchDesignWrapper 
    pageTitle="R&D Time Tracking"
    pageDescription="Time tracking for R&D activities requires authentication to ensure accurate documentation for tax incentive claims."
  >
    <ResearchAndDesignTimesheet />
  </ProtectedResearchDesignWrapper>
);

export const ProtectedResearchAndDesignEvidence: React.FC = () => (
  <ProtectedResearchDesignWrapper 
    pageTitle="R&D Evidence Upload"
    pageDescription="Evidence upload for R&D activities requires authentication to maintain compliance and documentation integrity."
  >
    <ResearchAndDesignEvidence />
  </ProtectedResearchDesignWrapper>
);

export const ProtectedResearchAndDesignGapAnalysis: React.FC = () => (
  <ProtectedResearchDesignWrapper 
    pageTitle="R&D Gap Analysis"
    pageDescription="Gap analysis for R&D documentation requires authentication to access proprietary compliance insights."
  >
    <ResearchAndDesignGapAnalysis />
  </ProtectedResearchDesignWrapper>
);

export const ProtectedRDTIDocsPage: React.FC = () => (
  <ProtectedResearchDesignWrapper 
    pageTitle="R&DTI Guide - 2025 Rules"
    pageDescription="Access the complete R&D Tax Incentive eligibility guide with the latest 2025 regulatory changes, interactive decision trees, and compliance documentation. This comprehensive resource helps you navigate the new R&DTI assessment process and maximize your tax benefits."
    autoOpenLogin={false}
    previewContent={
      <>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#22C55E' }}>
          🎉 Updated for 2025 Rules - Be Ahead of the Game!
        </h3>
        <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
          <li>✅ Interactive Eligibility Decision Tree - Navigate complex R&DTI requirements</li>
          <li>🆕 <strong>August 2025 Regulatory Changes</strong> - Get ahead of the new rules!</li>
          <li>📊 Core vs Supporting R&D Classification Guide</li>
          <li>📝 Documentation Requirements Checklist</li>
          <li>🎯 Technical Uncertainty Assessment Tools</li>
          <li>💰 Tax Offset Calculation Examples (43.5% for companies under $20M turnover)</li>
          <li>🔍 Industry-Specific Eligibility Criteria</li>
          <li>📈 Project Tracking Templates</li>
          <li>⚡ Real-time compliance verification tools</li>
        </ul>
        <p style={{ fontStyle: 'italic', color: '#666', marginTop: '1rem' }}>
          <strong>Why this matters:</strong> The August 2025 changes will significantly impact how R&D claims are assessed. 
          Get exclusive access to our comprehensive guide that puts you ahead of these changes, ensuring your 
          claims are compliant and maximized under the new regulations.
        </p>
        <p style={{ fontWeight: 'bold', color: '#6B46C1', marginTop: '1rem' }}>
          📅 Don't wait until August 2025 - Start preparing now with our exclusive insights!
        </p>
      </>
    }
  >
    <RDTIDocsPage />
  </ProtectedResearchDesignWrapper>
);