import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const codeLanguageOptions = [
  { value: 'python', label: 'Python' },
  { value: 'lua', label: 'Lua' },
  { value: 'gdscript', label: 'GDScript' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'json', label: 'JSON' },
];

export const codeLanguageExtensions: { [key: string]: string } = {
  python: 'py',
  lua: 'lua',
  gdscript: 'gd',
  csharp: 'cs',
  cpp: 'cpp',
  json: 'json',
};
