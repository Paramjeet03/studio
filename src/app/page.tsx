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
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';

const formSchema = z.object({
  theme: z.string().optional(),
})

export default function Home() {
  const [imageURL, setImageURL] = useState('');
  const [gameFolder, setGameFolder] = useState('');
  const [levelLayout, setLevelLayout] = useState('');
  const [themes, setThemes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const {toast} = useToast();
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [generatedLevelURL, setGeneratedLevelURL] = useState<string | null>(null);

  // Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      theme: '',
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
      });

      setLevelLayout(result.levelLayout);
      setThemes(result.themeSuggestions);

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

  const handleThemeSelect = (theme: string) => {
    setSelectedTheme(theme);
    toast({
      title: 'Theme Selected',
      description: `You have selected the ${theme} theme.`,
    });
  };

  const handleDownloadLevel = async () => {
    if (!levelLayout) {
      toast({
        title: 'Error',
        description: 'No level layout generated. Generate a level first.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedTheme) {
      toast({
        title: 'Error',
        description: 'Please select a theme before downloading the level.',
        variant: 'destructive',
      });
      return;
    }

    // Create a folder with the level file
    const zip = new JSZip();
    zip.file('level.json', levelLayout); // level.json is your generated level data

    // Generate the zip file as a blob
    zip.generateAsync({type:"blob"})
      .then(function(content) {
      // Create a URL for the blob
        const url = URL.createObjectURL(content);

        // Set the URL for the download link
        setGeneratedLevelURL(url);

        // Programmatically trigger the download
        const link = document.createElement('a');
        link.href = url;
        link.download = 'level_pack.zip'; // Name the downloaded zip file
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Revoke the URL
        URL.revokeObjectURL(url);
        toast({
          title: 'Level Download Ready!',
          description: 'Your level file is ready to download.',
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
            </div>
            <ul className="text-sm text-muted-foreground list-disc pl-5">
              <li>1. Tailor the level creation based on existing game variables, functions, language, and engine.</li>
              <li>2. Determine the correct file extension for exporting the level data (e.g., .json, .lua, .gd).</li>
            </ul>
            <div className="text-sm text-muted-foreground">
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
            <CardTitle>Level Output</CardTitle>
            <CardDescription>Select a theme and download the generated level.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            {themes.length > 0 ? (
              <>
                <Label>Select a Theme:</Label>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                    <FormField
                      control={form.control}
                      name="theme"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                            {themes.map((theme) => (
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
                <Button onClick={handleDownloadLevel} disabled={!levelLayout || loading}>
                  Download Level
                </Button>
              </>
            ) : (
              <Alert>
                <AlertTitle>No Level Generated</AlertTitle>
                <AlertDescription>Please upload an image and generate a level layout first.</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
