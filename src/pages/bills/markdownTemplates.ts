/**
 * Centralized markdown templates for import/export functionality
 * Single source of truth for FORMAT_SPEC.md and bill/project templates
 */

export const FORMAT_SPEC_CONTENT = `# Unified Markdown Format Specification

**Version:** 1.0
**Last Updated:** January 2025

This document defines the unified markdown format for importing/exporting projects, bills, and proposals.

---

## 📝 Format Overview

The unified format combines:
- Project metadata (name, goal, description)
- Bill metadata (currency, payment method, status)
- Line items / Tasks (description, price, status, assignee)
- Agreement text (optional)

This allows editing proposals in Claude and importing them into the system.

---

## 📋 Complete Example

\`\`\`markdown
# One Group Website Development Proposal

## Project Information
**Project Name:** One Group Website Development
**Project Goal:** Build unified digital platform for Solar, Finance & Property Investment
**Project Description:** Complete 80-page unified platform representing all three One Group verticals with custom calculators, CRM integration, and SEO optimization.

## Bill Information
**Currency:** AUD
**Payment Method:** AUD_TRANSFER
**Status:** PROPOSAL

## Line Items

### 1. Content Page: onegroupaustralasia.com.au/
**Price:** $100.00
**Billable:** Yes
**Status:** PENDING
**Assignee:** tom@tommillerservices.com

### 2. Content Page: onegroupaustralasia.com.au/about
**Price:** $100.00
**Billable:** Yes
**Status:** PENDING
**Assignee:** Unassigned

### 3. Custom Logic: onegroupaustralasia.com.au/solar/calculator
**Price:** $300.00
**Billable:** Yes
**Status:** IN_PROGRESS
**Assignee:** jane@tommillerservices.com

### 4. Project management and coordination
**Price:** $0.00
**Billable:** No
**Status:** PENDING
**Assignee:** tom@tommillerservices.com

### 5. Internal testing and QA
**Price:** [ENTER PRICE]
**Billable:** Yes
**Status:** PENDING
**Assignee:** Unassigned

## Agreement

[Full agreement text goes here...]

**Between:** Tom Miller Services Pty Ltd ("TMS")
**And:** One Group ("Client")

[Rest of agreement...]
\`\`\`

---

## 🔍 Field Specifications

### Project Information Section

| Field | Required | Format | Example |
|-------|----------|--------|---------|
| Project Name | Yes | Plain text | \`One Group Website Development\` |
| Project Goal | No | Max 17 words | \`Build unified digital platform for Solar, Finance & Property\` |
| Project Description | No | Max 200 words | \`Complete 80-page unified platform...\` |

**Notes:**
- Project Goal is used for taglines (keep concise)
- Project Description provides context for the work

---

### Bill Information Section

| Field | Required | Format | Options |
|-------|----------|--------|---------|
| Currency | Yes | Uppercase code | \`AUD\`, \`USD\` |
| Payment Method | No | Enum value | \`AUD_TRANSFER\`, \`CARD\`, \`CRYPTO\` |
| Status | No | Enum value | \`PROPOSAL\`, \`DRAFT\`, \`SENT\` |

**Notes:**
- Currency affects how prices are parsed
- If Payment Method is omitted, defaults to \`AUD_TRANSFER\`
- If Status is omitted, defaults to \`PROPOSAL\`

---

### Line Items Section

Each line item uses this format:

\`\`\`markdown
### [Number]. [Description]
**Price:** [Amount]
**Billable:** [Yes/No]
**Status:** [Status]
**Assignee:** [Email or "Unassigned"]
\`\`\`

#### Field Details:

| Field | Required | Format | Options/Rules |
|-------|----------|--------|---------------|
| Number | No | Integer | Sequential numbering (1, 2, 3...) |
| Description | Yes | Plain text | Task/line item description |
| Price | Yes | Number with currency symbol | \`$100.00\`, \`[ENTER PRICE]\` (placeholder) |
| Billable | No | Yes/No | Defaults to \`Yes\` if omitted |
| Status | No | Enum | \`PENDING\`, \`IN_PROGRESS\`, \`COMPLETED\` (defaults to \`PENDING\`) |
| Assignee | No | Email or "Unassigned" | Must be valid email or literal "Unassigned" |

**Price Format Rules:**
- With symbol: \`$100.00\`, \`$100\`, \`$99.50\`
- Without symbol: \`100.00\`, \`100\`, \`99.50\`
- Placeholder: \`[ENTER PRICE]\` ← **Fails import** (must add price before importing)
- Zero price: \`$0.00\` ← Creates non-billable line item

**Assignee Rules:**
- Valid email: \`tom@tommillerservices.com\` ← Looks up user and assigns
- Invalid email: Creates unassigned task and shows warning
- "Unassigned": Creates unassigned task
- Omitted: Creates unassigned task

---

## 🔄 Import/Export Behavior

### Export (Project → Markdown)

When exporting a project to markdown:
1. **Project Info:** Populated from project.projectName, projectGoal, projectDescription
2. **Bill Info:** Uses default values (Currency from tenant, Status = PROPOSAL)
3. **Line Items:**
   - Description from task.description
   - Price = \`[ENTER PRICE]\` for billable tasks, \`$0.00\` for non-billable
   - Billable from task.billable (defaults to Yes)
   - Status from task.status
   - Assignee from task.assignedTo.email (or "Unassigned")
4. **Agreement:** Not included in export (add manually if needed)

### Import (Markdown → Bill)

When importing markdown to a bill:
1. **Project Info:** Ignored (bill already linked to project)
2. **Bill Info:** Updates bill.currency if specified
3. **Line Items:**
   - **Replaces all existing line items** (with confirmation modal)
   - Creates new line items from each \`### [Number]. [Description]\` section
   - Parses price and converts to cents for Stripe
   - Sets billable flag based on price ($0 = non-billable)
   - Assignee is stored but not enforced (bills don't have task assignments)
4. **Agreement:** Ignored during bill import

---

## ✅ Validation Rules

### During Export
- [ ] At least 1 task exists in project
- [ ] Task descriptions are not empty
- [ ] All billable tasks marked with price placeholder

### During Import to Bill
- [ ] Valid markdown structure
- [ ] At least 1 line item found
- [ ] All line items have valid prices (no \`[ENTER PRICE]\` placeholders)
- [ ] All prices are positive numbers or zero
- [ ] Currency code is valid (AUD or USD)
- [ ] Status enum is valid (if provided)

---

## 🚫 Common Parse Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "No line items found" | Missing \`## Line Items\` section | Add section header |
| "Invalid price format" | Price has \`[ENTER PRICE]\` | Replace with actual dollar amount |
| "Currency not supported" | Invalid currency code | Use \`AUD\` or \`USD\` |
| "Line item missing description" | Empty description after number | Add description text |
| "Negative price not allowed" | Price is negative | Use positive number or $0.00 |

---

## 🎨 Formatting Tips for Claude Editing

### Adding New Line Items
\`\`\`markdown
### 81. New feature: User authentication module
**Price:** $500.00
**Billable:** Yes
**Status:** PENDING
**Assignee:** tom@tommillerservices.com
\`\`\`

### Bulk Price Adjustments
Ask Claude: "Increase all Content Page items by 20%"
Claude will update:
- \`**Price:** $100.00\` → \`**Price:** $120.00\`

### Reassigning Tasks
Ask Claude: "Assign all calculator tasks to jane@tommillerservices.com"
Claude will update:
- \`**Assignee:** Unassigned\` → \`**Assignee:** jane@tommillerservices.com\`

### Marking Tasks Complete
Ask Claude: "Mark tasks 1-10 as completed"
Claude will update:
- \`**Status:** PENDING\` → \`**Status:** COMPLETED\`

---

**Version History:**
- v1.0 (Jan 2025) - Initial specification
`;

export const BILL_TEMPLATE_CONTENT = `# Bill Line Items Template

## Project Information
**Project Name:** [Enter project name]
**Project Goal:** [Enter project goal - max 17 words]
**Project Description:** [Enter project description - max 200 words]

## Bill Information
**Currency:** AUD
**Payment Method:** AUD_TRANSFER
**Status:** PROPOSAL

## Line Items

### 1. [Task description]
**Price:** $100.00
**Billable:** Yes
**Status:** PENDING
**Assignee:** email@example.com

### 2. [Another task description]
**Price:** $200.00
**Billable:** Yes
**Status:** PENDING
**Assignee:** Unassigned

### 3. [Add more line items as needed]
**Price:** $150.00
**Billable:** Yes
**Status:** PENDING
**Assignee:** Unassigned

## Agreement

[Add your agreement text here, or leave this section empty]
`;

/**
 * Download a markdown file with the given content
 */
export const downloadMarkdownFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
