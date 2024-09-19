import { Card, Tag } from "antd";
import { Pencil } from "lucide-react";
import TransactionMenu from "../components/transaction-menu";
import FormModal from "../components/form-modal";
import { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import Currency from "../assets/currency.json";
import Group from "../assets/group.json";
import { getCurrencySymbol } from "../utils/custom";
import PageHeader from "../components/page-header";

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
  hide?:boolean;
}

interface ModalState {
  value: boolean;
  data: Partial<Transaction>;
}


export const Dashboard = () => {
  const accounts = useSelector((state: RootState) => state.accounts as Account[]);
  const [openModal, setOpenModal] = useState<ModalState>({ value: false, data: {} });
  const transactions = useSelector((state: RootState) => state.transactions as Transaction[]);

  const handleShowModal = (transaction: Transaction) => {
    setOpenModal({ value: true, data: transaction });
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
        <div>
          <Card className="w-full bg-gradient-to-r from-blue-100 to-cyan-100 md:w-96 p-4 rounded-xl shadow-lg md:m-2" size="small">
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
          <div className="py-4 px-2">
            <p>Recent Transactions</p>
            <Card bordered={false} className="w-full mt-4">
              {transactions?.length > 0 ? (
                transactions.map((transaction, index) => (
                  <div key={index} className="flex flex-row justify-between py-4 border-b-2">
                    <div>
                      <span className="text-stone-500">{transaction.date}</span>{" "}
                      {transaction.transaction_type === "transfer_in" ? (
                        <span>
                          {findName(transaction.account_from)}{" -> "}{findName(transaction.account_to)}
                        </span>
                      ) : (
                        <span>{findName(transaction.account_id)}</span>
                      )}
                      <span className="pl-1">
                        {transaction.tags?.map((tag, tagIndex) => (
                          <Tag key={tagIndex}>{tag}</Tag>
                        ))}
                      </span>
                    </div>
                    <div className="flex flex-row gap-1">
                      <p
                        className={`font-medium ${
                          transaction.transaction_type === "expense"
                            ? "text-red-600"
                            : transaction.transaction_type === "income"
                            ? "text-green-600"
                            : "text-blue-600"
                        }`}
                      >
                        {transaction.amount} {transaction.related_currency}
                      </p>
                      {!transaction?.hide && <span className="ml-1 cursor-pointer hover:text-blue-800" onClick={() => handleShowModal(transaction)}>
                        <Pencil size={16} />
                      </span>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="font-bold text-stone-500">No transaction.</div>
              )}
            </Card>
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
