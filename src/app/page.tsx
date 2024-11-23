"use client";

import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <LoadingSpinner />;
  }

  if (session) {
    router.push("/home");
    return null;
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div>amiguito </div>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => signIn("google", { callbackUrl: "/home" })}
        >
          Login
        </button>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        uiui corp
      </footer>
    </div>
  );
}
