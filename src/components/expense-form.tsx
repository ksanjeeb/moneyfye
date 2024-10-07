import { useEffect, useMemo, useState } from 'react';
import { Form, Input, Button, Select, DatePicker, InputNumber, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { convertToTitleCase, fetchAccounts, fetchTransactions } from '../utils/custom';
import { addExpense, addIncome, editTransaction, triggerAccount, triggerTransaction } from '../slices/user-details';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import apiService from '../utils/service-utils';

const { Option } = Select;

interface Account {
    id: string;
    name: string;
    group: string;
    balance: Record<string, number>;
}

interface Transaction {
    transaction_id?: string;
    account_id?: string;
    date?: string;
    tags?: string[];
    description?: string;
    related_currency?: string;
    amount?: number;
}

interface ExpenseIncomFormProps {
    type?: 'expense' | 'income';
    initialData?: Transaction;
    update?: boolean;
    closeAction?: () => void;
}

const dateFormat = 'YYYY-MM-DD';


const ExpenseIncomForm = ({ type = "expense", initialData = {}, update, closeAction }: ExpenseIncomFormProps) => {
    const [currencyOption, setCurrencyOption] = useState<string[]>([]);
    const accounts = useSelector((state: RootState) => state.accounts) as Account[];
    const transaction = useSelector((state: RootState) => state.transactions) as Transaction[];
    const [loading, setLoading] = useState(false)
    const [form] = Form.useForm();
    const dispatch = useDispatch();

    const existingValues = useMemo(() => {
        return transaction.find(each => each.transaction_id === initialData.transaction_id) || null;
    }, [transaction, initialData.transaction_id]);

    const onFinish = async (values: any) => {
        try {
            const transactionPayload = {
                id: values.account_id,
                currency_code: values.suffix,
                amount: values.currency,
                description: values.note || "",
                tags: values.tags,
                date: dayjs(values.date).format(dateFormat),
            };
            if (update) {
                if (initialData.transaction_id) {
                    await modifyTransaction(transactionPayload, initialData.transaction_id);
                } else {
                    console.error("Transaction ID is undefined");
                }
            } else {
                type === "expense" ? await addExpenseTransaction(transactionPayload) : await addIncomeTransaction(transactionPayload);
            }
            if (closeAction) closeAction();
            form.resetFields();
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (value: any) => {
        if (value?.account_id) {
            const temp = accounts.find(each => each.id === value.account_id);
            setCurrencyOption(Object.keys(temp?.balance || {}));
        }
    };


    const addExpenseTransaction = async (payload: any) => {
        setLoading(true);
        try {
            const transaction_res = await apiService.post('/transaction/add-expense', payload);
            if (transaction_res.statusCode === 200) {
                toast.success(transaction_res.message);
                fetchTransactions();
                dispatch(triggerTransaction())
                fetchAccounts();
                dispatch(triggerAccount())
                return
            }
            toast.error(transaction_res.message);
            return;
        } catch (err: any) {
            toast.error(err?.message || "Account save failed!");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }


    const addIncomeTransaction = async (payload: any) => {
        setLoading(true);
        try {
            const transaction_res = await apiService.post('/transaction/add-income', payload);
            if (transaction_res.statusCode === 200) {
                toast.success(transaction_res.message);
                dispatch(triggerTransaction())
                fetchAccounts();
                dispatch(triggerAccount())
                return
            }
            toast.error(transaction_res.message);
            return;
        } catch (err: any) {
            toast.error(err?.message || "Account save failed!");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }



    const modifyTransaction = async (payload: any, id: string) => {
        setLoading(true);
        try {
            const transaction_res = await apiService.patch('/transaction/' + id + "/edit", payload);
            if (transaction_res.statusCode === 200) {
                toast.success(transaction_res.message);
                dispatch(triggerTransaction())
                fetchAccounts();
                dispatch(triggerAccount())
                return
            }
            toast.error(transaction_res.message);
            return;
        } catch (err: any) {
            toast.error(err?.message || "Account save failed!");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        if (existingValues) {
            form.setFieldsValue({
                account_id: existingValues.account_id || null,
                date: existingValues.date ? dayjs(existingValues.date, 'YYYY-MM-DD') : null,
                tags: existingValues.tags || null,
                note: existingValues.description || null,
                suffix: existingValues.related_currency || null,
                currency: Math.abs(existingValues?.amount || 0) || null
            });
        }
    }, [existingValues, form]);

    const suffixSelector = (
        <Form.Item name="suffix" noStyle rules={[{ required: true, message: 'Please choose currency!' }]}>
            <Select
                style={{ width: 70 }}
                disabled={update}
            >
                {currencyOption.map((el, index) => (<Option value={el} key={index}>{el}</Option>))}
            </Select>
        </Form.Item>
    );

    return (
        <div className="relative">
            {loading && (
                <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-80 z-10">
                    <Spin size="large" />
                </div>
            )}
            <Form
                name={initialData.transaction_id || "new_transaction"}
                form={form}
                className="grid grid-cols-3 gap-x-4 w-full mx-auto p-4"
                layout='vertical'
                onFinish={onFinish}
                onValuesChange={handleChange}
            >
                <Form.Item
                    label={type === "expense" ? "From" : "To"}
                    name="account_id"
                    className="col-span-2"
                    rules={[{ required: true, message: 'Please choose user!' }]}
                >
                    <Select placeholder="Please select user" disabled={update}>
                        {accounts.map((each, index) => (
                            <Option value={each.id} key={index}>
                                <div className="flex flex-row justify-between">
                                    <p>{each.name}</p>
                                    <p className='text-neutral-300 font-bold'>{convertToTitleCase(each.group)}</p>
                                </div>
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item label="Currency" name="currency" rules={[{ required: true, message: 'Fill!' }]}>
                    <InputNumber
                        min={1}
                        placeholder="Enter Amount"
                        className='w-full'
                        addonAfter={suffixSelector}
                    />
                </Form.Item>

                <Form.Item label="Tags" className="col-span-2" name='tags'>
                    <Select
                        mode="tags"
                        placeholder="Choose existing tags or add new"
                        className="w-full"
                    >
                        <Option value="food">Food</Option>
                        <Option value="travel">Travel</Option>
                        <Option value="shopping">Shopping</Option>
                    </Select>
                </Form.Item>

                <Form.Item label="Date" name='date' rules={[{ required: true, message: 'Fill!' }]}>
                    <DatePicker className="w-full" format={dateFormat} />
                </Form.Item>

                <Form.Item label="Note" className="col-span-2" name='note'>
                    <Input.TextArea placeholder="Note" rows={2} className="w-full" />
                </Form.Item>

                <Form.Item className="self-end">
                    <Button type="primary" className="w-full" htmlType="submit">
                        {update ?
                            (type === "expense" ? "Update Expense" : "Update Income") :
                            (type === "expense" ? "Add Expense" : "Add Income")
                        }
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default ExpenseIncomForm;
