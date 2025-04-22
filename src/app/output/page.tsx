"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { codeLanguageOptions } from '@/lib/utils'; // Import the options
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function OutputPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const levelLayout = searchParams.get('levelLayout') || '';

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
            <h1 className="text-3xl font-bold mb-4">Generated Level Code</h1>
            <Card className="w-full max-w-4xl bg-gray-800 rounded-lg shadow-md">
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
            <Button className="mt-4 bg-cyan-500 text-white hover:bg-cyan-600" onClick={() => {
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
