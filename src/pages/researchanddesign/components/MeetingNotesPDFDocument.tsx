import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingTop: 40,
    paddingLeft: 60,
    paddingRight: 60,
    paddingBottom: 40,
    lineHeight: 1.5,
    flexDirection: 'column',
  },
  header: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333333',
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  metadata: {
    fontSize: 9,
    color: '#888888',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 4,
    color: '#444444',
  },
  content: {
    fontSize: 11,
    lineHeight: 1.4,
    color: '#333333',
    marginBottom: 2,
    textAlign: 'justify',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 60,
    right: 60,
    textAlign: 'center',
    fontSize: 9,
    color: '#999999',
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    paddingTop: 10,
  },
});

interface MeetingNotesPDFDocumentProps {
  title: string;
  description: string;
  participants?: string;
  source?: string;
  projectName?: string;
  activityName?: string;
}

const renderFormattedContent = (content: string) => {
  console.log('📄 Frontend PDF: Rendering content:', content.substring(0, 100) + '...');
  
  // Split content by double newlines to get sections
  const sections = content.split('\n\n');
  console.log('📝 Frontend PDF: Split into', sections.length, 'sections');
  
  return sections.map((section, index) => {
    if (!section.trim()) return null;
    
    const trimmedSection = section.trim();
    console.log(`🔍 Frontend PDF: Processing section ${index}:`, trimmedSection.substring(0, 50) + '...');
    
    // Check if this is a section header (question ending with ?)
    const includesQuestionMark = trimmedSection.includes('?');
    const isShortLine = trimmedSection.length < 100;
    const isQuestionHeader = includesQuestionMark && isShortLine && (
      trimmedSection.includes('What was discussed') ||
      trimmedSection.includes('What were the concerns') ||
      trimmedSection.includes('How are these concerns addressed') ||
      trimmedSection.includes('What are the action steps')
    );
    
    if (isQuestionHeader) {
      console.log('✅ Frontend PDF: Detected as header section');
      return (
        <Text key={`header-${index}`} style={{
          ...styles.sectionTitle, 
          marginTop: index === 0 ? 0 : 16, // More space above headers (except first)
          marginBottom: 3 // Less space below headers
        }}>
          {trimmedSection}
        </Text>
      );
    } else {
      console.log('📄 Frontend PDF: Detected as content section');
      return (
        <Text key={`content-${index}`} style={{
          ...styles.content,
          marginBottom: 1 // Very minimal space between numbered points
        }}>
          {trimmedSection}
        </Text>
      );
    }
  }).filter(Boolean);
};

export const MeetingNotesPDFDocument: React.FC<MeetingNotesPDFDocumentProps> = ({
  title,
  description,
  participants,
  source,
  projectName,
  activityName,
}) => {
  const currentDate = new Date().toLocaleDateString();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>R&D Meeting Notes</Text>
          <Text style={styles.subtitle}>R&D Evidence Documentation</Text>
          <Text style={styles.metadata}>Date: {currentDate}</Text>
          {projectName && <Text style={styles.metadata}>Project: {projectName}</Text>}
          {activityName && <Text style={styles.metadata}>Activity: {activityName}</Text>}
          {participants && <Text style={styles.metadata}>Participants: {participants}</Text>}
          {source && <Text style={styles.metadata}>Source: {source}</Text>}
        </View>

        {/* Content */}
        <View>
          <Text style={styles.sectionTitle}>Meeting Notes</Text>
          {renderFormattedContent(description)}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          R&D Evidence Documentation
        </Text>
      </Page>
    </Document>
  );
};