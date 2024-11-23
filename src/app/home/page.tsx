"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession() as {
    data: {
      user: {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
      };
    } | null;
    status: string;
  };
  interface Event {
    _id: string;
    eventName: string;
    participants: { name: string; userId: string }[];
  }

  const [participatingEvents, setParticipatingEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      if (session) {
        const response = await fetch(
          `/api/events/participant?userId=${session.user?.id}`
        );
        const data = await response.json();
        if (Array.isArray(data)) {
          setParticipatingEvents(data);
        } else {
          console.error("Unexpected response format:", data);
          setParticipatingEvents([]);
        }
      }
    };

    fetchEvents();
  }, [session]);

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
          {participatingEvents.map((event) => (
            <li key={event._id}>{event.eventName}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
