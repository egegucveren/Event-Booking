// Registration page: guides new users into attendee or organiser onboarding.
import Link from "next/link";
import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/forms/register-form";
import { buttonClassName } from "@/components/ui/button";
import { getRoleHome, getSessionUser } from "@/lib/auth";

export default async function RegisterPage() {
  const user = await getSessionUser();
  if (user) {
    redirect(getRoleHome(user.role));
  }

  return (
    <section className="auth-layout">
      <div className="glass-panel stack-lg">
        <p className="eyebrow">Create your place in the system</p>
        <h1>Choose whether you’re running events or attending them, then get straight to a relevant dashboard.</h1>
        <p>Admins are intentionally managed separately so role-based access stays controlled.</p>
        <RegisterForm />
      </div>

      <div className="auth-aside">
        <div className="glass-panel stack-md">
          <h2>Why the flow feels cohesive</h2>
          <p>Registration, sessions, CRUD actions, and dashboard routing all work together so each user can complete meaningful tasks from the first screen onward.</p>
          <Link className={buttonClassName("ghost")} href="/login">
            Already have an account?
          </Link>
        </div>
      </div>
    </section>
  );
}
