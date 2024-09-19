import { useEffect, useMemo, useState } from 'react';
import { Form, Input, Button, Select, DatePicker, InputNumber } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { convertToTitleCase } from '../utils/custom';
import { editTransaction, transferMoney } from '../slices/user-details';
import dayjs from 'dayjs';

const { Option } = Select;

interface TransferFormProps {
    initialData?: {
        transaction_id?: string;
        account_from?: string;
        account_to?: string;
        date?: string;
        tags?: string[];
        description?: string;
        related_currency?: string;
        amount?: number;
    };
    update?: boolean;
    closeAction: () => void;
}

const dateFormat = 'YYYY-MM-DD';

const TransferForm = ({ initialData = {}, update = false, closeAction }:TransferFormProps) => {
    const [currencyOption, setCurrencyOption] = useState<string[]>([]);
    const accounts = useSelector((state: RootState) => state.accounts);
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const transactions = useSelector((state: RootState) => state.transactions);

    const onFinish = (values: any) => {
        try {
            const transferPayload = {
                fromAccountID: values.from,
                toAccountID: values.to,
                fromCurrencyCode: values.suffix,
                amount: values.currency,
                description: values.note || "",
                tags: values.tags,
                date: dayjs(values.date).format(dateFormat),
                currencyCode: values.suffix,
            };
            if (update) {
                if (initialData.transaction_id) {
                    dispatch(editTransaction({ ...transferPayload, id: initialData.transaction_id }));
                }
            } else {
                dispatch(transferMoney(transferPayload));
            }
            closeAction();
            form.resetFields();
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (value: any) => {
        if (value?.to || value?.from) {
            const temp = accounts.find(each => each.id === value.from || each.id === value.to);
            if (temp) {
                setCurrencyOption(Object.keys(temp.balance));
            }
        }
    };

    const existingValues = useMemo(() => {
        return transactions.find(each => each.transaction_id === initialData.transaction_id) || null;
    }, [transactions, initialData.transaction_id]);

    useEffect(() => {
        if (existingValues) {
            form.setFieldsValue({
                from: existingValues.account_from || null,
                to: existingValues.account_to || null,
                date: existingValues.date ? dayjs(existingValues.date, 'YYYY-MM-DD') : null,
                tags: existingValues.tags || null,
                note: existingValues.description || null,
                suffix: existingValues.related_currency || null,
                currency: Math.abs(existingValues.amount) || null,
            });
        }
    }, [existingValues, form]);

    const suffixSelector = (
        <Form.Item name="suffix" noStyle rules={[{ required: true, message: 'Please choose currency!' }]}>
            <Select
                style={{ width: 70 }}
                disabled={update}
            >
                {currencyOption.map((el, index) => (
                    <Option value={el} key={index}>{el}</Option>
                ))}
            </Select>
        </Form.Item>
    );

    return (
        <Form
            name="transfer"
            form={form}
            key="transfer"
            className="grid grid-cols-3 gap-x-4 w-full mx-auto p-4"
            layout="vertical"
            onFinish={onFinish}
            onValuesChange={handleChange}
        >
            <Form.Item
                label="From"
                name="from"
                className="col-span-2"
                rules={[{ required: true, message: 'Please choose account!' }]}
            >
                <Select placeholder="Please select account" disabled={update}>
                    {accounts.map((each:any, index:number) => (
                        <Option value={each.id} key={index}>
                            <div className="flex flex-row justify-between">
                                <p>{each.name}</p>
                                <p className='text-neutral-300 font-bold'>{convertToTitleCase(each.group)}</p>
                            </div>
                        </Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item
                label="Currency"
                name="currency"
                rules={[{ required: true, message: 'Fill!' }]}
            >
                <InputNumber
                    min={1}
                    placeholder="Enter Amount"
                    className='w-full'
                    addonAfter={suffixSelector}
                />
            </Form.Item>

            <Form.Item
                label="To"
                name="to"
                className="col-span-2"
                rules={[{ required: true, message: 'Please choose account!' }]}
            >
                <Select placeholder="Please select account" disabled={update}>
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

            <Form.Item
                label="Date"
                name='date'
                rules={[{ required: true, message: 'Fill!' }]}
            >
                <DatePicker className="w-full" format={dateFormat}/>
            </Form.Item>

            <Form.Item
                label="Note"
                className="col-span-2"
                name='note'
            >
                <Input.TextArea placeholder="Note" rows={2} className="w-full" />
            </Form.Item>

            <Form.Item className="self-end">
                <Button type="primary" className="w-full" htmlType="submit">
                    {update ? "Update Transfer" : "Add Transfer"}
                </Button>
            </Form.Item>
        </Form>
    );
};

export default TransferForm;
