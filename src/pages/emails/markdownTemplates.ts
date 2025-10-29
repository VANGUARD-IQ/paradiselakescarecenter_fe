/**
 * Email markdown templates for import/export functionality
 */

export const EMAIL_TEMPLATE_CONTENT = `# Email Template

## Email Metadata
**To:** recipient@example.com
**From:** your-email@example.com
**Subject:** Your Email Subject Here
**CC:**
**BCC:**
**Reply-To:**

---

## Email Body

Hi there,

I wanted to give you a quick overview of [topic].

## Main Section Heading

Here's what you need to know:

**Key Point 1:**
- Important detail about point 1
- Another aspect of this point

**Key Point 2:**
- Information about the second point
- Supporting details

## Another Section

You can use all standard markdown formatting:

- **Bold text** for emphasis
- *Italic text* for subtle emphasis
- [Links](https://example.com) to reference materials
- Bullet lists like this one

### Subsection

Numbered lists work too:

1. First item
2. Second item
3. Third item

> Blockquotes can be used for highlighting important information or quotes

## Conclusion

Feel free to structure your email however you like using markdown formatting.

Best regards,
Your Name

---

**Tips for Using This Template:**
- Fill in the Email Metadata section with your recipient, subject, etc.
- Write your email content using markdown formatting
- Save the file and import it using the "Import Markdown" button
- The markdown will be automatically converted to beautiful HTML formatting
`;

/**
 * Download a markdown file with the given content
 */
export const downloadMarkdownFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
