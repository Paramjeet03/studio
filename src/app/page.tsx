'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { generateLevelFromImage } from '@/ai/flows/generate-level-from-image';

const formSchema = z.object({
  theme: z.string().optional(),
  levelDescription: z.string().optional(),
});

type FormSchema = z.infer<typeof formSchema>;

export default function Home() {
  const [imageURL, setImageURL] = useState<string>('');
  const [gameFolder, setGameFolder] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [codeLanguage, setCodeLanguage] = useState<string>('JSON');
  const [aiGeneratedDescription, setAiGeneratedDescription] = useState<string>('');


  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      theme: '',
      levelDescription: '',
    },
  });

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
      const values = form.getValues();

      const result = await generateLevelFromImage({
        imageURL,
        gameFolder,
        levelDescription: values.levelDescription,
      });

      const {
        levelLayout = '',
        themeSuggestions = [],
        spriteSuggestions = [],
        backgroundImageURL = '',
        levelDescription: generatedLevelDescription = '',
      } = result || {};

      setAiGeneratedDescription(generatedLevelDescription);

      const levelData = {
        levelLayout,
        themeSuggestions,
        spriteSuggestions,
        backgroundImageURL,
        codeLanguage,
      };

      localStorage.setItem('generatedLevelData', JSON.stringify(levelData));
      router.push('/output');

      toast({
        title: 'Level Layout Generated!',
        description: 'Choose a theme and download your level file on the next page.',
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

  const onSubmit = form.handleSubmit(handleGenerateLevel);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">LevelUp AI</h1>

      <div className="flex w-full max-w-4xl space-x-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Image Upload</CardTitle>
            <CardDescription>
              Upload an image to generate a game level layout.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col space-y-4">
            <Label htmlFor="image-upload">Upload Image:</Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }} // Hide the input
            />

            {imageURL ? (
              <img
                src={imageURL}
                alt="Uploaded"
                className="max-h-64 object-contain rounded-md"
              />
            ) : (
              <div
                className="max-h-64 flex items-center justify-center rounded-md border-2 border-dashed border-gray-400 bg-gray-100 h-64 cursor-pointer"
                onClick={() => document.getElementById('image-upload')?.click()} // Trigger input click
              >
                <span className="text-gray-500">Upload an image or sketch here</span>
              </div>
            )}

          {aiGeneratedDescription && (
                <div className="mt-4">
                    <Label>Generated Level Description:</Label>
                    <p className="text-sm text-muted-foreground">{aiGeneratedDescription}</p>
                </div>
            )}


            <Label htmlFor="level-description">Level Description (optional):</Label>
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

            <div className="text-sm text-muted-foreground">
              Providing your game folder path allows the AI to tailor the level creation based on your game’s codebase and engine.
            </div>

            <Label htmlFor="code-language">Code Language:</Label>
            <Select onValueChange={setCodeLanguage} defaultValue={codeLanguage}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {['JSON', 'Lua', 'GDScript', 'C#', 'Python', 'C++'].map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={onSubmit} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Level Layout'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
