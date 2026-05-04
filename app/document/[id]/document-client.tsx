'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import type {
  ToolbarSlot,
  TransformToolbarSlot,
} from '@react-pdf-viewer/toolbar';
import { toolbarPlugin } from '@react-pdf-viewer/toolbar';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import type { Document } from '@prisma/client';
import { useChat } from 'ai/react';
import { ArrowUp } from 'lucide-react';
import Toggle from '@/components/ui/Toggle';
import SourcePopover from '@/components/ui/SourcePopover';
import SuggestionChips from '@/components/ui/SuggestionChips';
import MessageActions from '@/components/ui/MessageActions';
import ScopePicker from '@/components/ui/ScopePicker';
import SharePopover from '@/components/ui/SharePopover';
import CommandPalette from '@/components/ui/CommandPalette';

type LibraryDoc = { id: string; fileName: string };

type Props = {
  currentDoc: Document & {
    suggestedQuestions?: string[];
    shareToken?: string | null;
  };
  /** When this is a multi-doc chat, the actual Document.id of the anchor */
  anchorDocId?: string;
  /** All docs in the user's library (used by ScopePicker) */
  library?: LibraryDoc[];
  /** Pre-selected scope (multi-doc chats restore this on load) */
  initialDocumentIds?: string[];
  userImage?: string;
  /** Set on the public /share/[token] viewer */
  shareToken?: string;
};

export default function DocumentClient({
  currentDoc,
  anchorDocId,
  library = [],
  initialDocumentIds,
  userImage,
  shareToken,
}: Props) {
  const toolbarPluginInstance = toolbarPlugin();
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { renderDefaultToolbar, Toolbar } = toolbarPluginInstance;

  const transform: TransformToolbarSlot = (slot: ToolbarSlot) => ({
    ...slot,
    Download: () => <></>,
    SwitchTheme: () => <></>,
    Open: () => <></>,
  });

  const chatId = currentDoc.id;
  const pdfUrl = currentDoc.fileUrl;
  const isShareView = !!shareToken;
  const anchor = useMemo<LibraryDoc>(
    () => ({
      id: anchorDocId ?? currentDoc.id,
      fileName: currentDoc.fileName,
    }),
    [anchorDocId, currentDoc.id, currentDoc.fileName],
  );

  const [scope, setScope] = useState<string[]>(
    initialDocumentIds && initialDocumentIds.length > 0
      ? initialDocumentIds
      : [anchor.id],
  );
  const [sourcesForMessages, setSourcesForMessages] = useState<
    Record<string, any>
  >({});
  const [error, setError] = useState('');
  const [chatOnlyView, setChatOnlyView] = useState(false);

  const chatBody = useMemo(
    () =>
      isShareView
        ? { messages: undefined } // body will be set per-request
        : { chatId, documentIds: scope },
    [chatId, scope, isShareView],
  );

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setInput,
    reload,
  } = useChat({
    api: isShareView ? `/api/share/${shareToken}/chat` : '/api/chat',
    body: chatBody,
    onResponse(response) {
      const sourcesHeader = response.headers.get('x-sources');
      const sources = sourcesHeader ? JSON.parse(atob(sourcesHeader)) : [];
      const messageIndexHeader = response.headers.get('x-message-index');
      if (sources.length && messageIndexHeader !== null) {
        setSourcesForMessages((prev) => ({
          ...prev,
          [messageIndexHeader]: sources,
        }));
      }
    },
    onError: (e) => setError(e.message),
  });

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);
  useEffect(() => {
    messageListRef.current?.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages.length]);

  const handleEnter = (e: any) => {
    if (e.key === 'Enter' && !e.shiftKey && messages) {
      e.preventDefault();
      if (input.trim()) handleSubmit(e);
    }
  };

  const extractSourcePageNumber = (source: { metadata: Record<string, any> }) =>
    source.metadata['loc.pageNumber'] ?? source.metadata.loc?.pageNumber;

  function pickSuggestion(q: string) {
    setInput(q);
    // Allow React to flush, then submit.
    window.setTimeout(() => {
      const form = textAreaRef.current?.form;
      if (form) form.requestSubmit();
    }, 0);
  }

  // Scope ids must always include the anchor.
  function setScopeSafe(ids: string[]) {
    const set = new Set(ids);
    set.add(anchor.id);
    setScope(Array.from(set));
  }

  const showScope = !isShareView && library.length > 1;

  return (
    <>
      {!isShareView && <CommandPalette documents={library} />}
      <Toggle chatOnlyView={chatOnlyView} setChatOnlyView={setChatOnlyView} />
      <div
        className={`workspace${chatOnlyView ? ' workspace--chat-only' : ''}`}
      >
        {/* PDF pane */}
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.js">
          <section
            className="workspace__pane workspace__pane--pdf"
            aria-label="PDF preview"
          >
            <div className="pdf-toolbar">
              <Toolbar>{renderDefaultToolbar(transform)}</Toolbar>
              {!isShareView && (
                <div className="pdf-toolbar__actions">
                  <SharePopover
                    documentId={anchor.id}
                    initialToken={currentDoc.shareToken ?? null}
                  />
                </div>
              )}
            </div>
            <div className="pdf-frame">
              <Viewer
                fileUrl={pdfUrl as string}
                plugins={[toolbarPluginInstance, pageNavigationPluginInstance]}
              />
            </div>
          </section>
        </Worker>

        {/* Chat pane */}
        <section
          className="workspace__pane workspace__pane--chat"
          aria-label="Chat"
        >
          {isShareView && (
            <div className="share-banner" role="note">
              You’re chatting with a shared document.{' '}
              <a href="/" className="link">
                Sign up
              </a>{' '}
              to upload your own.
            </div>
          )}

          <div className="thread no-scrollbar" ref={messageListRef}>
            {messages.length === 0 && (
              <EmptyState
                fallbackHint={!isShareView}
                suggestions={currentDoc.suggestedQuestions ?? []}
                onPick={pickSuggestion}
              />
            )}
            {messages.map((message, index) => {
              const sources = sourcesForMessages[index] || undefined;
              const isAssistant = message.role === 'assistant';
              const showSources = sources && sources.length > 0;
              const isLastMessage = index === messages.length - 1;
              return (
                <article key={`chatMessage-${index}`} className="bubble">
                  <div className="bubble__avatar">
                    {isAssistant ? (
                      <span>AI</span>
                    ) : userImage ? (
                      <Image src={userImage} alt="" width={28} height={28} />
                    ) : (
                      <span>YOU</span>
                    )}
                  </div>
                  <div>
                    <p className="bubble__role">
                      {isAssistant ? 'PDFtoChat' : 'You'}
                    </p>
                    <div className="msg-prose">
                      <ReactMarkdown linkTarget="_blank">
                        {message.content}
                      </ReactMarkdown>
                    </div>
                    {showSources && (
                      <div className="bubble__sources">
                        {dedupeSources(sources, extractSourcePageNumber).map(
                          (source: any) => {
                            const pn = extractSourcePageNumber(source);
                            return (
                              <SourcePopover
                                key={pn}
                                pageNumber={pn}
                                excerpt={source.pageContent ?? ''}
                                onJump={() =>
                                  pageNavigationPluginInstance.jumpToPage(
                                    Number(pn) - 1,
                                  )
                                }
                              />
                            );
                          },
                        )}
                      </div>
                    )}
                    {isAssistant && message.content && (
                      <MessageActions
                        text={message.content}
                        sources={sources}
                        isLast={isLastMessage}
                        isLoading={isLoading}
                        onRegenerate={() => reload()}
                      />
                    )}
                  </div>
                </article>
              );
            })}

            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <article className="bubble" aria-live="polite">
                <div className="bubble__avatar">
                  <span>AI</span>
                </div>
                <div>
                  <p className="bubble__role">PDFtoChat</p>
                  <span className="dots">
                    <span />
                    <span />
                    <span />
                  </span>
                  <div className="bubble__sources">
                    <span className="bubble__source bubble__source--skel" />
                    <span className="bubble__source bubble__source--skel" />
                    <span className="bubble__source bubble__source--skel" />
                  </div>
                </div>
              </article>
            )}
          </div>

          <form className="composer" onSubmit={handleSubmit}>
            {showScope && (
              <ScopePicker
                library={library}
                anchor={anchor}
                selected={scope}
                onChange={setScopeSafe}
              />
            )}
            <div className="composer__shell">
              <textarea
                ref={textAreaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleEnter}
                rows={2}
                disabled={isLoading}
                placeholder={
                  isLoading ? 'Waiting for response…' : 'Ask me anything…'
                }
                maxLength={512}
                id="userInput"
                name="userInput"
              />
              <button
                type="submit"
                aria-label="Send message"
                className="composer__send"
                disabled={isLoading || !input.trim()}
              >
                <ArrowUp size={14} aria-hidden="true" strokeWidth={2.2} />
              </button>
            </div>
            <span className="composer__hint">
              Press <kbd>Enter</kbd> to send · <kbd>Shift + Enter</kbd> for a
              new line
            </span>
            {error && (
              <p
                role="alert"
                style={{
                  color: 'var(--color-danger)',
                  fontSize: 'var(--text-sm)',
                  marginTop: 'var(--space-xs)',
                }}
              >
                {error}
              </p>
            )}
          </form>
        </section>
      </div>
    </>
  );
}

function EmptyState({
  fallbackHint,
  suggestions,
  onPick,
}: {
  fallbackHint: boolean;
  suggestions: string[];
  onPick: (q: string) => void;
}) {
  if (suggestions.length > 0) {
    return (
      <div className="thread__empty thread__empty--rich">
        <strong>Ask the document anything.</strong>
        <SuggestionChips questions={suggestions} onPick={onPick} />
      </div>
    );
  }
  if (fallbackHint) {
    return (
      <div className="thread__empty">
        <strong>Ask the document anything.</strong>
        Try “summarise section 3” or “list the key terms.” Replies cite the
        exact source pages.
      </div>
    );
  }
  return (
    <div className="thread__empty">
      <strong>Ask anything.</strong>
      You’re viewing a shared document — try a question to get started.
    </div>
  );
}

function dedupeSources(
  sources: any[],
  extract: (s: { metadata: Record<string, any> }) => any,
): any[] {
  return sources.filter((s, i, self) => {
    const pn = extract(s);
    return self.findIndex((other) => extract(other) === pn) === i;
  });
}
