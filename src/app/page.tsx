'use client';

import {useState, useCallback, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {useDropzone} from 'react-dropzone';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
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
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {useToast} from '@/hooks/use-toast';
import {generateLevelFromImage} from '@/ai/flows/generate-level-from-image';
import {Icons} from '@/components/icons';
import {Slider} from "@/components/ui/slider"
import {Switch} from "@/components/ui/switch"
import { generateLevelDescription } from "@/ai/flows/generate-level-description";


const formSchema = z.object({
  levelDescription: z.string().optional(),
});

type FormSchema = z.infer<typeof formSchema>;

const codeLanguageOptions = [
  {label: 'Python', value: 'python'},
  {label: 'Lua', value: 'lua'},
  {label: 'GDScript', value: 'gdscript'},
  {label: 'C#', value: 'csharp'},
  {label: 'C++', value: 'cpp'},
  {label: 'JSON', value: 'json'},
];


export default function Home() {
  const [imageURL, setImageURL] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [codeLanguage, setCodeLanguage] = useState<string>('python');
  const [autoSuggest, setAutoSuggest] = useState<boolean>(false);


  const {toast} = useToast();
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
    };
    reader.readAsDataURL(file);
  }, []);

  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});

  const handleRemoveImage = () => {
    setImageURL('');
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

      const {levelLayout} = result;

      const url = `/output?levelLayout=${encodeURIComponent(levelLayout)}&codeLanguage=${codeLanguage}`;
      router.push(url);

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


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">LevelUp AI</h1>

      <div className="flex w-full max-w-4xl space-x-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Level Generator</CardTitle>
            <CardDescription>
              Generate a game level layout based on your requirements.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col space-y-4">
            <Label htmlFor="image-upload">
              Upload Image:
            </Label>
            {imageURL ? (
              <>
                <img
                  src={imageURL}
                  alt="Uploaded"
                  className="max-h-64 object-contain rounded-md"
                />
                <Button variant="secondary" onClick={handleRemoveImage}>
                  Remove Image
                </Button>
              </>
            ) : (
              <div {...getRootProps()} className="dropzone w-full h-40 border-2 border-dashed border-gray-400 rounded-md flex items-center justify-center bg-gray-50 cursor-pointer">
                <input {...getInputProps()} />
                {
                  isDragActive ?
                    <p>Drop the files here ...</p> :
                    <p>Drag 'n' drop some files here, or click to select files</p>
                }
              </div>
            )}

            <Label htmlFor="level-description">
              Level Description (optional):
            </Label>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-x-2">
              <Textarea
                id="level-description"
                placeholder="Describe any specific requirements or ideas for the level"
                {...form.register('levelDescription')}
                className="flex-grow"
              />

            </div>

            <Label htmlFor="code-language">
              Code Language:
            </Label>
            <Select onValueChange={setCodeLanguage} defaultValue={codeLanguage}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a language"/>
              </SelectTrigger>
              <SelectContent>
                {codeLanguageOptions.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>


            <Button onClick={handleGenerateLevel} disabled={loading}>
              {loading ? 'Generate Level Layout' : 'Generate Level Layout'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

