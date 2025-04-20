'use client';

import {useState, useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {useToast} from '@/hooks/use-toast';
import {generateLevelFromImage} from '@/ai/flows/generate-level-from-image';
import {useRouter} from 'next/navigation';
import JSZip from 'jszip';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";

const formSchema = z.object({
  theme: z.string().optional(),
  levelDescription: z.string().optional(),
})

export default function Home() {
  const [imageURL, setImageURL] = useState('');
  const [gameFolder, setGameFolder] = useState('');
  const [themes, setThemes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const {toast} = useToast();
  const router = useRouter();
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [codeLanguage, setCodeLanguage] = useState('JSON');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      theme: '',
      levelDescription: '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: 'You submitted the following values:',
      description: JSON.stringify(values, null, 2),
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageURL(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateLevel = async () => {
    if (!imageURL) {
      toast({
        title: 'Error',
        description: 'Please upload an image first.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await generateLevelFromImage({
        imageURL,
        gameFolder,
        levelDescription: form.getValues().levelDescription,
      });

      const levelLayout = result.levelLayout ?? '';
      const themeSuggestions = result.themeSuggestions ?? [];
      const spriteSuggestions = result.spriteSuggestions ?? [];
      const backgroundImageURL = result.backgroundImageURL ?? '';

      // Encode data safely to avoid "undefined" or invalid JSON parse errors
      const queryParams = new URLSearchParams({
        levelLayout: encodeURIComponent(levelLayout),
        themeSuggestions: encodeURIComponent(JSON.stringify(themeSuggestions)),
        spriteSuggestions: encodeURIComponent(JSON.stringify(spriteSuggestions)),
        codeLanguage: encodeURIComponent(codeLanguage),
        backgroundImageURL: encodeURIComponent(backgroundImageURL),
      });

      router.push(`/output?${queryParams.toString()}`);

      toast({
        title: 'Level Layout Generated!',
        description: 'A level layout has been generated successfully. Now, choose a theme and click "Download Level" to get your level file.',
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
      <h1 className="text-3xl font-bold mb-4">LevelUp AI</h1>
      <div className="flex w-full max-w-4xl space-x-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Image Upload</CardTitle>
            <CardDescription>Upload an image to generate a game level layout.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <Label htmlFor="image-upload">Upload Image:</Label>
            <Input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} />
            {imageURL ? (
              <img src={imageURL} alt="Uploaded" className="max-h-64 object-contain rounded-md" />
            ) : (
              <div className="max-h-64 flex items-center justify-center rounded-md border-2 border-dashed border-gray-400 bg-gray-100">
                <span className="text-gray-500">Upload an image or sketch here</span>
              </div>
            )}
            <Label htmlFor="level-description">Describe more about Level (optional):</Label>
            <Textarea
              id="level-description"
              placeholder="Describe any specific requirements or ideas for the level"
              {...form.register('levelDescription')}
            />
            <Label htmlFor="game-folder">Game Folder (optional):</Label>
            <Input
              id="game-folder"
              type="text"
              placeholder="Path to game folder"
              value={gameFolder}
              onChange={(e) => setGameFolder(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Providing your game folder path allows the AI to:
            </p>
            <ul>
              <li>Tailor the level creation based on existing game variables, functions, language, and engine.</li>
            </ul>
            <div className="text-sm text-muted-foreground">
              If you want the AI to consider specific changes to the level structure or content
              based on your existing game's parameters, detail these requirements in a separate document within your game folder.
            </div>

            <Label>Code Language:</Label>
            <Select onValueChange={setCodeLanguage} defaultValue={codeLanguage}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="JSON">JSON</SelectItem>
                <SelectItem value="Lua">Lua</SelectItem>
                <SelectItem value="GDScript">GDScript</SelectItem>
                <SelectItem value="C#">C#</SelectItem>
                <SelectItem value="Python">Python</SelectItem>
                <SelectItem value="C++">C++</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleGenerateLevel} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Level Layout'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
