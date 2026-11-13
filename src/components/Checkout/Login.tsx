"use client";

import React, { useState } from "react";
import { authService } from "@/services/authService";
import { btnPrimary, inputClass, labelClass } from "./CheckoutParts";

interface LoginProps {
  onLoginSuccess: () => Promise<void> | void;
}

const Login = ({ onLoginSuccess }: LoginProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

 const handleSubmit = async () => {
  setError("");

  if (!email.trim() || !password) {
    setError("Please enter your email and password.");
    return;
  }

  setIsSubmitting(true);

  try {
    await authService.login({
      email: email.trim(),
      password,
    });

    await onLoginSuccess();

    setOpen(false);
    setPassword("");
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Unable to login. Please try again."
    );
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-gray-3 bg-white shadow-1 sm:mb-7.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 bg-[#F8F9FC] px-4 py-4 text-left sm:px-8 sm:py-5"
      >
        <span className="flex items-center gap-3.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E0E7FF] text-blue">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
            </svg>
          </span>
          <span>
            <span className="block font-semibold text-dark">
              Returning customer?
            </span>
            <span className="block text-sm text-[#4B5563]">
              Log in to use your saved addresses.
            </span>
          </span>
        </span>

        <svg
          className={`shrink-0 text-dark duration-200 ${
            open ? "rotate-180" : ""
          }`}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
{open && (
  <div className="border-t border-gray-3 p-4 sm:p-8">
          <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="checkout-email" className={labelClass}>
                Email
              </label>
              <input
                type="email"
                id="checkout-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="checkout-password" className={labelClass}>
                Password
              </label>
              <input
                type="password"
                id="checkout-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className={inputClass}
              />
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-[#FCA5A5] bg-[#FEE2E2] px-4 py-3 text-sm font-medium text-[#991B1B]"
            >
              {error}
            </div>
          )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={btnPrimary}
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
        </div>
      )}
    </div>
  );
};

export default Login;