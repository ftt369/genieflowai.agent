import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorProfile = 'default' | 'spiral';

interface ColorSet {
  background: string;
  foreground: string;
  card: string;
  'card-foreground': string;
  popover: string;
  'popover-foreground': string;
  primary: string;
  'primary-foreground': string;
  secondary: string;
  'secondary-foreground': string;
  muted: string;
  'muted-foreground': string;
  accent: string;
  'accent-foreground': string;
  destructive: string;
  'destructive-foreground': string;
  border: string;
  input: string;
  ring: string;
}

interface ProfileConfig {
  light: ColorSet;
  dark: ColorSet;
}

// Default light theme
const defaultLight: ColorSet = {
  background: '0 0% 100%',
  foreground: '202 20% 30%',
  card: '0 0% 100%',
  'card-foreground': '202 20% 30%',
  popover: '0 0% 100%',
  'popover-foreground': '202 20% 30%',
  primary: '217 89% 61%',
  'primary-foreground': '0 0% 100%',
  secondary: '137 87% 38%',
  'secondary-foreground': '0 0% 100%',
  muted: '220 14% 96%',
  'muted-foreground': '220 8% 56%',
  accent: '25 95% 53%',
  'accent-foreground': '0 0% 100%',
  destructive: '0 92% 45%',
  'destructive-foreground': '0 0% 100%',
  border: '220 13% 91%',
  input: '220 13% 91%',
  ring: '217 89% 61%'
};

// Default dark theme
const defaultDark: ColorSet = {
  background: '224 35% 15%',
  foreground: '213 31% 91%',
  card: '224 35% 15%',
  'card-foreground': '213 31% 91%',
  popover: '224 35% 15%',
  'popover-foreground': '213 31% 91%',
  primary: '217 89% 61%',
  'primary-foreground': '0 0% 100%',
  secondary: '137 87% 38%',
  'secondary-foreground': '0 0% 100%',
  muted: '223 30% 20%',
  'muted-foreground': '215 20% 65%',
  accent: '25 95% 53%',
  'accent-foreground': '0 0% 100%',
  destructive: '0 92% 45%',
  'destructive-foreground': '0 0% 100%',
  border: '216 34% 25%',
  input: '216 34% 25%',
  ring: '217 89% 61%'
};

// Spiral-inspired light theme
const spiralLight: ColorSet = {
  background: '0 0% 100%',
  foreground: '220 20% 25%',
  card: '0 0% 100%',
  'card-foreground': '220 20% 25%',
  popover: '0 0% 100%',
  'popover-foreground': '220 20% 25%',
  primary: '42 74% 60%', // Gold primary
  'primary-foreground': '0 0% 100%',
  secondary: '195 81% 62%', // Blue secondary
  'secondary-foreground': '0 0% 100%',
  muted: '42 74% 95%', // Light gold
  'muted-foreground': '220 10% 45%',
  accent: '220 60% 30%', // Dark blue accent
  'accent-foreground': '0 0% 100%',
  destructive: '0 85% 40%',
  'destructive-foreground': '0 0% 100%',
  border: '35 10% 83%',
  input: '35 10% 83%',
  ring: '42 74% 60%'
};

// Spiral-inspired dark theme
const spiralDark: ColorSet = {
  background: '220 40% 15%',
  foreground: '35 30% 90%',
  card: '220 40% 15%',
  'card-foreground': '35 30% 90%',
  popover: '220 40% 15%',
  'popover-foreground': '35 30% 90%',
  primary: '42 74% 50%', // Gold primary
  'primary-foreground': '0 0% 0%',
  secondary: '195 81% 50%', // Blue secondary
  'secondary-foreground': '0 0% 0%',
  muted: '220 40% 20%',
  'muted-foreground': '35 20% 70%',
  accent: '220 60% 40%', // Dark blue accent
  'accent-foreground': '0 0% 100%',
  destructive: '0 70% 50%',
  'destructive-foreground': '210 40% 98%',
  border: '220 40% 25%',
  input: '220 40% 25%',
  ring: '42 74% 50%'
};

export const themeProfiles: Record<ColorProfile, ProfileConfig> = {
  default: {
    light: defaultLight,
    dark: defaultDark
  },
  spiral: {
    light: spiralLight,
    dark: spiralDark
  }
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const defaultTheme = themeProfiles.default.light; 