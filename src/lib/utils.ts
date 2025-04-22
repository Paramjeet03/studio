import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const codeLanguageExtensions: { [key: string]: string } = {
  python: 'py',
  lua: 'lua',
  gdscript: 'gd',
  csharp: 'cs',
  cpp: 'cpp',
  json: 'json',
};
