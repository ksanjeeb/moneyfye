import { Button, Collapse } from "antd"
import { ChevronRight, FolderInput, Trash2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { downloadStateJSON, removeAllAccount } from "../slices/user-details";
import PageHeader from "../components/page-header";

const { Panel } = Collapse;


const Settings = () => {
  const dispatch = useDispatch();
  
  const handleRemove=()=>{
    dispatch(removeAllAccount());
    window.location.reload();  
  }

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
          <Panel header="EXPORT" key="2" >
            <Button className="py-5 my-2" onClick={()=> dispatch(downloadStateJSON())}> <FolderInput /> Export JSON</Button>
          </Panel>
          <Panel header="DANGER ZONE" key="3" >
            <p>It will clear all the data you have. The action cannot be undone.</p>
            <Button onClick={handleRemove} className="bg-red-600 mt-4 hover:!bg-red-500 p-5 text-white hover:!text-red-100"> <Trash2 /> Delete you account</Button>
          </Panel>
        </Collapse>
      </div>
    </div>
  )
}

export default Settings