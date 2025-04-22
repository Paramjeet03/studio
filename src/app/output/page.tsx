'use client';

import {useSearchParams} from 'next/navigation';
import {useEffect, useState} from 'react';
import {useToast} from '@/hooks/use-toast';
import {Button} from "@/components/ui/button";

const codeLanguageExtensions: { [key: string]: string } = {
    python: 'py',
    lua: 'lua',
    gdscript: 'gd',
    csharp: 'cs',
    json: 'json',
};

export default function OutputPage() {
    const searchParams = useSearchParams();
    const levelLayout = searchParams.get('levelLayout') || '';
    const codeLanguage = searchParams.get('codeLanguage') || 'txt'; // Default to txt if not provided
    const [downloadURL, setDownloadURL] = useState<string | null>(null);

    useEffect(() => {
        if (levelLayout) {
            const blob = new Blob([levelLayout], {type: 'text/plain'});
            const url = URL.createObjectURL(blob);
            setDownloadURL(url);
        } else {
            setDownloadURL(null);
        }
        // Cleanup when component unmounts or levelLayout changes
        return () => {
            if (downloadURL) {
                URL.revokeObjectURL(downloadURL);
            }
        };
    }, [levelLayout, codeLanguage]);

    const getFilename = () => {
        const extension = codeLanguageExtensions[codeLanguage] || 'txt';
        return `level.${extension}`;
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-3xl font-bold mb-4">Generated Level Code</h1>

            {levelLayout ? (
                <>
                    <pre className="mb-4 p-4 rounded-md bg-gray-100 dark:bg-gray-800 overflow-auto">
                        <code>{levelLayout}</code>
                    </pre>
                    {downloadURL && (
                        <a
                            href={downloadURL}
                            download={getFilename()}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Download Level Code
                        </a>
                    )}
                </>
            ) : (
                <p>No level code generated. Please return to the homepage to generate a level.</p>
            )}
        </div>
    );
}
