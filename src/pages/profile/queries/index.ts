import { gql } from '@apollo/client';

/**
 * Profile Module GraphQL Queries and Mutations
 *
 * Centralized GraphQL operations for profile management
 */

export const GET_CLIENT = gql`
  query GetClient($id: ID!) {
    client(id: $id) {
      id
      fName
      lName
      email
      phoneNumber
      businessName
      businessRegistrationNumber
      role
      isVerifiedSeller
      profilePhoto
      paymentReceivingDetails {
        acceptedMethods
        bankAccount {
          accountName
          bsb
          accountNumber
          bankName
          swiftCode
        }
        cryptoWallets {
          walletAddress
          network
          memo
        }
        stripeConnect {
          stripeAccountId
          accountVerified
          verifiedAt
        }
        paypalEmail
        isVerified
        cryptoDiscountPercentage
      }
    }
  }
`;

export const UPDATE_CLIENT = gql`
  mutation UpdateClient($id: ID!, $input: UpdateClientInput!) {
    updateClient(id: $id, input: $input) {
      id
      fName
      lName
      email
      phoneNumber
      businessName
      businessRegistrationNumber
      role
      isVerifiedSeller
      profilePhoto
      paymentReceivingDetails {
        acceptedMethods
        bankAccount {
          accountName
          bsb
          accountNumber
          bankName
          swiftCode
        }
        cryptoWallets {
          walletAddress
          network
          memo
        }
        stripeConnect {
          stripeAccountId
          accountVerified
          verifiedAt
        }
        paypalEmail
        isVerified
        cryptoDiscountPercentage
      }
    }
  }
`;

export const GET_TENANT_BY_CURRENT_CLIENT = gql`
  query TenantByCurrentClient {
    tenantByCurrentClient {
      id
      name
      domain
      websiteUrl
      status
      subscriptionTier
      apiKeys {
        postmarkApiKey
        cellcastApiKey
        stripePublicKey
        stripeSecretKey
        stripeWebhookSecret
      }
      branding {
        siteName
        tagline
        description
        logo
        favicon
        primaryColor
        secondaryColor
        accentColor
      }
      emailConfig {
        fromEmail
        fromName
        replyToEmail
      }
      smsConfig {
        defaultSender
        defaultSenderType
        defaultTags
        defaultList
      }
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_TENANT = gql`
  mutation UpdateTenant($id: ID!, $input: UpdateTenantInput!) {
    updateTenant(id: $id, input: $input) {
      id
      name
      domain
      websiteUrl
      apiKeys {
        postmarkApiKey
        cellcastApiKey
        stripePublicKey
        stripeSecretKey
        stripeWebhookSecret
      }
      branding {
        siteName
        tagline
        description
        logo
        favicon
        primaryColor
        secondaryColor
        accentColor
      }
      emailConfig {
        fromEmail
        fromName
        replyToEmail
      }
      smsConfig {
        defaultSender
        defaultSenderType
        defaultTags
        defaultList
      }
      updatedAt
    }
  }
`;

export const UPLOAD_UNENCRYPTED_FILE = gql`
  mutation UploadUnencrypted($file: Upload!) {
    uploadUnencryptedFile(file: $file)
  }
`;
