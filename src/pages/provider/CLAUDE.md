# Provider Module Integration Guide

This guide explains how to integrate the Provider module into a tenant site.

## Overview

The Provider module allows users to create professional profile pages showcasing their services, experience, and achievements. It also includes a discovery feature to find other professionals across tenants. This module is designed to be easily integrated into tenant sites.

## Module Structure

```
src/pages/provider/
├── CLAUDE.md               # This file - integration instructions
├── EditProvider.tsx        # Provider profile editing component
├── ProviderView.tsx        # Provider profile viewing component  
├── DiscoverProviders.tsx   # Provider discovery and search component
└── moduleConfig.ts         # Module configuration and navigation
```

## Integration Steps

### 1. Add Provider Module to App.tsx

Add the provider imports and routes to your main App.tsx file:

```typescript
// Provider Profile imports
import ProviderView from "./pages/provider/ProviderView";
import EditProvider from "./pages/provider/EditProvider";
import DiscoverProviders from "./pages/provider/DiscoverProviders";

// Add these routes in your Routes component:
{/* Provider Profile routes */}
<Route path="/provider/:urlSlug" element={<ProviderView />} />             {/* PUBLIC: View provider profile by URL slug */}
<Route path="/provider" element={<ProviderView />} />                      {/* USER: View your provider profile */}
<Route path="/provider/edit" element={<EditProvider />} />                 {/* USER: Edit provider profile */}
<Route path="/providers/discover" element={<DiscoverProviders />} />       {/* PUBLIC: Discover and search provider profiles */}
```

### 2. Register Module in Navigation System

#### Add to useModules.ts fallback list:
```typescript
return ["clients", "sessions", "products", "projects", "bills", "subscriptions", "provider", "admin"];
```

#### Add to NavbarWithCallToAction.tsx:
```typescript
// Import the module config
import providerModuleConfig from "../../../pages/provider/moduleConfig";

// Add to allModuleConfigs array
const allModuleConfigs = [
  profileModuleConfig,
  clientsModuleConfig,
  sessionsModuleConfig,
  productsModuleConfig,
  projectsModuleConfig,
  billsModuleConfig,
  subscriptionModuleConfig,
  providerModuleConfig,  // Add this line
  adminModuleConfig,
];
```

### 3. Backend Integration

#### Add Provider Module to Module Registry:
```typescript
// In src/utils/moduleRegistry.ts
provider: {
  id: 'provider',
  name: 'Provider Profile',
  description: 'Professional profile pages showcasing services, experience, and achievements',
  icon: '🎯',
  version: '1.0.0',
  requiredTier: 'BASIC'
},
```

#### Register Provider Resolver:
```typescript
// In src/server.ts
import { ProviderResolver } from "./resolvers/provider.resolver";
import { Provider } from "./entities/models/Provider";

// Add to resolvers array:
resolvers: [
  // ... other resolvers
  ProviderResolver
],

// Add to orphanedTypes array:
orphanedTypes: [
  // ... other types
  Provider
],
```

#### Ensure Provider Resolver Has Discovery Query:
The backend resolver should include the `discoverProviders` query with these parameters:
- `searchQuery?: string` - Search term for title, tagline, description
- `limit?: number` - Maximum results to return (default 50, max 100)
- `scopeToTenant?: boolean` - If true, filter to current tenant only

```typescript
@Query(() => [Provider])
async discoverProviders(
    @Arg("searchQuery", () => String, { nullable: true }) searchQuery?: string,
    @Arg("limit", () => Number, { nullable: true }) limit?: number,
    @Arg("scopeToTenant", () => Boolean, { nullable: true }) scopeToTenant?: boolean,
    @Ctx() context?: Context
): Promise<Provider[]>
```

### 4. Required Backend Files

Ensure these backend files exist:
- `src/entities/models/Provider.ts` - Provider model and types
- `src/resolvers/provider.resolver.ts` - GraphQL resolver for provider operations

### 5. Available Routes

Once integrated, the following routes will be available:

- **`/provider`** - View your own provider profile (requires authentication)
- **`/provider/edit`** - Edit your provider profile (requires authentication)
- **`/provider/:urlSlug`** - Public view of any provider profile by URL slug
- **`/providers/discover`** - Discover and search provider profiles (public access)

### 6. Module Features

The Provider module includes:

- **Profile Creation**: Create a professional profile with personal information
- **Role Management**: Add multiple roles and organizations
- **Experience Tracking**: Document work experience and achievements
- **Education History**: List educational background
- **Skills Assessment**: Rate skills with proficiency levels
- **Portfolio Integration**: Link to external portfolios
- **Public/Private Profiles**: Control visibility of profiles
- **URL Slug Support**: Custom URLs for public profiles
- **Media Upload**: Profile photos and hero images
- **Contact Information**: Multiple contact methods
- **Testimonials**: Client testimonials and reviews
- **Availability Settings**: Schedule and timezone information
- **Provider Discovery**: Search and filter providers across tenants or within your organization
- **Mobile Responsive**: Fully responsive design for all screen sizes
- **Tenant Scoping**: Default to searching within your organization when authenticated

### 7. Permissions

The Provider module requires:
- **Minimum Tier**: BASIC subscription
- **Permissions**: USER, ADMIN, or MANAGER roles
- **Authentication**: Required for profile creation and editing

### 8. GraphQL Operations

The module provides these GraphQL operations:
- `myProvider` - Get current user's provider profile
- `providers` - List all provider profiles (tenant-scoped)
- `publicProviders` - List public provider profiles
- `publicProviderBySlug` - Get public provider by URL slug
- `discoverProviders` - Search and discover providers with optional tenant scoping
- `createProvider` - Create new provider profile
- `updateProvider` - Update provider profile
- `deleteProvider` - Delete provider profile

#### Discovery Query Parameters:
```graphql
query DiscoverProviders($searchQuery: String, $limit: Float, $scopeToTenant: Boolean) {
  discoverProviders(searchQuery: $searchQuery, limit: $limit, scopeToTenant: $scopeToTenant) {
    id
    title
    tagline
    description
    avatar
    expertise
    client { fName lName }
    contactInfo { email website }
  }
}
```

### 9. Customization

To customize the provider module:

1. **Styling**: Modify the Chakra UI components in the .tsx files
2. **Fields**: Add/remove fields in the Provider model and forms
3. **Navigation**: Update moduleConfig.ts for custom menu items
4. **Permissions**: Adjust permissions in moduleConfig.ts
5. **Branding**: Use the tenant's brand configuration for colors and styling

### 10. Testing

After integration, test these features:
- [ ] Provider profile creation
- [ ] Profile editing and saving
- [ ] Public profile viewing
- [ ] URL slug functionality
- [ ] Provider discovery page loads
- [ ] Search functionality works
- [ ] Tenant scoping toggle works
- [ ] Professional title displays on multiple lines
- [ ] Mobile responsiveness on all pages
- [ ] Navigation menu appearance
- [ ] Permissions and access control
- [ ] Media uploads
- [ ] Profile visibility settings

### 11. Key Configuration Notes

#### Default Behavior:
- **Discovery page**: "My Organization Only" toggle defaults to ON for better tenant isolation
- **Professional titles**: Display on up to 2 lines to prevent truncation
- **Mobile responsive**: All components adapt to mobile screen sizes
- **Public access**: Discovery page accessible without authentication
- **Cross-tenant search**: Available when "My Organization Only" is toggled off
- **URL persistence**: Filter settings are preserved in URL parameters

## Notes

- The Provider module is designed to be tenant-aware and will automatically scope data to the current tenant
- All profiles are isolated by tenant ID for security
- The module supports both public and private profiles
- URL slugs must be unique within each tenant
- The module requires the backend Provider resolver to be properly configured