import { Tabs } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Home, PieChart, Wallet, Settings, Plus } from 'lucide-react-native';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function TabLayout() {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarIcon: () => (
            <View style={styles.addButton}>
              <Pressable
                style={[styles.addButtonInner, { backgroundColor: theme.colors.primary }]}
                onPress={() => router.push('/add-transaction')}
              >
                <Plus size={24} color="white" />
              </Pressable>
            </View>
          ),
        }}
        listeners={() => ({
          tabPress: (e) => {
            e.preventDefault();
            router.push('/add-transaction');
          },
        })}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, size }) => <PieChart size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  addButton: {
    position: 'absolute',
    bottom: 5,
    height: 58,
    width: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonInner: {
    height: 50,
    width: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});