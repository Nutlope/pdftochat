'use client';

import { UploadDropzone } from 'react-uploader';
import { Uploader } from 'uploader';
import { useRouter } from 'next/navigation';
import DocIcon from '@/components/ui/DocIcon';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import TrashIcon from '@/components/ui/Trash';

interface Document {
  id: string;
  fileName: string;
  fileUrl: string;
  createdAt: Date;
}

// Configuration for the uploader
const uploader = Uploader({
  apiKey: !!process.env.NEXT_PUBLIC_BYTESCALE_API_KEY
    ? process.env.NEXT_PUBLIC_BYTESCALE_API_KEY
    : 'no api key found',
});

export default function DashboardClient({
  initialDocsList,
}: {
  initialDocsList: Document[];
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [docsList, setDocsList] = useState(initialDocsList);

  const updateDocsList = (newDocsList: any[]) => {
    setDocsList(newDocsList);
  };

  const options = {
    maxFileCount: 1,
    mimeTypes: ['application/pdf'],
    editor: { images: { crop: false } },
    styles: {
      colors: {
        primary: '#000', // Primary buttons & links
        error: '#d23f4d', // Error messages
      },
    },
    onValidate: async (file: File): Promise<undefined | string> => {
      return docsList.length > 3
        ? `You've reached your limit for PDFs.`
        : undefined;
    },
  };

  const UploadDropZone = () => (
    <UploadDropzone
      uploader={uploader}
      options={options}
      onUpdate={(file) => {
        if (file.length !== 0) {
          setLoading(true);
          ingestPdf(
            file[0].fileUrl,
            file[0].originalFile.originalFileName || file[0].filePath,
          );
        }
      }}
      width="470px"
      height="250px"
    />
  );

  async function ingestPdf(fileUrl: string, fileName: string) {
    let res = await fetch('/api/ingestPdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileUrl,
        fileName,
      }),
    });

    let data = await res.json();
    router.push(`/document/${data.id}`);
  }

  async function deleteDocument(id: string, fileUrl: string) {
    try {
      const res = await fetch('/api/deleteDocument', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          fileUrl,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to delete document');
      }

      const data = await res.json();
      if (data.error) {
        console.log(data.error);
      } else {
        console.log('Document deleted successfully');
        updateDocsList(docsList.filter((doc) => doc.id !== id));
      }
    } catch (error) {
      console.log('Error deleting document', error);
    }
  }

  return (
    <div className="mx-auto flex flex-col gap-4 container mt-10">
      <h1 className="text-4xl leading-[1.1] tracking-tighter font-medium text-center">
        Chat With Your PDFs
      </h1>
      {docsList.length > 0 && (
        <div className="flex flex-col gap-4 mx-10 my-5">
          <div className="flex flex-col shadow-sm border divide-y-2 sm:min-w-[650px] mx-auto">
            {docsList.map((doc: any) => (
              <div
                key={doc.id}
                className="flex justify-between p-3 items-center hover:bg-gray-100 transition sm:flex-row flex-col sm:gap-0 gap-3"
              >
                <button
                  onClick={() => router.push(`/document/${doc.id}`)}
                  className="flex gap-4"
                >
                  <DocIcon />
                  <span>{doc.fileName}</span>
                </button>
                <span className="flex items-center gap-3">
                  {formatDistanceToNow(doc.createdAt)} ago
                  <TrashIcon
                    onClick={() => deleteDocument(doc.id, doc.fileUrl)}
                  />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {docsList.length > 0 ? (
        <h2 className="text-3xl leading-[1.1] tracking-tighter font-medium text-center">
          Or upload a new PDF
        </h2>
      ) : (
        <h2 className="text-3xl leading-[1.1] tracking-tighter font-medium text-center mt-5">
          No PDFs found. Upload a new PDF below!
        </h2>
      )}
      <div className="mx-auto min-w-[450px] flex justify-center">
        {loading ? (
          <button
            type="button"
            className="inline-flex items-center mt-4 px-4 py-2 font-semibold leading-6 text-lg shadow rounded-md text-black transition ease-in-out duration-150 cursor-not-allowed"
          >
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Ingesting your PDF...
          </button>
        ) : (
          <UploadDropZone />
        )}
      </div>
    </div>
  );
}
