import Link from "next/link";

import { logoutAction } from "@/actions/auth";
import { buttonClassName } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import type { SessionUser } from "@/lib/types";

type SiteHeaderProps = {
  user: SessionUser | null;
};

export function SiteHeader({ user }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="brand" href="/">
          <span className="brand__mark">PP</span>
          <span>
            PulsePass
            <small>event command centre</small>
          </span>
        </Link>

        <nav className="site-nav">
          <Link href="/">Home</Link>
          <Link href="/#events">Events</Link>
          {user?.role === "organiser" ? <Link href="/organiser">Organiser</Link> : null}
          {user?.role === "attendee" ? <Link href="/attendee">Attendee</Link> : null}
          {user?.role === "admin" ? <Link href="/admin">Admin</Link> : null}
        </nav>

        <div className="site-header__actions">
          {user ? (
            <>
              <div className="site-header__user">
                <strong>{user.name}</strong>
                <StatusBadge
                  label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  tone={user.role === "admin" ? "warning" : "success"}
                />
              </div>
              <form action={logoutAction}>
                <button className={buttonClassName("ghost", "sm")} type="submit">
                  Log Out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link className={buttonClassName("ghost", "sm")} href="/login">
                Log In
              </Link>
              <Link className={buttonClassName("primary", "sm")} href="/register">
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
