"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useSession } from "next-auth/react";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export default function SecretFriend() {
  const { id } = useParams() as { id: string };
  const [event, setEvent] = useState<{
    eventName: string;
    eventDate: string;
    participants: { name: string; userId: string; isOwner: boolean }[];
  } | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    console.log("useEffect triggered with ID:", id);
    const fetchEvent = async () => {
      console.log("Fetching event with ID:", id);
      try {
        const response = await fetch(`/api/events/${id}`);
        if (response.ok) {
          const data = await response.json();
          console.log("Event data received:", data);
          setEvent(data);
        } else {
          console.error("Failed to fetch event:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    };

    fetchEvent();
  }, [id]);

  const isUserParticipant = event?.participants.some(
    (participant) => participant.userId === session?.user?.id
  );

  const handleJoinClick = async () => {
    if (!session) {
      console.error("No active session found.");
      return;
    }

    console.log(
      "Joining event with ID:",
      id,
      "as participant:",
      session.user?.name,
      "with user ID:",
      session.user?.id
    );

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participant: session.user?.name,
          userId: session.user?.id,
        }),
      });

      if (response.ok) {
        const updatedEvent = await response.json();
        console.log("Successfully joined event:", updatedEvent);
        setEvent(updatedEvent);
      } else {
        console.error("Failed to join event:", response.statusText);
      }
    } catch (error) {
      console.error("Error joining event:", error);
    }
  };

  if (!event) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-8">
        Secret Friend Event: {event.eventName}
      </h1>
      <div className="flex flex-col gap-4">
        <div className="p-4 border rounded">Event Name: {event.eventName}</div>
        <div className="p-4 border rounded">Event Date: {event.eventDate}</div>
        <div className="p-4 border rounded">
          Participants:
          <ul>
            {event.participants.map((p) => (
              <li key={p.userId}>
                {p.name} {p.isOwner && <span>👑</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <button
        className="mt-8 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={handleJoinClick}
        hidden={isUserParticipant}
      >
        Join Secret Friend
      </button>
    </div>
  );
}
