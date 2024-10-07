import { Button, Collapse, Popconfirm } from "antd"
import { ChevronRight, FolderInput, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { downloadStateJSON, removeAllAccount } from "../slices/user-details";
import PageHeader from "../components/page-header";
import apiService from "../utils/service-utils";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { RootState } from "../store";

const { Panel } = Collapse;


const Settings = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState("");
  const navigate = useNavigate();
  const data: any = useSelector((state: RootState) => state);

  const handleRemove = async () => {
    setLoading("deleting");
    try {
      await apiService.delete(`/user`);
      navigate("/signup")
    } catch (error) {
      toast.error("Error while deleting user details ].")
      console.error("Error while  deleting user details", error);
    } finally {
      setLoading("");
    }
  }

  const generateReport = async (type: string = "xlsx") => {
    setLoading(type);
    try {
      await apiService.downloadFile(`/transaction/reports-download?type=${type}`, {});
    } catch (error) {
      toast.error("Error while genrating report ." + error)
      console.error("Error while genrating report .", error);
    } finally {
      setLoading("");
    }
  };


  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="h-full">
      <PageHeader>Settings</PageHeader>
      <div className="border-[2px] border-stone-200 rounded-md md:w-2/3">
        <Collapse
          bordered={false}
          defaultActiveKey={['1']}
          className="bg-stone-50"
          expandIcon={({ isActive }) => <ChevronRight className={`transition-transform duration-300 ${isActive ? 'rotate-90' : 'rotate-0'}`} />}
        >
          <Panel header="PROFILE" key="1" >
            <div className="flex flex-row gap-4 py-4 px-6 m-2 bg-gray-300 rounded-md">
              <div className="text-xl">User Name: <span className="font-bold">{data.username}</span></div>
            </div>
          </Panel>
          <Panel header="EXPORT" key="2" >
            <Button className="py-5 m-2" onClick={() => dispatch(downloadStateJSON())} > <FolderInput /> Export JSON</Button>
            <Button className="py-5 m-2" onClick={() => generateReport("csv")} loading={loading === "csv"}> <FolderInput /> Export CSV</Button>
            <Button className="py-5 m-2" onClick={() => generateReport("xlsx")} loading={loading === "xlsx"}> <FolderInput /> Export XLSX</Button>

          </Panel>
          <Panel header="DANGER ZONE" key="3" >
            <Button
              className="bg-blue-600 mb-4 hover:!bg-blue-500 p-5 text-white hover:!text-blue-100"
              onClick={handleLogout}
            >
              Logout
            </Button>
            <p>It will clear all the data you have. The action cannot be undone.</p>
            <Popconfirm
              title="Delete user"
              description="Are you sure to delete your details?"
              okText="Delete"
              cancelText="No"
              onConfirm={handleRemove}
              okButtonProps={{ loading: loading === "deleting" }}
            >
              <Button className="bg-red-600 mt-4 hover:!bg-red-500 p-5 text-white hover:!text-red-100"> <Trash2 /> Delete you account</Button>
            </Popconfirm>
          </Panel>
        </Collapse>
      </div>
    </div>
  )
}

export default Settings