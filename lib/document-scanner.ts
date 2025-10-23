import fs from 'fs';
import path from 'path';

export interface DocumentInfo {
  id: string;
  name: string;
  path: string;
  size: number;
}

/**
 * Scans the /public/documents directory for PDF files
 */
export async function getAvailableDocuments(): Promise<DocumentInfo[]> {
  const documentsDir = path.join(process.cwd(), 'public', 'documents');

  // Create directory if it doesn't exist
  if (!fs.existsSync(documentsDir)) {
    fs.mkdirSync(documentsDir, { recursive: true });
    return [];
  }

  const files = fs.readdirSync(documentsDir);

  const pdfFiles = files
    .filter(file => file.toLowerCase().endsWith('.pdf'))
    .map(file => {
      const filePath = path.join(documentsDir, file);
      const stats = fs.statSync(filePath);

      return {
        id: file.replace('.pdf', ''),
        name: file,
        path: `/documents/${file}`,
        size: stats.size
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return pdfFiles;
}

/**
 * Get full path to a document by ID
 */
export function getDocumentPath(documentId: string): string {
  return path.join(process.cwd(), 'public', 'documents', `${documentId}.pdf`);
}
