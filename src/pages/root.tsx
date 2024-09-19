import { Button, Card, Form, Input, InputNumber, Select } from "antd"
import Currencies from "../assets/currency.json";
import { useEffect, useState } from "react";
import { addAccount } from "../slices/user-details";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../store";
const { Option } = Select;

const Root = () => {
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);
  const accounts = useSelector((state: RootState) => state.accounts);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(()=>{
    if (accounts.length > 0) {
      navigate("/dashboard");
  }
  },[])

  const handleFilterOption = (input: any, option: any) => {
    return option.value.toLowerCase().includes(input.toLowerCase());
  };

  const onFinish = (values: any) => {

    const payload = {
      ...values,
      balance: {
        ...Object.fromEntries(values.currencies.map((el: any) => [el, 0])),
        [values.suffix]: values.amount,
      },
    }

    dispatch(addAccount(payload));
    navigate("/dashboard");
  };

  const handleCurrencyChange = (value: string[]) => {
    setSelectedCurrencies(value);
  };


  const suffixSelector = (
    <Form.Item name="suffix" noStyle rules={[{ required: true, message: 'Please choose currency!' }]}>
      <Select
        style={{
          width: 140,
        }}

      >
        {Currencies?.filter(el => selectedCurrencies.includes(el.code)).map((el: any, index: number) => (<Option key={String(index)} value={el.code}><span className="pr-2 font-bold text-stone-700">{el?.symbol}</span>{el.name}</Option>))}
      </Select>
    </Form.Item>
  );


  return (
    <div className="h-screen grid place-items-center">
      <Card className="md:w-2/4 ">
        <div className="flex flex-col gap-2">
          <p className="font-bold text-3xl pb-4">Moneyfye</p>
          <p className="text-xl ">Currencies</p>
          <p>Select your base currency — the currency which will be used by default.</p>
          <Form name="create_ac"
            className="grid grid-cols-3 gap-x-4 w-full mx-" layout='vertical' onFinish={onFinish} >
            <Form.Item label="Currency" name="currencies" rules={[{ required: true, message: 'Fill!' }]} className="col-span-3 md:col-span-1"
            >
              <Select
                showSearch
                placeholder="Select a currency"
                optionFilterProp="children"
                className="w-fit min-w-64 my-1"
                size="middle"
                filterOption={handleFilterOption}
                mode="multiple"
                onChange={handleCurrencyChange}
              >
                {
                  Currencies?.map((el: any, ind: number) => (<Option key={ind} value={el.code}><span className="pr-2 font-bold text-stone-700">{el?.symbol}</span>{el.name}</Option>))
                }
              </Select>
            </Form.Item>
            <p className="col-span-3 mb-2 text-xl">
              Accounts
            </p>
            <p className="col-span-3 mb-2">
              Create accounts that you would like to keep track of.
              It could be cash in your wallet, bank accounts, credit cards or even a loan to your friend.
            </p>

            <Form.Item label="Account" name="name" rules={[{ required: true, message: 'Fill!' }]} className="col-span-3 md:col-span-2"
            >
              <Input placeholder="Enter name" className='w-full' />
            </Form.Item>
            <Form.Item label="Group" name="group" className="col-span-3 md:col-span-1"
              rules={[{ required: true, message: 'Please choose group!' }]}
            >
              <Select
                placeholder="Please select group"
              >
                <Option value="cash">Cash</Option>
                <Option value="bank_account">Bank Account</Option>
                <Option value="deposit">Deposit</Option>
                <Option value="credit">Credit</Option>
                <Option value="asset">Asset</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Amount" name="amount" rules={[{ required: true, message: 'Fill!' }]}
              className="col-span-3 md:col-span-2">
              <InputNumber min={1} placeholder="Enter Amount" className='w-full' addonAfter={suffixSelector} />
            </Form.Item>

            <Form.Item className="self-end col-span-3 md:col-span-1">
              <Button type="primary" className="w-full " htmlType="submit">
                Create Account
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Card>
    </div>
  )
}

export default Root