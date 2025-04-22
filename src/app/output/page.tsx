"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { codeLanguageOptions } from '@/lib/utils'; // Import the options
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function OutputPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const levelLayout = searchParams.get('levelLayout') || '';
    const selectedLanguage = searchParams.get('selectedLanguage') || 'python';
    const { toast } = useToast();

    const [downloading, setDownloading] = useState(false);

    const handleDownloadLevel = async () => {
        setDownloading(true);
        try {
            if (levelLayout) {
                const filename = `level.${codeLanguageOptions.find(lang => lang.value === selectedLanguage)?.extension || 'txt'}`;
                const blob = new Blob([levelLayout], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                toast({
                    title: 'Level Download Started',
                    description: `Your level is now being downloaded as ${filename}`,
                });
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Download Failed',
                description: 'There was an error downloading the level.',
            });
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-3xl font-bold mb-4">Generated Level Code</h1>
            {levelLayout ? (
                <>
                    <pre className="mb-4 p-4 rounded-md bg-white text-black overflow-auto">
                        <code>{levelLayout}</code>
                    </pre>
                    <Button onClick={handleDownloadLevel} disabled={downloading}>
                        {downloading ? 'Downloading...' : 'Download Level Code'}
                    </Button>
                </>
            ) : (
                <Alert variant="destructive">
                    <AlertTitle>No Level Code Generated</AlertTitle>
                    <AlertDescription>
                        Please return to the homepage to generate a level.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
