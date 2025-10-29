import { gql } from "@apollo/client";

// === SUBSCRIPTION QUERIES ===
export const GET_SUBSCRIPTIONS = gql`
  query GetSubscriptions {
    subscriptions {
      id
      client {
        id
        fName
        lName
        email
      }
      plan {
        name
        description
        amount
        interval
        tier
        includedModules
      }
      status
      startDate
      nextBillingDate
      trialEndsAt
      canceledAt
      stripeCustomerId
      notes
      createdAt
    }
  }
`;

export const GET_SUBSCRIPTION = gql`
  query GetSubscription($id: ID!) {
    subscription(id: $id) {
      id
      client {
        id
        fName
        lName
        email
        phoneNumber
      }
      plan {
        name
        description
        amount
        interval
        tier
        includedModules
        maxUsers
        maxClients
      }
      status
      startDate
      endDate
      nextBillingDate
      trialEndsAt
      canceledAt
      cancellationReason
      notes
      createdAt
      updatedAt
    }
  }
`;

export const GET_SUBSCRIPTIONS_BY_CLIENT = gql`
  query GetSubscriptionsByClient($clientId: ID!) {
    subscriptionsByClient(clientId: $clientId) {
      id
      plan {
        name
        amount
        interval
      }
      status
      startDate
      nextBillingDate
      createdAt
    }
  }
`;

// === SUBSCRIPTION MUTATIONS ===
export const CREATE_SUBSCRIPTION = gql`
  mutation CreateSubscription($input: SubscriptionInput!) {
    createSubscription(input: $input) {
      id
      status
      client {
        id
        fName
        lName
      }
      plan {
        name
        amount
        interval
      }
      startDate
      nextBillingDate
    }
  }
`;

export const CANCEL_SUBSCRIPTION = gql`
  mutation CancelSubscription($id: ID!, $reason: String) {
    cancelSubscription(id: $id, reason: $reason)
  }
`;

// === PAYMENT METHOD QUERIES ===
export const GET_PAYMENT_METHODS = gql`
  query GetPaymentMethods {
    paymentMethods {
      id
      client {
        id
        fName
        lName
        email
      }
      type
      isDefault
      status
      stripePaymentMethodId
      stripeCustomerId
      cardDetails {
        brand
        last4
        expMonth
        expYear
      }
      description
      lastUsedAt
      createdAt
    }
  }
`;

export const GET_PAYMENT_METHODS_BY_CLIENT = gql`
  query GetPaymentMethodsByClient($clientId: ID!) {
    paymentMethodsByClient(clientId: $clientId) {
      id
      type
      isDefault
      status
      stripePaymentMethodId
      stripeCustomerId
      cardDetails {
        brand
        last4
        expMonth
        expYear
      }
      description
      lastUsedAt
      createdAt
    }
  }
`;

export const CREATE_PAYMENT_METHOD = gql`
  mutation CreatePaymentMethod($input: PaymentMethodInput!) {
    createPaymentMethod(input: $input) {
      id
      client {
        id
        fName
        lName
        email
      }
      type
      status
      isDefault
      stripePaymentMethodId
      stripeCustomerId
      cardDetails {
        brand
        last4
        expMonth
        expYear
      }
      description
      createdAt
    }
  }
`;

export const DELETE_PAYMENT_METHOD = gql`
  mutation DeletePaymentMethod($id: ID!) {
    deletePaymentMethod(id: $id)
  }
`;

// === MANUAL CHARGING MUTATIONS (NEW) ===
export const CHARGE_PAYMENT_METHOD = gql`
  mutation ChargePaymentMethod(
    $paymentMethodId: ID!
    $amount: Float!
    $description: String!
    $clientId: ID!
    $currency: String = "USD"
  ) {
    chargePaymentMethod(
      paymentMethodId: $paymentMethodId
      amount: $amount
      description: $description
      clientId: $clientId
      currency: $currency
    )
  }
`;

export const CREATE_MANUAL_CHARGE = gql`
  mutation CreateManualCharge($input: ManualChargeInput!) {
    createManualCharge(input: $input) {
      id
      client {
        id
        fName
        lName
        email
      }
      amount
      currency
      description
      status
      chargeId
      receiptUrl
      paymentMethod {
        id
        cardDetails {
          brand
          last4
        }
      }
      createdAt
    }
  }
`;

// === CHARGE HISTORY QUERIES ===
export const GET_CHARGES = gql`
  query GetCharges {
    charges {
      id
      client {
        id
        fName
        lName
        email
      }
      total
      currency
      lineItems {
        description
        quantity
        unitPrice
        amount
      }
      status
      stripePaymentIntentId
      invoiceNumber
      createdAt
    }
  }
`;

export const GET_CHARGES_BY_CLIENT = gql`
  query GetChargesByClient($clientId: ID!) {
    chargesByClient(clientId: $clientId) {
      id
      total
      currency
      lineItems {
        description
        quantity
        unitPrice
        amount
      }
      status
      stripePaymentIntentId
      invoiceNumber
      createdAt
    }
  }
`;

// === INVOICE QUERIES ===
export const GET_INVOICES = gql`
  query GetInvoices {
    invoices {
      id
      client {
        id
        fName
        lName
        email
      }
      subscription {
        id
        plan {
          name
        }
      }
      invoiceNumber
      status
      type
      subtotal
      taxAmount
      total
      currency
      dueDate
      paidAt
      lineItems {
        description
        quantity
        unitPrice
        amount
      }
      createdAt
    }
  }
`;

export const GET_INVOICE = gql`
  query GetInvoice($id: ID!) {
    invoice(id: $id) {
      id
      client {
        id
        fName
        lName
        email
      }
      subscription {
        id
        plan {
          name
        }
      }
      invoiceNumber
      status
      type
      subtotal
      taxAmount
      discountAmount
      total
      currency
      dueDate
      paidAt
      voidedAt
      lineItems {
        description
        quantity
        unitPrice
        amount
        metadata
      }
      stripeInvoiceId
      notes
      billingEmail
      billingAddress
      createdAt
      updatedAt
    }
  }
`;

export const GET_INVOICES_BY_CLIENT = gql`
  query GetInvoicesByClient($clientId: ID!) {
    invoicesByClient(clientId: $clientId) {
      id
      invoiceNumber
      status
      total
      currency
      dueDate
      paidAt
      createdAt
    }
  }
`;

export const CREATE_INVOICE = gql`
  mutation CreateInvoice($input: InvoiceInput!) {
    createInvoice(input: $input) {
      id
      invoiceNumber
      status
      total
      dueDate
    }
  }
`;

// === PAYMENT INTENTS ===
export const CREATE_PAYMENT_INTENT = gql`
  mutation CreatePaymentIntent($invoiceId: String!) {
    createPaymentIntent(invoiceId: $invoiceId)
  }
`;

export const CREATE_SETUP_INTENT = gql`
  mutation CreateSetupIntent($clientId: String!) {
    createSetupIntent(clientId: $clientId)
  }
`;

export const UPDATE_INVOICE = gql`
  mutation UpdateInvoice($id: ID!, $input: UpdateInvoiceInput!) {
    updateInvoice(id: $id, input: $input) {
      id
      client {
        id
        fName
        lName
        email
      }
      subscription {
        id
        plan {
          name
        }
      }
      invoiceNumber
      type
      status
      subtotal
      taxAmount
      discountAmount
      total
      currency
      dueDate
      paidAt
      voidedAt
      lineItems {
        description
        quantity
        unitPrice
        amount
        metadata
      }
      stripeInvoiceId
      stripePaymentIntentId
      notes
      billingEmail
      billingAddress
      pdfUrl
      createdAt
      updatedAt
    }
  }
`;
