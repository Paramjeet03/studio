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
+        resolver: zodResolver(formSchema),
+        defaultValues: {
+         theme: themeSuggestions[0] || '', // Default to the first theme suggestion if available
+         background: backgroundImageURL,
+         sprite: spriteImageURL,
+        },
+    });
+
+    useEffect(() => {
+      // Set the selected theme based on the form value
+      setSelectedTheme(form.watch('theme') || null);
+      setSelectedBackground(form.watch('background') || null);
+      setSelectedSprite(form.watch('sprite') || null);
+    }, [form.watch('theme'), form.watch('background'), form.watch('sprite')]);
+
+    const handleApplyAndDownload = () => {
+      form.handleSubmit(onSubmit)();
+    };
+
+    function onSubmit(values: z.infer<typeof formSchema>) {
+        setFormValues(values);
+
+        setSelectedTheme(values.theme || null);
+        setSelectedBackground(values.background || null);
+        setSelectedSprite(values.sprite || null);
+        handleDownloadLevel(values);
+    }
+
+    const handleDownloadLevel = async (values: z.infer<typeof formSchema>) => {
         setLoading(true);
         try {
             const files = [
@@ -54,6 +64,7 @@
                 title: 'Level Download Started',
                 description: 'Your level is now being downloaded as a zip file.',
             });
+              router.push('/');
         } catch (error: any) {
             console.error('Error creating and downloading zip file:', error);
             toast({
@@ -65,29 +76,6 @@
         }
     };
 
-    // Define your form.
-    const form = useForm<z.infer<typeof formSchema>>({
-        resolver: zodResolver(formSchema),
-        defaultValues: {
-         theme: themeSuggestions[0] || '', // Default to the first theme suggestion if available
-         background: backgroundImageURL,
-         sprite: spriteImageURL,
-        },
-    });
-
-    useEffect(() => {
-      // Set the selected theme based on the form value
-      setSelectedTheme(form.watch('theme') || null);
-      setSelectedBackground(form.watch('background') || null);
-      setSelectedSprite(form.watch('sprite') || null);
-    }, [form.watch('theme'), form.watch('background'), form.watch('sprite')]);
-
-    function onSubmit(values: z.infer<typeof formSchema>) {
-        setSelectedTheme(values.theme || null);
-
-
-        toast({
-
-            title: 'You submitted the following values:',
-            description: JSON.stringify(values, null, 2),
-        });
-    }
 
     return (
         <div className="flex flex-col items-center justify-center min-h-screen p-4">
@@ -177,11 +165,9 @@
 
 
 
-                                <Button onClick={handleDownloadLevel} disabled={!levelLayout || loading}>
-                                    {loading ? 'Downloading...' : 'Download Level'}
+                                <Button onClick={handleApplyAndDownload} disabled={!levelLayout || loading}>
+                                    {loading ? 'Applying...' : 'Apply'}
                                 </Button>
-
                             </>
                         ) : (
                             <Alert variant="destructive">
@@ -198,4 +184,4 @@
         </div>
  );
 }
-
+''
