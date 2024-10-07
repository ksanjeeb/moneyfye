import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { RootState } from "./store";
import { getBearerToken } from "./utils/custom";
import apiService from "./utils/service-utils";
import toast from "react-hot-toast";
import { addAllAccount, addAllTransactions, addName } from "./slices/user-details";

interface ProtectedProps {
    element: React.ReactNode;
}

export default function Protected({ element }: ProtectedProps) {
    const navigate = useNavigate();
    // const accounts = useSelector((state: RootState) => state.accounts);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const checkAuthorization = async () => {
            const token = getBearerToken();

            if (token) {
                const res = await getDetails();
                if (res?.data?.accounts?.length === 0) {
                    navigate("/add-account");
                } else {
                    setLoading(false);
                }
            } else {
                navigate("/login");
            }
        };

        checkAuthorization();
    }, []);

    const getDetails = async () => {
        const toastPromise = toast.promise(
            apiService.get('/user/data'),
            {
                loading: 'Fetching accounts...',
                success: (response) => {
                    if (response.statusCode === 200) {
                        dispatch(addAllAccount(response?.data?.accounts || []));
                        dispatch(addName(response?.data?.username || []));
                        return response.message;
                    }
                    throw new Error(response.message);
                },
                error: (err: any) => {
                    return err?.message || "Account retrieval failed!";
                },
            }
        );

        try {
            return await toastPromise;
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="loader">Loading...</div>
            </div>
        );
    }

    return <>{element}</>;
}
