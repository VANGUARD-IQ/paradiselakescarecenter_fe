# How to Use the Proposal Signing System

## Step 1: Create a Proposal in the Database

First, create the proposal using GraphQL (you'll do this in the admin panel soon):

```graphql
mutation CreateProposal {
  createProposal(input: {
    companyName: "One Group Australasia"
    slug: "onegroup"
    title: "Website Development & Managed IT Agreement"
    agreementMarkdown: "# SERVICE AGREEMENT\n\nYour markdown content here..."
    requiredSigners: [
      {
        clientId: "67abc123..."
        name: "Brian Thompson"
        email: "brian@onegroup.com.au"
        role: "Director"
      }
    ]
    projectId: "68de2194698570ca39e452e8"
    billId: "68de2a5e698570ca39e469c0"
  }) {
    id
    slug
    status
  }
}
```

## Step 2: Create Your Custom Proposal Page

Create a custom page at `/src/pages/proposals/onegroup/index.tsx`:

```tsx
import React from 'react';
import { Box, Container, Heading, VStack } from '@chakra-ui/react';
import { ProposalSigningSection } from '../../../components/proposals/ProposalSigningSection';
import { NavbarWithCallToAction } from '../../../components/chakra/NavbarWithCallToAction/NavbarWithCallToAction';
import { FooterWithFourColumns } from '../../../components/chakra/FooterWithFourColumns/FooterWithFourColumns';

const OneGroupProposal: React.FC = () => {
  return (
    <>
      <NavbarWithCallToAction />

      <Box minH="100vh" py={10}>
        <Container maxW="container.xl">
          <VStack spacing={12} align="stretch">

            {/* Your custom branded content */}
            <Heading size="2xl">One Group Australasia</Heading>

            {/* Custom pricing cards */}
            <YourPricingCards />

            {/* Custom features section */}
            <YourFeaturesSection />

            {/* DROP IN THE SIGNING COMPONENT */}
            <ProposalSigningSection
              proposalSlug="onegroup"
              onSigningComplete={() => {
                console.log('Signed!');
                // Optional: redirect, show confetti, etc.
              }}
            />

          </VStack>
        </Container>
      </Box>

      <FooterWithFourColumns />
    </>
  );
};

export default OneGroupProposal;
```

## That's It!

The `ProposalSigningSection` component handles everything:

✅ Fetches proposal data from database by slug
✅ Shows existing signatures
✅ Renders agreement markdown with toggle
✅ Signature canvas
✅ Saves to database
✅ Updates proposal status
✅ Generates PDF with all signatures
✅ Shows signature audit log

## Features

### Multi-Signer Support
Multiple people can sign the same proposal. Each signature is tracked separately.

### Real-time Updates
After someone signs, the component refetches and shows updated signature list.

### Status Tracking
- DRAFT → SENT → PARTIALLY_SIGNED → FULLY_SIGNED
- Shows badge with current status

### PDF Generation
Once fully signed, download button appears with PDF containing:
- All signatures
- Signature audit log with timestamps and IP addresses
- Agreement summary

### Customization
You can customize the component by passing props:
- `proposalSlug`: The unique identifier (URL slug)
- `onSigningComplete`: Callback function after successful signing

## Admin Panel Coming Soon

The admin panel will allow you to:
- Create new proposals
- Select clients who need to sign
- View all proposals and their status
- See signature history
- Resend proposal links

## Database Models

**Proposal:**
- Company name, title, agreement MD
- Required signers (with client IDs)
- Status tracking
- Links to project/bill

**ProposalSignature:**
- Links to Proposal and Client
- Signature image (base64)
- Timestamp, IP address
- Signer name, email, role
