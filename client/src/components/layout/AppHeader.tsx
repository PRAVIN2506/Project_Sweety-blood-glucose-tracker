import { NavLink, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { useAppSelector } from "../../hooks/useAppSelector";
import { logout } from "../../features/auth/authSlice";
import { clearReadings } from "../../features/readings/readingsSlice";
import { clearReports } from "../../features/reports/reportsSlice";
import { useToast } from "../common/useToast";

function AppHeader() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = async () => {
    await dispatch(logout());
    dispatch(clearReadings());
    dispatch(clearReports());
    toast.info("Signed out successfully.");
    navigate("/login", { replace: true });
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center px-3 py-1.5 text-sm font-medium border-b-2 transition-colors ${
      isActive
        ? "border-accent text-text-primary"
        : "border-transparent text-text-secondary hover:text-text-primary"
    }`;

  return (
    <header className="border-b border-border-subtle bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8 py-3">
          <NavLink
            to="/dashboard"
            className="flex items-center gap-2 text-base font-semibold text-text-primary"
          >
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            <span>Sweety</span>
          </NavLink>

          <nav aria-label="Main navigation" className="flex items-center gap-1">
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/readings" className={navLinkClass}>
              Readings
            </NavLink>
            <NavLink to="/reports" className={navLinkClass}>
              Reports
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-4 py-3">
          <span className="hidden text-xs text-text-muted sm:inline-block">
            {user?.name || user?.email || "Account"}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded border border-border-strong bg-surface px-3 py-1 text-xs font-medium text-text-secondary hover:bg-surface-subtle hover:text-text-primary transition"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
