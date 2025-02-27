import React, { createContext, useContext, useState } from 'react';

// Define types
type TransactionType = 'income' | 'expense';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  categoryId: string;
  accountId: string;
  notes?: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  parentId?: string;
}

interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'card' | 'investment';
  balance: number;
  color?: string;
  icon?: string;
}

interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
}

interface DataContextType {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  budgets: Budget[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, account: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
}

// Create context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Sample data
const sampleCategories: Category[] = [
  { id: '1', name: 'Food & Dining', icon: '🍔', color: '#FF5733' },
  { id: '2', name: 'Transportation', icon: '🚗', color: '#33A8FF' },
  { id: '3', name: 'Entertainment', icon: '🎬', color: '#A833FF' },
  { id: '4', name: 'Shopping', icon: '🛍️', color: '#FF33A8' },
  { id: '5', name: 'Housing', icon: '🏠', color: '#33FF57' },
  { id: '6', name: 'Utilities', icon: '💡', color: '#FFD133' },
  { id: '7', name: 'Healthcare', icon: '🏥', color: '#33FFF5' },
  { id: '8', name: 'Salary', icon: '💰', color: '#5733FF' },
  { id: '9', name: 'Investments', icon: '📈', color: '#33FF8A' },
  { id: '10', name: 'Gifts', icon: '🎁', color: '#FF3357' },
];

const sampleAccounts: Account[] = [
  { id: '1', name: 'Cash', type: 'cash', balance: 500 },
  { id: '2', name: 'Bank Account', type: 'bank', balance: 2500 },
  { id: '3', name: 'Credit Card', type: 'card', balance: -350 },
];

const sampleBudgets: Budget[] = [
  { id: '1', categoryId: '1', amount: 500, period: 'monthly', startDate: '2023-01-01' },
  { id: '2', categoryId: '2', amount: 300, period: 'monthly', startDate: '2023-01-01' },
  { id: '3', categoryId: '3', amount: 200, period: 'monthly', startDate: '2023-01-01' },
];

// Generate sample transactions for the last 3 months
const generateSampleTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const now = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(now.getMonth() - 3);
  
  // Generate random transactions
  for (let i = 0; i < 100; i++) {
    const date = new Date(
      threeMonthsAgo.getTime() + Math.random() * (now.getTime() - threeMonthsAgo.getTime())
    );
    
    const type: TransactionType = Math.random() > 0.3 ? 'expense' : 'income';
    const categoryId = type === 'income' 
      ? ['8', '9', '10'][Math.floor(Math.random() * 3)] 
      : ['1', '2', '3', '4', '5', '6', '7'][Math.floor(Math.random() * 7)];
    
    const accountId = ['1', '2', '3'][Math.floor(Math.random() * 3)];
    
    const amount = type === 'income'
      ? Math.floor(Math.random() * 1000) + 500
      : Math.floor(Math.random() * 200) + 10;
    
    const descriptions = {
      '1': ['Grocery shopping', 'Restaurant', 'Coffee shop', 'Fast food'],
      '2': ['Gas', 'Uber ride', 'Bus ticket', 'Car maintenance'],
      '3': ['Movie tickets', 'Concert', 'Streaming subscription', 'Video games'],
      '4': ['Clothes', 'Electronics', 'Home goods', 'Online shopping'],
      '5': ['Rent', 'Mortgage', 'Home repairs', 'Furniture'],
      '6': ['Electricity bill', 'Water bill', 'Internet bill', 'Phone bill'],
      '7': ['Doctor visit', 'Pharmacy', 'Health insurance', 'Gym membership'],
      '8': ['Salary', 'Bonus', 'Commission'],
      '9': ['Dividend', 'Interest', 'Stock sale'],
      '10': ['Birthday gift', 'Holiday gift', 'Cash gift'],
    };
    
    const description = descriptions[categoryId][Math.floor(Math.random() * descriptions[categoryId].length)];
    
    transactions.push({
      id: `transaction-${i}`,
      description,
      amount,
      date: date.toISOString(),
      type,
      categoryId,
      accountId,
    });
  }
  
  return transactions;
};

const sampleTransactions = generateSampleTransactions();

// Provider component
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(sampleTransactions);
  const [categories, setCategories] = useState<Category[]>(sampleCategories);
  const [accounts, setAccounts] = useState<Account[]>(sampleAccounts);
  const [budgets, setBudgets] = useState<Budget[]>(sampleBudgets);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: `transaction-${Date.now()}`,
    };
    setTransactions([...transactions, newTransaction]);
    
    // Update account balance
    const account = accounts.find(a => a.id === transaction.accountId);
    if (account) {
      const balanceChange = transaction.type === 'income' ? transaction.amount : -transaction.amount;
      updateAccount(account.id, { balance: account.balance + balanceChange });
    }
  };

  const updateTransaction = (id: string, transaction: Partial<Transaction>) => {
    const oldTransaction = transactions.find(t => t.id === id);
    if (!oldTransaction) return;
    
    // If amount or type changed, update account balance
    if (
      (transaction.amount !== undefined && transaction.amount !== oldTransaction.amount) ||
      (transaction.type !== undefined && transaction.type !== oldTransaction.type) ||
      (transaction.accountId !== undefined && transaction.accountId !== oldTransaction.accountId)
    ) {
      // Revert old transaction effect on old account
      const oldAccount = accounts.find(a => a.id === oldTransaction.accountId);
      if (oldAccount) {
        const oldBalanceChange = oldTransaction.type === 'income' ? -oldTransaction.amount : oldTransaction.amount;
        updateAccount(oldAccount.id, { balance: oldAccount.balance + oldBalanceChange });
      }
      
      // Apply new transaction effect on new account
      const newAccountId = transaction.accountId || oldTransaction.accountId;
      const newAccount = accounts.find(a => a.id === newAccountId);
      if (newAccount) {
        const newType = transaction.type || oldTransaction.type;
        const newAmount = transaction.amount || oldTransaction.amount;
        const newBalanceChange = newType === 'income' ? newAmount : -newAmount;
        updateAccount(newAccount.id, { balance: newAccount.balance + newBalanceChange });
      }
    }
    
    setTransactions(
      transactions.map(t => (t.id === id ? { ...t, ...transaction } : t))
    );
  };

  const deleteTransaction = (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;
    
    // Update account balance
    const account = accounts.find(a => a.id === transaction.accountId);
    if (account) {
      const balanceChange = transaction.type === 'income' ? -transaction.amount : transaction.amount;
      updateAccount(account.id, { balance: account.balance + balanceChange });
    }
    
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory = {
      ...category,
      id: `category-${Date.now()}`,
    };
    setCategories([...categories, newCategory]);
  };

  const updateCategory = (id: string, category: Partial<Category>) => {
    setCategories(
      categories.map(c => (c.id === id ? { ...c, ...category } : c))
    );
  };

  const deleteCategory = (id: string) => {
    // Check if category is used in transactions
    const usedInTransactions = transactions.some(t => t.categoryId === id);
    if (usedInTransactions) {
      // Move transactions to uncategorized or handle as needed
      setTransactions(
        transactions.map(t => 
          t.categoryId === id ? { ...t, categoryId: 'uncategorized' } : t
        )
      );
    }
    
    // Check if category is used in budgets
    const usedInBudgets = budgets.some(b => b.categoryId === id);
    if (usedInBudgets) {
      // Delete related budgets
      setBudgets(budgets.filter(b => b.categoryId !== id));
    }
    
    setCategories(categories.filter(c => c.id !== id));
  };

  const addAccount = (account: Omit<Account, 'id'>) => {
    const newAccount = {
      ...account,
      id: `account-${Date.now()}`,
    };
    setAccounts([...accounts, newAccount]);
  };

  const updateAccount = (id: string, account: Partial<Account>) => {
    setAccounts(
      accounts.map(a => (a.id === id ? { ...a, ...account } : a))
    );
  };

  const deleteAccount = (id: string) => {
    // Check if account is used in transactions
    const usedInTransactions = transactions.some(t => t.accountId === id);
    if (usedInTransactions) {
      // Move transactions to default account or handle as needed
      const defaultAccount = accounts.find(a => a.id !== id);
      if (defaultAccount) {
        setTransactions(
          transactions.map(t => 
            t.accountId === id ? { ...t, accountId: defaultAccount.id } : t
          )
        );
      } else {
        // If this is the last account, don't delete it
        return;
      }
    }
    
    setAccounts(accounts.filter(a => a.id !== id));
  };

  const addBudget = (budget: Omit<Budget, 'id'>) => {
    const newBudget = {
      ...budget,
      id: `budget-${Date.now()}`,
    };
    setBudgets([...budgets, newBudget]);
  };

  const updateBudget = (id: string, budget: Partial<Budget>) => {
    setBudgets(
      budgets.map(b => (b.id === id ? { ...b, ...budget } : b))
    );
  };

  const deleteBudget = (id: string) => {
    setBudgets(budgets.filter(b => b.id !== id));
  };

  return (
    <DataContext.Provider
      value={{
        transactions,
        categories,
        accounts,
        budgets,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        updateCategory,
        deleteCategory,
        addAccount,
        updateAccount,
        deleteAccount,
        addBudget,
        updateBudget,
        deleteBudget,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to use the data context
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};