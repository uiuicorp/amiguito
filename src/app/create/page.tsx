"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function CreateSecretFriend() {
  const router = useRouter();
  const { data: session } = useSession();
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventName, eventDate }),
      });

      if (response.ok) {
        router.push(`/${eventName}`);
      } else {
        const errorText = await response.text();
        setErrorMessage("Failed to create event: " + errorText);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage("Failed to create event: " + error.message);
      } else {
        setErrorMessage("Failed to create event: An unknown error occurred");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-8">
        Criar Amigo Secreto{" "}
        {session ? `- Bem-vindo, ${session.user?.name}` : ""}
      </h1>
      {errorMessage && (
        <div className="mb-4 p-2 bg-red-500 text-white rounded">
          {errorMessage}
        </div>
      )}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Event Name"
          className="p-2 border rounded"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
        />
        <input
          type="date"
          placeholder="Event Date"
          className="p-2 border rounded"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
        />
        <button type="submit" className="p-2 bg-blue-500 text-white rounded">
          Create
        </button>
      </form>
    </div>
  );
}
