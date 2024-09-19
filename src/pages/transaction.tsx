import { Button, Divider, List, Tag } from "antd";
import { CirclePlus } from "lucide-react";
import { DatePicker } from 'antd';
import { useCallback, useEffect, useMemo, useState } from "react";
import FormModal from "../components/form-modal";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import PageHeader from "../components/page-header";

const { RangePicker } = DatePicker;

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const dateFormat = 'YYYY-MM-DD';

interface Transaction {
    id: string;
    date: string;
    transaction_type: string;
    account_from?: string;
    account_to?: string;
    account_id: string;
    amount: number;
    related_currency: string;
    tags: string[];
    hide?: boolean;
}

interface Account {
    id: string;
    name: string;
}


interface TransactionFooterProps {
    transactions: Transaction[];
}

const TransactionFooter = ({ transactions }: TransactionFooterProps) => {
    const totalsByType = useMemo(() => {
        const totals: { income: { [key: string]: number }; expense: { [key: string]: number } } = {
            income: {},
            expense: {},
        };

        transactions.forEach((transaction) => {
            const { related_currency, amount, transaction_type } = transaction;
            if (transaction_type === "income") {
                if (!totals.income[related_currency]) {
                    totals.income[related_currency] = 0;
                }
                totals.income[related_currency] += amount;
            } else if (transaction_type === "expense") {
                if (!totals.expense[related_currency]) {
                    totals.expense[related_currency] = 0;
                }
                totals.expense[related_currency] += Math.abs(amount);
            }
        });

        return totals;
    }, [transactions]);


    return (
        <div className="flex justify-end">
            <div className="flex flex-col justify-end items-end gap-4 md:w-1/3 font-bold">
                <div className="flex flex-row justify-between w-full">
                    <p className="text-stone-600 text-start">Income</p>
                    <div>
                        {Object.entries(totalsByType.income).length > 0 ? Object.entries(totalsByType.income).map(([currency, total], index) => (
                            <p className="text-green-600 self-end" key={index}>
                                {total ? total?.toFixed(2) : "0.00 NA"} {currency}
                            </p>
                        )) : <p className="text-green-600 self-end"> 0.00 NA</p>}
                    </div>
                </div>

                <Divider className="my-0" />

                <div className="flex flex-row justify-between w-full gap-4">
                    <p className="text-stone-600 text-start">Expense</p>
                    <div>
                        {Object.entries(totalsByType?.expense).length > 0 ? Object.entries(totalsByType?.expense).map(([currency, total], index) => (
                            <p className="text-red-600 self-end" key={index}>
                                {total?.toFixed(2)} {currency}
                            </p>
                        )) : <p className="text-red-600 self-end"> 0.00 NA</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Transaction = () => {
    const transactions: any = useSelector((state: RootState) => state.transactions);
    const accounts: Account[] = useSelector((state: RootState) => state.accounts);
    const [filteredTransaction, setFilteredTransaction] = useState<any>(transactions);
    const [dateString, setDateString] = useState<[string, string]>(["", ""]);

    const findName = useCallback(
        (account_id: string) => {
            const account = accounts.find((acc) => acc.id === account_id);
            return account?.name || "NA";
        },
        [accounts]
    );

    const handleChange = (_event: any, dateStrings: [string, string]) => {
        setDateString(dateStrings)
    };

    useEffect(() => {
        const _filtered = filterTransactionsByDate(dateString);
        setFilteredTransaction(_filtered);
    }, [accounts, dateString])

    const filterTransactionsByDate = (dateRange: [string, string]) => {
        const [start, end] = dateRange;
        if (!start || !end) {
            return transactions;
        }
        const [startDate, endDate] = dateRange.map((date) => dayjs(date));
        return transactions.filter((transaction: Transaction) => {
            const transactionDate = dayjs(transaction.date);
            return transactionDate.isSameOrAfter(startDate) && transactionDate.isSameOrBefore(endDate);
        });
    };

    return (
        <div className="h-full">
            <PageHeader>Transaction</PageHeader>
            <List
                header={<TransactionHeader handleOnChange={handleChange} />}
                footer={<TransactionFooter transactions={filteredTransaction} />}
                bordered
                className="md:w-2/3 bg-stone-50"
                dataSource={filteredTransaction}
                renderItem={(item: Transaction) => (
                    <List.Item className="flex flex-row justify-between">
                        <div>
                            <span className="text-stone-500">{item?.date}</span>{" "}
                            {item?.transaction_type === "transfer_in" ? (
                                <span className="px-2 font-medium">
                                    {findName(item?.account_from!)}{" -> "}{findName(item?.account_to!)}
                                </span>
                            ) : (
                                <span className="px-2 font-medium">{findName(item?.account_id)}</span>
                            )}
                            <span className="pl-1">
                                {item?.tags?.map((el: string, index: number) => (
                                    <Tag key={index}>{el}</Tag>
                                ))}
                            </span>
                        </div>
                        <div className="flex flex-row gap-1">
                            <p
                                className={`font-medium text-xl  pt-4 md:pt-0 md:text-sm ${item?.transaction_type === "expense"
                                    ? "text-red-600"
                                    : item?.transaction_type === "income"
                                        ? "text-green-600"
                                        : item?.transaction_type === "transfer_in"
                                            ? "text-blue-600"
                                            : ""
                                    }`}
                            >
                                {item?.amount} {item?.related_currency}
                            </p>
                        </div>
                    </List.Item>
                )}
            />
        </div>
    );
};


const TransactionHeader = ({ handleOnChange }: any) => {
    const [openModal, setOpenModal] = useState({ value: false, data: {} });
    const handleShowModal = () => {
        setOpenModal({ value: true, data: {} });
    };
    return (
        <div className="flex md:flex-row flex-col justify-end items-center gap-2">
            <RangePicker onChange={handleOnChange} format={dateFormat} />
            <Button onClick={handleShowModal}>
                <CirclePlus size={16} /> Add new transaction
            </Button>
            <FormModal isModalOpen={openModal} setIsModalOpen={setOpenModal} isNew={true} />
        </div>
    );
};


export default Transaction;



