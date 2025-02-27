import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import { useState } from 'react';
import { PieChart, LineChart, BarChart } from 'react-native-chart-kit';
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, subWeeks, startOfWeek, endOfWeek, subYears, startOfYear, endOfYear } from 'date-fns';

export default function StatsScreen() {
  const { theme } = useTheme();
  const { transactions, categories } = useData();
  const [timeframe, setTimeframe] = useState('month'); // 'week', 'month', 'year'
  const screenWidth = Dimensions.get('window').width;

  // Get date ranges based on selected timeframe
  const currentDate = new Date();
  let startDate, endDate, dateFormat, intervalStep;
  
  if (timeframe === 'week') {
    startDate = startOfWeek(currentDate);
    endDate = endOfWeek(currentDate);
    dateFormat = 'EEE';
    intervalStep = 1; // days
  } else if (timeframe === 'month') {
    startDate = startOfMonth(currentDate);
    endDate = endOfMonth(currentDate);
    dateFormat = 'd';
    intervalStep = 2; // every other day
  } else { // year
    startDate = startOfYear(currentDate);
    endDate = endOfYear(currentDate);
    dateFormat = 'MMM';
    intervalStep = 1; // months
  }

  // Filter transactions for selected timeframe
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate >= startDate && transactionDate <= endDate;
  });

  // Calculate total income and expenses
  const income = filteredTransactions
    .filter(transaction => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const expenses = filteredTransactions
    .filter(transaction => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  // Calculate expenses by category
  const expensesByCategory = categories.map(category => {
    const categoryTransactions = filteredTransactions.filter(
      transaction => transaction.categoryId === category.id && transaction.type === 'expense'
    );
    
    const amount = categoryTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    
    return {
      name: category.name,
      amount,
      color: category.color,
      legendFontColor: theme.colors.text,
      legendFontSize: 12,
      icon: category.icon || '💰'
    };
  }).filter(item => item.amount > 0);

  // Prepare data for the line chart (income vs expenses)
  let timeLabels = [];
  let incomeData = [];
  let expenseData = [];

  if (timeframe === 'week') {
    // Daily data for the week
    const daysInWeek = eachDayOfInterval({ start: startDate, end: endDate });
    
    timeLabels = daysInWeek.map(date => format(date, dateFormat));
    
    incomeData = daysInWeek.map(date => {
      const dayTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getDate() === date.getDate() &&
               transactionDate.getMonth() === date.getMonth() &&
               transactionDate.getFullYear() === date.getFullYear() &&
               transaction.type === 'income';
      });
      
      return dayTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    });
    
    expenseData = daysInWeek.map(date => {
      const dayTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getDate() === date.getDate() &&
               transactionDate.getMonth() === date.getMonth() &&
               transactionDate.getFullYear() === date.getFullYear() &&
               transaction.type === 'expense';
      });
      
      return dayTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    });
  } else if (timeframe === 'month') {
    // Daily data for the month (showing every other day for clarity)
    const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
    const filteredDays = daysInMonth.filter((_, index) => index % intervalStep === 0);
    
    timeLabels = filteredDays.map(date => format(date, dateFormat));
    
    incomeData = filteredDays.map(date => {
      const dayTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getDate() === date.getDate() &&
               transactionDate.getMonth() === date.getMonth() &&
               transactionDate.getFullYear() === date.getFullYear() &&
               transaction.type === 'income';
      });
      
      return dayTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    });
    
    expenseData = filteredDays.map(date => {
      const dayTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getDate() === date.getDate() &&
               transactionDate.getMonth() === date.getMonth() &&
               transactionDate.getFullYear() === date.getFullYear() &&
               transaction.type === 'expense';
      });
      
      return dayTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    });
  } else { // year
    // Monthly data for the year
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(currentDate.getFullYear(), i, 1);
      return date;
    });
    
    timeLabels = months.map(date => format(date, dateFormat));
    
    incomeData = months.map(date => {
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= monthStart && 
               transactionDate <= monthEnd &&
               transaction.type === 'income';
      });
      
      return monthTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    });
    
    expenseData = months.map(date => {
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= monthStart && 
               transactionDate <= monthEnd &&
               transaction.type === 'expense';
      });
      
      return monthTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    });
  }

  const compareData = {
    labels: timeLabels,
    datasets: [
      {
        data: incomeData,
        color: (opacity = 1) => theme.colors.success,
        strokeWidth: 2,
        legend: 'Income'
      },
      {
        data: expenseData,
        color: (opacity = 1) => theme.colors.error,
        strokeWidth: 2,
        legend: 'Expenses'
      }
    ],
    legend: ['Income', 'Expenses']
  };

  // Prepare data for the bar chart (expenses by day/month)
  const barData = {
    labels: timeLabels,
    datasets: [
      {
        data: expenseData,
        color: (opacity = 1) => theme.colors.primary,
      }
    ],
  };

  // Get timeframe title
  const getTimeframeTitle = () => {
    if (timeframe === 'week') {
      return format(startDate, 'MMMM d') + ' - ' + format(endDate, 'MMMM d, yyyy');
    } else if (timeframe === 'month') {
      return format(startDate, 'MMMM yyyy');
    } else {
      return format(startDate, 'yyyy');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Statistics</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {getTimeframeTitle()}
          </Text>
        </View>

        <View style={styles.timeframeSelector}>
          <TouchableOpacity
            style={[
              styles.timeframeButton,
              timeframe === 'week' && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setTimeframe('week')}
          >
            <Text
              style={[
                styles.timeframeButtonText,
                { color: timeframe === 'week' ? 'white' : theme.colors.text },
              ]}
            >
              Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.timeframeButton,
              timeframe === 'month' && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setTimeframe('month')}
          >
            <Text
              style={[
                styles.timeframeButtonText,
                { color: timeframe === 'month' ? 'white' : theme.colors.text },
              ]}
            >
              Month
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.timeframeButton,
              timeframe === 'year' && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setTimeframe('year')}
          >
            <Text
              style={[
                styles.timeframeButtonText,
                { color: timeframe === 'year' ? 'white' : theme.colors.text },
              ]}
            >
              Year
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Income</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
              +${income.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Expenses</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.error }]}>
              -${expenses.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Balance</Text>
            <Text 
              style={[
                styles.summaryValue, 
                { color: income - expenses >= 0 ? theme.colors.success : theme.colors.error }
              ]}
            >
              ${(income - expenses).toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Income vs Expenses</Text>
          <View style={[styles.chartContainer, { backgroundColor: theme.colors.card }]}>
            <LineChart
              data={compareData}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                backgroundColor: theme.colors.card,
                backgroundGradientFrom: theme.colors.card,
                backgroundGradientTo: theme.colors.card,
                decimalPlaces: 0,
                color: (opacity = 1) => theme.colors.text,
                labelColor: (opacity = 1) => theme.colors.textSecondary,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                },
                propsForLabels: {
                  fontSize: 10,
                },
                formatYLabel: (value) => `$${parseInt(value)}`,
              }}
              bezier
              style={styles.chart}
              withInnerLines={false}
              withOuterLines={false}
              withShadow={false}
              withDots={true}
              withVerticalLines={false}
              withHorizontalLines={true}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              fromZero={true}
              yAxisInterval={1}
              segments={4}
              legend={compareData.legend}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Expenses by Category</Text>
          {expensesByCategory.length > 0 ? (
            <View style={[styles.chartContainer, { backgroundColor: theme.colors.card }]}>
              <PieChart
                data={expensesByCategory}
                width={screenWidth - 40}
                height={220}
                chartConfig={{
                  color: (opacity = 1) => theme.colors.text,
                }}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
          ) : (
            <View style={[styles.emptyChart, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No expense data available
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {timeframe === 'week' ? 'Daily' : timeframe === 'month' ? 'Daily' : 'Monthly'} Expenses
          </Text>
          <View style={[styles.chartContainer, { backgroundColor: theme.colors.card }]}>
            <BarChart
              data={barData}
              width={screenWidth - 40}
              height={220}
              yAxisLabel="$"
              chartConfig={{
                backgroundColor: theme.colors.card,
                backgroundGradientFrom: theme.colors.card,
                backgroundGradientTo: theme.colors.card,
                decimalPlaces: 0,
                color: (opacity = 1) => theme.colors.primary,
                labelColor: (opacity = 1) => theme.colors.textSecondary,
                style: {
                  borderRadius: 16,
                },
                barPercentage: 0.6,
                propsForLabels: {
                  fontSize: 10,
                },
              }}
              style={styles.chart}
              withInnerLines={false}
              showBarTops={true}
              fromZero={true}
              segments={4}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Top Spending Categories</Text>
          {expensesByCategory.length > 0 ? (
            <View style={[styles.categoriesList, { backgroundColor: theme.colors.card }]}>
              {expensesByCategory
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 5)
                .map((category, index) => (
                  <View key={index} style={styles.categoryItem}>
                    <View style={styles.categoryInfo}>
                      <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                        <Text style={[styles.categoryEmoji, { color: category.color }]}>
                          {category.icon}
                        </Text>
                      </View>
                      <Text style={[styles.categoryName, { color: theme.colors.text }]}>
                        {category.name}
                      </Text>
                    </View>
                    <View style={styles.categoryAmountContainer}>
                      <Text style={[styles.categoryAmount, { color: theme.colors.text }]}>
                        ${category.amount.toFixed(2)}
                      </Text>
                      <Text style={[styles.categoryPercentage, { color: theme.colors.textSecondary }]}>
                        {((category.amount / expenses) * 100).toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                ))}
            </View>
          ) : (
            <View style={[styles.emptyChart, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No expense data available
              </Text>
            </View>
          )}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  timeframeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  timeframeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  timeframeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryCard: {
    margin: 20,
    borderRadius: 16,
    padding: 20,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    width: '100%',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 20,
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
  emptyChart: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  categoriesList: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 18,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryAmountContainer: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryPercentage: {
    fontSize: 12,
    marginTop: 2,
  },
});