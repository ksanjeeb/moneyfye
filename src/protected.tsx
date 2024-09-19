import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "./store";

interface ProtectedProps {
    element: React.ReactNode;
}

export default function Protected({ element }: ProtectedProps) {
    const navigate = useNavigate();
    const accounts = useSelector((state: RootState) => state.accounts);

    useEffect(() => {
        const checkAuthorization = () => {
            console.log(accounts.length)
            if (accounts.length === 0) {
                navigate("/");
            }
        };

        checkAuthorization();
    }, [navigate]);

    return <>{element}</>;
}
