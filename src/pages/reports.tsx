import { Select } from "antd";
import { useEffect, useState, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
  Line,
  LineChart,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import PageHeader from "../components/page-header";
import apiService from "../utils/service-utils";

const { Option } = Select;

const Reports = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [years, setYears] = useState<number[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const colors: Record<string, { income: string; expense: string }> = {
    INR: { income: "#FF5733", expense: "#C70039" },
    USD: { income: "#33A1FF", expense: "#0057A1" },
    EUR: { income: "#FF33F6", expense: "#C700E6" },
    JPY: { income: "#33FF49", expense: "#1E8C29" },
    AUD: { income: "#336BFF", expense: "#1B40C9" },
    CHF: { income: "#33FFF3", expense: "#1EBAB6" },
  };

  const fetchMonthlyData = async (year: number) => {
    setLoading(true);
    try {
      const response = await apiService.post(`/transaction/report`, { year: year });
      setMonthlyData(response.data);
    } catch (error) {
      console.error("Error fetching monthly data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyData(selectedYear);
  }, [selectedYear]);

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
    monthlyData.forEach(data => {
      Object.keys(data).forEach(key => {
        if (key.startsWith('income_') || key.startsWith('expenses_') || key.startsWith('netWorth_')) {
          const currency = key.split('_')[1];
          currencies.add(currency);
        }
      });
    });
    return Array.from(currencies);
  }, [monthlyData]);

  const transformedData = uniqueCurrencies.flatMap((currency) => {
    return monthlyData.map((data) => ({
      month: data.month,
      income: data[`income_${currency}`],
      expenses: data[`expenses_${currency}`],
      currency,
    }));
  });

  const incomeData = uniqueCurrencies.map((currency) => ({
    name: currency,
    value: monthlyData.reduce((acc, curr) => acc + (curr[`income_${currency}`] || 0), 0),
  }));

  const totalExpenses = uniqueCurrencies.map((currency) => 
    monthlyData.reduce((acc, curr) => acc + (curr[`expenses_${currency}`] || 0), 0)
  );

  const expenseData = totalExpenses.some(total => total > 0) ? 
    uniqueCurrencies.map((currency) => ({
      name: currency,
      value: monthlyData.reduce((acc, curr) => acc + (curr[`expenses_${currency}`] || 0), 0),
    })) 
    : [{ name: 'No Expenses', value: 1 }]; // Default entry for no expenses

  return (
    <div className="h-full">
      <div className="flex flex-row gap-4">
        <PageHeader>Reports</PageHeader>
        <Select value={selectedYear} style={{ width: 140 }} onChange={handleChange}>
          {years.map(year => (
            <Option key={year} value={year}>
              {year}
            </Option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {monthlyData.length === 0 ? (
            <div>No transactions found.</div>
          ) : (
            <>
              <div className="mb-8">
                <div className="text-lg text-stone-500 mb-4">Monthly Income and Expenses</div>
                {transformedData.length === 0 ? (
                  <div>No data available for the selected year.</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={transformedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: any, name: any) => {
                          const currency_code = name.split('_')[1];
                          if (!currency_code) return [value, name];
                          const formattedValue = new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: currency_code,
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
                )}
              </div>

              <div className="flex gap-4">
                <div className="w-full">
                  <div className="text-lg text-stone-500 mb-4">Monthly Net Worth</div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: any, name: any) => {
                          const currency_code = name.split('_')[1];
                          if (!currency_code) return [value, name];
                          const formattedValue = new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: currency_code,
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

                <div className="w-full">
                  <div className="text-base text-stone-500 mb-4">Monthly Income & Expenses (Line Chart)</div>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: any, name: any) => {
                          const currency_code = name.split('_')[1];
                          if (!currency_code) return [value, name];
                          const formattedValue = new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: currency_code,
                          }).format(value);
                          return [formattedValue, name];
                        }}
                      />
                      <Legend />
                      {uniqueCurrencies.map(currency => (
                        <Line
                          key={`income_${currency}`}
                          type="monotone"
                          dataKey={`income_${currency}`}
                          stroke={colors[currency]?.income || "#82ca9d"}
                          name={`Income ${currency}`}
                          dot={false}
                        />
                      ))}
                      {uniqueCurrencies.map(currency => (
                        <Line
                          key={`expenses_${currency}`}
                          type="monotone"
                          dataKey={`expenses_${currency}`}
                          stroke={colors[currency]?.expense || "#FF5733"}
                          name={`Expenses ${currency}`}
                          dot={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="gap-4 mt-8 flex flex-row">
                <div className="w-full">
                  <div className="text-lg text-stone-500 mb-4">Income Distribution</div>
                  {incomeData.length === 0 ? (
                    <div>No income data available.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={incomeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#82ca9d">
                          {incomeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[entry.name]?.income || "#8884d8"} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="w-full">
                  <div className="text-lg text-stone-500 mb-4">Expense Distribution</div>
                  {expenseData.length === 0 ? (
                    <div>No expense data available.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={expenseData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#FF5733">
                          {expenseData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[entry.name]?.expense || "#8884d8"} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;
