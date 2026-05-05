"use client";

import { useRef, useState } from "react";

type CustomSelectProps = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

export function CustomSelect({ options, value, onChange }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setOpen(false);
    }
  }

  return (
    <div className="custom-select" onBlur={handleBlur} ref={containerRef} tabIndex={-1}>
      <button
        aria-expanded={open}
        className="custom-select__trigger custom-select__trigger--full"
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        <span>{value}</span>
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
        <ul className="custom-select__menu custom-select__menu--full" role="listbox">
          {options.map((option) => (
            <li aria-selected={option === value} key={option} role="option">
              <button
                className={`custom-select__option${option === value ? " custom-select__option--active" : ""}`}
                onClick={() => { onChange(option); setOpen(false); }}
                type="button"
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
