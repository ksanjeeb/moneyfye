import { Button, Divider, List, Select, Spin, Tag } from "antd";
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
import toast from "react-hot-toast";
import apiService from "../utils/service-utils";
import { formatDate } from "../utils/custom";
const { Option } = Select;
const { RangePicker } = DatePicker;
import VirtualList from 'rc-virtual-list';
import { debounce } from "lodash";

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
            const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
            if (transaction_type === "income") {
                if (!totals.income[related_currency]) {
                    totals.income[related_currency] = 0;
                }
                totals.income[related_currency] += numericAmount;
            } else if (transaction_type === "expense") {
                if (!totals.expense[related_currency]) {
                    totals.expense[related_currency] = 0;
                }
                totals.expense[related_currency] += Math.abs(numericAmount);
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
    const [transactions, setTransactions] = useState<any[]>([]);
    const [dateString, setDateString] = useState<[string, string]>(["", ""]);
    const [transactionType, setTransactionType] = useState<string>("all");
    const [transactionLoading, setTransactionLoading] = useState(false);
    const accounts: Account[] = useSelector((state: RootState) => state.accounts);
    const triggerTransaction: any = useSelector((state: RootState) => state.trigger_transaction);
    const [skip, setSkip] = useState(0);
    const [totalTransExist, setTotalTransExist] = useState(0);

    const fetchTransactions = async (data: any, _skip: number) => {
        try {
            setTransactionLoading(true);

            let url = `/transaction/list?skip=${_skip}&limit=10`;

            if (dateString[0] && dateString[1]) {
                const [startDate, endDate] = dateString;
                url += `&start_date=${startDate}&end_date=${endDate}`;
            }

            if (transactionType) {
                url += `&transaction_type=${transactionType}`;
            }

            const response = await apiService.get(url);

            if (response.statusCode === 200) {
                setTransactions([...data, ...response.data]);
                setTotalTransExist(response?.total || 0)
                setSkip([...data, ...response.data]?.length || 0)
            } else {
                throw new Error(response.message);
            }
        } catch (err: any) {
            toast.error(err?.message || "Transaction retrieval failed!");
        } finally {
            setTransactionLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions([], 0);
    }, [dateString, transactionType, triggerTransaction]);

    const handleDateChange = (_event: any, dateStrings: [string, string]) => {
        setDateString(dateStrings);
    };

    const findName = useCallback(
        (account_id: string) => {
            const account = accounts.find((acc) => acc.id === account_id);
            return account?.name || "NA";
        },
        [accounts]
    );


    const onScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
        if (Math.abs(e.currentTarget.scrollHeight - e.currentTarget.scrollTop - ContainerHeight) <= 2) {
            debouncedFetchTransactions();
        }
    };

    const debouncedFetchTransactions = debounce(() => {
        if (totalTransExist >= skip) {
            fetchTransactions(transactions, skip);
        }
    }, 300);

    const ContainerHeight = 400;

    return (
        <div className="h-full">
            <PageHeader>Transaction</PageHeader>
            <List
                header={<TransactionHeader handleOnChange={handleDateChange} setTransactionType={(value: string) => setTransactionType(value)} value={transactionType} />}
                footer={<TransactionFooter transactions={transactions} />}
                bordered
                className="md:w-2/3 bg-stone-50 transaction-list"
                loading={transactionLoading}
            >
                {transactions.length > 0 ? (
                    <VirtualList
                        data={transactions}
                        height={ContainerHeight}
                        itemHeight={100}
                        itemKey="transaction_id"
                        onScroll={onScroll}
                    >
                        {(item: any) => (
                            <List.Item key={item.transaction_id} className="flex flex-row justify-between">
                                <div>
                                    <span className="text-stone-500">{formatDate(item?.date)}</span>{" "}
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
                                        className={`font-medium text-xl pt-4 md:pt-0 md:text-sm ${item?.transaction_type === "expense"
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
                    </VirtualList>
                ) : (
                    <div className="text-center py-4">
                        <p>No transactions found.</p>
                    </div>
                )}
            </List>

        </div>
    );
};









const TransactionHeader = ({ handleOnChange, setTransactionType, transactionType }: any) => {
    const [openModal, setOpenModal] = useState({ value: false, data: {} });
    const handleShowModal = () => {
        setOpenModal({ value: true, data: {} });
    };

    const handleTypeChange = (type: string | null) => {
        setTransactionType(type);
    };

    return (
        <div className="flex md:flex-row flex-col justify-end items-center gap-2">
            <RangePicker onChange={handleOnChange} format={"YYYY-MM-DD"} />
            <Select
                onChange={handleTypeChange}
                className="w-36"
                placeholder="Select transaction type"
                value={transactionType}
            >
                <Option value="all">All</Option>
                <Option value="income">Income</Option>
                <Option value="expense">Expense</Option>
            </Select>
            <Button onClick={handleShowModal}>
                <CirclePlus size={16} /> Add new transaction
            </Button>
            <FormModal isModalOpen={openModal} setIsModalOpen={setOpenModal} isNew={true} />
        </div>
    );
};



export default Transaction;



