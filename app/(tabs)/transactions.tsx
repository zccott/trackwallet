import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import { format } from 'date-fns';
import { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react-native';

export default function TransactionsScreen() {
  const { theme } = useTheme();
  const { transactions, categories, accounts } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'income', 'expense'
  const [selectedCategory, setSelectedCategory] = useState(null);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(transaction => {
        // Filter by search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return transaction.description.toLowerCase().includes(query);
        }
        return true;
      })
      .filter(transaction => {
        // Filter by transaction type
        if (filterType === 'all') return true;
        return transaction.type === filterType;
      })
      .filter(transaction => {
        // Filter by category
        if (!selectedCategory) return true;
        return transaction.categoryId === selectedCategory;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchQuery, filterType, selectedCategory]);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups = {};
    
    filteredTransactions.forEach(transaction => {
      const date = format(new Date(transaction.date), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
    });
    
    return Object.entries(groups).map(([date, items]) => ({
      date,
      items,
      total: items.reduce((sum, item) => {
        if (item.type === 'income') {
          return sum + item.amount;
        } else {
          return sum - item.amount;
        }
      }, 0)
    }));
  }, [filteredTransactions]);

  const getCategoryById = (id) => {
    return categories.find(category => category.id === id) || { name: 'Uncategorized', color: '#888888' };
  };

  const getAccountById = (id) => {
    return accounts.find(account => account.id === id) || { name: 'Unknown Account' };
  };

  const renderTransactionItem = ({ item }) => {
    const category = getCategoryById(item.categoryId);
    const account = getAccountById(item.accountId);
    
    return (
      <TouchableOpacity 
        style={[styles.transactionItem, { backgroundColor: theme.colors.card }]}
      >
        <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
          <Text style={[styles.categoryEmoji, { color: category.color }]}>
            {category.icon || '💰'}
          </Text>
        </View>
        <View style={styles.transactionInfo}>
          <Text style={[styles.transactionName, { color: theme.colors.text }]}>{item.description}</Text>
          <Text style={[styles.transactionAccount, { color: theme.colors.textSecondary }]}>
            {account.name}
          </Text>
        </View>
        <View style={styles.transactionAmountContainer}>
          <Text 
            style={[
              styles.transactionAmount, 
              { color: item.type === 'expense' ? theme.colors.error : theme.colors.success }
            ]}
          >
            {item.type === 'expense' ? '-' : '+'}${item.amount.toFixed(2)}
          </Text>
          <Text style={[styles.transactionTime, { color: theme.colors.textSecondary }]}>
            {format(new Date(item.date), 'h:mm a')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDateGroup = ({ item }) => {
    return (
      <View style={styles.dateGroup}>
        <View style={styles.dateHeader}>
          <Text style={[styles.dateText, { color: theme.colors.text }]}>
            {format(new Date(item.date), 'EEEE, MMMM do')}
          </Text>
          <Text 
            style={[
              styles.dateTotal, 
              { color: item.total >= 0 ? theme.colors.success : theme.colors.error }
            ]}
          >
            {item.total >= 0 ? '+' : ''}{item.total.toFixed(2)}
          </Text>
        </View>
        <FlatList
          data={item.items}
          renderItem={renderTransactionItem}
          keyExtractor={transaction => transaction.id}
          scrollEnabled={false}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Transactions</Text>
      </View>
      
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}>
        <Search size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search transactions..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filterType === 'all' && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setFilterType('all')}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: filterType === 'all' ? 'white' : theme.colors.text },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterChip,
              filterType === 'income' && { backgroundColor: theme.colors.success },
            ]}
            onPress={() => setFilterType('income')}
          >
            <ArrowUpRight size={16} color={filterType === 'income' ? 'white' : theme.colors.success} />
            <Text
              style={[
                styles.filterChipText,
                { color: filterType === 'income' ? 'white' : theme.colors.text },
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterChip,
              filterType === 'expense' && { backgroundColor: theme.colors.error },
            ]}
            onPress={() => setFilterType('expense')}
          >
            <ArrowDownRight size={16} color={filterType === 'expense' ? 'white' : theme.colors.error} />
            <Text
              style={[
                styles.filterChipText,
                { color: filterType === 'expense' ? 'white' : theme.colors.text },
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>
          
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.filterChip,
                selectedCategory === category.id && { backgroundColor: category.color },
              ]}
              onPress={() => {
                if (selectedCategory === category.id) {
                  setSelectedCategory(null);
                } else {
                  setSelectedCategory(category.id);
                }
              }}
            >
              <Text style={styles.categoryChipEmoji}>{category.icon || '💰'}</Text>
              <Text
                style={[
                  styles.filterChipText,
                  { color: selectedCategory === category.id ? 'white' : theme.colors.text },
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {groupedTransactions.length > 0 ? (
        <FlatList
          data={groupedTransactions}
          renderItem={renderDateGroup}
          keyExtractor={item => item.date}
          contentContainerStyle={styles.transactionsList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No transactions found
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filtersContainer: {
    marginVertical: 10,
  },
  filtersScroll: {
    paddingHorizontal: 20,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryChipEmoji: {
    marginRight: 4,
    fontSize: 14,
  },
  transactionsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateTotal: {
    fontSize: 14,
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 20,
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionAccount: {
    fontSize: 12,
    marginTop: 4,
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionTime: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});