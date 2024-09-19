import { createSlice, PayloadAction, nanoid } from "@reduxjs/toolkit";

interface Balance {
  [currencyCode: string]: number;
}

interface Transaction {
  account_id?: string;
  account_from?: string;
  account_to?: string;
  transaction_id: string;
  amount: number;
  transaction_type: "income" | "expense" | "transfer_in" | string;
  date: string;
  description: string;
  tags: string[];
  related_source: string | null;
  related_currency: string;
  hide?: boolean;
}

interface Account {
  group: string;
  name: string;
  id: string;
  balance: Balance;
  currencies: string[];
}

interface Settings {
  currency: {
    base: string;
    secondary: string[];
  };
  exchangeRate: {
    [key: string]: number;
  };
}

interface TransactionPayload {
  id: string;
  currencyCode: string;
  amount: number;
  description: string;
  tags: string[];
  date: any;
}

export interface TransferPayload {
  fromAccountID: string;
  fromCurrencyCode: string;
  toAccountID: string;
  amount: number;
  description?: string;
  tags: string[];
  date: string;
}

interface UserState {
  accounts: Account[];
  settings: Settings[];
  transactions: Transaction[];
  total_balance: number;
  total_income: number;
  total_expenses: number;
}

const initialState: UserState = {
  accounts: [],
  settings: [],
  transactions: [],
  total_balance: 0,
  total_income: 0,
  total_expenses: 0,
};

export interface AddAccountPayload {
  group: string;
  name: string;
  balance: Balance;
  currencies: string[];
}

export interface EditAccountPayload {
  id: string;
  group?: string;
  name?: string;
  balance?: Balance;
  currencies?: string[];
}

export const userDataSlice = createSlice({
  name: "user_expense",
  initialState,
  reducers: {
    addIncome: (state, action: PayloadAction<TransactionPayload>) => {
      const { currencyCode, amount, description, tags, id, date } =
        action.payload;
      const account = state.accounts.find((acc) => acc.id === id);
      const currencyBalance = account?.balance[currencyCode];

      if (account && currencyBalance !== undefined) {
        account.balance[currencyCode] += amount;

        state.transactions?.push({
          account_id: id,
          transaction_id: nanoid(),
          amount,
          transaction_type: "income",
          date: new Date(date).toISOString().split("T")[0],
          description,
          tags,
          related_source: null,
          related_currency: currencyCode,
        });

        state.total_balance += amount;
        state.total_income += amount;
      }
    },

    addExpense: (state, action: PayloadAction<TransactionPayload>) => {
      const { currencyCode, amount, description, tags, id, date } =
        action.payload;
      const account = state.accounts.find((acc) => acc.id === id);
      const currencyBalance = account?.balance[currencyCode];

      if (account && currencyBalance !== undefined) {
        account.balance[currencyCode] -= amount;

        state.transactions?.push({
          account_id: id,
          transaction_id: nanoid(),
          amount: -amount,
          transaction_type: "expense",
          date: new Date(date).toISOString().split("T")[0],
          description,
          tags,
          related_source: null,
          related_currency: currencyCode,
        });

        state.total_balance -= amount;
        state.total_expenses += amount;
      }
    },

    transferMoney: (state, action: PayloadAction<TransferPayload>) => {
      const {
        fromAccountID,
        fromCurrencyCode,
        toAccountID,
        amount,
        description,
        tags,
        date,
      } = action.payload;

      const fromAccount = state.accounts.find(
        (acc) => acc.id === fromAccountID
      );
      const toAccount = state.accounts.find((acc) => acc.id === toAccountID);

      const fromCurrencyBalance = fromAccount?.balance[fromCurrencyCode];

      if (fromAccount && toAccount && fromCurrencyBalance !== undefined) {
        fromAccount.balance[fromCurrencyCode] -= amount;

        if (toAccount.balance[fromCurrencyCode] !== undefined) {
          toAccount.balance[fromCurrencyCode] += amount;
        } else {
          toAccount.balance[fromCurrencyCode] = amount;
        }
        state.transactions?.push({
          account_from: fromAccountID,
          account_to: toAccountID,
          transaction_id: nanoid(),
          amount,
          transaction_type: "transfer_in",
          date: new Date(date).toISOString().split("T")[0],
          description: description || `Transfer from ${fromAccountID}`,
          tags,
          related_source: fromAccountID,
          related_currency: fromCurrencyCode,
        });
      }
    },

    editTransaction: (state, action: PayloadAction<TransactionPayload>) => {
      const { id, currencyCode, amount, description, tags, date } =
        action.payload;

      const existingTransaction = state.transactions.find(
        (transaction) => transaction.transaction_id === id
      );

      if (existingTransaction) {
        const account = state.accounts.find(
          (acc) => acc.id === existingTransaction.account_id
        );
        const fromAccount = state.accounts.find(
          (acc) => acc.id === existingTransaction.account_from
        );
        const toAccount = state.accounts.find(
          (acc) => acc.id === existingTransaction.account_to
        );

        const revertOldBalances = () => {
          if (existingTransaction.transaction_type === "income") {
            account?.balance[currencyCode] !== undefined &&
              (account.balance[currencyCode] -= existingTransaction.amount);
            state.total_income -= existingTransaction.amount;
          } else if (existingTransaction.transaction_type === "expense") {
            account?.balance[currencyCode] !== undefined &&
              (account.balance[currencyCode] += Math.abs(
                existingTransaction.amount
              ));
            state.total_expenses -= Math.abs(existingTransaction.amount);
          } else if (existingTransaction.transaction_type === "transfer_in") {
            fromAccount?.balance[currencyCode] !== undefined &&
              (fromAccount.balance[currencyCode] += existingTransaction.amount);
            toAccount?.balance[currencyCode] !== undefined &&
              (toAccount.balance[currencyCode] -= existingTransaction.amount);
          }
        };

        revertOldBalances();

        existingTransaction.amount =
          existingTransaction.transaction_type === "expense" ? -amount : amount;
        existingTransaction.date = new Date(date).toISOString().split("T")[0];
        existingTransaction.description = description;
        existingTransaction.tags = tags;
        existingTransaction.related_currency = currencyCode;

        if (existingTransaction.transaction_type === "income") {
          account?.balance[currencyCode] !== undefined &&
            (account.balance[currencyCode] += amount);
          state.total_income += amount;
        } else if (existingTransaction.transaction_type === "expense") {
          account?.balance[currencyCode] !== undefined &&
            (account.balance[currencyCode] -= Math.abs(amount));
          state.total_expenses += Math.abs(amount);
        } else if (existingTransaction.transaction_type === "transfer_in") {
          fromAccount?.balance[currencyCode] !== undefined &&
            (fromAccount.balance[currencyCode] -= amount);
          toAccount?.balance[currencyCode] !== undefined &&
            (toAccount.balance[currencyCode] += amount);
        }

        state.total_balance = state.accounts.reduce((total, account) => {
          return (
            total +
            Object.values(account.balance).reduce(
              (accTotal, balance) => accTotal + balance,
              0
            )
          );
        }, 0);
      }
    },

    addAccount: (state, action: PayloadAction<AddAccountPayload>) => {
      const { group, name, balance, currencies } = action.payload;
      let acc_id = nanoid();
      state.accounts.push({
        group,
        name,
        id: acc_id,
        balance,
        currencies,
      });

      const new_transactions = Object.entries(balance)?.map(
        ([key, value]: [string, number]) => ({
          account_id: acc_id,
          transaction_id: nanoid(),
          amount: value,
          transaction_type: "income",
          date: new Date().toISOString().split("T")[0],
          description: "",
          tags: ["Initial deposit"],
          related_source: null,
          related_currency: key,
          hide: true,
        })
      );

      state.transactions?.push(...new_transactions);
    },

    editAccount: (state, action: PayloadAction<EditAccountPayload>) => {
      const { id, group, name, balance, currencies } = action.payload;

      const account = state.accounts.find((acc) => acc.id === id);

      if (account) {
        if (group !== undefined) account.group = group;
        if (name !== undefined) account.name = name;
        if (balance !== undefined) account.balance = balance;
        if (currencies !== undefined) account.currencies = currencies;
      }
    },

    removeAllAccount: () => initialState,

    downloadStateJSON: (state) => {
      const data = {
        accounts: state?.accounts,
        transactions: state?.transactions,
      };
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Moneyfye.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
  },
});

export const {
  addIncome,
  addExpense,
  transferMoney,
  editTransaction,
  addAccount,
  editAccount,
  removeAllAccount,
  downloadStateJSON,
} = userDataSlice.actions;
export default userDataSlice.reducer;
