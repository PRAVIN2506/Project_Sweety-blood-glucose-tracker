import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAppDispatch } from "../hooks/useAppDispatch";
import { useAppSelector } from "../hooks/useAppSelector";
import { loginUser, clearAuthError } from "../features/auth/authSlice";
import { useToast } from "../components/common/useToast";

function LoginPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const toast = useToast();

    const { status, error } = useAppSelector((state) => state.auth);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            await dispatch(loginUser({ email, password })).unwrap();
            toast.success("Signed in successfully.");
            navigate("/dashboard");
        } catch {
            // Redux stores the error message and displays it in the inline alert.
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-12">
            <div className="w-full max-w-md rounded-lg border border-border-strong bg-surface p-8">
                <div className="mb-6">
                    <div className="mb-3 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
                        <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
                            Sweety Blood Glucose Tracker
                        </span>
                    </div>

                    <h1 className="text-xl font-semibold text-text-primary">
                        Sign in
                    </h1>

                    <p className="mt-1 text-sm text-text-secondary">
                        Enter your credentials to access your blood glucose records.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-text-secondary">
                            Email address
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => {
                                setEmail(event.target.value);
                                dispatch(clearAuthError());
                            }}
                            required
                            autoComplete="email"
                            className="w-full rounded border border-border-strong bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                            placeholder="name@example.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-text-secondary">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(event) => {
                                setPassword(event.target.value);
                                dispatch(clearAuthError());
                            }}
                            required
                            autoComplete="current-password"
                            className="w-full rounded border border-border-strong bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                            placeholder="Enter your password"
                        />
                    </div>

                    {error && (
                        <div role="alert" className="rounded border border-critical-border bg-critical-bg p-3 text-xs text-critical">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={status === "loading"}
                        className="w-full rounded bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {status === "loading" ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                <p className="mt-6 text-center text-xs text-text-secondary">
                    Don't have an account?{" "}
                    <Link to="/register" className="font-medium text-accent hover:underline">
                        Create account
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
