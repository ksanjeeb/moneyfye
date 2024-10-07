import { Card, Dropdown, MenuProps, Space, Spin, Tag, Typography } from "antd";
import { ChevronDown, Pencil } from "lucide-react";
import TransactionMenu from "../components/transaction-menu";
import FormModal from "../components/form-modal";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import Currency from "../assets/currency.json";
import Group from "../assets/group.json";
import { formatDate, getCurrencySymbol } from "../utils/custom";
import PageHeader from "../components/page-header";
import apiService from "../utils/service-utils";
import toast from "react-hot-toast";

interface Account {
  id: string;
  name: string;
  group: string;
  balance: Record<string, number>;
}

interface Transaction {
  account_id?: string;
  account_from?: string;
  account_to?: string;
  transaction_type: "expense" | "income" | "transfer_in";
  amount: number;
  related_currency: string;
  date: string;
  tags?: string[];
  hide?: boolean;
}

interface ModalState {
  value: boolean;
  data: Partial<Transaction>;
}


export const Dashboard = () => {
  const accounts = useSelector((state: RootState) => state.accounts as Account[]);
  const triggerTrans = useSelector((state: RootState) => state.transactions);

  const [openModal, setOpenModal] = useState<ModalState>({ value: false, data: {} });
  const [transactionFilter, setTransactionFilter] = useState("recent");
  const [transactionLoading, setTransactionLoading] = useState(false)
  const [transactions, setTransactions] = useState<any>([]);

  const handleShowModal = (transaction: Transaction) => {
    setOpenModal({ value: true, data: transaction });
  };


  useEffect(() => {

    fetchTransactions();

  }, [transactionFilter , triggerTrans])


  const fetchTransactions = async () => {
    try {
      setTransactionLoading(true);
      const today = new Date();
      const todayDate = today.toISOString().split('T')[0];

      let url = "/transaction/list?";

      if (transactionFilter === "recent") {
        url += 'limit=10&skip=0';
      } else if (transactionFilter === 'today') {
        url += `start_date=${todayDate}&end_date=${todayDate}`;
      } else if (transactionFilter === 'yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const yesterdayDate = yesterday.toISOString().split('T')[0];
        url += `start_date=${yesterdayDate}&end_date=${yesterdayDate}`;
      }

      const response = await apiService.get(url);

      if (response.statusCode === 200) {
        setTransactions(response.data);
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      setTransactions([])
      toast.error(err?.message || "Transaction retrieval failed!");
    } finally {
      setTransactionLoading(false);
    }
  };

  const totalBalances = useMemo(() => {
    return accounts.reduce((acc: Record<string, number>, account: Account) => {
      for (const [currency, amount] of Object.entries(account.balance)) {
        if (!acc[currency]) {
          acc[currency] = 0;
        }
        acc[currency] += amount;
      }
      return acc;
    }, {});
  }, [accounts]);

  const findName = useCallback(
    (account_id?: string) => {
      const account = accounts.find((acc) => acc.id === account_id);
      return account?.name || "NA";
    },
    [accounts]
  );


  const items: MenuProps['items'] = [
    {
      key: 'recent',
      label: 'Recent',
    },
    {
      key: 'today',
      label: 'Today',
    },
    {
      key: 'yesterday',
      label: 'Yesterday',
    },
  ];

  return (
    <div className="h-full">
      <PageHeader>Dashboard</PageHeader>
      <div className="flex flex-col md:flex-row gap-2 ">
        <div className="md:w-4/6 h-fit">
          <div className="flex flex-wrap gap-4 overflow-x-auto pb-2">
            {["cash", "bank_account", "deposit", "credit", "asset"].map((group) => (
              <RenderCard group={group} data={accounts} key={group} />
            ))}
          </div>
          <TransactionMenu closeAction={() => null} />
        </div>
        <div className="flex-grow">
          <Card className="bg-gradient-to-r from-blue-100 to-cyan-100  p-4 rounded-xl shadow-lg w-full " size="small">
            <div className="font-extrabold text-gray-700 pb-4 text-xl border-b-2 border-cyan-300">Total Balances</div>
            <div className="flex flex-col space-y-4 mt-4">
              {Object.entries(totalBalances).map(([currency, amount]) => (
                <div key={currency} className="flex flex-row justify-between items-center font-medium text-lg bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                  <p className="text-gray-600">{currency}</p>
                  <p className="text-cyan-600">
                    {getCurrencySymbol(currency, Currency)} {amount.toLocaleString() || "0"}
                  </p>
                </div>
              ))}
            </div>
          </Card>
          <div className="py-4 px-2 mt-2">
            <div className="flex flex-row justify-between">
              <p>Recent Transactions</p>
              <Dropdown
                menu={{
                  items,
                  selectable: true,
                  selectedKeys: [transactionFilter],
                  onClick: (info) => setTransactionFilter(info.key),  // Capture click event from menu
                }}
              >
                <Typography.Link>
                  <Space>
                    {transactionFilter.charAt(0).toUpperCase() + transactionFilter.slice(1)}
                    <ChevronDown />
                  </Space>
                </Typography.Link>
              </Dropdown>
            </div>
            <Spin spinning={transactionLoading} tip="Loading...">
              <Card bordered={false} className="flex-grow min-h-0 max-h-full mt-4 h-[420px] overflow-y-auto">
                {transactions?.length > 0 ? (
                  transactions.map((transaction: any, index: number) => (
                    <div key={index} className="flex flex-row justify-between py-4 border-b-2">
                      <div>
                        <span className="text-stone-500">{formatDate(transaction.date)}</span>{" "}
                        {transaction.transaction_type === "transfer_in" ? (
                          <span>
                            {findName(transaction.account_from)}{" -> "}{findName(transaction.account_to)}
                          </span>
                        ) : (
                          <span>{findName(transaction.account_id)}</span>
                        )}
                        <span className="pl-1">
                          {transaction.tags?.map((tag: any, tagIndex: number) => (
                            <Tag key={tagIndex}>{tag}</Tag>
                          ))}
                        </span>
                      </div>
                      <div className="flex flex-row gap-1">
                        <p
                          className={`font-medium ${transaction.transaction_type === "expense"
                            ? "text-red-600"
                            : transaction.transaction_type === "income"
                              ? "text-green-600"
                              : "text-blue-600"
                            }`}
                        >
                          {transaction.amount} {transaction.related_currency}
                        </p>
                        {/* {!transaction?.hide && <span className="ml-1 cursor-pointer hover:text-blue-800" onClick={() => handleShowModal(transaction)}>
                          <Pencil size={16} />
                        </span>} */}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="font-bold text-stone-500">No transaction.</div>
                )}
              </Card>
            </Spin>
          </div>
        </div>
      </div>
      <FormModal isModalOpen={openModal} setIsModalOpen={setOpenModal} />
    </div>
  );
};

interface RenderCardProps {
  group: string;
  data: Account[];
}

const RenderCard = ({ group, data }: RenderCardProps) => {
  const group_json: Record<string, string> = Group;
  const groupData = data.filter((item) => item.group === group);

  if (groupData.length === 0) return null;

  return (
    <Card
      key={group}
      size="small"
      className="w-full bg-gradient-to-r from-violet-200 to-pink-200 md:w-72 p-4 rounded-xl shadow-md flex-shrink-0 hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex flex-row justify-between font-extrabold text-gray-700 pb-2 text-xl border-b-2 border-pink-300">
        <p>{group_json[group]}</p>
      </div>

      {groupData.map((each, index) => (
        <div key={index} className="mt-4">
          <div className="flex flex-row justify-between items-center font-medium text-lg bg-white p-3 rounded-lg shadow-md mb-4 hover:bg-pink-100 transition-colors duration-300">
            <p className="text-gray-700">{each.name}</p>
            <div className="pb-2">
              {Object.entries(each.balance).map(([currency, amount]) => (
                <div key={currency} className="flex flex-row items-center space-x-2">
                  <p className="font-bold text-violet-600">{getCurrencySymbol(currency, Currency)}</p>
                  <p className="font-bold text-gray-700">{amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </Card>
  );
};
