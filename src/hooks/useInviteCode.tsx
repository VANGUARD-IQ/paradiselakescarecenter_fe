// src/hooks/useInviteCode.ts
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const useInviteCode = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const inviteCode = searchParams.get("inviteCode");

        if (inviteCode) {
            localStorage.setItem("pendingInviteCode", inviteCode);

            if (!user) {
                // If user is not logged in, redirect to login page
                // navigate('/login', { state: { from: location.pathname } });
            } else {
                // If user is logged in, clear the invite code from the URL
                searchParams.delete("inviteCode");
                navigate(location.pathname + "?" + searchParams.toString(), { replace: true });
            }
        }
    }, [location, navigate, user]);
};