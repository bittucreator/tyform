// Theme types and presets for form customization

export interface FormTheme {
  // Colors
  primaryColor: string
  backgroundColor: string
  textColor: string
  buttonColor?: string
  buttonTextColor?: string
  // Typography
  fontFamily: string
  questionAlignment?: 'left' | 'center' | 'right'
  // Button style
  buttonStyle: 'rounded' | 'square' | 'pill'
  // Background
  backgroundType: 'solid' | 'gradient' | 'image'
  backgroundGradient?: string
  backgroundImage?: string
  backgroundLayout?: 'stack' | 'split' | 'wallpaper'
  gradientStart?: string
  gradientEnd?: string
  // Advanced
  questionTextColor?: string
  answerTextColor?: string
  accentColor?: string
}

export interface ThemePreset {
  id: string
  name: string
  theme: FormTheme
  preview: {
    bg: string
    primary: string
    text: string
  }
}

export const defaultTheme: FormTheme = {
  primaryColor: '#635BFF',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  fontFamily: 'Inter',
  buttonStyle: 'rounded',
  backgroundType: 'solid',
}

export const themePresets: ThemePreset[] = [
  {
    id: 'default',
    name: 'Default',
    theme: {
      primaryColor: '#635BFF',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      fontFamily: 'Inter',
      buttonStyle: 'rounded',
      backgroundType: 'solid',
    },
    preview: { bg: '#ffffff', primary: '#635BFF', text: '#1f2937' },
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    theme: {
      primaryColor: '#8b5cf6',
      backgroundColor: '#0f172a',
      textColor: '#f8fafc',
      fontFamily: 'Inter',
      buttonStyle: 'rounded',
      backgroundType: 'solid',
    },
    preview: { bg: '#0f172a', primary: '#8b5cf6', text: '#f8fafc' },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    theme: {
      primaryColor: '#0ea5e9',
      backgroundColor: '#f0f9ff',
      textColor: '#0c4a6e',
      fontFamily: 'Inter',
      buttonStyle: 'rounded',
      backgroundType: 'gradient',
      backgroundGradient: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    },
    preview: { bg: '#e0f2fe', primary: '#0ea5e9', text: '#0c4a6e' },
  },
  {
    id: 'forest',
    name: 'Forest',
    theme: {
      primaryColor: '#22c55e',
      backgroundColor: '#f0fdf4',
      textColor: '#14532d',
      fontFamily: 'Inter',
      buttonStyle: 'rounded',
      backgroundType: 'gradient',
      backgroundGradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    },
    preview: { bg: '#dcfce7', primary: '#22c55e', text: '#14532d' },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    theme: {
      primaryColor: '#f97316',
      backgroundColor: '#fff7ed',
      textColor: '#7c2d12',
      fontFamily: 'Inter',
      buttonStyle: 'pill',
      backgroundType: 'gradient',
      backgroundGradient: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
    },
    preview: { bg: '#fed7aa', primary: '#f97316', text: '#7c2d12' },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    theme: {
      primaryColor: '#a855f7',
      backgroundColor: '#1e1b4b',
      textColor: '#e0e7ff',
      fontFamily: 'Inter',
      buttonStyle: 'rounded',
      backgroundType: 'gradient',
      backgroundGradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
    },
    preview: { bg: '#312e81', primary: '#a855f7', text: '#e0e7ff' },
  },
  {
    id: 'rose',
    name: 'Rose',
    theme: {
      primaryColor: '#f43f5e',
      backgroundColor: '#fff1f2',
      textColor: '#881337',
      fontFamily: 'Inter',
      buttonStyle: 'pill',
      backgroundType: 'solid',
    },
    preview: { bg: '#fff1f2', primary: '#f43f5e', text: '#881337' },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    theme: {
      primaryColor: '#171717',
      backgroundColor: '#fafafa',
      textColor: '#171717',
      fontFamily: 'Inter',
      buttonStyle: 'square',
      backgroundType: 'solid',
    },
    preview: { bg: '#fafafa', primary: '#171717', text: '#171717' },
  },
  {
    id: 'corporate',
    name: 'Corporate',
    theme: {
      primaryColor: '#2563eb',
      backgroundColor: '#ffffff',
      textColor: '#1e3a5f',
      fontFamily: 'Inter',
      buttonStyle: 'rounded',
      backgroundType: 'solid',
    },
    preview: { bg: '#ffffff', primary: '#2563eb', text: '#1e3a5f' },
  },
  {
    id: 'warm',
    name: 'Warm',
    theme: {
      primaryColor: '#d97706',
      backgroundColor: '#fffbeb',
      textColor: '#78350f',
      fontFamily: 'Inter',
      buttonStyle: 'rounded',
      backgroundType: 'gradient',
      backgroundGradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    },
    preview: { bg: '#fef3c7', primary: '#d97706', text: '#78350f' },
  },
]

export const fontOptions = [
  // Sans-serif fonts
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Source Sans 3', label: 'Source Sans 3' },
  { value: 'Nunito', label: 'Nunito' },
  { value: 'Nunito Sans', label: 'Nunito Sans' },
  { value: 'Raleway', label: 'Raleway' },
  { value: 'Ubuntu', label: 'Ubuntu' },
  { value: 'Rubik', label: 'Rubik' },
  { value: 'Work Sans', label: 'Work Sans' },
  { value: 'Outfit', label: 'Outfit' },
  { value: 'DM Sans', label: 'DM Sans' },
  { value: 'Manrope', label: 'Manrope' },
  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans' },
  { value: 'Space Grotesk', label: 'Space Grotesk' },
  { value: 'Figtree', label: 'Figtree' },
  { value: 'Sora', label: 'Sora' },
  { value: 'Mulish', label: 'Mulish' },
  { value: 'Quicksand', label: 'Quicksand' },
  { value: 'Barlow', label: 'Barlow' },
  { value: 'Cabin', label: 'Cabin' },
  { value: 'Karla', label: 'Karla' },
  { value: 'Lexend', label: 'Lexend' },
  { value: 'Albert Sans', label: 'Albert Sans' },
  { value: 'Urbanist', label: 'Urbanist' },
  { value: 'Catamaran', label: 'Catamaran' },
  { value: 'Josefin Sans', label: 'Josefin Sans' },
  { value: 'Exo 2', label: 'Exo 2' },
  { value: 'Archivo', label: 'Archivo' },
  { value: 'Overpass', label: 'Overpass' },
  { value: 'Questrial', label: 'Questrial' },
  { value: 'Libre Franklin', label: 'Libre Franklin' },
  { value: 'Assistant', label: 'Assistant' },
  { value: 'IBM Plex Sans', label: 'IBM Plex Sans' },
  { value: 'Fira Sans', label: 'Fira Sans' },
  { value: 'Noto Sans', label: 'Noto Sans' },
  { value: 'PT Sans', label: 'PT Sans' },
  { value: 'Titillium Web', label: 'Titillium Web' },
  { value: 'Heebo', label: 'Heebo' },
  { value: 'Oxygen', label: 'Oxygen' },
  { value: 'Asap', label: 'Asap' },
  { value: 'Maven Pro', label: 'Maven Pro' },
  { value: 'Signika', label: 'Signika' },
  { value: 'Red Hat Display', label: 'Red Hat Display' },
  { value: 'Jost', label: 'Jost' },
  { value: 'Be Vietnam Pro', label: 'Be Vietnam Pro' },
  { value: 'Epilogue', label: 'Epilogue' },
  // Serif fonts
  { value: 'Merriweather', label: 'Merriweather' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Lora', label: 'Lora' },
  { value: 'PT Serif', label: 'PT Serif' },
  { value: 'Source Serif 4', label: 'Source Serif 4' },
  { value: 'Libre Baskerville', label: 'Libre Baskerville' },
  { value: 'Crimson Text', label: 'Crimson Text' },
  { value: 'EB Garamond', label: 'EB Garamond' },
  { value: 'Cormorant Garamond', label: 'Cormorant Garamond' },
  { value: 'Bitter', label: 'Bitter' },
  { value: 'Spectral', label: 'Spectral' },
  { value: 'Cardo', label: 'Cardo' },
  { value: 'Noto Serif', label: 'Noto Serif' },
  { value: 'IBM Plex Serif', label: 'IBM Plex Serif' },
  { value: 'DM Serif Display', label: 'DM Serif Display' },
  { value: 'Fraunces', label: 'Fraunces' },
  { value: 'Vollkorn', label: 'Vollkorn' },
  { value: 'Alegreya', label: 'Alegreya' },
  { value: 'Zilla Slab', label: 'Zilla Slab' },
  { value: 'Arvo', label: 'Arvo' },
  // Display fonts
  { value: 'Bebas Neue', label: 'Bebas Neue' },
  { value: 'Anton', label: 'Anton' },
  { value: 'Oswald', label: 'Oswald' },
  { value: 'Archivo Black', label: 'Archivo Black' },
  { value: 'Righteous', label: 'Righteous' },
  { value: 'Fredoka', label: 'Fredoka' },
  { value: 'Alfa Slab One', label: 'Alfa Slab One' },
  { value: 'Passion One', label: 'Passion One' },
  { value: 'Lilita One', label: 'Lilita One' },
  { value: 'Baloo 2', label: 'Baloo 2' },
  { value: 'Comfortaa', label: 'Comfortaa' },
  { value: 'Righteous', label: 'Righteous' },
  // Handwriting/Script fonts
  { value: 'Dancing Script', label: 'Dancing Script' },
  { value: 'Pacifico', label: 'Pacifico' },
  { value: 'Caveat', label: 'Caveat' },
  { value: 'Satisfy', label: 'Satisfy' },
  { value: 'Kalam', label: 'Kalam' },
  { value: 'Indie Flower', label: 'Indie Flower' },
  { value: 'Shadows Into Light', label: 'Shadows Into Light' },
  { value: 'Permanent Marker', label: 'Permanent Marker' },
  { value: 'Amatic SC', label: 'Amatic SC' },
  { value: 'Patrick Hand', label: 'Patrick Hand' },
  // Monospace fonts
  { value: 'Fira Code', label: 'Fira Code' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono' },
  { value: 'Source Code Pro', label: 'Source Code Pro' },
  { value: 'IBM Plex Mono', label: 'IBM Plex Mono' },
  { value: 'Roboto Mono', label: 'Roboto Mono' },
  { value: 'Space Mono', label: 'Space Mono' },
  { value: 'Inconsolata', label: 'Inconsolata' },
  // System fonts
  { value: 'system-ui', label: 'System UI' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Verdana', label: 'Verdana' },
]

export const buttonStyles = [
  { value: 'rounded', label: 'Rounded' },
  { value: 'square', label: 'Square' },
  { value: 'pill', label: 'Pill' },
]

// Helper to get CSS for button style
export function getButtonRadius(style: FormTheme['buttonStyle']): string {
  switch (style) {
    case 'square':
      return '4px'
    case 'pill':
      return '9999px'
    case 'rounded':
    default:
      return '8px'
  }
}

// Helper to generate CSS variables from theme
export function getThemeCSSVariables(theme: FormTheme): React.CSSProperties {
  return {
    '--form-primary': theme.primaryColor,
    '--form-background': theme.backgroundColor,
    '--form-text': theme.textColor,
    '--form-font': theme.fontFamily,
    '--form-button-radius': getButtonRadius(theme.buttonStyle),
  } as React.CSSProperties
}

// Helper to get background style
export function getBackgroundStyle(theme: FormTheme): React.CSSProperties {
  switch (theme.backgroundType) {
    case 'gradient':
      return {
        background: theme.backgroundGradient || theme.backgroundColor,
      }
    case 'image':
      // Only apply full background for wallpaper layout
      if (theme.backgroundLayout === 'wallpaper' || !theme.backgroundLayout) {
        return {
          backgroundImage: `url(${theme.backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      }
      // For stack/split layouts, use solid background color
      return {
        backgroundColor: theme.backgroundColor,
      }
    case 'solid':
    default:
      return {
        backgroundColor: theme.backgroundColor,
      }
  }
}
