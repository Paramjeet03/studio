"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { saveAs } from 'file-saver';
import { codeLanguageOptions } from '@/lib/utils'; // Import the options
import { useRouter } from 'next/navigation';


export default function OutputPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const levelLayout = searchParams.get('levelLayout') || '';
    const codeLanguage = searchParams.get('codeLanguage') || 'txt';

    const codeLanguageExtensions: { [key: string]: string } = {
        python: 'py',
        lua: 'lua',
        gdscript: 'gd',
        csharp: 'cs',
        cpp: 'cpp',
        json: 'json',
    };


    const handleDownloadLevel = () => {
        if (levelLayout) {
            const blob = new Blob([levelLayout], { type: 'text/plain;charset=utf-8' });
            saveAs(blob, `level.${codeLanguageExtensions[codeLanguage] || 'txt'}`);
            toast({
                title: 'Level Download Started',
                description: 'Your level is now being downloaded.',
            });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-3xl font-bold mb-4">Generated Level Code</h1>
            {levelLayout ? (
                <>
                    <pre className="mb-4 p-4 rounded-md bg-gray-100 dark:bg-gray-800 overflow-auto">
                        <code>{levelLayout}</code>
                    </pre>
                    <Button onClick={handleDownloadLevel} >
                        Download Level Code
                    </Button>
                </>
            ) : (
                <p>No level code generated. Please return to the homepage to generate a level.</p>
            )}
        </div>
    );
}

