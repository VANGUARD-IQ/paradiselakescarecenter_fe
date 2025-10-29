import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Box,
  Heading,
  VStack,
  Container,
  Card,
  CardBody,
  CardHeader,
  Text,
  HStack,
  useToast,
  Spinner,
  Center,
  IconButton,
  Tooltip,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorMode
} from '@chakra-ui/react';
import { NavbarWithCallToAction } from '../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';
import { getColor } from '../../brandConfig';
import { ModuleBreadcrumb } from '../../components/ModuleBreadcrumb';
import { usePageTitle } from '../../hooks/useDocumentTitle';
import researchAndDesignModuleConfig from './moduleConfig';
import { ChevronUpIcon, ChevronDownIcon, CopyIcon } from '@chakra-ui/icons';
import mermaid from 'mermaid';

// Initialize Mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  themeVariables: {
    primaryColor: '#6B46C1',
    primaryTextColor: '#fff',
    primaryBorderColor: '#7c3aed',
    lineColor: '#5a67d8',
    secondaryColor: '#22C55E',
    tertiaryColor: '#fff',
    mainBkg: '#f7fafc',
    secondBkg: '#e2e8f0',
    tertiaryBkg: '#cbd5e0',
  },
});

// Mermaid chart definitions
const mermaidCharts = [
  {
    id: 'eligibility',
    title: 'Eligibility Decision Tree',
    description: 'Complete flow from company registration check through to Core/Supporting R&D classification',
    chart: `flowchart TD
    Start(["🚀 Start R&DTI Assessment"]) --> Q1["Is company registered<br/>in Australia?"]
    Q1 -->|Yes| Q2["Is the entity type<br/>eligible?"]
    Q1 -->|No| NotEligible1["❌ Not Eligible:<br/>Must be Australian entity"]
    
    Q2 -->|Corporation/Trust/Partnership| Q3["Annual turnover<br/>< $20 billion?"]
    Q2 -->|Individual/Other| NotEligible2["❌ Not Eligible:<br/>Entity type excluded"]
    
    Q3 -->|Yes| Q4["Industry check:<br/>Gambling/Tobacco?"]
    Q3 -->|No| NotEligible3["❌ Not Eligible:<br/>Exceeds turnover threshold"]
    
    Q4 -->|No| Q5["Activities conducted<br/>in Australia?"]
    Q4 -->|Yes| NotEligible4["❌ Not Eligible:<br/>Excluded industry"]
    
    Q5 -->|Yes| Q6["Registration timing<br/>check"]
    Q5 -->|No| NotEligible5["❌ Not Eligible:<br/>Must be Australian activities"]
    
    Q6 --> Q7["First time or<br/>within 10 months?"]
    Q7 -->|Yes| Q8["Is activity on<br/>exclusion list<br/>s.355-25(2)?"]
    Q7 -->|No| NotEligible6["❌ Not Eligible:<br/>Registration deadline passed"]
    
    Q8 -->|No| Q9["Is there genuine<br/>technical uncertainty?"]
    Q8 -->|Yes| NotEligible7["❌ Not Eligible:<br/>Activity explicitly excluded"]
    
    Q9 -->|Yes| Q10["Can outcome be known<br/>by competent professional?"]
    Q9 -->|No| NotEligible8["❌ Not Eligible:<br/>No technical uncertainty"]
    
    Q10 -->|No| Q11["Is there a<br/>hypothesis to test?"]
    Q10 -->|Yes| NotEligible9["❌ Not Eligible:<br/>Not genuine R&D"]
    
    Q11 -->|Yes| Q12["Using systematic<br/>experimentation?"]
    Q11 -->|No| NotEligible10["❌ Not Eligible:<br/>No hypothesis"]
    
    Q12 -->|Yes| Q13["Purpose is generating<br/>new knowledge?"]
    Q12 -->|No| NotEligible11["❌ Not Eligible:<br/>Not systematic"]
    
    Q13 -->|Yes| Q14["Is this the<br/>core R&D activity?"]
    Q13 -->|No| NotEligible12["❌ Not Eligible:<br/>Wrong purpose"]
    
    Q14 -->|Yes| CoreRD["✅ CORE R&D ACTIVITY<br/>Eligible for R&DTI"]
    Q14 -->|No| Q15["Directly related to<br/>core R&D?"]
    
    Q15 -->|Yes| Q16["Dominant purpose<br/>supporting core R&D?"]
    Q15 -->|No| NotEligible13["❌ Not Eligible:<br/>Not related to core R&D"]
    
    Q16 -->|Yes| SupportingRD["✅ SUPPORTING R&D ACTIVITY<br/>Eligible for R&DTI"]
    Q16 -->|No| NotEligible14["❌ Not Eligible:<br/>Fails dominant purpose test"]
    
    style Start fill:#6B46C1,stroke:#6B46C1,color:#fff
    style CoreRD fill:#22C55E,stroke:#22C55E,color:#fff
    style SupportingRD fill:#22C55E,stroke:#22C55E,color:#fff
    style NotEligible1 fill:#EF4444,stroke:#EF4444,color:#fff
    style NotEligible2 fill:#EF4444,stroke:#EF4444,color:#fff
    style NotEligible3 fill:#EF4444,stroke:#EF4444,color:#fff
    style NotEligible4 fill:#EF4444,stroke:#EF4444,color:#fff
    style NotEligible5 fill:#EF4444,stroke:#EF4444,color:#fff
    style NotEligible6 fill:#EF4444,stroke:#EF4444,color:#fff
    style NotEligible7 fill:#EF4444,stroke:#EF4444,color:#fff
    style NotEligible8 fill:#EF4444,stroke:#EF4444,color:#fff
    style NotEligible9 fill:#EF4444,stroke:#EF4444,color:#fff
    style NotEligible10 fill:#EF4444,stroke:#EF4444,color:#fff
    style NotEligible11 fill:#EF4444,stroke:#EF4444,color:#fff
    style NotEligible12 fill:#EF4444,stroke:#EF4444,color:#fff
    style NotEligible13 fill:#EF4444,stroke:#EF4444,color:#fff
    style NotEligible14 fill:#EF4444,stroke:#EF4444,color:#fff`
  },
  {
    id: 'core-vs-supporting',
    title: 'Core vs Supporting Activities Classification',
    description: 'Clear distinction between experimental and non-experimental activities',
    chart: `flowchart LR
    Start(["Activity Classification"]) --> Type["What type of<br/>R&D activity?"]
    
    Type --> Core["Core R&D<br/>Activities"]
    Type --> Supporting["Supporting R&D<br/>Activities"]
    
    Core --> CoreDef["Experimental activities to<br/>resolve technical uncertainty"]
    CoreDef --> CoreEx["✓ Algorithm development<br/>✓ New process creation<br/>✓ Novel system design<br/>✓ Technical feasibility testing"]
    
    Supporting --> SuppDef["Activities directly related<br/>to Core R&D"]
    SuppDef --> SuppCat["Three Categories"]
    
    SuppCat --> Cat1["Directly Related"]
    Cat1 --> Cat1Ex["• Project management<br/>• Data collection<br/>• Testing & trials<br/>• Documentation"]
    
    SuppCat --> Cat2["For Core R&D"]
    Cat2 --> Cat2Ex["• Prototype construction<br/>• Design work<br/>• System integration<br/>• Technical analysis"]
    
    SuppCat --> Cat3["Dominant Purpose"]
    Cat3 --> Cat3Ex["• Must primarily support<br/>core R&D objectives<br/>• Not commercial purposes<br/>• Not routine production"]
    
    CoreEx --> Eligible1["✅ Eligible"]
    Cat1Ex --> Test1["Apply Dominant<br/>Purpose Test"]
    Cat2Ex --> Test2["Apply Dominant<br/>Purpose Test"]
    Cat3Ex --> Test3["Apply Dominant<br/>Purpose Test"]
    
    Test1 --> Result["✅ Pass = Eligible<br/>❌ Fail = Not Eligible"]
    Test2 --> Result
    Test3 --> Result
    
    style Start fill:#6B46C1,stroke:#6B46C1,color:#fff
    style Eligible1 fill:#22C55E,stroke:#22C55E,color:#fff
    style Result fill:#3B82F6,stroke:#3B82F6,color:#fff`
  },
  {
    id: 'documentation',
    title: 'Documentation Requirements Flow',
    description: 'Comprehensive process from project inception to ATO review',
    chart: `flowchart TD
    Start(["Documentation Requirements"]) --> Init["Project Initiation"]
    
    Init --> Doc1["📝 Project Charter"]
    Init --> Doc2["📝 Technical Objectives"]
    Init --> Doc3["📝 Hypothesis Statement"]
    
    Doc1 --> During["During R&D Activities"]
    Doc2 --> During
    Doc3 --> During
    
    During --> Tech["Technical Documentation"]
    During --> Proj["Project Documentation"]
    During --> Fin["Financial Documentation"]
    During --> Know["Knowledge Documentation"]
    
    Tech --> TechItems["• Experiment plans<br/>• Test protocols<br/>• Results & data<br/>• Technical reports<br/>• Design documents"]
    
    Proj --> ProjItems["• Meeting minutes<br/>• Progress reports<br/>• Change logs<br/>• Risk registers<br/>• Decision logs"]
    
    Fin --> FinItems["• Timesheets<br/>• Invoices<br/>• Cost allocations<br/>• Budget reports<br/>• Asset registers"]
    
    Know --> KnowItems["• Literature reviews<br/>• Patent searches<br/>• Expert opinions<br/>• Industry analysis<br/>• Knowledge gaps"]
    
    TechItems --> Review["ATO Review Ready"]
    ProjItems --> Review
    FinItems --> Review
    KnowItems --> Review
    
    Review --> Complete["✅ Complete Documentation Package"]
    
    style Start fill:#6B46C1,stroke:#6B46C1,color:#fff
    style Complete fill:#22C55E,stroke:#22C55E,color:#fff`
  },
  {
    id: 'technical-uncertainty',
    title: 'Technical Uncertainty Framework',
    description: 'Step-by-step assessment of whether genuine technical uncertainty exists',
    chart: `flowchart TD
    Start(["Assess Technical Uncertainty"]) --> Q1["Is the outcome<br/>currently unknown?"]
    
    Q1 -->|Yes| Q2["Has a competent<br/>professional tried<br/>to solve it?"]
    Q1 -->|No| NotUncertain1["❌ No Uncertainty:<br/>Solution already exists"]
    
    Q2 -->|Yes| Q3["Did they succeed<br/>using existing<br/>knowledge?"]
    Q2 -->|No| Q4["Is expert knowledge<br/>publicly available?"]
    
    Q3 -->|No| Q5["Are you trying a<br/>different approach?"]
    Q3 -->|Yes| NotUncertain2["❌ No Uncertainty:<br/>Can be solved with<br/>existing knowledge"]
    
    Q4 -->|No| Q6["Have you searched<br/>globally for<br/>solutions?"]
    Q4 -->|Yes| NotUncertain3["❌ No Uncertainty:<br/>Expert knowledge available"]
    
    Q5 -->|Yes| Valid1["✅ Valid Technical<br/>Uncertainty"]
    Q5 -->|No| NotUncertain4["❌ No Uncertainty:<br/>Using same failed approach"]
    
    Q6 -->|Yes| Q7["Found any<br/>solutions?"]
    Q6 -->|No| NotUncertain5["❌ Incomplete:<br/>Must search globally"]
    
    Q7 -->|No| Q8["Is it a knowledge<br/>gap or just<br/>information gap?"]
    Q7 -->|Yes| NotUncertain6["❌ No Uncertainty:<br/>Solution exists elsewhere"]
    
    Q8 -->|Knowledge Gap| Valid2["✅ Valid Technical<br/>Uncertainty"]
    Q8 -->|Information Gap| NotUncertain7["❌ No Uncertainty:<br/>Just lacking information"]
    
    Valid1 --> Document["📝 Document:<br/>• What is unknown<br/>• Why it's uncertain<br/>• Evidence of searches<br/>• Expert opinions"]
    Valid2 --> Document
    
    style Start fill:#6B46C1,stroke:#6B46C1,color:#fff
    style Valid1 fill:#22C55E,stroke:#22C55E,color:#fff
    style Valid2 fill:#22C55E,stroke:#22C55E,color:#fff
    style Document fill:#3B82F6,stroke:#3B82F6,color:#fff
    style NotUncertain1 fill:#EF4444,stroke:#EF4444,color:#fff
    style NotUncertain2 fill:#EF4444,stroke:#EF4444,color:#fff
    style NotUncertain3 fill:#EF4444,stroke:#EF4444,color:#fff
    style NotUncertain4 fill:#EF4444,stroke:#EF4444,color:#fff
    style NotUncertain5 fill:#EF4444,stroke:#EF4444,color:#fff
    style NotUncertain6 fill:#EF4444,stroke:#EF4444,color:#fff
    style NotUncertain7 fill:#EF4444,stroke:#EF4444,color:#fff`
  },
  {
    id: 'systematic-progression',
    title: 'Systematic Progression Requirements',
    description: 'Five-phase experimental approach with feedback loops',
    chart: `flowchart LR
    Start(["Systematic Progression"]) --> P1["Phase 1:<br/>Hypothesis"]
    
    P1 --> P1D["📝 Define:<br/>• Problem statement<br/>• Proposed solution<br/>• Success criteria<br/>• Variables"]
    
    P1D --> P2["Phase 2:<br/>Design"]
    
    P2 --> P2D["📝 Plan:<br/>• Experiment design<br/>• Control variables<br/>• Test protocols<br/>• Resource allocation"]
    
    P2D --> P3["Phase 3:<br/>Execute"]
    
    P3 --> P3D["📝 Conduct:<br/>• Run experiments<br/>• Collect data<br/>• Record observations<br/>• Track variations"]
    
    P3D --> P4["Phase 4:<br/>Evaluate"]
    
    P4 --> P4D["📝 Analyze:<br/>• Data analysis<br/>• Statistical validation<br/>• Compare to hypothesis<br/>• Identify patterns"]
    
    P4D --> P5["Phase 5:<br/>Conclude"]
    
    P5 --> P5D["📝 Document:<br/>• Results summary<br/>• Success/failure<br/>• Lessons learned<br/>• Next steps"]
    
    P5D --> Decision["Objectives<br/>Achieved?"]
    
    Decision -->|No| Iterate["Iterate:<br/>Refine hypothesis"]
    Decision -->|Yes| Complete["✅ R&D Complete"]
    
    Iterate --> P1
    
    style Start fill:#6B46C1,stroke:#6B46C1,color:#fff
    style Complete fill:#22C55E,stroke:#22C55E,color:#fff
    style Iterate fill:#FB923C,stroke:#FB923C,color:#fff`
  },
  {
    id: 'industry-knowledge',
    title: 'Industry Knowledge Criteria',
    description: 'Global vs local knowledge assessment',
    chart: `flowchart TD
    Start(["Industry Knowledge Assessment"]) --> Scope["Knowledge Scope"]
    
    Scope --> Global["Global Knowledge"]
    Scope --> Local["Local Knowledge"]
    
    Global --> GDef["What is known<br/>anywhere in world"]
    Local --> LDef["What is known<br/>in your organization"]
    
    GDef --> Search["Knowledge Search"]
    LDef --> Search
    
    Search --> S1["📚 Academic Literature"]
    Search --> S2["🔬 Scientific Journals"]
    Search --> S3["💼 Industry Publications"]
    Search --> S4["🌐 Patents & IP"]
    Search --> S5["👥 Expert Networks"]
    Search --> S6["🏢 Competitor Analysis"]
    
    S1 --> Found["Knowledge<br/>Found?"]
    S2 --> Found
    S3 --> Found
    S4 --> Found
    S5 --> Found
    S6 --> Found
    
    Found -->|Yes| Accessible["Is it<br/>accessible?"]
    Found -->|No| Gap["✅ Knowledge Gap<br/>Confirmed"]
    
    Accessible -->|Yes| NotEligible["❌ Not Eligible:<br/>Knowledge exists<br/>and is accessible"]
    Accessible -->|No| Restricted["Why not<br/>accessible?"]
    
    Restricted --> R1["Trade Secret"]
    Restricted --> R2["Cost Prohibitive"]
    Restricted --> R3["Geographic Limits"]
    Restricted --> R4["Language Barrier"]
    
    R1 --> Gap
    R2 --> Evaluate["Evaluate if<br/>reasonable effort"]
    R3 --> Evaluate
    R4 --> Evaluate
    
    Evaluate -->|Unreasonable| Gap
    Evaluate -->|Reasonable| NotEligible
    
    style Start fill:#6B46C1,stroke:#6B46C1,color:#fff
    style Gap fill:#22C55E,stroke:#22C55E,color:#fff
    style NotEligible fill:#EF4444,stroke:#EF4444,color:#fff`
  },
  {
    id: 'excluded-activities',
    title: 'Excluded Activities Mind Map',
    description: 'Activities that cannot be Core R&D but may qualify as Supporting R&D',
    chart: `mindmap
  root((Excluded Activities))
    Market Activities
      Market research
      Sales promotion
      Market testing
      Consumer surveys
    Resource Exploration
      Prospecting
      Exploring
      Drilling for minerals
      Drilling for petroleum
    Management Studies
      Efficiency surveys
      Management reviews
      Organisation studies
      Time and motion studies
    Social Sciences
      Arts research
      Humanities research
      Social sciences research
      Economic research
    Administrative
      Commercial activities
      Legal activities
      Administrative support
      Financial management
    Compliance
      Regulatory compliance
      Standards compliance
      Quality assurance
      Certification activities
    Routine Work
      Routine testing
      Routine analysis
      Information collection
      Data compilation
    Software
      Internal admin software
      Business systems
      Office automation
      Accounting systems
    Cosmetic
      Stylistic changes
      Aesthetic modifications
      Branding updates
      Visual design only`
  },
  {
    id: 'documentation-best-practices',
    title: 'Documentation Best Practices',
    description: 'Best practices vs red flags for R&DTI documentation',
    chart: `flowchart LR
    subgraph BP["Best Practices"]
        BP1["✓ Date all documents"]
        BP2["✓ Include author info"]
        BP3["✓ Version control"]
        BP4["✓ Link to experiments"]
        BP5["✓ Contemporaneous records"]
        BP6["✓ Clear file naming"]
        BP7["✓ Regular backups"]
        BP8["✓ Access controls"]
    end
    
    subgraph RF["Red Flags to Avoid"]
        RF1["✗ Retrospective creation"]
        RF2["✗ Missing signatures"]
        RF3["✗ Inconsistent dates"]
        RF4["✗ Generic descriptions"]
        RF5["✗ No version history"]
        RF6["✗ Unlinked expenses"]
        RF7["✗ Missing evidence"]
        RF8["✗ Poor organization"]
    end
    
    style BP1 fill:#4CAF50,color:#fff
    style BP2 fill:#4CAF50,color:#fff
    style BP3 fill:#4CAF50,color:#fff
    style BP4 fill:#4CAF50,color:#fff
    style BP5 fill:#4CAF50,color:#fff
    style BP6 fill:#4CAF50,color:#fff
    style BP7 fill:#4CAF50,color:#fff
    style BP8 fill:#4CAF50,color:#fff
    style RF1 fill:#f44336,color:#fff
    style RF2 fill:#f44336,color:#fff
    style RF3 fill:#f44336,color:#fff
    style RF4 fill:#f44336,color:#fff
    style RF5 fill:#f44336,color:#fff
    style RF6 fill:#f44336,color:#fff
    style RF7 fill:#f44336,color:#fff
    style RF8 fill:#f44336,color:#fff`
  },
  {
    id: 'competent-professional',
    title: 'Competent Professional Standard',
    description: 'Criteria for assessing competent professional knowledge',
    chart: `flowchart LR
    subgraph CPC["Competent Professional Characteristics"]
        CP1["Relevant Qualifications"]
        CP2["Industry Experience"]
        CP3["Current Knowledge"]
        CP4["Peer Recognition"]
        CP5["Access to Resources"]
        CP6["Published Work"]
    end
    
    subgraph AQ["Assessment Questions"]
        AQ1["Could they predict outcome?"]
        AQ2["Would they need to experiment?"]
        AQ3["Is existing knowledge applicable?"]
        AQ4["Are there known solutions?"]
    end
    
    CP1 --> Decision["Meets Standard?"]
    CP2 --> Decision
    CP3 --> Decision
    CP4 --> Decision
    CP5 --> Decision
    CP6 --> Decision
    
    Decision -->|Yes| AQ1
    AQ1 --> AQ2
    AQ2 --> AQ3
    AQ3 --> AQ4
    
    AQ4 --> Result["Technical<br/>Uncertainty<br/>Exists?"]`
  },
  {
    id: 'documentation-per-phase',
    title: 'Documentation Requirements per Phase',
    description: 'Required documents for each phase of R&D',
    chart: `flowchart LR
    subgraph P1["Phase 1 Documents"]
        D1A["Hypothesis Statement"]
        D1B["Literature Review"]
        D1C["Success Metrics"]
    end
    
    subgraph P2["Phase 2 Documents"]
        D2A["Experimental Protocol"]
        D2B["Control Strategy"]
        D2C["Measurement Plan"]
    end
    
    subgraph P3["Phase 3 Documents"]
        D3A["Lab Notebooks"]
        D3B["Raw Data Files"]
        D3C["Observation Logs"]
    end
    
    subgraph P4["Phase 4 Documents"]
        D4A["Analysis Reports"]
        D4B["Statistical Output"]
        D4C["Comparison Tables"]
    end
    
    subgraph P5["Phase 5 Documents"]
        D5A["Conclusion Report"]
        D5B["Knowledge Summary"]
        D5C["Recommendations"]
    end`
  },
  {
    id: 'industry-specific',
    title: 'Industry-Specific Considerations',
    description: 'Valid R&D vs non-R&D activities by industry',
    chart: `mindmap
  root((Industry Considerations))
    Software
      Valid R&D
        Algorithm development
        Platform constraints
        Performance optimization
        Novel architectures
      Not R&D
        Routine debugging
        Standard integration
        UI/UX improvements
        Version updates
    Manufacturing
      Valid R&D
        Scale-up uncertainties
        Material behavior
        Process optimization
        Equipment boundaries
      Not R&D
        Routine improvement
        Quality control
        Known methods
        Cosmetic changes
    Biotechnology
      Valid R&D
        System unpredictability
        Cross-species application
        Pathway discovery
        Biocompatibility
      Not R&D
        Routine screening
        Protocol optimization
        Compliance testing
        Quality assurance
    Engineering
      Valid R&D
        New materials
        System integration
        Performance limits
        Environmental adaptation
      Not R&D
        Standard design
        Known solutions
        Safety compliance
        Maintenance`
  },
  {
    id: 'compliance-timeline',
    title: 'Annual Compliance Timeline',
    description: 'R&DTI compliance activities throughout the fiscal year',
    chart: `gantt
    title R&DTI Annual Compliance Timeline (FY 2025-26)
    dateFormat YYYY-MM-DD
    section Project Phase
    R&D Activities           :rd, 2025-07-01, 365d
    Documentation Creation    :doc, 2025-07-01, 365d
    
    section Registration
    Prepare Registration      :prep, 2026-03-01, 30d
    Submit Registration      :milestone, submit, 2026-04-30, 0d
    Registration Deadline    :crit, milestone, regdead, 2026-04-30, 0d
    
    section Tax Return
    Prepare R&DTI Schedule   :taxprep, 2026-07-01, 30d
    Lodge Tax Return         :lodge, 2026-10-31, 1d
    Tax Return Deadline      :crit, milestone, taxdead, 2026-10-31, 0d
    
    section Reviews
    Potential ATO Review     :review, 2026-11-01, 90d
    Response Period          :response, 2026-11-01, 28d
    
    section Key Dates
    New Form Launch          :milestone, newform, 2025-08-15, 0d
    Exclusions Start         :milestone, excl, 2025-07-01, 0d`
  },
  {
    id: 'monthly-checklist',
    title: 'Monthly Compliance Checklist',
    description: 'Ongoing monthly, quarterly, and annual tasks',
    chart: `flowchart LR
    subgraph OM["Ongoing Monthly"]
        M1["Update project docs"]
        M2["Review time sheets"]
        M3["Collect invoices"]
        M4["Document experiments"]
        M5["Meeting minutes"]
    end
    
    subgraph QR["Quarterly Review"]
        Q1["Expenditure reconciliation"]
        Q2["Project progress review"]
        Q3["Documentation audit"]
        Q4["Risk assessment"]
    end
    
    subgraph AT["Annual Tasks"]
        A1["Registration preparation"]
        A2["Final documentation"]
        A3["Tax return schedule"]
        A4["Archive records"]
    end
    
    M1 --> Q1
    M2 --> Q1
    M3 --> Q1
    M4 --> Q2
    M5 --> Q2
    
    Q1 --> A1
    Q2 --> A1
    Q3 --> A2
    Q4 --> A3`
  },
  {
    id: 'critical-success',
    title: 'Critical Success Factors',
    description: 'Key factors for successful R&DTI claims',
    chart: `flowchart TD
    Success(["R&DTI Success Factors"]) --> F1["Strong Documentation"]
    Success --> F2["Clear Hypothesis"]
    Success --> F3["Genuine Uncertainty"]
    Success --> F4["Systematic Approach"]
    Success --> F5["Timely Registration"]
    Success --> F6["Accurate Claims"]
    
    F1 --> D1["✓ Contemporaneous records"]
    F1 --> D2["✓ Technical evidence"]
    F1 --> D3["✓ Financial substantiation"]
    
    F2 --> H1["✓ Scientific basis"]
    F2 --> H2["✓ Testable proposition"]
    F2 --> H3["✓ Clear metrics"]
    
    F3 --> U1["✓ Global knowledge search"]
    F3 --> U2["✓ Expert validation"]
    F3 --> U3["✓ Documented gaps"]
    
    F4 --> S1["✓ Experimental method"]
    F4 --> S2["✓ Logical progression"]
    F4 --> S3["✓ Evidence-based conclusions"]
    
    F5 --> T1["✓ 10-month deadline met"]
    F5 --> T2["✓ Complete information"]
    F5 --> T3["✓ Consistent details"]
    
    F6 --> C1["✓ Eligible activities only"]
    F6 --> C2["✓ Correct calculations"]
    F6 --> C3["✓ Proper allocations"]
    
    style Success fill:#2196F3,color:#fff
    style F1 fill:#4CAF50,color:#fff
    style F2 fill:#4CAF50,color:#fff
    style F3 fill:#4CAF50,color:#fff
    style F4 fill:#4CAF50,color:#fff
    style F5 fill:#4CAF50,color:#fff
    style F6 fill:#4CAF50,color:#fff`
  },
  {
    id: 'risk-matrix',
    title: 'Risk Assessment Matrix',
    description: 'Quadrant chart for R&DTI risk assessment',
    chart: `quadrantChart
    title R&DTI Risk Assessment Matrix
    x-axis "Low Documentation" --> "High Documentation"
    y-axis "Low Technical Merit" --> "High Technical Merit"
    quadrant-1 "Low Risk - Proceed"
    quadrant-2 "Documentation Risk - Improve Records"
    quadrant-3 "High Risk - Reconsider Claim"
    quadrant-4 "Technical Risk - Strengthen Evidence"
    
    "Strong hypothesis, full docs": [0.9, 0.9]
    "Clear uncertainty, good records": [0.8, 0.8]
    "Novel research, adequate docs": [0.7, 0.9]
    "Systematic approach, all evidence": [0.85, 0.75]
    "Weak hypothesis, poor records": [0.2, 0.2]
    "Routine work, no documentation": [0.1, 0.1]
    "Known solution, some records": [0.4, 0.3]
    "Good science, missing docs": [0.3, 0.8]
    "Full records, questionable R&D": [0.8, 0.3]`
  },
  {
    id: 'consultant-protocol',
    title: 'Consultant Assessment Protocol',
    description: 'Step-by-step consultant action protocol for R&DTI assessment',
    chart: `flowchart TD
    Client(["New Client Engagement"]) --> Step1["1. Company Eligibility Check"]
    
    Step1 --> S1A["✓ ASIC registration"]
    Step1 --> S1B["✓ Minimum expenditure"]
    Step1 --> S1C["✓ Industry eligibility"]
    Step1 --> S1D["✓ Tax status"]
    
    S1A --> Step2["2. Activity Assessment"]
    S1B --> Step2
    S1C --> Step2
    S1D --> Step2
    
    Step2 --> S2A["Review project descriptions"]
    Step2 --> S2B["Apply eligibility flowchart"]
    Step2 --> S2C["Classify Core vs Supporting"]
    Step2 --> S2D["Identify excluded activities"]
    
    S2A --> Step3["3. Documentation Review"]
    S2B --> Step3
    S2C --> Step3
    S2D --> Step3
    
    Step3 --> S3A["Check technical records"]
    Step3 --> S3B["Verify financial docs"]
    Step3 --> S3C["Assess knowledge searches"]
    Step3 --> S3D["Review systematic approach"]
    
    S3A --> Step4["4. Gap Analysis"]
    S3B --> Step4
    S3C --> Step4
    S3D --> Step4
    
    Step4 --> S4A["Identify missing evidence"]
    Step4 --> S4B["List documentation gaps"]
    Step4 --> S4C["Assess compliance risks"]
    Step4 --> S4D["Estimate claim value"]
    
    S4A --> Step5["5. Recommendation Report"]
    S4B --> Step5
    S4C --> Step5
    S4D --> Step5
    
    Step5 --> Report["📊 Deliver Assessment Report"]
    
    Report --> Contents["Report Contents:<br/>• Eligibility determination<br/>• Activity classifications<br/>• Documentation requirements<br/>• Risk assessment<br/>• Claim estimate<br/>• Action plan<br/>• Timeline"]
    
    style Client fill:#2196F3,color:#fff
    style Report fill:#4CAF50,color:#fff
    style Contents fill:#FFC107,color:#000`
  }
];

// Counter for unique IDs
let idCounter = 0;

function generateUniqueId() {
  return `mermaid-react-${idCounter++}`;
}

// Mermaid Chart Component
interface MermaidChartProps {
  code: string;
  id: string;
}

const MermaidChart: React.FC<MermaidChartProps> = ({ code, id }) => {
  usePageTitle("R&D Documentation");
  const idRef = useRef(generateUniqueId());
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    let active = true;
    
    const renderChart = async () => {
      try {
        const { svg } = await mermaid.render(idRef.current, code);
        if (active && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        if (active && containerRef.current) {
          containerRef.current.innerHTML = `<pre style="color: red;">Mermaid render error:\n${String(err)}</pre>`;
          console.error('Mermaid render error for chart', id, ':', err);
        }
      }
    };

    renderChart();

    return () => {
      active = false;
    };
  }, [code, id]);

  return <div ref={containerRef} />;
};

const RDTIDocsPage: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [expandedSections, setExpandedSections] = useState<number[]>([0, 1, 2]);
  const toast = useToast();
  const { colorMode } = useColorMode();

  // Consistent styling
  const bg = getColor("background.main", colorMode);
  const cardGradientBg = getColor("background.cardGradient", colorMode);
  const cardBorder = getColor("border.darkCard", colorMode);
  const textPrimary = getColor("text.primaryDark", colorMode);
  const textSecondary = getColor("text.secondaryDark", colorMode);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / scrollHeight) * 100;
      setScrollProgress(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyChart = (chartCode: string) => {
    navigator.clipboard.writeText(chartCode);
    toast({
      title: "Chart copied!",
      description: "Mermaid code has been copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const toggleSection = (index: number) => {
    setExpandedSections(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const sections = [
    {
      title: '📋 Overview',
      content: `The R&D Tax Incentive (R&DTI) is Australia's key innovation support program, providing tax offsets for eligible R&D activities. This comprehensive guide provides visual flowcharts and decision trees to help determine eligibility and understand requirements.`
    },
    {
      title: '🎯 Eligibility Criteria',
      content: `To qualify for the R&DTI, companies must meet specific criteria including entity type, turnover thresholds, and activity requirements. The following charts guide you through the complete eligibility assessment process.`
    },
    {
      title: '📊 Visual Assessment Tools',
      content: `Interactive flowcharts for determining R&D eligibility, classifying activities, and understanding documentation requirements. Each chart provides a step-by-step decision process.`
    },
    {
      title: '⚠️ August 2025 Changes',
      content: `Important updates coming August 15, 2025: New registration form, industry exclusions for gambling and tobacco, enhanced documentation requirements, and deletion of all draft applications.`
    },
    {
      title: '📝 Documentation Requirements',
      content: `Comprehensive documentation is essential for R&DTI claims. This includes technical documentation, project records, financial substantiation, and evidence of knowledge gaps.`
    }
  ];

  return (
    <Box bg={bg} minHeight="100vh">
      <NavbarWithCallToAction />
      
      {/* Progress Bar */}
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        h="3px"
        bg="rgba(107, 70, 193, 0.2)"
        zIndex="9999"
      >
        <ModuleBreadcrumb moduleConfig={researchAndDesignModuleConfig} />
        <Box
          h="100%"
          bg={getColor("primary", colorMode)}
          w={`${scrollProgress}%`}
          transition="width 0.2s"
        />
      </Box>

      {/* Scroll to Top Button */}
      <IconButton
        aria-label="Scroll to top"
        icon={<ChevronUpIcon />}
        position="fixed"
        bottom="20px"
        right="20px"
        bg={getColor("primary", colorMode)}
        color="white"
        _hover={{
          bg: getColor("primaryHover", colorMode),
          transform: "translateY(-2px)",
        }}
        onClick={scrollToTop}
        display={scrollProgress > 10 ? "flex" : "none"}
        zIndex="999"
      />

      <Container maxW="1400px" py={8}>
        {/* Header */}
        <VStack spacing={6} align="stretch" mb={8}>
          <Card
            bg={cardGradientBg}
            backdropFilter="blur(10px)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            border="1px"
            borderColor={cardBorder}
          >
            <CardHeader>
              <VStack align="start" spacing={4}>
                <HStack justify="space-between" w="100%">
                  <Heading size="xl" color={textPrimary}>
                    🔬 R&D Tax Incentive Documentation Guide
                  </Heading>
                  <HStack>
                    <Badge colorScheme="purple" fontSize="md" p={2}>
                      Version 2025
                    </Badge>
                    <Badge colorScheme="green" fontSize="md" p={2}>
                      Interactive
                    </Badge>
                  </HStack>
                </HStack>
                <Text color={textSecondary} fontSize="lg">
                  Comprehensive visual guide for R&DTI eligibility assessment and documentation requirements
                </Text>
              </VStack>
            </CardHeader>
          </Card>

          {/* Quick Stats */}
          <HStack spacing={4} wrap="wrap">
            <Card bg={cardGradientBg} border="1px" borderColor={cardBorder} flex="1">
              <CardBody>
                <VStack>
                  <Text fontSize="2xl" fontWeight="bold" color={getColor("primary", colorMode)}>
                    43.5%
                  </Text>
                  <Text fontSize="sm" color={textSecondary}>
                    Refundable Tax Offset
                  </Text>
                </VStack>
              </CardBody>
            </Card>
            <Card bg={cardGradientBg} border="1px" borderColor={cardBorder} flex="1">
              <CardBody>
                <VStack>
                  <Text fontSize="2xl" fontWeight="bold" color={getColor("secondary", colorMode)}>
                    38.5%
                  </Text>
                  <Text fontSize="sm" color={textSecondary}>
                    Non-Refundable Offset
                  </Text>
                </VStack>
              </CardBody>
            </Card>
            <Card bg={cardGradientBg} border="1px" borderColor={cardBorder} flex="1">
              <CardBody>
                <VStack>
                  <Text fontSize="2xl" fontWeight="bold" color="#FB923C">
                    Aug 15
                  </Text>
                  <Text fontSize="sm" color={textSecondary}>
                    2025 Changes
                  </Text>
                </VStack>
              </CardBody>
            </Card>
            <Card bg={cardGradientBg} border="1px" borderColor={cardBorder} flex="1">
              <CardBody>
                <VStack>
                  <Text fontSize="2xl" fontWeight="bold" color="#3B82F6">
                    10 mo
                  </Text>
                  <Text fontSize="sm" color={textSecondary}>
                    Registration Deadline
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </HStack>
        </VStack>

        {/* Information Sections */}
        <VStack spacing={4} mb={8}>
          {sections.map((section, index) => (
            <Card
              key={index}
              bg={cardGradientBg}
              border="1px"
              borderColor={cardBorder}
              cursor="pointer"
              onClick={() => toggleSection(index)}
              _hover={{ borderColor: textSecondary }}
            >
              <CardHeader>
                <HStack justify="space-between">
                  <Heading size="md" color={textPrimary}>
                    {section.title}
                  </Heading>
                  {expandedSections.includes(index) ? (
                    <ChevronUpIcon color={textSecondary} />
                  ) : (
                    <ChevronDownIcon color={textSecondary} />
                  )}
                </HStack>
              </CardHeader>
              {expandedSections.includes(index) && (
                <CardBody pt={0}>
                  <Text color={textSecondary}>{section.content}</Text>
                </CardBody>
              )}
            </Card>
          ))}
        </VStack>

        {/* Mermaid Charts */}
        <VStack spacing={8} align="stretch">
          <Heading size="lg" color={textPrimary} mb={4}>
            📊 Visual Assessment Flowcharts
          </Heading>
          
          {mermaidCharts.map((chart) => (
            <Card
              key={chart.id}
              bg={cardGradientBg}
              border="1px"
              borderColor={cardBorder}
              overflow="hidden"
            >
              <CardHeader borderBottom="1px" borderColor={cardBorder}>
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Heading size="md" color={textPrimary}>
                      {chart.title}
                    </Heading>
                    <Text fontSize="sm" color={textSecondary}>
                      {chart.description}
                    </Text>
                  </VStack>
                  <HStack>
                    <Tooltip label="Copy Mermaid code">
                      <IconButton
                        aria-label="Copy code"
                        icon={<CopyIcon />}
                        size="sm"
                        variant="ghost"
                        color={textSecondary}
                        onClick={() => copyChart(chart.chart)}
                      />
                    </Tooltip>
                  </HStack>
                </HStack>
              </CardHeader>
              <CardBody>
                <Box
                  bg="white"
                  p={4}
                  borderRadius="md"
                  overflow="auto"
                  maxH="600px"
                >
                  <MermaidChart code={chart.chart} id={chart.id} />
                </Box>
              </CardBody>
            </Card>
          ))}
        </VStack>

        {/* Key Requirements Table */}
        <Card
          bg={cardGradientBg}
          border="1px"
          borderColor={cardBorder}
          mt={8}
        >
          <CardHeader>
            <Heading size="md" color={textPrimary}>
              📋 Key Requirements Summary
            </Heading>
          </CardHeader>
          <CardBody>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th color={textSecondary}>Requirement</Th>
                    <Th color={textSecondary}>Core R&D</Th>
                    <Th color={textSecondary}>Supporting R&D</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td color={textPrimary}>Technical Uncertainty</Td>
                    <Td color={textPrimary}>✅ Required</Td>
                    <Td color={textPrimary}>❌ Not Required</Td>
                  </Tr>
                  <Tr>
                    <Td color={textPrimary}>Hypothesis</Td>
                    <Td color={textPrimary}>✅ Required</Td>
                    <Td color={textPrimary}>❌ Not Required</Td>
                  </Tr>
                  <Tr>
                    <Td color={textPrimary}>Systematic Experimentation</Td>
                    <Td color={textPrimary}>✅ Required</Td>
                    <Td color={textPrimary}>❌ Not Required</Td>
                  </Tr>
                  <Tr>
                    <Td color={textPrimary}>New Knowledge</Td>
                    <Td color={textPrimary}>✅ Required</Td>
                    <Td color={textPrimary}>❌ Not Required</Td>
                  </Tr>
                  <Tr>
                    <Td color={textPrimary}>Dominant Purpose Test</Td>
                    <Td color={textPrimary}>N/A</Td>
                    <Td color={textPrimary}>✅ Required</Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>

        {/* Excluded Activities Table */}
        <Card
          bg={cardGradientBg}
          border="1px"
          borderColor={cardBorder}
          mt={8}
        >
          <CardHeader>
            <Heading size="md" color={textPrimary}>
              🚫 Excluded Activities Reference
            </Heading>
          </CardHeader>
          <CardBody>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th color={textSecondary}>Category</Th>
                    <Th color={textSecondary}>Examples</Th>
                    <Th color={textSecondary}>Can be Supporting R&D?</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td color={textPrimary}>Market Activities</Td>
                    <Td color={textPrimary}>Market research, sales promotion, consumer surveys</Td>
                    <Td color={textPrimary}>Yes, if dominant purpose test met</Td>
                  </Tr>
                  <Tr>
                    <Td color={textPrimary}>Resource Exploration</Td>
                    <Td color={textPrimary}>Prospecting, drilling for minerals/petroleum</Td>
                    <Td color={textPrimary}>Yes, if dominant purpose test met</Td>
                  </Tr>
                  <Tr>
                    <Td color={textPrimary}>Management Studies</Td>
                    <Td color={textPrimary}>Efficiency surveys, time & motion studies</Td>
                    <Td color={textPrimary}>Yes, if directly related to Core R&D</Td>
                  </Tr>
                  <Tr>
                    <Td color={textPrimary}>Social Sciences</Td>
                    <Td color={textPrimary}>Arts, humanities, social sciences research</Td>
                    <Td color={textPrimary}>Yes, if directly related to Core R&D</Td>
                  </Tr>
                  <Tr>
                    <Td color={textPrimary}>Administrative</Td>
                    <Td color={textPrimary}>Commercial, legal, financial management</Td>
                    <Td color={textPrimary}>Yes, if directly related to Core R&D</Td>
                  </Tr>
                  <Tr>
                    <Td color={textPrimary}>Compliance</Td>
                    <Td color={textPrimary}>Regulatory compliance, standards, QA</Td>
                    <Td color={textPrimary}>Yes, if dominant purpose test met</Td>
                  </Tr>
                  <Tr>
                    <Td color={textPrimary}>Routine Work</Td>
                    <Td color={textPrimary}>Routine testing, data collection</Td>
                    <Td color={textPrimary}>Yes, if directly related to Core R&D</Td>
                  </Tr>
                  <Tr>
                    <Td color={textPrimary}>Internal Software</Td>
                    <Td color={textPrimary}>Admin systems, office automation</Td>
                    <Td color={textPrimary}>Yes, if dominant purpose test met</Td>
                  </Tr>
                  <Tr>
                    <Td color={textPrimary}>Cosmetic Changes</Td>
                    <Td color={textPrimary}>Stylistic modifications, branding</Td>
                    <Td color={textPrimary}>Yes, if dominant purpose test met</Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>

        {/* Common Scenarios Assessment */}
        <Card
          bg={cardGradientBg}
          border="1px"
          borderColor={cardBorder}
          mt={8}
        >
          <CardHeader>
            <Heading size="md" color={textPrimary}>
              💡 Common Scenarios Quick Assessment
            </Heading>
          </CardHeader>
          <CardBody>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th color={textSecondary}>Scenario</Th>
                    <Th color={textSecondary}>Likely Eligible?</Th>
                    <Th color={textSecondary}>Key Consideration</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td color={textPrimary}>Developing new algorithm for unprecedented problem</Td>
                    <Td color="#22C55E">✅ Yes</Td>
                    <Td color={textPrimary}>Must show current algorithms inadequate</Td>
                  </Tr>
                  <Tr>
                    <Td color={textPrimary}>Scaling lab process to production</Td>
                    <Td color="#FB923C">⚠️ Possibly</Td>
                    <Td color={textPrimary}>Must demonstrate scale-up uncertainties</Td>
                  </Tr>
                  <Tr>
                    <Td color={textPrimary}>Implementing known software in new environment</Td>
                    <Td color="#FB923C">⚠️ Maybe</Td>
                    <Td color={textPrimary}>Only if platform creates genuine constraints</Td>
                  </Tr>
                  <Tr>
                    <Td color={textPrimary}>Optimizing existing process</Td>
                    <Td color="#FB923C">⚠️ Maybe</Td>
                    <Td color={textPrimary}>Must exceed current industry knowledge</Td>
                  </Tr>
                  <Tr>
                    <Td color={textPrimary}>Routine product testing</Td>
                    <Td color="#EF4444">❌ No</Td>
                    <Td color={textPrimary}>Unless testing new hypotheses</Td>
                  </Tr>
                  <Tr>
                    <Td color={textPrimary}>Compliance with new regulations</Td>
                    <Td color="#EF4444">❌ No</Td>
                    <Td color={textPrimary}>Unless developing new methods</Td>
                  </Tr>
                  <Tr>
                    <Td color={textPrimary}>Bug fixing in software</Td>
                    <Td color="#EF4444">❌ No</Td>
                    <Td color={textPrimary}>Unless bugs reveal fundamental issues</Td>
                  </Tr>
                  <Tr>
                    <Td color={textPrimary}>Market research for new product</Td>
                    <Td color="#EF4444">❌ No</Td>
                    <Td color={textPrimary}>But can be Supporting if for R&D product</Td>
                  </Tr>
                  <Tr>
                    <Td color={textPrimary}>Training staff on new technology</Td>
                    <Td color="#EF4444">❌ No</Td>
                    <Td color={textPrimary}>Unless developing training methods</Td>
                  </Tr>
                  <Tr>
                    <Td color={textPrimary}>Purchasing R&D equipment</Td>
                    <Td color="#FB923C">⚠️ Maybe</Td>
                    <Td color={textPrimary}>Depreciation may be eligible</Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>

        {/* Alert for 2025 Changes */}
        <Alert
          status="warning"
          bg="rgba(251, 146, 60, 0.1)"
          borderColor="rgba(251, 146, 60, 0.3)"
          borderWidth="1px"
          mt={8}
        >
          <AlertIcon color="#FB923C" />
          <Box>
            <AlertTitle color={textPrimary}>Important: August 15, 2025 Changes</AlertTitle>
            <AlertDescription color={textSecondary}>
              All draft applications will be deleted when the new form launches. Gambling and tobacco industries will be excluded from July 1, 2025. 
              Ensure all registrations are submitted before the transition.
            </AlertDescription>
          </Box>
        </Alert>

        {/* Resources & References */}
        <Card
          bg={cardGradientBg}
          border="1px"
          borderColor={cardBorder}
          mt={8}
        >
          <CardHeader>
            <Heading size="md" color={textPrimary}>
              📚 Resources & References
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Box>
                <Heading size="sm" color={textPrimary} mb={2}>
                  Legislative Framework
                </Heading>
                <Text color={textSecondary}>
                  • Income Tax Assessment Act 1997 - Division 355<br />
                  • Industry Research and Development Act 1986<br />
                  • Income Tax Assessment Regulations 1997
                </Text>
              </Box>
              
              <Box>
                <Heading size="sm" color={textPrimary} mb={2}>
                  Official Guidance
                </Heading>
                <Text color={textSecondary}>
                  • AusIndustry R&DTI Portal<br />
                  • ATO R&D Tax Incentive Resources<br />
                  • Customer Portal: portal.business.gov.au<br />
                  • R&DTI Guide to Interpretation
                </Text>
              </Box>
              
              <Box>
                <Heading size="sm" color={textPrimary} mb={2}>
                  Key ATO Rulings
                </Heading>
                <Text color={textSecondary}>
                  • TR 2021/5 - Core R&D activities<br />
                  • TR 2021/6 - Supporting R&D activities<br />
                  • TR 2024/1 - Excluded activities<br />
                  • PCG 2021/3 - Software development activities
                </Text>
              </Box>
              
              <Box>
                <Heading size="sm" color={textPrimary} mb={2}>
                  Contact Information
                </Heading>
                <Text color={textSecondary}>
                  • AusIndustry Hotline: 13 28 46<br />
                  • ATO R&DTI Helpline: 1300 557 527<br />
                  • Email: rdti@industry.gov.au
                </Text>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Disclaimer */}
        <Alert
          status="info"
          bg="rgba(59, 130, 246, 0.1)"
          borderColor="rgba(59, 130, 246, 0.3)"
          borderWidth="1px"
          mt={8}
        >
          <AlertIcon color="#3B82F6" />
          <Box>
            <AlertTitle color={textPrimary}>Disclaimer</AlertTitle>
            <AlertDescription color={textSecondary}>
              This guide is for general information purposes only and does not constitute professional tax advice. 
              The R&D Tax Incentive is complex legislation that requires careful consideration of individual circumstances. 
              Always consult with registered tax agents for specific advice, obtain private rulings for uncertain interpretations, 
              and maintain comprehensive contemporaneous documentation.
            </AlertDescription>
          </Box>
        </Alert>
      </Container>

      <FooterWithFourColumns />
    </Box>
  );
};

export default RDTIDocsPage;