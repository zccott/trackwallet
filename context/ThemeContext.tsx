import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

// Define theme types
interface ThemeColors {
  primary: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  notification: string;
  error: string;
  success: string;
}

interface Theme {
  dark: boolean;
  colors: ThemeColors;
}

// Define themes
const lightTheme: Theme = {
  dark: false,
  colors: {
    primary: '#6200EE',
    background: '#F2F2F2',
    card: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#757575',
    border: '#E0E0E0',
    notification: '#FF3B30',
    error: '#FF3B30',
    success: '#34C759',
  },
};

const darkTheme: Theme = {
  dark: true,
  colors: {
    primary: '#BB86FC',
    background: '#121212',
    card: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#ABABAB',
    border: '#2C2C2C',
    notification: '#FF453A',
    error: '#FF453A',
    success: '#30D158',
  },
};

const blueTheme: Theme = {
  dark: false,
  colors: {
    primary: '#007AFF',
    background: '#F2F7FF',
    card: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#757575',
    border: '#D6E4FF',
    notification: '#FF3B30',
    error: '#FF3B30',
    success: '#34C759',
  },
};

const greenTheme: Theme = {
  dark: false,
  colors: {
    primary: '#28CD41',
    background: '#F2FFF5',
    card: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#757575',
    border: '#D6FFE0',
    notification: '#FF3B30',
    error: '#FF3B30',
    success: '#34C759',
  },
};

const purpleTheme: Theme = {
  dark: false,
  colors: {
    primary: '#AF52DE',
    background: '#F9F2FF',
    card: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#757575',
    border: '#E9D6FF',
    notification: '#FF3B30',
    error: '#FF3B30',
    success: '#34C759',
  },
};

// Define context type
interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: 'system' | 'light' | 'dark' | 'blue' | 'green' | 'purple') => void;
  themeType: 'system' | 'light' | 'dark' | 'blue' | 'green' | 'purple';
}

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const [themeType, setThemeType] = useState<'system' | 'light' | 'dark' | 'blue' | 'green' | 'purple'>('system');
  const [theme, setThemeState] = useState<Theme>(colorScheme === 'dark' ? darkTheme : lightTheme);

  useEffect(() => {
    if (themeType === 'system') {
      setThemeState(colorScheme === 'dark' ? darkTheme : lightTheme);
    } else if (themeType === 'light') {
      setThemeState(lightTheme);
    } else if (themeType === 'dark') {
      setThemeState(darkTheme);
    } else if (themeType === 'blue') {
      setThemeState(blueTheme);
    } else if (themeType === 'green') {
      setThemeState(greenTheme);
    } else if (themeType === 'purple') {
      setThemeState(purpleTheme);
    }
  }, [themeType, colorScheme]);

  const setTheme = (newTheme: 'system' | 'light' | 'dark' | 'blue' | 'green' | 'purple') => {
    setThemeType(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeType }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};