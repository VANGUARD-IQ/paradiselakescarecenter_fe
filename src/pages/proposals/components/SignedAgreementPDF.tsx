import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 40,
    paddingLeft: 60,
    paddingRight: 60,
    paddingBottom: 60,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 11,
    marginBottom: 6,
    marginTop: 2,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
  },
  subsectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 12,
  },
  paragraph: {
    marginBottom: 8,
    marginTop: 2,
    textAlign: 'justify',
    lineHeight: 1.4,
  },
  listItem: {
    marginLeft: 15,
    marginBottom: 5,
    marginTop: 2,
    lineHeight: 1.4,
  },
  bold: {
    fontWeight: 'bold',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginTop: 10,
    marginBottom: 10,
  },
  signatureSection: {
    marginTop: 30,
    borderTopWidth: 2,
    borderTopColor: '#333',
    paddingTop: 20,
  },
  signatureBlock: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#666',
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  signatureImage: {
    width: 200,
    height: 80,
    marginBottom: 10,
  },
  signatureLabel: {
    fontSize: 9,
    color: '#666',
    marginBottom: 3,
  },
  signatureValue: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 60,
    right: 60,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
  },
});

interface SignedAgreementPDFProps {
  proposalTitle?: string;
  companyName?: string;
  agreementContent?: string;
  signatures?: Array<{
    signerName: string;
    signatureImage: string;
    signatureImagePinataUrl?: string;
    signatureImagePinataCid?: string;
    signedAt: Date;
    ipAddress?: string;
    role?: string;
  }>;
  // Legacy props for backward compatibility
  signerName?: string;
  signatureImage?: string;
  signedAt?: Date;
  ipAddress?: string;
}

export const SignedAgreementPDF: React.FC<SignedAgreementPDFProps> = ({
  proposalTitle,
  companyName,
  agreementContent,
  signatures,
  // Legacy props
  signerName,
  signatureImage,
  signedAt,
  ipAddress,
}) => {
  const formatDate = (date?: Date) => {
    const dateToFormat = date || new Date();
    return new Date(dateToFormat).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  };

  // Helper function to remove emojis and special symbols that don't render in PDF
  const removeEmojis = (text: string): string => {
    // Remove emojis and special unicode symbols
    return text
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{E0020}-\u{E007F}]/gu, '')
      .replace(/[✓✅❌]/g, '') // Remove checkmarks and crosses
      .trim();
  };

  // Simple markdown parser for PDF
  const parseMarkdownToPDF = (markdown: string) => {
    if (!markdown) return [];

    const lines = markdown.split('\n');
    const elements: any[] = [];
    const elementCounts = { h1: 0, h2: 0, h3: 0, list: 0, paragraph: 0, divider: 0, bold: 0 };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Skip empty lines
      if (!trimmed) {
        elements.push(<Text key={`empty-${index}`} style={{ marginBottom: 5 }}> </Text>);
        return;
      }

      // H1 - # Title
      if (trimmed.startsWith('# ')) {
        elementCounts.h1++;
        const content = removeEmojis(trimmed.substring(2));
        elements.push(
          <Text key={index} style={styles.title}>
            {content}
          </Text>
        );
      }
      // H2 - ## Section
      else if (trimmed.startsWith('## ')) {
        elementCounts.h2++;
        const content = removeEmojis(trimmed.substring(3));
        elements.push(
          <Text key={index} style={styles.sectionTitle}>
            {content}
          </Text>
        );
      }
      // H3 - ### Subsection
      else if (trimmed.startsWith('### ')) {
        elementCounts.h3++;
        const content = removeEmojis(trimmed.substring(4));
        elements.push(
          <Text key={index} style={styles.subsectionTitle}>
            {content}
          </Text>
        );
      }
      // List items - - or *
      else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        elementCounts.list++;
        const content = removeEmojis(trimmed.substring(2));
        elements.push(
          <Text key={index} style={styles.listItem}>
            • {content}
          </Text>
        );
      }
      // Horizontal rule
      else if (trimmed === '---' || trimmed === '***') {
        elementCounts.divider++;
        elements.push(<View key={index} style={styles.divider} />);
      }
      // Bold text **text**
      else if (trimmed.includes('**')) {
        elementCounts.bold++;
        const cleanText = removeEmojis(trimmed);
        const parts = cleanText.split('**');
        elements.push(
          <Text key={index} style={styles.paragraph}>
            {parts.map((part, i) =>
              i % 2 === 1 ? <Text key={i} style={styles.bold}>{part}</Text> : part
            )}
          </Text>
        );
      }
      // Regular paragraph
      else {
        elementCounts.paragraph++;
        const content = removeEmojis(trimmed);
        elements.push(
          <Text key={index} style={styles.paragraph}>
            {content}
          </Text>
        );
      }
    });

    console.log('📄 Markdown parsing summary:', {
      totalElements: elements.length,
      h1: elementCounts.h1,
      h2: elementCounts.h2,
      h3: elementCounts.h3,
      lists: elementCounts.list,
      paragraphs: elementCounts.paragraph,
      dividers: elementCounts.divider,
      boldText: elementCounts.bold
    });

    return elements;
  };

  const effectiveDate = signedAt || new Date();
  const effectiveSignatures = signatures || (signerName && signatureImage ? [{
    signerName,
    signatureImage,
    signedAt: signedAt || new Date(),
    ipAddress,
  }] : []);

  // Logging for debugging
  console.log('📄 ========== PDF RENDERING ==========');
  console.log('📄 Proposal Title:', proposalTitle);
  console.log('📄 Company Name:', companyName);
  console.log('📄 Agreement Content Length:', agreementContent?.length || 0);
  console.log('📄 Agreement Content Preview:', agreementContent?.substring(0, 200));
  console.log('📄 Number of Signatures:', effectiveSignatures.length);
  effectiveSignatures.forEach((sig, index) => {
    console.log(`📄 ========== Signature ${index + 1} Details ==========`);
    console.log(`📄 Signer Name: ${sig.signerName}`);
    console.log(`📄 Signed At: ${sig.signedAt}`);
    console.log(`📄 Signature Image Type:`, {
      hasImage: !!sig.signatureImage,
      length: sig.signatureImage?.length || 0,
      isBase64: sig.signatureImage?.startsWith('data:image'),
      isPinataUrl: sig.signatureImage?.includes('pinata.cloud'),
      preview: sig.signatureImage?.substring(0, 100) + '...'
    });
    if (sig.signatureImagePinataUrl) {
      console.log(`📄 Pinata URL: ${sig.signatureImagePinataUrl}`);
    }
    if (sig.signatureImagePinataCid) {
      console.log(`📄 Pinata CID: ${sig.signatureImagePinataCid}`);
    }
    console.log(`📄 ========== End Signature ${index + 1} ==========`);
  });
  console.log('📄 ========== END PDF RENDERING ==========');

  const parsedContent = agreementContent ? parseMarkdownToPDF(agreementContent) : [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{proposalTitle || 'AGREEMENT'}</Text>
          {companyName && <Text style={styles.subtitle}>{companyName}</Text>}
          <Text style={styles.subtitle}>Effective Date: {formatDate(effectiveDate)}</Text>
        </View>

        <View style={styles.divider} />

        {/* Dynamic Markdown Content */}
        <View style={styles.section}>
          {parsedContent.length > 0 ? parsedContent : (
            <Text style={styles.paragraph}>
              No agreement content available.
            </Text>
          )}
        </View>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <Text style={styles.sectionTitle}>DIGITAL SIGNATURE & ACCEPTANCE</Text>

          {effectiveSignatures.map((sig, index) => (
            <View key={index} style={styles.signatureBlock}>
              <Text style={styles.signatureLabel}>CLIENT SIGNATURE:</Text>
              {sig.signatureImage && (
                <Image src={sig.signatureImage} style={styles.signatureImage} />
              )}

              <Text style={styles.signatureLabel}>Signed by:</Text>
              <Text style={styles.signatureValue}>{sig.signerName}</Text>

              <Text style={styles.signatureLabel}>Date and Time:</Text>
              <Text style={styles.signatureValue}>{formatDate(sig.signedAt)}</Text>

              {sig.ipAddress && (
                <>
                  <Text style={styles.signatureLabel}>IP Address:</Text>
                  <Text style={styles.signatureValue}>{sig.ipAddress}</Text>
                </>
              )}

              <Text style={[styles.signatureLabel, { marginTop: 10, fontStyle: 'italic' }]}>
                By signing above, the signatory acknowledges that they have read, understood, and agree to be bound by all
                terms and conditions of this agreement.
              </Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          This is a legally binding electronic signature created on {formatDate(effectiveSignatures[0]?.signedAt || effectiveDate)}
          {'\n'}
          Document ID: {companyName?.toUpperCase().replace(/[^A-Z0-9]/g, '-') || 'AGREEMENT'}-{effectiveSignatures[0]?.signedAt ? new Date(effectiveSignatures[0].signedAt).getTime() : new Date(effectiveDate).getTime()}
          {'\n'}
          Tom Miller Services | tom@tommillerservices.com
        </Text>
      </Page>
    </Document>
  );
};

export default SignedAgreementPDF;
