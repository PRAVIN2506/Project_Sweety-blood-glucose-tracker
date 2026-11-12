import { useAppDispatch } from "../hooks/useAppDispatch";
import { useAppSelector } from "../hooks/useAppSelector";
import { logout } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

function DashboardPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const user = useAppSelector((state) => state.auth.user);

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-5xl">
                <h1 className="text-3xl font-bold text-gray-900">
                    Sweety Dashboard
                </h1>

                <p className="mt-3 text-gray-600">
                    Welcome, {user?.name || "User"}!
                </p>

                <button
                    onClick={handleLogout}
                    className="mt-6 rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}

export default DashboardPage;