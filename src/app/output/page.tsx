"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { codeLanguageOptions } from '@/lib/utils'; // Import the options
import { useRouter } from 'next/navigation';

export default function OutputPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const levelLayout = searchParams.get('levelLayout') || '';
    console.log("Level layout", levelLayout)

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-3xl font-bold mb-4">Generated Level Code</h1>
            <div className="bg-white rounded-lg shadow-md p-6">
                <pre className="bg-gray-100 rounded-md p-4 overflow-auto">
                    <code className="text-sm text-black">{levelLayout}</code>
                </pre>
            </div>
            <Button className="mt-4" onClick={() => {
              const filename = `level.txt`;
              const blob = new Blob([levelLayout || ''], { type: 'text/plain;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = filename;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              }}>Download Level</Button>
        </div>
    );
}
