"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { codeLanguageOptions, codeLanguageExtensions } from '@/lib/utils'; // Import the options
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { saveAs } from 'file-saver';
import { useRouter } from 'next/navigation';


export default function OutputPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const levelLayout = searchParams.get('levelLayout') || '';
    const codeLanguage = searchParams.get('codeLanguage') || 'python';

    const handleDownloadLevel = () => {
        if (!levelLayout) {
            alert('No level layout to download!');
            return;
        }

        const fileExtension = codeLanguageExtensions[codeLanguage] || 'txt';
        const filename = `level.${fileExtension}`;

        const blob = new Blob([levelLayout], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Show toast notification
        alert('Level Downloaded!');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 dark:bg-gray-900 dark:text-slate-200">
            <h1 className="text-3xl font-bold mb-4">Generated Level Code</h1>
            <Card className="w-full max-w-4xl dark:bg-gray-800 dark:text-slate-200 dark:border-cyan-400 dark:focus-visible:ring-cyan-400">
                <CardHeader>
                    <CardTitle>Level Code</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[400px] w-full rounded-md">
                        <pre className="bg-gray-700 text-white rounded-md p-4 overflow-auto">
                            <code className="text-sm">{levelLayout}</code>
                        </pre>
                    </ScrollArea>
                </CardContent>
            </Card>
            <Button className="mt-4 bg-cyan-500 text-white hover:bg-cyan-600" onClick={handleDownloadLevel} >Download Level</Button>
        </div>
    );
}
