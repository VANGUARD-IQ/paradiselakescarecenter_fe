import { gql } from "@apollo/client";

// Email-based authentication mutations
export const REQUEST_AUTH = gql`
  mutation RequestAuth($input: AuthInput!) {
    requestAuth(input: $input)
  }
`;

export const VERIFY_AUTH = gql`
  mutation VerifyAuth($input: VerifyInput!) {
    verifyAuth(input: $input)
  }
`;

// SMS-based authentication mutations
export const REQUEST_AUTH_SMS = gql`
  mutation RequestAuthViaSMS($input: AuthViaSMSInput!) {
    requestAuthViaSMS(input: $input)
  }
`;

export const VERIFY_AUTH_SMS = gql`
  mutation VerifyAuthViaSMS($input: VerifySMSInput!) {
    verifyAuthViaSMS(input: $input)
  }
`;

// Client update mutation
export const UPDATE_CLIENT = gql`
  mutation UpdateClient($id: ID!, $input: UpdateClientInput!) {
    updateClient(id: $id, input: $input) {
      id
      fName
      lName
      email
    }
  }
`;

// Client queries for authentication context
export const GET_CLIENT = gql`
  query GetClientByEmail($email: String!) {
    clientByEmail(email: $email) {
      id
      email
      fName
      lName
      phoneNumber
      role
      isVerifiedSeller
      businessName
      businessRegistrationNumber
      profilePhoto
      shippingAddresses {
        name
        phone
        address {
          street
          city
          state
          postcode
          country
        }
        isDefault
        instructions
      }
      billingAddresses {
        name
        phone
        address {
          street
          city
          state
          postcode
          country
        }
        isDefault
        instructions
      }
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
      }
      permissions
      encryptedSignatureIpfsUrl
      createdAt
      updatedAt
      tenantId
    }
  }
`;

export const GET_CLIENT_BY_PHONE = gql`
  query GetClientByPhone($phoneNumber: String!) {
    clientByPhone(phoneNumber: $phoneNumber) {
      id
      email
      fName
      lName
      phoneNumber
      role
      isVerifiedSeller
      businessName
      businessRegistrationNumber
      profilePhoto
      shippingAddresses {
        name
        phone
        address {
          street
          city
          state
          postcode
          country
        }
        isDefault
        instructions
      }
      billingAddresses {
        name
        phone
        address {
          street
          city
          state
          postcode
          country
        }
        isDefault
        instructions
      }
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
      }
      permissions
      encryptedSignatureIpfsUrl
      createdAt
      updatedAt
      tenantId
    }
  }
`;

// BEST PRACTICE: Query client by ID for most efficient lookup
export const GET_CLIENT_BY_ID = gql`
  query GetClientById($id: ID!) {
    client(id: $id) {
      id
      email
      fName
      lName
      phoneNumber
      role
      isVerifiedSeller
      businessName
      businessRegistrationNumber
      profilePhoto
      shippingAddresses {
        name
        phone
        address {
          street
          city
          state
          postcode
          country
        }
        isDefault
        instructions
      }
      billingAddresses {
        name
        phone
        address {
          street
          city
          state
          postcode
          country
        }
        isDefault
        instructions
      }
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
      }
      permissions
      encryptedSignatureIpfsUrl
      createdAt
      updatedAt
      tenantId
    }
  }
`;

// New mutations for email/phone changes that use client ID
export const REQUEST_EMAIL_CHANGE = gql`
  mutation RequestEmailChange($input: RequestEmailChangeInput!) {
    requestEmailChange(input: $input)
  }
`;

export const VERIFY_EMAIL_CHANGE = gql`
  mutation VerifyEmailChange($input: VerifyEmailChangeInput!) {
    verifyEmailChange(input: $input)
  }
`;

export const REQUEST_PHONE_CHANGE = gql`
  mutation RequestPhoneChange($input: RequestPhoneChangeInput!) {
    requestPhoneChange(input: $input)
  }
`;

export const VERIFY_PHONE_CHANGE = gql`
  mutation VerifyPhoneChange($input: VerifyPhoneChangeInput!) {
    verifyPhoneChange(input: $input)
  }
`;