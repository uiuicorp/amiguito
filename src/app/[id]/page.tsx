"use client";

import { useParams } from "next/navigation";

export default function SecretFriend() {
  const { id } = useParams() as { id: string };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-8">Secret Friend Event: {id}</h1>
      <div className="flex flex-col gap-4">
        <div className="p-4 border rounded">Event Name: Christmas Party</div>
        <div className="p-4 border rounded">Event Date: 25th December</div>
        <div className="p-4 border rounded">Participants: John, Jane, Doe</div>
      </div>
      <button className="mt-8 px-4 py-2 bg-blue-500 text-white rounded">
        Join Secret Friend
      </button>
    </div>
  );
}
