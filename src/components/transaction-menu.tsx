import { useState } from 'react';
import { Menu } from 'antd';
import ExpenseInputForm from './expense-form';
import TransferForm from './transfer-form';

interface MenuItem {
    label: string;
    key: string;
}

interface TransactionMenuProps {
    initialData?: Record<string, any>;
    closeAction: () => void;
}

const items: MenuItem[] = [
    { label: 'Expense', key: 'expense' },
    { label: 'Transfer', key: 'transfer' },
    { label: 'Income', key: 'income' }
];

const TransactionMenu = ({ initialData = {}, closeAction }:TransactionMenuProps) => {
    const [current, setCurrent] = useState<string>('expense');

    const onClick = (e: { key: string }) => {
        setCurrent(e.key);
    };

    return (
        <div className="my-6 bg-white border rounded-md p-4">
            <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} className="bg-white" />
            {current === "expense" && <ExpenseInputForm initialData={initialData} closeAction={closeAction} />}
            {current === "income" && <ExpenseInputForm type="income" initialData={initialData} closeAction={closeAction} />}
            {current === "transfer" && <TransferForm initialData={initialData} closeAction={closeAction} />}
        </div>
    );
};

export const TransactionModalMenu = ({ initialData = {}, closeAction }:TransactionMenuProps) => {
    return (
        <div className="my-6 bg-white border rounded-md p-4">
            {initialData.transaction_type === "expense" && <ExpenseInputForm initialData={initialData} update={true} closeAction={closeAction} />}
            {initialData.transaction_type === "income" && <ExpenseInputForm type="income" initialData={initialData} update={true} closeAction={closeAction} />}
            {initialData.transaction_type === "transfer_in" && <TransferForm initialData={initialData} update={true} closeAction={closeAction} />}
        </div>
    );
};

export default TransactionMenu;
