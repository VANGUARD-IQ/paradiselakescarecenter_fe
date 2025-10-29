export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: string; output: string; }
  JSONObject: { input: any; output: any; }
  Upload: { input: File; output: File; }
};

/** Visibility levels for knowledge articles */
export enum ArticleVisibility {
  Private = 'PRIVATE',
  Public = 'PUBLIC',
  Shared = 'SHARED'
}

export type Asset = {
  __typename?: 'Asset';
  assetId: Scalars['String']['output'];
  assetType?: Maybe<AssetType>;
  assignedTo?: Maybe<Client>;
  barcode?: Maybe<Scalars['String']['output']>;
  company?: Maybe<Company>;
  condition: AssetCondition;
  createdAt: Scalars['DateTime']['output'];
  customFields?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  disposalDate?: Maybe<Scalars['DateTime']['output']>;
  disposalReason?: Maybe<Scalars['String']['output']>;
  disposalValue?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  lastMaintenanceDate?: Maybe<Scalars['DateTime']['output']>;
  location?: Maybe<AssetLocation>;
  logCount?: Maybe<Scalars['Float']['output']>;
  logs?: Maybe<Array<AssetLog>>;
  maintenanceNotes?: Maybe<Scalars['String']['output']>;
  manufacturer?: Maybe<Scalars['String']['output']>;
  model?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  nextMaintenanceDate?: Maybe<Scalars['DateTime']['output']>;
  photos?: Maybe<Array<Scalars['String']['output']>>;
  publicUrl?: Maybe<Scalars['String']['output']>;
  purchaseDate?: Maybe<Scalars['DateTime']['output']>;
  purchasePrice?: Maybe<Scalars['Float']['output']>;
  qrCode?: Maybe<Scalars['String']['output']>;
  serialNumber?: Maybe<Scalars['String']['output']>;
  status: AssetStatus;
  supplier?: Maybe<Scalars['String']['output']>;
  tags?: Maybe<Array<Scalars['String']['output']>>;
  tenantId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  warrantyExpiry?: Maybe<Scalars['DateTime']['output']>;
};

/** The condition of the asset */
export enum AssetCondition {
  Broken = 'BROKEN',
  Excellent = 'EXCELLENT',
  Fair = 'FAIR',
  Good = 'GOOD',
  New = 'NEW',
  Poor = 'POOR'
}

export type AssetInput = {
  assetId: Scalars['String']['input'];
  assetType?: InputMaybe<Scalars['ID']['input']>;
  assignedTo?: InputMaybe<Scalars['ID']['input']>;
  barcode?: InputMaybe<Scalars['String']['input']>;
  company?: InputMaybe<Scalars['ID']['input']>;
  condition?: InputMaybe<AssetCondition>;
  customFields?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<AssetLocationInput>;
  maintenanceNotes?: InputMaybe<Scalars['String']['input']>;
  manufacturer?: InputMaybe<Scalars['String']['input']>;
  model?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  nextMaintenanceDate?: InputMaybe<Scalars['DateTime']['input']>;
  photos?: InputMaybe<Array<Scalars['String']['input']>>;
  purchaseDate?: InputMaybe<Scalars['DateTime']['input']>;
  purchasePrice?: InputMaybe<Scalars['Float']['input']>;
  serialNumber?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<AssetStatus>;
  supplier?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  warrantyExpiry?: InputMaybe<Scalars['DateTime']['input']>;
};

export type AssetLocation = {
  __typename?: 'AssetLocation';
  building?: Maybe<Scalars['String']['output']>;
  coordinates?: Maybe<Scalars['String']['output']>;
  floor?: Maybe<Scalars['String']['output']>;
  room?: Maybe<Scalars['String']['output']>;
  section?: Maybe<Scalars['String']['output']>;
};

export type AssetLocationInput = {
  building?: InputMaybe<Scalars['String']['input']>;
  coordinates?: InputMaybe<Scalars['String']['input']>;
  floor?: InputMaybe<Scalars['String']['input']>;
  room?: InputMaybe<Scalars['String']['input']>;
  section?: InputMaybe<Scalars['String']['input']>;
};

export type AssetLog = {
  __typename?: 'AssetLog';
  action: Scalars['String']['output'];
  assetId: Scalars['ID']['output'];
  conditionAfter?: Maybe<AssetCondition>;
  conditionBefore?: Maybe<AssetCondition>;
  cost?: Maybe<Scalars['Float']['output']>;
  createdAt: Scalars['DateTime']['output'];
  createdBy: Client;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  nextActionDate?: Maybe<Scalars['DateTime']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  photos?: Maybe<Array<Scalars['String']['output']>>;
  tenantId: Scalars['String']['output'];
  timestamp: Scalars['DateTime']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type AssetLogInput = {
  action: Scalars['String']['input'];
  assetId: Scalars['ID']['input'];
  conditionAfter?: InputMaybe<AssetCondition>;
  conditionBefore?: InputMaybe<AssetCondition>;
  cost?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  nextActionDate?: InputMaybe<Scalars['DateTime']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  photos?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** The current status of the asset */
export enum AssetStatus {
  Active = 'ACTIVE',
  Damaged = 'DAMAGED',
  Disposed = 'DISPOSED',
  InMaintenance = 'IN_MAINTENANCE',
  Lost = 'LOST',
  Retired = 'RETIRED'
}

export type AssetType = {
  __typename?: 'AssetType';
  category?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  maintenanceIntervalDays?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  requiredFields?: Maybe<Array<Scalars['String']['output']>>;
  tenantId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type AssetTypeInput = {
  category?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  maintenanceIntervalDays?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
  requiredFields?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** Attendee role in event */
export enum AttendeeRole {
  Chair = 'CHAIR',
  NonParticipant = 'NON_PARTICIPANT',
  OptParticipant = 'OPT_PARTICIPANT',
  ReqParticipant = 'REQ_PARTICIPANT'
}

/** Attendee response status */
export enum AttendeeStatus {
  Accepted = 'ACCEPTED',
  Declined = 'DECLINED',
  Delegated = 'DELEGATED',
  NeedsAction = 'NEEDS_ACTION',
  Tentative = 'TENTATIVE'
}

/** Status of the audio/video transcription job */
export enum AudioTranscriptionStatus {
  Completed = 'COMPLETED',
  Failed = 'FAILED',
  Pending = 'PENDING',
  Processing = 'PROCESSING',
  Uploading = 'UPLOADING'
}

export type Auth = {
  __typename?: 'Auth';
  email?: Maybe<Scalars['String']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
};

export type AuthInput = {
  brand?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
};

export type AuthResponse = {
  __typename?: 'AuthResponse';
  client: Client;
  token: Scalars['String']['output'];
};

export type AuthViaSmsInput = {
  brand?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  phoneNumber: Scalars['String']['input'];
};

export type Availability = {
  __typename?: 'Availability';
  createdAt: Scalars['DateTime']['output'];
  endTime: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isAvailable: Scalars['Boolean']['output'];
  isRecurring: Scalars['Boolean']['output'];
  practitioner: Client;
  reason?: Maybe<Scalars['String']['output']>;
  recurrenceRule?: Maybe<Scalars['String']['output']>;
  startTime: Scalars['DateTime']['output'];
  status: AvailabilityStatus;
  tenantId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type AvailabilityInput = {
  endTime: Scalars['DateTime']['input'];
  isAvailable?: InputMaybe<Scalars['Boolean']['input']>;
  isRecurring?: InputMaybe<Scalars['Boolean']['input']>;
  practitioner: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
  recurrenceRule?: InputMaybe<Scalars['String']['input']>;
  startTime: Scalars['DateTime']['input'];
  status?: AvailabilityStatus;
};

/** The status of the availability slot */
export enum AvailabilityStatus {
  Cancelled = 'CANCELLED',
  Confirmed = 'CONFIRMED',
  Draft = 'DRAFT'
}

export type AvailablePhoneNumber = {
  __typename?: 'AvailablePhoneNumber';
  capabilities: Array<PhoneCapability>;
  currency: Scalars['String']['output'];
  friendlyName: Scalars['String']['output'];
  isoCountry?: Maybe<Scalars['String']['output']>;
  locality?: Maybe<Scalars['String']['output']>;
  monthlyCost: Scalars['Float']['output'];
  phoneNumber: Scalars['String']['output'];
  postalCode?: Maybe<Scalars['String']['output']>;
  region?: Maybe<Scalars['String']['output']>;
};

export type AvailableTimeSlot = {
  __typename?: 'AvailableTimeSlot';
  available: Scalars['Boolean']['output'];
  endTime: Scalars['DateTime']['output'];
  startTime: Scalars['DateTime']['output'];
};

export type BankAccountDetails = {
  __typename?: 'BankAccountDetails';
  accountName?: Maybe<Scalars['String']['output']>;
  accountNumber?: Maybe<Scalars['String']['output']>;
  bankName?: Maybe<Scalars['String']['output']>;
  bsb?: Maybe<Scalars['String']['output']>;
  swiftCode?: Maybe<Scalars['String']['output']>;
};

export type BankAccountDetailsInput = {
  accountName?: InputMaybe<Scalars['String']['input']>;
  accountNumber?: InputMaybe<Scalars['String']['input']>;
  bankName?: InputMaybe<Scalars['String']['input']>;
  bsb?: InputMaybe<Scalars['String']['input']>;
  swiftCode?: InputMaybe<Scalars['String']['input']>;
};

export type Bill = {
  __typename?: 'Bill';
  acceptBankTransfer?: Maybe<Scalars['Boolean']['output']>;
  acceptCardPayment?: Maybe<Scalars['Boolean']['output']>;
  acceptCryptoPayment?: Maybe<Scalars['Boolean']['output']>;
  clientId?: Maybe<Scalars['ID']['output']>;
  createdAt: Scalars['DateTime']['output'];
  currency: BillCurrency;
  draftInvoiceId?: Maybe<Scalars['ID']['output']>;
  finalInvoiceId?: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  isPaid: Scalars['Boolean']['output'];
  issuedBy?: Maybe<Scalars['ID']['output']>;
  lineItems?: Maybe<Array<LineItem>>;
  paymentMethod?: Maybe<PaymentProvider>;
  paymentTerms?: Maybe<Scalars['String']['output']>;
  percentageOfTotal?: Maybe<Scalars['Float']['output']>;
  projectId?: Maybe<Scalars['ID']['output']>;
  showPaymentDetails?: Maybe<Scalars['Boolean']['output']>;
  status: BillStatus;
  subtotal?: Maybe<Scalars['Float']['output']>;
  taxAmount?: Maybe<Scalars['Float']['output']>;
  taxPercentage?: Maybe<Scalars['Float']['output']>;
  tenantId: Scalars['String']['output'];
  totalAmount?: Maybe<Scalars['Float']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type BillChaserConfigInput = {
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
  maxBillsPerRun?: InputMaybe<Scalars['Float']['input']>;
  minBillAgeInDays?: InputMaybe<Scalars['Float']['input']>;
  sendToClients?: InputMaybe<Scalars['Boolean']['input']>;
  sendToIssuers?: InputMaybe<Scalars['Boolean']['input']>;
};

export type BillChaserConfigResponse = {
  __typename?: 'BillChaserConfigResponse';
  cronSchedule: Scalars['String']['output'];
  enabled: Scalars['Boolean']['output'];
  maxBillsPerRun: Scalars['Float']['output'];
  minBillAgeInDays: Scalars['Float']['output'];
  scheduleDescription: Scalars['String']['output'];
  sendEmails: Scalars['Boolean']['output'];
  sendSms: Scalars['Boolean']['output'];
  sendToClients: Scalars['Boolean']['output'];
  sendToIssuers: Scalars['Boolean']['output'];
  timezone: Scalars['String']['output'];
};

export type BillChaserRunInput = {
  maxBillsPerRun?: InputMaybe<Scalars['Float']['input']>;
  minBillAgeInDays?: InputMaybe<Scalars['Float']['input']>;
  sendEmails?: InputMaybe<Scalars['Boolean']['input']>;
  sendSms?: InputMaybe<Scalars['Boolean']['input']>;
  sendToClients?: InputMaybe<Scalars['Boolean']['input']>;
  sendToIssuers?: InputMaybe<Scalars['Boolean']['input']>;
};

export type BillChaserRunResponse = {
  __typename?: 'BillChaserRunResponse';
  billsProcessed: Scalars['Float']['output'];
  billsSkipped: Scalars['Float']['output'];
  clientEmailsFailed: Scalars['Float']['output'];
  clientEmailsSuccessful: Scalars['Float']['output'];
  clientSmsFailed: Scalars['Float']['output'];
  clientSmsSuccessful: Scalars['Float']['output'];
  duration: Scalars['Float']['output'];
  endTime: Scalars['DateTime']['output'];
  issuerEmailsFailed: Scalars['Float']['output'];
  issuerEmailsSuccessful: Scalars['Float']['output'];
  issuerSmsFailed: Scalars['Float']['output'];
  issuerSmsSuccessful: Scalars['Float']['output'];
  message: Scalars['String']['output'];
  startTime: Scalars['DateTime']['output'];
  success: Scalars['Boolean']['output'];
  systemErrors: Array<Scalars['String']['output']>;
  totalBillsFound: Scalars['Float']['output'];
};

/** The currency for the bill */
export enum BillCurrency {
  Aud = 'AUD',
  Usd = 'USD'
}

export type BillInput = {
  acceptBankTransfer?: InputMaybe<Scalars['Boolean']['input']>;
  acceptCardPayment?: InputMaybe<Scalars['Boolean']['input']>;
  acceptCryptoPayment?: InputMaybe<Scalars['Boolean']['input']>;
  clientId?: InputMaybe<Scalars['ID']['input']>;
  currency?: BillCurrency;
  draftInvoiceId?: InputMaybe<Scalars['ID']['input']>;
  finalInvoiceId?: InputMaybe<Scalars['ID']['input']>;
  isPaid: Scalars['Boolean']['input'];
  issuedBy?: InputMaybe<Scalars['ID']['input']>;
  lineItems?: InputMaybe<Array<LineItemInput>>;
  paymentMethod?: InputMaybe<PaymentProvider>;
  paymentTerms?: InputMaybe<Scalars['String']['input']>;
  percentageOfTotal?: InputMaybe<Scalars['Float']['input']>;
  projectId?: InputMaybe<Scalars['ID']['input']>;
  showPaymentDetails?: InputMaybe<Scalars['Boolean']['input']>;
  status?: BillStatus;
  subtotal?: InputMaybe<Scalars['Float']['input']>;
  taxAmount?: InputMaybe<Scalars['Float']['input']>;
  taxPercentage?: InputMaybe<Scalars['Float']['input']>;
  totalAmount?: InputMaybe<Scalars['Float']['input']>;
};

export type BillPaymentResponse = {
  __typename?: 'BillPaymentResponse';
  clientSecret?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  paymentIntentId?: Maybe<Scalars['String']['output']>;
  requiresAction: Scalars['Boolean']['output'];
  success: Scalars['Boolean']['output'];
};

/** The status of the bill */
export enum BillStatus {
  Draft = 'DRAFT',
  Proposal = 'PROPOSAL',
  Sent = 'SENT'
}

export enum BillingInterval {
  Daily = 'DAILY',
  Monthly = 'MONTHLY',
  OneTime = 'ONE_TIME',
  Weekly = 'WEEKLY',
  Yearly = 'YEARLY'
}

export type BookableEventTypeStats = {
  __typename?: 'BookableEventTypeStats';
  cancelledBookings: Scalars['Float']['output'];
  confirmedBookings: Scalars['Float']['output'];
  currency: Scalars['String']['output'];
  totalBookings: Scalars['Float']['output'];
  totalRevenue: Scalars['Float']['output'];
};

export type Booking = {
  __typename?: 'Booking';
  bookingTime: Scalars['DateTime']['output'];
  cancellationReason?: Maybe<Scalars['String']['output']>;
  client: Client;
  createdAt: Scalars['DateTime']['output'];
  endTime?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  payment: BookingPayment;
  practitionerId?: Maybe<Scalars['String']['output']>;
  remindersSent: Array<Scalars['DateTime']['output']>;
  sendReminders: Scalars['Boolean']['output'];
  session?: Maybe<Session>;
  sessionType?: Maybe<SessionType>;
  startTime?: Maybe<Scalars['DateTime']['output']>;
  status: BookingStatus;
  tenantId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type BookingInput = {
  brand?: InputMaybe<Scalars['String']['input']>;
  clientId: Scalars['String']['input'];
  endTime?: InputMaybe<Scalars['DateTime']['input']>;
  payment?: InputMaybe<BookingPaymentInput>;
  practitionerId?: InputMaybe<Scalars['String']['input']>;
  returnUrl?: InputMaybe<Scalars['String']['input']>;
  sendReminders?: InputMaybe<Scalars['Boolean']['input']>;
  sessionId?: InputMaybe<Scalars['String']['input']>;
  sessionTypeId?: InputMaybe<Scalars['String']['input']>;
  startTime?: InputMaybe<Scalars['DateTime']['input']>;
};

export type BookingPayment = {
  __typename?: 'BookingPayment';
  amount: Scalars['Float']['output'];
  bankTransferReceipt?: Maybe<Scalars['String']['output']>;
  bankTransferReference?: Maybe<Scalars['String']['output']>;
  cryptoAmount?: Maybe<Scalars['String']['output']>;
  cryptoNetwork?: Maybe<Scalars['String']['output']>;
  cryptoToken?: Maybe<Scalars['String']['output']>;
  cryptoTransactionHash?: Maybe<Scalars['String']['output']>;
  currency?: Maybe<Scalars['String']['output']>;
  method: BookingPaymentMethod;
  notes?: Maybe<Scalars['String']['output']>;
  paidAt?: Maybe<Scalars['DateTime']['output']>;
  status: BookingPaymentStatus;
  stripePaymentIntentId?: Maybe<Scalars['String']['output']>;
};

export type BookingPaymentInput = {
  amount: Scalars['Float']['input'];
  bankTransferReference?: InputMaybe<Scalars['String']['input']>;
  cryptoAmount?: InputMaybe<Scalars['String']['input']>;
  cryptoNetwork?: InputMaybe<Scalars['String']['input']>;
  cryptoToken?: InputMaybe<Scalars['String']['input']>;
  cryptoTransactionHash?: InputMaybe<Scalars['String']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  method: BookingPaymentMethod;
  notes?: InputMaybe<Scalars['String']['input']>;
  stripePaymentIntentId?: InputMaybe<Scalars['String']['input']>;
};

/** Method of booking payment */
export enum BookingPaymentMethod {
  BankTransfer = 'BANK_TRANSFER',
  Crypto = 'CRYPTO',
  Other = 'OTHER',
  Stripe = 'STRIPE'
}

/** Status of the booking payment */
export enum BookingPaymentStatus {
  Completed = 'COMPLETED',
  Failed = 'FAILED',
  Pending = 'PENDING',
  Processing = 'PROCESSING',
  Refunded = 'REFUNDED'
}

/** Status of the booking */
export enum BookingStatus {
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  Confirmed = 'CONFIRMED',
  Pending = 'PENDING'
}

/** Types of influencer booking engagements */
export enum BookingType {
  Campaign = 'CAMPAIGN',
  Consultation = 'CONSULTATION',
  Content = 'CONTENT',
  Education = 'EDUCATION',
  Other = 'OTHER',
  Speaking = 'SPEAKING'
}

export type BulkDeploymentResult = {
  __typename?: 'BulkDeploymentResult';
  failedDeployments: Scalars['Float']['output'];
  moduleId: Scalars['String']['output'];
  results: Array<DeploymentResult>;
  successfulDeployments: Scalars['Float']['output'];
  totalTenants: Scalars['Float']['output'];
};

export type BusinessCalendar = {
  __typename?: 'BusinessCalendar';
  allowPublicBooking: Scalars['Boolean']['output'];
  bookingConfirmationEmailTemplate?: Maybe<Scalars['String']['output']>;
  bookingPageBranding?: Maybe<Scalars['JSONObject']['output']>;
  bookingPageDescription?: Maybe<Scalars['String']['output']>;
  bookingPageLogo?: Maybe<Scalars['String']['output']>;
  bookingPageSlug?: Maybe<Scalars['String']['output']>;
  bookingPageTitle?: Maybe<Scalars['String']['output']>;
  bookingReminderEmailTemplate?: Maybe<Scalars['String']['output']>;
  caldavUrl?: Maybe<Scalars['String']['output']>;
  color?: Maybe<Scalars['String']['output']>;
  companyId?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  deactivatedAt?: Maybe<Scalars['DateTime']['output']>;
  deactivatedReason?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  displayOrder: Scalars['Float']['output'];
  eventCount?: Maybe<Scalars['Int']['output']>;
  iCalUrl?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isPublic: Scalars['Boolean']['output'];
  lastEventAt?: Maybe<Scalars['DateTime']['output']>;
  lastPublicBookingAt?: Maybe<Scalars['DateTime']['output']>;
  linkedEmailAddressId?: Maybe<Scalars['String']['output']>;
  linkedModules?: Maybe<Array<Scalars['String']['output']>>;
  moduleData?: Maybe<Scalars['JSONObject']['output']>;
  name: Scalars['String']['output'];
  ownerType?: Maybe<Scalars['String']['output']>;
  projectId?: Maybe<Scalars['String']['output']>;
  publicUrl?: Maybe<Scalars['String']['output']>;
  requirePaymentUpfront: Scalars['Boolean']['output'];
  responsibleOwnerId?: Maybe<Scalars['String']['output']>;
  sendBookingConfirmations: Scalars['Boolean']['output'];
  sendBookingReminders: Scalars['Boolean']['output'];
  settings?: Maybe<CalendarSettings>;
  sharedAt?: Maybe<Scalars['DateTime']['output']>;
  sharedFromEmail?: Maybe<Scalars['String']['output']>;
  sharedFromName?: Maybe<Scalars['String']['output']>;
  syncInfo?: Maybe<CalendarSyncInfo>;
  tenantId: Scalars['String']['output'];
  totalEvents: Scalars['Float']['output'];
  totalPublicBookings: Scalars['Float']['output'];
  type: CalendarType;
  upcomingEvents: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
  visibility: CalendarVisibility;
};

export type BusinessCalendarAvailability = {
  __typename?: 'BusinessCalendarAvailability';
  blockedDates?: Maybe<Array<Scalars['DateTime']['output']>>;
  calendarId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  extraAvailableDates?: Maybe<Array<Scalars['DateTime']['output']>>;
  id: Scalars['ID']['output'];
  slots: Array<BusinessCalendarAvailabilitySlot>;
  tenantId: Scalars['String']['output'];
  timezone: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type BusinessCalendarAvailabilitySlot = {
  __typename?: 'BusinessCalendarAvailabilitySlot';
  dayOfWeek: Scalars['Float']['output'];
  endTime: Scalars['String']['output'];
  startTime: Scalars['String']['output'];
};

export type BusinessCalendarAvailabilitySlotInput = {
  dayOfWeek: Scalars['Float']['input'];
  endTime: Scalars['String']['input'];
  startTime: Scalars['String']['input'];
};

export type BusinessCalendarBookableEventType = {
  __typename?: 'BusinessCalendarBookableEventType';
  autoGenerateMeetingLink: Scalars['Boolean']['output'];
  bufferAfterMinutes: Scalars['Float']['output'];
  bufferBeforeMinutes: Scalars['Float']['output'];
  calendarId: Scalars['String']['output'];
  color?: Maybe<Scalars['String']['output']>;
  confirmationMessage?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  currency?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  displayOrder: Scalars['Float']['output'];
  durationMinutes: Scalars['Float']['output'];
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isPaid: Scalars['Boolean']['output'];
  lastBookedAt?: Maybe<Scalars['DateTime']['output']>;
  location?: Maybe<Scalars['String']['output']>;
  locationType?: Maybe<Scalars['String']['output']>;
  maxBookingsPerDay?: Maybe<Scalars['Float']['output']>;
  maxFutureDays: Scalars['Float']['output'];
  meetingLink?: Maybe<Scalars['String']['output']>;
  minNoticeHours: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  price?: Maybe<Scalars['Float']['output']>;
  questions?: Maybe<Array<BusinessCalendarBookingQuestion>>;
  reminderHoursBefore: Scalars['Float']['output'];
  stripePriceId?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['String']['output'];
  totalBookings: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type BusinessCalendarBookingQuestion = {
  __typename?: 'BusinessCalendarBookingQuestion';
  id: Scalars['String']['output'];
  options?: Maybe<Array<Scalars['String']['output']>>;
  question: Scalars['String']['output'];
  required: Scalars['Boolean']['output'];
  type: Scalars['String']['output'];
};

export type BusinessCalendarBookingQuestionInput = {
  id: Scalars['String']['input'];
  options?: InputMaybe<Array<Scalars['String']['input']>>;
  question: Scalars['String']['input'];
  required: Scalars['Boolean']['input'];
  type: Scalars['String']['input'];
};

export type BusinessCalendarInput = {
  allowPublicBooking?: InputMaybe<Scalars['Boolean']['input']>;
  bookingConfirmationEmailTemplate?: InputMaybe<Scalars['String']['input']>;
  bookingPageBranding?: InputMaybe<Scalars['JSONObject']['input']>;
  bookingPageDescription?: InputMaybe<Scalars['String']['input']>;
  bookingPageLogo?: InputMaybe<Scalars['String']['input']>;
  bookingPageSlug?: InputMaybe<Scalars['String']['input']>;
  bookingPageTitle?: InputMaybe<Scalars['String']['input']>;
  bookingReminderEmailTemplate?: InputMaybe<Scalars['String']['input']>;
  color?: InputMaybe<Scalars['String']['input']>;
  companyId?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  iCalUrl?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  linkedEmailAddressId?: InputMaybe<Scalars['String']['input']>;
  linkedModules?: InputMaybe<Array<Scalars['String']['input']>>;
  name: Scalars['String']['input'];
  projectId?: InputMaybe<Scalars['String']['input']>;
  requirePaymentUpfront?: InputMaybe<Scalars['Boolean']['input']>;
  sendBookingConfirmations?: InputMaybe<Scalars['Boolean']['input']>;
  sendBookingReminders?: InputMaybe<Scalars['Boolean']['input']>;
  settings?: InputMaybe<CalendarSettingsInput>;
  sharedFromEmail?: InputMaybe<Scalars['String']['input']>;
  sharedFromName?: InputMaybe<Scalars['String']['input']>;
  syncInfo?: InputMaybe<CalendarSyncInfoInput>;
  type: CalendarType;
  visibility?: InputMaybe<CalendarVisibility>;
};

/** The type of business for the seller profile */
export enum BusinessType {
  ClothingFashion = 'CLOTHING_FASHION',
  EconomicWellbeing = 'ECONOMIC_WELLBEING',
  EmergencyPreparedness = 'EMERGENCY_PREPAREDNESS',
  EssentialOils = 'ESSENTIAL_OILS',
  FamilyDevelopment = 'FAMILY_DEVELOPMENT',
  Farm = 'FARM',
  FoodBeverage = 'FOOD_BEVERAGE',
  HandmadeCrafts = 'HANDMADE_CRAFTS',
  HealthyFoods = 'HEALTHY_FOODS',
  HealthyHome = 'HEALTHY_HOME',
  HealthWellness = 'HEALTH_WELLNESS',
  HomeGarden = 'HOME_GARDEN',
  LifelongLearning = 'LIFELONG_LEARNING',
  Other = 'OTHER',
  PersonalWellbeing = 'PERSONAL_WELLBEING',
  Relationships = 'RELATIONSHIPS',
  Services = 'SERVICES',
  SustainabilityCommunity = 'SUSTAINABILITY_COMMUNITY'
}

export type CalendarEvent = {
  __typename?: 'CalendarEvent';
  acceptedCount: Scalars['Float']['output'];
  attachments: Array<EventAttachment>;
  attendees: Array<EventAttendee>;
  calendarId: Scalars['String']['output'];
  cancellationReason?: Maybe<Scalars['String']['output']>;
  cancelledAt?: Maybe<Scalars['DateTime']['output']>;
  categories?: Maybe<Array<Scalars['String']['output']>>;
  color?: Maybe<Scalars['String']['output']>;
  completedTasks: Scalars['Float']['output'];
  conference?: Maybe<ConferenceDetails>;
  createdAt: Scalars['DateTime']['output'];
  declinedCount: Scalars['Float']['output'];
  description?: Maybe<Scalars['String']['output']>;
  endTime: Scalars['DateTime']['output'];
  eventNotes?: Maybe<Scalars['String']['output']>;
  excludedDates?: Maybe<Array<Scalars['DateTime']['output']>>;
  externalEventId?: Maybe<Scalars['String']['output']>;
  iCalData?: Maybe<Scalars['String']['output']>;
  iCalHtmlBody?: Maybe<Scalars['String']['output']>;
  iCalMeetingLink?: Maybe<Scalars['String']['output']>;
  iCalMethod?: Maybe<Scalars['String']['output']>;
  iCalOrganizerEmail?: Maybe<Scalars['String']['output']>;
  iCalOrganizerName?: Maybe<Scalars['String']['output']>;
  iCalRawEmail?: Maybe<Scalars['String']['output']>;
  iCalReceivedAt?: Maybe<Scalars['DateTime']['output']>;
  iCalResponseDate?: Maybe<Scalars['DateTime']['output']>;
  iCalResponseStatus?: Maybe<Scalars['String']['output']>;
  iCalSequence?: Maybe<Scalars['Float']['output']>;
  iCalUID?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  importedFrom?: Maybe<Scalars['String']['output']>;
  isAllDay: Scalars['Boolean']['output'];
  isCancelled: Scalars['Boolean']['output'];
  isInboundICalInvite: Scalars['Boolean']['output'];
  isPrivate: Scalars['Boolean']['output'];
  isRecurring: Scalars['Boolean']['output'];
  lastModifiedAt?: Maybe<Scalars['DateTime']['output']>;
  lastModifiedBy?: Maybe<Scalars['String']['output']>;
  location?: Maybe<EventLocation>;
  metadata?: Maybe<Scalars['JSONObject']['output']>;
  moduleData?: Maybe<Scalars['JSONObject']['output']>;
  moduleRefId?: Maybe<Scalars['String']['output']>;
  moduleType?: Maybe<Scalars['String']['output']>;
  noResponseCount: Scalars['Float']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  organizerEmail?: Maybe<Scalars['String']['output']>;
  organizerId: Scalars['String']['output'];
  organizerName?: Maybe<Scalars['String']['output']>;
  originalStartTime?: Maybe<Scalars['DateTime']['output']>;
  recurrence?: Maybe<RecurrenceRule>;
  recurringEventId?: Maybe<Scalars['String']['output']>;
  reminders: Array<EventReminder>;
  remindersEnabled: Scalars['Boolean']['output'];
  sequence?: Maybe<Scalars['Float']['output']>;
  startTime: Scalars['DateTime']['output'];
  status: EventStatus;
  taskProgressPercentage: Scalars['Float']['output'];
  tenantId: Scalars['String']['output'];
  tentativeCount: Scalars['Float']['output'];
  timezone?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  totalTasks: Scalars['Float']['output'];
  type: EventType;
  uid?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  visibility: EventVisibility;
};

export type CalendarEventInput = {
  attachments?: InputMaybe<Array<EventAttachmentInput>>;
  attendees?: InputMaybe<Array<EventAttendeeInput>>;
  calendarId: Scalars['String']['input'];
  categories?: InputMaybe<Array<Scalars['String']['input']>>;
  color?: InputMaybe<Scalars['String']['input']>;
  conference?: InputMaybe<ConferenceDetailsInput>;
  description?: InputMaybe<Scalars['String']['input']>;
  endTime: Scalars['DateTime']['input'];
  eventNotes?: InputMaybe<Scalars['String']['input']>;
  isAllDay?: InputMaybe<Scalars['Boolean']['input']>;
  isRecurring?: InputMaybe<Scalars['Boolean']['input']>;
  location?: InputMaybe<EventLocationInput>;
  metadata?: InputMaybe<Scalars['JSONObject']['input']>;
  moduleRefId?: InputMaybe<Scalars['String']['input']>;
  moduleType?: InputMaybe<Scalars['String']['input']>;
  recurrence?: InputMaybe<RecurrenceRuleInput>;
  reminders?: InputMaybe<Array<EventReminderInput>>;
  startTime: Scalars['DateTime']['input'];
  status?: InputMaybe<EventStatus>;
  timezone?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
  type?: InputMaybe<EventType>;
  visibility?: InputMaybe<EventVisibility>;
};

export type CalendarEventTask = {
  __typename?: 'CalendarEventTask';
  assignedTo?: Maybe<Scalars['String']['output']>;
  calendarEventId: Scalars['String']['output'];
  checklistItems: Array<CalendarEventTaskChecklistItem>;
  completed: Scalars['Boolean']['output'];
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  completedBy?: Maybe<Scalars['String']['output']>;
  completedChecklistItems: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  dueDate?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  order: Scalars['Float']['output'];
  progressPercentage: Scalars['Float']['output'];
  status: CalendarEventTaskStatus;
  tenantId: Scalars['String']['output'];
  title: Scalars['String']['output'];
  totalChecklistItems: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type CalendarEventTaskChecklistItem = {
  __typename?: 'CalendarEventTaskChecklistItem';
  completed: Scalars['Boolean']['output'];
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  completedBy?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  order: Scalars['Float']['output'];
  title: Scalars['String']['output'];
};

export type CalendarEventTaskChecklistItemInput = {
  completed?: InputMaybe<Scalars['Boolean']['input']>;
  completedAt?: InputMaybe<Scalars['DateTime']['input']>;
  completedBy?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Float']['input']>;
  title: Scalars['String']['input'];
};

export type CalendarEventTaskInput = {
  assignedTo?: InputMaybe<Scalars['String']['input']>;
  calendarEventId: Scalars['String']['input'];
  checklistItems?: InputMaybe<Array<CalendarEventTaskChecklistItemInput>>;
  completed?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['DateTime']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Float']['input']>;
  status?: InputMaybe<CalendarEventTaskStatus>;
  title: Scalars['String']['input'];
};

/** Status of a calendar event task */
export enum CalendarEventTaskStatus {
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  InProgress = 'IN_PROGRESS',
  NotStarted = 'NOT_STARTED'
}

export type CalendarGoal = {
  __typename?: 'CalendarGoal';
  assignedTo?: Maybe<Scalars['String']['output']>;
  calendarId: Scalars['String']['output'];
  category: GoalCategory;
  checkpoints: Array<CalendarGoalCheckpoint>;
  color?: Maybe<Scalars['String']['output']>;
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  completedBy?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  currentNumericValue?: Maybe<Scalars['Float']['output']>;
  currentValue?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  displayOrder: Scalars['Float']['output'];
  endDate: Scalars['DateTime']['output'];
  hasSubGoals: Scalars['Boolean']['output'];
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isArchived: Scalars['Boolean']['output'];
  kpiMetric?: Maybe<Scalars['String']['output']>;
  kpiUnit?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  ownerId: Scalars['String']['output'];
  parentGoalId?: Maybe<Scalars['String']['output']>;
  period: GoalPeriod;
  progressPercentage: Scalars['Float']['output'];
  startDate: Scalars['DateTime']['output'];
  status: GoalStatus;
  tags?: Maybe<Array<Scalars['String']['output']>>;
  targetNumericValue?: Maybe<Scalars['Float']['output']>;
  targetValue?: Maybe<Scalars['String']['output']>;
  teamMembers?: Maybe<Array<Scalars['String']['output']>>;
  tenantId: Scalars['String']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type CalendarGoalCheckpoint = {
  __typename?: 'CalendarGoalCheckpoint';
  assignedTo?: Maybe<Scalars['String']['output']>;
  completed: Scalars['Boolean']['output'];
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  completedBy?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  dueDate?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['String']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  order: Scalars['Float']['output'];
  title: Scalars['String']['output'];
  weight?: Maybe<Scalars['Float']['output']>;
};

export type CalendarGoalCheckpointInput = {
  assignedTo?: InputMaybe<Scalars['String']['input']>;
  completed?: InputMaybe<Scalars['Boolean']['input']>;
  completedAt?: InputMaybe<Scalars['DateTime']['input']>;
  completedBy?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['DateTime']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Float']['input']>;
  title: Scalars['String']['input'];
  weight?: InputMaybe<Scalars['Float']['input']>;
};

export type CalendarGoalInput = {
  assignedTo?: InputMaybe<Scalars['String']['input']>;
  calendarId: Scalars['String']['input'];
  category?: InputMaybe<GoalCategory>;
  checkpoints?: InputMaybe<Array<CalendarGoalCheckpointInput>>;
  color?: InputMaybe<Scalars['String']['input']>;
  currentNumericValue?: InputMaybe<Scalars['Float']['input']>;
  currentValue?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  displayOrder?: InputMaybe<Scalars['Float']['input']>;
  endDate: Scalars['DateTime']['input'];
  icon?: InputMaybe<Scalars['String']['input']>;
  kpiMetric?: InputMaybe<Scalars['String']['input']>;
  kpiUnit?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  parentGoalId?: InputMaybe<Scalars['String']['input']>;
  period?: InputMaybe<GoalPeriod>;
  progressPercentage?: InputMaybe<Scalars['Float']['input']>;
  startDate: Scalars['DateTime']['input'];
  status?: InputMaybe<GoalStatus>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  targetNumericValue?: InputMaybe<Scalars['Float']['input']>;
  targetValue?: InputMaybe<Scalars['String']['input']>;
  teamMembers?: InputMaybe<Array<Scalars['String']['input']>>;
  title: Scalars['String']['input'];
};

export type CalendarInvitation = {
  __typename?: 'CalendarInvitation';
  acceptedAt?: Maybe<Scalars['DateTime']['output']>;
  calendarId: Scalars['String']['output'];
  calendarName: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  declinedAt?: Maybe<Scalars['DateTime']['output']>;
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  invitationToken: Scalars['String']['output'];
  invitationType: InvitationType;
  invitedBy: Scalars['String']['output'];
  invitedByName: Scalars['String']['output'];
  lastReminderSentAt?: Maybe<Scalars['DateTime']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  notificationSent: Scalars['Boolean']['output'];
  permissions: Array<CalendarPermission>;
  recipientClientId?: Maybe<Scalars['String']['output']>;
  recipientEmail?: Maybe<Scalars['String']['output']>;
  recipientPhone?: Maybe<Scalars['String']['output']>;
  reminderCount: Scalars['Float']['output'];
  shareLink?: Maybe<Scalars['String']['output']>;
  status: InvitationStatus;
  tenantId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

/** Calendar access permissions */
export enum CalendarPermission {
  Admin = 'ADMIN',
  Create = 'CREATE',
  Delete = 'DELETE',
  Edit = 'EDIT',
  Share = 'SHARE',
  View = 'VIEW'
}

export type CalendarSettings = {
  __typename?: 'CalendarSettings';
  allowExternalInvites?: Maybe<Scalars['Boolean']['output']>;
  autoAcceptInvites?: Maybe<Scalars['Boolean']['output']>;
  defaultEventDuration?: Maybe<Scalars['String']['output']>;
  defaultReminderMinutes?: Maybe<Scalars['Float']['output']>;
  defaultView?: Maybe<Scalars['String']['output']>;
  emailNotifications?: Maybe<Scalars['Boolean']['output']>;
  showWeekNumbers?: Maybe<Scalars['Boolean']['output']>;
  smsNotifications?: Maybe<Scalars['Boolean']['output']>;
  timezone?: Maybe<Scalars['String']['output']>;
  workingDays?: Maybe<Array<Scalars['String']['output']>>;
  workingHoursEnd?: Maybe<Scalars['String']['output']>;
  workingHoursStart?: Maybe<Scalars['String']['output']>;
};

export type CalendarSettingsInput = {
  allowExternalInvites?: InputMaybe<Scalars['Boolean']['input']>;
  autoAcceptInvites?: InputMaybe<Scalars['Boolean']['input']>;
  defaultEventDuration?: InputMaybe<Scalars['String']['input']>;
  defaultReminderMinutes?: InputMaybe<Scalars['Float']['input']>;
  defaultView?: InputMaybe<Scalars['String']['input']>;
  emailNotifications?: InputMaybe<Scalars['Boolean']['input']>;
  showWeekNumbers?: InputMaybe<Scalars['Boolean']['input']>;
  smsNotifications?: InputMaybe<Scalars['Boolean']['input']>;
  timezone?: InputMaybe<Scalars['String']['input']>;
  workingDays?: InputMaybe<Array<Scalars['String']['input']>>;
  workingHoursEnd?: InputMaybe<Scalars['String']['input']>;
  workingHoursStart?: InputMaybe<Scalars['String']['input']>;
};

export type CalendarSyncInfo = {
  __typename?: 'CalendarSyncInfo';
  externalCalendarId?: Maybe<Scalars['String']['output']>;
  lastSyncAt?: Maybe<Scalars['DateTime']['output']>;
  provider?: Maybe<Scalars['String']['output']>;
  syncDirection?: Maybe<Scalars['String']['output']>;
  syncEnabled?: Maybe<Scalars['Boolean']['output']>;
  syncToken?: Maybe<Scalars['String']['output']>;
  webhookUrl?: Maybe<Scalars['String']['output']>;
};

export type CalendarSyncInfoInput = {
  externalCalendarId?: InputMaybe<Scalars['String']['input']>;
  provider?: InputMaybe<Scalars['String']['input']>;
  syncDirection?: InputMaybe<Scalars['String']['input']>;
  syncEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  webhookUrl?: InputMaybe<Scalars['String']['input']>;
};

export type CalendarTag = {
  __typename?: 'CalendarTag';
  calendarId: Scalars['String']['output'];
  color: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  usageCount: Scalars['Float']['output'];
};

export type CalendarTagInput = {
  color: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

/** Types of calendars in the system */
export enum CalendarType {
  Business = 'BUSINESS',
  Company = 'COMPANY',
  Custom = 'CUSTOM',
  Email = 'EMAIL',
  Employee = 'EMPLOYEE',
  Personal = 'PERSONAL',
  Project = 'PROJECT',
  Resource = 'RESOURCE',
  SharedExternal = 'SHARED_EXTERNAL'
}

/** Calendar visibility levels */
export enum CalendarVisibility {
  Company = 'COMPANY',
  Private = 'PRIVATE',
  Public = 'PUBLIC',
  Shared = 'SHARED',
  Team = 'TEAM'
}

/** The direction of the call */
export enum CallDirection {
  Both = 'BOTH',
  Inbound = 'INBOUND',
  Outbound = 'OUTBOUND'
}

export type CallRecording = {
  __typename?: 'CallRecording';
  callSid: Scalars['String']['output'];
  cost: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  direction: CallDirection;
  duration: Scalars['Float']['output'];
  errorMessage?: Maybe<Scalars['String']['output']>;
  from: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  localFilePath?: Maybe<Scalars['String']['output']>;
  phoneNumber?: Maybe<TwilioPhoneNumber>;
  phoneNumberId: Scalars['ID']['output'];
  pinataUrl?: Maybe<Scalars['String']['output']>;
  recordedAt: Scalars['DateTime']['output'];
  recordingSid: Scalars['String']['output'];
  recordingUrl: Scalars['String']['output'];
  source?: Maybe<CallSource>;
  status: RecordingStatus;
  tenantId: Scalars['String']['output'];
  to: Scalars['String']['output'];
  transcribedAt?: Maybe<Scalars['DateTime']['output']>;
  transcriptionConfidence?: Maybe<Scalars['Float']['output']>;
  transcriptionStatus: TranscriptionStatus;
  transcriptionText?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type CallRecordingConnection = {
  __typename?: 'CallRecordingConnection';
  items: Array<CallRecording>;
  pageInfo: PageInfo;
  totalCount: Scalars['Float']['output'];
};

export type CallRecordingFilterInput = {
  direction?: InputMaybe<CallDirection>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  from?: InputMaybe<Scalars['String']['input']>;
  phoneNumberId?: InputMaybe<Scalars['ID']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  status?: InputMaybe<RecordingStatus>;
  to?: InputMaybe<Scalars['String']['input']>;
  transcriptionStatus?: InputMaybe<TranscriptionStatus>;
};

/** The source of the call (phone device, browser, or webhook) */
export enum CallSource {
  Browser = 'BROWSER',
  Phone = 'PHONE',
  Webhook = 'WEBHOOK'
}

export type CardDetails = {
  __typename?: 'CardDetails';
  brand?: Maybe<Scalars['String']['output']>;
  expMonth?: Maybe<Scalars['Float']['output']>;
  expYear?: Maybe<Scalars['Float']['output']>;
  fingerprint?: Maybe<Scalars['String']['output']>;
  last4?: Maybe<Scalars['String']['output']>;
};

export type CardDetailsInput = {
  brand?: InputMaybe<Scalars['String']['input']>;
  expMonth?: InputMaybe<Scalars['Float']['input']>;
  expYear?: InputMaybe<Scalars['Float']['input']>;
  fingerprint?: InputMaybe<Scalars['String']['input']>;
  last4?: InputMaybe<Scalars['String']['input']>;
};

export type Cart = {
  __typename?: 'Cart';
  client: Client;
  createdAt: Scalars['DateTime']['output'];
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  items: Array<CartItem>;
  tenantId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type CartItem = {
  __typename?: 'CartItem';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  product: Product;
  quantity: Scalars['Float']['output'];
  selectedVariantId?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type CartItemInput = {
  productId: Scalars['ID']['input'];
  quantity: Scalars['Float']['input'];
  selectedVariantId?: InputMaybe<Scalars['String']['input']>;
};

export type Client = {
  __typename?: 'Client';
  billingAddresses: Array<ClientShippingDetails>;
  businessName?: Maybe<Scalars['String']['output']>;
  businessRegistrationNumber?: Maybe<Scalars['String']['output']>;
  cellcastId?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email?: Maybe<Scalars['String']['output']>;
  encryptedSignatureIpfsUrl?: Maybe<Scalars['String']['output']>;
  fName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isVerifiedSeller?: Maybe<Scalars['Boolean']['output']>;
  lName?: Maybe<Scalars['String']['output']>;
  opportunityCount?: Maybe<Scalars['Float']['output']>;
  paymentReceivingDetails?: Maybe<PaymentReceivingDetails>;
  permissions?: Maybe<Array<ClientPermission>>;
  personalCalendarId?: Maybe<Scalars['String']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  profilePhoto?: Maybe<Scalars['String']['output']>;
  role?: Maybe<ClientRole>;
  shippingAddresses: Array<ClientShippingDetails>;
  tags?: Maybe<Array<Scalars['String']['output']>>;
  tenantId: Scalars['String']['output'];
  totalOpportunityValue?: Maybe<Scalars['Float']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  websites?: Maybe<Array<Scalars['String']['output']>>;
};

export type ClientAddress = {
  __typename?: 'ClientAddress';
  city: Scalars['String']['output'];
  country: Scalars['String']['output'];
  postcode: Scalars['String']['output'];
  state: Scalars['String']['output'];
  street: Scalars['String']['output'];
};

export type ClientAddressInput = {
  city: Scalars['String']['input'];
  country: Scalars['String']['input'];
  postcode: Scalars['String']['input'];
  state: Scalars['String']['input'];
  street: Scalars['String']['input'];
};

export type ClientBillingDetailsInput = {
  address: ClientAddressInput;
  companyName?: InputMaybe<Scalars['String']['input']>;
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  taxId?: InputMaybe<Scalars['String']['input']>;
  vatNumber?: InputMaybe<Scalars['String']['input']>;
};

export type ClientInput = {
  billingAddresses?: InputMaybe<Array<ClientBillingDetailsInput>>;
  businessName?: InputMaybe<Scalars['String']['input']>;
  businessRegistrationNumber?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['DateTime']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  encryptedSignatureIpfsUrl?: InputMaybe<Scalars['String']['input']>;
  fName?: InputMaybe<Scalars['String']['input']>;
  lName?: InputMaybe<Scalars['String']['input']>;
  paymentReceivingDetails?: InputMaybe<PaymentReceivingDetailsInput>;
  permissions?: InputMaybe<Array<ClientPermission>>;
  personalCalendarId?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  profilePhoto?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<ClientRole>;
  shippingAddresses?: InputMaybe<Array<ClientShippingDetailsInput>>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  tenantId?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['DateTime']['input']>;
  websites?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** Available permissions for clients */
export enum ClientPermission {
  AddressBookAdmin = 'ADDRESS_BOOK_ADMIN',
  AddressBookUser = 'ADDRESS_BOOK_USER',
  Admin = 'ADMIN',
  AdminDashboard = 'ADMIN_DASHBOARD',
  AssetAdmin = 'ASSET_ADMIN',
  AssetManager = 'ASSET_MANAGER',
  AssetViewer = 'ASSET_VIEWER',
  BillsAdmin = 'BILLS_ADMIN',
  BillsUser = 'BILLS_USER',
  CalendarAccountsAdmin = 'CALENDAR_ACCOUNTS_ADMIN',
  CalendarAdmin = 'CALENDAR_ADMIN',
  CalendarManager = 'CALENDAR_MANAGER',
  CalendarUser = 'CALENDAR_USER',
  CalendarViewer = 'CALENDAR_VIEWER',
  Client = 'CLIENT',
  ClientPermissionsManagement = 'CLIENT_PERMISSIONS_MANAGEMENT',
  CompanyAdmin = 'COMPANY_ADMIN',
  CompanyKnowledgeAdmin = 'COMPANY_KNOWLEDGE_ADMIN',
  CompanyKnowledgeAuthor = 'COMPANY_KNOWLEDGE_AUTHOR',
  CompanyKnowledgeEditor = 'COMPANY_KNOWLEDGE_EDITOR',
  CompanyKnowledgeViewer = 'COMPANY_KNOWLEDGE_VIEWER',
  CompanyManager = 'COMPANY_MANAGER',
  CompanyViewer = 'COMPANY_VIEWER',
  EmailAdmin = 'EMAIL_ADMIN',
  EmailInboxAdmin = 'EMAIL_INBOX_ADMIN',
  EmailUser = 'EMAIL_USER',
  Employee = 'EMPLOYEE',
  EmployeeAdmin = 'EMPLOYEE_ADMIN',
  EmployeeManager = 'EMPLOYEE_MANAGER',
  EmployeeViewer = 'EMPLOYEE_VIEWER',
  FrontendUpgradesAdmin = 'FRONTEND_UPGRADES_ADMIN',
  IpfsAdmin = 'IPFS_ADMIN',
  IpfsUser = 'IPFS_USER',
  MeetingSummarizerAdmin = 'MEETING_SUMMARIZER_ADMIN',
  MeetingSummarizerUser = 'MEETING_SUMMARIZER_USER',
  OpportunitiesAdmin = 'OPPORTUNITIES_ADMIN',
  PasswordAdmin = 'PASSWORD_ADMIN',
  PasswordUser = 'PASSWORD_USER',
  PhoneSystemAdmin = 'PHONE_SYSTEM_ADMIN',
  PhoneSystemMaster = 'PHONE_SYSTEM_MASTER',
  PhoneSystemUser = 'PHONE_SYSTEM_USER',
  Practitioner = 'PRACTITIONER',
  ProjectsAdmin = 'PROJECTS_ADMIN',
  ProposalsAdmin = 'PROPOSALS_ADMIN',
  ProposalsCreate = 'PROPOSALS_CREATE',
  ProposalsView = 'PROPOSALS_VIEW',
  Seller = 'SELLER',
  TenantAdmin = 'TENANT_ADMIN',
  TenantMasterAdmin = 'TENANT_MASTER_ADMIN',
  TenantUser = 'TENANT_USER',
  TranscriptionAdmin = 'TRANSCRIPTION_ADMIN',
  TranscriptionUser = 'TRANSCRIPTION_USER',
  User = 'USER',
  VapiAdmin = 'VAPI_ADMIN',
  VapiUser = 'VAPI_USER'
}

/** The role of the client in the system */
export enum ClientRole {
  Both = 'BOTH',
  Buyer = 'BUYER',
  Seller = 'SELLER'
}

export type ClientShippingDetails = {
  __typename?: 'ClientShippingDetails';
  address: ClientAddress;
  instructions?: Maybe<Scalars['String']['output']>;
  isDefault: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  phone: Scalars['String']['output'];
};

export type ClientShippingDetailsInput = {
  address: ClientAddressInput;
  instructions?: InputMaybe<Scalars['String']['input']>;
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  phone: Scalars['String']['input'];
};

export type CommissionSplit = {
  __typename?: 'CommissionSplit';
  notes?: Maybe<Scalars['String']['output']>;
  paymentType: Scalars['String']['output'];
  payoutDate?: Maybe<Scalars['DateTime']['output']>;
  payoutDelayDays?: Maybe<Scalars['Int']['output']>;
  percentage: Scalars['Float']['output'];
};

export type CommissionSplitInput = {
  notes?: InputMaybe<Scalars['String']['input']>;
  paymentType: Scalars['String']['input'];
  payoutDate?: InputMaybe<Scalars['DateTime']['input']>;
  payoutDelayDays?: InputMaybe<Scalars['Int']['input']>;
  percentage: Scalars['Float']['input'];
};

export type CommunicationTask = {
  __typename?: 'CommunicationTask';
  assignedTo?: Maybe<Array<Client>>;
  communicationId?: Maybe<Scalars['ID']['output']>;
  communicationType: CommunicationType;
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  completedBy?: Maybe<Client>;
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<Client>;
  description?: Maybe<Scalars['String']['output']>;
  dueDate?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  isArchived: Scalars['Boolean']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  order: Scalars['Float']['output'];
  priority: CommunicationTaskPriority;
  status: CommunicationTaskStatus;
  tenantId: Scalars['String']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type CommunicationTaskInput = {
  assignedTo?: InputMaybe<Array<Scalars['ID']['input']>>;
  communicationId?: InputMaybe<Scalars['ID']['input']>;
  communicationType: CommunicationType;
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['DateTime']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Float']['input']>;
  priority?: InputMaybe<CommunicationTaskPriority>;
  status?: InputMaybe<CommunicationTaskStatus>;
  title: Scalars['String']['input'];
};

/** The priority level of a communication task */
export enum CommunicationTaskPriority {
  High = 'HIGH',
  Low = 'LOW',
  Medium = 'MEDIUM',
  Urgent = 'URGENT'
}

/** The status of a communication task */
export enum CommunicationTaskStatus {
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  InProgress = 'IN_PROGRESS',
  Todo = 'TODO'
}

/** The type of communication this task is associated with */
export enum CommunicationType {
  InboundEmail = 'INBOUND_EMAIL',
  Meeting = 'MEETING',
  Other = 'OTHER',
  OutboundEmail = 'OUTBOUND_EMAIL',
  PhoneCall = 'PHONE_CALL',
  Sms = 'SMS'
}

export type Company = {
  __typename?: 'Company';
  abn?: Maybe<Scalars['String']['output']>;
  accountManager?: Maybe<Client>;
  acn?: Maybe<Scalars['String']['output']>;
  annualRevenue?: Maybe<Scalars['Float']['output']>;
  assetCount: Scalars['Float']['output'];
  assets?: Maybe<Array<Scalars['String']['output']>>;
  billingEmail?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email?: Maybe<Scalars['String']['output']>;
  employeeCount: Scalars['Float']['output'];
  employeeDetails: Array<Client>;
  employees?: Maybe<Array<Scalars['String']['output']>>;
  establishedDate?: Maybe<Scalars['DateTime']['output']>;
  fax?: Maybe<Scalars['String']['output']>;
  financialYearEnd?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  industry?: Maybe<Scalars['String']['output']>;
  isActive: Scalars['Boolean']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  numberOfEmployees?: Maybe<Scalars['Float']['output']>;
  passwordCount: Scalars['Float']['output'];
  passwords?: Maybe<Array<Scalars['String']['output']>>;
  phone?: Maybe<Scalars['String']['output']>;
  physicalAddress?: Maybe<CompanyAddress>;
  postalAddress?: Maybe<CompanyAddress>;
  primaryContact?: Maybe<CompanyContact>;
  status: CompanyStatus;
  tags?: Maybe<Array<Scalars['String']['output']>>;
  taxNumber?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['String']['output'];
  tradingName?: Maybe<Scalars['String']['output']>;
  type?: Maybe<CompanyType>;
  updatedAt: Scalars['DateTime']['output'];
  website?: Maybe<Scalars['String']['output']>;
};

export type CompanyAddress = {
  __typename?: 'CompanyAddress';
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  postcode?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  street?: Maybe<Scalars['String']['output']>;
};

export type CompanyAddressInput = {
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  postcode?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  street?: InputMaybe<Scalars['String']['input']>;
};

export type CompanyContact = {
  __typename?: 'CompanyContact';
  email?: Maybe<Scalars['String']['output']>;
  mobile?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  position?: Maybe<Scalars['String']['output']>;
};

export type CompanyContactInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  mobile?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['String']['input']>;
};

export type CompanyInput = {
  abn?: InputMaybe<Scalars['String']['input']>;
  accountManager?: InputMaybe<Scalars['ID']['input']>;
  acn?: InputMaybe<Scalars['String']['input']>;
  annualRevenue?: InputMaybe<Scalars['Float']['input']>;
  billingEmail?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  employees?: InputMaybe<Array<Scalars['ID']['input']>>;
  establishedDate?: InputMaybe<Scalars['DateTime']['input']>;
  fax?: InputMaybe<Scalars['String']['input']>;
  financialYearEnd?: InputMaybe<Scalars['String']['input']>;
  industry?: InputMaybe<Scalars['String']['input']>;
  logo?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  numberOfEmployees?: InputMaybe<Scalars['Float']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  physicalAddress?: InputMaybe<CompanyAddressInput>;
  postalAddress?: InputMaybe<CompanyAddressInput>;
  primaryContact?: InputMaybe<CompanyContactInput>;
  status?: InputMaybe<CompanyStatus>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  taxNumber?: InputMaybe<Scalars['String']['input']>;
  tradingName?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<CompanyType>;
  website?: InputMaybe<Scalars['String']['input']>;
};

export type CompanyKnowledge = {
  __typename?: 'CompanyKnowledge';
  allowPublicAccess: Scalars['Boolean']['output'];
  authorId?: Maybe<Scalars['String']['output']>;
  category?: Maybe<Scalars['String']['output']>;
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  embeddedImages?: Maybe<Array<EmbeddedImage>>;
  embeddedVideos?: Maybe<Array<EmbeddedVideo>>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isPinned: Scalars['Boolean']['output'];
  isPublished: Scalars['Boolean']['output'];
  lastViewedAt?: Maybe<Scalars['DateTime']['output']>;
  metaDescription?: Maybe<Scalars['String']['output']>;
  metaKeywords?: Maybe<Array<Scalars['String']['output']>>;
  publicSlug?: Maybe<Scalars['String']['output']>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  relatedArticleIds?: Maybe<Array<Scalars['String']['output']>>;
  shareToken?: Maybe<Scalars['String']['output']>;
  tags?: Maybe<Array<Scalars['String']['output']>>;
  tenantId: Scalars['String']['output'];
  title: Scalars['String']['output'];
  unpublishedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  viewCount: Scalars['Float']['output'];
  visibility: ArticleVisibility;
};

export type CompanyKnowledgeInput = {
  allowPublicAccess?: InputMaybe<Scalars['Boolean']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  content: Scalars['String']['input'];
  embeddedImages?: InputMaybe<Array<EmbeddedImageInput>>;
  embeddedVideos?: InputMaybe<Array<EmbeddedVideoInput>>;
  isPinned?: InputMaybe<Scalars['Boolean']['input']>;
  isPublished?: InputMaybe<Scalars['Boolean']['input']>;
  metaDescription?: InputMaybe<Scalars['String']['input']>;
  metaKeywords?: InputMaybe<Array<Scalars['String']['input']>>;
  publicSlug?: InputMaybe<Scalars['String']['input']>;
  relatedArticleIds?: InputMaybe<Array<Scalars['String']['input']>>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title: Scalars['String']['input'];
  visibility?: InputMaybe<ArticleVisibility>;
};

/** The current status of the company */
export enum CompanyStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Pending = 'PENDING',
  Suspended = 'SUSPENDED'
}

/** The type of company or organization */
export enum CompanyType {
  Corporation = 'CORPORATION',
  Government = 'GOVERNMENT',
  NonProfit = 'NON_PROFIT',
  Other = 'OTHER',
  Partnership = 'PARTNERSHIP',
  SoleTrader = 'SOLE_TRADER',
  Trust = 'TRUST'
}

export type ConferenceDetails = {
  __typename?: 'ConferenceDetails';
  dialIn?: Maybe<Scalars['String']['output']>;
  instructions?: Maybe<Scalars['String']['output']>;
  meetingId?: Maybe<Scalars['String']['output']>;
  passcode?: Maybe<Scalars['String']['output']>;
  provider?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type ConferenceDetailsInput = {
  dialIn?: InputMaybe<Scalars['String']['input']>;
  instructions?: InputMaybe<Scalars['String']['input']>;
  meetingId?: InputMaybe<Scalars['String']['input']>;
  passcode?: InputMaybe<Scalars['String']['input']>;
  provider?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type ContactFormSubmission = {
  __typename?: 'ContactFormSubmission';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  ipAddress?: Maybe<Scalars['String']['output']>;
  lastName: Scalars['String']['output'];
  message: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userAgent?: Maybe<Scalars['String']['output']>;
};

export type ContactInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  phoneNumber: Scalars['String']['input'];
};

/** How digital content is unlocked for the user */
export enum ContentAccessType {
  AchievementBased = 'ACHIEVEMENT_BASED',
  AllAtOnce = 'ALL_AT_ONCE',
  Sequential = 'SEQUENTIAL'
}

/** Content niches for influencers */
export enum ContentNiche {
  Culture = 'CULTURE',
  Economics = 'ECONOMICS',
  Education = 'EDUCATION',
  Environment = 'ENVIRONMENT',
  HealthWellness = 'HEALTH_WELLNESS',
  HumanRights = 'HUMAN_RIGHTS',
  InternationalRelations = 'INTERNATIONAL_RELATIONS',
  Other = 'OTHER',
  PeaceAdvocacy = 'PEACE_ADVOCACY',
  Philosophy = 'PHILOSOPHY',
  Politics = 'POLITICS',
  SocialJustice = 'SOCIAL_JUSTICE',
  Technology = 'TECHNOLOGY'
}

export type CreateBusinessCalendarAvailabilityInput = {
  blockedDates?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  calendarId: Scalars['String']['input'];
  extraAvailableDates?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  slots: Array<BusinessCalendarAvailabilitySlotInput>;
  timezone?: InputMaybe<Scalars['String']['input']>;
};

export type CreateBusinessCalendarBookableEventTypeInput = {
  autoGenerateMeetingLink?: InputMaybe<Scalars['Boolean']['input']>;
  bufferAfterMinutes?: InputMaybe<Scalars['Float']['input']>;
  bufferBeforeMinutes?: InputMaybe<Scalars['Float']['input']>;
  calendarId: Scalars['String']['input'];
  color?: InputMaybe<Scalars['String']['input']>;
  confirmationMessage?: InputMaybe<Scalars['String']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  displayOrder?: InputMaybe<Scalars['Float']['input']>;
  durationMinutes: Scalars['Float']['input'];
  icon?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isPaid?: InputMaybe<Scalars['Boolean']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  locationType?: InputMaybe<Scalars['String']['input']>;
  maxBookingsPerDay?: InputMaybe<Scalars['Float']['input']>;
  maxFutureDays?: InputMaybe<Scalars['Float']['input']>;
  meetingLink?: InputMaybe<Scalars['String']['input']>;
  minNoticeHours?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
  price?: InputMaybe<Scalars['Float']['input']>;
  questions?: InputMaybe<Array<BusinessCalendarBookingQuestionInput>>;
  reminderHoursBefore?: InputMaybe<Scalars['Float']['input']>;
  stripePriceId?: InputMaybe<Scalars['String']['input']>;
};

export type CreateEmailAddressWithAliasInput = {
  alias: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

export type CreateFarmerInput = {
  aboutSection?: InputMaybe<FarmerAboutSectionInput>;
  allowedEditors?: InputMaybe<Array<Scalars['String']['input']>>;
  branding?: InputMaybe<FarmerBrandingInput>;
  contactInfo?: InputMaybe<FarmerContactInfoInput>;
  enableBlog?: InputMaybe<Scalars['Boolean']['input']>;
  enableCSA?: InputMaybe<Scalars['Boolean']['input']>;
  enableNewsletter?: InputMaybe<Scalars['Boolean']['input']>;
  enableRecipes?: InputMaybe<Scalars['Boolean']['input']>;
  enableReviews?: InputMaybe<Scalars['Boolean']['input']>;
  featuredProducts?: InputMaybe<Array<FarmerProductShowcaseInput>>;
  heroSection?: InputMaybe<FarmerHeroSectionInput>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  seoSettings?: InputMaybe<FarmerSeoSettingsInput>;
  status?: InputMaybe<FarmerStatus>;
  urlSlug?: InputMaybe<Scalars['String']['input']>;
  valuePropositions?: InputMaybe<Array<FarmerValuePropositionInput>>;
};

export type CreateFrontendUpgradeInput = {
  appliedToTenants?: InputMaybe<Array<TenantUpgradeStatusInput>>;
  category: UpgradeCategory;
  description: Scalars['String']['input'];
  gitCommitUrls: Array<Scalars['String']['input']>;
  markdownDocumentation?: InputMaybe<Scalars['String']['input']>;
  originTenantId: Scalars['ID']['input'];
  originTenantName: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type CreateInfluencerBookingInput = {
  additionalNotes?: InputMaybe<Scalars['String']['input']>;
  bookingType: BookingType;
  budgetRange?: InputMaybe<Scalars['String']['input']>;
  contactEmail: Scalars['String']['input'];
  contactName: Scalars['String']['input'];
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  expectedDeliverables?: InputMaybe<Scalars['String']['input']>;
  influencerId: Scalars['String']['input'];
  organization?: InputMaybe<Scalars['String']['input']>;
  projectDescription: Scalars['String']['input'];
  projectTitle: Scalars['String']['input'];
  targetAudience?: InputMaybe<Scalars['String']['input']>;
  timeline?: InputMaybe<Scalars['String']['input']>;
  urgency?: InputMaybe<UrgencyLevel>;
};

export type CreatePersonalEmailInput = {
  alias: Scalars['String']['input'];
};

export type CreateProposalInput = {
  agreementMarkdown: Scalars['String']['input'];
  billId?: InputMaybe<Scalars['ID']['input']>;
  companyName: Scalars['String']['input'];
  customPagePath?: InputMaybe<Scalars['String']['input']>;
  draftBillId?: InputMaybe<Scalars['ID']['input']>;
  expiresAt?: InputMaybe<Scalars['DateTime']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['ID']['input']>;
  scheduledPayments?: InputMaybe<Array<ScheduledPaymentInput>>;
  slug: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type CreateProviderInput = {
  aboutStory?: InputMaybe<Scalars['String']['input']>;
  achievements: Array<Scalars['String']['input']>;
  allowedEditors: Array<Scalars['String']['input']>;
  availability?: InputMaybe<ProviderAvailabilityInput>;
  avatar?: InputMaybe<Scalars['String']['input']>;
  contactInfo?: InputMaybe<ProviderContactInfoInput>;
  description?: InputMaybe<Scalars['String']['input']>;
  education: Array<ProviderEducationInput>;
  experience: Array<ProviderExperienceInput>;
  expertise: Array<Scalars['String']['input']>;
  featuredProductIds: Array<Scalars['String']['input']>;
  heroImage?: InputMaybe<Scalars['String']['input']>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  portfolioUrl?: InputMaybe<Scalars['String']['input']>;
  roles: Array<ProviderRoleInput>;
  skills: Array<ProviderSkillInput>;
  status?: InputMaybe<ProviderStatus>;
  tagline?: InputMaybe<Scalars['String']['input']>;
  testimonials: Array<ProviderTestimonialInput>;
  title?: InputMaybe<Scalars['String']['input']>;
  urlSlug?: InputMaybe<Scalars['String']['input']>;
};

export type CreatePublicBookingInput = {
  answers?: InputMaybe<Scalars['JSONObject']['input']>;
  bookerEmail: Scalars['String']['input'];
  bookerName: Scalars['String']['input'];
  bookerPhone?: InputMaybe<Scalars['String']['input']>;
  bookerTimezone?: InputMaybe<Scalars['String']['input']>;
  calendarSlug: Scalars['String']['input'];
  eventTypeId: Scalars['String']['input'];
  startTime: Scalars['DateTime']['input'];
};

export type CryptoWalletDetails = {
  __typename?: 'CryptoWalletDetails';
  memo?: Maybe<Scalars['String']['output']>;
  network?: Maybe<Scalars['String']['output']>;
  walletAddress?: Maybe<Scalars['String']['output']>;
};

export type CryptoWalletDetailsInput = {
  memo?: InputMaybe<Scalars['String']['input']>;
  network?: InputMaybe<Scalars['String']['input']>;
  walletAddress?: InputMaybe<Scalars['String']['input']>;
};

export type DeleteEventResponse = {
  __typename?: 'DeleteEventResponse';
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type DeploymentResult = {
  __typename?: 'DeploymentResult';
  commitSha?: Maybe<Scalars['String']['output']>;
  error?: Maybe<Scalars['String']['output']>;
  repoName: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
  tenantId: Scalars['String']['output'];
  tenantName: Scalars['String']['output'];
};

export type DeploymentSummary = {
  __typename?: 'DeploymentSummary';
  deploymentResults: Array<ModuleDeploymentResult>;
  newModules: Array<Scalars['String']['output']>;
};

export type DigitalContentModule = {
  __typename?: 'DigitalContentModule';
  contentUrl?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  estimatedDuration?: Maybe<Scalars['Float']['output']>;
  moduleId: Scalars['String']['output'];
  prerequisites?: Maybe<Array<Scalars['String']['output']>>;
  sequence: Scalars['Float']['output'];
  title: Scalars['String']['output'];
};

export type DigitalContentModuleInput = {
  contentUrl?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  estimatedDuration?: InputMaybe<Scalars['Float']['input']>;
  moduleId: Scalars['String']['input'];
  prerequisites?: InputMaybe<Array<Scalars['String']['input']>>;
  sequence: Scalars['Float']['input'];
  title: Scalars['String']['input'];
};

export type DigitalContentProgress = {
  __typename?: 'DigitalContentProgress';
  achievements?: Maybe<Array<Scalars['String']['output']>>;
  completed: Scalars['Boolean']['output'];
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  lastAccessedUrl?: Maybe<Scalars['String']['output']>;
  moduleId: Scalars['String']['output'];
  progressPercentage?: Maybe<Scalars['Float']['output']>;
  startedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type DigitalContentProgressInput = {
  achievements?: InputMaybe<Array<Scalars['String']['input']>>;
  completed: Scalars['Boolean']['input'];
  completedAt?: InputMaybe<Scalars['DateTime']['input']>;
  lastAccessedUrl?: InputMaybe<Scalars['String']['input']>;
  moduleId: Scalars['String']['input'];
  progressPercentage?: InputMaybe<Scalars['Float']['input']>;
  startedAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type DigitalDeliveryTemplate = {
  __typename?: 'DigitalDeliveryTemplate';
  accessType: ContentAccessType;
  modules: Array<DigitalContentModule>;
  requiresCompletion: Scalars['Boolean']['output'];
  validityPeriod?: Maybe<Scalars['Float']['output']>;
};

export type DigitalDeliveryTemplateInput = {
  accessType: ContentAccessType;
  modules: Array<DigitalContentModuleInput>;
  requiresCompletion: Scalars['Boolean']['input'];
  validityPeriod?: InputMaybe<Scalars['Float']['input']>;
};

export type DigitalDeliveryTracking = {
  __typename?: 'DigitalDeliveryTracking';
  accessGrantedAt: Scalars['DateTime']['output'];
  completed: Scalars['Boolean']['output'];
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  moduleProgress: Array<DigitalContentProgress>;
  overallProgress: Scalars['Float']['output'];
};

export type DigitalDeliveryTrackingInput = {
  accessGrantedAt: Scalars['DateTime']['input'];
  completed: Scalars['Boolean']['input'];
  completedAt?: InputMaybe<Scalars['DateTime']['input']>;
  expiresAt?: InputMaybe<Scalars['DateTime']['input']>;
  moduleProgress: Array<DigitalContentProgressInput>;
  overallProgress: Scalars['Float']['input'];
};

export type Domain = {
  __typename?: 'Domain';
  authCode?: Maybe<Scalars['String']['output']>;
  autoRenew?: Maybe<Scalars['Boolean']['output']>;
  clientId?: Maybe<Scalars['ID']['output']>;
  createdAt: Scalars['DateTime']['output'];
  cryptoPaymentAddress?: Maybe<Scalars['String']['output']>;
  cryptoTransactionHash?: Maybe<Scalars['String']['output']>;
  domainName: Scalars['String']['output'];
  expiryDate: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  nameservers?: Maybe<Array<DomainNameserver>>;
  notes?: Maybe<Scalars['String']['output']>;
  paymentMethod?: Maybe<Scalars['String']['output']>;
  paymentStatus: DomainPaymentStatus;
  pricing: DomainPricing;
  privacyProtection?: Maybe<Scalars['Boolean']['output']>;
  registrarOrderId?: Maybe<Scalars['String']['output']>;
  registrationDate: Scalars['DateTime']['output'];
  status: DomainStatus;
  tenantId: Scalars['String']['output'];
  tld: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  years: Scalars['Float']['output'];
};

export type DomainAvailability = {
  __typename?: 'DomainAvailability';
  available: Scalars['Boolean']['output'];
  currency?: Maybe<Scalars['String']['output']>;
  domain: Scalars['String']['output'];
  premium?: Maybe<Scalars['Boolean']['output']>;
  price?: Maybe<Scalars['Float']['output']>;
};

export type DomainNameserver = {
  __typename?: 'DomainNameserver';
  hostname: Scalars['String']['output'];
  ip?: Maybe<Scalars['String']['output']>;
};

/** Payment status for domain registration */
export enum DomainPaymentStatus {
  Completed = 'COMPLETED',
  Failed = 'FAILED',
  Pending = 'PENDING',
  Refunded = 'REFUNDED'
}

export type DomainPricing = {
  __typename?: 'DomainPricing';
  currency: Scalars['String']['output'];
  registrationPrice: Scalars['Float']['output'];
  renewalPrice: Scalars['Float']['output'];
  transferPrice: Scalars['Float']['output'];
};

export type DomainRegisterInput = {
  autoRenew?: InputMaybe<Scalars['Boolean']['input']>;
  clientId: Scalars['ID']['input'];
  domainName: Scalars['String']['input'];
  nameservers?: InputMaybe<Array<Scalars['String']['input']>>;
  paymentMethod?: InputMaybe<Scalars['String']['input']>;
  privacyProtection?: InputMaybe<Scalars['Boolean']['input']>;
  years: Scalars['Float']['input'];
};

export type DomainRenewInput = {
  domainId: Scalars['ID']['input'];
  paymentMethod?: InputMaybe<Scalars['String']['input']>;
  years: Scalars['Float']['input'];
};

export type DomainSearchInput = {
  domainName: Scalars['String']['input'];
  tlds?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** Domain registration status */
export enum DomainStatus {
  Available = 'AVAILABLE',
  Expired = 'EXPIRED',
  Locked = 'LOCKED',
  Pending = 'PENDING',
  Registered = 'REGISTERED',
  Transferred = 'TRANSFERRED'
}

export type DomainTransferInput = {
  authCode: Scalars['String']['input'];
  clientId: Scalars['ID']['input'];
  domainName: Scalars['String']['input'];
  paymentMethod?: InputMaybe<Scalars['String']['input']>;
};

export type Email = {
  __typename?: 'Email';
  archivedAt?: Maybe<Scalars['DateTime']['output']>;
  assignedAt?: Maybe<Scalars['DateTime']['output']>;
  assignedBy?: Maybe<Scalars['String']['output']>;
  assignedClients?: Maybe<Array<Scalars['String']['output']>>;
  attachments?: Maybe<Array<OutboundEmailAttachment>>;
  bcc?: Maybe<Scalars['String']['output']>;
  bodyHtml: Scalars['String']['output'];
  bodyMarkdown: Scalars['String']['output'];
  cc?: Maybe<Scalars['String']['output']>;
  clicks?: Maybe<Scalars['Float']['output']>;
  createdAt: Scalars['DateTime']['output'];
  direction: EmailDirection;
  errorMessage?: Maybe<Scalars['String']['output']>;
  from: Scalars['String']['output'];
  fromEmailAddress?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  inReplyTo?: Maybe<Scalars['String']['output']>;
  isArchived: Scalars['Boolean']['output'];
  isAssigned: Scalars['Boolean']['output'];
  isRead: Scalars['Boolean']['output'];
  labels?: Maybe<Array<Scalars['String']['output']>>;
  messageId?: Maybe<Scalars['String']['output']>;
  opens?: Maybe<Scalars['Float']['output']>;
  readAt?: Maybe<Scalars['DateTime']['output']>;
  receivedAt?: Maybe<Scalars['DateTime']['output']>;
  replyTo?: Maybe<Scalars['String']['output']>;
  scheduledFor?: Maybe<Scalars['DateTime']['output']>;
  sentAt?: Maybe<Scalars['DateTime']['output']>;
  status: EmailStatus;
  subject: Scalars['String']['output'];
  tasks?: Maybe<Array<CommunicationTask>>;
  tenantId: Scalars['String']['output'];
  threadId?: Maybe<Scalars['String']['output']>;
  to: Scalars['String']['output'];
  toEmailAddress?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type EmailAddress = {
  __typename?: 'EmailAddress';
  acceptCalendarInvitesFromAnyone?: Maybe<Scalars['Boolean']['output']>;
  acceptedSenderEmailsForCalendarInvites?: Maybe<Array<Scalars['String']['output']>>;
  associatedClients?: Maybe<Array<Scalars['String']['output']>>;
  autoAcceptInvites: Scalars['Boolean']['output'];
  blockedDomainsForCalendarInvites?: Maybe<Array<Scalars['String']['output']>>;
  canReceiveMarketing: Scalars['Boolean']['output'];
  canReceiveTransactional: Scalars['Boolean']['output'];
  company?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  domain?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  emailsReceived: Scalars['Float']['output'];
  emailsSent: Scalars['Float']['output'];
  firstSeenAt?: Maybe<Scalars['DateTime']['output']>;
  forwardingProvider: ForwardingProvider;
  id: Scalars['ID']['output'];
  isBlocked: Scalars['Boolean']['output'];
  isRegisteredWithImprovMX: Scalars['Boolean']['output'];
  isVerified: Scalars['Boolean']['output'];
  lastSeenAt?: Maybe<Scalars['DateTime']['output']>;
  linkedCalendarIds?: Maybe<Array<Scalars['String']['output']>>;
  name?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  postmarkEndpoint?: Maybe<Scalars['String']['output']>;
  primaryCalendarId?: Maybe<Scalars['String']['output']>;
  tags?: Maybe<Array<Scalars['String']['output']>>;
  tenantId: Scalars['String']['output'];
  type: EmailAddressType;
  updatedAt: Scalars['DateTime']['output'];
};

export type EmailAddressInfo = {
  __typename?: 'EmailAddressInfo';
  displayName: Scalars['String']['output'];
  email: Scalars['String']['output'];
  isDefault?: Maybe<Scalars['Boolean']['output']>;
  recordId?: Maybe<Scalars['String']['output']>;
  totalCount: Scalars['Int']['output'];
  type: Scalars['String']['output'];
  unreadCount: Scalars['Int']['output'];
};

export type EmailAddressInput = {
  acceptCalendarInvitesFromAnyone?: InputMaybe<Scalars['Boolean']['input']>;
  acceptedSenderEmailsForCalendarInvites?: InputMaybe<Array<Scalars['String']['input']>>;
  associatedClients?: InputMaybe<Array<Scalars['String']['input']>>;
  blockedDomainsForCalendarInvites?: InputMaybe<Array<Scalars['String']['input']>>;
  canReceiveMarketing?: InputMaybe<Scalars['Boolean']['input']>;
  canReceiveTransactional?: InputMaybe<Scalars['Boolean']['input']>;
  company?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  forwardingProvider?: InputMaybe<ForwardingProvider>;
  isBlocked?: InputMaybe<Scalars['Boolean']['input']>;
  isRegisteredWithImprovMX?: InputMaybe<Scalars['Boolean']['input']>;
  isVerified?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  postmarkEndpoint?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  type?: InputMaybe<EmailAddressType>;
};

export type EmailAddressStats = {
  __typename?: 'EmailAddressStats';
  blockedAddresses: Scalars['Int']['output'];
  businessEmails: Scalars['Int']['output'];
  personalEmails: Scalars['Int']['output'];
  totalAddresses: Scalars['Int']['output'];
  totalEmailsReceived: Scalars['Int']['output'];
  totalEmailsSent: Scalars['Int']['output'];
  verifiedAddresses: Scalars['Int']['output'];
};

/** Type of email address */
export enum EmailAddressType {
  Business = 'BUSINESS',
  Marketing = 'MARKETING',
  Noreply = 'NOREPLY',
  Personal = 'PERSONAL',
  Support = 'SUPPORT',
  Unknown = 'UNKNOWN'
}

export type EmailAddressUpdateInput = {
  acceptCalendarInvitesFromAnyone?: InputMaybe<Scalars['Boolean']['input']>;
  acceptedSenderEmailsForCalendarInvites?: InputMaybe<Array<Scalars['String']['input']>>;
  associatedClients?: InputMaybe<Array<Scalars['String']['input']>>;
  blockedDomainsForCalendarInvites?: InputMaybe<Array<Scalars['String']['input']>>;
  canReceiveMarketing?: InputMaybe<Scalars['Boolean']['input']>;
  canReceiveTransactional?: InputMaybe<Scalars['Boolean']['input']>;
  company?: InputMaybe<Scalars['String']['input']>;
  forwardingProvider?: InputMaybe<ForwardingProvider>;
  isBlocked?: InputMaybe<Scalars['Boolean']['input']>;
  isRegisteredWithImprovMX?: InputMaybe<Scalars['Boolean']['input']>;
  isVerified?: InputMaybe<Scalars['Boolean']['input']>;
  linkedCalendarIds?: InputMaybe<Array<Scalars['String']['input']>>;
  name?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  primaryCalendarId?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  type?: InputMaybe<EmailAddressType>;
};

export type EmailAttachment = {
  __typename?: 'EmailAttachment';
  content?: Maybe<Scalars['String']['output']>;
  contentId?: Maybe<Scalars['String']['output']>;
  contentLength: Scalars['Float']['output'];
  contentType: Scalars['String']['output'];
  ipfsHash?: Maybe<Scalars['String']['output']>;
  ipfsUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export type EmailComposeInput = {
  assignedClients?: InputMaybe<Array<Scalars['String']['input']>>;
  attachments?: InputMaybe<Array<OutboundEmailAttachmentInput>>;
  bcc?: InputMaybe<Scalars['String']['input']>;
  bodyMarkdown: Scalars['String']['input'];
  cc?: InputMaybe<Scalars['String']['input']>;
  direction?: InputMaybe<EmailDirection>;
  from?: InputMaybe<Scalars['String']['input']>;
  labels?: InputMaybe<Array<Scalars['String']['input']>>;
  replyTo?: InputMaybe<Scalars['String']['input']>;
  scheduledFor?: InputMaybe<Scalars['DateTime']['input']>;
  subject: Scalars['String']['input'];
  to: Scalars['String']['input'];
};

/** Email direction */
export enum EmailDirection {
  Inbound = 'INBOUND',
  Outbound = 'OUTBOUND'
}

export type EmailFilterInput = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  folder?: InputMaybe<Scalars['String']['input']>;
  isRead?: InputMaybe<Scalars['Boolean']['input']>;
  isStarred?: InputMaybe<Scalars['Boolean']['input']>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
};

export type EmailHeader = {
  __typename?: 'EmailHeader';
  name: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type EmailInput = {
  bcc?: InputMaybe<Scalars['String']['input']>;
  brand: Scalars['String']['input'];
  cc?: InputMaybe<Scalars['String']['input']>;
  html: Scalars['String']['input'];
  replyTo?: InputMaybe<Scalars['String']['input']>;
  subject: Scalars['String']['input'];
  text: Scalars['String']['input'];
  to: Scalars['String']['input'];
};

export type EmailResponse = {
  __typename?: 'EmailResponse';
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

/** Email status */
export enum EmailStatus {
  Draft = 'DRAFT',
  Failed = 'FAILED',
  Received = 'RECEIVED',
  Scheduled = 'SCHEDULED',
  Sent = 'SENT'
}

export type EmailUpdateInput = {
  assignedClients?: InputMaybe<Array<Scalars['String']['input']>>;
  bcc?: InputMaybe<Scalars['String']['input']>;
  bodyMarkdown?: InputMaybe<Scalars['String']['input']>;
  cc?: InputMaybe<Scalars['String']['input']>;
  direction?: InputMaybe<EmailDirection>;
  from?: InputMaybe<Scalars['String']['input']>;
  isArchived?: InputMaybe<Scalars['Boolean']['input']>;
  isAssigned?: InputMaybe<Scalars['Boolean']['input']>;
  isRead?: InputMaybe<Scalars['Boolean']['input']>;
  labels?: InputMaybe<Array<Scalars['String']['input']>>;
  replyTo?: InputMaybe<Scalars['String']['input']>;
  scheduledFor?: InputMaybe<Scalars['DateTime']['input']>;
  status?: InputMaybe<EmailStatus>;
  subject?: InputMaybe<Scalars['String']['input']>;
  to?: InputMaybe<Scalars['String']['input']>;
};

export type EmbeddedImage = {
  __typename?: 'EmbeddedImage';
  alt?: Maybe<Scalars['String']['output']>;
  caption?: Maybe<Scalars['String']['output']>;
  url: Scalars['String']['output'];
};

export type EmbeddedImageInput = {
  alt?: InputMaybe<Scalars['String']['input']>;
  caption?: InputMaybe<Scalars['String']['input']>;
  url: Scalars['String']['input'];
};

export type EmbeddedVideo = {
  __typename?: 'EmbeddedVideo';
  description?: Maybe<Scalars['String']['output']>;
  ipfsHash?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  type: VideoEmbedType;
  url: Scalars['String']['output'];
};

export type EmbeddedVideoInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  ipfsHash?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  type: VideoEmbedType;
  url: Scalars['String']['input'];
};

export type Employee = {
  __typename?: 'Employee';
  address?: Maybe<EmployeeAddress>;
  annualSalary?: Maybe<Scalars['Float']['output']>;
  bankAccountName?: Maybe<Scalars['String']['output']>;
  bankAccountNumber?: Maybe<Scalars['String']['output']>;
  bankBSB?: Maybe<Scalars['String']['output']>;
  certifications?: Maybe<Array<Scalars['String']['output']>>;
  clientId: Scalars['ID']['output'];
  company?: Maybe<Company>;
  companyId: Scalars['ID']['output'];
  contractType?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  dateOfBirth?: Maybe<Scalars['DateTime']['output']>;
  department?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  emergencyContact?: Maybe<EmployeeEmergencyContact>;
  employeeNumber?: Maybe<Scalars['String']['output']>;
  endDate?: Maybe<Scalars['DateTime']['output']>;
  fName?: Maybe<Scalars['String']['output']>;
  hourlyRate?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  lName?: Maybe<Scalars['String']['output']>;
  mobileNumber?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  position?: Maybe<Scalars['String']['output']>;
  profilePhoto?: Maybe<Scalars['String']['output']>;
  qualifications?: Maybe<Array<Scalars['String']['output']>>;
  role?: Maybe<EmployeeRole>;
  startDate?: Maybe<Scalars['DateTime']['output']>;
  status?: Maybe<EmployeeStatus>;
  superannuationFund?: Maybe<Scalars['String']['output']>;
  taxFileNumber?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  workingRights?: Maybe<Scalars['String']['output']>;
};

export type EmployeeAddress = {
  __typename?: 'EmployeeAddress';
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  postcode?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  street?: Maybe<Scalars['String']['output']>;
};

export type EmployeeAddressInput = {
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  postcode?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  street?: InputMaybe<Scalars['String']['input']>;
};

export type EmployeeEmergencyContact = {
  __typename?: 'EmployeeEmergencyContact';
  email?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  relationship?: Maybe<Scalars['String']['output']>;
};

export type EmployeeEmergencyContactInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  relationship?: InputMaybe<Scalars['String']['input']>;
};

export type EmployeeInput = {
  address?: InputMaybe<EmployeeAddressInput>;
  annualSalary?: InputMaybe<Scalars['Float']['input']>;
  bankAccountName?: InputMaybe<Scalars['String']['input']>;
  bankAccountNumber?: InputMaybe<Scalars['String']['input']>;
  bankBSB?: InputMaybe<Scalars['String']['input']>;
  certifications?: InputMaybe<Array<Scalars['String']['input']>>;
  clientId: Scalars['ID']['input'];
  companyId: Scalars['ID']['input'];
  contractType?: InputMaybe<Scalars['String']['input']>;
  dateOfBirth?: InputMaybe<Scalars['DateTime']['input']>;
  department?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  emergencyContact?: InputMaybe<EmployeeEmergencyContactInput>;
  employeeNumber?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  fName?: InputMaybe<Scalars['String']['input']>;
  hourlyRate?: InputMaybe<Scalars['Float']['input']>;
  lName?: InputMaybe<Scalars['String']['input']>;
  mobileNumber?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['String']['input']>;
  profilePhoto?: InputMaybe<Scalars['String']['input']>;
  qualifications?: InputMaybe<Array<Scalars['String']['input']>>;
  role?: InputMaybe<EmployeeRole>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  status?: InputMaybe<EmployeeStatus>;
  superannuationFund?: InputMaybe<Scalars['String']['input']>;
  taxFileNumber?: InputMaybe<Scalars['String']['input']>;
  workingRights?: InputMaybe<Scalars['String']['input']>;
};

/** The role/position of the employee */
export enum EmployeeRole {
  Admin = 'ADMIN',
  CareWorker = 'CARE_WORKER',
  Coordinator = 'COORDINATOR',
  Manager = 'MANAGER',
  Nurse = 'NURSE',
  Other = 'OTHER',
  SupportWorker = 'SUPPORT_WORKER'
}

/** The status of the employee */
export enum EmployeeStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  OnLeave = 'ON_LEAVE',
  Terminated = 'TERMINATED'
}

export type EventAttachment = {
  __typename?: 'EventAttachment';
  mimeType?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  size?: Maybe<Scalars['Float']['output']>;
  url: Scalars['String']['output'];
};

export type EventAttachmentInput = {
  mimeType?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  size?: InputMaybe<Scalars['Float']['input']>;
  url: Scalars['String']['input'];
};

export type EventAttendee = {
  __typename?: 'EventAttendee';
  clientId?: Maybe<Scalars['String']['output']>;
  comment?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  isOrganizer: Scalars['Boolean']['output'];
  name?: Maybe<Scalars['String']['output']>;
  respondedAt?: Maybe<Scalars['DateTime']['output']>;
  responseTime?: Maybe<Scalars['DateTime']['output']>;
  role: AttendeeRole;
  rsvpRequired: Scalars['Boolean']['output'];
  status: AttendeeStatus;
};

export type EventAttendeeInput = {
  clientId?: InputMaybe<Scalars['String']['input']>;
  comment?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  isOrganizer: Scalars['Boolean']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  respondedAt?: InputMaybe<Scalars['DateTime']['input']>;
  responseTime?: InputMaybe<Scalars['DateTime']['input']>;
  role: AttendeeRole;
  rsvpRequired: Scalars['Boolean']['input'];
  status: AttendeeStatus;
};

export type EventLocation = {
  __typename?: 'EventLocation';
  address?: Maybe<Scalars['String']['output']>;
  floor?: Maybe<Scalars['String']['output']>;
  instructions?: Maybe<Scalars['String']['output']>;
  latitude?: Maybe<Scalars['Float']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  room?: Maybe<Scalars['String']['output']>;
};

export type EventLocationInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  floor?: InputMaybe<Scalars['String']['input']>;
  instructions?: InputMaybe<Scalars['String']['input']>;
  latitude?: InputMaybe<Scalars['Float']['input']>;
  longitude?: InputMaybe<Scalars['Float']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  room?: InputMaybe<Scalars['String']['input']>;
};

export type EventReminder = {
  __typename?: 'EventReminder';
  enabled: Scalars['Boolean']['output'];
  method: Scalars['String']['output'];
  minutesBefore: Scalars['Float']['output'];
  sentAt?: Maybe<Scalars['DateTime']['output']>;
};

export type EventReminderInput = {
  enabled: Scalars['Boolean']['input'];
  method: Scalars['String']['input'];
  minutesBefore: Scalars['Float']['input'];
  sentAt?: InputMaybe<Scalars['DateTime']['input']>;
};

/** Event status values */
export enum EventStatus {
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  Confirmed = 'CONFIRMED',
  Draft = 'DRAFT',
  Tentative = 'TENTATIVE'
}

/** Types of calendar events */
export enum EventType {
  Appointment = 'APPOINTMENT',
  Availability = 'AVAILABILITY',
  Birthday = 'BIRTHDAY',
  Custom = 'CUSTOM',
  Event = 'EVENT',
  Holiday = 'HOLIDAY',
  IcalInvite = 'ICAL_INVITE',
  Maintenance = 'MAINTENANCE',
  Meeting = 'MEETING',
  OutOfOffice = 'OUT_OF_OFFICE',
  Reminder = 'REMINDER',
  Session = 'SESSION',
  Task = 'TASK',
  Webinar = 'WEBINAR'
}

/** Event visibility levels */
export enum EventVisibility {
  Confidential = 'CONFIDENTIAL',
  Private = 'PRIVATE',
  Public = 'PUBLIC',
  Transparent = 'TRANSPARENT'
}

export type Farmer = {
  __typename?: 'Farmer';
  aboutSection: FarmerAboutSection;
  allowedEditors: Array<Client>;
  allowedEditorsIds: Array<Client>;
  branding: FarmerBranding;
  client: Client;
  clientId: Client;
  contactInfo?: Maybe<FarmerContactInfo>;
  createdAt: Scalars['DateTime']['output'];
  enableBlog: Scalars['Boolean']['output'];
  enableCSA: Scalars['Boolean']['output'];
  enableNewsletter: Scalars['Boolean']['output'];
  enableRecipes: Scalars['Boolean']['output'];
  enableReviews: Scalars['Boolean']['output'];
  featuredProducts: Array<FarmerProductShowcase>;
  heroSection: FarmerHeroSection;
  id: Scalars['ID']['output'];
  isPublic: Scalars['Boolean']['output'];
  seoSettings: FarmerSeoSettings;
  status: FarmerStatus;
  tenantId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  urlSlug?: Maybe<Scalars['String']['output']>;
  valuePropositions: Array<FarmerValueProposition>;
};

export type FarmerAboutSection = {
  __typename?: 'FarmerAboutSection';
  buttonLink: Scalars['String']['output'];
  buttonText: Scalars['String']['output'];
  description: Scalars['String']['output'];
  heading: Scalars['String']['output'];
  image: Scalars['String']['output'];
  longDescription?: Maybe<Scalars['String']['output']>;
  subheading: Scalars['String']['output'];
};

export type FarmerAboutSectionInput = {
  buttonLink: Scalars['String']['input'];
  buttonText: Scalars['String']['input'];
  description: Scalars['String']['input'];
  heading: Scalars['String']['input'];
  image: Scalars['String']['input'];
  longDescription?: InputMaybe<Scalars['String']['input']>;
  subheading: Scalars['String']['input'];
};

export type FarmerBranding = {
  __typename?: 'FarmerBranding';
  accentColor: Scalars['String']['output'];
  farmName: Scalars['String']['output'];
  favicon?: Maybe<Scalars['String']['output']>;
  logo: Scalars['String']['output'];
  primaryColor: Scalars['String']['output'];
  secondaryColor: Scalars['String']['output'];
};

export type FarmerBrandingInput = {
  accentColor: Scalars['String']['input'];
  farmName: Scalars['String']['input'];
  favicon?: InputMaybe<Scalars['String']['input']>;
  logo: Scalars['String']['input'];
  primaryColor: Scalars['String']['input'];
  secondaryColor: Scalars['String']['input'];
};

export type FarmerContactInfo = {
  __typename?: 'FarmerContactInfo';
  address?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  facebook?: Maybe<Scalars['String']['output']>;
  instagram?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  twitter?: Maybe<Scalars['String']['output']>;
  youtube?: Maybe<Scalars['String']['output']>;
};

export type FarmerContactInfoInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  facebook?: InputMaybe<Scalars['String']['input']>;
  instagram?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  twitter?: InputMaybe<Scalars['String']['input']>;
  youtube?: InputMaybe<Scalars['String']['input']>;
};

export type FarmerHeroSection = {
  __typename?: 'FarmerHeroSection';
  backgroundImage: Scalars['String']['output'];
  heading: Scalars['String']['output'];
  primaryButtonLink: Scalars['String']['output'];
  primaryButtonText: Scalars['String']['output'];
  productList?: Maybe<Scalars['String']['output']>;
  promotionalText?: Maybe<Scalars['String']['output']>;
  secondaryButtonLink: Scalars['String']['output'];
  secondaryButtonText: Scalars['String']['output'];
  subheading: Scalars['String']['output'];
};

export type FarmerHeroSectionInput = {
  backgroundImage: Scalars['String']['input'];
  heading: Scalars['String']['input'];
  primaryButtonLink: Scalars['String']['input'];
  primaryButtonText: Scalars['String']['input'];
  productList?: InputMaybe<Scalars['String']['input']>;
  promotionalText?: InputMaybe<Scalars['String']['input']>;
  secondaryButtonLink: Scalars['String']['input'];
  secondaryButtonText: Scalars['String']['input'];
  subheading: Scalars['String']['input'];
};

export type FarmerProductShowcase = {
  __typename?: 'FarmerProductShowcase';
  category?: Maybe<Scalars['String']['output']>;
  description: Scalars['String']['output'];
  image: Scalars['String']['output'];
  link: Scalars['String']['output'];
  name: Scalars['String']['output'];
  price: Scalars['String']['output'];
};

export type FarmerProductShowcaseInput = {
  category?: InputMaybe<Scalars['String']['input']>;
  description: Scalars['String']['input'];
  image: Scalars['String']['input'];
  link: Scalars['String']['input'];
  name: Scalars['String']['input'];
  price: Scalars['String']['input'];
};

export type FarmerSeoSettings = {
  __typename?: 'FarmerSEOSettings';
  description: Scalars['String']['output'];
  keywords: Array<Scalars['String']['output']>;
  ogImage?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export type FarmerSeoSettingsInput = {
  description: Scalars['String']['input'];
  keywords: Array<Scalars['String']['input']>;
  ogImage?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

/** The status of the farmer profile */
export enum FarmerStatus {
  Active = 'ACTIVE',
  Draft = 'DRAFT',
  Inactive = 'INACTIVE'
}

export type FarmerValueProposition = {
  __typename?: 'FarmerValueProposition';
  description: Scalars['String']['output'];
  icon: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type FarmerValuePropositionInput = {
  description: Scalars['String']['input'];
  icon: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

/** Email forwarding service provider */
export enum ForwardingProvider {
  Google = 'GOOGLE',
  Improvmx = 'IMPROVMX',
  Microsoft = 'MICROSOFT',
  None = 'NONE',
  Other = 'OTHER'
}

export type FrontendUpgrade = {
  __typename?: 'FrontendUpgrade';
  appliedToTenants: Array<TenantUpgradeStatus>;
  category: UpgradeCategory;
  completedCount: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  createdDate: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  gitCommitUrls: Array<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isPendingForMaster: Scalars['Boolean']['output'];
  lastModified: Scalars['DateTime']['output'];
  markdownDocumentation?: Maybe<Scalars['String']['output']>;
  originTenantId: Scalars['ID']['output'];
  originTenantName: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
  title: Scalars['String']['output'];
  totalTenantCount: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

/** Categories for goals */
export enum GoalCategory {
  Customer = 'CUSTOMER',
  Finance = 'FINANCE',
  Growth = 'GROWTH',
  Marketing = 'MARKETING',
  Operations = 'OPERATIONS',
  Other = 'OTHER',
  Personal = 'PERSONAL',
  Product = 'PRODUCT',
  Team = 'TEAM'
}

/** Time period for goals */
export enum GoalPeriod {
  Custom = 'CUSTOM',
  Daily = 'DAILY',
  Monthly = 'MONTHLY',
  Quarterly = 'QUARTERLY',
  Weekly = 'WEEKLY',
  Yearly = 'YEARLY'
}

/** Status of the goal */
export enum GoalStatus {
  AtRisk = 'AT_RISK',
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  InProgress = 'IN_PROGRESS',
  NotStarted = 'NOT_STARTED',
  OnHold = 'ON_HOLD'
}

export type IpfsVideo = {
  __typename?: 'IPFSVideo';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  duration?: Maybe<Scalars['Float']['output']>;
  fileSize?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  ipfsHash: Scalars['String']['output'];
  ipfsUrl: Scalars['String']['output'];
  isPrivateFile: Scalars['Boolean']['output'];
  isPublic: Scalars['Boolean']['output'];
  mimeType?: Maybe<Scalars['String']['output']>;
  originalUrl?: Maybe<Scalars['String']['output']>;
  source: VideoSource;
  tags?: Maybe<Array<Scalars['String']['output']>>;
  tenantId: Scalars['String']['output'];
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  uploadedBy?: Maybe<Scalars['String']['output']>;
  uploadedByName?: Maybe<Scalars['String']['output']>;
  viewCount: Scalars['Float']['output'];
  youtubeChannelId?: Maybe<Scalars['String']['output']>;
  youtubeChannelName?: Maybe<Scalars['String']['output']>;
  youtubeVideoId?: Maybe<Scalars['String']['output']>;
};

export type IpfsVideoByCidInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  fileName?: InputMaybe<Scalars['String']['input']>;
  fileSize?: InputMaybe<Scalars['Float']['input']>;
  ipfsHash: Scalars['String']['input'];
  isPrivateFile?: Scalars['Boolean']['input'];
  isPublic?: Scalars['Boolean']['input'];
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  thumbnailUrl?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type IpfsVideoInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  isPrivateFile?: InputMaybe<Scalars['Boolean']['input']>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  thumbnailUrl?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type ImageSearchResult = {
  __typename?: 'ImageSearchResult';
  results: Array<SearchImage>;
  total: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type ImageUrls = {
  __typename?: 'ImageUrls';
  full: Scalars['String']['output'];
  raw: Scalars['String']['output'];
  regular: Scalars['String']['output'];
  small: Scalars['String']['output'];
  thumb: Scalars['String']['output'];
};

export type ImageUser = {
  __typename?: 'ImageUser';
  name: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

export type InboundEmail = {
  __typename?: 'InboundEmail';
  archivedAt?: Maybe<Scalars['DateTime']['output']>;
  assignedClients: Array<Scalars['String']['output']>;
  attachments: Array<EmailAttachment>;
  bcc: Array<Scalars['String']['output']>;
  cc: Array<Scalars['String']['output']>;
  ccFull: Array<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  date: Scalars['DateTime']['output'];
  folder?: Maybe<Scalars['String']['output']>;
  from: Scalars['String']['output'];
  fromFull: Scalars['String']['output'];
  fromName?: Maybe<Scalars['String']['output']>;
  headers: Array<EmailHeader>;
  htmlBody?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  inReplyTo?: Maybe<Scalars['String']['output']>;
  isArchived: Scalars['Boolean']['output'];
  isAssigned: Scalars['Boolean']['output'];
  isRead: Scalars['Boolean']['output'];
  isSpam: Scalars['Boolean']['output'];
  isStarred: Scalars['Boolean']['output'];
  labels: Array<Scalars['String']['output']>;
  mailboxHash?: Maybe<Scalars['String']['output']>;
  messageId: Scalars['String']['output'];
  originalRecipient?: Maybe<Scalars['String']['output']>;
  rawEmail?: Maybe<Scalars['String']['output']>;
  readAt?: Maybe<Scalars['DateTime']['output']>;
  references: Array<Scalars['String']['output']>;
  repliedAt?: Maybe<Scalars['DateTime']['output']>;
  repliedBy?: Maybe<Scalars['String']['output']>;
  replyEmailId?: Maybe<Scalars['String']['output']>;
  replyTo?: Maybe<Scalars['String']['output']>;
  spamScore?: Maybe<Scalars['Float']['output']>;
  strippedTextReply?: Maybe<Scalars['String']['output']>;
  subject: Scalars['String']['output'];
  tag?: Maybe<Scalars['String']['output']>;
  tasks?: Maybe<Array<CommunicationTask>>;
  tenantId: Scalars['String']['output'];
  textBody?: Maybe<Scalars['String']['output']>;
  threadId?: Maybe<Scalars['String']['output']>;
  to: Array<Scalars['String']['output']>;
  toFull: Array<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type InboxStats = {
  __typename?: 'InboxStats';
  archived: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  unassigned: Scalars['Int']['output'];
  unread: Scalars['Int']['output'];
};

export type Influencer = {
  __typename?: 'Influencer';
  acceptingCampaigns: Scalars['Boolean']['output'];
  achievements: Array<Scalars['String']['output']>;
  billingAddresses: Array<ClientShippingDetails>;
  bio?: Maybe<Scalars['String']['output']>;
  businessName?: Maybe<Scalars['String']['output']>;
  businessRegistrationNumber?: Maybe<Scalars['String']['output']>;
  cellcastId?: Maybe<Scalars['String']['output']>;
  contentSamples: Array<Scalars['String']['output']>;
  countries: Array<Scalars['String']['output']>;
  coverImage?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  currency?: Maybe<Scalars['String']['output']>;
  displayName?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  encryptedSignatureIpfsUrl?: Maybe<Scalars['String']['output']>;
  fName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isVerifiedSeller?: Maybe<Scalars['Boolean']['output']>;
  lName?: Maybe<Scalars['String']['output']>;
  languages: Array<Scalars['String']['output']>;
  metrics: InfluencerMetrics;
  minimumRate?: Maybe<Scalars['Float']['output']>;
  niches: Array<ContentNiche>;
  notes?: Maybe<Scalars['String']['output']>;
  opportunityCount?: Maybe<Scalars['Float']['output']>;
  paymentReceivingDetails?: Maybe<PaymentReceivingDetails>;
  permissions?: Maybe<Array<ClientPermission>>;
  personalCalendarId?: Maybe<Scalars['String']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  preferredContactMethod?: Maybe<Scalars['String']['output']>;
  profileImage?: Maybe<Scalars['String']['output']>;
  profilePhoto?: Maybe<Scalars['String']['output']>;
  role?: Maybe<ClientRole>;
  shippingAddresses: Array<ClientShippingDetails>;
  socialAccounts: Array<SocialMediaAccount>;
  specializations: Array<Scalars['String']['output']>;
  status: InfluencerStatus;
  tags?: Maybe<Array<Scalars['String']['output']>>;
  tenantId: Scalars['String']['output'];
  totalOpportunityValue?: Maybe<Scalars['Float']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  verified: Scalars['Boolean']['output'];
  verifiedAt?: Maybe<Scalars['DateTime']['output']>;
  websiteUrl?: Maybe<Scalars['String']['output']>;
  websites?: Maybe<Array<Scalars['String']['output']>>;
};

export type InfluencerBooking = {
  __typename?: 'InfluencerBooking';
  additionalNotes?: Maybe<Scalars['String']['output']>;
  bookingType: BookingType;
  budgetRange?: Maybe<Scalars['String']['output']>;
  contactEmail: Scalars['String']['output'];
  contactName: Scalars['String']['output'];
  contactPhone?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  expectedDeliverables?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  influencerId: Scalars['String']['output'];
  organization?: Maybe<Scalars['String']['output']>;
  projectDescription: Scalars['String']['output'];
  projectTitle: Scalars['String']['output'];
  status: InfluencerBookingStatus;
  targetAudience?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['String']['output'];
  timeline?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  urgency: UrgencyLevel;
};

/** Status of influencer booking */
export enum InfluencerBookingStatus {
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  Confirmed = 'CONFIRMED',
  InProgress = 'IN_PROGRESS',
  Pending = 'PENDING'
}

export type InfluencerInput = {
  acceptingCampaigns?: InputMaybe<Scalars['Boolean']['input']>;
  achievements?: InputMaybe<Array<Scalars['String']['input']>>;
  bio?: InputMaybe<Scalars['String']['input']>;
  contentSamples?: InputMaybe<Array<Scalars['String']['input']>>;
  countries?: InputMaybe<Array<Scalars['String']['input']>>;
  coverImage?: InputMaybe<Scalars['String']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  displayName?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  fName?: InputMaybe<Scalars['String']['input']>;
  lName?: InputMaybe<Scalars['String']['input']>;
  languages?: InputMaybe<Array<Scalars['String']['input']>>;
  metrics?: InputMaybe<InfluencerMetricsInput>;
  minimumRate?: InputMaybe<Scalars['Float']['input']>;
  niches?: InputMaybe<Array<ContentNiche>>;
  notes?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  preferredContactMethod?: InputMaybe<Scalars['String']['input']>;
  profileImage?: InputMaybe<Scalars['String']['input']>;
  socialAccounts?: InputMaybe<Array<SocialMediaAccountInput>>;
  specializations?: InputMaybe<Array<Scalars['String']['input']>>;
  status?: InputMaybe<InfluencerStatus>;
  websiteUrl?: InputMaybe<Scalars['String']['input']>;
};

export type InfluencerMetrics = {
  __typename?: 'InfluencerMetrics';
  averageEngagementRate: Scalars['Float']['output'];
  averageRating?: Maybe<Scalars['Float']['output']>;
  campaignsCompleted: Scalars['Int']['output'];
  totalFollowers: Scalars['Int']['output'];
  totalPosts: Scalars['Int']['output'];
  totalReviews: Scalars['Int']['output'];
};

export type InfluencerMetricsInput = {
  averageEngagementRate: Scalars['Float']['input'];
  averageRating?: InputMaybe<Scalars['Float']['input']>;
  campaignsCompleted: Scalars['Int']['input'];
  totalFollowers: Scalars['Int']['input'];
  totalPosts: Scalars['Int']['input'];
  totalReviews: Scalars['Int']['input'];
};

/** The status of the influencer account */
export enum InfluencerStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Pending = 'PENDING',
  Suspended = 'SUSPENDED'
}

export type InstructionalVideo = {
  __typename?: 'InstructionalVideo';
  description?: Maybe<Scalars['String']['output']>;
  ipfsHash: Scalars['String']['output'];
  ipfsUrl?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export type InstructionalVideoInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  ipfsHash: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

/** Status of calendar invitation */
export enum InvitationStatus {
  Accepted = 'ACCEPTED',
  Declined = 'DECLINED',
  Expired = 'EXPIRED',
  Pending = 'PENDING'
}

/** Type of invitation sent */
export enum InvitationType {
  Email = 'EMAIL',
  Link = 'LINK',
  Sms = 'SMS'
}

export type Invoice = {
  __typename?: 'Invoice';
  billingAddress?: Maybe<Scalars['String']['output']>;
  billingEmail?: Maybe<Scalars['String']['output']>;
  client: Client;
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  discountAmount: Scalars['Float']['output'];
  dueDate: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  invoiceNumber: Scalars['String']['output'];
  lineItems: Array<InvoiceLine>;
  notes?: Maybe<Scalars['String']['output']>;
  paidAt?: Maybe<Scalars['DateTime']['output']>;
  pdfUrl?: Maybe<Scalars['String']['output']>;
  status: InvoiceStatus;
  stripeInvoiceId?: Maybe<Scalars['String']['output']>;
  stripePaymentIntentId?: Maybe<Scalars['String']['output']>;
  subscription?: Maybe<Subscription>;
  subtotal: Scalars['Float']['output'];
  taxAmount: Scalars['Float']['output'];
  tenantId: Scalars['String']['output'];
  total: Scalars['Float']['output'];
  type: InvoiceType;
  updatedAt: Scalars['DateTime']['output'];
  voidedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type InvoiceInput = {
  billingAddress?: InputMaybe<Scalars['String']['input']>;
  billingEmail?: InputMaybe<Scalars['String']['input']>;
  clientId: Scalars['ID']['input'];
  currency: Scalars['String']['input'];
  discountAmount?: InputMaybe<Scalars['Float']['input']>;
  dueDate: Scalars['String']['input'];
  lineItems: Array<InvoiceLineInput>;
  notes?: InputMaybe<Scalars['String']['input']>;
  subscriptionId?: InputMaybe<Scalars['ID']['input']>;
  subtotal: Scalars['Float']['input'];
  taxAmount?: InputMaybe<Scalars['Float']['input']>;
  total: Scalars['Float']['input'];
  type: InvoiceType;
};

export type InvoiceLine = {
  __typename?: 'InvoiceLine';
  amount: Scalars['Float']['output'];
  description: Scalars['String']['output'];
  metadata?: Maybe<Scalars['String']['output']>;
  quantity: Scalars['Float']['output'];
  unitPrice: Scalars['Float']['output'];
};

export type InvoiceLineInput = {
  amount: Scalars['Float']['input'];
  description: Scalars['String']['input'];
  metadata?: InputMaybe<Scalars['String']['input']>;
  quantity: Scalars['Float']['input'];
  unitPrice: Scalars['Float']['input'];
};

export enum InvoiceStatus {
  Draft = 'DRAFT',
  Open = 'OPEN',
  Paid = 'PAID',
  Uncollectible = 'UNCOLLECTIBLE',
  Void = 'VOID'
}

export enum InvoiceType {
  Manual = 'MANUAL',
  OneTime = 'ONE_TIME',
  Subscription = 'SUBSCRIPTION',
  Usage = 'USAGE'
}

/** Life Essential Club wellbeing categories */
export enum LifeEssentialCategory {
  EconomicWellbeing = 'ECONOMIC_WELLBEING',
  EmergencyPreparedness = 'EMERGENCY_PREPAREDNESS',
  FamilyDevelopment = 'FAMILY_DEVELOPMENT',
  HealthyFoods = 'HEALTHY_FOODS',
  HealthyHome = 'HEALTHY_HOME',
  LifelongLearningSkills = 'LIFELONG_LEARNING_SKILLS',
  PersonalWellbeing = 'PERSONAL_WELLBEING',
  Relationships = 'RELATIONSHIPS',
  SustainabilityCommunityWellbeing = 'SUSTAINABILITY_COMMUNITY_WELLBEING'
}

export type LineItem = {
  __typename?: 'LineItem';
  amount: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  tenantId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type LineItemInput = {
  amount: Scalars['Float']['input'];
  description: Scalars['String']['input'];
};

export type MarkUpgradeAppliedInput = {
  notes?: InputMaybe<Scalars['String']['input']>;
  status: UpgradeStatus;
  tenantId: Scalars['ID']['input'];
  upgradeId: Scalars['ID']['input'];
};

export type Meeting = {
  __typename?: 'Meeting';
  actionItems?: Maybe<Array<Scalars['String']['output']>>;
  attendees?: Maybe<Array<Scalars['String']['output']>>;
  audioIpfsHash?: Maybe<Scalars['String']['output']>;
  audioUrl?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<Client>;
  date?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  duration?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  keyPoints?: Maybe<Array<Scalars['String']['output']>>;
  location?: Maybe<Scalars['String']['output']>;
  participants?: Maybe<Array<MeetingParticipant>>;
  status?: Maybe<Scalars['String']['output']>;
  summary?: Maybe<Scalars['String']['output']>;
  teamMembers?: Maybe<Array<Client>>;
  tenantId: Scalars['String']['output'];
  title: Scalars['String']['output'];
  transcription?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type MeetingAgendaItem = {
  __typename?: 'MeetingAgendaItem';
  completed: Scalars['Boolean']['output'];
  duration?: Maybe<Scalars['Float']['output']>;
  presenter?: Maybe<Scalars['String']['output']>;
  topic: Scalars['String']['output'];
};

export type MeetingAgendaItemInput = {
  duration?: InputMaybe<Scalars['Float']['input']>;
  presenter?: InputMaybe<Scalars['String']['input']>;
  topic: Scalars['String']['input'];
};

export type MeetingAttendee = {
  __typename?: 'MeetingAttendee';
  attended: Scalars['Boolean']['output'];
  company?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  isInternal: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  role?: Maybe<Scalars['String']['output']>;
};

export type MeetingAttendeeInput = {
  company?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  isInternal?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
};

/** Format of the meeting */
export enum MeetingFormat {
  Hybrid = 'HYBRID',
  InPerson = 'IN_PERSON',
  PhoneCall = 'PHONE_CALL',
  VideoCall = 'VIDEO_CALL'
}

export type MeetingInput = {
  actionItems?: InputMaybe<Array<Scalars['String']['input']>>;
  attendees?: InputMaybe<Array<Scalars['String']['input']>>;
  audioIpfsHash?: InputMaybe<Scalars['String']['input']>;
  audioUrl?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['DateTime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  duration?: InputMaybe<Scalars['Float']['input']>;
  keyPoints?: InputMaybe<Array<Scalars['String']['input']>>;
  location?: InputMaybe<Scalars['String']['input']>;
  summary?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
  transcription?: InputMaybe<Scalars['String']['input']>;
};

export type MeetingParticipant = {
  __typename?: 'MeetingParticipant';
  client?: Maybe<Client>;
  clientId?: Maybe<Scalars['ID']['output']>;
  name: Scalars['String']['output'];
  role?: Maybe<Scalars['String']['output']>;
};

export type MeetingParticipantInput = {
  clientId?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  role?: InputMaybe<Scalars['String']['input']>;
};

/** Status of the meeting */
export enum MeetingStatus {
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  InProgress = 'IN_PROGRESS',
  NoShow = 'NO_SHOW',
  Rescheduled = 'RESCHEDULED',
  Scheduled = 'SCHEDULED'
}

export type MeetingTask = {
  __typename?: 'MeetingTask';
  assignedTo?: Maybe<Client>;
  assigneeName?: Maybe<Scalars['String']['output']>;
  completed?: Maybe<Scalars['Boolean']['output']>;
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  dueDate?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  meeting?: Maybe<Meeting>;
  notes?: Maybe<Scalars['String']['output']>;
  priority?: Maybe<Scalars['String']['output']>;
  task: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type MeetingTaskInput = {
  assignedToId?: InputMaybe<Scalars['ID']['input']>;
  assigneeName?: InputMaybe<Scalars['String']['input']>;
  completed?: InputMaybe<Scalars['Boolean']['input']>;
  dueDate?: InputMaybe<Scalars['String']['input']>;
  meetingId?: InputMaybe<Scalars['ID']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  priority?: InputMaybe<Scalars['String']['input']>;
  task: Scalars['String']['input'];
};

/** Type of meeting */
export enum MeetingType {
  CheckIn = 'CHECK_IN',
  Closing = 'CLOSING',
  Demo = 'DEMO',
  Discovery = 'DISCOVERY',
  InitialCall = 'INITIAL_CALL',
  Negotiation = 'NEGOTIATION',
  Other = 'OTHER',
  ProposalPresentation = 'PROPOSAL_PRESENTATION',
  Review = 'REVIEW'
}

export type MemberSplit = {
  __typename?: 'MemberSplit';
  amount?: Maybe<Scalars['Float']['output']>;
  clientId: Scalars['String']['output'];
  clientName?: Maybe<Scalars['String']['output']>;
  paidOutDate?: Maybe<Scalars['DateTime']['output']>;
  payoutDate?: Maybe<Scalars['DateTime']['output']>;
  payoutDelayDays?: Maybe<Scalars['Int']['output']>;
  payoutNotes?: Maybe<Scalars['String']['output']>;
  payoutStatus?: Maybe<PayoutStatus>;
  percentage: Scalars['Float']['output'];
  transactionId?: Maybe<Scalars['String']['output']>;
};

export type MemberSplitInput = {
  clientId: Scalars['String']['input'];
  payoutDate?: InputMaybe<Scalars['DateTime']['input']>;
  payoutDelayDays?: InputMaybe<Scalars['Int']['input']>;
  payoutNotes?: InputMaybe<Scalars['String']['input']>;
  payoutStatus?: InputMaybe<PayoutStatus>;
  percentage: Scalars['Float']['input'];
};

export type ModuleDeploymentResult = {
  __typename?: 'ModuleDeploymentResult';
  commitSha?: Maybe<Scalars['String']['output']>;
  error?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
  tenantId: Scalars['String']['output'];
  tenantName: Scalars['String']['output'];
};

export type ModuleInfo = {
  __typename?: 'ModuleInfo';
  description: Scalars['String']['output'];
  icon: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  requiredTier: Scalars['String']['output'];
  version: Scalars['String']['output'];
};

export type MonthlyTrend = {
  __typename?: 'MonthlyTrend';
  created: Scalars['Int']['output'];
  lost: Scalars['Int']['output'];
  month: Scalars['String']['output'];
  value: Scalars['Float']['output'];
  won: Scalars['Int']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  acceptCalendarInvitation: BusinessCalendar;
  addAssetLog: AssetLog;
  addBlockedDate: BusinessCalendarAvailability;
  addCalendarEventTaskChecklistItem: CalendarEventTask;
  addClientPermission?: Maybe<Client>;
  addClientShippingAddress: Client;
  addClientTag?: Maybe<Client>;
  addEmailLabel: Email;
  addEmployeeToCompany?: Maybe<Company>;
  addGoalCheckpoint: CalendarGoal;
  addIPFSVideoByCID: IpfsVideo;
  addInboundEmailLabel: InboundEmail;
  addLabelToInboundEmail: InboundEmail;
  addLineItem: Bill;
  addMeetingMember: Meeting;
  addOpportunityMember: OpportunityMember;
  addToCart: Cart;
  /** Append additional tasks from markdown without deleting existing tasks */
  appendTasksFromMarkdown: Project;
  archiveCalendarGoal: CalendarGoal;
  archiveEmail: Email;
  archiveMultipleInboundEmails: Scalars['Int']['output'];
  assignEmailToClient: EmailAddress;
  assignEmailToClients: Email;
  assignPhoneNumberToClient: TwilioPhoneNumber;
  autoDistributeSplits: Opportunity;
  cancelBooking: Scalars['JSONObject']['output'];
  cancelEvent: Scalars['Boolean']['output'];
  cancelPublicBooking: Scalars['Boolean']['output'];
  cancelSession: Session;
  cancelSubscription: Subscription;
  changeBillClient: Scalars['Boolean']['output'];
  chargePaymentMethod: Scalars['String']['output'];
  cleanupOrphanedCartItems: Scalars['Float']['output'];
  clearProposalSignatures: Scalars['Boolean']['output'];
  completeBooking: Booking;
  configureBillChaserNotifications: BillChaserConfigResponse;
  convertCartToOrder: ProductOrder;
  convertTranscriptionIntoMeetingNotes: Scalars['String']['output'];
  createAsset: Asset;
  createAssetType: AssetType;
  createAvailability: Availability;
  createBill: Bill;
  createBillPayment: BillPaymentResponse;
  createBookableEventType: BusinessCalendarBookableEventType;
  createBooking: Booking;
  createBulkRDTimeEntries: Array<RdTimeEntry>;
  createBusinessCalendar: BusinessCalendar;
  createBusinessCalendarAvailability: BusinessCalendarAvailability;
  createCalendar: BusinessCalendar;
  createCalendarEventTask: CalendarEventTask;
  createCalendarGoal: CalendarGoal;
  createCart: Cart;
  createClient: Client;
  createClientRepo: Scalars['String']['output'];
  createCommunicationTask: CommunicationTask;
  createCompany: Company;
  createCompanyKnowledgeArticle: CompanyKnowledge;
  createDirectBooking: Booking;
  createDraftBillWithTasks: Bill;
  createEmail: Email;
  createEmailAddress: EmailAddress;
  /** Admin: Create a new email address with ImprovMX forwarding */
  createEmailAddressWithAlias: EmailAddress;
  createEmployee: Employee;
  createEvent: CalendarEvent;
  createFarmer: Farmer;
  createFrontendUpgrade: FrontendUpgrade;
  createInfluencer: Influencer;
  createInfluencerBooking: InfluencerBooking;
  createInvoice: Invoice;
  createManualCharge: Scalars['String']['output'];
  createMeeting: Meeting;
  createMeetingFromRecording: Scalars['String']['output'];
  createMeetingTask: MeetingTask;
  createMeetingTasks: Array<MeetingTask>;
  createModuleEvent: CalendarEvent;
  createOpportunity: Opportunity;
  createOpportunityMeeting: OpportunityMeeting;
  createOpportunityNote: OpportunityNote;
  createOpportunityStage: OpportunityStage;
  createOpportunityTask: OpportunityTask;
  createPassword: Password;
  createPaymentIntent: Scalars['String']['output'];
  createPaymentIntentForProductOrder: Scalars['String']['output'];
  createPaymentMethod: PaymentMethod;
  /** Create a personal email alias for the current user */
  createPersonalEmail: Scalars['String']['output'];
  createProduct: Product;
  createProductOrder: ProductOrder;
  createProject: Project;
  createProposal: Proposal;
  createProvider: Provider;
  createPublicBooking: PublicBookingResult;
  createQuote: Quote;
  createQuoteTemplate: QuoteTemplate;
  createRDActivity: RdActivity;
  createRDCommunicationLog: RdCommunicationLog;
  createRDProject: RdProject;
  createRDTimeEntry: RdTimeEntry;
  createRecurringAvailability: Array<Availability>;
  createSellerProfile: SellerProfile;
  createSession: Session;
  createSessionType: SessionType;
  createSetupIntent: Scalars['String']['output'];
  createSubscription: Subscription;
  createTask: Task;
  createTenant: Tenant;
  createTranscription: Transcription;
  deactivatePassword: Scalars['Boolean']['output'];
  deleteAsset: Scalars['Boolean']['output'];
  deleteAssetType: Scalars['Boolean']['output'];
  deleteAvailability: Scalars['Boolean']['output'];
  deleteBill: Scalars['Boolean']['output'];
  deleteBookableEventType: Scalars['Boolean']['output'];
  deleteBusinessCalendarAvailability: Scalars['Boolean']['output'];
  deleteCalendar: Scalars['Boolean']['output'];
  deleteCalendarEventTask: Scalars['Boolean']['output'];
  deleteCalendarGoal: Scalars['Boolean']['output'];
  deleteCalendarTag: Scalars['Boolean']['output'];
  deleteCart: Scalars['Boolean']['output'];
  deleteClient: Scalars['Boolean']['output'];
  deleteCommunicationTask: Scalars['Boolean']['output'];
  deleteCompany: Scalars['Boolean']['output'];
  deleteCompanyKnowledgeArticle: Scalars['Boolean']['output'];
  deleteDomain: Scalars['Boolean']['output'];
  deleteEmail: Scalars['Boolean']['output'];
  deleteEmailAddress: Scalars['Boolean']['output'];
  deleteEmployee: Scalars['Boolean']['output'];
  deleteEvent: DeleteEventResponse;
  deleteFarmer: Scalars['Boolean']['output'];
  deleteFromPinata: Scalars['Boolean']['output'];
  deleteFrontendUpgrade: Scalars['Boolean']['output'];
  deleteIPFSVideo: Scalars['Boolean']['output'];
  deleteInboundEmail: Scalars['Boolean']['output'];
  deleteInfluencer: Scalars['Boolean']['output'];
  deleteLineItem: Bill;
  deleteMeeting: Scalars['Boolean']['output'];
  deleteMeetingTask: Scalars['Boolean']['output'];
  deleteMeetingTasks: Scalars['Boolean']['output'];
  deleteOpportunity: Scalars['Boolean']['output'];
  deleteOpportunityMeeting: Scalars['Boolean']['output'];
  deleteOpportunityNote: Scalars['Boolean']['output'];
  deleteOpportunityTask: Scalars['Boolean']['output'];
  deletePaymentMethod: Scalars['Boolean']['output'];
  deleteProduct: Scalars['Boolean']['output'];
  deleteProject: Scalars['Boolean']['output'];
  deleteProposal: Scalars['Boolean']['output'];
  deleteProvider: Scalars['Boolean']['output'];
  deleteRDActivity: Scalars['Boolean']['output'];
  deleteRDEvidence: Scalars['Boolean']['output'];
  deleteRDProject: Scalars['Boolean']['output'];
  deleteRDTimeEntry: Scalars['Boolean']['output'];
  deleteRecording: Scalars['Boolean']['output'];
  deleteSellerProfile: Scalars['Boolean']['output'];
  deleteSessionType: Scalars['Boolean']['output'];
  deleteTask: Scalars['Boolean']['output'];
  deleteTaskMedia: Scalars['Boolean']['output'];
  deleteTenant: Scalars['Boolean']['output'];
  deleteTranscription: Scalars['Boolean']['output'];
  deployLatestModules: DeploymentSummary;
  deployModuleToAllClients: BulkDeploymentResult;
  deployModuleToTenant: ModuleDeploymentResult;
  deployModuleToTenants: BulkDeploymentResult;
  deployModuleUpdate: Scalars['Boolean']['output'];
  deploySpecificModule: Array<ModuleDeploymentResult>;
  /** Disable call forwarding for a phone number */
  disableCallForwarding: TwilioPhoneNumber;
  disableModuleForTenant: Tenant;
  downloadRecordingUrl: Scalars['String']['output'];
  duplicateBillWithPercentage: Bill;
  duplicateEmail: Email;
  enableBillChaser: BillChaserConfigResponse;
  enableModuleForTenant: Tenant;
  extractActionItemsFromTranscription: Scalars['String']['output'];
  fixBookingMetadata: Scalars['JSONObject']['output'];
  generateHeroImage: Scalars['String']['output'];
  generatePasswordLink: Scalars['String']['output'];
  generateShareToken: CompanyKnowledge;
  /** Generate a temporary access token for Vapi web calls */
  generateVapiAccessToken: VapiAccessToken;
  getOrCreatePersonalCalendar: BusinessCalendar;
  /** Import line items from markdown format */
  importLineItemsFromMarkdown: Bill;
  /** Import tasks from markdown format to project */
  importTasksFromMarkdown: Project;
  improveDescription: Scalars['String']['output'];
  improveOutgoingEmail: Scalars['String']['output'];
  improveTagline: Scalars['String']['output'];
  improveText: Scalars['String']['output'];
  linkEmailToAccount?: Maybe<Client>;
  linkPhoneToAccount?: Maybe<Client>;
  makeOutboundCall: Scalars['String']['output'];
  markAllInboundEmailsAsRead: Scalars['Boolean']['output'];
  markBillAsSent: Bill;
  markEmailAsRead: Email;
  markInboundEmailAsRead: InboundEmail;
  markUpgradeApplied: FrontendUpgrade;
  moveInboundEmailToFolder: InboundEmail;
  moveOpportunityStage: Opportunity;
  pauseSubscription: Subscription;
  publishCompanyKnowledgeArticle: CompanyKnowledge;
  purchasePhoneNumber: TwilioPhoneNumber;
  regenerateTranscription: Meeting;
  registerDomain: Domain;
  releasePhoneNumber: Scalars['Boolean']['output'];
  removeBlockedDate: BusinessCalendarAvailability;
  removeCalendarEventTaskChecklistItem: CalendarEventTask;
  removeClientPermission?: Maybe<Client>;
  removeClientTag?: Maybe<Client>;
  removeEmployeeFromCompany?: Maybe<Company>;
  removeFromCart: Cart;
  removeGoalCheckpoint: CalendarGoal;
  removeInboundEmailLabel: InboundEmail;
  removeLabelFromInboundEmail: InboundEmail;
  removeMeetingMember: Meeting;
  removeOpportunityMember: Scalars['Boolean']['output'];
  renewDomain: Domain;
  reorderBookableEventTypes: Scalars['Boolean']['output'];
  reorderCommunicationTasks: Array<CommunicationTask>;
  requestAuth: Scalars['Boolean']['output'];
  requestAuthViaSMS: Scalars['Boolean']['output'];
  requestEmailChange: Scalars['Boolean']['output'];
  requestPhoneChange: Scalars['Boolean']['output'];
  requestProposalEmailVerification: Scalars['String']['output'];
  reschedulePublicBooking: PublicBookingResult;
  respondToEvent: CalendarEvent;
  resumeSubscription: Subscription;
  retryTranscription: Transcription;
  runBillChaserManually: BillChaserRunResponse;
  scanEmailAndGenerateProjectProposal: ProjectProposal;
  sendBookingReminder: Scalars['Boolean']['output'];
  sendBulkSms: Scalars['Boolean']['output'];
  sendEmail: Email;
  sendEmailCode?: Maybe<Scalars['String']['output']>;
  sendProposal: Proposal;
  sendRSVPResponse: RsvpResponse;
  sendSms: Scalars['Boolean']['output'];
  sendSmsCode?: Maybe<Scalars['String']['output']>;
  sendTestBookingUrl: Scalars['Boolean']['output'];
  sendTestEmail: EmailResponse;
  sendTestEmailWithTenant: EmailResponse;
  sendTestSms: Scalars['Boolean']['output'];
  setBillChaserSafetyLimits: BillChaserConfigResponse;
  setClientPermissions?: Maybe<Client>;
  setClientTags?: Maybe<Client>;
  /** Setup call forwarding for a phone number */
  setupCallForwarding: TwilioPhoneNumber;
  shareCalendar: CalendarInvitation;
  sharePassword: Password;
  signProposal: ProposalSignature;
  starInboundEmail: InboundEmail;
  submitContactForm: ContactFormSubmission;
  /** Sync call recordings from Twilio for all phone numbers */
  syncCallRecordings: Scalars['Int']['output'];
  syncTwilioNumbers: Array<TwilioPhoneNumber>;
  testAiService: Scalars['String']['output'];
  toggleBillDraftStatus: Bill;
  toggleBillPaymentStatus: Bill;
  toggleBookableEventTypeStatus: BusinessCalendarBookableEventType;
  toggleCalendarEventTaskCompletion: CalendarEventTask;
  toggleCommunicationTaskStatus: CommunicationTask;
  togglePinCompanyKnowledgeArticle: CompanyKnowledge;
  /** Transcribe all recordings that haven't been transcribed yet */
  transcribeAllRecordings: Scalars['Int']['output'];
  transcribeAudio: Transcription;
  transcribeRecording: CallRecording;
  transferCalendarOwnership: BusinessCalendar;
  transferDomain: Domain;
  unarchiveMultipleInboundEmails: Scalars['Int']['output'];
  unassignEmailFromClient: EmailAddress;
  unassignPhoneNumberFromClient: TwilioPhoneNumber;
  unpublishCompanyKnowledgeArticle: CompanyKnowledge;
  updateAsset?: Maybe<Asset>;
  updateAvailabilityStatus: Availability;
  updateBill: Bill;
  updateBillChaserConfiguration: BillChaserConfigResponse;
  updateBillPaymentStatus: Bill;
  updateBillStatus: Bill;
  updateBillStatusWithoutNotifications: Bill;
  updateBookableEventType: BusinessCalendarBookableEventType;
  updateBookingPayment: Booking;
  updateBusinessCalendarAvailability: BusinessCalendarAvailability;
  updateCalendar: BusinessCalendar;
  updateCalendarEventTask: CalendarEventTask;
  updateCalendarEventTaskChecklistItem: CalendarEventTask;
  updateCalendarGoal: CalendarGoal;
  updateClient?: Maybe<Client>;
  updateCommunicationTask: CommunicationTask;
  updateCompany?: Maybe<Company>;
  updateCompanyKnowledgeArticle: CompanyKnowledge;
  updateEmail: Email;
  updateEmailAddress: EmailAddress;
  updateEmployee?: Maybe<Employee>;
  updateEvent: CalendarEvent;
  updateFarmer: Farmer;
  updateFrontendUpgrade: FrontendUpgrade;
  updateGoalCheckpoint: CalendarGoal;
  updateIPFSVideo: IpfsVideo;
  updateInfluencer: Influencer;
  updateInfluencerBookingStatus: InfluencerBooking;
  updateInfluencerMetrics: Influencer;
  updateInvoice?: Maybe<Invoice>;
  updateLineItem: Bill;
  updateMeeting: Meeting;
  updateMeetingParticipants: Meeting;
  updateMeetingTask: MeetingTask;
  updateMeetingTranscription: Meeting;
  updateMyWebsite: Tenant;
  updateNameservers: Domain;
  updateOpportunity: Opportunity;
  updateOpportunityMeeting: OpportunityMeeting;
  updateOpportunityMember: OpportunityMember;
  updateOpportunityNote: OpportunityNote;
  updateOpportunityPaymentStatus: Opportunity;
  updateOpportunityStage: OpportunityStage;
  updateOpportunityTask: OpportunityTask;
  updateOrderStatus?: Maybe<ProductOrder>;
  updatePassword: Password;
  updatePaymentStatus: Opportunity;
  updatePayoutStatus: Opportunity;
  updatePhoneNumber: TwilioPhoneNumber;
  updateProduct?: Maybe<Product>;
  updateProject: Project;
  updateProjectProgress: Project;
  updateProposal: Proposal;
  updateProposalSignedPdf: Proposal;
  updateProvider?: Maybe<Provider>;
  updateProviderStatus: Scalars['Boolean']['output'];
  updateProviderUrlSlug: Scalars['Boolean']['output'];
  updateQuoteStatus: Quote;
  updateRDActivity: RdActivity;
  updateRDProject: RdProject;
  updateRDTimeEntry: RdTimeEntry;
  updateSellerProfile?: Maybe<SellerProfile>;
  updateSellerProfileStatus?: Maybe<SellerProfile>;
  updateSession: Session;
  updateSessionType: SessionType;
  updateSubscription?: Maybe<Subscription>;
  updateTask: Task;
  updateTaskOrder: Task;
  updateTaskStatus: Task;
  updateTenant: Tenant;
  updateTenantCompanyDetails: Tenant;
  updateTenantPaymentDetails: Tenant;
  updateTranscription: Transcription;
  uploadFile: Scalars['String']['output'];
  uploadMeetingAudio: Meeting;
  uploadRDEvidence: RdEvidence;
  uploadTaskMedia: TaskMedia;
  uploadToPinata: Scalars['String']['output'];
  uploadUnencryptedFile: Scalars['String']['output'];
  uploadVideoToIPFS: IpfsVideo;
  upsertCalendarTag: CalendarTag;
  validateMemberSplits: Scalars['Boolean']['output'];
  verifyAuth?: Maybe<Scalars['String']['output']>;
  verifyAuthViaSMS?: Maybe<Scalars['String']['output']>;
  verifyEmailChange: Scalars['Boolean']['output'];
  verifyEmailCode?: Maybe<AuthResponse>;
  verifyInfluencer: Influencer;
  verifyPhoneChange: Scalars['Boolean']['output'];
  verifyProposalEmail: Scalars['Boolean']['output'];
  verifySmsCode?: Maybe<AuthResponse>;
};


export type MutationAcceptCalendarInvitationArgs = {
  token: Scalars['String']['input'];
};


export type MutationAddAssetLogArgs = {
  input: AssetLogInput;
};


export type MutationAddBlockedDateArgs = {
  calendarId: Scalars['String']['input'];
  date: Scalars['DateTime']['input'];
};


export type MutationAddCalendarEventTaskChecklistItemArgs = {
  item: CalendarEventTaskChecklistItemInput;
  taskId: Scalars['String']['input'];
};


export type MutationAddClientPermissionArgs = {
  clientId: Scalars['ID']['input'];
  permission: ClientPermission;
};


export type MutationAddClientShippingAddressArgs = {
  input: ClientShippingDetailsInput;
};


export type MutationAddClientTagArgs = {
  clientId: Scalars['ID']['input'];
  tag: Scalars['String']['input'];
};


export type MutationAddEmailLabelArgs = {
  emailId: Scalars['String']['input'];
  label: Scalars['String']['input'];
};


export type MutationAddEmployeeToCompanyArgs = {
  clientId: Scalars['ID']['input'];
  companyId: Scalars['ID']['input'];
};


export type MutationAddGoalCheckpointArgs = {
  checkpoint: CalendarGoalCheckpointInput;
  goalId: Scalars['String']['input'];
};


export type MutationAddIpfsVideoByCidArgs = {
  input: IpfsVideoByCidInput;
};


export type MutationAddInboundEmailLabelArgs = {
  emailId: Scalars['String']['input'];
  label: Scalars['String']['input'];
};


export type MutationAddLabelToInboundEmailArgs = {
  id: Scalars['ID']['input'];
  label: Scalars['String']['input'];
};


export type MutationAddLineItemArgs = {
  billId: Scalars['ID']['input'];
  input: LineItemInput;
};


export type MutationAddMeetingMemberArgs = {
  clientId: Scalars['ID']['input'];
  meetingId: Scalars['ID']['input'];
};


export type MutationAddOpportunityMemberArgs = {
  input: OpportunityMemberInput;
  opportunityId: Scalars['String']['input'];
};


export type MutationAddToCartArgs = {
  input: CartItemInput;
};


export type MutationAppendTasksFromMarkdownArgs = {
  markdown: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
};


export type MutationArchiveCalendarGoalArgs = {
  id: Scalars['String']['input'];
};


export type MutationArchiveEmailArgs = {
  emailId: Scalars['String']['input'];
};


export type MutationArchiveMultipleInboundEmailsArgs = {
  ids: Array<Scalars['String']['input']>;
};


export type MutationAssignEmailToClientArgs = {
  clientId: Scalars['String']['input'];
  emailId: Scalars['String']['input'];
};


export type MutationAssignEmailToClientsArgs = {
  clientIds: Array<Scalars['String']['input']>;
  emailId: Scalars['String']['input'];
};


export type MutationAssignPhoneNumberToClientArgs = {
  clientId: Scalars['ID']['input'];
  phoneNumberId: Scalars['ID']['input'];
};


export type MutationAutoDistributeSplitsArgs = {
  opportunityId: Scalars['String']['input'];
};


export type MutationCancelBookingArgs = {
  reason: Scalars['String']['input'];
  token: Scalars['String']['input'];
};


export type MutationCancelEventArgs = {
  id: Scalars['String']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCancelPublicBookingArgs = {
  reason?: InputMaybe<Scalars['String']['input']>;
  token: Scalars['String']['input'];
};


export type MutationCancelSessionArgs = {
  id: Scalars['String']['input'];
  reason: Scalars['String']['input'];
};


export type MutationCancelSubscriptionArgs = {
  reason?: InputMaybe<Scalars['String']['input']>;
  subscriptionId: Scalars['ID']['input'];
};


export type MutationChangeBillClientArgs = {
  billId: Scalars['ID']['input'];
  newClientId: Scalars['ID']['input'];
};


export type MutationChargePaymentMethodArgs = {
  amount: Scalars['Float']['input'];
  clientId: Scalars['ID']['input'];
  currency?: InputMaybe<Scalars['String']['input']>;
  description: Scalars['String']['input'];
  paymentMethodId: Scalars['ID']['input'];
};


export type MutationClearProposalSignaturesArgs = {
  proposalId: Scalars['ID']['input'];
};


export type MutationCompleteBookingArgs = {
  bookingId: Scalars['String']['input'];
};


export type MutationConfigureBillChaserNotificationsArgs = {
  sendToClients: Scalars['Boolean']['input'];
  sendToIssuers: Scalars['Boolean']['input'];
};


export type MutationConvertCartToOrderArgs = {
  cartId: Scalars['ID']['input'];
  payment: PaymentDetailsInput;
};


export type MutationConvertTranscriptionIntoMeetingNotesArgs = {
  transcription: Scalars['String']['input'];
};


export type MutationCreateAssetArgs = {
  input: AssetInput;
};


export type MutationCreateAssetTypeArgs = {
  input: AssetTypeInput;
};


export type MutationCreateAvailabilityArgs = {
  input: AvailabilityInput;
};


export type MutationCreateBillArgs = {
  input: BillInput;
};


export type MutationCreateBillPaymentArgs = {
  billId: Scalars['ID']['input'];
  paymentMethodId: Scalars['String']['input'];
};


export type MutationCreateBookableEventTypeArgs = {
  input: CreateBusinessCalendarBookableEventTypeInput;
};


export type MutationCreateBookingArgs = {
  input: BookingInput;
};


export type MutationCreateBulkRdTimeEntriesArgs = {
  entries: Array<RdTimeEntryInput>;
};


export type MutationCreateBusinessCalendarArgs = {
  input: BusinessCalendarInput;
};


export type MutationCreateBusinessCalendarAvailabilityArgs = {
  input: CreateBusinessCalendarAvailabilityInput;
};


export type MutationCreateCalendarArgs = {
  input: BusinessCalendarInput;
};


export type MutationCreateCalendarEventTaskArgs = {
  input: CalendarEventTaskInput;
};


export type MutationCreateCalendarGoalArgs = {
  input: CalendarGoalInput;
};


export type MutationCreateClientArgs = {
  input: ClientInput;
};


export type MutationCreateClientRepoArgs = {
  clientGithubOwner: Scalars['String']['input'];
  clientGithubToken: Scalars['String']['input'];
  clientRepoName: Scalars['String']['input'];
};


export type MutationCreateCommunicationTaskArgs = {
  input: CommunicationTaskInput;
};


export type MutationCreateCompanyArgs = {
  input: CompanyInput;
};


export type MutationCreateCompanyKnowledgeArticleArgs = {
  input: CompanyKnowledgeInput;
};


export type MutationCreateDirectBookingArgs = {
  input: BookingInput;
};


export type MutationCreateDraftBillWithTasksArgs = {
  projectId: Scalars['ID']['input'];
};


export type MutationCreateEmailArgs = {
  input: EmailComposeInput;
};


export type MutationCreateEmailAddressArgs = {
  input: EmailAddressInput;
};


export type MutationCreateEmailAddressWithAliasArgs = {
  input: CreateEmailAddressWithAliasInput;
};


export type MutationCreateEmployeeArgs = {
  input: EmployeeInput;
};


export type MutationCreateEventArgs = {
  input: CalendarEventInput;
};


export type MutationCreateFarmerArgs = {
  input: CreateFarmerInput;
};


export type MutationCreateFrontendUpgradeArgs = {
  input: CreateFrontendUpgradeInput;
};


export type MutationCreateInfluencerArgs = {
  input: InfluencerInput;
};


export type MutationCreateInfluencerBookingArgs = {
  input: CreateInfluencerBookingInput;
};


export type MutationCreateInvoiceArgs = {
  input: InvoiceInput;
};


export type MutationCreateManualChargeArgs = {
  amount: Scalars['Float']['input'];
  clientId: Scalars['ID']['input'];
  currency?: InputMaybe<Scalars['String']['input']>;
  description: Scalars['String']['input'];
  paymentMethodId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationCreateMeetingArgs = {
  input: MeetingInput;
};


export type MutationCreateMeetingFromRecordingArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  recordingSid: Scalars['String']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateMeetingTaskArgs = {
  input: MeetingTaskInput;
};


export type MutationCreateMeetingTasksArgs = {
  meetingId: Scalars['ID']['input'];
  tasks: Array<MeetingTaskInput>;
};


export type MutationCreateModuleEventArgs = {
  calendarId: Scalars['String']['input'];
  input: CalendarEventInput;
  moduleRefId: Scalars['String']['input'];
  moduleType: Scalars['String']['input'];
};


export type MutationCreateOpportunityArgs = {
  input: OpportunityInput;
};


export type MutationCreateOpportunityMeetingArgs = {
  input: OpportunityMeetingInput;
};


export type MutationCreateOpportunityNoteArgs = {
  input: OpportunityNoteInput;
};


export type MutationCreateOpportunityStageArgs = {
  input: OpportunityStageInput;
};


export type MutationCreateOpportunityTaskArgs = {
  input: OpportunityTaskInput;
};


export type MutationCreatePasswordArgs = {
  input: PasswordInput;
};


export type MutationCreatePaymentIntentArgs = {
  invoiceId: Scalars['String']['input'];
};


export type MutationCreatePaymentIntentForProductOrderArgs = {
  orderId: Scalars['String']['input'];
};


export type MutationCreatePaymentMethodArgs = {
  input: PaymentMethodInput;
};


export type MutationCreatePersonalEmailArgs = {
  input: CreatePersonalEmailInput;
};


export type MutationCreateProductArgs = {
  input: ProductInput;
};


export type MutationCreateProductOrderArgs = {
  input: ProductOrderInput;
};


export type MutationCreateProjectArgs = {
  input: ProjectInput;
};


export type MutationCreateProposalArgs = {
  input: CreateProposalInput;
};


export type MutationCreateProviderArgs = {
  input: CreateProviderInput;
};


export type MutationCreatePublicBookingArgs = {
  input: CreatePublicBookingInput;
};


export type MutationCreateQuoteArgs = {
  input: QuoteInput;
};


export type MutationCreateQuoteTemplateArgs = {
  input: QuoteTemplateInput;
};


export type MutationCreateRdActivityArgs = {
  input: RdActivityInput;
};


export type MutationCreateRdCommunicationLogArgs = {
  communicationType: Scalars['String']['input'];
  content?: InputMaybe<Scalars['String']['input']>;
  createTimeEntry?: Scalars['Boolean']['input'];
  duration?: InputMaybe<Scalars['Float']['input']>;
  participants?: InputMaybe<Scalars['String']['input']>;
  projectId: Scalars['String']['input'];
  subject?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateRdProjectArgs = {
  input: RdProjectInput;
};


export type MutationCreateRdTimeEntryArgs = {
  input: RdTimeEntryInput;
};


export type MutationCreateRecurringAvailabilityArgs = {
  input: AvailabilityInput;
  until: Scalars['DateTime']['input'];
};


export type MutationCreateSellerProfileArgs = {
  input: SellerProfileInput;
};


export type MutationCreateSessionArgs = {
  input: SessionInput;
};


export type MutationCreateSessionTypeArgs = {
  input: SessionTypeInput;
};


export type MutationCreateSetupIntentArgs = {
  clientId: Scalars['String']['input'];
};


export type MutationCreateSubscriptionArgs = {
  input: SubscriptionInput;
};


export type MutationCreateTaskArgs = {
  input: TaskInput;
};


export type MutationCreateTenantArgs = {
  input: TenantInput;
};


export type MutationCreateTranscriptionArgs = {
  input: TranscriptionInput;
};


export type MutationDeactivatePasswordArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteAssetArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteAssetTypeArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteAvailabilityArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteBillArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteBookableEventTypeArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteBusinessCalendarAvailabilityArgs = {
  calendarId: Scalars['String']['input'];
};


export type MutationDeleteCalendarArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteCalendarEventTaskArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteCalendarGoalArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteCalendarTagArgs = {
  tagId: Scalars['String']['input'];
};


export type MutationDeleteCartArgs = {
  cartId: Scalars['ID']['input'];
};


export type MutationDeleteClientArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteCommunicationTaskArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteCompanyArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteCompanyKnowledgeArticleArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteDomainArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteEmailArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteEmailAddressArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteEmployeeArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteEventArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteFarmerArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteFromPinataArgs = {
  url: Scalars['String']['input'];
};


export type MutationDeleteFrontendUpgradeArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteIpfsVideoArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteInboundEmailArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteInfluencerArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteLineItemArgs = {
  billId: Scalars['ID']['input'];
  lineItemId: Scalars['ID']['input'];
};


export type MutationDeleteMeetingArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteMeetingTaskArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteMeetingTasksArgs = {
  meetingId: Scalars['ID']['input'];
};


export type MutationDeleteOpportunityArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteOpportunityMeetingArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteOpportunityNoteArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteOpportunityTaskArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeletePaymentMethodArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteProductArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteProjectArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteProposalArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteProviderArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteRdActivityArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteRdEvidenceArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteRdProjectArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteRdTimeEntryArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteRecordingArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteSellerProfileArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteSessionTypeArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteTaskArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteTaskMediaArgs = {
  photoUrl: Scalars['String']['input'];
  taskId: Scalars['ID']['input'];
};


export type MutationDeleteTenantArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteTranscriptionArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeployModuleToAllClientsArgs = {
  moduleId: Scalars['String']['input'];
};


export type MutationDeployModuleToTenantArgs = {
  moduleId: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};


export type MutationDeployModuleToTenantsArgs = {
  moduleId: Scalars['String']['input'];
  tenantIds: Array<Scalars['ID']['input']>;
};


export type MutationDeployModuleUpdateArgs = {
  moduleId: Scalars['String']['input'];
  tenantIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  version: Scalars['String']['input'];
};


export type MutationDeploySpecificModuleArgs = {
  moduleId: Scalars['String']['input'];
};


export type MutationDisableCallForwardingArgs = {
  phoneNumberId: Scalars['ID']['input'];
};


export type MutationDisableModuleForTenantArgs = {
  moduleId: Scalars['String']['input'];
  tenantId: Scalars['ID']['input'];
};


export type MutationDownloadRecordingUrlArgs = {
  recordingSid: Scalars['String']['input'];
};


export type MutationDuplicateBillWithPercentageArgs = {
  id: Scalars['ID']['input'];
  paymentTerms?: InputMaybe<Scalars['String']['input']>;
  percentage: Scalars['Float']['input'];
};


export type MutationDuplicateEmailArgs = {
  id: Scalars['ID']['input'];
};


export type MutationEnableBillChaserArgs = {
  enabled: Scalars['Boolean']['input'];
};


export type MutationEnableModuleForTenantArgs = {
  moduleId: Scalars['String']['input'];
  tenantId: Scalars['ID']['input'];
  version?: Scalars['String']['input'];
};


export type MutationExtractActionItemsFromTranscriptionArgs = {
  attendees?: InputMaybe<Array<Scalars['String']['input']>>;
  transcription: Scalars['String']['input'];
};


export type MutationFixBookingMetadataArgs = {
  token: Scalars['String']['input'];
};


export type MutationGenerateHeroImageArgs = {
  prompt: Scalars['String']['input'];
  style?: InputMaybe<Scalars['String']['input']>;
};


export type MutationGeneratePasswordLinkArgs = {
  expiresInHours?: Scalars['Float']['input'];
  passwordId: Scalars['ID']['input'];
};


export type MutationGenerateShareTokenArgs = {
  id: Scalars['ID']['input'];
};


export type MutationImportLineItemsFromMarkdownArgs = {
  billId: Scalars['ID']['input'];
  markdown: Scalars['String']['input'];
};


export type MutationImportTasksFromMarkdownArgs = {
  markdown: Scalars['String']['input'];
  projectId: Scalars['ID']['input'];
};


export type MutationImproveDescriptionArgs = {
  context?: InputMaybe<Scalars['String']['input']>;
  text: Scalars['String']['input'];
};


export type MutationImproveOutgoingEmailArgs = {
  emailContent: Scalars['String']['input'];
  subject?: InputMaybe<Scalars['String']['input']>;
};


export type MutationImproveTaglineArgs = {
  context?: InputMaybe<Scalars['String']['input']>;
  text: Scalars['String']['input'];
};


export type MutationImproveTextArgs = {
  context?: InputMaybe<Scalars['String']['input']>;
  text: Scalars['String']['input'];
  type: Scalars['String']['input'];
};


export type MutationLinkEmailToAccountArgs = {
  code: Scalars['String']['input'];
  email: Scalars['String']['input'];
};


export type MutationLinkPhoneToAccountArgs = {
  code: Scalars['String']['input'];
  phoneNumber: Scalars['String']['input'];
};


export type MutationMakeOutboundCallArgs = {
  from?: InputMaybe<Scalars['String']['input']>;
  message?: InputMaybe<Scalars['String']['input']>;
  to: Scalars['String']['input'];
};


export type MutationMarkAllInboundEmailsAsReadArgs = {
  folder?: InputMaybe<Scalars['String']['input']>;
};


export type MutationMarkBillAsSentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationMarkEmailAsReadArgs = {
  emailId: Scalars['String']['input'];
};


export type MutationMarkInboundEmailAsReadArgs = {
  id: Scalars['ID']['input'];
  isRead: Scalars['Boolean']['input'];
};


export type MutationMarkUpgradeAppliedArgs = {
  input: MarkUpgradeAppliedInput;
};


export type MutationMoveInboundEmailToFolderArgs = {
  folder: Scalars['String']['input'];
  id: Scalars['ID']['input'];
};


export type MutationMoveOpportunityStageArgs = {
  id: Scalars['String']['input'];
  newStage: Scalars['String']['input'];
};


export type MutationPauseSubscriptionArgs = {
  subscriptionId: Scalars['ID']['input'];
};


export type MutationPublishCompanyKnowledgeArticleArgs = {
  id: Scalars['ID']['input'];
};


export type MutationPurchasePhoneNumberArgs = {
  input: PurchasePhoneNumberInput;
};


export type MutationRegenerateTranscriptionArgs = {
  meetingId: Scalars['ID']['input'];
};


export type MutationRegisterDomainArgs = {
  input: DomainRegisterInput;
};


export type MutationReleasePhoneNumberArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRemoveBlockedDateArgs = {
  calendarId: Scalars['String']['input'];
  date: Scalars['DateTime']['input'];
};


export type MutationRemoveCalendarEventTaskChecklistItemArgs = {
  checklistItemId: Scalars['String']['input'];
  taskId: Scalars['String']['input'];
};


export type MutationRemoveClientPermissionArgs = {
  clientId: Scalars['ID']['input'];
  permission: ClientPermission;
};


export type MutationRemoveClientTagArgs = {
  clientId: Scalars['ID']['input'];
  tag: Scalars['String']['input'];
};


export type MutationRemoveEmployeeFromCompanyArgs = {
  clientId: Scalars['ID']['input'];
  companyId: Scalars['ID']['input'];
};


export type MutationRemoveFromCartArgs = {
  cartId: Scalars['ID']['input'];
  itemId: Scalars['ID']['input'];
};


export type MutationRemoveGoalCheckpointArgs = {
  checkpointId: Scalars['String']['input'];
  goalId: Scalars['String']['input'];
};


export type MutationRemoveInboundEmailLabelArgs = {
  emailId: Scalars['String']['input'];
  label: Scalars['String']['input'];
};


export type MutationRemoveLabelFromInboundEmailArgs = {
  id: Scalars['ID']['input'];
  label: Scalars['String']['input'];
};


export type MutationRemoveMeetingMemberArgs = {
  clientId: Scalars['ID']['input'];
  meetingId: Scalars['ID']['input'];
};


export type MutationRemoveOpportunityMemberArgs = {
  id: Scalars['String']['input'];
};


export type MutationRenewDomainArgs = {
  input: DomainRenewInput;
};


export type MutationReorderBookableEventTypesArgs = {
  eventTypeIds: Array<Scalars['String']['input']>;
};


export type MutationReorderCommunicationTasksArgs = {
  taskIds: Array<Scalars['ID']['input']>;
};


export type MutationRequestAuthArgs = {
  input: AuthInput;
};


export type MutationRequestAuthViaSmsArgs = {
  input: AuthViaSmsInput;
};


export type MutationRequestEmailChangeArgs = {
  input: RequestEmailChangeInput;
};


export type MutationRequestPhoneChangeArgs = {
  input: RequestPhoneChangeInput;
};


export type MutationRequestProposalEmailVerificationArgs = {
  input: RequestProposalEmailVerificationInput;
};


export type MutationReschedulePublicBookingArgs = {
  newStartTime: Scalars['DateTime']['input'];
  token: Scalars['String']['input'];
};


export type MutationRespondToEventArgs = {
  comment?: InputMaybe<Scalars['String']['input']>;
  eventId: Scalars['String']['input'];
  status: AttendeeStatus;
};


export type MutationResumeSubscriptionArgs = {
  subscriptionId: Scalars['ID']['input'];
};


export type MutationRetryTranscriptionArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRunBillChaserManuallyArgs = {
  input?: InputMaybe<BillChaserRunInput>;
};


export type MutationScanEmailAndGenerateProjectProposalArgs = {
  emailContent: Scalars['String']['input'];
  emailSubject?: InputMaybe<Scalars['String']['input']>;
  senderEmail?: InputMaybe<Scalars['String']['input']>;
  senderName?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSendBookingReminderArgs = {
  bookingId: Scalars['String']['input'];
  customMessage?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSendBulkSmsArgs = {
  brand?: InputMaybe<Scalars['String']['input']>;
  contacts: Array<ContactInput>;
  list?: InputMaybe<Array<Scalars['String']['input']>>;
  message: Scalars['String']['input'];
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type MutationSendEmailArgs = {
  id: Scalars['ID']['input'];
};


export type MutationSendEmailCodeArgs = {
  email: Scalars['String']['input'];
};


export type MutationSendProposalArgs = {
  id: Scalars['ID']['input'];
};


export type MutationSendRsvpResponseArgs = {
  eventId: Scalars['String']['input'];
  fromEmail?: InputMaybe<Scalars['String']['input']>;
  response: Scalars['String']['input'];
};


export type MutationSendSmsArgs = {
  brand?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  list?: InputMaybe<Array<Scalars['String']['input']>>;
  message: Scalars['String']['input'];
  phoneNumber: Scalars['String']['input'];
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type MutationSendSmsCodeArgs = {
  phoneNumber: Scalars['String']['input'];
};


export type MutationSendTestBookingUrlArgs = {
  brand?: InputMaybe<Scalars['String']['input']>;
  phoneNumber: Scalars['String']['input'];
};


export type MutationSendTestEmailArgs = {
  input: EmailInput;
};


export type MutationSendTestEmailWithTenantArgs = {
  tenantId?: InputMaybe<Scalars['String']['input']>;
  to: Scalars['String']['input'];
};


export type MutationSendTestSmsArgs = {
  phoneNumber: Scalars['String']['input'];
  tenantId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSetBillChaserSafetyLimitsArgs = {
  maxBillsPerRun: Scalars['Float']['input'];
  minBillAgeInDays: Scalars['Float']['input'];
};


export type MutationSetClientPermissionsArgs = {
  clientId: Scalars['ID']['input'];
  permissions: Array<ClientPermission>;
};


export type MutationSetClientTagsArgs = {
  clientId: Scalars['ID']['input'];
  tags: Array<Scalars['String']['input']>;
};


export type MutationSetupCallForwardingArgs = {
  forwardToNumber: Scalars['String']['input'];
  phoneNumberId: Scalars['ID']['input'];
  recordCalls?: Scalars['Boolean']['input'];
};


export type MutationShareCalendarArgs = {
  id: Scalars['String']['input'];
  permissions: Array<CalendarPermission>;
  sharedWithEmail: Scalars['String']['input'];
};


export type MutationSharePasswordArgs = {
  clientIds: Array<Scalars['ID']['input']>;
  id: Scalars['ID']['input'];
};


export type MutationSignProposalArgs = {
  clientId?: InputMaybe<Scalars['ID']['input']>;
  emailVerificationCode?: InputMaybe<Scalars['String']['input']>;
  phoneVerificationCode?: InputMaybe<Scalars['String']['input']>;
  postmarkMessageId?: InputMaybe<Scalars['String']['input']>;
  proposalId: Scalars['ID']['input'];
  signatureImage: Scalars['String']['input'];
  signerEmail: Scalars['String']['input'];
  signerName: Scalars['String']['input'];
  signerPhone?: InputMaybe<Scalars['String']['input']>;
  signerRole?: InputMaybe<Scalars['String']['input']>;
};


export type MutationStarInboundEmailArgs = {
  id: Scalars['ID']['input'];
  isStarred: Scalars['Boolean']['input'];
};


export type MutationSubmitContactFormArgs = {
  input: SubmitContactFormInput;
};


export type MutationSyncCallRecordingsArgs = {
  days?: Scalars['Int']['input'];
  phoneNumberId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationTestAiServiceArgs = {
  testText?: InputMaybe<Scalars['String']['input']>;
};


export type MutationToggleBillDraftStatusArgs = {
  id: Scalars['ID']['input'];
};


export type MutationToggleBillPaymentStatusArgs = {
  id: Scalars['ID']['input'];
};


export type MutationToggleBookableEventTypeStatusArgs = {
  id: Scalars['String']['input'];
};


export type MutationToggleCalendarEventTaskCompletionArgs = {
  id: Scalars['String']['input'];
};


export type MutationToggleCommunicationTaskStatusArgs = {
  id: Scalars['ID']['input'];
};


export type MutationTogglePinCompanyKnowledgeArticleArgs = {
  id: Scalars['ID']['input'];
};


export type MutationTranscribeAudioArgs = {
  input: TranscriptionUploadInput;
};


export type MutationTranscribeRecordingArgs = {
  recordingSid: Scalars['String']['input'];
};


export type MutationTransferCalendarOwnershipArgs = {
  calendarId: Scalars['String']['input'];
  newOwnerId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationTransferDomainArgs = {
  input: DomainTransferInput;
};


export type MutationUnarchiveMultipleInboundEmailsArgs = {
  ids: Array<Scalars['String']['input']>;
};


export type MutationUnassignEmailFromClientArgs = {
  clientId: Scalars['String']['input'];
  emailId: Scalars['String']['input'];
};


export type MutationUnassignPhoneNumberFromClientArgs = {
  clientId: Scalars['ID']['input'];
  phoneNumberId: Scalars['ID']['input'];
};


export type MutationUnpublishCompanyKnowledgeArticleArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateAssetArgs = {
  id: Scalars['ID']['input'];
  input: UpdateAssetInput;
};


export type MutationUpdateAvailabilityStatusArgs = {
  id: Scalars['ID']['input'];
  status: AvailabilityStatus;
};


export type MutationUpdateBillArgs = {
  id: Scalars['ID']['input'];
  input: BillInput;
};


export type MutationUpdateBillChaserConfigurationArgs = {
  input: BillChaserConfigInput;
};


export type MutationUpdateBillPaymentStatusArgs = {
  id: Scalars['ID']['input'];
  isPaid: Scalars['Boolean']['input'];
};


export type MutationUpdateBillStatusArgs = {
  id: Scalars['ID']['input'];
  status: BillStatus;
};


export type MutationUpdateBillStatusWithoutNotificationsArgs = {
  id: Scalars['ID']['input'];
  status: BillStatus;
};


export type MutationUpdateBookableEventTypeArgs = {
  id: Scalars['String']['input'];
  input: UpdateBusinessCalendarBookableEventTypeInput;
};


export type MutationUpdateBookingPaymentArgs = {
  bookingId: Scalars['String']['input'];
  paymentDetails?: InputMaybe<Scalars['String']['input']>;
  paymentStatus: Scalars['String']['input'];
};


export type MutationUpdateBusinessCalendarAvailabilityArgs = {
  calendarId: Scalars['String']['input'];
  input: UpdateBusinessCalendarAvailabilityInput;
};


export type MutationUpdateCalendarArgs = {
  id: Scalars['String']['input'];
  input: BusinessCalendarInput;
};


export type MutationUpdateCalendarEventTaskArgs = {
  id: Scalars['String']['input'];
  input: CalendarEventTaskInput;
};


export type MutationUpdateCalendarEventTaskChecklistItemArgs = {
  input: UpdateCalendarEventTaskChecklistInput;
};


export type MutationUpdateCalendarGoalArgs = {
  id: Scalars['String']['input'];
  input: CalendarGoalInput;
};


export type MutationUpdateClientArgs = {
  id: Scalars['ID']['input'];
  input: UpdateClientInput;
};


export type MutationUpdateCommunicationTaskArgs = {
  id: Scalars['ID']['input'];
  input: UpdateCommunicationTaskInput;
};


export type MutationUpdateCompanyArgs = {
  id: Scalars['ID']['input'];
  input: UpdateCompanyInput;
};


export type MutationUpdateCompanyKnowledgeArticleArgs = {
  id: Scalars['ID']['input'];
  input: UpdateCompanyKnowledgeInput;
};


export type MutationUpdateEmailArgs = {
  id: Scalars['ID']['input'];
  input: EmailUpdateInput;
};


export type MutationUpdateEmailAddressArgs = {
  id: Scalars['String']['input'];
  input: EmailAddressUpdateInput;
};


export type MutationUpdateEmployeeArgs = {
  id: Scalars['ID']['input'];
  input: UpdateEmployeeInput;
};


export type MutationUpdateEventArgs = {
  id: Scalars['String']['input'];
  input: CalendarEventInput;
};


export type MutationUpdateFarmerArgs = {
  id: Scalars['ID']['input'];
  input: UpdateFarmerInput;
};


export type MutationUpdateFrontendUpgradeArgs = {
  id: Scalars['ID']['input'];
  input: UpdateFrontendUpgradeInput;
};


export type MutationUpdateGoalCheckpointArgs = {
  input: UpdateGoalCheckpointInput;
};


export type MutationUpdateIpfsVideoArgs = {
  id: Scalars['String']['input'];
  input: IpfsVideoInput;
};


export type MutationUpdateInfluencerArgs = {
  id: Scalars['ID']['input'];
  input: UpdateInfluencerInput;
};


export type MutationUpdateInfluencerBookingStatusArgs = {
  id: Scalars['ID']['input'];
  status: InfluencerBookingStatus;
};


export type MutationUpdateInfluencerMetricsArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateInvoiceArgs = {
  id: Scalars['ID']['input'];
  input: UpdateInvoiceInput;
};


export type MutationUpdateLineItemArgs = {
  amount?: InputMaybe<Scalars['Float']['input']>;
  billId: Scalars['ID']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  lineItemId: Scalars['ID']['input'];
};


export type MutationUpdateMeetingArgs = {
  id: Scalars['ID']['input'];
  input: UpdateMeetingInput;
};


export type MutationUpdateMeetingParticipantsArgs = {
  meetingId: Scalars['ID']['input'];
  participants: Array<MeetingParticipantInput>;
};


export type MutationUpdateMeetingTaskArgs = {
  id: Scalars['ID']['input'];
  input: UpdateMeetingTaskInput;
};


export type MutationUpdateMeetingTranscriptionArgs = {
  actionItems?: InputMaybe<Array<Scalars['String']['input']>>;
  keyPoints?: InputMaybe<Array<Scalars['String']['input']>>;
  meetingId: Scalars['ID']['input'];
  summary?: InputMaybe<Scalars['String']['input']>;
  transcription: Scalars['String']['input'];
};


export type MutationUpdateMyWebsiteArgs = {
  input: UpdateTenantInput;
};


export type MutationUpdateNameserversArgs = {
  input: UpdateNameserversInput;
};


export type MutationUpdateOpportunityArgs = {
  id: Scalars['String']['input'];
  input: OpportunityUpdateInput;
};


export type MutationUpdateOpportunityMeetingArgs = {
  id: Scalars['String']['input'];
  input: OpportunityMeetingUpdateInput;
};


export type MutationUpdateOpportunityMemberArgs = {
  id: Scalars['String']['input'];
  input: OpportunityMemberUpdateInput;
};


export type MutationUpdateOpportunityNoteArgs = {
  id: Scalars['String']['input'];
  input: OpportunityNoteUpdateInput;
};


export type MutationUpdateOpportunityPaymentStatusArgs = {
  opportunityId: Scalars['String']['input'];
  paymentIndex: Scalars['Float']['input'];
  status: Scalars['String']['input'];
};


export type MutationUpdateOpportunityStageArgs = {
  id: Scalars['String']['input'];
  input: OpportunityStageUpdateInput;
};


export type MutationUpdateOpportunityTaskArgs = {
  id: Scalars['String']['input'];
  input: OpportunityTaskUpdateInput;
};


export type MutationUpdateOrderStatusArgs = {
  id: Scalars['ID']['input'];
  status: OrderStatus;
  trackingNumber?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdatePasswordArgs = {
  id: Scalars['ID']['input'];
  input: PasswordUpdateInput;
};


export type MutationUpdatePaymentStatusArgs = {
  opportunityId: Scalars['String']['input'];
  paymentType: Scalars['String']['input'];
  receivedDate?: InputMaybe<Scalars['DateTime']['input']>;
  status: Scalars['String']['input'];
};


export type MutationUpdatePayoutStatusArgs = {
  clientId: Scalars['String']['input'];
  opportunityId: Scalars['String']['input'];
  paidOutDate?: InputMaybe<Scalars['DateTime']['input']>;
  paymentType: Scalars['String']['input'];
  status: Scalars['String']['input'];
  transactionId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdatePhoneNumberArgs = {
  id: Scalars['ID']['input'];
  input: TwilioPhoneNumberInput;
};


export type MutationUpdateProductArgs = {
  id: Scalars['ID']['input'];
  input: ProductInput;
};


export type MutationUpdateProjectArgs = {
  id: Scalars['ID']['input'];
  input: ProjectUpdateInput;
};


export type MutationUpdateProjectProgressArgs = {
  id: Scalars['ID']['input'];
  input: UpdateProjectProgressInput;
};


export type MutationUpdateProposalArgs = {
  id: Scalars['ID']['input'];
  input: UpdateProposalInput;
};


export type MutationUpdateProposalSignedPdfArgs = {
  id: Scalars['ID']['input'];
  pdfCid: Scalars['String']['input'];
  pdfUrl: Scalars['String']['input'];
};


export type MutationUpdateProviderArgs = {
  id: Scalars['ID']['input'];
  input: UpdateProviderInput;
};


export type MutationUpdateProviderStatusArgs = {
  id: Scalars['ID']['input'];
  status: ProviderStatus;
};


export type MutationUpdateProviderUrlSlugArgs = {
  id: Scalars['ID']['input'];
  urlSlug: Scalars['String']['input'];
};


export type MutationUpdateQuoteStatusArgs = {
  id: Scalars['ID']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  status: QuoteStatus;
};


export type MutationUpdateRdActivityArgs = {
  id: Scalars['String']['input'];
  input: RdActivityInput;
};


export type MutationUpdateRdProjectArgs = {
  id: Scalars['String']['input'];
  input: RdProjectInput;
};


export type MutationUpdateRdTimeEntryArgs = {
  id: Scalars['String']['input'];
  input: RdTimeEntryInput;
};


export type MutationUpdateSellerProfileArgs = {
  id: Scalars['ID']['input'];
  input: UpdateSellerProfileInput;
};


export type MutationUpdateSellerProfileStatusArgs = {
  id: Scalars['ID']['input'];
  status: SellerProfileStatus;
};


export type MutationUpdateSessionArgs = {
  id: Scalars['String']['input'];
  input: SessionInput;
};


export type MutationUpdateSessionTypeArgs = {
  id: Scalars['ID']['input'];
  input: SessionTypeInput;
};


export type MutationUpdateSubscriptionArgs = {
  id: Scalars['ID']['input'];
  input: UpdateSubscriptionInput;
};


export type MutationUpdateTaskArgs = {
  id: Scalars['ID']['input'];
  input: TaskInput;
};


export type MutationUpdateTaskOrderArgs = {
  order: Scalars['Int']['input'];
  taskId: Scalars['ID']['input'];
};


export type MutationUpdateTaskStatusArgs = {
  status: TaskStatus;
  taskId: Scalars['ID']['input'];
};


export type MutationUpdateTenantArgs = {
  id: Scalars['ID']['input'];
  input: UpdateTenantInput;
};


export type MutationUpdateTenantCompanyDetailsArgs = {
  companyDetails: TenantCompanyDetailsInput;
};


export type MutationUpdateTenantPaymentDetailsArgs = {
  paymentDetails: PaymentReceivingDetailsInput;
};


export type MutationUpdateTranscriptionArgs = {
  id: Scalars['ID']['input'];
  input: TranscriptionUpdateInput;
};


export type MutationUploadFileArgs = {
  file: Scalars['Upload']['input'];
};


export type MutationUploadMeetingAudioArgs = {
  audioIpfsHash: Scalars['String']['input'];
  meetingId: Scalars['ID']['input'];
};


export type MutationUploadRdEvidenceArgs = {
  activityId?: InputMaybe<Scalars['String']['input']>;
  content?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  evidenceType: Scalars['String']['input'];
  fileBase64?: InputMaybe<Scalars['String']['input']>;
  fileName?: InputMaybe<Scalars['String']['input']>;
  fileUrl?: InputMaybe<Scalars['String']['input']>;
  participants?: InputMaybe<Scalars['String']['input']>;
  projectId: Scalars['String']['input'];
  source?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUploadTaskMediaArgs = {
  file: Scalars['Upload']['input'];
};


export type MutationUploadToPinataArgs = {
  file: Scalars['Upload']['input'];
};


export type MutationUploadUnencryptedFileArgs = {
  file: Scalars['Upload']['input'];
};


export type MutationUploadVideoToIpfsArgs = {
  file: Scalars['Upload']['input'];
  input: IpfsVideoInput;
};


export type MutationUpsertCalendarTagArgs = {
  calendarId: Scalars['String']['input'];
  input: CalendarTagInput;
};


export type MutationValidateMemberSplitsArgs = {
  opportunityId: Scalars['String']['input'];
};


export type MutationVerifyAuthArgs = {
  input: VerifyInput;
};


export type MutationVerifyAuthViaSmsArgs = {
  input: VerifySmsInput;
};


export type MutationVerifyEmailChangeArgs = {
  input: VerifyEmailChangeInput;
};


export type MutationVerifyEmailCodeArgs = {
  code: Scalars['String']['input'];
  email: Scalars['String']['input'];
};


export type MutationVerifyInfluencerArgs = {
  id: Scalars['ID']['input'];
};


export type MutationVerifyPhoneChangeArgs = {
  input: VerifyPhoneChangeInput;
};


export type MutationVerifyProposalEmailArgs = {
  input: VerifyProposalEmailInput;
};


export type MutationVerifySmsCodeArgs = {
  code: Scalars['String']['input'];
  phoneNumber: Scalars['String']['input'];
};

export type NoteAttachment = {
  __typename?: 'NoteAttachment';
  fileSize?: Maybe<Scalars['Float']['output']>;
  fileType?: Maybe<Scalars['String']['output']>;
  filename: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type NoteAttachmentInput = {
  fileSize?: InputMaybe<Scalars['Float']['input']>;
  fileType?: InputMaybe<Scalars['String']['input']>;
  filename: Scalars['String']['input'];
  url: Scalars['String']['input'];
};

/** Priority level of the note */
export enum NotePriority {
  Critical = 'CRITICAL',
  High = 'HIGH',
  Low = 'LOW',
  Medium = 'MEDIUM'
}

/** Type of note */
export enum NoteType {
  CallNotes = 'CALL_NOTES',
  CompetitorIntel = 'COMPETITOR_INTEL',
  CustomerFeedback = 'CUSTOMER_FEEDBACK',
  DecisionCriteria = 'DECISION_CRITERIA',
  EmailSummary = 'EMAIL_SUMMARY',
  General = 'GENERAL',
  Internal = 'INTERNAL',
  MeetingNotes = 'MEETING_NOTES',
  Other = 'OTHER',
  PricingDiscussion = 'PRICING_DISCUSSION',
  RiskAssessment = 'RISK_ASSESSMENT',
  TechnicalRequirements = 'TECHNICAL_REQUIREMENTS',
  WinLossAnalysis = 'WIN_LOSS_ANALYSIS'
}

/** Visibility level of the note */
export enum NoteVisibility {
  Internal = 'INTERNAL',
  Private = 'PRIVATE',
  Public = 'PUBLIC',
  Restricted = 'RESTRICTED'
}

export type Opportunity = {
  __typename?: 'Opportunity';
  activities?: Maybe<Array<OpportunityActivity>>;
  actualCloseDate?: Maybe<Scalars['DateTime']['output']>;
  additionalContacts?: Maybe<Array<OpportunityContact>>;
  assignedTo?: Maybe<Scalars['String']['output']>;
  assignedToName?: Maybe<Scalars['String']['output']>;
  callCount: Scalars['Int']['output'];
  campaign?: Maybe<Scalars['String']['output']>;
  category?: Maybe<Scalars['String']['output']>;
  clientEmail?: Maybe<Scalars['String']['output']>;
  clientId: Scalars['String']['output'];
  clientName?: Maybe<Scalars['String']['output']>;
  clientPhone?: Maybe<Scalars['String']['output']>;
  competitorNotes?: Maybe<Scalars['String']['output']>;
  competitors?: Maybe<Array<Scalars['String']['output']>>;
  completedTaskCount: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  createdByName?: Maybe<Scalars['String']['output']>;
  customFields?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  emailCount: Scalars['Int']['output'];
  expectedCloseDate?: Maybe<Scalars['DateTime']['output']>;
  expectedRevenue?: Maybe<Scalars['Float']['output']>;
  finalValue?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  internalNotes?: Maybe<Scalars['String']['output']>;
  lastActivityDate?: Maybe<Scalars['DateTime']['output']>;
  lossNotes?: Maybe<Scalars['String']['output']>;
  lossReason?: Maybe<Scalars['String']['output']>;
  meetingCount: Scalars['Int']['output'];
  memberCount: Scalars['Int']['output'];
  members?: Maybe<Array<Scalars['String']['output']>>;
  nextFollowUpDate?: Maybe<Scalars['DateTime']['output']>;
  noteCount: Scalars['Int']['output'];
  paymentSchedule?: Maybe<Array<PaymentScheduleItem>>;
  priority: OpportunityPriority;
  probability: Scalars['Float']['output'];
  products?: Maybe<Array<Scalars['String']['output']>>;
  projectedTotalValue?: Maybe<Scalars['Float']['output']>;
  recurringPayment?: Maybe<RecurringPayment>;
  referralSource?: Maybe<Scalars['String']['output']>;
  services?: Maybe<Array<Scalars['String']['output']>>;
  source?: Maybe<Scalars['String']['output']>;
  stage: Scalars['String']['output'];
  status: OpportunityStatus;
  tags?: Maybe<Array<Scalars['String']['output']>>;
  taskCount: Scalars['Int']['output'];
  tenantId: Scalars['String']['output'];
  title: Scalars['String']['output'];
  totalPaidAmount?: Maybe<Scalars['Float']['output']>;
  totalScheduledAmount?: Maybe<Scalars['Float']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  value: Scalars['Float']['output'];
  valueMemberSplits?: Maybe<Array<MemberSplit>>;
  valuePaymentStatus?: Maybe<OpportunityPaymentStatus>;
  valueReceivedDate?: Maybe<Scalars['DateTime']['output']>;
  winNotes?: Maybe<Scalars['String']['output']>;
};

export type OpportunityActivity = {
  __typename?: 'OpportunityActivity';
  createdBy?: Maybe<Scalars['String']['output']>;
  date: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  outcome?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
};

export type OpportunityContact = {
  __typename?: 'OpportunityContact';
  email?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  role?: Maybe<Scalars['String']['output']>;
};

export type OpportunityInput = {
  assignedTo?: InputMaybe<Scalars['String']['input']>;
  campaign?: InputMaybe<Scalars['String']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  clientId: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  expectedCloseDate?: InputMaybe<Scalars['DateTime']['input']>;
  internalNotes?: InputMaybe<Scalars['String']['input']>;
  paymentSchedule?: InputMaybe<Array<PaymentScheduleItemInput>>;
  priority?: InputMaybe<OpportunityPriority>;
  probability?: InputMaybe<Scalars['Float']['input']>;
  products?: InputMaybe<Array<Scalars['String']['input']>>;
  recurringPayment?: InputMaybe<RecurringPaymentInput>;
  services?: InputMaybe<Array<Scalars['String']['input']>>;
  source?: InputMaybe<Scalars['String']['input']>;
  stage?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<OpportunityStatus>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title: Scalars['String']['input'];
  value?: InputMaybe<Scalars['Float']['input']>;
  valueMemberSplits?: InputMaybe<Array<MemberSplitInput>>;
};

export type OpportunityMeeting = {
  __typename?: 'OpportunityMeeting';
  actionItems?: Maybe<Scalars['String']['output']>;
  actualEndTime?: Maybe<Scalars['DateTime']['output']>;
  actualStartTime?: Maybe<Scalars['DateTime']['output']>;
  address?: Maybe<Scalars['String']['output']>;
  agenda?: Maybe<Array<MeetingAgendaItem>>;
  attachmentUrls?: Maybe<Array<Scalars['String']['output']>>;
  attendees?: Maybe<Array<MeetingAttendee>>;
  cancelledAt?: Maybe<Scalars['DateTime']['output']>;
  cancelledBy?: Maybe<Scalars['String']['output']>;
  cancelledReason?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  createdByName?: Maybe<Scalars['String']['output']>;
  decisions?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  dialInNumber?: Maybe<Scalars['String']['output']>;
  documentIds?: Maybe<Array<Scalars['String']['output']>>;
  duration: Scalars['Int']['output'];
  followUpCompleted: Scalars['Boolean']['output'];
  followUpDate?: Maybe<Scalars['DateTime']['output']>;
  format: MeetingFormat;
  id: Scalars['ID']['output'];
  keyTakeaways?: Maybe<Scalars['String']['output']>;
  location?: Maybe<Scalars['String']['output']>;
  meetingId?: Maybe<Scalars['String']['output']>;
  meetingUrl?: Maybe<Scalars['String']['output']>;
  nextSteps?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  objectives?: Maybe<Scalars['String']['output']>;
  opportunityId: Scalars['String']['output'];
  opportunityTitle?: Maybe<Scalars['String']['output']>;
  organizerId?: Maybe<Scalars['String']['output']>;
  organizerName?: Maybe<Scalars['String']['output']>;
  outcome?: Maybe<Scalars['String']['output']>;
  passcode?: Maybe<Scalars['String']['output']>;
  preparationNotes?: Maybe<Scalars['String']['output']>;
  questionsToAsk?: Maybe<Array<Scalars['String']['output']>>;
  recordingUrl?: Maybe<Scalars['String']['output']>;
  relatedProposalId?: Maybe<Scalars['String']['output']>;
  relatedQuoteId?: Maybe<Scalars['String']['output']>;
  relatedTaskId?: Maybe<Scalars['String']['output']>;
  reminderDate?: Maybe<Scalars['DateTime']['output']>;
  reminderEnabled: Scalars['Boolean']['output'];
  reminderSent: Scalars['Boolean']['output'];
  rescheduledFrom?: Maybe<Scalars['String']['output']>;
  rescheduledTo?: Maybe<Scalars['String']['output']>;
  scheduledDate: Scalars['DateTime']['output'];
  status: MeetingStatus;
  tags?: Maybe<Array<Scalars['String']['output']>>;
  talkingPoints?: Maybe<Array<Scalars['String']['output']>>;
  tenantId: Scalars['String']['output'];
  title: Scalars['String']['output'];
  transcriptUrl?: Maybe<Scalars['String']['output']>;
  type: MeetingType;
  updatedAt: Scalars['DateTime']['output'];
};

export type OpportunityMeetingInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  agenda?: InputMaybe<Array<MeetingAgendaItemInput>>;
  attendees?: InputMaybe<Array<MeetingAttendeeInput>>;
  description?: InputMaybe<Scalars['String']['input']>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  format?: InputMaybe<MeetingFormat>;
  location?: InputMaybe<Scalars['String']['input']>;
  meetingUrl?: InputMaybe<Scalars['String']['input']>;
  objectives?: InputMaybe<Scalars['String']['input']>;
  opportunityId: Scalars['String']['input'];
  preparationNotes?: InputMaybe<Scalars['String']['input']>;
  questionsToAsk?: InputMaybe<Array<Scalars['String']['input']>>;
  reminderDate?: InputMaybe<Scalars['DateTime']['input']>;
  reminderEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  scheduledDate: Scalars['DateTime']['input'];
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  talkingPoints?: InputMaybe<Array<Scalars['String']['input']>>;
  title: Scalars['String']['input'];
  type?: InputMaybe<MeetingType>;
};

export type OpportunityMeetingUpdateInput = {
  actionItems?: InputMaybe<Scalars['String']['input']>;
  actualEndTime?: InputMaybe<Scalars['DateTime']['input']>;
  actualStartTime?: InputMaybe<Scalars['DateTime']['input']>;
  agenda?: InputMaybe<Array<MeetingAgendaItemInput>>;
  attendees?: InputMaybe<Array<MeetingAttendeeInput>>;
  cancelledReason?: InputMaybe<Scalars['String']['input']>;
  decisions?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  followUpDate?: InputMaybe<Scalars['DateTime']['input']>;
  format?: InputMaybe<MeetingFormat>;
  keyTakeaways?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  meetingUrl?: InputMaybe<Scalars['String']['input']>;
  nextSteps?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  outcome?: InputMaybe<Scalars['String']['input']>;
  recordingUrl?: InputMaybe<Scalars['String']['input']>;
  scheduledDate?: InputMaybe<Scalars['DateTime']['input']>;
  status?: InputMaybe<MeetingStatus>;
  title?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<MeetingType>;
};

export type OpportunityMember = {
  __typename?: 'OpportunityMember';
  clientEmail?: Maybe<Scalars['String']['output']>;
  clientId: Scalars['String']['output'];
  clientName?: Maybe<Scalars['String']['output']>;
  commissionSplits?: Maybe<Array<CommissionSplit>>;
  createdAt: Scalars['DateTime']['output'];
  defaultPayoutDelayDays?: Maybe<Scalars['Int']['output']>;
  defaultSplitPercentage: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  opportunityId: Scalars['String']['output'];
  role?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['String']['output'];
  totalEarned?: Maybe<Scalars['Float']['output']>;
  totalPending?: Maybe<Scalars['Float']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type OpportunityMemberInput = {
  clientId: Scalars['String']['input'];
  commissionSplits?: InputMaybe<Array<CommissionSplitInput>>;
  defaultPayoutDelayDays?: InputMaybe<Scalars['Int']['input']>;
  defaultSplitPercentage?: InputMaybe<Scalars['Float']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
};

export type OpportunityMemberUpdateInput = {
  commissionSplits?: InputMaybe<Array<CommissionSplitInput>>;
  defaultPayoutDelayDays?: InputMaybe<Scalars['Int']['input']>;
  defaultSplitPercentage?: InputMaybe<Scalars['Float']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
};

export type OpportunityNote = {
  __typename?: 'OpportunityNote';
  actionItems?: Maybe<Array<Scalars['String']['output']>>;
  allowedRoles?: Maybe<Array<Scalars['String']['output']>>;
  allowedUserIds?: Maybe<Array<Scalars['String']['output']>>;
  attachments?: Maybe<Array<NoteAttachment>>;
  category?: Maybe<Scalars['String']['output']>;
  confidenceLevel?: Maybe<Scalars['String']['output']>;
  contactCompany?: Maybe<Scalars['String']['output']>;
  contactEmail?: Maybe<Scalars['String']['output']>;
  contactPerson?: Maybe<Scalars['String']['output']>;
  contactPhone?: Maybe<Scalars['String']['output']>;
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  createdByName?: Maybe<Scalars['String']['output']>;
  followUpAction?: Maybe<Scalars['String']['output']>;
  followUpCompleted: Scalars['Boolean']['output'];
  followUpDate?: Maybe<Scalars['DateTime']['output']>;
  followUpRequired?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['ID']['output'];
  isActionable: Scalars['Boolean']['output'];
  isDecisionFactor: Scalars['Boolean']['output'];
  isOpportunity: Scalars['Boolean']['output'];
  isPinned: Scalars['Boolean']['output'];
  isRisk: Scalars['Boolean']['output'];
  keyPoints?: Maybe<Array<Scalars['String']['output']>>;
  lastEditedAt?: Maybe<Scalars['DateTime']['output']>;
  lastEditedBy?: Maybe<Scalars['String']['output']>;
  lastEditedByName?: Maybe<Scalars['String']['output']>;
  mentionedCompetitors?: Maybe<Array<Scalars['String']['output']>>;
  mentionedProducts?: Maybe<Array<Scalars['String']['output']>>;
  mentionedUserIds?: Maybe<Array<Scalars['String']['output']>>;
  opportunityId: Scalars['String']['output'];
  opportunityTitle?: Maybe<Scalars['String']['output']>;
  previousVersion?: Maybe<Scalars['String']['output']>;
  priority: NotePriority;
  relatedCallId?: Maybe<Scalars['String']['output']>;
  relatedEmailId?: Maybe<Scalars['String']['output']>;
  relatedMeetingId?: Maybe<Scalars['String']['output']>;
  relatedQuoteId?: Maybe<Scalars['String']['output']>;
  relatedTaskId?: Maybe<Scalars['String']['output']>;
  sentiment?: Maybe<Scalars['String']['output']>;
  source?: Maybe<Scalars['String']['output']>;
  sourceDate?: Maybe<Scalars['DateTime']['output']>;
  sourceUrl?: Maybe<Scalars['String']['output']>;
  summary?: Maybe<Scalars['String']['output']>;
  tags?: Maybe<Array<Scalars['String']['output']>>;
  tenantId: Scalars['String']['output'];
  title: Scalars['String']['output'];
  type: NoteType;
  updatedAt: Scalars['DateTime']['output'];
  version?: Maybe<Scalars['Float']['output']>;
  visibility: NoteVisibility;
};

export type OpportunityNoteInput = {
  actionItems?: InputMaybe<Array<Scalars['String']['input']>>;
  allowedUserIds?: InputMaybe<Array<Scalars['String']['input']>>;
  attachments?: InputMaybe<Array<NoteAttachmentInput>>;
  category?: InputMaybe<Scalars['String']['input']>;
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactPerson?: InputMaybe<Scalars['String']['input']>;
  content: Scalars['String']['input'];
  followUpAction?: InputMaybe<Scalars['String']['input']>;
  followUpDate?: InputMaybe<Scalars['DateTime']['input']>;
  followUpRequired?: InputMaybe<Scalars['Boolean']['input']>;
  isActionable?: InputMaybe<Scalars['Boolean']['input']>;
  isDecisionFactor?: InputMaybe<Scalars['Boolean']['input']>;
  isOpportunity?: InputMaybe<Scalars['Boolean']['input']>;
  isPinned?: InputMaybe<Scalars['Boolean']['input']>;
  isRisk?: InputMaybe<Scalars['Boolean']['input']>;
  keyPoints?: InputMaybe<Array<Scalars['String']['input']>>;
  mentionedCompetitors?: InputMaybe<Array<Scalars['String']['input']>>;
  mentionedProducts?: InputMaybe<Array<Scalars['String']['input']>>;
  opportunityId: Scalars['String']['input'];
  priority?: InputMaybe<NotePriority>;
  relatedMeetingId?: InputMaybe<Scalars['String']['input']>;
  relatedTaskId?: InputMaybe<Scalars['String']['input']>;
  sentiment?: InputMaybe<Scalars['String']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  summary?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title: Scalars['String']['input'];
  type?: InputMaybe<NoteType>;
  visibility?: InputMaybe<NoteVisibility>;
};

export type OpportunityNoteUpdateInput = {
  actionItems?: InputMaybe<Array<Scalars['String']['input']>>;
  allowedUserIds?: InputMaybe<Array<Scalars['String']['input']>>;
  attachments?: InputMaybe<Array<NoteAttachmentInput>>;
  category?: InputMaybe<Scalars['String']['input']>;
  contactPerson?: InputMaybe<Scalars['String']['input']>;
  content?: InputMaybe<Scalars['String']['input']>;
  followUpAction?: InputMaybe<Scalars['String']['input']>;
  followUpCompleted?: InputMaybe<Scalars['Boolean']['input']>;
  followUpDate?: InputMaybe<Scalars['DateTime']['input']>;
  followUpRequired?: InputMaybe<Scalars['Boolean']['input']>;
  isActionable?: InputMaybe<Scalars['Boolean']['input']>;
  isDecisionFactor?: InputMaybe<Scalars['Boolean']['input']>;
  isOpportunity?: InputMaybe<Scalars['Boolean']['input']>;
  isPinned?: InputMaybe<Scalars['Boolean']['input']>;
  isRisk?: InputMaybe<Scalars['Boolean']['input']>;
  keyPoints?: InputMaybe<Array<Scalars['String']['input']>>;
  priority?: InputMaybe<NotePriority>;
  sentiment?: InputMaybe<Scalars['String']['input']>;
  summary?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<NoteType>;
  visibility?: InputMaybe<NoteVisibility>;
};

/** Status of payment processing for opportunities */
export enum OpportunityPaymentStatus {
  Cancelled = 'CANCELLED',
  Distributed = 'DISTRIBUTED',
  Pending = 'PENDING',
  Received = 'RECEIVED'
}

/** Priority level of the opportunity */
export enum OpportunityPriority {
  Critical = 'CRITICAL',
  High = 'HIGH',
  Low = 'LOW',
  Medium = 'MEDIUM'
}

export type OpportunityStage = {
  __typename?: 'OpportunityStage';
  autoMoveDays?: Maybe<Scalars['Int']['output']>;
  autoMoveEnabled: Scalars['Boolean']['output'];
  averageDaysInStage: Scalars['Float']['output'];
  code: Scalars['String']['output'];
  color: Scalars['String']['output'];
  conversionRate: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  currentOpportunities: Scalars['Int']['output'];
  defaultProbability: Scalars['Int']['output'];
  description?: Maybe<Scalars['String']['output']>;
  documentTemplates?: Maybe<Array<Scalars['String']['output']>>;
  emailTemplate?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDefault: Scalars['Boolean']['output'];
  isFinalStage: Scalars['Boolean']['output'];
  isLostStage: Scalars['Boolean']['output'];
  isWonStage: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  nextStageCode?: Maybe<Scalars['String']['output']>;
  notifyOnEntry: Scalars['Boolean']['output'];
  notifyOnExit: Scalars['Boolean']['output'];
  notifyUsers?: Maybe<Array<Scalars['String']['output']>>;
  order: Scalars['Int']['output'];
  requiredFields?: Maybe<Array<Scalars['String']['output']>>;
  requiredTasks?: Maybe<Array<Scalars['String']['output']>>;
  taskTemplates?: Maybe<Array<Scalars['String']['output']>>;
  tenantId: Scalars['String']['output'];
  totalOpportunities: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type OpportunityStageInput = {
  autoMoveDays?: InputMaybe<Scalars['Int']['input']>;
  autoMoveEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  code: Scalars['String']['input'];
  color: Scalars['String']['input'];
  defaultProbability?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  isFinalStage?: InputMaybe<Scalars['Boolean']['input']>;
  isLostStage?: InputMaybe<Scalars['Boolean']['input']>;
  isWonStage?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  nextStageCode?: InputMaybe<Scalars['String']['input']>;
  notifyOnEntry?: InputMaybe<Scalars['Boolean']['input']>;
  notifyOnExit?: InputMaybe<Scalars['Boolean']['input']>;
  order: Scalars['Int']['input'];
};

export type OpportunityStageUpdateInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  defaultProbability?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
};

/** Status of the opportunity */
export enum OpportunityStatus {
  Active = 'ACTIVE',
  Cancelled = 'CANCELLED',
  Lost = 'LOST',
  OnHold = 'ON_HOLD',
  Won = 'WON'
}

export type OpportunityTask = {
  __typename?: 'OpportunityTask';
  actualHours?: Maybe<Scalars['Float']['output']>;
  assignedTo?: Maybe<Scalars['String']['output']>;
  assignedToName?: Maybe<Scalars['String']['output']>;
  checklistCompleted?: Maybe<Array<Scalars['Boolean']['output']>>;
  checklistItems?: Maybe<Array<Scalars['String']['output']>>;
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  completedBy?: Maybe<Scalars['String']['output']>;
  completedByName?: Maybe<Scalars['String']['output']>;
  contactEmail?: Maybe<Scalars['String']['output']>;
  contactPerson?: Maybe<Scalars['String']['output']>;
  contactPhone?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  createdByName?: Maybe<Scalars['String']['output']>;
  dependsOn?: Maybe<Array<Scalars['String']['output']>>;
  description?: Maybe<Scalars['String']['output']>;
  dueDate?: Maybe<Scalars['DateTime']['output']>;
  estimatedHours?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  isBlocking: Scalars['Boolean']['output'];
  location?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  opportunityId: Scalars['String']['output'];
  opportunityTitle?: Maybe<Scalars['String']['output']>;
  outcome?: Maybe<Scalars['String']['output']>;
  priority: OpportunityTaskPriority;
  relatedDocumentId?: Maybe<Scalars['String']['output']>;
  relatedEmailId?: Maybe<Scalars['String']['output']>;
  relatedMeetingId?: Maybe<Scalars['String']['output']>;
  reminderDate?: Maybe<Scalars['DateTime']['output']>;
  reminderEnabled: Scalars['Boolean']['output'];
  reminderSent: Scalars['Boolean']['output'];
  startedAt?: Maybe<Scalars['DateTime']['output']>;
  status: OpportunityTaskStatus;
  tags?: Maybe<Array<Scalars['String']['output']>>;
  tenantId: Scalars['String']['output'];
  title: Scalars['String']['output'];
  type: OpportunityTaskType;
  updatedAt: Scalars['DateTime']['output'];
};

export type OpportunityTaskInput = {
  assignedTo?: InputMaybe<Scalars['String']['input']>;
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactPerson?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['DateTime']['input']>;
  isBlocking?: InputMaybe<Scalars['Boolean']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  opportunityId: Scalars['String']['input'];
  priority?: InputMaybe<OpportunityTaskPriority>;
  reminderDate?: InputMaybe<Scalars['DateTime']['input']>;
  reminderEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title: Scalars['String']['input'];
  type?: InputMaybe<OpportunityTaskType>;
};

/** Priority level of the task */
export enum OpportunityTaskPriority {
  High = 'HIGH',
  Low = 'LOW',
  Medium = 'MEDIUM',
  Urgent = 'URGENT'
}

/** Status of the task */
export enum OpportunityTaskStatus {
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  Deferred = 'DEFERRED',
  InProgress = 'IN_PROGRESS',
  Pending = 'PENDING'
}

/** Type of opportunity task */
export enum OpportunityTaskType {
  Call = 'CALL',
  Demo = 'DEMO',
  Document = 'DOCUMENT',
  Email = 'EMAIL',
  FollowUp = 'FOLLOW_UP',
  Internal = 'INTERNAL',
  Meeting = 'MEETING',
  Other = 'OTHER',
  Proposal = 'PROPOSAL',
  Research = 'RESEARCH'
}

export type OpportunityTaskUpdateInput = {
  actualHours?: InputMaybe<Scalars['Float']['input']>;
  assignedTo?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['DateTime']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  outcome?: InputMaybe<Scalars['String']['input']>;
  priority?: InputMaybe<OpportunityTaskPriority>;
  status?: InputMaybe<OpportunityTaskStatus>;
  title?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<OpportunityTaskType>;
};

export type OpportunityUpdateInput = {
  assignedTo?: InputMaybe<Scalars['String']['input']>;
  campaign?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  expectedCloseDate?: InputMaybe<Scalars['DateTime']['input']>;
  finalValue?: InputMaybe<Scalars['Float']['input']>;
  internalNotes?: InputMaybe<Scalars['String']['input']>;
  lossNotes?: InputMaybe<Scalars['String']['input']>;
  lossReason?: InputMaybe<Scalars['String']['input']>;
  nextFollowUpDate?: InputMaybe<Scalars['DateTime']['input']>;
  paymentSchedule?: InputMaybe<Array<PaymentScheduleItemInput>>;
  priority?: InputMaybe<OpportunityPriority>;
  probability?: InputMaybe<Scalars['Float']['input']>;
  recurringPayment?: InputMaybe<RecurringPaymentInput>;
  source?: InputMaybe<Scalars['String']['input']>;
  stage?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<OpportunityStatus>;
  title?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['Float']['input']>;
  valueMemberSplits?: InputMaybe<Array<MemberSplitInput>>;
  winNotes?: InputMaybe<Scalars['String']['input']>;
};

export type OrderItem = {
  __typename?: 'OrderItem';
  digitalDeliveryTracking?: Maybe<DigitalDeliveryTracking>;
  priceAtTime: Scalars['Float']['output'];
  product: Product;
  quantity: Scalars['Float']['output'];
  selectedVariantId?: Maybe<Scalars['String']['output']>;
};

export type OrderItemInput = {
  digitalDeliveryTracking?: InputMaybe<DigitalDeliveryTrackingInput>;
  productId: Scalars['ID']['input'];
  quantity: Scalars['Float']['input'];
  selectedVariantId?: InputMaybe<Scalars['String']['input']>;
};

/** The status of the product order */
export enum OrderStatus {
  Cancelled = 'CANCELLED',
  Delivered = 'DELIVERED',
  Paid = 'PAID',
  Pending = 'PENDING',
  Processing = 'PROCESSING',
  Shipped = 'SHIPPED'
}

export type OutboundEmailAttachment = {
  __typename?: 'OutboundEmailAttachment';
  content?: Maybe<Scalars['String']['output']>;
  contentLength: Scalars['Float']['output'];
  contentType: Scalars['String']['output'];
  ipfsHash?: Maybe<Scalars['String']['output']>;
  ipfsUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export type OutboundEmailAttachmentInput = {
  content: Scalars['String']['input'];
  contentType: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type OutboundEmailFilterInput = {
  dateFrom?: InputMaybe<Scalars['DateTime']['input']>;
  dateTo?: InputMaybe<Scalars['DateTime']['input']>;
  searchTerm?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<EmailStatus>;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type PaginatedEmails = {
  __typename?: 'PaginatedEmails';
  currentPage: Scalars['Int']['output'];
  emails: Array<Email>;
  hasMore: Scalars['Boolean']['output'];
  totalCount: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type PaginatedInboundEmails = {
  __typename?: 'PaginatedInboundEmails';
  currentPage: Scalars['Int']['output'];
  emails: Array<InboundEmail>;
  hasMore: Scalars['Boolean']['output'];
  totalCount: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type Password = {
  __typename?: 'Password';
  accessLogs?: Maybe<Array<PasswordAccessLog>>;
  company?: Maybe<Company>;
  createdAt: Scalars['DateTime']['output'];
  createdBy: Client;
  dashboardUrl?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  instructionalVideos?: Maybe<Array<InstructionalVideo>>;
  isActive: Scalars['Boolean']['output'];
  loginUrl?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  password: Scalars['String']['output'];
  serviceName: Scalars['String']['output'];
  sharedWithEmployees: Array<Scalars['String']['output']>;
  sharedWithExternal: Array<Scalars['String']['output']>;
  tenantId: Scalars['String']['output'];
  twoFactorBackupCodes?: Maybe<Scalars['String']['output']>;
  twoFactorSecret?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  username?: Maybe<Scalars['String']['output']>;
};

export type PasswordAccessLog = {
  __typename?: 'PasswordAccessLog';
  accessedAt: Scalars['DateTime']['output'];
  accessedBy: Client;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  ipAddress?: Maybe<Scalars['String']['output']>;
  passwordId: Scalars['ID']['output'];
  tenantId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userAgent?: Maybe<Scalars['String']['output']>;
};

export type PasswordInput = {
  company?: InputMaybe<Scalars['ID']['input']>;
  dashboardUrl?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  expiresAt?: InputMaybe<Scalars['DateTime']['input']>;
  instructionalVideos?: InputMaybe<Array<InstructionalVideoInput>>;
  loginUrl?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
  serviceName: Scalars['String']['input'];
  sharedWithEmployees?: InputMaybe<Array<Scalars['ID']['input']>>;
  sharedWithExternal?: InputMaybe<Array<Scalars['ID']['input']>>;
  twoFactorBackupCodes?: InputMaybe<Scalars['String']['input']>;
  twoFactorSecret?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type PasswordUpdateInput = {
  company?: InputMaybe<Scalars['ID']['input']>;
  dashboardUrl?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  expiresAt?: InputMaybe<Scalars['DateTime']['input']>;
  instructionalVideos?: InputMaybe<Array<InstructionalVideoInput>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  loginUrl?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  serviceName?: InputMaybe<Scalars['String']['input']>;
  sharedWithEmployees?: InputMaybe<Array<Scalars['ID']['input']>>;
  sharedWithExternal?: InputMaybe<Array<Scalars['ID']['input']>>;
  twoFactorBackupCodes?: InputMaybe<Scalars['String']['input']>;
  twoFactorSecret?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type PaymentDetails = {
  __typename?: 'PaymentDetails';
  amountPaid?: Maybe<Scalars['Float']['output']>;
  cryptoTransactionHash?: Maybe<Scalars['String']['output']>;
  cryptoWalletAddress?: Maybe<Scalars['String']['output']>;
  method: ProductPaymentMethod;
  notes?: Maybe<Scalars['String']['output']>;
  paidAt?: Maybe<Scalars['DateTime']['output']>;
  paymentReference?: Maybe<Scalars['String']['output']>;
  status: PaymentStatus;
  stripePaymentIntentId?: Maybe<Scalars['String']['output']>;
  transactionId?: Maybe<Scalars['String']['output']>;
};

export type PaymentDetailsInput = {
  amountPaid?: InputMaybe<Scalars['Float']['input']>;
  cryptoTransactionHash?: InputMaybe<Scalars['String']['input']>;
  cryptoWalletAddress?: InputMaybe<Scalars['String']['input']>;
  method: ProductPaymentMethod;
  notes?: InputMaybe<Scalars['String']['input']>;
  paymentReference?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  stripePaymentIntentId?: InputMaybe<Scalars['String']['input']>;
  transactionId?: InputMaybe<Scalars['String']['input']>;
};

export type PaymentMethod = {
  __typename?: 'PaymentMethod';
  billingEmail?: Maybe<Scalars['String']['output']>;
  cardDetails?: Maybe<CardDetails>;
  client: Client;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isDefault: Scalars['Boolean']['output'];
  lastUsedAt?: Maybe<Scalars['DateTime']['output']>;
  status: PaymentMethodStatus;
  stripeCustomerId: Scalars['String']['output'];
  stripePaymentMethodId: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
  type: PaymentMethodType;
  updatedAt: Scalars['DateTime']['output'];
};

export type PaymentMethodInput = {
  billingEmail?: InputMaybe<Scalars['String']['input']>;
  cardDetails?: InputMaybe<CardDetailsInput>;
  clientId: Scalars['ID']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  stripeCustomerId?: InputMaybe<Scalars['String']['input']>;
  stripePaymentMethodId: Scalars['String']['input'];
  type: PaymentMethodType;
};

export enum PaymentMethodStatus {
  Active = 'ACTIVE',
  Expired = 'EXPIRED',
  Inactive = 'INACTIVE',
  RequiresConfirmation = 'REQUIRES_CONFIRMATION'
}

export enum PaymentMethodType {
  BankAccount = 'BANK_ACCOUNT',
  Card = 'CARD',
  Other = 'OTHER',
  Paypal = 'PAYPAL'
}

/** The provider/method used for payment */
export enum PaymentProvider {
  AudTransfer = 'AUD_TRANSFER',
  BankTransfer = 'BANK_TRANSFER',
  Cash = 'CASH',
  Crypto = 'CRYPTO',
  Other = 'OTHER',
  Stripe = 'STRIPE'
}

export type PaymentReceivingDetails = {
  __typename?: 'PaymentReceivingDetails';
  acceptedMethods: Array<PaymentReceivingMethod>;
  bankAccount?: Maybe<BankAccountDetails>;
  cryptoDiscountPercentage?: Maybe<Scalars['Float']['output']>;
  cryptoWallets?: Maybe<Array<CryptoWalletDetails>>;
  isVerified?: Maybe<Scalars['Boolean']['output']>;
  paypalEmail?: Maybe<Scalars['String']['output']>;
  stripeConnect?: Maybe<StripeConnectDetails>;
};

export type PaymentReceivingDetailsInput = {
  acceptedMethods: Array<PaymentReceivingMethod>;
  bankAccount?: InputMaybe<BankAccountDetailsInput>;
  cryptoDiscountPercentage?: InputMaybe<Scalars['Float']['input']>;
  cryptoWallets?: InputMaybe<Array<CryptoWalletDetailsInput>>;
  isVerified?: InputMaybe<Scalars['Boolean']['input']>;
  paypalEmail?: InputMaybe<Scalars['String']['input']>;
  stripeConnect?: InputMaybe<StripeConnectDetailsInput>;
};

/** Methods through which a client can receive payments */
export enum PaymentReceivingMethod {
  BankTransfer = 'BANK_TRANSFER',
  Crypto = 'CRYPTO',
  Paypal = 'PAYPAL',
  Stripe = 'STRIPE'
}

export type PaymentScheduleItem = {
  __typename?: 'PaymentScheduleItem';
  amount: Scalars['Float']['output'];
  description: Scalars['String']['output'];
  dueDate: Scalars['DateTime']['output'];
  memberSplits?: Maybe<Array<MemberSplit>>;
  notes?: Maybe<Scalars['String']['output']>;
  paidDate?: Maybe<Scalars['DateTime']['output']>;
  paymentStatus?: Maybe<OpportunityPaymentStatus>;
  receivedDate?: Maybe<Scalars['DateTime']['output']>;
  status: PaymentScheduleStatus;
};

export type PaymentScheduleItemInput = {
  amount: Scalars['Float']['input'];
  description: Scalars['String']['input'];
  dueDate: Scalars['DateTime']['input'];
  memberSplits?: InputMaybe<Array<MemberSplitInput>>;
  notes?: InputMaybe<Scalars['String']['input']>;
};

/** Status of scheduled payment */
export enum PaymentScheduleStatus {
  Cancelled = 'CANCELLED',
  Overdue = 'OVERDUE',
  Paid = 'PAID',
  Pending = 'PENDING'
}

/** The status of the payment */
export enum PaymentStatus {
  Completed = 'COMPLETED',
  Failed = 'FAILED',
  Pending = 'PENDING',
  Processing = 'PROCESSING',
  Refunded = 'REFUNDED'
}

/** Status of individual member payout */
export enum PayoutStatus {
  Cancelled = 'CANCELLED',
  Failed = 'FAILED',
  Paid = 'PAID',
  Pending = 'PENDING',
  Processing = 'PROCESSING',
  Scheduled = 'SCHEDULED'
}

/** The capabilities of the phone number */
export enum PhoneCapability {
  Fax = 'FAX',
  Mms = 'MMS',
  Sms = 'SMS',
  Voice = 'VOICE'
}

/** The status of the phone number */
export enum PhoneNumberStatus {
  Active = 'ACTIVE',
  Failed = 'FAILED',
  Inactive = 'INACTIVE',
  Pending = 'PENDING'
}

export type PipelineMetrics = {
  __typename?: 'PipelineMetrics';
  averageDealSize: Scalars['Float']['output'];
  averageSalesCycle: Scalars['Float']['output'];
  conversionRate: Scalars['Float']['output'];
  expectedRevenue: Scalars['Float']['output'];
  healthScore: Scalars['Float']['output'];
  monthlyTrend: Array<MonthlyTrend>;
  stageMetrics: Array<StageMetric>;
  suggestedActions: Array<SuggestedAction>;
  totalOpportunities: Scalars['Int']['output'];
  totalValue: Scalars['Float']['output'];
};

export type PriceRangeInput = {
  max: Scalars['Float']['input'];
  min: Scalars['Float']['input'];
};

/** The pricing model for the product */
export enum PricingModel {
  Fixed = 'FIXED',
  Subscription = 'SUBSCRIPTION',
  Variable = 'VARIABLE'
}

export type Product = {
  __typename?: 'Product';
  availableFrom?: Maybe<Scalars['DateTime']['output']>;
  availableUntil?: Maybe<Scalars['DateTime']['output']>;
  averageRating?: Maybe<Scalars['Float']['output']>;
  benefits?: Maybe<Scalars['String']['output']>;
  categories?: Maybe<Array<Scalars['String']['output']>>;
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  digitalDelivery?: Maybe<DigitalDeliveryTemplate>;
  enableForSyndicate: Scalars['Boolean']['output'];
  howToUse?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  images?: Maybe<Array<Scalars['String']['output']>>;
  ingredients?: Maybe<Array<Scalars['String']['output']>>;
  isActive: Scalars['Boolean']['output'];
  isBestSeller: Scalars['Boolean']['output'];
  isFeatured: Scalars['Boolean']['output'];
  isPublic: Scalars['Boolean']['output'];
  lifeEssentialCategory?: Maybe<LifeEssentialCategory>;
  memberPrice?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  price: Scalars['Float']['output'];
  pricingModel: PricingModel;
  reviewCount?: Maybe<Scalars['Float']['output']>;
  seller: Client;
  sellerProfile?: Maybe<SellerProfile>;
  shipping?: Maybe<ShippingDetails>;
  shippingInfo?: Maybe<Scalars['String']['output']>;
  sku: Scalars['String']['output'];
  stockLevel: Scalars['Float']['output'];
  tags?: Maybe<Array<Scalars['String']['output']>>;
  tenantId: Scalars['String']['output'];
  type: ProductType;
  updatedAt: Scalars['DateTime']['output'];
  variants?: Maybe<Array<ProductVariant>>;
};

export type ProductFilterInput = {
  categories?: InputMaybe<Array<Scalars['String']['input']>>;
  priceRange?: InputMaybe<PriceRangeInput>;
};

export type ProductInput = {
  availableFrom?: InputMaybe<Scalars['DateTime']['input']>;
  availableUntil?: InputMaybe<Scalars['DateTime']['input']>;
  benefits?: InputMaybe<Scalars['String']['input']>;
  categories?: InputMaybe<Array<Scalars['String']['input']>>;
  description: Scalars['String']['input'];
  digitalDelivery?: InputMaybe<DigitalDeliveryTemplateInput>;
  enableForSyndicate?: InputMaybe<Scalars['Boolean']['input']>;
  howToUse?: InputMaybe<Scalars['String']['input']>;
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  ingredients?: InputMaybe<Array<Scalars['String']['input']>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isBestSeller?: InputMaybe<Scalars['Boolean']['input']>;
  isFeatured?: InputMaybe<Scalars['Boolean']['input']>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  lifeEssentialCategory?: InputMaybe<LifeEssentialCategory>;
  memberPrice?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
  price: Scalars['Float']['input'];
  pricingModel: PricingModel;
  sellerProfileId?: InputMaybe<Scalars['ID']['input']>;
  shipping?: InputMaybe<ShippingDetailsInput>;
  shippingInfo?: InputMaybe<Scalars['String']['input']>;
  sku: Scalars['String']['input'];
  stockLevel: Scalars['Float']['input'];
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  type: ProductType;
  variants?: InputMaybe<Array<ProductVariantInput>>;
};

export type ProductOrder = {
  __typename?: 'ProductOrder';
  client: Client;
  commission?: Maybe<Scalars['Float']['output']>;
  createdAt: Scalars['DateTime']['output'];
  deliveredAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  items: Array<OrderItem>;
  payment: PaymentDetails;
  shippedAt?: Maybe<Scalars['DateTime']['output']>;
  status: OrderStatus;
  tenantId: Scalars['String']['output'];
  totalAmount: Scalars['Float']['output'];
  trackingNumber?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type ProductOrderInput = {
  clientId: Scalars['ID']['input'];
  commission?: InputMaybe<Scalars['Float']['input']>;
  items: Array<OrderItemInput>;
  payment?: InputMaybe<PaymentDetailsInput>;
};

/** The method used for product payment */
export enum ProductPaymentMethod {
  BankTransfer = 'BANK_TRANSFER',
  Cash = 'CASH',
  Crypto = 'CRYPTO',
  Other = 'OTHER',
  Stripe = 'STRIPE'
}

/** The type of product being sold */
export enum ProductType {
  DigitalContent = 'DIGITAL_CONTENT',
  DigitalCourse = 'DIGITAL_COURSE',
  Physical = 'PHYSICAL',
  Service = 'SERVICE'
}

export type ProductVariant = {
  __typename?: 'ProductVariant';
  price: Scalars['Float']['output'];
  sku?: Maybe<Scalars['String']['output']>;
  stockLevel: Scalars['Float']['output'];
  title: Scalars['String']['output'];
  variantId: Scalars['String']['output'];
};

export type ProductVariantInput = {
  price: Scalars['Float']['input'];
  sku?: InputMaybe<Scalars['String']['input']>;
  stockLevel: Scalars['Float']['input'];
  title: Scalars['String']['input'];
  variantId: Scalars['String']['input'];
};

export type Project = {
  __typename?: 'Project';
  billingClient: Client;
  bills?: Maybe<Array<Bill>>;
  clientEmail?: Maybe<Scalars['String']['output']>;
  clientPhone?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  deliverables?: Maybe<Array<Scalars['String']['output']>>;
  deliveryTimeline?: Maybe<Scalars['String']['output']>;
  finalPayment?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  members: Array<Client>;
  progress?: Maybe<Scalars['Float']['output']>;
  projectDescription?: Maybe<Scalars['String']['output']>;
  projectGoal: Scalars['String']['output'];
  projectName: Scalars['String']['output'];
  proposalAcceptedDate?: Maybe<Scalars['DateTime']['output']>;
  proposalId?: Maybe<Scalars['ID']['output']>;
  proposalSentDate?: Maybe<Scalars['DateTime']['output']>;
  proposalStatus?: Maybe<Scalars['String']['output']>;
  sourceEmailId?: Maybe<Scalars['String']['output']>;
  specialRequirements?: Maybe<Scalars['String']['output']>;
  suggestedPrice?: Maybe<Scalars['Float']['output']>;
  tasks?: Maybe<Array<Task>>;
  tenantId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  upfrontPayment?: Maybe<Scalars['Float']['output']>;
};

export type ProjectInput = {
  billingClient: Scalars['ID']['input'];
  clientEmail?: InputMaybe<Scalars['String']['input']>;
  clientPhone?: InputMaybe<Scalars['String']['input']>;
  deliverables?: InputMaybe<Array<Scalars['String']['input']>>;
  deliveryTimeline?: InputMaybe<Scalars['String']['input']>;
  finalPayment?: InputMaybe<Scalars['Float']['input']>;
  members?: InputMaybe<Array<Scalars['ID']['input']>>;
  projectDescription?: InputMaybe<Scalars['String']['input']>;
  projectGoal: Scalars['String']['input'];
  projectName: Scalars['String']['input'];
  sourceEmailId?: InputMaybe<Scalars['String']['input']>;
  specialRequirements?: InputMaybe<Scalars['String']['input']>;
  suggestedPrice?: InputMaybe<Scalars['Float']['input']>;
  upfrontPayment?: InputMaybe<Scalars['Float']['input']>;
};

export type ProjectProposal = {
  __typename?: 'ProjectProposal';
  clientEmail?: Maybe<Scalars['String']['output']>;
  clientName: Scalars['String']['output'];
  clientPhone?: Maybe<Scalars['String']['output']>;
  deliverables: Array<Scalars['String']['output']>;
  deliveryTimeline: Scalars['String']['output'];
  finalPayment: Scalars['Float']['output'];
  projectName: Scalars['String']['output'];
  projectSummary: Scalars['String']['output'];
  sourceEmailId?: Maybe<Scalars['String']['output']>;
  specialRequirements?: Maybe<Scalars['String']['output']>;
  suggestedPrice: Scalars['Float']['output'];
  tasks: Array<ProjectTask>;
  upfrontPayment: Scalars['Float']['output'];
};

export type ProjectTask = {
  __typename?: 'ProjectTask';
  category?: Maybe<Scalars['String']['output']>;
  description: Scalars['String']['output'];
  estimatedHours: Scalars['Float']['output'];
  order: Scalars['Float']['output'];
  title: Scalars['String']['output'];
};

export type ProjectUpdateInput = {
  billingClient?: InputMaybe<Scalars['ID']['input']>;
  clientEmail?: InputMaybe<Scalars['String']['input']>;
  clientPhone?: InputMaybe<Scalars['String']['input']>;
  deliverables?: InputMaybe<Array<Scalars['String']['input']>>;
  deliveryTimeline?: InputMaybe<Scalars['String']['input']>;
  finalPayment?: InputMaybe<Scalars['Float']['input']>;
  members?: InputMaybe<Array<Scalars['ID']['input']>>;
  projectDescription?: InputMaybe<Scalars['String']['input']>;
  projectGoal?: InputMaybe<Scalars['String']['input']>;
  projectName?: InputMaybe<Scalars['String']['input']>;
  proposalStatus?: InputMaybe<Scalars['String']['input']>;
  sourceEmailId?: InputMaybe<Scalars['String']['input']>;
  specialRequirements?: InputMaybe<Scalars['String']['input']>;
  suggestedPrice?: InputMaybe<Scalars['Float']['input']>;
  upfrontPayment?: InputMaybe<Scalars['Float']['input']>;
};

export type Proposal = {
  __typename?: 'Proposal';
  agreementMarkdown: Scalars['String']['output'];
  billId?: Maybe<Scalars['ID']['output']>;
  companyName: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  customPagePath?: Maybe<Scalars['String']['output']>;
  draftBillId?: Maybe<Scalars['ID']['output']>;
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  fullySignedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  projectId?: Maybe<Scalars['ID']['output']>;
  scheduledPayments?: Maybe<Array<ScheduledPayment>>;
  sentAt?: Maybe<Scalars['DateTime']['output']>;
  signedPdfCid?: Maybe<Scalars['String']['output']>;
  signedPdfUrl?: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  status: ProposalStatus;
  tenantId: Scalars['String']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type ProposalSignature = {
  __typename?: 'ProposalSignature';
  clientId?: Maybe<Scalars['ID']['output']>;
  createdAt: Scalars['DateTime']['output'];
  emailVerificationCode?: Maybe<Scalars['String']['output']>;
  emailVerified: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  ipAddress?: Maybe<Scalars['String']['output']>;
  phoneVerificationCode?: Maybe<Scalars['String']['output']>;
  phoneVerified: Scalars['Boolean']['output'];
  postmarkMessageId?: Maybe<Scalars['String']['output']>;
  proposalId: Scalars['ID']['output'];
  signatureImage: Scalars['String']['output'];
  signatureImagePinataCid?: Maybe<Scalars['String']['output']>;
  signatureImagePinataUrl?: Maybe<Scalars['String']['output']>;
  signedAt: Scalars['DateTime']['output'];
  signerEmail: Scalars['String']['output'];
  signerName: Scalars['String']['output'];
  signerPhone?: Maybe<Scalars['String']['output']>;
  signerRole?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userAgent?: Maybe<Scalars['String']['output']>;
};

/** The status of a proposal */
export enum ProposalStatus {
  Cancelled = 'CANCELLED',
  Draft = 'DRAFT',
  Expired = 'EXPIRED',
  FullySigned = 'FULLY_SIGNED',
  PartiallySigned = 'PARTIALLY_SIGNED',
  Sent = 'SENT'
}

export type Provider = {
  __typename?: 'Provider';
  aboutStory?: Maybe<Scalars['String']['output']>;
  achievements: Array<Scalars['String']['output']>;
  allowedEditors: Array<Client>;
  allowedEditorsIds: Array<Client>;
  availability?: Maybe<ProviderAvailability>;
  avatar?: Maybe<Scalars['String']['output']>;
  client: Client;
  clientId: Client;
  contactInfo?: Maybe<ProviderContactInfo>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  education: Array<ProviderEducation>;
  experience: Array<ProviderExperience>;
  expertise: Array<Scalars['String']['output']>;
  featuredProductIds: Array<Scalars['String']['output']>;
  heroImage?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isFeatured: Scalars['Boolean']['output'];
  isPublic: Scalars['Boolean']['output'];
  portfolioUrl?: Maybe<Scalars['String']['output']>;
  roles: Array<ProviderRole>;
  skills: Array<ProviderSkill>;
  status: ProviderStatus;
  tagline?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['String']['output'];
  testimonials: Array<ProviderTestimonial>;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  urlSlug?: Maybe<Scalars['String']['output']>;
};

export type ProviderAvailability = {
  __typename?: 'ProviderAvailability';
  notes?: Maybe<Scalars['String']['output']>;
  schedule: Scalars['String']['output'];
  timezone?: Maybe<Scalars['String']['output']>;
};

export type ProviderAvailabilityInput = {
  notes?: InputMaybe<Scalars['String']['input']>;
  schedule?: InputMaybe<Scalars['String']['input']>;
  timezone?: InputMaybe<Scalars['String']['input']>;
};

export type ProviderContactInfo = {
  __typename?: 'ProviderContactInfo';
  email?: Maybe<Scalars['String']['output']>;
  facebook?: Maybe<Scalars['String']['output']>;
  instagram?: Maybe<Scalars['String']['output']>;
  linkedIn?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  twitter?: Maybe<Scalars['String']['output']>;
  website?: Maybe<Scalars['String']['output']>;
};

export type ProviderContactInfoInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  facebook?: InputMaybe<Scalars['String']['input']>;
  instagram?: InputMaybe<Scalars['String']['input']>;
  linkedIn?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  twitter?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};

export type ProviderEducation = {
  __typename?: 'ProviderEducation';
  degree: Scalars['String']['output'];
  description: Scalars['String']['output'];
  institution: Scalars['String']['output'];
  year: Scalars['String']['output'];
};

export type ProviderEducationInput = {
  degree: Scalars['String']['input'];
  description: Scalars['String']['input'];
  institution: Scalars['String']['input'];
  year: Scalars['String']['input'];
};

export type ProviderExperience = {
  __typename?: 'ProviderExperience';
  achievements: Array<Scalars['String']['output']>;
  company: Scalars['String']['output'];
  description: Scalars['String']['output'];
  period: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type ProviderExperienceInput = {
  achievements: Array<Scalars['String']['input']>;
  company: Scalars['String']['input'];
  description: Scalars['String']['input'];
  period: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type ProviderRole = {
  __typename?: 'ProviderRole';
  organization: Scalars['String']['output'];
  role: Scalars['String']['output'];
};

export type ProviderRoleInput = {
  organization: Scalars['String']['input'];
  role: Scalars['String']['input'];
};

export type ProviderSkill = {
  __typename?: 'ProviderSkill';
  endorsements: Scalars['Int']['output'];
  level: SkillLevel;
  name: Scalars['String']['output'];
};

export type ProviderSkillInput = {
  endorsements: Scalars['Int']['input'];
  level: SkillLevel;
  name: Scalars['String']['input'];
};

/** The status of the provider profile */
export enum ProviderStatus {
  Active = 'ACTIVE',
  Draft = 'DRAFT',
  Inactive = 'INACTIVE'
}

export type ProviderTestimonial = {
  __typename?: 'ProviderTestimonial';
  avatar?: Maybe<Scalars['String']['output']>;
  location: Scalars['String']['output'];
  name: Scalars['String']['output'];
  rating: Scalars['Int']['output'];
  text: Scalars['String']['output'];
};

export type ProviderTestimonialInput = {
  avatar?: InputMaybe<Scalars['String']['input']>;
  location: Scalars['String']['input'];
  name: Scalars['String']['input'];
  rating: Scalars['Int']['input'];
  text: Scalars['String']['input'];
};

export type PublicBookingResult = {
  __typename?: 'PublicBookingResult';
  booking: CalendarEvent;
  bookingToken: Scalars['String']['output'];
  paymentAmount: Scalars['Float']['output'];
  paymentCurrency: Scalars['String']['output'];
  requiresPayment: Scalars['Boolean']['output'];
  stripeCheckoutUrl?: Maybe<Scalars['String']['output']>;
};

export type PublicPasswordAccessInput = {
  mobileNumber: Scalars['String']['input'];
  passwordId: Scalars['String']['input'];
  verificationCode: Scalars['String']['input'];
};

export type PurchasePhoneNumberInput = {
  autoTranscribe?: InputMaybe<Scalars['Boolean']['input']>;
  forwardToNumber?: InputMaybe<Scalars['String']['input']>;
  friendlyName?: InputMaybe<Scalars['String']['input']>;
  phoneNumber: Scalars['String']['input'];
  recordCalls?: InputMaybe<Scalars['Boolean']['input']>;
};

export type Query = {
  __typename?: 'Query';
  activeBookableEventTypes: Array<BusinessCalendarBookableEventType>;
  activeCartByClient?: Maybe<Cart>;
  activeProducts: Array<Product>;
  allCalendarEvents: Array<CalendarEvent>;
  allClientTags: Array<Scalars['String']['output']>;
  allPublicProducts: Array<Product>;
  asset?: Maybe<Asset>;
  assetLogs: Array<AssetLog>;
  assetStats: Array<Scalars['Float']['output']>;
  assetTypes: Array<AssetType>;
  assets: Array<Asset>;
  assetsByCompany: Array<Asset>;
  assetsNeedingMaintenance: Array<Asset>;
  availableInboundEmailLabels: Array<Scalars['String']['output']>;
  availableModules: Array<ModuleInfo>;
  availableSessions: Array<Session>;
  availableTimeSlots: Array<AvailableTimeSlot>;
  bill?: Maybe<Bill>;
  bills: Array<Bill>;
  bookableEventType?: Maybe<BusinessCalendarBookableEventType>;
  bookableEventTypeStats: BookableEventTypeStats;
  bookableEventTypes: Array<BusinessCalendarBookableEventType>;
  bookingById?: Maybe<Booking>;
  bookings: Array<Booking>;
  bookingsByClientId: Array<Booking>;
  bookingsBySession: Array<Booking>;
  calendar?: Maybe<BusinessCalendar>;
  calendarAvailability?: Maybe<BusinessCalendarAvailability>;
  calendarEvent?: Maybe<CalendarEvent>;
  calendarEventTask?: Maybe<CalendarEventTask>;
  calendarEventTasks: Array<CalendarEventTask>;
  calendarEvents: Array<CalendarEvent>;
  calendarGoal?: Maybe<CalendarGoal>;
  calendarGoals: Array<CalendarGoal>;
  calendarHasAvailability: Scalars['Boolean']['output'];
  calendarInvitations: Array<CalendarInvitation>;
  calendarTags: Array<CalendarTag>;
  calendars: Array<BusinessCalendar>;
  callRecording?: Maybe<CallRecording>;
  callRecordings: CallRecordingConnection;
  cart?: Maybe<Cart>;
  charges: Array<Invoice>;
  chargesByClient: Array<Invoice>;
  checkAccountExists?: Maybe<Client>;
  client?: Maybe<Client>;
  clientByEmail?: Maybe<Client>;
  clientByPhone?: Maybe<Client>;
  clientStats: Array<Scalars['Float']['output']>;
  clients: Array<Client>;
  clientsByTag: Array<Client>;
  clientsByTenantId: Array<Client>;
  communicationTask?: Maybe<CommunicationTask>;
  communicationTaskStats: Scalars['Float']['output'];
  communicationTasks: Array<CommunicationTask>;
  companies: Array<Company>;
  company?: Maybe<Company>;
  companyCalendars: Array<BusinessCalendar>;
  companyKnowledgeArticle?: Maybe<CompanyKnowledge>;
  companyKnowledgeArticles: Array<CompanyKnowledge>;
  companyStats: Array<Scalars['Float']['output']>;
  currentMonthGoals: Array<CalendarGoal>;
  currentTenant?: Maybe<Tenant>;
  discoverProviders: Array<Provider>;
  domain?: Maybe<Domain>;
  domains: Array<Domain>;
  editableProviders: Array<Provider>;
  email: Email;
  emailAddress?: Maybe<EmailAddress>;
  emailAddressStats: EmailAddressStats;
  emailAddresses: Array<EmailAddress>;
  emailCalendars: Array<BusinessCalendar>;
  emailInbox: Array<InboundEmail>;
  emailInboxPaginated: PaginatedInboundEmails;
  emailSenders: Array<Scalars['String']['output']>;
  emails: Array<Email>;
  emailsDraft: Array<Email>;
  emailsSent: Array<Email>;
  employee?: Maybe<Employee>;
  employeeByEmail?: Maybe<Employee>;
  employeeStats: Array<Scalars['Float']['output']>;
  employees: Array<Employee>;
  employeesByClient: Array<Employee>;
  /** Export project tasks to unified markdown format */
  exportProjectTasksToMarkdown: Scalars['String']['output'];
  farmerByTenant?: Maybe<Farmer>;
  farmers: Array<Farmer>;
  farmersByTenant: Array<Farmer>;
  frontendUpgrade?: Maybe<FrontendUpgrade>;
  frontendUpgradeStats: UpgradeStats;
  frontendUpgrades: Array<FrontendUpgrade>;
  getAllProposalSignatures: Array<ProposalSignature>;
  getAllProposals: Array<Proposal>;
  getAvailabilityByPractitionerId: Array<Availability>;
  getBillChaserConfiguration: BillChaserConfigResponse;
  getBillIssuerDetails?: Maybe<Client>;
  getBookingByToken?: Maybe<CalendarEvent>;
  getBookingCalendarUrl: Scalars['String']['output'];
  getBookingsByPractitionerId: Array<Booking>;
  getCalendarsByIds: Array<BusinessCalendar>;
  getClientDetailsByBillId?: Maybe<Client>;
  getCoreActivities: Array<RdActivity>;
  getExternalCalendars: Array<BusinessCalendar>;
  /** Get curated farm and agriculture images */
  getFarmImages: ImageSearchResult;
  getFarmerById?: Maybe<Farmer>;
  getFile: Scalars['String']['output'];
  getFiles: Array<Scalars['String']['output']>;
  getLinkedEmailForCalendar?: Maybe<Scalars['String']['output']>;
  /** Get optimized image URL with specific dimensions */
  getOptimizedImageUrl: Scalars['String']['output'];
  getProposal?: Maybe<Proposal>;
  getProposalBySlug?: Maybe<Proposal>;
  getProposalSignature?: Maybe<ProposalSignature>;
  getProposalSignatures: Array<ProposalSignature>;
  getRDActivities: Array<RdActivity>;
  getRDActivity?: Maybe<RdActivity>;
  getRDCommunicationLogs: Array<RdCommunicationLog>;
  getRDEvidence: Array<RdEvidence>;
  getRDProject?: Maybe<RdProject>;
  getRDProjectGapAnalysis: RdGapAnalysisResult;
  getRDProjectTotalHours: Scalars['Float']['output'];
  getRDProjects: Array<RdProject>;
  getRDProjectsByStatus: Array<RdProject>;
  getRDTimeEntries: Array<RdTimeEntry>;
  /** Get a random farm/agriculture image */
  getRandomFarmImage?: Maybe<SearchImage>;
  getTenantLemonfoxApiKey?: Maybe<Scalars['String']['output']>;
  getTenantStripePublicKey?: Maybe<Scalars['String']['output']>;
  getTenantTwilioAccountSid?: Maybe<Scalars['String']['output']>;
  getTenantTwilioAuthToken?: Maybe<Scalars['String']['output']>;
  getTenantUnsplashAccessKey?: Maybe<Scalars['String']['output']>;
  getTenantUnsplashConfig?: Maybe<TenantApiKeys>;
  getTenantUnsplashSecretKey?: Maybe<Scalars['String']['output']>;
  getTenantVapiAssistantId?: Maybe<Scalars['String']['output']>;
  getTenantVapiPrivateApiKey?: Maybe<Scalars['String']['output']>;
  getTenantVapiPublicApiKey?: Maybe<Scalars['String']['output']>;
  /** Get Twilio Access Token for browser calling */
  getTwilioAccessToken: Scalars['String']['output'];
  /** Get a single Vapi call log by ID */
  getVapiCallLog?: Maybe<VapiCallLog>;
  /** Get Vapi call logs */
  getVapiCallLogs: Array<VapiCallLog>;
  /** Get Vapi configuration for the current tenant */
  getVapiConfig: VapiConfig;
  /** Get the current user's Vapi session ID */
  getVapiSessionId?: Maybe<Scalars['String']['output']>;
  /** Get Vapi workflows */
  getVapiWorkflows: Array<VapiWorkflow>;
  goalStatistics: Scalars['String']['output'];
  hasAssignedEmailAddress: Scalars['Boolean']['output'];
  inboundEmail?: Maybe<InboundEmail>;
  inboundEmailThread: Array<InboundEmail>;
  inboundEmails: Array<InboundEmail>;
  inboxStats: InboxStats;
  incompleteTasks: Array<CalendarEventTask>;
  influencer?: Maybe<Influencer>;
  influencerBooking?: Maybe<InfluencerBooking>;
  influencerBookings: Array<InfluencerBooking>;
  influencers: Array<Influencer>;
  invoice?: Maybe<Invoice>;
  invoices: Array<Invoice>;
  invoicesByClient: Array<Invoice>;
  ipfsVideo?: Maybe<IpfsVideo>;
  ipfsVideoByHash?: Maybe<IpfsVideo>;
  isAiServiceConfigured: Scalars['Boolean']['output'];
  isUrlSlugAvailable: Scalars['Boolean']['output'];
  me?: Maybe<Client>;
  meeting?: Maybe<Meeting>;
  meetingTask?: Maybe<MeetingTask>;
  meetingTasks: Array<MeetingTask>;
  meetings: Array<Meeting>;
  moduleEvents: Array<CalendarEvent>;
  multiCalendarEvents: Array<CalendarEvent>;
  myAccessibleEmailAddresses: Array<EmailAddressInfo>;
  /** Get phone numbers assigned to the current user */
  myAssignedPhoneNumbers: Array<TwilioPhoneNumber>;
  myBookings: Array<Booking>;
  myCalendars: Array<BusinessCalendar>;
  myCompanyKnowledgeArticles: Array<CompanyKnowledge>;
  myDomains: Array<Domain>;
  myEmailAddresses: Array<EmailAddress>;
  myFarmer?: Maybe<Farmer>;
  myIPFSVideoCount: Scalars['Float']['output'];
  myIPFSVideos: Array<IpfsVideo>;
  myInfluencerProfile?: Maybe<Influencer>;
  myMeetings: Array<Meeting>;
  myOpportunities: Array<Opportunity>;
  myOpportunityTasks: Array<OpportunityTask>;
  myPasswords: Array<Password>;
  myProvider?: Maybe<Provider>;
  mySellerProfiles: Array<SellerProfile>;
  mySubscriptions: Array<Subscription>;
  myTranscriptions: Array<Transcription>;
  opportunities: Array<Opportunity>;
  opportunitiesByStage: Array<Opportunity>;
  opportunity?: Maybe<Opportunity>;
  opportunityCount: Scalars['Int']['output'];
  opportunityMeeting?: Maybe<OpportunityMeeting>;
  opportunityMeetings: Array<OpportunityMeeting>;
  opportunityMembers: Array<OpportunityMember>;
  opportunityNote?: Maybe<OpportunityNote>;
  opportunityNotes: Array<OpportunityNote>;
  opportunityStages: Array<OpportunityStage>;
  opportunityTasks: Array<OpportunityTask>;
  paginatedEmails: PaginatedEmails;
  paginatedInboundEmails: PaginatedInboundEmails;
  password?: Maybe<Password>;
  passwordAccessLogs: Array<PasswordAccessLog>;
  passwords: Array<Password>;
  paymentMethods: Array<PaymentMethod>;
  paymentMethodsByClient: Array<PaymentMethod>;
  phoneNumber?: Maybe<TwilioPhoneNumber>;
  phoneNumbers: Array<TwilioPhoneNumber>;
  pinnedCompanyKnowledgeArticles: Array<CompanyKnowledge>;
  pipelineMetrics: PipelineMetrics;
  practionerById?: Maybe<Client>;
  practitionerAvailability: Array<Availability>;
  practitionerPublicProfile?: Maybe<Client>;
  product?: Maybe<Product>;
  productOrder?: Maybe<ProductOrder>;
  productOrders: Array<ProductOrder>;
  productOrdersByClient: Array<ProductOrder>;
  productOrdersByStatus: Array<ProductOrder>;
  productStats: Array<Scalars['Float']['output']>;
  products: Array<Product>;
  project: Project;
  projects: Array<Project>;
  projectsByClient: Array<Project>;
  provider?: Maybe<Provider>;
  providers: Array<Provider>;
  publicAsset?: Maybe<Asset>;
  /** Public query to get bill for preview without authentication */
  publicBill?: Maybe<Bill>;
  publicBookableEventTypes: Array<BusinessCalendarBookableEventType>;
  publicBooking?: Maybe<CalendarEvent>;
  publicCalendar?: Maybe<BusinessCalendar>;
  publicCompanyKnowledgeArticle?: Maybe<CompanyKnowledge>;
  publicFarmerBySlug?: Maybe<Farmer>;
  publicFarmers: Array<Farmer>;
  /** Public query to get issuer details for a bill */
  publicGetBillIssuerDetails?: Maybe<Client>;
  /** Public query to get client details for a bill */
  publicGetClientDetailsByBillId?: Maybe<Client>;
  publicIPFSVideos: Array<IpfsVideo>;
  publicPasswordAccess?: Maybe<Password>;
  publicProducts: Array<Product>;
  /** Public query to get project without authentication */
  publicProject?: Maybe<Project>;
  publicProposal?: Maybe<Proposal>;
  publicProvider?: Maybe<Provider>;
  publicProviderByClient?: Maybe<Provider>;
  publicProviderBySlug?: Maybe<Provider>;
  publicProviders: Array<Provider>;
  publicSellerProfiles: Array<SellerProfile>;
  quoteTemplate?: Maybe<QuoteTemplate>;
  quoteTemplates: Array<QuoteTemplate>;
  quotes: Array<Quote>;
  revenueTargets: RevenueTargets;
  searchAssets: Array<Asset>;
  searchAvailablePhoneNumbers: Array<AvailablePhoneNumber>;
  searchClients: Array<Client>;
  searchCompanies: Array<Company>;
  searchDomains: Array<DomainAvailability>;
  /** Search for free images from Unsplash */
  searchImages: ImageSearchResult;
  sellerProfile?: Maybe<SellerProfile>;
  sellerProfileStats: Array<Scalars['Float']['output']>;
  sellerProfiles: Array<SellerProfile>;
  sellerProfilesByClient: Array<SellerProfile>;
  sessionTypeById?: Maybe<SessionType>;
  sessionTypes: Array<SessionType>;
  sessionTypesByPractitioner: Array<SessionType>;
  sessions: Array<Session>;
  sharedCompanyKnowledgeArticle?: Maybe<CompanyKnowledge>;
  subscription?: Maybe<Subscription>;
  subscriptions: Array<Subscription>;
  subscriptionsByClient: Array<Subscription>;
  suggestTagColors: Array<Scalars['String']['output']>;
  tasksByProject: Array<Task>;
  tenant?: Maybe<Tenant>;
  tenantByCurrentClient?: Maybe<Tenant>;
  tenants: Array<Tenant>;
  testLemonfoxConnection: Scalars['Boolean']['output'];
  totalIPFSStorageUsed: Scalars['Float']['output'];
  totalOpportunityValue: Scalars['Float']['output'];
  transcription?: Maybe<Transcription>;
  transcriptions: Array<Transcription>;
  unassignedEmails: Array<Email>;
  unreadInboundEmailCount: Scalars['Float']['output'];
  upcomingEvents: Array<CalendarEvent>;
  uploadMultipleToPinata: Array<Scalars['String']['output']>;
  userAssignedPhoneNumbers: Array<TwilioPhoneNumber>;
  websites: Array<Tenant>;
  websitesByClient: Array<Tenant>;
  websitesByCurrentClient: Array<Tenant>;
};


export type QueryActiveBookableEventTypesArgs = {
  calendarId: Scalars['String']['input'];
};


export type QueryAllCalendarEventsArgs = {
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
};


export type QueryAllPublicProductsArgs = {
  filter?: InputMaybe<ProductFilterInput>;
};


export type QueryAssetArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAssetLogsArgs = {
  assetId: Scalars['ID']['input'];
};


export type QueryAssetsByCompanyArgs = {
  companyId: Scalars['ID']['input'];
};


export type QueryAvailableSessionsArgs = {
  endDate: Scalars['DateTime']['input'];
  startDate: Scalars['DateTime']['input'];
};


export type QueryAvailableTimeSlotsArgs = {
  calendarId: Scalars['String']['input'];
  endDate: Scalars['String']['input'];
  eventTypeId: Scalars['String']['input'];
  startDate: Scalars['String']['input'];
};


export type QueryBillArgs = {
  id: Scalars['ID']['input'];
};


export type QueryBookableEventTypeArgs = {
  id: Scalars['String']['input'];
};


export type QueryBookableEventTypeStatsArgs = {
  id: Scalars['String']['input'];
};


export type QueryBookableEventTypesArgs = {
  calendarId: Scalars['String']['input'];
};


export type QueryBookingByIdArgs = {
  bookingId: Scalars['String']['input'];
};


export type QueryBookingsArgs = {
  endDate: Scalars['DateTime']['input'];
  startDate: Scalars['DateTime']['input'];
};


export type QueryBookingsByClientIdArgs = {
  clientId: Scalars['String']['input'];
};


export type QueryBookingsBySessionArgs = {
  sessionId: Scalars['String']['input'];
};


export type QueryCalendarArgs = {
  id: Scalars['String']['input'];
};


export type QueryCalendarAvailabilityArgs = {
  calendarId: Scalars['String']['input'];
};


export type QueryCalendarEventArgs = {
  id: Scalars['String']['input'];
};


export type QueryCalendarEventTaskArgs = {
  id: Scalars['String']['input'];
};


export type QueryCalendarEventTasksArgs = {
  calendarEventId: Scalars['String']['input'];
};


export type QueryCalendarEventsArgs = {
  calendarId: Scalars['String']['input'];
  endDate?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCalendarGoalArgs = {
  id: Scalars['String']['input'];
};


export type QueryCalendarGoalsArgs = {
  calendarId: Scalars['String']['input'];
  endDate?: InputMaybe<Scalars['String']['input']>;
  period?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCalendarHasAvailabilityArgs = {
  calendarId: Scalars['String']['input'];
};


export type QueryCalendarInvitationsArgs = {
  calendarId: Scalars['String']['input'];
};


export type QueryCalendarTagsArgs = {
  calendarId: Scalars['String']['input'];
};


export type QueryCalendarsArgs = {
  includeShared?: InputMaybe<Scalars['Boolean']['input']>;
  type?: InputMaybe<CalendarType>;
};


export type QueryCallRecordingArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCallRecordingsArgs = {
  filter?: InputMaybe<CallRecordingFilterInput>;
  limit?: Scalars['Int']['input'];
  page?: Scalars['Int']['input'];
};


export type QueryCartArgs = {
  id: Scalars['ID']['input'];
};


export type QueryChargesByClientArgs = {
  clientId: Scalars['ID']['input'];
};


export type QueryCheckAccountExistsArgs = {
  email?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
};


export type QueryClientArgs = {
  id: Scalars['ID']['input'];
};


export type QueryClientByEmailArgs = {
  email: Scalars['String']['input'];
};


export type QueryClientByPhoneArgs = {
  phoneNumber: Scalars['String']['input'];
};


export type QueryClientsByTagArgs = {
  tag: Scalars['String']['input'];
};


export type QueryClientsByTenantIdArgs = {
  tenantId: Scalars['ID']['input'];
};


export type QueryCommunicationTaskArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCommunicationTaskStatsArgs = {
  communicationId?: InputMaybe<Scalars['ID']['input']>;
  communicationType?: InputMaybe<CommunicationType>;
};


export type QueryCommunicationTasksArgs = {
  communicationId?: InputMaybe<Scalars['ID']['input']>;
  communicationType?: InputMaybe<CommunicationType>;
  status?: InputMaybe<CommunicationTaskStatus>;
};


export type QueryCompanyArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCompanyCalendarsArgs = {
  companyId: Scalars['String']['input'];
};


export type QueryCompanyKnowledgeArticleArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCompanyKnowledgeArticlesArgs = {
  category?: InputMaybe<Scalars['String']['input']>;
  onlyPinned?: InputMaybe<Scalars['Boolean']['input']>;
  onlyPublished?: InputMaybe<Scalars['Boolean']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryCurrentMonthGoalsArgs = {
  calendarId: Scalars['String']['input'];
};


export type QueryDiscoverProvidersArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  scopeToTenant?: InputMaybe<Scalars['Boolean']['input']>;
  searchQuery?: InputMaybe<Scalars['String']['input']>;
};


export type QueryDomainArgs = {
  id: Scalars['String']['input'];
};


export type QueryEmailArgs = {
  id: Scalars['ID']['input'];
};


export type QueryEmailAddressArgs = {
  email?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
};


export type QueryEmailAddressesArgs = {
  isBlocked?: InputMaybe<Scalars['Boolean']['input']>;
  isVerified?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: Scalars['Float']['input'];
  offset?: Scalars['Float']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};


export type QueryEmailInboxArgs = {
  clientId?: InputMaybe<Scalars['String']['input']>;
  emailAddress?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Scalars['String']['input']>;
  isUnassigned?: InputMaybe<Scalars['Boolean']['input']>;
  isUnread?: InputMaybe<Scalars['Boolean']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


export type QueryEmailInboxPaginatedArgs = {
  emailAddress?: InputMaybe<Scalars['String']['input']>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};


export type QueryEmailsArgs = {
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
};


export type QueryEmployeeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryEmployeeByEmailArgs = {
  email: Scalars['String']['input'];
};


export type QueryEmployeesByClientArgs = {
  clientId: Scalars['ID']['input'];
};


export type QueryExportProjectTasksToMarkdownArgs = {
  projectId: Scalars['ID']['input'];
};


export type QueryFrontendUpgradeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryFrontendUpgradesArgs = {
  category?: InputMaybe<UpgradeCategory>;
  status?: InputMaybe<UpgradeStatus>;
  tenantId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryGetAvailabilityByPractitionerIdArgs = {
  endDate: Scalars['String']['input'];
  practitionerId: Scalars['ID']['input'];
  startDate: Scalars['String']['input'];
};


export type QueryGetBillIssuerDetailsArgs = {
  billId: Scalars['ID']['input'];
};


export type QueryGetBookingByTokenArgs = {
  token: Scalars['String']['input'];
};


export type QueryGetBookingCalendarUrlArgs = {
  brand?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetBookingsByPractitionerIdArgs = {
  practitionerId: Scalars['String']['input'];
};


export type QueryGetCalendarsByIdsArgs = {
  ids: Array<Scalars['String']['input']>;
};


export type QueryGetClientDetailsByBillIdArgs = {
  billId: Scalars['ID']['input'];
};


export type QueryGetCoreActivitiesArgs = {
  projectId: Scalars['String']['input'];
};


export type QueryGetFarmImagesArgs = {
  page?: Scalars['Int']['input'];
};


export type QueryGetFarmerByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetFileArgs = {
  hash: Scalars['String']['input'];
};


export type QueryGetFilesArgs = {
  hashes: Array<Scalars['String']['input']>;
};


export type QueryGetLinkedEmailForCalendarArgs = {
  calendarId: Scalars['String']['input'];
  tenantId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetOptimizedImageUrlArgs = {
  height?: InputMaybe<Scalars['Int']['input']>;
  imageUrl: Scalars['String']['input'];
  width?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetProposalArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetProposalBySlugArgs = {
  slug: Scalars['String']['input'];
};


export type QueryGetProposalSignatureArgs = {
  proposalId: Scalars['String']['input'];
};


export type QueryGetProposalSignaturesArgs = {
  proposalId: Scalars['ID']['input'];
};


export type QueryGetRdActivitiesArgs = {
  projectId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetRdActivityArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetRdCommunicationLogsArgs = {
  projectId: Scalars['String']['input'];
};


export type QueryGetRdEvidenceArgs = {
  activityId?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetRdProjectArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetRdProjectGapAnalysisArgs = {
  projectId: Scalars['String']['input'];
};


export type QueryGetRdProjectTotalHoursArgs = {
  projectId: Scalars['String']['input'];
};


export type QueryGetRdProjectsByStatusArgs = {
  status: Scalars['String']['input'];
};


export type QueryGetRdTimeEntriesArgs = {
  activityId?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  projectId?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetVapiCallLogArgs = {
  callId: Scalars['String']['input'];
};


export type QueryGoalStatisticsArgs = {
  calendarId: Scalars['String']['input'];
  period?: InputMaybe<Scalars['String']['input']>;
};


export type QueryInboundEmailArgs = {
  id: Scalars['ID']['input'];
};


export type QueryInboundEmailThreadArgs = {
  threadId: Scalars['String']['input'];
};


export type QueryInboundEmailsArgs = {
  folder?: InputMaybe<Scalars['String']['input']>;
  isRead?: InputMaybe<Scalars['Boolean']['input']>;
  isStarred?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Float']['input']>;
  offset?: InputMaybe<Scalars['Float']['input']>;
  showAllAsAdmin?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryIncompleteTasksArgs = {
  calendarId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryInfluencerArgs = {
  id: Scalars['ID']['input'];
};


export type QueryInfluencerBookingArgs = {
  id: Scalars['ID']['input'];
};


export type QueryInfluencerBookingsArgs = {
  influencerId?: InputMaybe<Scalars['ID']['input']>;
  status?: InputMaybe<InfluencerBookingStatus>;
};


export type QueryInfluencersArgs = {
  niche?: InputMaybe<ContentNiche>;
  status?: InputMaybe<InfluencerStatus>;
  verified?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryInvoiceArgs = {
  id: Scalars['ID']['input'];
};


export type QueryInvoicesByClientArgs = {
  clientId: Scalars['ID']['input'];
};


export type QueryIpfsVideoArgs = {
  id: Scalars['String']['input'];
};


export type QueryIpfsVideoByHashArgs = {
  ipfsHash: Scalars['String']['input'];
};


export type QueryIsUrlSlugAvailableArgs = {
  excludeId?: InputMaybe<Scalars['ID']['input']>;
  urlSlug: Scalars['String']['input'];
};


export type QueryMeetingArgs = {
  id: Scalars['ID']['input'];
};


export type QueryMeetingTaskArgs = {
  id: Scalars['ID']['input'];
};


export type QueryMeetingTasksArgs = {
  meetingId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryModuleEventsArgs = {
  moduleRefId: Scalars['String']['input'];
  moduleType: Scalars['String']['input'];
};


export type QueryMultiCalendarEventsArgs = {
  calendarIds: Array<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryOpportunitiesArgs = {
  assignedTo?: InputMaybe<Scalars['String']['input']>;
  clientId?: InputMaybe<Scalars['String']['input']>;
  stage?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<OpportunityStatus>;
};


export type QueryOpportunityArgs = {
  id: Scalars['String']['input'];
};


export type QueryOpportunityCountArgs = {
  status?: InputMaybe<OpportunityStatus>;
};


export type QueryOpportunityMeetingArgs = {
  id: Scalars['String']['input'];
};


export type QueryOpportunityMeetingsArgs = {
  opportunityId: Scalars['String']['input'];
};


export type QueryOpportunityMembersArgs = {
  opportunityId: Scalars['String']['input'];
};


export type QueryOpportunityNoteArgs = {
  id: Scalars['String']['input'];
};


export type QueryOpportunityNotesArgs = {
  opportunityId: Scalars['String']['input'];
};


export type QueryOpportunityTasksArgs = {
  opportunityId: Scalars['String']['input'];
};


export type QueryPaginatedEmailsArgs = {
  filters?: InputMaybe<OutboundEmailFilterInput>;
  limit?: Scalars['Int']['input'];
  page?: Scalars['Int']['input'];
};


export type QueryPaginatedInboundEmailsArgs = {
  filters?: InputMaybe<EmailFilterInput>;
  limit?: Scalars['Int']['input'];
  page?: Scalars['Int']['input'];
};


export type QueryPasswordArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPasswordAccessLogsArgs = {
  passwordId: Scalars['ID']['input'];
};


export type QueryPaymentMethodsByClientArgs = {
  clientId: Scalars['ID']['input'];
};


export type QueryPhoneNumberArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPractionerByIdArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPractitionerAvailabilityArgs = {
  endDate: Scalars['String']['input'];
  startDate: Scalars['String']['input'];
};


export type QueryPractitionerPublicProfileArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProductArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProductOrderArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProductOrdersByClientArgs = {
  clientId: Scalars['ID']['input'];
};


export type QueryProductOrdersByStatusArgs = {
  status: OrderStatus;
};


export type QueryProductsArgs = {
  sellerProfileId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryProjectArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProjectsByClientArgs = {
  clientId: Scalars['ID']['input'];
};


export type QueryProviderArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPublicAssetArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPublicBillArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPublicBookableEventTypesArgs = {
  calendarSlug: Scalars['String']['input'];
};


export type QueryPublicBookingArgs = {
  token: Scalars['String']['input'];
};


export type QueryPublicCalendarArgs = {
  slug: Scalars['String']['input'];
};


export type QueryPublicCompanyKnowledgeArticleArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPublicFarmerBySlugArgs = {
  tenantId?: InputMaybe<Scalars['ID']['input']>;
  urlSlug: Scalars['String']['input'];
};


export type QueryPublicFarmersArgs = {
  tenantId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryPublicGetBillIssuerDetailsArgs = {
  billId: Scalars['ID']['input'];
};


export type QueryPublicGetClientDetailsByBillIdArgs = {
  billId: Scalars['ID']['input'];
};


export type QueryPublicIpfsVideosArgs = {
  limit?: Scalars['Float']['input'];
};


export type QueryPublicPasswordAccessArgs = {
  input: PublicPasswordAccessInput;
};


export type QueryPublicProductsArgs = {
  filter?: InputMaybe<ProductFilterInput>;
  tenantId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryPublicProjectArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPublicProposalArgs = {
  slug: Scalars['String']['input'];
  tenantId: Scalars['String']['input'];
};


export type QueryPublicProviderArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPublicProviderByClientArgs = {
  clientId: Scalars['ID']['input'];
};


export type QueryPublicProviderBySlugArgs = {
  urlSlug: Scalars['String']['input'];
};


export type QueryPublicProvidersArgs = {
  tenantId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryPublicSellerProfilesArgs = {
  tenantId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryQuoteTemplateArgs = {
  id: Scalars['ID']['input'];
};


export type QueryQuotesArgs = {
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  status?: InputMaybe<QuoteStatus>;
};


export type QuerySearchAssetsArgs = {
  searchTerm: Scalars['String']['input'];
};


export type QuerySearchAvailablePhoneNumbersArgs = {
  areaCode?: InputMaybe<Scalars['String']['input']>;
  capabilities?: InputMaybe<Array<PhoneCapability>>;
  contains?: InputMaybe<Scalars['String']['input']>;
  country?: Scalars['String']['input'];
  limit?: Scalars['Int']['input'];
};


export type QuerySearchClientsArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QuerySearchCompaniesArgs = {
  searchTerm: Scalars['String']['input'];
};


export type QuerySearchDomainsArgs = {
  input: DomainSearchInput;
};


export type QuerySearchImagesArgs = {
  page?: Scalars['Int']['input'];
  perPage?: Scalars['Int']['input'];
  query: Scalars['String']['input'];
};


export type QuerySellerProfileArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySellerProfilesByClientArgs = {
  clientId: Scalars['ID']['input'];
};


export type QuerySessionTypeByIdArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySessionTypesByPractitionerArgs = {
  practitionerId: Scalars['ID']['input'];
};


export type QuerySessionsArgs = {
  endDate: Scalars['String']['input'];
  startDate: Scalars['String']['input'];
};


export type QuerySharedCompanyKnowledgeArticleArgs = {
  token: Scalars['String']['input'];
};


export type QuerySubscriptionArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySubscriptionsByClientArgs = {
  clientId: Scalars['ID']['input'];
};


export type QueryTasksByProjectArgs = {
  projectId: Scalars['ID']['input'];
};


export type QueryTenantArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTotalOpportunityValueArgs = {
  status?: InputMaybe<OpportunityStatus>;
};


export type QueryTranscriptionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUnassignedEmailsArgs = {
  limit?: Scalars['Float']['input'];
  offset?: Scalars['Float']['input'];
};


export type QueryUpcomingEventsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryUploadMultipleToPinataArgs = {
  files: Array<Scalars['Upload']['input']>;
};


export type QueryWebsitesByClientArgs = {
  clientId: Scalars['ID']['input'];
};

export type Quote = {
  __typename?: 'Quote';
  createdAt: Scalars['DateTime']['output'];
  formData: Scalars['JSONObject']['output'];
  id: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  reviewedAt?: Maybe<Scalars['DateTime']['output']>;
  status: QuoteStatus;
  templateId: Scalars['String']['output'];
  tenantId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type QuoteField = {
  __typename?: 'QuoteField';
  fieldId: Scalars['String']['output'];
  label: Scalars['String']['output'];
  options?: Maybe<Array<Scalars['String']['output']>>;
  required: Scalars['Boolean']['output'];
  type: Scalars['String']['output'];
};

export type QuoteFieldInput = {
  fieldId: Scalars['String']['input'];
  label: Scalars['String']['input'];
  options?: InputMaybe<Array<Scalars['String']['input']>>;
  required?: Scalars['Boolean']['input'];
  type: Scalars['String']['input'];
};

export type QuoteInput = {
  formData: Scalars['JSONObject']['input'];
  templateId: Scalars['String']['input'];
};

/** The status of the quote request */
export enum QuoteStatus {
  Accepted = 'ACCEPTED',
  Archived = 'ARCHIVED',
  Pending = 'PENDING',
  Rejected = 'REJECTED',
  Reviewed = 'REVIEWED'
}

export type QuoteTemplate = {
  __typename?: 'QuoteTemplate';
  fields: Array<QuoteField>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  notificationEmail?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['String']['output'];
};

export type QuoteTemplateInput = {
  fields: Array<QuoteFieldInput>;
  name: Scalars['String']['input'];
  notificationEmail?: InputMaybe<Scalars['String']['input']>;
};

export type RdActivity = {
  __typename?: 'RDActivity';
  activityEvidence: Array<RdEvidence>;
  activityName?: Maybe<Scalars['String']['output']>;
  activityTimeEntries: Array<RdTimeEntry>;
  activityType?: Maybe<Scalars['String']['output']>;
  challenges?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  directRelationshipExplanation?: Maybe<Scalars['String']['output']>;
  documentationStage?: Maybe<Scalars['String']['output']>;
  dominantPurposeJustification?: Maybe<Scalars['String']['output']>;
  endDate?: Maybe<Scalars['DateTime']['output']>;
  evidence?: Maybe<Array<RdEvidence>>;
  expectedOutcomes?: Maybe<Scalars['String']['output']>;
  hypothesis?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  initialObservations?: Maybe<Scalars['String']['output']>;
  knowledgeGapEvidence?: Maybe<Scalars['String']['output']>;
  learnings?: Maybe<Scalars['String']['output']>;
  linkedCoreActivity?: Maybe<RdActivity>;
  linkedCoreActivityId?: Maybe<Scalars['String']['output']>;
  methodology?: Maybe<Scalars['String']['output']>;
  milestones?: Maybe<Scalars['String']['output']>;
  objectives?: Maybe<Scalars['String']['output']>;
  outcomes?: Maybe<Scalars['String']['output']>;
  percentageForRD?: Maybe<Scalars['Float']['output']>;
  proposedDesign?: Maybe<Scalars['String']['output']>;
  quantitativeOutcomes?: Maybe<Scalars['String']['output']>;
  rdProjectId: Scalars['String']['output'];
  resources?: Maybe<Scalars['String']['output']>;
  solutions?: Maybe<Scalars['String']['output']>;
  startDate?: Maybe<Scalars['DateTime']['output']>;
  successCriteria?: Maybe<Scalars['String']['output']>;
  systematicExperimentation?: Maybe<Scalars['String']['output']>;
  technicalUncertainty?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['String']['output'];
  timeEntries?: Maybe<Array<RdTimeEntry>>;
  timeline?: Maybe<Scalars['String']['output']>;
  trialLocation?: Maybe<Scalars['String']['output']>;
  trialObjective?: Maybe<Scalars['String']['output']>;
  trialScope?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  variablesTested?: Maybe<Scalars['String']['output']>;
};

export type RdActivityGaps = {
  __typename?: 'RDActivityGaps';
  coreCount: Scalars['Float']['output'];
  supportingCount: Scalars['Float']['output'];
  supportingWithoutCore: Array<Scalars['String']['output']>;
};

export type RdActivityInput = {
  activityName?: InputMaybe<Scalars['String']['input']>;
  activityType?: InputMaybe<Scalars['String']['input']>;
  challenges?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  directRelationshipExplanation?: InputMaybe<Scalars['String']['input']>;
  documentationStage?: InputMaybe<Scalars['String']['input']>;
  dominantPurposeJustification?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  expectedOutcomes?: InputMaybe<Scalars['String']['input']>;
  hypothesis?: InputMaybe<Scalars['String']['input']>;
  initialObservations?: InputMaybe<Scalars['String']['input']>;
  knowledgeGapEvidence?: InputMaybe<Scalars['String']['input']>;
  learnings?: InputMaybe<Scalars['String']['input']>;
  linkedCoreActivityId?: InputMaybe<Scalars['String']['input']>;
  methodology?: InputMaybe<Scalars['String']['input']>;
  milestones?: InputMaybe<Scalars['String']['input']>;
  objectives?: InputMaybe<Scalars['String']['input']>;
  outcomes?: InputMaybe<Scalars['String']['input']>;
  percentageForRD?: InputMaybe<Scalars['Float']['input']>;
  proposedDesign?: InputMaybe<Scalars['String']['input']>;
  quantitativeOutcomes?: InputMaybe<Scalars['String']['input']>;
  rdProjectId: Scalars['String']['input'];
  resources?: InputMaybe<Scalars['String']['input']>;
  solutions?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  successCriteria?: InputMaybe<Scalars['String']['input']>;
  systematicExperimentation?: InputMaybe<Scalars['String']['input']>;
  technicalUncertainty?: InputMaybe<Scalars['String']['input']>;
  timeline?: InputMaybe<Scalars['String']['input']>;
  trialLocation?: InputMaybe<Scalars['String']['input']>;
  trialObjective?: InputMaybe<Scalars['String']['input']>;
  trialScope?: InputMaybe<Scalars['String']['input']>;
  variablesTested?: InputMaybe<Scalars['String']['input']>;
};

export type RdCommunicationLog = {
  __typename?: 'RDCommunicationLog';
  attachments?: Maybe<Scalars['String']['output']>;
  autoCreatedTimeEntry: Scalars['Boolean']['output'];
  communicationType: Scalars['String']['output'];
  content?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  date: Scalars['DateTime']['output'];
  duration?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  participants?: Maybe<Scalars['String']['output']>;
  rdProjectId: Scalars['String']['output'];
  subject?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['String']['output'];
  timeEntryId?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type RdEvidence = {
  __typename?: 'RDEvidence';
  captureDate: Scalars['DateTime']['output'];
  content?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  evidenceType: Scalars['String']['output'];
  fileUrl?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  metadata?: Maybe<Scalars['String']['output']>;
  participants?: Maybe<Scalars['String']['output']>;
  rdActivityId?: Maybe<Scalars['String']['output']>;
  rdProjectId: Scalars['String']['output'];
  source?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['String']['output'];
  title?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type RdEvidenceGaps = {
  __typename?: 'RDEvidenceGaps';
  activitiesWithoutEvidence: Array<Scalars['String']['output']>;
  byType: Scalars['String']['output'];
  totalCount: Scalars['Float']['output'];
};

export type RdGapAnalysisResult = {
  __typename?: 'RDGapAnalysisResult';
  activities: RdActivityGaps;
  evidence: RdEvidenceGaps;
  project: RdProjectGaps;
  stages: Scalars['String']['output'];
  timeTracking: RdTimeTrackingGaps;
};

export type RdProject = {
  __typename?: 'RDProject';
  activities?: Maybe<Array<RdActivity>>;
  createdAt: Scalars['DateTime']['output'];
  endDate?: Maybe<Scalars['DateTime']['output']>;
  estimatedValue?: Maybe<Scalars['Float']['output']>;
  evidence?: Maybe<Array<RdEvidence>>;
  executiveSummary?: Maybe<Scalars['String']['output']>;
  financialYear?: Maybe<Scalars['String']['output']>;
  hypothesis?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  industryKnowledge?: Maybe<Scalars['String']['output']>;
  knowledgeLimitations?: Maybe<Scalars['String']['output']>;
  projectCode?: Maybe<Scalars['String']['output']>;
  projectName?: Maybe<Scalars['String']['output']>;
  projectType?: Maybe<Scalars['String']['output']>;
  startDate?: Maybe<Scalars['DateTime']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  successCriteria?: Maybe<Scalars['String']['output']>;
  systematicExperimentationApproach?: Maybe<Scalars['String']['output']>;
  technicalObjective?: Maybe<Scalars['String']['output']>;
  technicalUncertainty?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['String']['output'];
  timeEntries?: Maybe<Array<RdTimeEntry>>;
  totalHours?: Maybe<Scalars['Float']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  variables?: Maybe<Scalars['String']['output']>;
};

export type RdProjectGaps = {
  __typename?: 'RDProjectGaps';
  completeness: Scalars['Float']['output'];
  missingFields: Array<Scalars['String']['output']>;
};

export type RdProjectInput = {
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  executiveSummary?: InputMaybe<Scalars['String']['input']>;
  financialYear?: InputMaybe<Scalars['String']['input']>;
  hypothesis?: InputMaybe<Scalars['String']['input']>;
  industryKnowledge?: InputMaybe<Scalars['String']['input']>;
  knowledgeLimitations?: InputMaybe<Scalars['String']['input']>;
  projectCode?: InputMaybe<Scalars['String']['input']>;
  projectName?: InputMaybe<Scalars['String']['input']>;
  projectType?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  successCriteria?: InputMaybe<Scalars['String']['input']>;
  systematicExperimentationApproach?: InputMaybe<Scalars['String']['input']>;
  technicalObjective?: InputMaybe<Scalars['String']['input']>;
  technicalUncertainty?: InputMaybe<Scalars['String']['input']>;
  variables?: InputMaybe<Scalars['String']['input']>;
};

export type RdTimeEntry = {
  __typename?: 'RDTimeEntry';
  createdAt: Scalars['DateTime']['output'];
  date: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  hours: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  isUnallocated?: Maybe<Scalars['Boolean']['output']>;
  rdActivityId?: Maybe<Scalars['String']['output']>;
  rdProjectId: Scalars['String']['output'];
  reviewedAt?: Maybe<Scalars['DateTime']['output']>;
  reviewedBy?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['String']['output'];
  timeType?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['String']['output'];
};

export type RdTimeEntryInput = {
  date: Scalars['DateTime']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  hours: Scalars['Float']['input'];
  isUnallocated?: InputMaybe<Scalars['Boolean']['input']>;
  rdActivityId?: InputMaybe<Scalars['String']['input']>;
  rdProjectId?: InputMaybe<Scalars['String']['input']>;
  timeType?: InputMaybe<Scalars['String']['input']>;
};

export type RdTimeTrackingGaps = {
  __typename?: 'RDTimeTrackingGaps';
  activitiesWithoutTime: Array<Scalars['String']['output']>;
  totalHours: Scalars['Float']['output'];
};

export type RsvpResponse = {
  __typename?: 'RSVPResponse';
  event?: Maybe<CalendarEvent>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

/** The status of the recording */
export enum RecordingStatus {
  Completed = 'COMPLETED',
  Deleted = 'DELETED',
  Failed = 'FAILED',
  InProgress = 'IN_PROGRESS',
  Pending = 'PENDING'
}

export type RecurrenceRule = {
  __typename?: 'RecurrenceRule';
  byDay?: Maybe<Array<Scalars['String']['output']>>;
  byHour?: Maybe<Array<Scalars['Float']['output']>>;
  byMinute?: Maybe<Array<Scalars['Float']['output']>>;
  byMonth?: Maybe<Array<Scalars['Float']['output']>>;
  byMonthDay?: Maybe<Array<Scalars['Float']['output']>>;
  bySecond?: Maybe<Array<Scalars['Float']['output']>>;
  bySetPos?: Maybe<Array<Scalars['Float']['output']>>;
  byWeekNo?: Maybe<Array<Scalars['Float']['output']>>;
  byYearDay?: Maybe<Array<Scalars['Float']['output']>>;
  count?: Maybe<Scalars['Float']['output']>;
  frequency: Scalars['String']['output'];
  interval?: Maybe<Scalars['Float']['output']>;
  rruleString?: Maybe<Scalars['String']['output']>;
  tzid?: Maybe<Scalars['String']['output']>;
  until?: Maybe<Scalars['DateTime']['output']>;
  wkst?: Maybe<Scalars['String']['output']>;
};

export type RecurrenceRuleInput = {
  byDay?: InputMaybe<Array<Scalars['String']['input']>>;
  byHour?: InputMaybe<Array<Scalars['Float']['input']>>;
  byMinute?: InputMaybe<Array<Scalars['Float']['input']>>;
  byMonth?: InputMaybe<Array<Scalars['Float']['input']>>;
  byMonthDay?: InputMaybe<Array<Scalars['Float']['input']>>;
  bySecond?: InputMaybe<Array<Scalars['Float']['input']>>;
  bySetPos?: InputMaybe<Array<Scalars['Float']['input']>>;
  byWeekNo?: InputMaybe<Array<Scalars['Float']['input']>>;
  byYearDay?: InputMaybe<Array<Scalars['Float']['input']>>;
  count?: InputMaybe<Scalars['Float']['input']>;
  frequency: Scalars['String']['input'];
  interval?: InputMaybe<Scalars['Float']['input']>;
  rruleString?: InputMaybe<Scalars['String']['input']>;
  tzid?: InputMaybe<Scalars['String']['input']>;
  until?: InputMaybe<Scalars['DateTime']['input']>;
  wkst?: InputMaybe<Scalars['String']['input']>;
};

export type RecurringPayment = {
  __typename?: 'RecurringPayment';
  description?: Maybe<Scalars['String']['output']>;
  endDate?: Maybe<Scalars['DateTime']['output']>;
  lastPaymentDate?: Maybe<Scalars['DateTime']['output']>;
  memberSplits?: Maybe<Array<MemberSplit>>;
  monthlyAmount: Scalars['Float']['output'];
  nextPaymentDate?: Maybe<Scalars['DateTime']['output']>;
  paymentStatus?: Maybe<OpportunityPaymentStatus>;
  probability: Scalars['Float']['output'];
  startDate?: Maybe<Scalars['DateTime']['output']>;
};

export type RecurringPaymentInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  memberSplits?: InputMaybe<Array<MemberSplitInput>>;
  monthlyAmount: Scalars['Float']['input'];
  probability?: InputMaybe<Scalars['Float']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
};

export type RequestEmailChangeInput = {
  clientId: Scalars['String']['input'];
  newEmail: Scalars['String']['input'];
};

export type RequestPhoneChangeInput = {
  clientId: Scalars['String']['input'];
  newPhoneNumber: Scalars['String']['input'];
};

export type RequestProposalEmailVerificationInput = {
  email: Scalars['String']['input'];
  proposalId: Scalars['String']['input'];
};

export type RequiredOpportunities = {
  __typename?: 'RequiredOpportunities';
  monthly: Scalars['Int']['output'];
  quarterly: Scalars['Int']['output'];
  yearly: Scalars['Int']['output'];
};

export type RevenueTargets = {
  __typename?: 'RevenueTargets';
  currentMonthProgress: Scalars['Float']['output'];
  currentQuarterProgress: Scalars['Float']['output'];
  currentYearProgress: Scalars['Float']['output'];
  monthly: Scalars['Float']['output'];
  quarterly: Scalars['Float']['output'];
  requiredOpportunities: RequiredOpportunities;
  yearly: Scalars['Float']['output'];
};

export type ScheduledPayment = {
  __typename?: 'ScheduledPayment';
  billId?: Maybe<Scalars['ID']['output']>;
  daysAfterPrevious?: Maybe<Scalars['Int']['output']>;
  description?: Maybe<Scalars['String']['output']>;
};

export type ScheduledPaymentInput = {
  billId?: InputMaybe<Scalars['ID']['input']>;
  daysAfterPrevious?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
};

export type SearchImage = {
  __typename?: 'SearchImage';
  alt_description?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  height: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  urls: ImageUrls;
  user: ImageUser;
  width: Scalars['Int']['output'];
};

export type SellerProfile = {
  __typename?: 'SellerProfile';
  aboutStory?: Maybe<Scalars['String']['output']>;
  address?: Maybe<SellerProfileAddress>;
  allowedEditors: Array<Client>;
  allowedEditorsClients: Array<Client>;
  averageRating: Scalars['Float']['output'];
  businessHours: Array<SellerProfileBusinessHours>;
  businessName: Scalars['String']['output'];
  businessType: BusinessType;
  categories: Array<Scalars['String']['output']>;
  certifications?: Maybe<Scalars['String']['output']>;
  contactEmail?: Maybe<Scalars['String']['output']>;
  contactPhone?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  deliveryRadius?: Maybe<Scalars['Float']['output']>;
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  images: Array<Scalars['String']['output']>;
  isFeatured: Scalars['Boolean']['output'];
  isVerified: Scalars['Boolean']['output'];
  logoImage?: Maybe<Scalars['String']['output']>;
  madeByClient: Client;
  madeByClientId: Client;
  minimumOrderAmount?: Maybe<Scalars['Float']['output']>;
  offersDelivery: Scalars['Boolean']['output'];
  offersPickup: Scalars['Boolean']['output'];
  offersShipping: Scalars['Boolean']['output'];
  reviewCount: Scalars['Float']['output'];
  socialMedia?: Maybe<SellerProfileSocialMedia>;
  specialties: Array<Scalars['String']['output']>;
  status: SellerProfileStatus;
  tenantId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  yearsInBusiness?: Maybe<Scalars['Float']['output']>;
};

export type SellerProfileAddress = {
  __typename?: 'SellerProfileAddress';
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  latitude?: Maybe<Scalars['Float']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
  postcode?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  street?: Maybe<Scalars['String']['output']>;
};

export type SellerProfileAddressInput = {
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  latitude?: InputMaybe<Scalars['Float']['input']>;
  longitude?: InputMaybe<Scalars['Float']['input']>;
  postcode?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  street?: InputMaybe<Scalars['String']['input']>;
};

export type SellerProfileBusinessHours = {
  __typename?: 'SellerProfileBusinessHours';
  closeTime?: Maybe<Scalars['String']['output']>;
  day: Scalars['String']['output'];
  isClosed: Scalars['Boolean']['output'];
  openTime?: Maybe<Scalars['String']['output']>;
};

export type SellerProfileBusinessHoursInput = {
  closeTime?: InputMaybe<Scalars['String']['input']>;
  day: Scalars['String']['input'];
  isClosed: Scalars['Boolean']['input'];
  openTime?: InputMaybe<Scalars['String']['input']>;
};

export type SellerProfileInput = {
  aboutStory?: InputMaybe<Scalars['String']['input']>;
  address?: InputMaybe<SellerProfileAddressInput>;
  allowedEditors?: InputMaybe<Array<Scalars['String']['input']>>;
  businessHours?: InputMaybe<Array<SellerProfileBusinessHoursInput>>;
  businessName: Scalars['String']['input'];
  businessType: BusinessType;
  categories?: InputMaybe<Array<Scalars['String']['input']>>;
  certifications?: InputMaybe<Scalars['String']['input']>;
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  deliveryRadius?: InputMaybe<Scalars['Float']['input']>;
  description: Scalars['String']['input'];
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  logoImage?: InputMaybe<Scalars['String']['input']>;
  minimumOrderAmount?: InputMaybe<Scalars['Float']['input']>;
  offersDelivery?: InputMaybe<Scalars['Boolean']['input']>;
  offersPickup?: InputMaybe<Scalars['Boolean']['input']>;
  offersShipping?: InputMaybe<Scalars['Boolean']['input']>;
  socialMedia?: InputMaybe<SellerProfileSocialMediaInput>;
  specialties?: InputMaybe<Array<Scalars['String']['input']>>;
  yearsInBusiness?: InputMaybe<Scalars['Float']['input']>;
};

export type SellerProfileSocialMedia = {
  __typename?: 'SellerProfileSocialMedia';
  facebook?: Maybe<Scalars['String']['output']>;
  instagram?: Maybe<Scalars['String']['output']>;
  linkedin?: Maybe<Scalars['String']['output']>;
  tiktok?: Maybe<Scalars['String']['output']>;
  twitter?: Maybe<Scalars['String']['output']>;
  website?: Maybe<Scalars['String']['output']>;
  youtube?: Maybe<Scalars['String']['output']>;
};

export type SellerProfileSocialMediaInput = {
  facebook?: InputMaybe<Scalars['String']['input']>;
  instagram?: InputMaybe<Scalars['String']['input']>;
  linkedin?: InputMaybe<Scalars['String']['input']>;
  tiktok?: InputMaybe<Scalars['String']['input']>;
  twitter?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
  youtube?: InputMaybe<Scalars['String']['input']>;
};

/** The status of the seller profile */
export enum SellerProfileStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  PendingReview = 'PENDING_REVIEW',
  Suspended = 'SUSPENDED'
}

export type Session = {
  __typename?: 'Session';
  availability?: Maybe<Availability>;
  cancellationReason?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  endTime: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isCancelled: Scalars['Boolean']['output'];
  maxParticipants?: Maybe<Scalars['Float']['output']>;
  meetingLink?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  sendReminders: Scalars['Boolean']['output'];
  startTime: Scalars['DateTime']['output'];
  tenantId: Scalars['String']['output'];
  type: SessionType;
  updatedAt: Scalars['DateTime']['output'];
};

/** Format of the session (individual or group) */
export enum SessionFormat {
  Group = 'GROUP',
  Individual = 'INDIVIDUAL'
}

export type SessionInput = {
  availabilityId?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  endTime: Scalars['DateTime']['input'];
  maxParticipants?: InputMaybe<Scalars['Float']['input']>;
  meetingLink?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  sendReminders?: InputMaybe<Scalars['Boolean']['input']>;
  startTime: Scalars['DateTime']['input'];
  typeId: Scalars['String']['input'];
};

export type SessionType = {
  __typename?: 'SessionType';
  availableOnCalendar: Scalars['Boolean']['output'];
  clientId?: Maybe<Scalars['ID']['output']>;
  color?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  duration: Scalars['Float']['output'];
  format: SessionFormat;
  id: Scalars['ID']['output'];
  meetingLink?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  practitionerId?: Maybe<Scalars['ID']['output']>;
  price: Scalars['Float']['output'];
  tenantId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type SessionTypeInput = {
  availableOnCalendar?: InputMaybe<Scalars['Boolean']['input']>;
  clientId: Scalars['String']['input'];
  color?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  duration: Scalars['Float']['input'];
  format: SessionFormat;
  meetingLink?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  practitionerId?: InputMaybe<Scalars['ID']['input']>;
  price: Scalars['Float']['input'];
};

export type ShippingDetails = {
  __typename?: 'ShippingDetails';
  availableShippingMethods: Array<ShippingMethod>;
  dimensions: Scalars['String']['output'];
  requiresSpecialHandling: Scalars['Boolean']['output'];
  shippingRestrictions?: Maybe<Scalars['String']['output']>;
  weight: Scalars['Float']['output'];
};

export type ShippingDetailsInput = {
  availableShippingMethods: Array<ShippingMethod>;
  dimensions: Scalars['String']['input'];
  requiresSpecialHandling: Scalars['Boolean']['input'];
  shippingRestrictions?: InputMaybe<Scalars['String']['input']>;
  weight: Scalars['Float']['input'];
};

/** Available shipping methods */
export enum ShippingMethod {
  Express = 'EXPRESS',
  International = 'INTERNATIONAL',
  LocalPickup = 'LOCAL_PICKUP',
  Standard = 'STANDARD'
}

/** The skill proficiency level */
export enum SkillLevel {
  Advanced = 'ADVANCED',
  Beginner = 'BEGINNER',
  Expert = 'EXPERT',
  Intermediate = 'INTERMEDIATE'
}

export type SocialMediaAccount = {
  __typename?: 'SocialMediaAccount';
  engagementRate?: Maybe<Scalars['Float']['output']>;
  followerCount?: Maybe<Scalars['Int']['output']>;
  lastUpdated?: Maybe<Scalars['DateTime']['output']>;
  platform: SocialPlatform;
  profileUrl: Scalars['String']['output'];
  username: Scalars['String']['output'];
  verified: Scalars['Boolean']['output'];
};

export type SocialMediaAccountInput = {
  engagementRate?: InputMaybe<Scalars['Float']['input']>;
  followerCount?: InputMaybe<Scalars['Int']['input']>;
  lastUpdated?: InputMaybe<Scalars['DateTime']['input']>;
  platform: SocialPlatform;
  profileUrl: Scalars['String']['input'];
  username: Scalars['String']['input'];
  verified: Scalars['Boolean']['input'];
};

/** Social media platforms */
export enum SocialPlatform {
  Facebook = 'FACEBOOK',
  Instagram = 'INSTAGRAM',
  Linkedin = 'LINKEDIN',
  Other = 'OTHER',
  Substack = 'SUBSTACK',
  Tiktok = 'TIKTOK',
  Twitch = 'TWITCH',
  Twitter = 'TWITTER',
  Youtube = 'YOUTUBE'
}

export type StageMetric = {
  __typename?: 'StageMetric';
  averageTimeInStage: Scalars['Float']['output'];
  conversionToNext: Scalars['Float']['output'];
  count: Scalars['Int']['output'];
  stageName: Scalars['String']['output'];
  value: Scalars['Float']['output'];
};

export type StripeConnectDetails = {
  __typename?: 'StripeConnectDetails';
  accountVerified?: Maybe<Scalars['Boolean']['output']>;
  stripeAccountId?: Maybe<Scalars['String']['output']>;
  verifiedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type StripeConnectDetailsInput = {
  accountVerified?: InputMaybe<Scalars['Boolean']['input']>;
  stripeAccountId?: InputMaybe<Scalars['String']['input']>;
  verifiedAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type SubmitContactFormInput = {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  message: Scalars['String']['input'];
  notificationEmails?: InputMaybe<Array<Scalars['String']['input']>>;
  phone: Scalars['String']['input'];
};

export type Subscription = {
  __typename?: 'Subscription';
  canceledAt?: Maybe<Scalars['DateTime']['output']>;
  cancellationReason?: Maybe<Scalars['String']['output']>;
  client: Client;
  clientSecret?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  endDate?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  nextBillingDate: Scalars['DateTime']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  pausedAt?: Maybe<Scalars['DateTime']['output']>;
  plan: SubscriptionPlan;
  startDate: Scalars['DateTime']['output'];
  status: SubscriptionStatus;
  stripeCustomerId?: Maybe<Scalars['String']['output']>;
  stripeSubscriptionId?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['String']['output'];
  trialEndsAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type SubscriptionInput = {
  clientId: Scalars['ID']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  paymentMethodId?: InputMaybe<Scalars['String']['input']>;
  plan: SubscriptionPlanInput;
  startDate?: InputMaybe<Scalars['String']['input']>;
  stripeCustomerId?: InputMaybe<Scalars['String']['input']>;
  trialEndsAt?: InputMaybe<Scalars['String']['input']>;
};

export type SubscriptionPlan = {
  __typename?: 'SubscriptionPlan';
  amount: Scalars['Float']['output'];
  currency?: Maybe<Scalars['String']['output']>;
  description: Scalars['String']['output'];
  includedModules?: Maybe<Array<Scalars['String']['output']>>;
  interval: BillingInterval;
  maxClients?: Maybe<Scalars['Float']['output']>;
  maxUsers?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  stripePriceId?: Maybe<Scalars['String']['output']>;
  tier: SubscriptionTier;
};

export type SubscriptionPlanInput = {
  amount: Scalars['Float']['input'];
  currency?: InputMaybe<Scalars['String']['input']>;
  description: Scalars['String']['input'];
  includedModules?: InputMaybe<Array<Scalars['String']['input']>>;
  interval: BillingInterval;
  maxClients?: InputMaybe<Scalars['Float']['input']>;
  maxUsers?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
  stripePriceId?: InputMaybe<Scalars['String']['input']>;
  tier: SubscriptionTier;
};

export enum SubscriptionStatus {
  Active = 'ACTIVE',
  Canceled = 'CANCELED',
  Incomplete = 'INCOMPLETE',
  PastDue = 'PAST_DUE',
  Paused = 'PAUSED',
  Trialing = 'TRIALING'
}

/** The subscription tier of the tenant */
export enum SubscriptionTier {
  Basic = 'BASIC',
  Communications = 'COMMUNICATIONS',
  Dominance = 'DOMINANCE',
  Enterprise = 'ENTERPRISE',
  Foundation = 'FOUNDATION',
  Free = 'FREE',
  Growth = 'GROWTH',
  Intelligence = 'INTELLIGENCE',
  Premium = 'PREMIUM',
  Professional = 'PROFESSIONAL'
}

export type SuggestedAction = {
  __typename?: 'SuggestedAction';
  description: Scalars['String']['output'];
  priority: Scalars['String']['output'];
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type Task = {
  __typename?: 'Task';
  assignedTo?: Maybe<Array<Client>>;
  billable: Scalars['Boolean']['output'];
  billed: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  media?: Maybe<Array<TaskMedia>>;
  order: Scalars['Float']['output'];
  projectId: Scalars['ID']['output'];
  status: TaskStatus;
  tenantId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type TaskInput = {
  assignedTo?: InputMaybe<Array<Scalars['ID']['input']>>;
  billable?: InputMaybe<Scalars['Boolean']['input']>;
  billed?: InputMaybe<Scalars['Boolean']['input']>;
  description: Scalars['String']['input'];
  media?: InputMaybe<Array<TaskMediaInput>>;
  order?: InputMaybe<Scalars['Float']['input']>;
  projectId: Scalars['ID']['input'];
  status: Scalars['String']['input'];
};

export type TaskMedia = {
  __typename?: 'TaskMedia';
  description?: Maybe<Scalars['String']['output']>;
  fileType: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type TaskMediaInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  fileType: Scalars['String']['input'];
  url: Scalars['String']['input'];
};

/** The status of a task */
export enum TaskStatus {
  Completed = 'COMPLETED',
  InProgress = 'IN_PROGRESS',
  Pending = 'PENDING'
}

export type Tenant = {
  __typename?: 'Tenant';
  alphaId?: Maybe<Scalars['String']['output']>;
  apiKeys?: Maybe<TenantApiKeys>;
  branding?: Maybe<TenantBranding>;
  client?: Maybe<Client>;
  clientId: Scalars['ID']['output'];
  companyDetails?: Maybe<TenantCompanyDetails>;
  createdAt: Scalars['DateTime']['output'];
  dedicatedNumber?: Maybe<Scalars['String']['output']>;
  deploymentUrl?: Maybe<Scalars['String']['output']>;
  domain?: Maybe<Scalars['String']['output']>;
  emailConfig?: Maybe<TenantEmailConfig>;
  githubOwner?: Maybe<Scalars['String']['output']>;
  githubRepo?: Maybe<Scalars['String']['output']>;
  githubToken?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lastDeployment?: Maybe<Scalars['DateTime']['output']>;
  mainBranch?: Maybe<Scalars['String']['output']>;
  moduleConfig: Array<TenantModuleConfig>;
  name: Scalars['String']['output'];
  paymentReceivingDetails?: Maybe<PaymentReceivingDetails>;
  smsConfig?: Maybe<TenantSmsConfig>;
  status: TenantStatus;
  subscriptionTier: SubscriptionTier;
  trialEndsAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  useAlphaId?: Maybe<Scalars['Boolean']['output']>;
  websiteUrl?: Maybe<Scalars['String']['output']>;
};

export type TenantAddress = {
  __typename?: 'TenantAddress';
  addressLine1: Scalars['String']['output'];
  addressLine2?: Maybe<Scalars['String']['output']>;
  city: Scalars['String']['output'];
  country: Scalars['String']['output'];
  postalCode: Scalars['String']['output'];
  state: Scalars['String']['output'];
};

export type TenantAddressInput = {
  addressLine1?: InputMaybe<Scalars['String']['input']>;
  addressLine2?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  postalCode?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
};

export type TenantApiKeys = {
  __typename?: 'TenantApiKeys';
  cellcastApiKey?: Maybe<Scalars['String']['output']>;
  lemonfoxApiKey?: Maybe<Scalars['String']['output']>;
  mobileForwardNumber?: Maybe<Scalars['String']['output']>;
  postmarkApiKey?: Maybe<Scalars['String']['output']>;
  postmarkInboundAddress?: Maybe<Scalars['String']['output']>;
  resellerClubApiKey?: Maybe<Scalars['String']['output']>;
  resellerClubUserId?: Maybe<Scalars['String']['output']>;
  smsNumber?: Maybe<Scalars['String']['output']>;
  stripePublicKey?: Maybe<Scalars['String']['output']>;
  stripeSecretKey?: Maybe<Scalars['String']['output']>;
  stripeWebhookSecret?: Maybe<Scalars['String']['output']>;
  tollFreeNumber?: Maybe<Scalars['String']['output']>;
  twilioAccountSid?: Maybe<Scalars['String']['output']>;
  twilioApiKey?: Maybe<Scalars['String']['output']>;
  twilioApiSecret?: Maybe<Scalars['String']['output']>;
  twilioAppSid?: Maybe<Scalars['String']['output']>;
  twilioAuthToken?: Maybe<Scalars['String']['output']>;
  twilioPhoneNumber?: Maybe<Scalars['String']['output']>;
  unsplashAccessKey?: Maybe<Scalars['String']['output']>;
  unsplashApiKey?: Maybe<Scalars['String']['output']>;
  unsplashApplicationId?: Maybe<Scalars['String']['output']>;
  unsplashSecretKey?: Maybe<Scalars['String']['output']>;
  vapiAssistantId?: Maybe<Scalars['String']['output']>;
  vapiPhoneNumberId?: Maybe<Scalars['String']['output']>;
  vapiPrivateApiKey?: Maybe<Scalars['String']['output']>;
  vapiPublicApiKey?: Maybe<Scalars['String']['output']>;
};

export type TenantApiKeysInput = {
  cellcastApiKey?: InputMaybe<Scalars['String']['input']>;
  lemonfoxApiKey?: InputMaybe<Scalars['String']['input']>;
  mobileForwardNumber?: InputMaybe<Scalars['String']['input']>;
  postmarkApiKey?: InputMaybe<Scalars['String']['input']>;
  postmarkInboundAddress?: InputMaybe<Scalars['String']['input']>;
  resellerClubApiKey?: InputMaybe<Scalars['String']['input']>;
  resellerClubUserId?: InputMaybe<Scalars['String']['input']>;
  smsNumber?: InputMaybe<Scalars['String']['input']>;
  stripePublicKey?: InputMaybe<Scalars['String']['input']>;
  stripeSecretKey?: InputMaybe<Scalars['String']['input']>;
  stripeWebhookSecret?: InputMaybe<Scalars['String']['input']>;
  tollFreeNumber?: InputMaybe<Scalars['String']['input']>;
  twilioAccountSid?: InputMaybe<Scalars['String']['input']>;
  twilioApiKey?: InputMaybe<Scalars['String']['input']>;
  twilioApiSecret?: InputMaybe<Scalars['String']['input']>;
  twilioAppSid?: InputMaybe<Scalars['String']['input']>;
  twilioAuthToken?: InputMaybe<Scalars['String']['input']>;
  twilioPhoneNumber?: InputMaybe<Scalars['String']['input']>;
  unsplashAccessKey?: InputMaybe<Scalars['String']['input']>;
  unsplashApiKey?: InputMaybe<Scalars['String']['input']>;
  unsplashApplicationId?: InputMaybe<Scalars['String']['input']>;
  unsplashSecretKey?: InputMaybe<Scalars['String']['input']>;
  vapiAssistantId?: InputMaybe<Scalars['String']['input']>;
  vapiPhoneNumberId?: InputMaybe<Scalars['String']['input']>;
  vapiPrivateApiKey?: InputMaybe<Scalars['String']['input']>;
  vapiPublicApiKey?: InputMaybe<Scalars['String']['input']>;
};

export type TenantBranding = {
  __typename?: 'TenantBranding';
  accentColor?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  favicon?: Maybe<Scalars['String']['output']>;
  logo?: Maybe<Scalars['String']['output']>;
  primaryColor?: Maybe<Scalars['String']['output']>;
  secondaryColor?: Maybe<Scalars['String']['output']>;
  siteName: Scalars['String']['output'];
  tagline?: Maybe<Scalars['String']['output']>;
};

export type TenantBrandingInput = {
  accentColor?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  favicon?: InputMaybe<Scalars['String']['input']>;
  logo?: InputMaybe<Scalars['String']['input']>;
  primaryColor?: InputMaybe<Scalars['String']['input']>;
  secondaryColor?: InputMaybe<Scalars['String']['input']>;
  siteName: Scalars['String']['input'];
  tagline?: InputMaybe<Scalars['String']['input']>;
};

export type TenantCompanyDetails = {
  __typename?: 'TenantCompanyDetails';
  billingAddress?: Maybe<TenantAddress>;
  billingEmail?: Maybe<Scalars['String']['output']>;
  billingPhone?: Maybe<Scalars['String']['output']>;
  companyName?: Maybe<Scalars['String']['output']>;
  invoicePreferences?: Maybe<TenantInvoicePreferences>;
  taxId?: Maybe<Scalars['String']['output']>;
  taxPercentage?: Maybe<Scalars['Float']['output']>;
};

export type TenantCompanyDetailsInput = {
  billingAddress?: InputMaybe<TenantAddressInput>;
  billingEmail?: InputMaybe<Scalars['String']['input']>;
  billingPhone?: InputMaybe<Scalars['String']['input']>;
  companyName?: InputMaybe<Scalars['String']['input']>;
  invoicePreferences?: InputMaybe<TenantInvoicePreferencesInput>;
  taxId?: InputMaybe<Scalars['String']['input']>;
  taxPercentage?: InputMaybe<Scalars['Float']['input']>;
};

export type TenantEmailConfig = {
  __typename?: 'TenantEmailConfig';
  fromEmail: Scalars['String']['output'];
  fromName: Scalars['String']['output'];
  replyToEmail?: Maybe<Scalars['String']['output']>;
};

export type TenantEmailConfigInput = {
  fromEmail: Scalars['String']['input'];
  fromName: Scalars['String']['input'];
  replyToEmail?: InputMaybe<Scalars['String']['input']>;
};

export type TenantInput = {
  alphaId?: InputMaybe<Scalars['String']['input']>;
  apiKeys?: InputMaybe<TenantApiKeysInput>;
  branding?: InputMaybe<TenantBrandingInput>;
  clientId: Scalars['ID']['input'];
  companyDetails?: InputMaybe<TenantCompanyDetailsInput>;
  dedicatedNumber?: InputMaybe<Scalars['String']['input']>;
  deploymentUrl?: InputMaybe<Scalars['String']['input']>;
  domain?: InputMaybe<Scalars['String']['input']>;
  emailConfig?: InputMaybe<TenantEmailConfigInput>;
  githubOwner?: InputMaybe<Scalars['String']['input']>;
  githubRepo?: InputMaybe<Scalars['String']['input']>;
  githubToken?: InputMaybe<Scalars['String']['input']>;
  mainBranch?: InputMaybe<Scalars['String']['input']>;
  moduleConfig?: InputMaybe<Array<TenantModuleConfigInput>>;
  name: Scalars['String']['input'];
  paymentReceivingDetails?: InputMaybe<PaymentReceivingDetailsInput>;
  skipGithubRepo?: InputMaybe<Scalars['Boolean']['input']>;
  smsConfig?: InputMaybe<TenantSmsConfigInput>;
  subscriptionTier?: SubscriptionTier;
  useAlphaId?: InputMaybe<Scalars['Boolean']['input']>;
  websiteUrl?: InputMaybe<Scalars['String']['input']>;
};

export type TenantInvoicePreferences = {
  __typename?: 'TenantInvoicePreferences';
  autoPayEnabled: Scalars['Boolean']['output'];
  emailInvoices: Scalars['Boolean']['output'];
  invoiceLanguage: Scalars['String']['output'];
  taxIncluded: Scalars['Boolean']['output'];
};

export type TenantInvoicePreferencesInput = {
  autoPayEnabled: Scalars['Boolean']['input'];
  emailInvoices: Scalars['Boolean']['input'];
  invoiceLanguage: Scalars['String']['input'];
  taxIncluded: Scalars['Boolean']['input'];
};

export type TenantModuleConfig = {
  __typename?: 'TenantModuleConfig';
  customConfig?: Maybe<Scalars['String']['output']>;
  enabled: Scalars['Boolean']['output'];
  enabledAt?: Maybe<Scalars['DateTime']['output']>;
  moduleId: Scalars['String']['output'];
  version: Scalars['String']['output'];
};

export type TenantModuleConfigInput = {
  customConfig?: InputMaybe<Scalars['String']['input']>;
  enabled: Scalars['Boolean']['input'];
  enabledAt?: InputMaybe<Scalars['DateTime']['input']>;
  moduleId: Scalars['String']['input'];
  version: Scalars['String']['input'];
};

export type TenantSmsConfig = {
  __typename?: 'TenantSmsConfig';
  defaultList: Array<Scalars['String']['output']>;
  defaultSender: Scalars['String']['output'];
  defaultSenderType: Scalars['String']['output'];
  defaultTags: Array<Scalars['String']['output']>;
};

export type TenantSmsConfigInput = {
  defaultList: Array<Scalars['String']['input']>;
  defaultSender: Scalars['String']['input'];
  defaultSenderType: Scalars['String']['input'];
  defaultTags: Array<Scalars['String']['input']>;
};

/** The status of the tenant */
export enum TenantStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Suspended = 'SUSPENDED',
  Trial = 'TRIAL'
}

export type TenantUpgradeStatus = {
  __typename?: 'TenantUpgradeStatus';
  appliedBy?: Maybe<Scalars['String']['output']>;
  appliedDate?: Maybe<Scalars['DateTime']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  status: UpgradeStatus;
  tenantId: Scalars['ID']['output'];
  tenantName: Scalars['String']['output'];
};

export type TenantUpgradeStatusInput = {
  appliedBy?: InputMaybe<Scalars['String']['input']>;
  appliedDate?: InputMaybe<Scalars['DateTime']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  status: UpgradeStatus;
  tenantId: Scalars['ID']['input'];
  tenantName: Scalars['String']['input'];
};

export type Transcription = {
  __typename?: 'Transcription';
  audioIpfsHash?: Maybe<Scalars['String']['output']>;
  audioUrl?: Maybe<Scalars['String']['output']>;
  confidence?: Maybe<Scalars['Float']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  detectedLanguage?: Maybe<Scalars['String']['output']>;
  duration?: Maybe<Scalars['Float']['output']>;
  errorMessage?: Maybe<Scalars['String']['output']>;
  fileName?: Maybe<Scalars['String']['output']>;
  fileSize?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  lemonfoxJobId?: Maybe<Scalars['String']['output']>;
  owner: Client;
  processingTime?: Maybe<Scalars['Float']['output']>;
  status: AudioTranscriptionStatus;
  tenantId: Scalars['String']['output'];
  title: Scalars['String']['output'];
  transcription?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type TranscriptionInput = {
  audioIpfsHash?: InputMaybe<Scalars['String']['input']>;
  audioUrl?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  fileName?: InputMaybe<Scalars['String']['input']>;
  fileSize?: InputMaybe<Scalars['Float']['input']>;
  owner: Scalars['ID']['input'];
  title: Scalars['String']['input'];
};

/** The status of the transcription */
export enum TranscriptionStatus {
  Completed = 'COMPLETED',
  Failed = 'FAILED',
  InProgress = 'IN_PROGRESS',
  NotRequested = 'NOT_REQUESTED',
  Pending = 'PENDING'
}

export type TranscriptionUpdateInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  errorMessage?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<AudioTranscriptionStatus>;
  title?: InputMaybe<Scalars['String']['input']>;
  transcription?: InputMaybe<Scalars['String']['input']>;
};

export type TranscriptionUploadInput = {
  audioUrl: Scalars['String']['input'];
  fileName?: InputMaybe<Scalars['String']['input']>;
  fileSize?: InputMaybe<Scalars['Float']['input']>;
  transcriptionId: Scalars['ID']['input'];
};

export type TwilioPhoneNumber = {
  __typename?: 'TwilioPhoneNumber';
  assignedAt?: Maybe<Scalars['DateTime']['output']>;
  assignedBy?: Maybe<Scalars['String']['output']>;
  associatedClients?: Maybe<Array<Scalars['String']['output']>>;
  autoTranscribe: Scalars['Boolean']['output'];
  capabilities: Array<PhoneCapability>;
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  forwardToNumber?: Maybe<Scalars['String']['output']>;
  friendlyName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isAssigned: Scalars['Boolean']['output'];
  isoCountry?: Maybe<Scalars['String']['output']>;
  lastUsedAt?: Maybe<Scalars['DateTime']['output']>;
  locality?: Maybe<Scalars['String']['output']>;
  monthlyCost: Scalars['Float']['output'];
  phoneNumber: Scalars['String']['output'];
  phoneNumberSid: Scalars['String']['output'];
  postalCode?: Maybe<Scalars['String']['output']>;
  purchasedAt: Scalars['DateTime']['output'];
  recordCalls: Scalars['Boolean']['output'];
  recordings: Array<CallRecording>;
  region?: Maybe<Scalars['String']['output']>;
  status: PhoneNumberStatus;
  tenantId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  voiceUrl: Scalars['String']['output'];
};

export type TwilioPhoneNumberInput = {
  autoTranscribe?: InputMaybe<Scalars['Boolean']['input']>;
  forwardToNumber?: InputMaybe<Scalars['String']['input']>;
  recordCalls?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateAssetInput = {
  assetType?: InputMaybe<Scalars['ID']['input']>;
  assignedTo?: InputMaybe<Scalars['ID']['input']>;
  company?: InputMaybe<Scalars['ID']['input']>;
  condition?: InputMaybe<AssetCondition>;
  customFields?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  lastMaintenanceDate?: InputMaybe<Scalars['DateTime']['input']>;
  location?: InputMaybe<AssetLocationInput>;
  maintenanceNotes?: InputMaybe<Scalars['String']['input']>;
  manufacturer?: InputMaybe<Scalars['String']['input']>;
  model?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  nextMaintenanceDate?: InputMaybe<Scalars['DateTime']['input']>;
  photos?: InputMaybe<Array<Scalars['String']['input']>>;
  purchaseDate?: InputMaybe<Scalars['DateTime']['input']>;
  purchasePrice?: InputMaybe<Scalars['Float']['input']>;
  serialNumber?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<AssetStatus>;
  supplier?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  warrantyExpiry?: InputMaybe<Scalars['DateTime']['input']>;
};

export type UpdateBusinessCalendarAvailabilityInput = {
  blockedDates?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  extraAvailableDates?: InputMaybe<Array<Scalars['DateTime']['input']>>;
  slots?: InputMaybe<Array<BusinessCalendarAvailabilitySlotInput>>;
  timezone?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateBusinessCalendarBookableEventTypeInput = {
  autoGenerateMeetingLink?: InputMaybe<Scalars['Boolean']['input']>;
  bufferAfterMinutes?: InputMaybe<Scalars['Float']['input']>;
  bufferBeforeMinutes?: InputMaybe<Scalars['Float']['input']>;
  color?: InputMaybe<Scalars['String']['input']>;
  confirmationMessage?: InputMaybe<Scalars['String']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  displayOrder?: InputMaybe<Scalars['Float']['input']>;
  durationMinutes?: InputMaybe<Scalars['Float']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isPaid?: InputMaybe<Scalars['Boolean']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  locationType?: InputMaybe<Scalars['String']['input']>;
  maxBookingsPerDay?: InputMaybe<Scalars['Float']['input']>;
  maxFutureDays?: InputMaybe<Scalars['Float']['input']>;
  meetingLink?: InputMaybe<Scalars['String']['input']>;
  minNoticeHours?: InputMaybe<Scalars['Float']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  questions?: InputMaybe<Array<BusinessCalendarBookingQuestionInput>>;
  reminderHoursBefore?: InputMaybe<Scalars['Float']['input']>;
  stripePriceId?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCalendarEventTaskChecklistInput = {
  checklistItemId: Scalars['String']['input'];
  completed?: InputMaybe<Scalars['Boolean']['input']>;
  taskId: Scalars['String']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateClientInput = {
  billingAddresses?: InputMaybe<Array<ClientBillingDetailsInput>>;
  businessName?: InputMaybe<Scalars['String']['input']>;
  businessRegistrationNumber?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['DateTime']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  encryptedSignatureIpfsUrl?: InputMaybe<Scalars['String']['input']>;
  fName?: InputMaybe<Scalars['String']['input']>;
  lName?: InputMaybe<Scalars['String']['input']>;
  paymentReceivingDetails?: InputMaybe<PaymentReceivingDetailsInput>;
  permissions?: InputMaybe<Array<ClientPermission>>;
  personalCalendarId?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  profilePhoto?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<ClientRole>;
  shippingAddresses?: InputMaybe<Array<ClientShippingDetailsInput>>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  tenantId?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['DateTime']['input']>;
  websites?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type UpdateCommunicationTaskInput = {
  assignedTo?: InputMaybe<Array<Scalars['ID']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['DateTime']['input']>;
  isArchived?: InputMaybe<Scalars['Boolean']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Float']['input']>;
  priority?: InputMaybe<CommunicationTaskPriority>;
  status?: InputMaybe<CommunicationTaskStatus>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCompanyInput = {
  abn?: InputMaybe<Scalars['String']['input']>;
  accountManager?: InputMaybe<Scalars['ID']['input']>;
  acn?: InputMaybe<Scalars['String']['input']>;
  annualRevenue?: InputMaybe<Scalars['Float']['input']>;
  billingEmail?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  employees?: InputMaybe<Array<Scalars['ID']['input']>>;
  establishedDate?: InputMaybe<Scalars['DateTime']['input']>;
  fax?: InputMaybe<Scalars['String']['input']>;
  financialYearEnd?: InputMaybe<Scalars['String']['input']>;
  industry?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  logo?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  numberOfEmployees?: InputMaybe<Scalars['Float']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  physicalAddress?: InputMaybe<CompanyAddressInput>;
  postalAddress?: InputMaybe<CompanyAddressInput>;
  primaryContact?: InputMaybe<CompanyContactInput>;
  status?: InputMaybe<CompanyStatus>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  taxNumber?: InputMaybe<Scalars['String']['input']>;
  tradingName?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<CompanyType>;
  website?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCompanyKnowledgeInput = {
  allowPublicAccess?: InputMaybe<Scalars['Boolean']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  content?: InputMaybe<Scalars['String']['input']>;
  embeddedImages?: InputMaybe<Array<EmbeddedImageInput>>;
  embeddedVideos?: InputMaybe<Array<EmbeddedVideoInput>>;
  isPinned?: InputMaybe<Scalars['Boolean']['input']>;
  isPublished?: InputMaybe<Scalars['Boolean']['input']>;
  metaDescription?: InputMaybe<Scalars['String']['input']>;
  metaKeywords?: InputMaybe<Array<Scalars['String']['input']>>;
  publicSlug?: InputMaybe<Scalars['String']['input']>;
  relatedArticleIds?: InputMaybe<Array<Scalars['String']['input']>>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
  visibility?: InputMaybe<ArticleVisibility>;
};

export type UpdateEmployeeInput = {
  address?: InputMaybe<EmployeeAddressInput>;
  annualSalary?: InputMaybe<Scalars['Float']['input']>;
  bankAccountName?: InputMaybe<Scalars['String']['input']>;
  bankAccountNumber?: InputMaybe<Scalars['String']['input']>;
  bankBSB?: InputMaybe<Scalars['String']['input']>;
  certifications?: InputMaybe<Array<Scalars['String']['input']>>;
  clientId?: InputMaybe<Scalars['ID']['input']>;
  companyId?: InputMaybe<Scalars['ID']['input']>;
  contractType?: InputMaybe<Scalars['String']['input']>;
  dateOfBirth?: InputMaybe<Scalars['DateTime']['input']>;
  department?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  emergencyContact?: InputMaybe<EmployeeEmergencyContactInput>;
  employeeNumber?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  fName?: InputMaybe<Scalars['String']['input']>;
  hourlyRate?: InputMaybe<Scalars['Float']['input']>;
  lName?: InputMaybe<Scalars['String']['input']>;
  mobileNumber?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['String']['input']>;
  profilePhoto?: InputMaybe<Scalars['String']['input']>;
  qualifications?: InputMaybe<Array<Scalars['String']['input']>>;
  role?: InputMaybe<EmployeeRole>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  status?: InputMaybe<EmployeeStatus>;
  superannuationFund?: InputMaybe<Scalars['String']['input']>;
  taxFileNumber?: InputMaybe<Scalars['String']['input']>;
  workingRights?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateFarmerInput = {
  aboutSection?: InputMaybe<FarmerAboutSectionInput>;
  allowedEditors?: InputMaybe<Array<Scalars['String']['input']>>;
  branding?: InputMaybe<FarmerBrandingInput>;
  contactInfo?: InputMaybe<FarmerContactInfoInput>;
  enableBlog?: InputMaybe<Scalars['Boolean']['input']>;
  enableCSA?: InputMaybe<Scalars['Boolean']['input']>;
  enableNewsletter?: InputMaybe<Scalars['Boolean']['input']>;
  enableRecipes?: InputMaybe<Scalars['Boolean']['input']>;
  enableReviews?: InputMaybe<Scalars['Boolean']['input']>;
  featuredProducts?: InputMaybe<Array<FarmerProductShowcaseInput>>;
  heroSection?: InputMaybe<FarmerHeroSectionInput>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  seoSettings?: InputMaybe<FarmerSeoSettingsInput>;
  status?: InputMaybe<FarmerStatus>;
  urlSlug?: InputMaybe<Scalars['String']['input']>;
  valuePropositions?: InputMaybe<Array<FarmerValuePropositionInput>>;
};

export type UpdateFrontendUpgradeInput = {
  category?: InputMaybe<UpgradeCategory>;
  description?: InputMaybe<Scalars['String']['input']>;
  gitCommitUrls?: InputMaybe<Array<Scalars['String']['input']>>;
  markdownDocumentation?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateGoalCheckpointInput = {
  assignedTo?: InputMaybe<Scalars['String']['input']>;
  checkpointId: Scalars['String']['input'];
  completed?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['DateTime']['input']>;
  goalId: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateInfluencerInput = {
  acceptingCampaigns?: InputMaybe<Scalars['Boolean']['input']>;
  achievements?: InputMaybe<Array<Scalars['String']['input']>>;
  bio?: InputMaybe<Scalars['String']['input']>;
  contentSamples?: InputMaybe<Array<Scalars['String']['input']>>;
  countries?: InputMaybe<Array<Scalars['String']['input']>>;
  coverImage?: InputMaybe<Scalars['String']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  displayName?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  fName?: InputMaybe<Scalars['String']['input']>;
  lName?: InputMaybe<Scalars['String']['input']>;
  languages?: InputMaybe<Array<Scalars['String']['input']>>;
  metrics?: InputMaybe<InfluencerMetricsInput>;
  minimumRate?: InputMaybe<Scalars['Float']['input']>;
  niches?: InputMaybe<Array<ContentNiche>>;
  notes?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  preferredContactMethod?: InputMaybe<Scalars['String']['input']>;
  profileImage?: InputMaybe<Scalars['String']['input']>;
  socialAccounts?: InputMaybe<Array<SocialMediaAccountInput>>;
  specializations?: InputMaybe<Array<Scalars['String']['input']>>;
  status?: InputMaybe<InfluencerStatus>;
  websiteUrl?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateInvoiceInput = {
  billingAddress?: InputMaybe<Scalars['String']['input']>;
  billingEmail?: InputMaybe<Scalars['String']['input']>;
  discountAmount?: InputMaybe<Scalars['Float']['input']>;
  dueDate?: InputMaybe<Scalars['String']['input']>;
  lineItems?: InputMaybe<Array<InvoiceLineInput>>;
  notes?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<InvoiceStatus>;
  subtotal?: InputMaybe<Scalars['Float']['input']>;
  taxAmount?: InputMaybe<Scalars['Float']['input']>;
  total?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateMeetingInput = {
  actionItems?: InputMaybe<Array<Scalars['String']['input']>>;
  attendees?: InputMaybe<Array<Scalars['String']['input']>>;
  audioIpfsHash?: InputMaybe<Scalars['String']['input']>;
  audioUrl?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['DateTime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  duration?: InputMaybe<Scalars['Float']['input']>;
  keyPoints?: InputMaybe<Array<Scalars['String']['input']>>;
  location?: InputMaybe<Scalars['String']['input']>;
  participants?: InputMaybe<Array<MeetingParticipantInput>>;
  status?: InputMaybe<Scalars['String']['input']>;
  summary?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  transcription?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateMeetingTaskInput = {
  assignedToId?: InputMaybe<Scalars['ID']['input']>;
  assigneeName?: InputMaybe<Scalars['String']['input']>;
  completed?: InputMaybe<Scalars['Boolean']['input']>;
  dueDate?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  priority?: InputMaybe<Scalars['String']['input']>;
  task?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateNameserversInput = {
  domainId: Scalars['ID']['input'];
  nameservers: Array<Scalars['String']['input']>;
};

export type UpdateProjectProgressInput = {
  progress: Scalars['Float']['input'];
};

export type UpdateProposalInput = {
  agreementMarkdown?: InputMaybe<Scalars['String']['input']>;
  billId?: InputMaybe<Scalars['ID']['input']>;
  companyName?: InputMaybe<Scalars['String']['input']>;
  draftBillId?: InputMaybe<Scalars['ID']['input']>;
  expiresAt?: InputMaybe<Scalars['DateTime']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['ID']['input']>;
  scheduledPayments?: InputMaybe<Array<ScheduledPaymentInput>>;
  status?: InputMaybe<ProposalStatus>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProviderInput = {
  aboutStory?: InputMaybe<Scalars['String']['input']>;
  achievements?: InputMaybe<Array<Scalars['String']['input']>>;
  allowedEditors?: InputMaybe<Array<Scalars['String']['input']>>;
  availability?: InputMaybe<ProviderAvailabilityInput>;
  avatar?: InputMaybe<Scalars['String']['input']>;
  contactInfo?: InputMaybe<ProviderContactInfoInput>;
  description?: InputMaybe<Scalars['String']['input']>;
  education?: InputMaybe<Array<ProviderEducationInput>>;
  experience?: InputMaybe<Array<ProviderExperienceInput>>;
  expertise?: InputMaybe<Array<Scalars['String']['input']>>;
  featuredProductIds?: InputMaybe<Array<Scalars['String']['input']>>;
  heroImage?: InputMaybe<Scalars['String']['input']>;
  isFeatured?: InputMaybe<Scalars['Boolean']['input']>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  portfolioUrl?: InputMaybe<Scalars['String']['input']>;
  roles?: InputMaybe<Array<ProviderRoleInput>>;
  skills?: InputMaybe<Array<ProviderSkillInput>>;
  status?: InputMaybe<ProviderStatus>;
  tagline?: InputMaybe<Scalars['String']['input']>;
  testimonials?: InputMaybe<Array<ProviderTestimonialInput>>;
  title?: InputMaybe<Scalars['String']['input']>;
  urlSlug?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateSellerProfileInput = {
  aboutStory?: InputMaybe<Scalars['String']['input']>;
  address?: InputMaybe<SellerProfileAddressInput>;
  allowedEditors?: InputMaybe<Array<Scalars['String']['input']>>;
  businessHours?: InputMaybe<Array<SellerProfileBusinessHoursInput>>;
  businessName?: InputMaybe<Scalars['String']['input']>;
  businessType?: InputMaybe<BusinessType>;
  categories?: InputMaybe<Array<Scalars['String']['input']>>;
  certifications?: InputMaybe<Scalars['String']['input']>;
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  deliveryRadius?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  logoImage?: InputMaybe<Scalars['String']['input']>;
  minimumOrderAmount?: InputMaybe<Scalars['Float']['input']>;
  offersDelivery?: InputMaybe<Scalars['Boolean']['input']>;
  offersPickup?: InputMaybe<Scalars['Boolean']['input']>;
  offersShipping?: InputMaybe<Scalars['Boolean']['input']>;
  socialMedia?: InputMaybe<SellerProfileSocialMediaInput>;
  specialties?: InputMaybe<Array<Scalars['String']['input']>>;
  status?: InputMaybe<SellerProfileStatus>;
  yearsInBusiness?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateSubscriptionInput = {
  cancellationReason?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  nextBillingDate?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  plan?: InputMaybe<SubscriptionPlanInput>;
  status?: InputMaybe<SubscriptionStatus>;
};

export type UpdateTenantInput = {
  alphaId?: InputMaybe<Scalars['String']['input']>;
  apiKeys?: InputMaybe<TenantApiKeysInput>;
  branding?: InputMaybe<TenantBrandingInput>;
  clientId?: InputMaybe<Scalars['ID']['input']>;
  companyDetails?: InputMaybe<TenantCompanyDetailsInput>;
  dedicatedNumber?: InputMaybe<Scalars['String']['input']>;
  deploymentUrl?: InputMaybe<Scalars['String']['input']>;
  domain?: InputMaybe<Scalars['String']['input']>;
  emailConfig?: InputMaybe<TenantEmailConfigInput>;
  githubOwner?: InputMaybe<Scalars['String']['input']>;
  githubRepo?: InputMaybe<Scalars['String']['input']>;
  mainBranch?: InputMaybe<Scalars['String']['input']>;
  moduleConfig?: InputMaybe<Array<TenantModuleConfigInput>>;
  name?: InputMaybe<Scalars['String']['input']>;
  paymentReceivingDetails?: InputMaybe<PaymentReceivingDetailsInput>;
  smsConfig?: InputMaybe<TenantSmsConfigInput>;
  status?: InputMaybe<TenantStatus>;
  subscriptionTier?: InputMaybe<SubscriptionTier>;
  useAlphaId?: InputMaybe<Scalars['Boolean']['input']>;
  websiteUrl?: InputMaybe<Scalars['String']['input']>;
};

/** Category of frontend upgrade */
export enum UpgradeCategory {
  Accessibility = 'ACCESSIBILITY',
  BugFix = 'BUG_FIX',
  Feature = 'FEATURE',
  Other = 'OTHER',
  Performance = 'PERFORMANCE',
  Refactor = 'REFACTOR',
  Security = 'SECURITY',
  UiEnhancement = 'UI_ENHANCEMENT'
}

export type UpgradeStats = {
  __typename?: 'UpgradeStats';
  completedUpgrades: Scalars['Int']['output'];
  inProgressUpgrades: Scalars['Int']['output'];
  pendingUpgrades: Scalars['Int']['output'];
  totalUpgrades: Scalars['Int']['output'];
};

/** Status of upgrade application */
export enum UpgradeStatus {
  Completed = 'COMPLETED',
  InProgress = 'IN_PROGRESS',
  Pending = 'PENDING',
  Skipped = 'SKIPPED'
}

/** Urgency level for booking requests */
export enum UrgencyLevel {
  Flexible = 'FLEXIBLE',
  Priority = 'PRIORITY',
  Standard = 'STANDARD',
  Urgent = 'URGENT'
}

export type VapiAccessToken = {
  __typename?: 'VapiAccessToken';
  expiresAt: Scalars['DateTime']['output'];
  token: Scalars['String']['output'];
};

export type VapiCallLog = {
  __typename?: 'VapiCallLog';
  assistantId?: Maybe<Scalars['String']['output']>;
  assistantName?: Maybe<Scalars['String']['output']>;
  budget?: Maybe<Scalars['String']['output']>;
  callId: Scalars['String']['output'];
  callbackTime?: Maybe<Scalars['String']['output']>;
  clientId?: Maybe<Scalars['ID']['output']>;
  cost?: Maybe<Scalars['Float']['output']>;
  createdAt: Scalars['DateTime']['output'];
  customerNumber?: Maybe<Scalars['String']['output']>;
  direction: Scalars['String']['output'];
  duration: Scalars['Float']['output'];
  endedAt?: Maybe<Scalars['DateTime']['output']>;
  endedReason?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  interestedTier?: Maybe<Scalars['String']['output']>;
  leadBusinessName?: Maybe<Scalars['String']['output']>;
  leadEmail?: Maybe<Scalars['String']['output']>;
  leadName?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  rawWebhookData?: Maybe<Scalars['String']['output']>;
  recordingUrl?: Maybe<Scalars['String']['output']>;
  requirements?: Maybe<Scalars['String']['output']>;
  startedAt: Scalars['DateTime']['output'];
  status: Scalars['String']['output'];
  summary?: Maybe<Scalars['String']['output']>;
  tenantId: Scalars['String']['output'];
  timeline?: Maybe<Scalars['String']['output']>;
  transcript?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type VapiConfig = {
  __typename?: 'VapiConfig';
  assistantId?: Maybe<Scalars['String']['output']>;
  isConfigured: Scalars['Boolean']['output'];
  phoneNumberId?: Maybe<Scalars['String']['output']>;
  publicApiKey?: Maybe<Scalars['String']['output']>;
};

export type VapiWorkflow = {
  __typename?: 'VapiWorkflow';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
  nodes?: Maybe<Array<VapiWorkflowNode>>;
  orgId?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type VapiWorkflowNode = {
  __typename?: 'VapiWorkflowNode';
  id: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

export type VerifyEmailChangeInput = {
  clientId: Scalars['String']['input'];
  newEmail: Scalars['String']['input'];
  words: Scalars['String']['input'];
};

export type VerifyInput = {
  email: Scalars['String']['input'];
  words: Scalars['String']['input'];
};

export type VerifyPhoneChangeInput = {
  clientId: Scalars['String']['input'];
  newPhoneNumber: Scalars['String']['input'];
  words: Scalars['String']['input'];
};

export type VerifyProposalEmailInput = {
  email: Scalars['String']['input'];
  proposalId: Scalars['String']['input'];
  verificationCode: Scalars['String']['input'];
};

export type VerifySmsInput = {
  phoneNumber: Scalars['String']['input'];
  words: Scalars['String']['input'];
};

/** Types of embedded videos */
export enum VideoEmbedType {
  Ipfs = 'IPFS',
  Rumble = 'RUMBLE',
  Youtube = 'YOUTUBE'
}

/** Source of the video */
export enum VideoSource {
  Other = 'OTHER',
  Upload = 'UPLOAD',
  Youtube = 'YOUTUBE'
}
