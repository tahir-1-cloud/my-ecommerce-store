"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const Signin = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const ADMIN_EMAIL = "admin@example.com";
  const ADMIN_PASSWORD = "Admin@123";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    if (
      email.trim().toLowerCase() === ADMIN_EMAIL &&
      password === ADMIN_PASSWORD
    ) {
      // Temporary login session
      document.cookie =
        "admin_session=true; path=/; max-age=86400; samesite=lax";

      router.push("/admin");
      router.refresh();

      return;
    }

    setError("Invalid email or password.");
  };

  return (
    <>
      <Breadcrumb title={"Signin"} pages={["Signin"]} />

      <section className="overflow-hidden bg-gray-2 py-20">
        <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
          <div className="mx-auto w-full max-w-[570px] rounded-xl bg-white p-4 shadow-1 sm:p-7.5 xl:p-11">
            <div className="mb-11 text-center">
              <h2 className="mb-1.5 text-xl font-semibold text-dark sm:text-2xl xl:text-heading-5">
                Sign In to Your Account
              </h2>

              <p>Enter your detail below</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label htmlFor="email" className="mb-2.5 block">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full rounded-lg border border-gray-3 bg-gray-1 px-5 py-3 placeholder:text-dark-5 outline-none duration-200 focus:border-transparent focus:ring-2 focus:ring-blue/20 focus:shadow-input"
                />
              </div>

              <div className="mb-5">
                <label htmlFor="password" className="mb-2.5 block">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-lg border border-gray-3 bg-gray-1 px-5 py-3 placeholder:text-dark-5 outline-none duration-200 focus:border-transparent focus:ring-2 focus:ring-blue/20 focus:shadow-input"
                />
              </div>

              {error && (
                <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="mt-7.5 flex w-full justify-center rounded-lg bg-dark px-6 py-3 font-medium text-white ease-out duration-200 hover:bg-blue"
              >
                Sign in to account
              </button>

              <Link
                href="/"
                className="mt-4.5 block text-center text-dark-4 ease-out duration-200 hover:text-dark"
              >
                Back to store
              </Link>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signin;