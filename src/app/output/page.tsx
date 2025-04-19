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

    const handleDownloadLevel = async () => {
        setLoading(true);
        try {
            const files = [
                { name: 'level_layout.json', content: levelLayout },
            ];

            // Create a zip file containing the level files
            const zipFileName = 'level_pack.zip';
            const zip = new JSZip();
            files.forEach(file => {
                zip.file(file.name, file.content);
            });

            const content = await zip.generateAsync({ type: 'blob' });

            // Create a download link
            const url = URL.createObjectURL(content);
            setGeneratedLevelURL(url);

            // Programmatically trigger the download
            const a = document.createElement('a');
            a.href = url;
            a.download = zipFileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            toast({
                title: 'Level Download Started',
                description: 'Your level is now being downloaded as a zip file.',
            });
        } catch (error: any) {
            console.error('Error creating and downloading zip file:', error);
            toast({
                title: 'Download Error',
                description: error.message || 'Failed to create or download the level zip file.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

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

    function onSubmit(values: z.infer<typeof formSchema>) {
        setSelectedTheme(values.theme || null);


        toast({

            title: 'You submitted the following values:',
            description: JSON.stringify(values, null, 2),
        });
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-3xl font-bold mb-4">Level Output</h1>
            <div className="flex w-full max-w-4xl space-x-4">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Level Configuration</CardTitle>
                        <CardDescription>Customize your level with different themes and options.</CardDescription>
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
                                            render={({ field, formState }) => (
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


                                <Label>Select a Background:</Label>
                                 <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                                        <FormField
                                            control={form.control}
                                            name="background"
                                            render={({ field, formState }) => (
                                                <FormItem className="space-y-3">
                                                    <div>
                                                    <img src={backgroundImageURL} alt="Background Suggestion" className="max-w-full h-auto rounded-md"/>
                                                    </div>
                                                     <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">

                                                        <FormItem key={"background"} className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value={backgroundImageURL} id={"background"} />
                                                            </FormControl>
                                                            <FormLabel htmlFor={"background"}>{"backgroundImageURL"}</FormLabel>
                                                        </FormItem>


                                                    </RadioGroup>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </form>
                                </Form>

                                <Label>Select a Sprite:</Label>
                                 <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                                        <FormField
                                            control={form.control}
                                            name="sprite"
                                            render={({ field, formState }) => (
                                                <FormItem className="space-y-3">
                                                    <div>
                                                    <img src={spriteImageURL} alt="Sprite Suggestion" className="max-w-full h-auto rounded-md"/>
                                                    </div>
                                                     <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">

                                                        <FormItem key={"sprite"} className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value={spriteImageURL} id={"sprite"} />
                                                            </FormControl>
                                                            <FormLabel htmlFor={"sprite"}>{"spriteImageURL"}</FormLabel>
                                                        </FormItem>


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
                                <AlertTitle>No Themes Available</AlertTitle>
                                <AlertDescription>
                                    No themes were suggested for this image. Please try another image.
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
 );
}

