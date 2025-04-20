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
});

export default function OutputPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const levelLayout = searchParams.get('levelLayout') || '';
    const themeSuggestionsString = searchParams.get('themeSuggestions') || '[]';
    const themeSuggestions = JSON.parse(themeSuggestionsString) as string[];
    const spriteSuggestionsString = searchParams.get('spriteSuggestions') ?? '[]';
    const spriteSuggestions = JSON.parse(spriteSuggestionsString || '[]') as string[];
    const backgroundImageURL = searchParams.get('backgroundImageURL') || '';
    const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
    const [selectedBackground, setSelectedBackground] = useState<string | null>(null);
    const { toast } = useToast();
     const [generatedLevelURL, setGeneratedLevelURL] = useState<string | null>(null);
     const [loading, setLoading] = useState(false);

     const [spriteImageURL, setSpriteImageURL] = useState<string | null>(null);

     // Define your form.
     const form = useForm<z.infer<typeof formSchema>>({
         resolver: zodResolver(formSchema),
         defaultValues: {
             theme: themeSuggestions[0] || '',
          background: backgroundImageURL,
         },
     });

     useEffect(() => {
      // Set the selected theme based on the form value
      setSelectedTheme(form.watch('theme') || null);
      setSelectedBackground(form.watch('background') || null);
    }, [form.watch('theme'), form.watch('background')]);

     function onSubmit(values: z.infer<typeof formSchema>) {
         toast({
             title: 'You submitted the following values:',
             description: JSON.stringify(values, null, 2),
         });
     }
 
     const handleDownloadLevel = async () => {
         setLoading(true);
 
         try {
              const files = [
                  { name: 'level.json', content: levelLayout },
                  { name: 'theme.txt', content: selectedTheme || 'default' },
                  { name: 'background.txt', content: selectedBackground || 'default_background' },
                  { name: 'sprites.txt', content: spriteSuggestions.join('\n') || 'no_sprites' }, // List of sprites
              ];
 
              // Create a zip file containing the level files
              const zipFileName = 'level_pack.zip';
              const zip = new JSZip();
              files.forEach(file => {
                  zip.file(file.name, file.content);
              });
 
              // Generate the zip file as a blob
              const blob = await zip.generateAsync({ type: "blob" });
 
              // Create a download link for the zip file
              const url = URL.createObjectURL(blob);
              setGeneratedLevelURL(url);
 
              // Programmatically trigger the download
              const a = document.createElement('a');
              a.href = url;
              a.download = zipFileName;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
 
              URL.revokeObjectURL(url);
 
              toast({
                  title: 'Level Download Started',
                  description: 'Your level is now being downloaded as a zip file.',
              });
         } catch (error: any) {
              console.error('Error generating or downloading level:', error);
              toast({
                  title: 'Download Error',
                  description: error.message || 'Failed to generate the level file.',
                  variant: 'destructive',
              });
         } finally {
              setLoading(false);
         }
     };
 

  return (
         <div className="flex flex-col items-center justify-center min-h-screen p-4">
              <h1 className="text-3xl font-bold mb-4">Level Export</h1>
              <Card className="w-full max-w-4xl">
                   <CardHeader>
                        <CardTitle>Customize and Download Your Level</CardTitle>
                        <CardDescription>
                             Review the generated level and select your preferred theme before downloading.
                        </CardDescription>
                   </CardHeader>
                   <CardContent className="grid gap-4">
 
                        <div className="border p-4 rounded-md">
                             <h3 className="text-xl font-semibold mb-2">Theme Selection</h3>
                             <p>Choose a theme to customize your level:</p>
                                 <Form {...form}>
                                     <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                         <FormField
                                             control={form.control}
                                             name="theme"
                                             render={({ field }) => (
                                                 <FormItem className="space-y-3">
                                                     <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                                                         {themeSuggestions.map((theme) => (
                                                             <FormItem key={theme} className="flex items-center space-x-3 space-y-0">
                                                                 <FormControl>
                                                                     <RadioGroupItem value={theme} id={theme} className="bg-primary text-primary-foreground" />
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

                         </div>

                    </CardContent>
               </Card>
          </div>
   );
}

