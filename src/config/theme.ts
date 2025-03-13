export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorProfile = 'default' | 'vibrant' | 'muted' | 'contrast';

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

const defaultLight: ColorSet = {
  background: '0 0% 100%',
  foreground: '222.2 84% 4.9%',
  card: '0 0% 100%',
  'card-foreground': '222.2 84% 4.9%',
  popover: '0 0% 100%',
  'popover-foreground': '222.2 84% 4.9%',
  primary: '221.2 83.2% 53.3%',
  'primary-foreground': '210 40% 98%',
  secondary: '210 40% 96.1%',
  'secondary-foreground': '222.2 47.4% 11.2%',
  muted: '210 40% 96.1%',
  'muted-foreground': '215.4 16.3% 46.9%',
  accent: '210 40% 96.1%',
  'accent-foreground': '222.2 47.4% 11.2%',
  destructive: '0 84.2% 60.2%',
  'destructive-foreground': '210 40% 98%',
  border: '214.3 31.8% 91.4%',
  input: '214.3 31.8% 91.4%',
  ring: '221.2 83.2% 53.3%'
};

const defaultDark: ColorSet = {
  background: '222.2 84% 4.9%',
  foreground: '210 40% 98%',
  card: '222.2 84% 4.9%',
  'card-foreground': '210 40% 98%',
  popover: '222.2 84% 4.9%',
  'popover-foreground': '210 40% 98%',
  primary: '217.2 91.2% 59.8%',
  'primary-foreground': '222.2 47.4% 11.2%',
  secondary: '217.2 32.6% 17.5%',
  'secondary-foreground': '210 40% 98%',
  muted: '217.2 32.6% 17.5%',
  'muted-foreground': '215 20.2% 65.1%',
  accent: '217.2 32.6% 17.5%',
  'accent-foreground': '210 40% 98%',
  destructive: '0 62.8% 30.6%',
  'destructive-foreground': '210 40% 98%',
  border: '217.2 32.6% 17.5%',
  input: '217.2 32.6% 17.5%',
  ring: '224.3 76.3% 48%'
};

export const themeProfiles: Record<ColorProfile, ProfileConfig> = {
  default: {
    light: defaultLight,
    dark: defaultDark
  },
  vibrant: {
    light: {
      ...defaultLight,
      primary: '250 100% 60%',
      accent: '330 100% 60%',
      secondary: '170 100% 60%'
    },
    dark: {
      ...defaultDark,
      primary: '250 100% 70%',
      accent: '330 100% 70%',
      secondary: '170 100% 70%'
    }
  },
  muted: {
    light: {
      ...defaultLight,
      primary: '220 30% 60%',
      accent: '330 30% 60%',
      secondary: '170 30% 60%'
    },
    dark: {
      ...defaultDark,
      primary: '220 20% 40%',
      accent: '330 20% 40%',
      secondary: '170 20% 40%'
    }
  },
  contrast: {
    light: {
      ...defaultLight,
      background: '0 0% 100%',
      foreground: '0 0% 0%',
      primary: '220 100% 30%',
      'primary-foreground': '0 0% 100%'
    },
    dark: {
      ...defaultDark,
      background: '0 0% 0%',
      foreground: '0 0% 100%',
      primary: '220 100% 70%',
      'primary-foreground': '0 0% 0%'
    }
  }
}; 