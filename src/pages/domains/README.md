# Domains Module

## Overview
Complete domain registration and DNS management system with support for multiple providers and cryptocurrency payments.

## Features
- 🔍 Domain search and availability checking
- 💳 Domain registration with card or crypto payments
- 🌐 DNS record management (A, CNAME, MX, TXT, etc.)
- 📧 Email configuration for domains
- 🔒 WHOIS privacy protection
- 🔄 Auto-renewal settings
- 🔐 Domain security (lock, DNSSEC, 2FA)
- 📊 Transfer management

## Setup Instructions

### 1. Backend Configuration
The backend domain resolver is already created at:
- `/business-builder-backend/src/entities/models/Domain.ts`
- `/business-builder-backend/src/resolvers/domain.resolver.ts`
- `/business-builder-backend/src/services/domain/resellerclub.service.ts`

### 2. Add API Keys to Tenant
Go to Admin → Edit Tenant and add:

**For Vercel (Recommended):**
```
VERCEL_API_TOKEN=your_token_here
VERCEL_TEAM_ID=optional_team_id
```

**For ResellerClub (Alternative):**
```
RESELLER_CLUB_USER_ID=your_user_id
RESELLER_CLUB_API_KEY=your_api_key
```

### 3. Environment Variables
Add to `.env` file:
```bash
# Vercel Integration
REACT_APP_VERCEL_TOKEN=your_vercel_token
REACT_APP_VERCEL_TEAM_ID=optional_team_id

# Crypto Payments (Optional)
REACT_APP_NOWPAYMENTS_API_KEY=your_api_key
REACT_APP_COINGATE_API_KEY=your_api_key
```

### 4. Access the Module
Navigate to: `http://localhost:3000/domains`

## File Structure
```
src/pages/domains/
├── index.tsx                 # Main domains page with search
├── DomainDetails.tsx         # Individual domain management
├── moduleConfig.ts           # Module configuration
├── DOMAINS_RESELLER_GUIDE.md # Reseller setup guide
└── README.md                 # This file
```

## API Integration

### Using Vercel API
```typescript
import { createVercelService } from '../../services/vercel.service';

const vercel = createVercelService(
  process.env.REACT_APP_VERCEL_TOKEN!,
  process.env.REACT_APP_VERCEL_TEAM_ID
);

// Check availability
const available = await vercel.checkAvailability('example.com');

// Purchase domain
const result = await vercel.purchaseDomain('example.com', 2);

// Manage DNS
const records = await vercel.getDNSRecords('example.com');
await vercel.createDNSRecord('example.com', {
  type: 'A',
  name: '@',
  value: '192.168.1.1',
  ttl: 3600
});
```

### Using GraphQL (Backend)
```graphql
# Search domains
query SearchDomains {
  searchDomains(input: {
    domainName: "mybusiness",
    tlds: ["com", "net", "org"]
  }) {
    domain
    available
    price
    currency
  }
}

# Register domain
mutation RegisterDomain {
  registerDomain(input: {
    domainName: "mybusiness.com",
    years: 2,
    clientId: "client-id",
    privacyProtection: true,
    paymentMethod: "crypto"
  }) {
    id
    domainName
    status
    expiryDate
  }
}

# Get my domains
query MyDomains {
  myDomains {
    id
    domainName
    status
    expiryDate
    autoRenew
  }
}
```

## Pricing Strategy

### Recommended Markup
| TLD | Your Cost | Customer Price | Profit |
|-----|-----------|---------------|---------|
| .com | $8.50 | $14.99 | $6.49 |
| .net | $10.00 | $16.99 | $6.99 |
| .org | $10.50 | $17.99 | $7.49 |
| .io | $32.00 | $49.99 | $17.99 |

### Bundle Packages
- **Basic**: Domain only - $14.99/year
- **Professional**: Domain + Privacy - $19.99/year
- **Business**: Domain + Privacy + Email - $29.99/year

## Crypto Payment Flow
1. User selects domain(s)
2. Chooses crypto payment
3. System generates payment address
4. User sends crypto
5. System monitors blockchain
6. On confirmation, registers domain
7. Sends email confirmation

## DNS Record Types

### Common Records
- **A**: IPv4 address (example.com → 192.168.1.1)
- **AAAA**: IPv6 address
- **CNAME**: Alias (www → example.com)
- **MX**: Mail server (priority + server)
- **TXT**: Text records (SPF, DKIM, verification)
- **NS**: Nameservers

### Email Setup
For Google Workspace:
```
MX Records:
- 1 ASPMX.L.GOOGLE.COM (priority 1)
- 5 ALT1.ASPMX.L.GOOGLE.COM (priority 5)
- 5 ALT2.ASPMX.L.GOOGLE.COM (priority 5)
- 10 ALT3.ASPMX.L.GOOGLE.COM (priority 10)
- 10 ALT4.ASPMX.L.GOOGLE.COM (priority 10)

SPF Record:
TXT @ "v=spf1 include:_spf.google.com ~all"
```

## Testing

### Test Mode
The system works without API keys by returning mock data:
- Random domain availability
- Sample pricing
- Demo DNS records

### With API Keys
Once configured, the system uses real APIs:
- Vercel for domain management
- ResellerClub for wholesale pricing
- Actual DNS propagation

## Support

### Provider Documentation
- **Vercel**: https://vercel.com/docs/rest-api/endpoints/domains
- **ResellerClub**: https://manage.resellerclub.com/kb/answer/744
- **Cloudflare**: https://api.cloudflare.com/

### Common Issues
1. **API Key Invalid**: Check tenant configuration
2. **Domain Unavailable**: Try different TLD
3. **DNS Not Propagating**: Wait 24-48 hours
4. **Payment Failed**: Check crypto transaction

## Future Enhancements
- [ ] Bulk domain search
- [ ] Domain auction integration
- [ ] Expired domain monitoring
- [ ] DNS template library
- [ ] Email hosting integration
- [ ] SSL certificate management
- [ ] Domain portfolio analytics
- [ ] Automated DNS health checks