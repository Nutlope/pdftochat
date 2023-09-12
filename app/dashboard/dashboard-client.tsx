'use client';

import { UploadDropzone } from 'react-uploader';
import { Uploader } from 'uploader';
import { useRouter } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { Document } from '@prisma/client';

// Configuration for the uploader
const uploader = Uploader({
  apiKey: !!process.env.NEXT_PUBLIC_UPLOAD_API_KEY
    ? process.env.NEXT_PUBLIC_UPLOAD_API_KEY
    : 'free',
});

const options = {
  maxFileCount: 1,
  mimeTypes: ['application/pdf'],
  editor: { images: { crop: false } },
  styles: {
    colors: {
      primary: '#2563EB', // Primary buttons & links
      error: '#d23f4d', // Error messages
      // shade100: '#fff', // Standard text
      // shade200: '#fffe', // Secondary button text
      // shade300: '#fffd', // Secondary button text (hover)
      // shade400: '#fffc', // Welcome text
      // shade500: '#fff9', // Modal close button
      // shade600: '#fff7', // Border
      // shade700: '#fff2', // Progress indicator background
      // shade800: '#fff1', // File item background
      // shade900: '#ffff', // Various (draggable crop buttons, etc.)
    },
  },
};

export default function DashboardClient({
  docsList,
}: {
  docsList: Document[];
}) {
  const router = useRouter();

  const UploadDropZone = () => (
    <UploadDropzone
      uploader={uploader}
      options={options}
      onUpdate={(file) => {
        if (file.length !== 0) {
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
    let res = await fetch('/ingestPdf', {
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
    localStorage.setItem('pdfUrl', fileUrl);
    router.push(`/document/${data.id}`);
  }

  return (
    <div className="mx-auto flex flex-col gap-4">
      <div>
        <UserButton afterSignOutUrl="/" />
      </div>
      <h1 className="text-2xl font-bold leading-[1.1] tracking-tighter text-center">
        Chat With Your Docs
      </h1>
      <UploadDropZone />
      {docsList.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold leading-[1.1] tracking-tighter text-center">
            Your Docs
          </h2>
          <div className="flex flex-col gap-4">
            {docsList.map((doc) => (
              <div key={doc.id} className="flex flex-col gap-4">
                <button
                  onClick={() => router.push(`/document/${doc.id}`)}
                  className="flex flex-col gap-4"
                >
                  {doc.fileName}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
