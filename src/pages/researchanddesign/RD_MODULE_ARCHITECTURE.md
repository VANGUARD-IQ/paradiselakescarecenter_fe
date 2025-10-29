# Research & Development Tax Incentive Module Architecture

## Module Overview

The R&D module helps businesses track, document, and report on their Research & Development activities to maximize R&D Tax Incentive claims. This module goes beyond simple time tracking to provide comprehensive project documentation, evidence collection, and compliance checking.

### Core Goals
1. **Project Registration**: Easily register potential R&D projects with flexible, optional fields
2. **Stage Management**: Track projects through eligibility, documentation, and submission stages
3. **Evidence Collection**: Capture screenshots, documents, emails, and chat logs with timestamps
4. **Time Tracking**: Track time spent on R&D activities with automatic event creation
5. **Compliance**: Ensure all documentation meets ATO requirements
6. **Reporting**: Generate comprehensive reports for R&D tax submissions

## Data Models (Backend)

### 1. RDProject (extends BaseEntity)
```typescript
@ObjectType()
export class RDProject extends BaseEntity {
  @Field({ nullable: true })
  projectName?: string;

  @Field({ nullable: true })
  projectCode?: string;  // Internal reference

  @Field(() => String, { nullable: true })
  status?: 'potential' | 'eligible' | 'in-progress' | 'documenting' | 'submitted' | 'approved' | 'rejected';

  @Field(() => String, { nullable: true })
  projectType?: 'core' | 'supporting' | 'undetermined';

  // Technical Details (all optional)
  @Field({ nullable: true })
  technicalObjective?: string;

  @Field({ nullable: true })
  hypothesis?: string;

  @Field({ nullable: true })
  variables?: string;  // JSON array of variables being tested

  @Field({ nullable: true })
  successCriteria?: string;

  @Field({ nullable: true })
  technicalUncertainty?: string;

  @Field({ nullable: true })
  industryKnowledge?: string;

  @Field({ nullable: true })
  knowledgeLimitations?: string;

  // Dates
  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field({ nullable: true })
  financialYear?: string;  // e.g., "2023-24"

  // Relationships
  @Field(() => [RDActivity], { nullable: true })
  activities?: RDActivity[];

  @Field(() => [RDEvidence], { nullable: true })
  evidence?: RDEvidence[];

  @Field(() => [RDTimeEntry], { nullable: true })
  timeEntries?: RDTimeEntry[];

  @Field({ nullable: true })
  totalHours?: number;  // Calculated field

  @Field({ nullable: true })
  estimatedValue?: number;  // Estimated R&D claim value
}
```

### 2. RDActivity
```typescript
@ObjectType()
export class RDActivity extends BaseEntity {
  @Field()
  rdProjectId: string;

  @Field({ nullable: true })
  activityName?: string;

  @Field(() => String, { nullable: true })
  activityType?: 'core' | 'supporting';

  @Field(() => String, { nullable: true })
  documentationStage?: 'preliminary' | 'hypothesis_design' | 'experiments_trials' | 'analysis' | 'outcome';

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  methodology?: string;

  // Core Activity Specific Fields
  @Field({ nullable: true })
  hypothesis?: string;

  @Field({ nullable: true })
  proposedDesign?: string;

  @Field({ nullable: true })
  variablesTested?: string; // JSON array

  @Field({ nullable: true })
  successCriteria?: string;

  @Field({ nullable: true })
  trialObjective?: string;

  @Field({ nullable: true })
  trialLocation?: string;

  @Field({ nullable: true })
  trialScope?: string;

  @Field({ nullable: true })
  initialObservations?: string;

  @Field({ nullable: true })
  quantitativeOutcomes?: string;

  @Field({ nullable: true })
  challenges?: string;

  @Field({ nullable: true })
  solutions?: string;

  @Field({ nullable: true })
  outcomes?: string;

  @Field({ nullable: true })
  learnings?: string;

  @Field({ nullable: true })
  milestones?: string; // JSON array

  // For supporting activities
  @Field({ nullable: true })
  linkedCoreActivityId?: string;

  @Field({ nullable: true })
  linkageDescription?: string;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field(() => [RDTimeEntry], { nullable: true })
  timeEntries?: RDTimeEntry[];

  @Field(() => [RDEvidence], { nullable: true })
  evidence?: RDEvidence[];
}
```

### 3. RDEvidence
```typescript
@ObjectType()
export class RDEvidence extends BaseEntity {
  @Field()
  rdProjectId: string;

  @Field({ nullable: true })
  rdActivityId?: string;

  @Field(() => String)
  evidenceType: 'screenshot' | 'document' | 'email' | 'chat' | 'photo' | 'code' | 'other';

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  fileUrl?: string;  // IPFS or storage URL

  @Field({ nullable: true })
  content?: string;  // For text-based evidence

  @Field()
  captureDate: Date;

  @Field({ nullable: true })
  source?: string;  // e.g., "Slack", "Email", "Teams"

  @Field({ nullable: true })
  participants?: string;  // JSON array of participants

  @Field({ nullable: true })
  metadata?: string;  // JSON metadata
}
```

### 4. RDTimeEntry
```typescript
@ObjectType()
export class RDTimeEntry extends BaseEntity {
  @Field()
  rdProjectId: string;

  @Field({ nullable: true })
  rdActivityId?: string;

  @Field()
  userId: string;

  @Field()
  date: Date;

  @Field()
  hours: number;

  @Field({ nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  timeType?: 'research' | 'development' | 'testing' | 'documentation' | 'meeting' | 'other';

  @Field({ nullable: true })
  isUnallocated?: boolean;  // For time that needs later allocation

  @Field({ nullable: true })
  reviewedBy?: string;

  @Field({ nullable: true })
  reviewedAt?: Date;

  @Field(() => String, { nullable: true })
  status?: 'draft' | 'submitted' | 'reviewed' | 'approved';
}
```

### 5. RDCommunicationLog
```typescript
@ObjectType()
export class RDCommunicationLog extends BaseEntity {
  @Field()
  rdProjectId: string;

  @Field(() => String)
  communicationType: 'email' | 'chat' | 'meeting' | 'call' | 'other';

  @Field()
  date: Date;

  @Field({ nullable: true })
  subject?: string;

  @Field({ nullable: true })
  content?: string;

  @Field({ nullable: true })
  participants?: string;  // JSON array

  @Field({ nullable: true })
  duration?: number;  // In minutes

  @Field({ nullable: true })
  attachments?: string;  // JSON array of attachment URLs

  @Field()
  autoCreatedTimeEntry: boolean;  // If true, created a time entry

  @Field({ nullable: true })
  timeEntryId?: string;
}
```

## 5-Stage Documentation Flow

The R&D documentation follows a systematic 5-stage process as per ATO requirements:

### Stage 1: Preliminary Activities
**Purpose**: Substantiate authorization, innovation and/or new knowledge being sought
- Industry research and articles
- Expert consultations
- Feasibility studies
- Project proposals
- Meeting minutes

### Stage 2: Hypothesis/Design Activities  
**Purpose**: Substantiate a systematic/scientific process
- Hypothesis formulation
- Design proposals
- Engineering plans
- Trial designs
- Scoping documents

### Stage 3: Experiments/Trials
**Purpose**: Substantiate experimentation occurred
- Trial records with date, location, objectives
- Variables tested
- Initial observations
- Photos/videos of prototypes
- Experiment logs

### Stage 4: Analysis
**Purpose**: Substantiate logical conclusions
- Quantitative outcomes
- Graphs and trend analysis
- Trial reports
- Production records
- Data analysis

### Stage 5: Project Outcome
**Purpose**: Document success or failure
- Final results
- Milestones achieved
- Technical learnings
- IP/Patent applications
- Project summaries

## Frontend Pages Structure

### 1. Dashboard (`/researchanddesign`)
- Overview of all R&D projects
- Quick stats: Total hours, Projects by status, Upcoming deadlines
- Quick actions: New project, Log time, Upload evidence
- **Gap Analysis Widget**: Shows missing documentation by stage

### 2. Project List (`/researchanddesign/projects`)
- Filterable/sortable list of R&D projects
- Status indicators and progress bars
- Bulk actions: Export, Archive

### 3. Project Wizard (`/researchanddesign/projects/new`)
- Step 1: Basic Details (all optional)
- Step 2: Eligibility Check (flowchart-based)
- Step 3: Technical Objectives
- Step 4: Initial Activities
- Save as draft at any point

### 4. Project Detail (`/researchanddesign/projects/:id`)
- Tab-based interface:
  - Overview: Project summary and status
  - Activities: Core and supporting activities
  - Evidence: All documentation and files
  - Time Tracking: Hours logged
  - Communications: Email/chat logs
  - Compliance: Checklist and warnings
  - Reports: Generate submission documents

### 5. Activity Management (`/researchanddesign/activities`)
- Create/edit activities
- Link supporting to core activities
- Track methodology and outcomes

### 6. Time Tracking (`/researchanddesign/timesheet`)
- Multiple views: Daily, Weekly, Monthly
- Quick entry for unallocated time
- Bulk retrospective entry
- Integration with communication logs

### 7. Evidence Upload (`/researchanddesign/evidence`)
- Drag-and-drop interface
- Email/chat import wizard
- Screenshot capture tool
- Automatic metadata extraction

### 8. Communication Import (`/researchanddesign/communications`)
- Email import (via forwarding or API)
- Chat export upload (Slack, Teams)
- Automatic time entry creation
- Participant extraction

### 9. Compliance Check (`/researchanddesign/compliance`)
- Project-by-project compliance status
- Missing documentation alerts
- ATO requirement checklist
- Pre-submission validation

### 10. Reports (`/researchanddesign/reports`)
- Generate PID documents
- Export timesheets
- Create submission packages
- Financial year summaries

### 11. Gap Analysis Dashboard (`/researchanddesign/gaps`)
- **Project Overview**: Visual progress through 5 stages
- **Missing Documentation Alerts**:
  - By stage (Preliminary, Hypothesis, Trials, Analysis, Outcome)
  - By activity type (Core vs Supporting)
  - By evidence type (missing screenshots, trial records, etc.)
- **Compliance Score**: Real-time scoring based on completeness
- **Quick Actions**: Direct links to fill gaps
- **Export Gap Report**: For consultants/advisors

## Core vs Supporting Activities Structure

### Core Activities
Core activities are experimental activities that directly address technical uncertainty:
- Must have a clear hypothesis
- Involve systematic experimentation
- Test specific variables
- Generate new technical knowledge
- Progress through all 5 documentation stages

**Required Documentation**:
- Hypothesis and proposed design
- Variables being tested
- Trial objectives and methodology
- Quantitative outcomes
- Technical learnings

### Supporting Activities  
Supporting activities directly support core R&D but don't address uncertainty themselves:
- MUST be linked to at least one core activity
- Cannot exist independently
- Examples: data collection, routine testing, project management specific to R&D

**Required Documentation**:
- Clear linkage to core activity
- Description of support provided
- Time and resources used
- Evidence of direct support

## Key Features to Outperform Synnch

### 1. **Flexible Data Entry**
- All fields optional - start capturing immediately
- Progressive disclosure - add detail as needed
- Auto-save drafts
- Bulk import capabilities

### 2. **Smart Communication Integration**
- Email forwarding creates automatic logs
- Chat export parsing (Slack, Teams, etc.)
- Automatic time entry creation from communications
- AI-assisted content extraction

### 3. **Evidence Management**
- Direct screenshot capture
- Mobile app for photo evidence
- Version control for documents
- Automatic IPFS storage

### 4. **Intelligent Time Tracking**
- Suggest time entries from calendar
- Auto-create from communications
- Unallocated time buckets
- Smart allocation suggestions

### 5. **Compliance Automation**
- Real-time compliance scoring
- Missing documentation alerts
- Pre-submission validation
- ATO requirement mapping

### 6. **Advanced Reporting**
- One-click PID generation
- Custom report templates
- Multi-project summaries
- Export to accountant formats

## Implementation Phases

### Phase 1: Core Foundation
1. Basic project registration
2. Simple time tracking
3. Document upload

### Phase 2: Communication Integration
1. Email import
2. Chat log parsing
3. Automatic time entries

### Phase 3: Compliance & Reporting
1. Compliance checking
2. Report generation
3. Submission packages

### Phase 4: Advanced Features
1. AI-assisted documentation
2. Mobile app
3. Accountant portal
4. API integrations

## Module Configuration

```typescript
// In moduleRegistry.ts
'research-and-development': {
  name: 'Research & Development',
  description: 'Track and document R&D activities for tax incentives',
  version: '1.0.0',
  requiredSubscriptionTier: 'PREMIUM',
  entities: ['RDProject', 'RDActivity', 'RDEvidence', 'RDTimeEntry', 'RDCommunicationLog'],
  features: [
    'R&D project registration and tracking',
    'Activity documentation with methodology',
    'Evidence and screenshot management',
    'Time tracking with multiple views',
    'Communication log integration',
    'Compliance checking',
    'Automated report generation'
  ]
}
```

## API Endpoints Needed

### Queries
- `getRDProjects` - List all projects with filters
- `getRDProject` - Single project with all relations
- `getRDActivities` - Activities with optional project filter
- `getRDTimeEntries` - Time entries with date range
- `getRDCompliance` - Compliance status for project

### Mutations
- `createRDProject` - With optional fields
- `updateRDProject` - Partial updates
- `createRDActivity` - Link to project
- `logRDTime` - Single or bulk entries
- `uploadRDEvidence` - With auto-classification
- `importCommunications` - Parse and create logs
- `generateRDReport` - Create submission documents

## Security & Permissions

- Project-level permissions (view/edit/approve)
- Time entry review workflow
- Evidence access control
- Report generation audit trail

## Integration Points

1. **Existing Modules**
   - Projects: Extend for R&D tracking
   - Clients: Link R&D to client projects
   - Bills: Track R&D expenses
   - Tasks: Convert to R&D activities

2. **External Services**
   - Email providers for import
   - Chat platforms (Slack, Teams)
   - Accounting software
   - ATO systems (future)

## Success Metrics

1. Time saved vs manual tracking
2. Compliance score improvements
3. R&D claim value increases
4. User adoption rates
5. Evidence collection completeness

---

## CRITICAL DEVELOPMENT PATTERNS - FOLLOW FOR ALL FUTURE MODULES

### 🚨 Date Handling Standard
**ALWAYS follow the Session.ts model pattern for date handling to avoid GraphQL validation errors:**

#### Backend Models
```typescript
// ✅ CORRECT - Use Date type in both entity and input
@ObjectType()
export class YourEntity extends BaseEntity {
  @Field({ nullable: true })
  startDate?: Date;  // Use Date, not string
}

@InputType()
export class YourEntityInput {
  @Field({ nullable: true })
  startDate?: Date;  // Use Date, not string - TypeGraphQL handles conversion
}
```

#### Frontend Input Handling
```typescript
// ✅ CORRECT - Convert strings to Date objects before sending to GraphQL
const input = {
  startDate: formData.startDate ? new Date(formData.startDate) : undefined,
  endDate: formData.endDate ? new Date(formData.endDate) : undefined,
};
```

#### Resolver Implementation
```typescript
// ✅ CORRECT - No manual date conversion needed
@Mutation(() => YourEntity)
async createEntity(@Arg('input') input: YourEntityInput): Promise<YourEntity> {
  const entity = new YourEntityModel({
    ...input,  // TypeGraphQL automatically converts dates
    tenantId
  });
  return entity.save();
}
```

### 🚨 Enum Validation Standard
**ALWAYS define enum constraints in BOTH entity and input types:**

```typescript
// ✅ CORRECT - Define enums consistently
@ObjectType()
export class YourEntity extends BaseEntity {
  @Field(() => String, { nullable: true })
  @prop({ enum: ['status1', 'status2', 'status3'] })
  status?: 'status1' | 'status2' | 'status3';
}

@InputType()
export class YourEntityInput {
  @Field(() => String, { nullable: true })  // Use explicit String type
  status?: 'status1' | 'status2' | 'status3';  // Match exact enum values
}
```

### 🚨 Progressive Saving Pattern
**Implement progressive saving in multi-step wizards:**

1. **Save on first step completion** (when minimum required data is available)
2. **Update on subsequent steps** using the same mutation with entity ID
3. **Provide visual feedback** when project is saved
4. **Handle both create and update** in a single save function

```typescript
const saveOrUpdateEntity = async () => {
  if (entityId) {
    await updateEntity({ variables: { id: entityId, input } });
  } else {
    const { data } = await createEntity({ variables: { input } });
    setEntityId(data.createEntity.id);
  }
};
```

### 🚨 Reference Implementation
**Use these files as the definitive reference for new modules:**
- **Date Handling**: `/src/entities/models/Session.ts` and `/src/resolvers/session.resolver.ts`
- **Enum Validation**: `/src/entities/models/ResearchAndDesign.ts` (after fixes)
- **Progressive Saving**: `/src/pages/researchanddesign/new.tsx`

### 🚨 Debugging GraphQL Errors
When encountering "Argument Validation Error":
1. Check enum values match exactly between entity and input
2. Verify date fields use Date type, not string
3. Add console.log to resolver to see actual input values
4. Test with GraphQL Playground first

**Following these patterns will save hours of debugging time on future modules.**