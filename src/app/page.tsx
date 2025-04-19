'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {useToast} from '@/hooks/use-toast';
import {generateLevelFromImage} from '@/ai/flows/generate-level-from-image';
import { z } from 'zod';

const levelTemplateSchema = z.object({
  name: z.string(),
  layout: z.string(),
});

type LevelTemplate = z.infer<typeof levelTemplateSchema>;

export default function Home() {
  const [imageURL, setImageURL] = useState('');
  const [gameFolder, setGameFolder] = useState('');
  const [levelTemplates, setLevelTemplates] = useState<LevelTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<LevelTemplate | null>(null);
  const [themes, setThemes] = useState<string[]>([]);
  const [selectedTheme, setSelectedTheme] = useState('');
  const [loading, setLoading] = useState(false);
  const {toast} = useToast();

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
        theme: selectedTheme,
      });

      setLevelTemplates(result.levelTemplates);
      setSelectedTemplate(result.levelTemplates[0] || null);
      setThemes(result.themeSuggestions);

      toast({
        title: 'Level Templates Generated!',
        description: 'Level templates have been generated successfully.',
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

  const handleExportLevel = () => {
    if (!selectedTemplate) {
      toast({
        title: 'Error',
        description: 'No level template selected. Generate a level first and select a template.',
        variant: 'destructive',
      });
      return;
    }

    const blob = new Blob([selectedTemplate.layout], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'level.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Level Exported!',
      description: 'Level layout has been exported as level.json',
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">LevelUp AI</h1>
      <div className="flex w-full max-w-4xl space-x-4">
        <Card className="w-1/2">
          <CardHeader>
            <CardTitle>Image Upload</CardTitle>
            <CardDescription>Upload an image to generate game level templates.</CardDescription>
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
            <Label htmlFor="game-folder">Game Folder (optional):</Label>
            <Input
              id="game-folder"
              type="text"
              placeholder="Path to game folder"
              value={gameFolder}
              onChange={(e) => setGameFolder(e.target.value)}
            />
                        <p className="text-sm text-muted-foreground">
              Providing your game folder allows the AI to suggest appropriate scenes and create levels based on existing game variables, functions, language, and engine.
            </p>
            {themes.length > 0 && (
              <>
                <Label>Select Theme:</Label>
                <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map((theme) => (
                      <SelectItem key={theme} value={theme}>
                        {theme}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
            <Button onClick={handleGenerateLevel} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Level Templates'}
            </Button>
          </CardContent>
        </Card>

        <Card className="w-1/2">
          <CardHeader>
            <CardTitle>Level Template Preview</CardTitle>
            <CardDescription>Select a generated level template (JSON format).</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            {levelTemplates.length > 0 ? (
              <>
                <Label>Select a Template:</Label>
                <Select
                  value={selectedTemplate?.name || ''}
                  onValueChange={(value) => {
                    const template = levelTemplates.find((t) => t.name === value);
                    setSelectedTemplate(template || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a level template" />
                  </SelectTrigger>
                  <SelectContent>
                    {levelTemplates.map((template) => (
                      <SelectItem key={template.name} value={template.name}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTemplate && (
                  <Textarea
                    readOnly
                    value={selectedTemplate.layout}
                    placeholder="Generated level layout will appear here."
                    className="min-h-[200px] font-mono text-sm"
                  />
                )}
              </>
            ) : (
              <Textarea
                readOnly
                value=""
                placeholder="Generated level templates will appear here. Upload an image and generate templates first."
                className="min-h-[300px] font-mono text-sm"
              />
            )}
            <Button onClick={handleExportLevel} disabled={!selectedTemplate}>
              Export Level
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
