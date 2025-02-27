import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, DollarSign, FileText, Tag, CreditCard } from 'lucide-react-native';
import { format } from 'date-fns';

export default function AddTransactionScreen() {
  const { theme } = useTheme();
  const { categories, accounts, addTransaction } = useData();
  const router = useRouter();
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(accounts[0]?.id || null);
  const [notes, setNotes] = useState('');
  
  const handleSave = () => {
    if (!description || !amount || !selectedCategory || !selectedAccount) {
      // Show validation error
      return;
    }
    
    addTransaction({
      description,
      amount: parseFloat(amount),
      date: date.toISOString(),
      type,
      categoryId: selectedCategory,
      accountId: selectedAccount,
      notes,
    });
    
    router.back();
  };
  
  const getCategoryById = (id: string) => {
    return categories.find(category => category.id === id);
  };
  
  const getAccountById = (id: string) => {
    return accounts.find(account => account.id === id);
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>Add Transaction</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={[styles.saveButtonText, { color: theme.colors.primary }]}>Save</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'expense' && { backgroundColor: theme.colors.error },
              ]}
              onPress={() => setType('expense')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  { color: type === 'expense' ? 'white' : theme.colors.text },
                ]}
              >
                Expense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'income' && { backgroundColor: theme.colors.success },
              ]}
              onPress={() => setType('income')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  { color: type === 'income' ? 'white' : theme.colors.text },
                ]}
              >
                Income
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={[styles.amountContainer, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.currencySymbol, { color: theme.colors.text }]}>$</Text>
            <TextInput
              style={[styles.amountInput, { color: theme.colors.text }]}
              placeholder="0.00"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
          
          <View style={styles.formContainer}>
            <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
              <View style={styles.inputIcon}>
                <FileText size={20} color={theme.colors.primary} />
              </View>
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Description"
                placeholderTextColor={theme.colors.textSecondary}
                value={description}
                onChangeText={setDescription}
              />
            </View>
            
            <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
              <View style={styles.inputIcon}>
                <Calendar size={20} color={theme.colors.primary} />
              </View>
              <TouchableOpacity style={styles.dateSelector}>
                <Text style={[styles.dateText, { color: theme.colors.text }]}>
                  {format(date, 'MMMM dd, yyyy')}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
              <View style={styles.inputIcon}>
                <Tag size={20} color={theme.colors.primary} />
              </View>
              <TouchableOpacity style={styles.categorySelector}>
                <Text 
                  style={[
                    styles.placeholderText, 
                    selectedCategory ? { color: theme.colors.text } : { color: theme.colors.textSecondary }
                  ]}
                >
                  {selectedCategory ? getCategoryById(selectedCategory)?.name : 'Select Category'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
              <View style={styles.inputIcon}>
                <CreditCard size={20} color={theme.colors.primary} />
              </View>
              <TouchableOpacity style={styles.accountSelector}>
                <Text 
                  style={[
                    styles.placeholderText, 
                    selectedAccount ? { color: theme.colors.text } : { color: theme.colors.textSecondary }
                  ]}
                >
                  {selectedAccount ? getAccountById(selectedAccount)?.name : 'Select Account'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={[styles.notesContainer, { backgroundColor: theme.colors.card }]}>
              <TextInput
                style={[styles.notesInput, { color: theme.colors.text }]}
                placeholder="Add notes (optional)"
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={4}
                value={notes}
                onChangeText={setNotes}
              />
            </View>
          </View>
          
          <View style={styles.categoriesSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Categories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
              {categories
                .filter(category => 
                  (type === 'expense' && category.id <= '7') || 
                  (type === 'income' && category.id >= '8')
                )
                .map(category => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryItem,
                      { backgroundColor: theme.colors.card },
                      selectedCategory === category.id && { borderColor: category.color, borderWidth: 2 },
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                      <Text style={[styles.categoryEmoji, { color: category.color }]}>
                        {category.icon}
                      </Text>
                    </View>
                    <Text 
                      style={[
                        styles.categoryName, 
                        { color: theme.colors.text },
                        selectedCategory === category.id && { color: category.color },
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
          
          <View style={styles.accountsSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Accounts</Text>
            <View style={styles.accountsContainer}>
              {accounts.map(account => (
                <TouchableOpacity
                  key={account.id}
                  style={[
                    styles.accountItem,
                    { backgroundColor: theme.colors.card },
                    selectedAccount === account.id && { borderColor: theme.colors.primary, borderWidth: 2 },
                  ]}
                  onPress={() => setSelectedAccount(account.id)}
                >
                  <Text style={[styles.accountName, { color: theme.colors.text }]}>
                    {account.name}
                  </Text>
                  <Text style={[styles.accountBalance, { color: theme.colors.textSecondary }]}>
                    ${account.balance.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
  },
  typeButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 8,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 8,
  },
  amountInput: {
    fontSize: 32,
    fontWeight: 'bold',
    minWidth: 100,
    textAlign: 'center',
  },
  formContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  dateSelector: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
  },
  categorySelector: {
    flex: 1,
  },
  accountSelector: {
    flex: 1,
  },
  placeholderText: {
    fontSize: 16,
  },
  notesContainer: {
    borderRadius: 12,
    padding: 16,
  },
  notesInput: {
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoriesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  categoriesContainer: {
    paddingLeft: 20,
  },
  categoryItem: {
    width: 100,
    padding: 12,
    borderRadius: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryName: {
    fontSize: 12,
    textAlign: 'center',
  },
  accountsSection: {
    marginBottom: 40,
  },
  accountsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
  },
  accountItem: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    marginRight: '4%',
  },
  accountName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  accountBalance: {
    fontSize: 12,
  },
});