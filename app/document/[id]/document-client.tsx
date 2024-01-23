'use client';

import { useRef, useState, useEffect } from 'react';
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
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import { Document } from '@prisma/client';
import { useChat } from 'ai/react';
import Toggle from '@/components/ui/Toggle';

export default function DocumentClient({
  currentDoc,
  userImage,
}: {
  currentDoc: Document;
  userImage?: string;
}) {
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

  const [sourcesForMessages, setSourcesForMessages] = useState<
    Record<string, any>
  >({});
  const [error, setError] = useState('');
  const [chatOnlyView, setChatOnlyView] = useState(false);

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
      onFinish() {},
    });

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

  let userProfilePic = userImage ? userImage : '/profile-icon.png';

  return (
    <div className="mx-auto flex flex-col no-scrollbar -mt-2">
      <Toggle chatOnlyView={chatOnlyView} setChatOnlyView={setChatOnlyView} />
      <div className="flex justify-between w-full lg:flex-row flex-col sm:space-y-20 lg:space-y-0 p-2">
        {/* Left hand side */}
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.js">
          <div
            className={`w-full h-[90vh] flex-col text-white !important ${
              chatOnlyView ? 'hidden' : 'flex'
            }`}
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
              plugins={[toolbarPluginInstance, pageNavigationPluginInstance]}
            />
          </div>
        </Worker>
        {/* Right hand side */}
        <div className="flex flex-col w-full justify-between align-center h-[90vh] no-scrollbar">
          <div
            className={`w-full min-h-min bg-white border flex justify-center items-center no-scrollbar sm:h-[85vh] h-[80vh]
            `}
          >
            <div
              ref={messageListRef}
              className="w-full h-full overflow-y-scroll no-scrollbar rounded-md mt-4"
            >
              {messages.length === 0 && (
                <div className="flex justify-center h-full items-center text-xl">
                  Ask your first question below!
                </div>
              )}
              {messages.map((message, index) => {
                const sources = sourcesForMessages[index] || undefined;
                const isLastMessage =
                  !isLoading && index === messages.length - 1;
                const previousMessages = index !== messages.length - 1;
                return (
                  <div key={`chatMessage-${index}`}>
                    <div
                      className={`p-4 text-black animate ${
                        message.role === 'assistant'
                          ? 'bg-gray-100'
                          : isLoading && index === messages.length - 1
                          ? 'animate-pulse bg-white'
                          : 'bg-white'
                      }`}
                    >
                      <div className="flex">
                        <Image
                          key={index}
                          src={
                            message.role === 'assistant'
                              ? '/bot-icon.png'
                              : userProfilePic
                          }
                          alt="profile image"
                          width={message.role === 'assistant' ? '35' : '33'}
                          height="30"
                          className="mr-4 rounded-sm h-full"
                          priority
                        />
                        <ReactMarkdown linkTarget="_blank" className="prose">
                          {message.content}
                        </ReactMarkdown>
                      </div>
                      {/* Display the sources */}
                      {(isLastMessage || previousMessages) && sources && (
                        <div className="flex space-x-4 ml-14 mt-3">
                          {sources
                            .filter((source: any, index: number, self: any) => {
                              const pageNumber =
                                source.metadata['loc.pageNumber'];
                              // Check if the current pageNumber is the first occurrence in the array
                              return (
                                self.findIndex(
                                  (s: any) =>
                                    s.metadata['loc.pageNumber'] === pageNumber,
                                ) === index
                              );
                            })
                            .map((source: any) => (
                              <button
                                className="border bg-gray-200 px-3 py-1 hover:bg-gray-100 transition rounded-lg"
                                onClick={() =>
                                  pageNavigationPluginInstance.jumpToPage(
                                    Number(source.metadata['loc.pageNumber']) -
                                      1,
                                  )
                                }
                              >
                                p. {source.metadata['loc.pageNumber']}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex justify-center items-center sm:h-[15vh] h-[20vh]">
            <form
              onSubmit={(e) => handleSubmit(e)}
              className="relative w-full px-4 sm:pt-10 pt-2"
            >
              <textarea
                className="resize-none p-3 pr-10 rounded-md border border-gray-300 bg-white text-black focus:outline-gray-400 w-full"
                disabled={isLoading}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleEnter}
                ref={textAreaRef}
                rows={3}
                autoFocus={false}
                maxLength={512}
                id="userInput"
                name="userInput"
                placeholder={
                  isLoading ? 'Waiting for response...' : 'Ask me anything...'
                }
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute top-[40px] sm:top-[71px] right-6 text-gray-600 bg-transparent py-1 px-2 border-none flex transition duration-300 ease-in-out rounded-sm"
              >
                {isLoading ? (
                  <div className="">
                    <LoadingDots color="#000" style="small" />
                  </div>
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
          {error && (
            <div className="border border-red-400 rounded-md p-4">
              <p className="text-red-500">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
