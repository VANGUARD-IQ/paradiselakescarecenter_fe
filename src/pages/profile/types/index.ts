/**
 * Profile Module Type Definitions
 */

export interface BankAccount {
  accountName: string;
  bsb: string;
  accountNumber: string;
  bankName: string;
  swiftCode: string;
}

export interface CryptoWallet {
  walletAddress: string;
  network: string;
  memo: string;
}

export interface StripeConnect {
  stripeAccountId: string;
  accountVerified: boolean;
  verifiedAt: string | null;
}

export interface PaymentReceivingDetails {
  acceptedMethods: string[];
  bankAccount: BankAccount;
  cryptoWallets: CryptoWallet[];
  stripeConnect: StripeConnect;
  paypalEmail: string;
  isVerified: boolean;
  cryptoDiscountPercentage?: number;
}

export interface ClientFormData {
  fName: string;
  lName: string;
  email: string;
  phoneNumber: string;
  businessName: string;
  businessRegistrationNumber: string;
  role: string;
  profilePhoto: string;
  paymentReceivingDetails: PaymentReceivingDetails;
}

export interface ApiKeys {
  postmarkApiKey: string;
  cellcastApiKey: string;
  stripePublicKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
}

export interface Branding {
  siteName: string;
  tagline: string;
  description: string;
  logo: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export interface EmailConfig {
  fromEmail: string;
  fromName: string;
  replyToEmail: string;
}

export interface SmsConfig {
  defaultSender: string;
  defaultSenderType: string;
  defaultTags: string[];
  defaultList: string;
}

export interface TenantFormData {
  id: string;
  name: string;
  domain: string;
  websiteUrl: string;
  apiKeys: ApiKeys;
  branding: Branding;
  emailConfig: EmailConfig;
}

export interface PendingChanges {
  email: string;
  phoneNumber: string;
}
