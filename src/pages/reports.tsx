import { Select } from "antd";
import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts";
import { RootState } from "../store";
import dayjs from 'dayjs';
import PageHeader from "../components/page-header";

const { Option } = Select;

const Reports = () => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [years, setYears] = useState<number[]>([]);
    const transactions: any[] = useSelector((state: RootState) => state.transactions);

    const colors: Record<string, { income: string, expense: string }> = {
        "INR": { income: "#FF5733", expense: "#C70039" },
        "USD": { income: "#33A1FF", expense: "#0057A1" },
        "EUR": { income: "#FF33F6", expense: "#C700E6" },
        "JPY": { income: "#33FF49", expense: "#1E8C29" },
        "GBP": { income: "#FFD433", expense: "#D4A017" },
        "AUD": { income: "#336BFF", expense: "#1B40C9" },
        "CAD": { income: "#FF6F33", expense: "#C7461C" },
        "CHF": { income: "#33FFF3", expense: "#1EBAB6" },
        "CNY": { income: "#FF3380", expense: "#C7004C" },
        "NZD": { income: "#6AFF33", expense: "#3FC71E" },
        "SEK": { income: "#A833FF", expense: "#6F1EC7" },
    };

    const getMonthlyData = (year: number) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currencies = new Set<string>();
        const monthlyData: any[] = months.map(month => ({ month }));

        transactions.forEach(transaction => {
            const transactionDate = dayjs(transaction.date);
            if (transactionDate.year() === year) {
                currencies.add(transaction.related_currency);
            }
        });

        currencies.forEach(currency => {
            monthlyData.forEach(data => {
                data[`income_${currency}`] = 0;
                data[`expenses_${currency}`] = 0;
                data[`netWorth_${currency}`] = 0;  // Add net worth field
            });
        });

        transactions.forEach(transaction => {
            const transactionDate = dayjs(transaction.date);
            if (transactionDate.year() === year) {
                const monthIndex = transactionDate.month();
                const amount = transaction.amount;
                const currency = transaction.related_currency;

                if (transaction.transaction_type === 'expense') {
                    monthlyData[monthIndex][`expenses_${currency}`] = (monthlyData[monthIndex][`expenses_${currency}`] || 0) - Math.abs(amount);
                } else if (transaction.transaction_type === 'income') {
                    monthlyData[monthIndex][`income_${currency}`] = (monthlyData[monthIndex][`income_${currency}`] || 0) + amount;
                }
            }
        });

        // Calculate net worth for each currency
        monthlyData.forEach(data => {
            currencies.forEach(currency => {
                const income = data[`income_${currency}`] || 0;
                const expenses = data[`expenses_${currency}`] || 0;
                data[`netWorth_${currency}`] = income - Math.abs(expenses);
            });
        });

        return monthlyData;
    };

    const monthlyData = useMemo(() => getMonthlyData(selectedYear), [selectedYear, transactions]);

    useEffect(() => {
        const currentYear = new Date().getFullYear();
        const startYear = 1999;
        const endYear = currentYear + 5;
        const _years: number[] = [];
        for (let year = startYear; year <= endYear; year++) {
            _years.unshift(year);
        }
        setYears(_years);
    }, []);

    const handleChange = (value: number) => {
        setSelectedYear(value);
    };

    const uniqueCurrencies = useMemo(() => {
        const currencies = new Set<string>();
        transactions.forEach(transaction => {
            currencies.add(transaction.related_currency);
        });
        return Array.from(currencies);
    }, [transactions]);


    return (
        <div className="h-full">
            <div className="flex flex-row justify-between gap-2">
            <PageHeader>Reports</PageHeader>
                <Select value={selectedYear} style={{ width: 120 }} onChange={handleChange}>
                    {years.map(year => (
                        <Option key={year} value={year}>
                            {year}
                        </Option>
                    ))}
                </Select>
            </div>

            <div className="mb-8 md:md:w-4/5">
                <div className="text-stone-500 mb-4">Monthly Income and Expenses</div>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={monthlyData}
                        margin={{
                            top: 5, right: 30, left: 20, bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
                            formatter={(value: any, name: any) => {
                                const currencyCode = name.split('_')[1];
                                if (!currencyCode) return [value, name];
                                const formattedValue = new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: currencyCode,
                                }).format(value);
                                return [formattedValue, name];
                            }}
                        />
                        <Legend />

                        {uniqueCurrencies.map(currency => (
                            <Bar
                                key={`income_${currency}`}
                                dataKey={`income_${currency}`}
                                fill={colors[currency]?.income || "#8884d8"}
                                name={`Income ${currency}`}
                                stroke="darkgreen"
                            />
                        ))}

                        {uniqueCurrencies.map(currency => (
                            <Bar
                                key={`expenses_${currency}`}
                                dataKey={`expenses_${currency}`}
                                fill={colors[currency]?.expense || "#82ca9d"}
                                name={`Expenses ${currency}`}
                                stroke="red"
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="md:w-4/5">
                <div className="text-base text-stone-500 mb-4">Monthly Net Worth</div>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={monthlyData}
                        margin={{
                            top: 5, right: 30, left: 20, bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
                            formatter={(value: any, name: any) => {
                                const currencyCode = name.split('_')[1];
                                if (!currencyCode) return [value, name];
                                const formattedValue = new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: currencyCode,
                                }).format(value);
                                return [formattedValue, name];
                            }}
                        />
                        <Legend />

                        {uniqueCurrencies.map(currency => (
                            <Bar
                                key={`netWorth_${currency}`}
                                dataKey={`netWorth_${currency}`}
                                fill={colors[currency]?.income || "#FFC658"}
                                name={`Net Worth ${currency}`}
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Reports;
