import toast from "react-hot-toast";
import apiService from "./service-utils";
import { addAllAccount, addAllTransactions } from "../slices/user-details";
import { store } from "../store";

export function getCurrencySymbol(code: string, Currency: any) {
  const currency = Currency.find((currency: any) => currency.code === code);
  return currency ? currency.symbol : "NA";
}

export function convertToTitleCase(str: string) {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const getBearerToken = (): string | null => {
  return localStorage.getItem("token");
};

export const setBearerToken = (token: string): void => {
  localStorage.setItem("token", token);
};

export const fetchTransactions = async () => {
  const toastPromise = toast.promise(apiService.get("/transaction/list"), {
    loading: "Refreshing...",
    success: (response) => {
      if (response.statusCode === 200) {
        store.dispatch(addAllTransactions(response?.data || []));
        return response.message;
      }
      throw new Error(response.message);
    },
    error: (err: any) => {
      return err?.message || "Transaction retrieval failed!";
    },
  });

  try {
    await toastPromise;
  } catch (error) {
    console.error(error);
  }
};

export const fetchAccounts = async () => {
  const toastPromise = toast.promise(apiService.get("/accounts/list"), {
    loading: "Refreshing...",
    success: (response) => {
      if (response.statusCode === 200) {
        store.dispatch(addAllAccount(response?.data || []));
        return response.message;
      }
      throw new Error(response.message);
    },
    error: (err: any) => {
      return err?.message || "Transaction retrieval failed!";
    },
  });

  try {
    await toastPromise;
  } catch (error) {
    console.error(error);
  }
};

export const formatDate = (
  date: string | number | Date,
  locale: string = "en-US",
  options?: Intl.DateTimeFormatOptions
): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "2-digit",
  };

  const formatOptions = options || defaultOptions;

  const dateObj = new Date(date);

  if (isNaN(dateObj.getTime())) {
    return "Invalid Date";
  }

  return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
};


export const debounce = (func: Function, delay: number) => {
  let timeoutId: any;
  return (...args: any[]) => {
      if (timeoutId) {
          clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
          func(...args);
      }, delay);
  };
};
