'use client';

import { useRef, useState, useEffect } from 'react';
import styles from '@/styles/Home.module.css';
import Image from 'next/image';
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
import { Document } from '@prisma/client';
import { useChat } from 'ai/react';

export default function DocumentClient({
  currentDoc,
}: {
  currentDoc: Document;
}) {
  const toolbarPluginInstance = toolbarPlugin();
  const { renderDefaultToolbar, Toolbar } = toolbarPluginInstance;

  const transform: TransformToolbarSlot = (slot: ToolbarSlot) => ({
    ...slot,
    Download: () => <></>,
    SwitchTheme: () => <></>,
    Open: () => <></>,
  });

  const chatId = currentDoc.id;
  const pdfUrl = currentDoc.fileUrl;

  const [sourcesForMessages, setSourcesForMessages] = useState<
    Record<string, any>
  >({});
  const [error, setError] = useState('');

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: '/api/chat',
      body: {
        chatId,
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

  console.log({ messages });
  console.log({ sourcesForMessages });

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  // TODO: Maybe define custom handleSubmit to set loading state and erase the input?

  // // Prevent empty chat submissions
  const handleEnter = (e: any) => {
    if (e.key === 'Enter' && messages) {
      handleSubmit(e);
    } else if (e.key == 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div className="mx-auto flex gap-4 flex-col">
      <div className="">
        <h1 className="text-2xl font-bold leading-[1.1] tracking-tighter text-center mb-10">
          Chat With Your PDFs
        </h1>
        <div className="flex justify-between w-screen lg:flex-row flex-col lg:space-x-6 space-y-20 lg:space-y-0 p-10">
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.js">
            <div
              className="w-full h-[750px] flex flex-col"
              style={{
                border: '1px solid rgba(0, 0, 0, 0.3)',
              }}
            >
              <div
                className="align-center bg-[#eeeeee] flex p-1"
                style={{
                  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                }}
              >
                <Toolbar>{renderDefaultToolbar(transform)}</Toolbar>
              </div>
              <Viewer
                fileUrl={pdfUrl as string}
                plugins={[toolbarPluginInstance]}
              />
            </div>
          </Worker>
          <div className="flex flex-col w-full justify-between align-center">
            <div className={styles.cloud}>
              <div ref={messageListRef} className={styles.messagelist}>
                {messages.map((message, index) => {
                  let icon;
                  let className;
                  if (message.role === 'assistant') {
                    icon = (
                      <Image
                        key={index}
                        src="/bot-image.png"
                        alt="AI"
                        width="40"
                        height="40"
                        className={styles.boticon}
                        priority
                      />
                    );
                    className = styles.apimessage;
                  } else {
                    icon = (
                      <Image
                        key={index}
                        src="/usericon.png"
                        alt="Me"
                        width="30"
                        height="30"
                        className={styles.usericon}
                        priority
                      />
                    );
                    // The latest message sent by the user will be animated while waiting for a response
                    className =
                      isLoading && index === messages.length - 1
                        ? styles.usermessagewaiting
                        : styles.usermessage;
                  }
                  return (
                    <div key={`chatMessage-${index}`}>
                      <div className={className}>
                        {icon}
                        <div className={styles.markdownanswer}>
                          <ReactMarkdown linkTarget="_blank" className="prose">
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className={styles.center}>
              <div className={styles.cloudform}>
                <form onSubmit={(e) => handleSubmit(e)}>
                  <textarea
                    className={styles.textarea}
                    disabled={isLoading}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleEnter}
                    ref={textAreaRef}
                    autoFocus={false}
                    rows={1}
                    maxLength={512}
                    id="userInput"
                    name="userInput"
                    placeholder={
                      isLoading
                        ? 'Waiting for response...'
                        : 'What is this pdf about?'
                    }
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={styles.generatebutton}
                  >
                    {isLoading ? (
                      <div className={styles.loadingwheel}>
                        <LoadingDots color="#000" style="small" />
                      </div>
                    ) : (
                      <svg
                        viewBox="0 0 20 20"
                        className={styles.svgicon}
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                      </svg>
                    )}
                  </button>
                </form>
              </div>
            </div>
            {error && (
              <div className="border border-red-400 rounded-md p-4">
                <p className="text-red-500">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
