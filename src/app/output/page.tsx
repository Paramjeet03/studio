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
+   const spriteSuggestionsString = searchParams.get('spriteSuggestions') || '[]';
+   const spriteSuggestions = JSON.parse(spriteSuggestionsString) as string[];
    const backgroundImageURL = searchParams.get('backgroundImageURL') || '';
    const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
    const [selectedBackground, setSelectedBackground] = useState<string | null>(null);
-    const [selectedSprite, setSelectedSprite] = useState<string | null>(null);
    const { toast } = useToast();
     const [generatedLevelURL, setGeneratedLevelURL] = useState<string | null>(null);
     const [loading, setLoading] = useState(false);
@@ -45,14 +47,12 @@
     const form = useForm<z.infer<typeof formSchema>>({
         resolver: zodResolver(formSchema),
         defaultValues: {
-         theme: themeSuggestions[0] || '', // Default to the first theme suggestion if available
+            theme: themeSuggestions[0] || '', // Default to the first theme suggestion if available
          background: backgroundImageURL,
-         sprite: spriteImageURL,
         },
     });
 
     useEffect(() => {
-      // Set the selected theme based on the form value
       setSelectedTheme(form.watch('theme') || null);
       setSelectedBackground(form.watch('background') || null);
       setSelectedSprite(form.watch('sprite') || null);
@@ -77,7 +77,7 @@
                  { name: 'level.json', content: levelLayout },
                  { name: 'theme.txt', content: selectedTheme || 'default' },
                  { name: 'background.txt', content: selectedBackground || 'default_background' },
-                 { name: 'sprite.txt', content: selectedSprite || 'default_sprite' },
+                 { name: 'sprites.txt', content: spriteSuggestions.join('\n') || 'no_sprites' }, // List of sprites
              ];
 
              // Create a zip file containing the level files
@@ -176,5 +176,4 @@
             </Card>
         </div>
  );
-}
\ No newline at end of file
+}
