import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Link } from '@react-pdf/renderer';
import { brandConfig } from '../../../brandConfig';

// Define styles for the PDF
const styles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        fontSize: 11,
        paddingTop: 30,
        paddingLeft: 60,
        paddingRight: 60,
        paddingBottom: 40,
        lineHeight: 1.5,
        flexDirection: 'column',
    },
    header: {
        flexDirection: 'row',
        marginBottom: 20,
        paddingBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#112233',
    },
    headerLeft: {
        flex: 1,
    },
    headerRight: {
        flex: 1,
        textAlign: 'right',
    },
    title: {
        fontSize: 24,
        marginBottom: 10,
        fontWeight: 'bold',
        color: '#112233',
    },
    billInfo: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    billInfoLeft: {
        flex: 1,
    },
    billInfoRight: {
        flex: 1,
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#112233',
        borderBottomWidth: 1,
        borderBottomColor: '#112233',
        paddingBottom: 4,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    label: {
        fontSize: 10,
        fontWeight: 'bold',
        marginRight: 10,
        color: '#666',
        width: 100,
    },
    value: {
        fontSize: 10,
        flex: 1,
    },
    table: {
        marginTop: 15,
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 2,
        borderBottomColor: '#112233',
        backgroundColor: '#f5f5f5',
        paddingTop: 8,
        paddingBottom: 8,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingTop: 8,
        paddingBottom: 8,
    },
    tableCol: {
        fontSize: 10,
        paddingLeft: 8,
        paddingRight: 8,
    },
    tableColHeader: {
        fontSize: 11,
        fontWeight: 'bold',
        paddingLeft: 8,
        paddingRight: 8,
        color: '#112233',
    },
    descriptionCol: {
        width: '50%',
    },
    dateCol: {
        width: '25%',
    },
    amountCol: {
        width: '25%',
        textAlign: 'right',
    },
    totalSection: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 2,
        borderTopColor: '#112233',
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        marginRight: 20,
        color: '#112233',
    },
    totalAmount: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#112233',
        width: 100,
        textAlign: 'right',
    },
    paymentStatus: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 4,
    },
    paymentStatusText: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    paymentPaid: {
        color: '#22c55e',
    },
    paymentUnpaid: {
        color: '#ef4444',
    },
    footer: {
        marginTop: 40,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        textAlign: 'center',
        fontSize: 9,
        color: '#666',
    },
});

interface BillPDFProps {
    bill: any;
    clientData?: any;
    issuerData?: any;
}

export const BillPDF: React.FC<BillPDFProps> = ({ bill, clientData, issuerData }) => {
    // Debug logging
    console.log('[BillPDF] Bill data:', {
        id: bill?.id,
        acceptCardPayment: bill?.acceptCardPayment,
        acceptCryptoPayment: bill?.acceptCryptoPayment,
        status: bill?.status
    });

    const formatDate = (dateString: string | { $date: string }) => {
        const date = dateString instanceof Object ? dateString.$date : dateString;
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const calculateTotal = () => {
        if (bill.totalAmount && bill.totalAmount > 0) {
            return formatCurrency(bill.totalAmount);
        }
        if (bill.lineItems?.length > 0) {
            const total = bill.lineItems.reduce((total: number, item: any) => total + Number(item.amount), 0);
            return formatCurrency(total);
        }
        return '0.00';
    };

    const calculateTotalNumeric = () => {
        if (bill.totalAmount && bill.totalAmount > 0) {
            return bill.totalAmount;
        }
        if (bill.lineItems?.length > 0) {
            return bill.lineItems.reduce((total: number, item: any) => total + Number(item.amount), 0);
        }
        return 0;
    };

    // Rule: Display only the first 4 digits of the MongoDB ID for invoice ID
    const getDisplayBillId = (fullId: string) => {
        return fullId.substring(0, 4);
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.title}>INVOICE</Text>
                        <Text>Invoice ID: {getDisplayBillId(bill.id)}</Text>
                        <Text>Status: {bill.status}</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text>Date: {formatDate(bill.createdAt)}</Text>
                        {bill.status === 'SENT' && (
                            <Text>Sent: {formatDate(bill.updatedAt)}</Text>
                        )}
                    </View>
                </View>

                {/* Bill From/To Information */}
                <View style={styles.billInfo}>
                    <View style={styles.billInfoLeft}>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Bill From:</Text>
                            {issuerData?.getBillIssuerDetails ? (
                                <>
                                    {(brandConfig.contact.businessName || issuerData.getBillIssuerDetails.businessName) && (
                                        <View style={styles.row}>
                                            <Text style={styles.label}>Business:</Text>
                                            <Text style={styles.value}>{brandConfig.contact.businessName || issuerData.getBillIssuerDetails.businessName}</Text>
                                        </View>
                                    )}
                                    <View style={styles.row}>
                                        <Text style={styles.label}>Contact:</Text>
                                        <Text style={styles.value}>
                                            {brandConfig.contact.contactName || `${issuerData.getBillIssuerDetails.fName} ${issuerData.getBillIssuerDetails.lName}`}
                                        </Text>
                                    </View>
                                    <View style={styles.row}>
                                        <Text style={styles.label}>Email:</Text>
                                        <Text style={styles.value}>{brandConfig.contact.email || issuerData.getBillIssuerDetails.email}</Text>
                                    </View>
                                    <View style={styles.row}>
                                        <Text style={styles.label}>Phone:</Text>
                                        <Text style={styles.value}>{brandConfig.contact.phone || issuerData.getBillIssuerDetails.phoneNumber}</Text>
                                    </View>
                                    {issuerData.getBillIssuerDetails.businessRegistrationNumber && (
                                        <View style={styles.row}>
                                            <Text style={styles.label}>ABN/ACN:</Text>
                                            <Text style={styles.value}>{issuerData.getBillIssuerDetails.businessRegistrationNumber}</Text>
                                        </View>
                                    )}
                                </>
                            ) : (
                                <Text style={styles.value}>Issuer information not available</Text>
                            )}
                        </View>
                    </View>

                    <View style={styles.billInfoRight}>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Bill To:</Text>
                            {clientData?.getClientDetailsByBillId ? (
                                <>
                                    <View style={styles.row}>
                                        <Text style={styles.label}>Name:</Text>
                                        <Text style={styles.value}>
                                            {clientData.getClientDetailsByBillId.fName} {clientData.getClientDetailsByBillId.lName}
                                        </Text>
                                    </View>
                                    <View style={styles.row}>
                                        <Text style={styles.label}>Email:</Text>
                                        <Text style={styles.value}>{clientData.getClientDetailsByBillId.email}</Text>
                                    </View>
                                    {clientData.getClientDetailsByBillId.phoneNumber && (
                                        <View style={styles.row}>
                                            <Text style={styles.label}>Phone:</Text>
                                            <Text style={styles.value}>{clientData.getClientDetailsByBillId.phoneNumber}</Text>
                                        </View>
                                    )}
                                    {clientData.getClientDetailsByBillId.businessName && (
                                        <View style={styles.row}>
                                            <Text style={styles.label}>Business:</Text>
                                            <Text style={styles.value}>{clientData.getClientDetailsByBillId.businessName}</Text>
                                        </View>
                                    )}
                                </>
                            ) : (
                                <Text style={styles.value}>Client information not available</Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Line Items Table */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Services & Items</Text>
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableColHeader, styles.descriptionCol]}>Description</Text>
                            <Text style={[styles.tableColHeader, styles.dateCol]}>Date</Text>
                            <Text style={[styles.tableColHeader, styles.amountCol]}>Amount (AUD)</Text>
                        </View>
                        {bill.lineItems && bill.lineItems.map((item: any, index: number) => (
                            <View key={index} style={styles.tableRow}>
                                <Text style={[styles.tableCol, styles.descriptionCol]}>{item.description}</Text>
                                <Text style={[styles.tableCol, styles.dateCol]}>{formatDate(item.createdAt)}</Text>
                                <Text style={[styles.tableCol, styles.amountCol]}>${formatCurrency(Number(item.amount))}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Total */}
                <View style={styles.totalSection}>
                    <Text style={styles.totalLabel}>Total Amount ({bill.currency || 'AUD'}):</Text>
                    <Text style={styles.totalAmount}>${calculateTotal()} {bill.currency || 'AUD'}</Text>
                </View>

                {/* Payment Status */}
                <View style={styles.paymentStatus}>
                    <Text style={[
                        styles.paymentStatusText,
                        bill.isPaid ? styles.paymentPaid : styles.paymentUnpaid
                    ]}>
                        Payment Status: {bill.isPaid ? 'PAID' : 'UNPAID'}
                    </Text>
                </View>

                {/* Payment Information */}
                {issuerData?.getBillIssuerDetails?.paymentReceivingDetails && (
                    <View style={[styles.section, { marginBottom: 30 }]}>
                        <Text style={styles.sectionTitle}>Payment Information</Text>

                        {/* Bank Account */}
                        {issuerData.getBillIssuerDetails.paymentReceivingDetails.bankAccount && (
                            <View style={{ marginBottom: 10 }}>
                                <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 5 }}>Bank Transfer:</Text>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Account Name:</Text>
                                    <Text style={styles.value}>{issuerData.getBillIssuerDetails.paymentReceivingDetails.bankAccount.accountName}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.label}>BSB:</Text>
                                    <Text style={styles.value}>{issuerData.getBillIssuerDetails.paymentReceivingDetails.bankAccount.bsb}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Account:</Text>
                                    <Text style={styles.value}>{issuerData.getBillIssuerDetails.paymentReceivingDetails.bankAccount.accountNumber}</Text>
                                </View>
                            </View>
                        )}

                        {/* Payment Reference */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Reference:</Text>
                            <Text style={styles.value}>INV-{bill.id.substring(0, 4).toUpperCase()}</Text>
                        </View>

                        {/* Online Payment Options */}
                        {((issuerData.getBillIssuerDetails.paymentReceivingDetails.acceptedMethods?.includes('STRIPE') && bill.acceptCardPayment !== false) || 
                          (issuerData.getBillIssuerDetails.paymentReceivingDetails.acceptedMethods?.includes('CRYPTO') && bill.acceptCryptoPayment === true)) && (
                            <View style={{ marginTop: 10, marginBottom: 15, padding: 10, backgroundColor: '#f7f9fc', borderRadius: 5, border: '1px solid #e0e0e0' }}>
                                <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 8, color: '#333' }}>Online Payment Options</Text>
                                
                                {/* Generate the payment URL - in production this should use actual domain */}
                                {(() => {
                                    const baseUrl = 'https://tommillerservices.com';
                                    const paymentUrl = `${baseUrl}/bill/${bill.id}`;
                                    
                                    return (
                                        <View>
                                            {issuerData.getBillIssuerDetails.paymentReceivingDetails.acceptedMethods?.includes('STRIPE') && 
                                             bill.acceptCardPayment !== false && (
                                                <View style={{ marginBottom: 5 }}>
                                                    <View style={styles.row}>
                                                        <Text style={styles.label}>Credit/Debit Card:</Text>
                                                        <Link src={paymentUrl} style={{ fontSize: 10, color: '#007AFF', textDecoration: 'underline', flex: 1 }}>
                                                            Pay with Visa, Mastercard, or Amex
                                                        </Link>
                                                    </View>
                                                </View>
                                            )}
                                            
                                            {issuerData.getBillIssuerDetails.paymentReceivingDetails.acceptedMethods?.includes('CRYPTO') && 
                                             bill.acceptCryptoPayment === true && (
                                                <View style={{ marginBottom: 5 }}>
                                                    <View style={styles.row}>
                                                        <Text style={styles.label}>Bitcoin (BTC):</Text>
                                                        <View style={{ flex: 1 }}>
                                                            <Link src={paymentUrl} style={{ fontSize: 10, color: '#007AFF', textDecoration: 'underline' }}>
                                                                Pay with Bitcoin Silent Payments
                                                                {issuerData.getBillIssuerDetails.paymentReceivingDetails.cryptoDiscountPercentage && 
                                                                    ` (${issuerData.getBillIssuerDetails.paymentReceivingDetails.cryptoDiscountPercentage}% discount)`
                                                                }
                                                            </Link>
                                                            {issuerData.getBillIssuerDetails.paymentReceivingDetails.cryptoDiscountPercentage && (
                                                                <Text style={{ fontSize: 9, color: '#28a745', marginTop: 2 }}>
                                                                    Save ${formatCurrency(calculateTotalNumeric() * issuerData.getBillIssuerDetails.paymentReceivingDetails.cryptoDiscountPercentage / 100)} {bill.currency || 'AUD'}
                                                                </Text>
                                                            )}
                                                        </View>
                                                    </View>
                                                </View>
                                            )}
                                            
                                            <View style={{ marginTop: 8, padding: 5, backgroundColor: '#e8f4f8', borderRadius: 3 }}>
                                                <Text style={{ fontSize: 9, color: '#666', marginBottom: 3 }}>
                                                    Payment Link: 
                                                </Text>
                                                <Link src={paymentUrl} style={{ fontSize: 9, color: '#007AFF', textDecoration: 'underline' }}>
                                                    {paymentUrl}
                                                </Link>
                                            </View>
                                        </View>
                                    );
                                })()}
                            </View>
                        )}

                        {/* Other payment methods */}
                        {issuerData.getBillIssuerDetails.paymentReceivingDetails.acceptedMethods && (
                            <View style={[styles.row, { marginTop: 10, marginBottom: 20 }]}>
                                <Text style={styles.label}>All Methods:</Text>
                                <Text style={styles.value}>
                                    {issuerData.getBillIssuerDetails.paymentReceivingDetails.acceptedMethods
                                        .filter((method: string) => {
                                            // Always show bank transfer
                                            if (method === 'BANK_TRANSFER') return true;
                                            // Only show Stripe if card payment is enabled (default true if undefined)
                                            if (method === 'STRIPE') return bill.acceptCardPayment !== false;
                                            // Only show Crypto if crypto payment is explicitly enabled
                                            if (method === 'CRYPTO') return bill.acceptCryptoPayment === true;
                                            // Show other methods by default
                                            return true;
                                        })
                                        .map((method: string) => {
                                            switch(method) {
                                                case 'BANK_TRANSFER': return 'Bank Transfer';
                                                case 'STRIPE': return 'Credit Card';
                                                case 'CRYPTO': return 'Bitcoin';
                                                case 'PAYPAL': return 'PayPal';
                                                default: return method;
                                            }
                                        })
                                        .join(', ')}
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={{ fontSize: 10, color: '#666' }}>
                        Thank you for your business! • Generated on {new Date().toLocaleDateString()}
                    </Text>
                </View>
            </Page>
        </Document>
    );
}; 