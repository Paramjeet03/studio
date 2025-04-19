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
import {useEffect} from 'react';
import JSZip from 'jszip'; // Import JSZip

export default function Home() {
  const [imageURL, setImageURL] = useState('');
  const [gameFolder, setGameFolder] = useState('');
  const [levelLayout, setLevelLayout] = useState('');
  const [themes, setThemes] = useState<string[]>([]);
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
      });

      setLevelLayout(result.levelLayout);
      setThemes(result.themeSuggestions);

      toast({
        title: 'Level Layout Generated!',
        description: 'A level layout has been generated successfully.',
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

  const createFolder = (folderName: string, files: { name: string; content: string }[]) => {
    const zip = new JSZip();
    files.forEach(file => {
      zip.file(`${folderName}/${file.name}`, file.content);
    });
    return zip.generateAsync({ type: "blob" });
  };

  const handleExportLevel = async () => {
    if (!levelLayout) {
      toast({
        title: 'Error',
        description: 'No level layout generated. Generate a level first.',
        variant: 'destructive',
      });
      return;
    }

    // Determine file extension based on game folder or default to JSON
    const fileExtension = gameFolder ? '.json' : '.json';
    const levelFileName = `level${fileExtension}`;
    const aiFileName = `ai_generated_content${fileExtension}`;

    // For this example, we'll create two files: level.json and ai_generated_content.json
    const files = [
      { name: levelFileName, content: levelLayout },
      { name: aiFileName, content: JSON.stringify({ themes }) }, // Example of AI content
    ];

    // Create a zip file containing the level files
    const zipFileName = 'level_pack.zip';
    const zip = new JSZip();
    files.forEach(file => {
      zip.file(file.name, file.content);
    });

    zip.generateAsync({ type: "blob" })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = zipFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: 'Level Exported!',
          description: `Level files have been exported as ${zipFileName}`,
        });
      });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">LevelUp AI</h1>
      <div className="flex w-full max-w-4xl space-x-4">
        <Card className="w-1/2">
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
            <Label htmlFor="game-folder">Game Folder (optional):</Label>
            <Input
              id="game-folder"
              type="text"
              placeholder="Path to game folder"
              value={gameFolder}
              onChange={(e) => setGameFolder(e.target.value)}
            />
            <div className="text-sm text-muted-foreground">
              Providing your game folder path allows the AI to:
              <ul>
                <li>1. Tailor the level creation based on existing game variables, functions, language, and engine.</li>
                <li>2. Determine the correct file extension for exporting the level data (e.g., .json, .lua, .gd).</li>
              </ul>
              Additionally, if you want the AI to consider specific changes to the level structure or content
              based on your existing game's parameters, detail these requirements in a separate document within your game folder.
            </div>
            <Button onClick={handleGenerateLevel} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Level Layout'}
            </Button>
          </CardContent>
        </Card>

        <Card className="w-1/2">
          <CardHeader>
            <CardTitle>Level Layout</CardTitle>
            <CardDescription>View and export the generated level layout.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
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
