'use client';

import { UploadDropzone } from 'react-uploader';
import { Uploader } from 'uploader';
import { useRouter } from 'next/navigation';
import DocIcon from '@/components/ui/DocIcon';
import { formatDistanceToNow } from 'date-fns';

// Configuration for the uploader
const uploader = Uploader({
    apiKey: !!process.env.NEXT_PUBLIC_BYTESCALE_API_KEY
        ? process.env.NEXT_PUBLIC_BYTESCALE_API_KEY
        : 'free',
});

export default function DashboardClient({
    docsList,
}: {
    docsList: any;
}) {
    const router = useRouter();

    const options = {
        maxFileCount: 1,
        mimeTypes: ['application/pdf'],
        editor: { images: { crop: false } },
        styles: {
            colors: {
                primary: '#000', // Primary buttons & links
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

    return (
        <div className="mx-auto flex flex-col gap-4 container mt-10">
            <h1 className="text-4xl leading-[1.1] tracking-tighter font-medium text-center">
                Chat With Your Docs
            </h1>
            {docsList.length > 0 && (
                <div className="flex flex-col gap-4 mx-10 my-5">
                    <div className="flex flex-col shadow-sm border divide-y-2 sm:min-w-[650px] mx-auto">
                        {docsList.map((doc: any) => (
                            <div
                                key={doc.id}
                                className="flex justify-between p-3 hover:bg-gray-100 transition sm:flex-row flex-col sm:gap-0 gap-3"
                            >
                                <button
                                    onClick={() => router.push(`/document/${doc.id}`)}
                                    className="flex gap-4"
                                >
                                    <DocIcon />
                                    <span>{doc.fileName}</span>
                                </button>
                                <span>{formatDistanceToNow(doc.createdAt)} ago</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <h2 className="text-3xl leading-[1.1] tracking-tighter font-medium text-center">
                Or upload a new PDF
            </h2>
            <div className="mx-auto min-w-[450px]">
                <UploadDropZone />
            </div>
        </div>
    );
}
