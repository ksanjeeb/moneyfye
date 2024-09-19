
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Dashboard } from './pages/dashboard';
import Transaction from './pages/transaction';
import Accounts from './pages/accounts';
import Reports from './pages/reports';
import Budgets from './pages/budgets';
import Settings from './pages/settings';
import { AppLayout } from './pages/layout';
import Root from './pages/root';
import Protected from './protected';

const protectedRoutes = [
    { path: 'dashboard', element: <Dashboard /> },
    { path: 'transaction', element: <Transaction /> },
    { path: 'accounts', element: <Accounts /> },
    { path: 'reports', element: <Reports /> },
    { path: 'budgets', element: <Budgets /> },
    { path: 'settings', element: <Settings /> },
];

function Routes() {

    const router = createBrowserRouter([
        {
            path: '/',
            // element: <Root />, 
            children: [
                {
                    index: true,
                    element: <Root />, 
                },
                ...protectedRoutes.map(({ path, element }) => ({
                    path,
                    element: <Protected element={<AppLayout />} />, 
                    children: [
                        {
                            index: true,
                            element,
                        },
                    ],
                })),
            ],
        },
    ]);



    return (
        <>
            <RouterProvider router={router} />
        </>
    )
}

export default Routes