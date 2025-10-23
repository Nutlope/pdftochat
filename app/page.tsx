'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DocumentInfo {
  id: string;
  name: string;
  path: string;
  size: number;
}

export default function DocumentSelection() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (err) {
      setError('Failed to load documents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDocument = (docId: string) => {
    setSelectedDocs(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleStartSession = async () => {
    if (selectedDocs.length === 0) {
      setError('Please select at least one document');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentIds: selectedDocs }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process documents');
      }

      // Redirect to chat page with session ID
      router.push(`/chat?session=${data.sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process documents');
      setProcessing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            PDF to Chat
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Select documents to start your Q&A session
          </p>
        </div>

        {/* Document Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                No documents found in /public/documents/
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Add PDF files to the /public/documents/ directory to get started
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Available Documents
              </h2>

              <div className="space-y-3 mb-6">
                {documents.map((doc) => (
                  <label
                    key={doc.id}
                    className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-500 dark:hover:border-blue-400"
                    style={{
                      borderColor: selectedDocs.includes(doc.id)
                        ? '#3b82f6'
                        : '#e5e7eb',
                      backgroundColor: selectedDocs.includes(doc.id)
                        ? '#eff6ff'
                        : 'transparent',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDocs.includes(doc.id)}
                      onChange={() => toggleDocument(doc.id)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="ml-4 flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {doc.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatFileSize(doc.size)}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {selectedDocs.length} document{selectedDocs.length !== 1 ? 's' : ''} selected
                </div>
                <button
                  onClick={handleStartSession}
                  disabled={processing || selectedDocs.length === 0}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {processing ? (
                    <span className="flex items-center">
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      Processing...
                    </span>
                  ) : (
                    'Start Q&A Session'
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Documents are processed in-memory for your session.
            <br />
            Sessions expire after 1 hour of inactivity.
          </p>
        </div>
      </div>
    </div>
  );
}
