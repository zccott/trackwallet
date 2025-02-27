import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useState } from 'react';
import { Moon, Sun, Palette, ChevronRight, User, Bell, Shield, HelpCircle, LogOut } from 'lucide-react-native';

export default function SettingsScreen() {
  const { theme, setTheme, themeType } = useTheme();
  const [showThemeOptions, setShowThemeOptions] = useState(false);

  const toggleThemeOptions = () => {
    setShowThemeOptions(!showThemeOptions);
  };

  const selectTheme = (selectedTheme: 'system' | 'light' | 'dark' | 'blue' | 'green' | 'purple') => {
    setTheme(selectedTheme);
    setShowThemeOptions(false);
  };

  const getThemeName = () => {
    switch (themeType) {
      case 'system':
        return 'System Default';
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'blue':
        return 'Blue';
      case 'green':
        return 'Green';
      case 'purple':
        return 'Purple';
      default:
        return 'System Default';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Appearance</Text>
          
          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: theme.colors.card }]}
            onPress={toggleThemeOptions}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                <Palette size={20} color={theme.colors.primary} />
              </View>
              <Text style={[styles.settingText, { color: theme.colors.text }]}>Theme</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
                {getThemeName()}
              </Text>
              <ChevronRight size={20} color={theme.colors.textSecondary} />
            </View>
          </TouchableOpacity>

          {showThemeOptions && (
            <View style={styles.themeOptions}>
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  { backgroundColor: theme.colors.card },
                  themeType === 'system' && styles.selectedThemeOption,
                ]}
                onPress={() => selectTheme('system')}
              >
                <Text
                  style={[
                    styles.themeOptionText,
                    { color: theme.colors.text },
                    themeType === 'system' && { color: theme.colors.primary },
                  ]}
                >
                  System Default
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  { backgroundColor: theme.colors.card },
                  themeType === 'light' && styles.selectedThemeOption,
                ]}
                onPress={() => selectTheme('light')}
              >
                <Text
                  style={[
                    styles.themeOptionText,
                    { color: theme.colors.text },
                    themeType === 'light' && { color: theme.colors.primary },
                  ]}
                >
                  Light
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  { backgroundColor: theme.colors.card },
                  themeType === 'dark' && styles.selectedThemeOption,
                ]}
                onPress={() => selectTheme('dark')}
              >
                <Text
                  style={[
                    styles.themeOptionText,
                    { color: theme.colors.text },
                    themeType === 'dark' && { color: theme.colors.primary },
                  ]}
                >
                  Dark
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  { backgroundColor: theme.colors.card },
                  themeType === 'blue' && styles.selectedThemeOption,
                ]}
                onPress={() => selectTheme('blue')}
              >
                <Text
                  style={[
                    styles.themeOptionText,
                    { color: theme.colors.text },
                    themeType === 'blue' && { color: theme.colors.primary },
                  ]}
                >
                  Blue
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  { backgroundColor: theme.colors.card },
                  themeType === 'green' && styles.selectedThemeOption,
                ]}
                onPress={() => selectTheme('green')}
              >
                <Text
                  style={[
                    styles.themeOptionText,
                    { color: theme.colors.text },
                    themeType === 'green' && { color: theme.colors.primary },
                  ]}
                >
                  Green
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  { backgroundColor: theme.colors.card },
                  themeType === 'purple' && styles.selectedThemeOption,
                ]}
                onPress={() => selectTheme('purple')}
              >
                <Text
                  style={[
                    styles.themeOptionText,
                    { color: theme.colors.text },
                    themeType === 'purple' && { color: theme.colors.primary },
                  ]}
                >
                  Purple
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={[styles.settingItem, { backgroundColor: theme.colors.card }]}>
            <View style={styles.settingLeft}>
              <View style={[styles
          ]
          }
  )
}