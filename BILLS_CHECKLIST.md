# Bills Module - Issues & Fixes Checklist

## Current Issues

### ✅ Fixed
- [x] **formatCurrency null handling** - Updated to handle null/undefined values
- [x] **Old bills missing totalAmount** - Made totalAmount nullable in GraphQL schema
- [x] **Payment details fallback** - Added tenant payment details as fallback for old bills
- [x] **GST calculation** - Implemented GST/tax percentage support
- [x] **ProjectId optional** - Made projectId optional when creating bills
- [x] **Payment details validation** - Removed strict @ValidateNested decorators for flexible validation
- [x] **Company details persistence** - Business name and registration number now save to tenant.companyDetails
- [x] **Profile page cleanup** - Removed Business Information and Payment Details cards from profile
- [x] **Bills use tenant data** - Verified bills correctly fallback to tenant payment details
- [x] **getBillIssuerDetails resolver** - Updated to prioritize TENANT data for business/payment details over client data
- [x] **Removed payment method dropdown** - Replaced with flexible payment method toggles (Bank/Card/Crypto)
- [x] **Added acceptBankTransfer field** - New toggle for bank transfer payment option
- [x] **Added clientId field** - Bills now properly track WHO to bill (clientId field)
- [x] **Client auto-selection from project** - When project selected, client is automatically populated
- [x] **Client dropdown UI** - Added client selector for standalone bills (no project)

### 🔄 In Progress
- [ ] **Old bill compatibility** - Ensure all old bills properly fall back to tenant data

### ⚠️ To Fix
- [ ] **Bill PDF generation** - Update to include GST breakdown
- [ ] **Email notifications** - Include GST in email invoices
- [ ] **Public bill view** - Test old bills on public preview page
- [ ] **Bills list page** - Display client name/info on bills list
- [ ] **Bill details page** - Show client information prominently

## Data Migration Considerations

### Old Bills (Created before GST support)
- `subtotal`: null/undefined → Calculate from lineItems
- `taxPercentage`: null/undefined → Default to 0 or tenant's current rate
- `taxAmount`: null/undefined → Calculate as 0
- `totalAmount`: null/undefined → Calculate from lineItems sum

### Payment Details Migration
- Old bills may have payment details on Client record (issuedBy)
- New system: Payment details stored on Tenant record
- **Solution**: Use effectiveIssuerData fallback pattern

## Testing Checklist

### Old Bills
- [ ] Test bill created before GST support displays correctly
- [ ] Test bill without projectId displays correctly
- [ ] Test payment options work with tenant payment details
- [ ] Test PDF generation for old bills

### New Bills
- [ ] Test GST calculation in real-time
- [ ] Test creating bill without project
- [ ] Test creating bill with project
- [ ] Test subtotal, GST, and total display on all pages

### Payment Details
- [ ] Test bank account details display
- [ ] Test crypto wallet details display
- [ ] Test PayPal details display
- [ ] Test Stripe Connect status display
- [ ] Test editing payment details saves to tenant

## Backend Endpoints

### Queries
- `bills` - Get all bills (includes GST fields)
- `bill(id)` - Get single bill (includes GST fields)
- `getBillIssuerDetails(billId)` - Get issuer's payment details
- `currentTenant` - Get tenant company & payment details

### Mutations
- `createBill(input)` - Auto-calculates GST from tenant's taxPercentage
- `updateBill(id, input)` - Update bill details
- `updateTenantCompanyDetails(companyDetails)` - Update company info & tax rate
- `updateTenantPaymentDetails(paymentDetails)` - Update payment receiving details

## Files Modified

### Backend
- `/business-builder-backend/src/entities/models/Bill.ts` - Added GST fields
- `/business-builder-backend/src/entities/models/Client.ts` - Removed strict validation decorators
- `/business-builder-backend/src/entities/models/Tenant.ts` - Added company details & payment details
- `/business-builder-backend/src/resolvers/bill.resolver.ts` - GST calculation logic, `getBillIssuerDetails` now uses tenant data
- `/business-builder-backend/src/resolvers/tenant.resolver.ts` - Company/payment mutations

### Frontend
- `/src/pages/bills/BillDetails.tsx` - GST breakdown display, tenant fallback
- `/src/pages/bills/Bills.tsx` - GST in list view
- `/src/pages/bills/NewBill.tsx` - GST calculation, optional projectId, client selector, payment method toggles
- `/src/pages/bills/CompanyDetails.tsx` - Tax percentage, invoice preferences
- `/src/pages/bills/EditPaymentDetails.tsx` - Tenant payment details, company details mutations
- `/src/pages/bills/PaymentReceivingDetails.tsx` - Display tenant payment info
- `/src/pages/profile/ViewProfile.tsx` - Removed business/payment cards (now in Bills module)

## Notes

- All GST fields are nullable for backward compatibility
- Frontend includes fallback logic: `bill.totalAmount ?? calculate from lineItems`
- **IMPORTANT: Tenant payment/company details take precedence over client details**
- Tax percentage stored with each bill for historical accuracy
- `getBillIssuerDetails` resolver now returns TENANT data for business name, tax ID, and payment details
- Client data only used for issuer's personal contact info (name, email, phone)
