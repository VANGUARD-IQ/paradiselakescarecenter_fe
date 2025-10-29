import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import Html from 'react-pdf-html';
import { format } from 'date-fns';

// Register fonts
Font.register({
    family: 'Open Sans',
    fonts: [
        { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf' },
        { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf', fontWeight: 700 },
    ]
});

// Create styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 30,
        fontFamily: 'Open Sans',
    },
    header: {
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 2,
        borderBottomColor: '#2563EB',
    },
    title: {
        fontSize: 24,
        fontWeight: 700,
        color: '#1F2937',
        marginBottom: 10,
    },
    metadataSection: {
        marginBottom: 20,
        backgroundColor: '#F9FAFB',
        padding: 15,
        borderRadius: 5,
    },
    metadataRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    metadataLabel: {
        fontSize: 11,
        fontWeight: 700,
        color: '#6B7280',
        width: 80,
    },
    metadataValue: {
        fontSize: 11,
        color: '#1F2937',
        flex: 1,
    },
    bodySection: {
        marginTop: 20,
        marginBottom: 20,
    },
    bodyTitle: {
        fontSize: 14,
        fontWeight: 700,
        color: '#1F2937',
        marginBottom: 10,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    bodyText: {
        fontSize: 11,
        lineHeight: 1.6,
        color: '#374151',
        textAlign: 'justify',
    },
    attachmentSection: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#F3F4F6',
        borderRadius: 5,
    },
    attachmentTitle: {
        fontSize: 12,
        fontWeight: 700,
        color: '#1F2937',
        marginBottom: 10,
    },
    attachmentItem: {
        fontSize: 10,
        color: '#6B7280',
        marginBottom: 5,
        paddingLeft: 10,
    },
    labelSection: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    label: {
        backgroundColor: '#EBF5FF',
        color: '#2563EB',
        padding: '4 8',
        borderRadius: 3,
        fontSize: 9,
        marginRight: 5,
        marginBottom: 5,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        color: '#9CA3AF',
        fontSize: 9,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    watermark: {
        position: 'absolute',
        fontSize: 60,
        color: '#F3F4F6',
        transform: 'rotate(-45deg)',
        opacity: 0.1,
        top: '50%',
        left: '30%',
    },
    // HTML content styles for react-pdf-html
    htmlContainer: {
        fontSize: 11,
        lineHeight: 1.6,
        color: '#374151',
    },
});

// Custom HTML styles for react-pdf-html
const htmlStyles = {
    p: {
        marginTop: 8,
        marginBottom: 8,
        fontSize: 11,
        lineHeight: 1.6,
        color: '#374151',
    },
    h1: {
        fontSize: 18,
        fontWeight: 700,
        marginTop: 12,
        marginBottom: 12,
        color: '#1F2937',
    },
    h2: {
        fontSize: 16,
        fontWeight: 700,
        marginTop: 10,
        marginBottom: 10,
        color: '#1F2937',
    },
    h3: {
        fontSize: 14,
        fontWeight: 700,
        marginTop: 8,
        marginBottom: 8,
        color: '#1F2937',
    },
    h4: {
        fontSize: 12,
        fontWeight: 700,
        marginTop: 6,
        marginBottom: 6,
        color: '#1F2937',
    },
    h5: {
        fontSize: 11,
        fontWeight: 700,
        marginTop: 4,
        marginBottom: 4,
        color: '#1F2937',
    },
    h6: {
        fontSize: 10,
        fontWeight: 700,
        marginTop: 4,
        marginBottom: 4,
        color: '#1F2937',
    },
    strong: {
        fontWeight: 700,
    },
    b: {
        fontWeight: 700,
    },
    em: {
        fontStyle: 'italic',
    },
    i: {
        fontStyle: 'italic',
    },
    u: {
        textDecoration: 'underline',
    },
    a: {
        color: '#2563EB',
        textDecoration: 'underline',
    },
    ul: {
        marginLeft: 20,
        marginTop: 8,
        marginBottom: 8,
    },
    ol: {
        marginLeft: 20,
        marginTop: 8,
        marginBottom: 8,
    },
    li: {
        marginBottom: 4,
        fontSize: 11,
        lineHeight: 1.5,
    },
    blockquote: {
        marginLeft: 15,
        paddingLeft: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#D1D5DB',
        fontStyle: 'italic',
        color: '#6B7280',
    },
    table: {
        marginTop: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    thead: {
        backgroundColor: '#F9FAFB',
    },
    tbody: {},
    tr: {
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    td: {
        padding: 8,
        fontSize: 10,
        borderRightWidth: 1,
        borderRightColor: '#E5E7EB',
    },
    th: {
        padding: 8,
        fontSize: 10,
        fontWeight: 700,
        backgroundColor: '#F9FAFB',
        borderRightWidth: 1,
        borderRightColor: '#E5E7EB',
    },
    hr: {
        marginTop: 10,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    pre: {
        fontSize: 10,
        fontFamily: 'Courier',
        backgroundColor: '#F3F4F6',
        padding: 10,
        marginTop: 8,
        marginBottom: 8,
        borderRadius: 4,
    },
    code: {
        fontSize: 10,
        fontFamily: 'Courier',
        backgroundColor: '#F3F4F6',
        paddingTop: 2,
        paddingBottom: 2,
        paddingLeft: 4,
        paddingRight: 4,
        borderRadius: 2,
    },
    div: {
        fontSize: 11,
        lineHeight: 1.6,
        color: '#374151',
    },
    span: {
        fontSize: 11,
        color: '#374151',
    },
    img: {
        maxWidth: '100%',
    },
    // Handle common email-specific styles
    br: {},
    small: {
        fontSize: 9,
    },
    big: {
        fontSize: 13,
    },
    center: {
        textAlign: 'center',
    },
};

interface EmailPDFProps {
    email: {
        subject: string;
        from: string;
        fromName?: string;
        to: string;
        cc?: string;
        date: string;
        textBody?: string;
        htmlBody?: string;
        labels?: string[];
        attachments?: Array<{
            name: string;
            contentType: string;
            contentLength?: number;
        }>;
    };
    brandName?: string;
}

export const EmailPDF: React.FC<EmailPDFProps> = ({ email, brandName = 'Email Archive' }) => {
    const formatFileSize = (bytes?: number): string => {
        if (!bytes) return 'Unknown size';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    };

    // Sanitize HTML content to remove problematic styles for react-pdf
    const sanitizeHtmlForPdf = (html: string): string => {
        if (!html) return '';
        
        // Remove or replace problematic CSS properties and elements
        const sanitized = html
            // Remove all img tags to prevent CORS issues
            .replace(/<img[^>]*>/gi, '')
            // Replace Arial font with Open Sans (which we have registered)
            .replace(/font-family\s*:\s*["']?Arial["']?/gi, 'font-family: "Open Sans"')
            .replace(/font-family\s*:\s*["']?[^;"']*Arial[^;"']*["']?/gi, 'font-family: "Open Sans"')
            // Replace border: none with border-width: 0
            .replace(/border\s*:\s*none/gi, 'border-width: 0')
            // Replace border-style: none with border-width: 0
            .replace(/border-style\s*:\s*none/gi, 'border-width: 0')
            // Remove vertical-align property (not supported)
            .replace(/vertical-align\s*:\s*[^;"}]*/gi, '')
            // Remove float property (not supported)
            .replace(/float\s*:\s*[^;"}]*/gi, '')
            // Remove position: absolute/relative/fixed (not fully supported)
            .replace(/position\s*:\s*(absolute|relative|fixed)/gi, '')
            // Remove display: none elements entirely
            .replace(/<[^>]+style\s*=\s*["'][^"']*display\s*:\s*none[^"']*["'][^>]*>[\s\S]*?<\/[^>]+>/gi, '')
            // Clean up empty style attributes
            .replace(/style\s*=\s*["']\s*["']/gi, '')
            // Remove unsupported CSS units in margins/paddings
            .replace(/margin[^:]*:\s*auto/gi, 'margin: 0')
            .replace(/padding[^:]*:\s*auto/gi, 'padding: 0');
        
        return sanitized;
    };

    // Determine which content to display
    const hasHtmlContent = email.htmlBody && email.htmlBody.trim().length > 0;
    const hasTextContent = email.textBody && email.textBody.trim().length > 0;
    
    // Sanitize HTML content if present
    const sanitizedHtml = hasHtmlContent ? sanitizeHtmlForPdf(email.htmlBody!) : '';

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Watermark */}
                <Text style={styles.watermark}>{brandName}</Text>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>{email.subject || 'No Subject'}</Text>
                    {email.labels && email.labels.length > 0 && (
                        <View style={styles.labelSection}>
                            {email.labels.map((label, index) => (
                                <Text key={index} style={styles.label}>
                                    {label}
                                </Text>
                            ))}
                        </View>
                    )}
                </View>

                {/* Metadata Section */}
                <View style={styles.metadataSection}>
                    <View style={styles.metadataRow}>
                        <Text style={styles.metadataLabel}>From:</Text>
                        <Text style={styles.metadataValue}>
                            {email.fromName ? `${email.fromName} <${email.from}>` : email.from}
                        </Text>
                    </View>
                    <View style={styles.metadataRow}>
                        <Text style={styles.metadataLabel}>To:</Text>
                        <Text style={styles.metadataValue}>{email.to}</Text>
                    </View>
                    {email.cc && (
                        <View style={styles.metadataRow}>
                            <Text style={styles.metadataLabel}>CC:</Text>
                            <Text style={styles.metadataValue}>{email.cc}</Text>
                        </View>
                    )}
                    <View style={styles.metadataRow}>
                        <Text style={styles.metadataLabel}>Date:</Text>
                        <Text style={styles.metadataValue}>
                            {format(new Date(email.date), 'PPpp')}
                        </Text>
                    </View>
                </View>

                {/* Email Body */}
                <View style={styles.bodySection}>
                    <Text style={styles.bodyTitle}>Message Content</Text>
                    {hasHtmlContent ? (
                        <View style={styles.htmlContainer}>
                            <Html stylesheet={htmlStyles}>
                                {sanitizedHtml}
                            </Html>
                        </View>
                    ) : hasTextContent ? (
                        <Text style={styles.bodyText}>
                            {email.textBody}
                        </Text>
                    ) : (
                        <Text style={styles.bodyText}>
                            No content available
                        </Text>
                    )}
                </View>

                {/* Attachments */}
                {email.attachments && email.attachments.length > 0 && (
                    <View style={styles.attachmentSection}>
                        <Text style={styles.attachmentTitle}>
                            Attachments ({email.attachments.length})
                        </Text>
                        {email.attachments.map((attachment, index) => (
                            <Text key={index} style={styles.attachmentItem}>
                                • {attachment.name} ({attachment.contentType}) - {formatFileSize(attachment.contentLength)}
                            </Text>
                        ))}
                    </View>
                )}

                {/* Footer */}
                <Text style={styles.footer}>
                    Generated on {format(new Date(), 'PPP')} | {brandName} | Confidential
                </Text>
            </Page>
        </Document>
    );
};

export default EmailPDF;