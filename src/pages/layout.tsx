import { Divider, } from "antd";
import { ArrowRightLeft, CircleUserRound, FileText, LayoutDashboard, Settings } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

interface Route {
    value: string;
    label: string;
    icon?: React.ReactNode;
}

export const routeMap: Route[] = [
    { value: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
    { value: 'transaction', label: 'Transaction', icon: <ArrowRightLeft /> },
    { value: 'accounts', label: 'Accounts', icon: <CircleUserRound /> },
    { value: 'reports', label: 'Reports', icon: <FileText /> },
    // { value: 'budgets', label: 'Budgets', icon: <HandCoins /> },
    { value: 'settings', label: 'Settings', icon: <Settings /> },
];

export const AppLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    const firstRoute = pathSegments[0];

    return (
        <div className="flex min-h-screen w-full">
            <aside className="hidden md:flex md:flex-col gap-4 w-1/5 p-6 border-r-2 stickly left-0 top-0">
                <p className="flex items-center font-bold text-3xl ">
                    <img
                        src="/logo.svg"
                        alt="Moneyfye Logo"
                        className="w-8 h-8 mr-2"
                    />
                    <span className="text-orange-400 pb-1">
                        Moneyfye
                    </span>
                </p>
                <Divider className="my-0" />
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
            </aside>
            <main className="flex-1 p-6">
                <Outlet />
            </main>
        </div>
    )
};
