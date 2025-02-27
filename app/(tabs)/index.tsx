import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import { ArrowUpRight, ArrowDownRight, Wallet, CreditCard, Bank, Landmark } from 'lucide-react-native';
import { format } from 'date-fns';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

export default function HomeScreen() {
  const { theme } = useTheme();
  const { accounts, transactions, categories, budgets } = useData();
  const screenWidth = Dimensions.get('window').width;

  // Calculate total balance
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  // Calculate income and expenses for the current month
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const monthlyTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });

  const income = monthlyTransactions
    .filter(transaction => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const expenses = monthlyTransactions
    .filter(transaction => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  // Get recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Prepare data for the chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const chartData = {
    labels: last7Days.map(date => format(date, 'dd/MM')),
    datasets: [
      {
        data: last7Days.map(date => {
          const dayTransactions = transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate.getDate() === date.getDate() &&
                   transactionDate.getMonth() === date.getMonth() &&
                   transactionDate.getFullYear() === date.getFullYear() &&
                   transaction.type === 'expense';
          });
          return dayTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
        }),
        color: (opacity = 1) => theme.colors.primary,
        strokeWidth: 2
      }
    ],
  };

  // Calculate budget progress
  const budgetProgress = budgets.map(budget => {
    const categoryTransactions = transactions.filter(transaction => 
      transaction.categoryId === budget.categoryId &&
      transaction.type === 'expense' &&
      new Date(transaction.date).getMonth() === currentMonth &&
      new Date(transaction.date).getFullYear() === currentYear
    );
    
    const spent = categoryTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    const percentage = Math.min((spent / budget.amount) * 100, 100);
    
    return {
      ...budget,
      spent,
      percentage
    };
  });

  const getAccountIcon = (type) => {
    switch (type) {
      case 'cash':
        return <Wallet size={24} color={theme.colors.text} />;
      case 'card':
        return <CreditCard size={24} color={theme.colors.text} />;
      case 'bank':
        return <Bank size={24} color={theme.colors.text} />;
      default:
        return <Landmark size={24} color={theme.colors.text} />;
    }
  };

  const getCategoryById = (id) => {
    return categories.find(category => category.id === id) || { name: 'Uncategorized', color: '#888888' };
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: theme.colors.text }]}>
            Hello there!
          </Text>
          <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
            {format(new Date(), 'EEEE, MMMM do')}
          </Text>
        </View>

        <View style={[styles.balanceCard, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>${totalBalance.toFixed(2)}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <ArrowUpRight size={16} color="white" />
              </View>
              <View>
                <Text style={styles.statLabel}>Income</Text>
                <Text style={styles.statValue}>${income.toFixed(2)}</Text>
              </View>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                <ArrowDownRight size={16} color="white" />
              </View>
              <View>
                <Text style={styles.statLabel}>Expenses</Text>
                <Text style={styles.statValue}>${expenses.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Accounts</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.accountsContainer}>
            {accounts.map((account, index) => (
              <View 
                key={account.id} 
                style={[
                  styles.accountCard, 
                  { backgroundColor: theme.colors.card, marginRight: index === accounts.length - 1 ? 20 : 10 }
                ]}
              >
                <View style={styles.accountHeader}>
                  {getAccountIcon(account.type)}
                  <Text style={[styles.accountName, { color: theme.colors.text }]}>{account.name}</Text>
                </View>
                <Text style={[styles.accountBalance, { color: theme.colors.text }]}>
                  ${account.balance.toFixed(2)}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Spending Overview</Text>
          <View style={[styles.chartContainer, { backgroundColor: theme.colors.card }]}>
            <LineChart
              data={chartData}
              width={screenWidth - 40}
              height={180}
              chartConfig={{
                backgroundColor: theme.colors.card,
                backgroundGradientFrom: theme.colors.card,
                backgroundGradientTo: theme.colors.card,
                decimalPlaces: 0,
                color: (opacity = 1) => theme.colors.primary,
                labelColor: (opacity = 1) => theme.colors.text,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: theme.colors.primary,
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAll, { color: theme.colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          {recentTransactions.map(transaction => {
            const category = getCategoryById(transaction.categoryId);
            return (
              <View key={transaction.id} style={[styles.transactionItem, { backgroundColor: theme.colors.card }]}>
                <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                  <Text style={[styles.categoryEmoji, { color: category.color }]}>
                    {category.icon || '💰'}
                  </Text>
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={[styles.transactionName, { color: theme.colors.text }]}>{transaction.description}</Text>
                  <Text style={[styles.transactionDate, { color: theme.colors.textSecondary }]}>
                    {format(new Date(transaction.date), 'MMM dd, yyyy')}
                  </Text>
                </View>
                <Text 
                  style={[
                    styles.transactionAmount, 
                    { color: transaction.type === 'expense' ? theme.colors.error : theme.colors.success }
                  ]}
                >
                  {transaction.type === 'expense' ? '-' : '+'}${transaction.amount.toFixed(2)}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Budget Progress</Text>
          {budgetProgress.slice(0, 3).map(budget => {
            const category = getCategoryById(budget.categoryId);
            return (
              <View key={budget.id} style={[styles.budgetItem, { backgroundColor: theme.colors.card }]}>
                <View style={styles.budgetHeader}>
                  <View style={styles.budgetInfo}>
                    <Text style={[styles.budgetName, { color: theme.colors.text }]}>{category.name}</Text>
                    <Text style={[styles.budgetValues, { color: theme.colors.textSecondary }]}>
                      ${budget.spent.toFixed(2)} / ${budget.amount.toFixed(2)}
                    </Text>
                  </View>
                  <Text style={[styles.budgetPercentage, { color: theme.colors.text }]}>
                    {budget.percentage.toFixed(0)}%
                  </Text>
                </View>
                <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${budget.percentage}%`, 
                        backgroundColor: budget.percentage > 90 ? theme.colors.error : theme.colors.primary 
                      }
                    ]} 
                  />
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
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
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    marginTop: 4,
  },
  balanceCard: {
    margin: 20,
    borderRadius: 16,
    padding: 20,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  balanceAmount: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  statValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  seeAll: {
    fontSize: 14,
  },
  accountsContainer: {
    paddingLeft: 20,
  },
  accountCard: {
    width: 150,
    padding: 16,
    borderRadius: 16,
    marginRight: 10,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  accountName: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  accountBalance: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  chartContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
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
  transactionDate: {
    fontSize: 12,
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  budgetItem: {
    padding: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetInfo: {
    flex: 1,
  },
  budgetName: {
    fontSize: 16,
    fontWeight: '500',
  },
  budgetValues: {
    fontSize: 12,
    marginTop: 2,
  },
  budgetPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
});