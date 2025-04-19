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

export default function Home() {
  const [imageURL, setImageURL] = useState('');
  const [gameFolder, setGameFolder] = useState('');
  const [levelLayout, setLevelLayout] = useState('');
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

      setLevelLayout(JSON.stringify(result.levelLayout, null, 2));
      setThemes(result.themeSuggestions);

      toast({
        title: 'Level Generated!',
        description: 'Level layout has been generated successfully.',
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
    if (!levelLayout) {
      toast({
        title: 'Error',
        description: 'No level to export. Generate a level first.',
        variant: 'destructive',
      });
      return;
    }

    const blob = new Blob([levelLayout], {type: 'application/json'});
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
            <CardDescription>Upload an image to generate a game level.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <Label htmlFor="image-upload">Upload Image:</Label>
            <Input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} />
            {imageURL && (
              <img src={imageURL} alt="Uploaded" className="max-h-64 object-contain rounded-md" />
            )}
            <Label htmlFor="game-folder">Game Folder (optional):</Label>
            <Input
              id="game-folder"
              type="text"
              placeholder="Path to game folder"
              value={gameFolder}
              onChange={(e) => setGameFolder(e.target.value)}
            />
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
              {loading ? 'Generating...' : 'Generate Level'}
            </Button>
          </CardContent>
        </Card>

        <Card className="w-1/2">
          <CardHeader>
            <CardTitle>Level Preview</CardTitle>
            <CardDescription>Generated level layout (JSON format).</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              readOnly
              value={levelLayout}
              placeholder="Generated level layout will appear here."
              className="min-h-[300px] font-mono text-sm"
            />
            <Button onClick={handleExportLevel} disabled={!levelLayout}>
              Export Level
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
