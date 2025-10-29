#!/bin/bash

echo "Fixing nullable field access issues..."

# Fix Bills module
echo "Fixing Bills module..."
sed -i '' 's/bill\.lineItems\.reduce/bill.lineItems?.reduce/g' src/pages/bills/Bills.tsx
sed -i '' 's/bill\.lineItems\.length/bill.lineItems?.length || 0/g' src/pages/bills/Bills.tsx

# Fix NewBill - restore LineItem interface locally
echo "Fixing NewBill.tsx..."
cat >> src/pages/bills/NewBill.tsx.tmp << 'EOF'
interface LineItem {
  description: string;
  amount: string | number;
}

EOF
sed '173i\
interface LineItem {\
  description: string;\
  amount: string | number;\
}' src/pages/bills/NewBill.tsx > src/pages/bills/NewBill.tsx.tmp && mv src/pages/bills/NewBill.tsx.tmp src/pages/bills/NewBill.tsx

# Fix Companies module
echo "Fixing Companies module..."
sed -i '' "s/getTypeLabel(company\.type)/getTypeLabel(company.type || '')/g" src/pages/companies/CompaniesList.tsx
sed -i '' "s/window\.open(company\.website/window.open(company.website || ''/g" src/pages/companies/CompaniesList.tsx
sed -i '' "s/formatCurrency(company\.annualRevenue)/formatCurrency(company.annualRevenue || 0)/g" src/pages/companies/CompanyDetails.tsx
sed -i '' "s/formatDate(company\.establishedDate)/formatDate(company.establishedDate || '')/g" src/pages/companies/CompanyDetails.tsx

# Add CompanyAddress interface to CompanyDetails
echo "Adding CompanyAddress interface to CompanyDetails..."
sed -i '' '262i\
interface CompanyAddress {\
    street?: string;\
    city?: string;\
    state?: string;\
    postalCode?: string;\
    country?: string;\
}' src/pages/companies/CompanyDetails.tsx

# Fix Employees module
echo "Fixing Employees module..."
sed -i '' "s/getStatusColor(employee\.status)/getStatusColor(employee.status || '')/g" src/pages/employees/EmployeesList.tsx
sed -i '' "s/formatDate(employee\.startDate)/formatDate(employee.startDate || '')/g" src/pages/employees/EmployeesList.tsx

# Fix Passwords module - use fName instead of name
echo "Fixing Passwords module..."
sed -i '' "s/password\.issuedTo\.name/\`\${password.issuedTo.fName || ''} \${password.issuedTo.lName || ''}\`.trim()/g" src/pages/passwords/PasswordsList.tsx
sed -i '' "s/password\.issuedBy?.name/\`\${password.issuedBy?.fName || ''} \${password.issuedBy?.lName || ''}\`.trim()/g" src/pages/passwords/PasswordsList.tsx
sed -i '' "s/selectedPassword\.issuedTo\.name/\`\${selectedPassword.issuedTo.fName || ''} \${selectedPassword.issuedTo.lName || ''}\`.trim()/g" src/pages/passwords/PasswordsList.tsx
sed -i '' "s/selectedPassword\.issuedBy?.name/\`\${selectedPassword.issuedBy?.fName || ''} \${selectedPassword.issuedBy?.lName || ''}\`.trim()/g" src/pages/passwords/PasswordsList.tsx
sed -i '' "s/password\.issuedTo\.email\./password.issuedTo.email?./g" src/pages/passwords/PasswordsList.tsx

# Fix MyPasswords
sed -i '' "s/window\.open(password\.loginUrl/window.open(password.loginUrl || ''/g" src/pages/passwords/MyPasswords.tsx
sed -i '' "s/window\.open(password\.dashboardUrl/window.open(password.dashboardUrl || ''/g" src/pages/passwords/MyPasswords.tsx
sed -i '' "s/window\.open(selectedPassword\.loginUrl/window.open(selectedPassword.loginUrl || ''/g" src/pages/passwords/MyPasswords.tsx
sed -i '' "s/window\.open(selectedPassword\.dashboardUrl/window.open(selectedPassword.dashboardUrl || ''/g" src/pages/passwords/MyPasswords.tsx
sed -i '' "s/selectedPassword\.issuedBy?.name/\`\${selectedPassword.issuedBy?.fName || ''} \${selectedPassword.issuedBy?.lName || ''}\`.trim()/g" src/pages/passwords/MyPasswords.tsx

# Fix Emails module
echo "Fixing Emails module..."
sed -i '' "s/handleSendEmail(address\.email, address\.name)/handleSendEmail(address.email || '', address.name || '')/g" src/pages/emails/AddressBook.tsx

# Fix Products module
echo "Fixing Products module..."
sed -i '' "s/value={variant\.sku}/value={variant.sku || ''}/g" src/pages/products/NewProductForm.tsx
sed -i '' "s/\[\.\.\.prev\.images/[...(prev.images || [])/g" src/pages/products/ProductView.tsx
sed -i '' "s/prev\.images\.filter/prev.images?.filter/g" src/pages/products/ProductView.tsx
sed -i '' "s/prev\.variants\.length/prev.variants?.length || 0/g" src/pages/products/ProductView.tsx
sed -i '' "s/prev\.variants\.filter/prev.variants?.filter/g" src/pages/products/ProductView.tsx
sed -i '' "s/\[\.\.\.prev\.variants/[...(prev.variants || [])/g" src/pages/products/ProductView.tsx

echo "✅ Nullable field fixes complete!"