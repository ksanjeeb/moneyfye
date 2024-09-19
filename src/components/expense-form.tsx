import { useEffect, useMemo, useState } from 'react';
import { Form, Input, Button, Select, DatePicker, InputNumber } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { convertToTitleCase } from '../utils/custom';
import { addExpense, addIncome, editTransaction } from '../slices/user-details';
import dayjs from 'dayjs';

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
    const dispatch = useDispatch();
    const [form] = Form.useForm();

    const existingValues = useMemo(() => {
        return transaction.find(each => each.transaction_id === initialData.transaction_id) || null;
    }, [transaction, initialData.transaction_id]);

    const onFinish = (values: any) => {
        try {
            const transactionPayload = {
                id: values.account_id,
                currencyCode: values.suffix,
                amount: values.currency,
                description: values.note || "",
                tags: values.tags,
                date: dayjs(values.date).format(dateFormat),
            };
            if (update) {
                if (initialData.transaction_id) {
                    dispatch(editTransaction({ ...transactionPayload, id: initialData.transaction_id }));
                } else {
                    console.error("Transaction ID is undefined");
                }
            } else {
                type === "expense" ? dispatch(addExpense(transactionPayload)) : dispatch(addIncome(transactionPayload));
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
                className="col-span-3 md:col-span-2"
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

            <Form.Item label="Currency" className="col-span-3 md:col-span-1" name="currency" rules={[{ required: true, message: 'Fill!' }]}>
                <InputNumber
                    min={1}
                    placeholder="Enter Amount"
                    className='w-full'
                    addonAfter={suffixSelector}
                />
            </Form.Item>

            <Form.Item label="Tags" className="col-span-3 md:col-span-2" name='tags'>
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

            <Form.Item label="Date" className="col-span-3 md:col-span-1" name='date' rules={[{ required: true, message: 'Fill!' }]}>
                <DatePicker className="w-full" format={dateFormat} />
            </Form.Item>

            <Form.Item label="Note" className="col-span-3 md:col-span-2" name='note'>
                <Input.TextArea placeholder="Note" rows={2} className="w-full" />
            </Form.Item>

            <Form.Item className="self-end col-span-3 md:col-span-1">
                <Button type="primary" className="w-full" htmlType="submit">
                    {update ?
                        (type === "expense" ? "Update Expense" : "Update Income") :
                        (type === "expense" ? "Add Expense" : "Add Income")
                    }
                </Button>
            </Form.Item>
        </Form>
    );
};

export default ExpenseIncomForm;
