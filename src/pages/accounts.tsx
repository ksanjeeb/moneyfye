import { Button, Form, Input, InputNumber, List, Modal, Select } from "antd";
import { Option } from "antd/es/mentions";
import { CirclePlus } from "lucide-react";
import React, { useMemo, useState } from "react";
import currency from "../assets/currency.json";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { convertToTitleCase, fetchAccounts } from "../utils/custom";
import PageHeader from "../components/page-header";
import toast from "react-hot-toast";
import apiService from "../utils/service-utils";

interface Account {
  name: string;
  balance: Record<string, number>;
  group: string;
}

interface FormValues {
  name: string;
  group: string;
  currencies: string[];
  currency: number;
  suffix: string;
}

const AccountsHeader = ({ onSearch }: { onSearch: (searchTerm: string) => void }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState<string>("");

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onFinish = (values: FormValues) => {
    const payload = {
      ...values,
      balance: {
        ...Object.fromEntries(values.currencies.map((el) => [el, 0])),
        [values.suffix]: values.currency,
      },
    };
    saveAccount(payload);
  };

  const saveAccount = async (payload: any) => {
    setLoading(true);
    try {
      const account_res = await apiService.post('/accounts', payload);
      if (account_res.statusCode === 200) {
        toast.success(account_res.message);
        fetchAccounts();
        handleCancel();
        return;
      }
      toast.error(account_res.message);
      return;
    } catch (err: any) {
      toast.error(err?.message || "Account save failed!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const suffixSelector = (
    <Form.Item
      name="suffix"
      noStyle
      rules={[{ required: true, message: "Please choose currency!" }]}
    >
      <Select style={{ width: 140 }}>
        {currency
          ?.filter((el) => selectedCurrencies.includes(el.code))
          .map((el, index) => (
            <Option key={String(index)} value={el.code}>
              <span className="pr-2 font-bold text-stone-700">{el?.symbol}</span>
              {el.name}
            </Option>
          ))}
      </Select>
    </Form.Item>
  );

  const handleCurrencyChange = (value: string[]) => {
    setSelectedCurrencies(value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <div className="flex justify-end items-center gap-2">
      <Input
        type="text"
        placeholder="Search account name"
        value={searchTerm}
        onChange={handleSearchChange}
        style={{ width: 200 }} 
      />
      <Button onClick={showModal}>
        <CirclePlus size={16} /> Add new user
      </Button>
      <Modal title="New Account" open={isModalOpen} onCancel={handleCancel} footer={[]}>
        <Form
          name="acc"
          className="grid grid-cols-3 gap-x-4 w-full mx-auto p-4"
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            label="Account"
            name="name"
            rules={[{ required: true, message: "Fill!" }]}
            className="col-span-2"
          >
            <Input placeholder="Enter account" className="w-full" />
          </Form.Item>

          <Form.Item
            label="Group"
            name="group"
            className="col-span-1"
            rules={[{ required: true, message: "Please choose group!" }]}
          >
            <Select placeholder="Please select group">
              <Option value="cash">Cash</Option>
              <Option value="bank_account">Bank Account</Option>
              <Option value="deposit">Deposit</Option>
              <Option value="credit">Credit</Option>
              <Option value="asset">Asset</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Currency"
            name="currencies"
            className="col-span-3"
            rules={[{ required: true, message: "Please choose currency!" }]}
          >
            <Select mode="multiple" onChange={handleCurrencyChange}>
              {currency?.map((el, index) => (
                <Option key={String(index)} value={el.code}>
                  <span className="pr-2 font-bold text-stone-700">{el?.symbol}</span>
                  {el.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Currency"
            name="currency"
            rules={[{ required: true, message: "Fill!" }]}
            className="col-span-2"
          >
            <InputNumber min={1} placeholder="Enter Amount" className="w-full" addonAfter={suffixSelector} />
          </Form.Item>

          <Form.Item className="self-end">
            <Button
              type="primary"
              className="w-full"
              htmlType="submit"
              loading={loading}
            >
              {loading ? "Saving..." : "Save Account"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};


const Accounts = () => {
  const accounts = useSelector((state: RootState) => state.accounts);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const filteredAccounts = useMemo(() => {
    return accounts.filter(account =>
      account.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [accounts, searchTerm]);

  const groupedAccounts = useMemo(() => {
    return accounts.reduce((acc: Record<string, Account[]>, account: Account) => {
      if (!acc[account.group]) {
        acc[account.group] = [];
      }
      acc[account.group].push(account);
      return acc;
    }, {});
  }, [accounts]);

  return (
    <div className="h-full">
      <PageHeader>Accounts</PageHeader>
      <List
        header={<AccountsHeader onSearch={handleSearch} />}
        bordered
        className="md:w-2/3 bg-stone-50"
        dataSource={Object.entries(groupedAccounts)}
        renderItem={([group, accounts]: [string, Account[]]) => {
          const filteredAccountsList = accounts.filter((account:any) => filteredAccounts.includes(account));

          if (filteredAccountsList.length === 0) return null;

          return (
            <React.Fragment key={group}>
              <List.Item className="flex flex-row justify-between bg-stone-200 font-medium">
                {convertToTitleCase(group)}
              </List.Item>
              {filteredAccountsList.map((account,index) => (
                <List.Item className="flex flex-row justify-between" key={index}> 
                  <span>{account.name}</span>
                  <div className="text-right">
                    {Object.entries(account.balance).map(([currency, amount]) => (
                      <p key={`${currency}-${amount}`} className="font-semibold">
                        {amount} {currency}
                      </p>
                    ))}
                  </div>
                </List.Item>
              ))}
            </React.Fragment>
          );
        }}
      />
    </div>
  );
};



export default Accounts;
