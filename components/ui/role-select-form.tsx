"use client";

// Custom role selector used in the admin user table.
// Replaces the native <select> element to match the dark-theme design system.
import { useRef, useState } from "react";

import { updateUserRoleAction } from "@/actions/admin";
import { buttonClassName } from "@/components/ui/button";
import type { Role } from "@/lib/types";

type RoleSelectFormProps = {
  userId: number;
  currentRole: Role;
  roleOptions: Role[];
};

export function RoleSelectForm({ userId, currentRole, roleOptions }: RoleSelectFormProps) {
  const [selected, setSelected] = useState<Role>(currentRole);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when focus moves outside the component.
  function handleBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setOpen(false);
    }
  }

  return (
    <form action={updateUserRoleAction} className="inline-form" onSubmit={() => setOpen(false)}>
      <input name="userId" type="hidden" value={userId} />
      <input name="role" type="hidden" value={selected} />

      <div className="custom-select" onBlur={handleBlur} ref={containerRef} tabIndex={-1}>
        <button
          aria-expanded={open}
          className="custom-select__trigger"
          onClick={() => setOpen((prev) => !prev)}
          type="button"
        >
          <span>{selected}</span>
          <svg
            className={`custom-select__chevron${open ? " custom-select__chevron--open" : ""}`}
            fill="none"
            height="8"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            viewBox="0 0 12 8"
            width="12"
          >
            <path d="M1 1l5 5 5-5" />
          </svg>
        </button>

        {open && (
          <ul className="custom-select__menu" role="listbox">
            {roleOptions.map((role) => (
              <li aria-selected={role === selected} key={role} role="option">
                <button
                  className={`custom-select__option${role === selected ? " custom-select__option--active" : ""}`}
                  onClick={() => { setSelected(role); setOpen(false); }}
                  type="button"
                >
                  {role}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button className={buttonClassName("secondary", "sm")} type="submit">
        Save
      </button>
    </form>
  );
}
