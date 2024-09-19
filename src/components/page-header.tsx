import { Drawer } from "antd";
import { AlignJustify } from "lucide-react";
import { useState } from "react";
import { routeMap } from "../pages/layout";
import { useLocation, useNavigate } from "react-router-dom";

export default function PageHeader({ children }: { children: React.ReactNode; }) {
    const [open, setOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    const firstRoute = pathSegments[0];

    const showDrawer = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
    };


    return (
        <>
            <div className=" mb-6 flex flex-row gap-3">
                <div className="border-[1px] rounded-md p-1 block md:hidden" onClick={showDrawer}>
                    <AlignJustify />
                </div>
                <p className="text-xl font-medium text-stone-500 self-center">
                    {children}
                </p>
            </div>
            <Drawer
                title={<p className="flex items-center font-bold text-3xl ">
                    <img
                        src="/logo.svg"
                        alt="Moneyfye Logo"
                        className="w-8 h-8 mr-2"
                    />
                    <span className="text-orange-400 pb-1">
                        Moneyfye
                    </span>
                </p>}
                placement={"left"}
                closable={false}
                onClose={onClose}
                open={open}
            >
                <ul >
                    {routeMap.map(({ value, label, icon }) => (
                        <li
                            key={value}
                            className={`text-gray-500 font-medium py-2 flex items-center cursor-pointer hover:text-gray-900 ${firstRoute === value ? "font-bold text-gray-900" : ""}`}
                            onClick={() => navigate("/" + value)}
                        >
                            {icon && <span className="mr-2">{icon}</span>}
                            <span >
                                {label}
                            </span>
                        </li>
                    ))}
                </ul>

            </Drawer>
        </>

    )
}

