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
import { useRouter } from 'next/navigation';

const formSchema = z.object({
    theme: z.string().optional(),
    background: z.string().optional(),
    sprite: z.string().optional(),
});

export default function OutputPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const levelLayout = searchParams.get('levelLayout') || '';
    const themeSuggestionsString = searchParams.get('themeSuggestions') || '[]';
    const themeSuggestions = JSON.parse(themeSuggestionsString) as string[];
    const backgroundImageURL = searchParams.get('backgroundImageURL') || '';
    const spriteImageURL = searchParams.get('spriteImageURL') || '';
    const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
    const [selectedBackground, setSelectedBackground] = useState<string | null>(null);
    const [selectedSprite, setSelectedSprite] = useState<string | null>(null);
    const { toast } = useToast();
    const [generatedLevelURL, setGeneratedLevelURL] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const codeLanguage = searchParams.get('codeLanguage') || 'JSON';
    const [formValues, setFormValues] = useState<z.infer<typeof formSchema>>({});

    // Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
         theme: themeSuggestions[0] || '', // Default to the first theme suggestion if available
         background: backgroundImageURL,
         sprite: spriteImageURL,
        },
    });

    useEffect(() => {
      // Set the selected theme based on the form value
      setSelectedTheme(form.watch('theme') || null);
      setSelectedBackground(form.watch('background') || null);
      setSelectedSprite(form.watch('sprite') || null);
    }, [form.watch('theme'), form.watch('background'), form.watch('sprite')]);

    const handleApplyAndDownload = () => {
      form.handleSubmit(onSubmit)();
    };

    function onSubmit(values: z.infer<typeof formSchema>) {
        setFormValues(values);

        setSelectedTheme(values.theme || null);
        setSelectedBackground(values.background || null);
        setSelectedSprite(values.sprite || null);
        handleDownloadLevel(values);
    }

    const handleDownloadLevel = async (values: z.infer<typeof formSchema>) => {
         setLoading(true);
         try {
             const files = [
                 { name: 'level.json', content: levelLayout },
                 { name: 'theme.txt', content: selectedTheme || 'default' },
                 { name: 'background.txt', content: selectedBackground || 'default_background' },
                 { name: 'sprite.txt', content: selectedSprite || 'default_sprite' },
             ];

             // Create a zip file containing the level files
             const zipFileName = 'level_pack.zip';
             const zip = new JSZip();
             files.forEach(file => {
                 zip.file(file.name, file.content);
             });

             const content = await zip.generateAsync({ type: 'blob' });
             const url = URL.createObjectURL(content);

             const link = document.createElement('a');
             link.href = url;
             link.download = zipFileName;
             document.body.appendChild(link);
             link.click();
             document.body.removeChild(link);

             setGeneratedLevelURL(url);
             toast({
                 title: 'Level Download Started',
                 description: 'Your level is now being downloaded as a zip file.',
             });
              router.push('/');
         } catch (error: any) {
             console.error('Error creating and downloading zip file:', error);
             toast({
                 variant: 'destructive',
                 title: 'Download Failed',
                 description: error.message || 'Failed to create the level zip file.',
             });
         } finally {
             setLoading(false);
         }
     };

    return (
        <div className="flex flex-col items-center justify-start min-h-screen p-4">
            <Card className="w-full max-w-4xl">
                <CardHeader>
                    <CardTitle>Generated Level</CardTitle>
                    <CardDescription>Customize your level and download the files.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col space-y-4">
                    {levelLayout ? (
                        <>
                            {/* Theme Selection */}
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="theme"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                                                    {themeSuggestions.map((theme) => (
                                                        <FormItem key={theme} className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value={theme} id={theme} className='bg-teal-500' />
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

                            {generatedLevelURL && (
                                <Alert>
                                    <AlertTitle>Level Ready!</AlertTitle>
                                    <AlertDescription>
                                        Your level is ready. <a href={generatedLevelURL} download="level.zip" className="underline">Download it here</a>.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </>
                    ) : (
                        <Alert variant="destructive">
                            <AlertTitle>No Level Generated</AlertTitle>
                            <AlertDescription>
                                Please generate a level layout first.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
 );
}
