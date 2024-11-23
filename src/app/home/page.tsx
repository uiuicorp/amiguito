"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  interface Event {
    _id: string;
    eventName: string;
  }

  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await fetch("/api/events");
      const data = await response.json();
      setEvents(data);
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleCreateClick = () => {
    router.push(`/create`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-8">
        Amigo Secreto {session ? `- Bem-vindo, ${session.user?.name}` : ""}
      </h1>
      <button
        className="p-2 bg-green-500 text-white rounded mb-8"
        onClick={handleCreateClick}
      >
        Criar Amigo Secreto
      </button>
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Participando</h2>
        <ul className="list-disc pl-5">
          {events.map((event) => (
            <li key={event._id}>{event.eventName}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
