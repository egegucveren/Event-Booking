import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/forms/login-form";
import { buttonClassName } from "@/components/ui/button";
import { getRoleHome, getSessionUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) {
    redirect(getRoleHome(user.role));
  }

  return (
    <section className="auth-layout">
      <div className="glass-panel stack-lg">
        <p className="eyebrow">Welcome back</p>
        <h1>Log in to keep your events, bookings, and admin tools in sync.</h1>
        <p>Enter your email and password to continue. Your session is kept secure and tied to your account.</p>
        <LoginForm />
      </div>

      <div className="auth-aside">
        <div className="glass-panel stack-lg">
          <p className="eyebrow">Demo accounts after seeding</p>
          <ul className="demo-list">
            <li>
              <strong>Admin:</strong> admin@pulsepass.local / Passo123!
            </li>
            <li>
              <strong>Organiser:</strong> organiser@pulsepass.local / Passo123!
            </li>
            <li>
              <strong>Attendee:</strong> attendee@pulsepass.local / Passo123!
            </li>
            <li>
              <strong>Attendee:</strong> ava@pulsepass.local / Passo123!
            </li>
            <li>
              <strong>Attendee:</strong> noah@pulsepass.local / Passo123!
            </li>
            <li>
              <strong>Attendee:</strong> sofia@pulsepass.local / Passo123!
            </li>
            <li>
              <strong>Attendee:</strong> ethan@pulsepass.local / Passo123!
            </li>
          </ul>
        </div>

        <div className="glass-panel stack-md">
          <h2>Need an account?</h2>
          <p>Create an attendee or organiser profile and let the system route you to the right dashboard automatically.</p>
          <Link className={buttonClassName("secondary")} href="/register">
            Create Account
          </Link>
        </div>
      </div>
    </section>
  );
}
