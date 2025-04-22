'use client';

import {useState, useCallback, useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from '@/components/ui/select';
import {useToast} from '@/hooks/use-toast';
import {generateLevelFromImage} from '@/ai/flows/generate-level-from-image';
import {Icons} from '@/components/icons';
import {useDropzone} from 'react-dropzone';
import {codeLanguageOptions} from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { generateLevelDescription } from '@/ai/flows/generate-level-description';

const formSchema = z.object({
  levelDescription: z.string().optional(),
});

type FormSchema = z.infer<typeof formSchema>;

export default function Home() {
  const [imageURL, setImageURL] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [codeLanguage, setCodeLanguage] = useState<string>('python');
  const {toast} = useToast();
  const [improvementSuggestions, setImprovementSuggestions] = useState<string>('');
  const router = useRouter();
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      levelDescription: '',
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageURL(reader.result as string);
      generateImprovementSuggestions(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});

  const handleRemoveImage = () => {
    setImageURL('');
    form.setValue('levelDescription', '');
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
        levelDescription: values.levelDescription,
        codeLanguage,
      });

      if (!result || !result.levelLayout) {
        toast({
          title: 'Error',
          description: 'Failed to generate level. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      const levelLayout = result.levelLayout;

      router.push(
        `/output?levelLayout=${encodeURIComponent(
          levelLayout
        )}&codeLanguage=${codeLanguage}`
      );
      toast({
        title: 'Level Layout Generated!',
        description: 'Customize your level file on the next page.',
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

  const handleGenerateDescription = async () => {
    if (!imageURL) {
      toast({
        title: 'Error',
        description: 'Please upload an image first to generate a description.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await generateLevelDescription({
        imageURL: imageURL,
        levelDescription: form.getValues().levelDescription,
        suggestionLevel: 75, // Adjust as needed
      });

      if (result && result.description) {
        setGeneratedDescription(result.description);
        form.setValue('levelDescription', result.description);
        toast({
          title: 'Description Generated',
          description: 'A level description has been automatically generated.',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Could not generate a level description. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error generating description:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate description.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateImprovementSuggestions = async (image: string) => {
     // Basic error handling and state management
     setLoading(true);
     try {
       const result = await generateLevelDescription({
         imageURL: image,
         levelDescription: form.getValues().levelDescription,
         suggestionLevel: 75,
       });

       if (result && result.description) {
         setImprovementSuggestions(result.description); // Set suggestions here
       } else {
         toast({
           title: 'Error',
           description: 'Could not generate level improvements.',
           variant: 'destructive',
         });
       }
     } catch (error: any) {
       console.error('Error generating level improvements:', error);
       toast({
         title: 'Error',
         description: error.message || 'Failed to generate level improvements.',
         variant: 'destructive',
       });
     } finally {
       setLoading(false);
     }
   };

  useEffect(() => {
    if (imageURL) {
      generateImprovementSuggestions(imageURL);
    }
  }, [imageURL]);

  const [generatedDescription, setGeneratedDescription] = useState<string>('');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 dark:bg-gray-900 dark:text-slate-200">
       <h1 className="text-3xl font-bold mb-2">LevelUp AI</h1>
        <p className="text-sm text-muted-foreground mb-4">
            Unleash your level design potential.
        </p>

        <Card className="w-full max-w-4xl dark:bg-gray-800 dark:text-slate-200 dark:border-cyan-400 dark:focus-visible:ring-cyan-400">
            <CardHeader>
                <CardTitle>Level Generator</CardTitle>
                <CardDescription>
                    Generate a game level layout based on your requirements.
                </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col space-y-4">
                <Label htmlFor="image-upload">Upload Image:</Label>
                {imageURL ? (
                    <div>
                        <img
                            src={imageURL}
                            alt="Uploaded"
                            className="max-h-64 object-contain rounded-md"
                        />
                        <Button variant="secondary" onClick={handleRemoveImage} className="mt-2">
                            Remove Image
                        </Button>
                    </div>
                ) : (
                    <div
                        {...getRootProps()}
                        className="border-2 border-dashed rounded-md p-4 dark:border-cyan-400 text-center cursor-pointer dark:bg-gray-700"
                    >
                        <input
                            {...getInputProps()}
                            type="file"
                            id="image-upload"
                            className="hidden"
                            accept="image/*"
                        />
                        {isDragActive ? (
                            <p>Drop the image here...</p>
                        ) : (
                            <p>Upload image here</p>
                        )}
                    </div>
                )}

                <Label htmlFor="level-description">
                    Level Description (optional):
                </Label>
                <div className="relative">
                    <Textarea
                        id="level-description"
                        placeholder="Describe any specific requirements or ideas for the level"
                        {...form.register('levelDescription')}
                        className="dark:bg-gray-700 dark:text-slate-200 dark:border-cyan-400 pr-10"
                        rows={4}
                    />
                    <Button
                        type="button"
                        onClick={handleGenerateDescription}
                        disabled={loading}
                        variant="outline"
                        size="icon"
                        className="absolute right-2 bottom-2 h-8 w-8"
                    >
                        {loading ? (
                            <Icons.spinner className="h-4 w-4 animate-spin" />
                        ) : (
                            <Icons.edit className="h-4 w-4" />
                        )}
                        <span className="sr-only">Generate Description</span>
                    </Button>
                </div>

                <Label htmlFor="code-language">Code Language:</Label>
                <Select
                    onValueChange={setCodeLanguage}
                    defaultValue={codeLanguage}
                >
                    <SelectTrigger className="w-[180px] dark:bg-gray-700 dark:text-slate-200 dark:border-cyan-400">
                        <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-700 dark:text-slate-200 dark:border-cyan-400">
                        {codeLanguageOptions.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                                {lang.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button onClick={handleGenerateLevel} disabled={loading}>
                    {loading ? (
                        <>
                            Generating Level Layout
                            <Icons.spinner className="ml-2 h-4 w-4 animate-spin" />
                        </>
                    ) : (
                        'Generate Level Layout'
                    )}
                </Button>

                {improvementSuggestions && (
                  <div className="mt-4">
                    <Label>Improvement Suggestions:</Label>
                      <Card className="dark:bg-gray-700 dark:text-slate-200 dark:border-cyan-400">
                        <CardContent>
                          {improvementSuggestions}
                        </CardContent>
                      </Card>
                  </div>
                )}

            </CardContent>
        </Card>
    </div>
  );
}


