import { createSlice, PayloadAction, nanoid } from "@reduxjs/toolkit";

interface Balance {
  [currency_code: string]: number;
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
  transaction_id: string;
  currency_code: string;
  amount: number;
  description: string;
  tags: string[];
  date: any;
}

export interface TransferPayload {
  from_account_id: string;
  transaction_id: string;
  from_currency_code: string;
  to_account_id: string;
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
  trigger_transaction: string;
  trigger_accounts:string;
  username?:string;
}

const initialState: UserState = {
  accounts: [],
  settings: [],
  transactions: [],
  total_balance: 0,
  total_income: 0,
  total_expenses: 0,
  trigger_transaction:"",
  trigger_accounts:"",
  username:""
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
      const {
        currency_code,
        amount,
        description,
        tags,
        id,
        date,
        transaction_id,
      } = action.payload;
      const account = state.accounts.find((acc) => acc.id === id);
      const currencyBalance = account?.balance[currency_code];

      if (account && currencyBalance !== undefined) {
        account.balance[currency_code] += amount;

        state.transactions?.push({
          account_id: id,
          transaction_id,
          amount,
          transaction_type: "income",
          date: new Date(date).toISOString().split("T")[0],
          description,
          tags,
          related_source: null,
          related_currency: currency_code,
        });

        state.total_balance += amount;
        state.total_income += amount;
      }
    },

    addExpense: (state, action: PayloadAction<TransactionPayload>) => {
      const {
        currency_code,
        amount,
        description,
        tags,
        id,
        date,
        transaction_id,
      } = action.payload;
      const account = state.accounts.find((acc) => acc.id === id);
      const currencyBalance = account?.balance[currency_code];

      if (account && currencyBalance !== undefined) {
        account.balance[currency_code] -= amount;

        state.transactions?.push({
          account_id: id,
          transaction_id,
          amount: -amount,
          transaction_type: "expense",
          date: new Date(date).toISOString().split("T")[0],
          description,
          tags,
          related_source: null,
          related_currency: currency_code,
        });

        state.total_balance -= amount;
        state.total_expenses += amount;
      }
    },

    transferMoney: (state, action: PayloadAction<TransferPayload>) => {
      const {
        from_account_id,
        from_currency_code,
        to_account_id,
        amount,
        description,
        tags,
        date,
        transaction_id,
      } = action.payload;

      const fromAccount = state.accounts.find(
        (acc) => acc.id === from_account_id
      );
      const toAccount = state.accounts.find((acc) => acc.id === to_account_id);

      const fromCurrencyBalance = fromAccount?.balance[from_currency_code];

      if (fromAccount && toAccount && fromCurrencyBalance !== undefined) {
        fromAccount.balance[from_currency_code] -= amount;

        if (toAccount.balance[from_currency_code] !== undefined) {
          toAccount.balance[from_currency_code] += amount;
        } else {
          toAccount.balance[from_currency_code] = amount;
        }
        state.transactions?.push({
          account_from: from_account_id,
          account_to: to_account_id,
          transaction_id,
          amount,
          transaction_type: "transfer_in",
          date: new Date(date).toISOString().split("T")[0],
          description: description || `Transfer from ${from_account_id}`,
          tags,
          related_source: from_account_id,
          related_currency: from_currency_code,
        });
      }
    },

    editTransaction: (state, action: PayloadAction<TransactionPayload>) => {
      const { transaction_id, currency_code, amount, description, tags, date } =
        action.payload;

      const existingTransaction = state.transactions.find(
        (transaction) => transaction.transaction_id === transaction_id
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
            account?.balance[currency_code] !== undefined &&
              (account.balance[currency_code] -= existingTransaction.amount);
            state.total_income -= existingTransaction.amount;
          } else if (existingTransaction.transaction_type === "expense") {
            account?.balance[currency_code] !== undefined &&
              (account.balance[currency_code] += Math.abs(
                existingTransaction.amount
              ));
            state.total_expenses -= Math.abs(existingTransaction.amount);
          } else if (existingTransaction.transaction_type === "transfer_in") {
            fromAccount?.balance[currency_code] !== undefined &&
              (fromAccount.balance[currency_code] +=
                existingTransaction.amount);
            toAccount?.balance[currency_code] !== undefined &&
              (toAccount.balance[currency_code] -= existingTransaction.amount);
          }
        };

        revertOldBalances();

        existingTransaction.amount =
          existingTransaction.transaction_type === "expense" ? -amount : amount;
        existingTransaction.date = new Date(date).toISOString().split("T")[0];
        existingTransaction.description = description;
        existingTransaction.tags = tags;
        existingTransaction.related_currency = currency_code;

        if (existingTransaction.transaction_type === "income") {
          account?.balance[currency_code] !== undefined &&
            (account.balance[currency_code] += amount);
          state.total_income += amount;
        } else if (existingTransaction.transaction_type === "expense") {
          account?.balance[currency_code] !== undefined &&
            (account.balance[currency_code] -= Math.abs(amount));
          state.total_expenses += Math.abs(amount);
        } else if (existingTransaction.transaction_type === "transfer_in") {
          fromAccount?.balance[currency_code] !== undefined &&
            (fromAccount.balance[currency_code] -= amount);
          toAccount?.balance[currency_code] !== undefined &&
            (toAccount.balance[currency_code] += amount);
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

    addName:(state,action)=>{
      state.username = action.payload;
    },

    addAllAccount: (state, action) => {
      state.accounts = action.payload;
    },

    addAllTransactions: (state, action) => {
      state.transactions = action.payload;
    },

    appendTransaction:(state, action)=>{
      state.transactions.push({...action.payload})
    },

    triggerTransaction:(state)=>{
      state.trigger_transaction = nanoid();
    },

    triggerAccount:(state)=>{
      state.trigger_accounts = nanoid();
    }
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
  addAllAccount,
  addAllTransactions,
  appendTransaction,
  triggerAccount,
  triggerTransaction,
  addName
} = userDataSlice.actions;
export default userDataSlice.reducer;
