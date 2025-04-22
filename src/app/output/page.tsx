"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { codeLanguageOptions } from '@/lib/utils'; // Import the options
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { saveAs } from 'file-saver';

export default function OutputPage() {
    const searchParams = useSearchParams();
    const levelLayout = searchParams.get('levelLayout') || '';
    const codeLanguage = searchParams.get('codeLanguage') || 'python';
    const { toast } = useToast();

    const [downloading, setDownloading] = useState(false);

    const handleDownloadLevel = () => {
        setDownloading(true);
        try {
            if (levelLayout) {
                const filename = `level.${codeLanguageOptions.find(lang => lang.value === codeLanguage)?.extension || 'txt'}`;
                const blob = new Blob([levelLayout], { type: 'text/plain;charset=utf-8' });
                saveAs(blob, filename);
                toast({
                    title: 'Level Download Started',
                    description: `Your level is now being downloaded as ${filename}`,
                });
            } else {
                toast({
                    variant: 'destructive',
                    title: 'No Level Code',
                    description: 'No level code available to download.',
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
        <div className="flex flex-col items-center justify-center min-h-screen p-4 dark:bg-gray-900 dark:text-slate-200">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 text-center">Generated Level Code</h1>
                <p className="text-sm text-muted-foreground text-center">
                    Here is your generated level code. Download it to use in your game.
                </p>
            </div>

            {levelLayout ? (
                <div className="w-full max-w-4xl">
                    <pre className="mb-4 p-4 rounded-md bg-gray-800 text-white overflow-auto">
                        <code className="text-sm">{levelLayout}</code>
                    </pre>
                    <Button onClick={handleDownloadLevel} disabled={downloading} className="w-full">
                        {downloading ? 'Downloading...' : 'Download Level Code'}
                    </Button>
                </div>
            ) : (
                <Alert variant="destructive" className="w-full max-w-md">
                    <AlertTitle>No Level Code Generated</AlertTitle>
                    <AlertDescription>
                        Please return to the homepage to generate a level.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
