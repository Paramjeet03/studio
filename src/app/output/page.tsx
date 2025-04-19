'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { useToast } from '@/hooks/use-toast';
import { Form, FormField, FormItem, FormLabel, FormMessage, FormControl } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
    theme: z.string().optional(),
});

export default function OutputPage() {
    const searchParams = useSearchParams();
    const levelLayout = searchParams.get('levelLayout') || '';
    const themeSuggestionsString = searchParams.get('themeSuggestions') || '[]';
    const themeSuggestions = JSON.parse(themeSuggestionsString) as string[];
    const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
    const { toast } = useToast();
    const [generatedLevelURL, setGeneratedLevelURL] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const codeLanguage = searchParams.get('codeLanguage') || 'JSON';

    // Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            theme: '',
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        toast({
            title: 'You submitted the following values:',
            description: JSON.stringify(values, null, 2),
        });
    }

    useEffect(() => {
        console.log('Level Layout:', levelLayout);
        console.log('Theme Suggestions:', themeSuggestions);
        console.log('Code Language:', codeLanguage);
    }, [levelLayout, themeSuggestions, codeLanguage]);

    const handleDownloadLevel = async () => {
        if (!levelLayout) {
            toast({
                title: 'Error',
                description: 'No level layout generated. Generate a level first.',
                variant: 'destructive',
            });
            return;
        }

        if (!selectedTheme) {
            toast({
                title: 'Error',
                description: 'Please select a theme before downloading the level.',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);
        try {
            // Determine file extension based on code language
            let fileExtension = 'json';
            if (codeLanguage === 'Lua') {
                fileExtension = 'lua';
            } else if (codeLanguage === 'GDScript') {
                fileExtension = 'gd';
            }

            // Create a folder with the level file
            const zip = new JSZip();
            zip.file(`level.${fileExtension}`, levelLayout); // level.json is your generated level data

            // Generate the zip file as a blob
            zip.generateAsync({ type: "blob" })
                .then(function (content) {
                    // Create a URL for the blob
                    const url = URL.createObjectURL(content);

                    // Set the URL for the download link
                    setGeneratedLevelURL(url);

                    // Programmatically trigger the download
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'level_pack.zip'; // Name the downloaded zip file
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    // Revoke the URL
                    URL.revokeObjectURL(url);
                    toast({
                        title: 'Level Download Ready!',
                        description: 'Your level file is ready to download.',
                    });
                });
        } catch (error: any) {
            console.error('Error generating level:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to generate level.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-3xl font-bold mb-4">Level Output</h1>
            <div className="flex w-full max-w-4xl space-x-4">
                <Card className="w-1/2">
                    <CardHeader>
                        <CardTitle>Level Layout</CardTitle>
                        <CardDescription>Here is the generated level layout.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col space-y-4">
                        {levelLayout ? (
                            <pre className="whitespace-pre-wrap">{levelLayout}</pre>
                        ) : (
                            <Alert variant="destructive">
                                <AlertTitle>No Level Generated</AlertTitle>
                                <AlertDescription>Please generate a level layout first.</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                <Card className="w-1/2">
                    <CardHeader>
                        <CardTitle>Theme Selection</CardTitle>
                        <CardDescription>Select a theme for your level.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col space-y-4">
                        {themeSuggestions.length > 0 ? (
                            <>
                                <Label>Select a Theme:</Label>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                                        <FormField
                                            control={form.control}
                                            name="theme"
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                                                        {themeSuggestions.map((theme) => (
                                                            <FormItem key={theme} className="flex items-center space-x-3 space-y-0">
                                                                <FormControl>
                                                                    <RadioGroupItem value={theme} id={theme} />
                                                                </FormControl>
                                                                <FormLabel htmlFor={theme}>{theme}</FormLabel>
                                                            </FormItem>
                                                        ))}
                                                    </RadioGroup>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </form>
                                </Form>
                                <Button onClick={handleDownloadLevel} disabled={!levelLayout || loading}>
                                    {loading ? 'Downloading...' : 'Download Level'}
                                </Button>
                            </>
                        ) : (
                            <Alert variant="destructive">
                                <AlertTitle>No Themes Suggested</AlertTitle>
                                <AlertDescription>No themes were suggested. Please try generating the level again.</AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
