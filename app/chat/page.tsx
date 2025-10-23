'use client';

import { useRef, useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import LoadingDots from '@/components/ui/LoadingDots';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import type {
  ToolbarSlot,
  TransformToolbarSlot,
} from '@react-pdf-viewer/toolbar';
import { toolbarPlugin } from '@react-pdf-viewer/toolbar';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import { useChat } from 'ai/react';

function ChatPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');

  const toolbarPluginInstance = toolbarPlugin();
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { renderDefaultToolbar, Toolbar } = toolbarPluginInstance;

  const transform: TransformToolbarSlot = (slot: ToolbarSlot) => ({
    ...slot,
    Download: () => <></>,
    SwitchTheme: () => <></>,
    Open: () => <></>,
  });

  const [sessionData, setSessionData] = useState<any>(null);
  const [currentDocIndex, setCurrentDocIndex] = useState(0);
  const [sourcesForMessages, setSourcesForMessages] = useState<
    Record<string, any>
  >({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }

    // Fetch session data
    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/session/${sessionId}`);
        if (!response.ok) {
          throw new Error('Session not found or expired');
        }
        const data = await response.json();
        setSessionData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load session');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: '/api/chat',
      body: {
        sessionId,
      },
      onResponse(response) {
        const sourcesHeader = response.headers.get('x-sources');
        const sources = sourcesHeader ? JSON.parse(atob(sourcesHeader)) : [];

        const messageIndexHeader = response.headers.get('x-message-index');
        if (sources.length && messageIndexHeader !== null) {
          setSourcesForMessages({
            ...sourcesForMessages,
            [messageIndexHeader]: sources,
          });
        }
      },
      onError: (e) => {
        setError(e.message);
      },
    });

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  const handleEnter = (e: any) => {
    if (e.key === 'Enter' && !e.shiftKey && input.trim()) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const extractSourcePageNumber = (source: {
    metadata: Record<string, any>;
  }) => {
    return source.metadata.page || source.metadata['loc.pageNumber'] || source.metadata.loc?.pageNumber || 1;
  };

  const extractDocumentName = (source: {
    metadata: Record<string, any>;
  }) => {
    return source.metadata.documentName || 'Unknown';
  };

  if (!sessionId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">No Session</h1>
          <p className="text-gray-600">Please select documents first</p>
          <a href="/" className="mt-4 inline-block text-blue-600 hover:underline">
            Go to document selection
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex flex-col h-screen">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">PDF Chat</h1>
        <a
          href="/"
          className="text-sm text-gray-300 hover:text-white transition"
        >
          New Session
        </a>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: PDF Viewer */}
        <div className="w-1/2 border-r flex flex-col">
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.js">
            <div className="flex-1 flex flex-col bg-gray-100">
              <div
                className="bg-[#eeeeee] flex p-1"
                style={{
                  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                }}
              >
                <Toolbar>{renderDefaultToolbar(transform)}</Toolbar>
              </div>
              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-gray-600">Loading document...</div>
                </div>
              ) : sessionData && sessionData.documentIds.length > 0 ? (
                <>
                  {sessionData.documentIds.length > 1 && (
                    <div className="bg-gray-200 p-2 flex gap-2 overflow-x-auto">
                      {sessionData.documentIds.map((docId: string, idx: number) => (
                        <button
                          key={docId}
                          onClick={() => setCurrentDocIndex(idx)}
                          className={`px-3 py-1 rounded text-sm whitespace-nowrap ${
                            currentDocIndex === idx
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {docId}.pdf
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex-1">
                    <Viewer
                      fileUrl={`/documents/${sessionData.documentIds[currentDocIndex]}.pdf`}
                      plugins={[toolbarPluginInstance, pageNavigationPluginInstance]}
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-gray-600">No documents loaded</div>
                </div>
              )}
            </div>
          </Worker>
        </div>

        {/* Right: Chat Interface */}
        <div className="w-1/2 flex flex-col bg-white">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4" ref={messageListRef}>
            {messages.length === 0 && (
              <div className="flex justify-center items-center h-full text-gray-500">
                <div className="text-center">
                  <p className="text-xl mb-2">Ask your first question!</p>
                  <p className="text-sm">I'll search through your documents and provide answers with page citations</p>
                </div>
              </div>
            )}
            {messages.map((message, index) => {
              const sources = sourcesForMessages[index] || undefined;
              const isLastMessage = !isLoading && index === messages.length - 1;
              const previousMessages = index !== messages.length - 1;

              return (
                <div key={`chatMessage-${index}`} className="mb-4">
                  <div
                    className={`p-4 rounded-lg ${
                      message.role === 'assistant'
                        ? 'bg-gray-100'
                        : 'bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        {message.role === 'assistant' ? (
                          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold">
                            AI
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            U
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <ReactMarkdown className="prose prose-sm max-w-none">
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    </div>

                    {/* Sources */}
                    {(isLastMessage || previousMessages) && sources && sources.length > 0 && (
                      <div className="mt-3 ml-11">
                        <p className="text-xs text-gray-600 mb-2">Sources:</p>
                        <div className="flex flex-wrap gap-2">
                          {sources
                            .filter((source: any, index: number, self: any) => {
                              const pageNumber = extractSourcePageNumber(source);
                              const docName = extractDocumentName(source);
                              const key = `${docName}-${pageNumber}`;
                              return (
                                self.findIndex(
                                  (s: any) =>
                                    `${extractDocumentName(s)}-${extractSourcePageNumber(s)}` === key
                                ) === index
                              );
                            })
                            .map((source: any, idx: number) => (
                              <button
                                key={idx}
                                className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded transition"
                                onClick={() => {
                                  const pageNum = extractSourcePageNumber(source);
                                  pageNavigationPluginInstance.jumpToPage(Number(pageNum) - 1);
                                }}
                                title={`Jump to page ${extractSourcePageNumber(source)} in ${extractDocumentName(source)}`}
                              >
                                {extractDocumentName(source).replace('.pdf', '')} - p.{' '}
                                {extractSourcePageNumber(source)}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div className="border-t p-4 bg-gray-50">
            {error && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="relative">
              <textarea
                className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                disabled={isLoading}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleEnter}
                ref={textAreaRef}
                rows={3}
                maxLength={512}
                placeholder={
                  isLoading ? 'Waiting for response...' : 'Ask me anything...'
                }
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute bottom-3 right-3 text-gray-600 hover:text-gray-800 disabled:text-gray-400 transition"
              >
                {isLoading ? (
                  <LoadingDots color="#000" style="small" />
                ) : (
                  <svg
                    viewBox="0 0 20 20"
                    className="transform rotate-90 w-6 h-6 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}
