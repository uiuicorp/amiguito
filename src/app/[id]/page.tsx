"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useSession } from "next-auth/react";
import { FaTrash, FaCrown } from "react-icons/fa";

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

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const isUserParticipant =
    event &&
    event.participants &&
    event.participants.some(
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
    } finally {
      fetchEvent();
    }
  };

  const handleRemoveClick = async (userId: string) => {
    if (!session) {
      console.error("No active session found.");
      return;
    }

    console.log("Removing participant with user ID:", userId);

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
        }),
      });

      if (response.ok) {
        const updatedEvent = await response.json();
        console.log("Successfully removed participant:", updatedEvent);
        setEvent(updatedEvent);
      } else {
        console.error("Failed to remove participant:", response.statusText);
      }
    } catch (error) {
      console.error("Error removing participant:", error);
    } finally {
      fetchEvent();
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
            {event.participants
              ?.filter((p) => p !== null)
              .map((p) => (
                <li
                  key={p.userId}
                  className="flex items-center justify-between"
                >
                  <span>{p.name}</span>
                  <div className="flex items-center">
                    {p.isOwner && <FaCrown className="mr-2" />}
                    {!p.isOwner &&
                    (session?.user?.id === p.userId ||
                      session?.user?.id ===
                        event.participants.find(
                          (participant) => participant.isOwner
                        )?.userId) ? (
                      <button
                        className="ml-4 text-red-500"
                        onClick={() => handleRemoveClick(p.userId)}
                      >
                        <FaTrash />
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </div>
      <button
        className="mt-8 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={handleJoinClick}
        hidden={!!isUserParticipant}
      >
        Join Secret Friend
      </button>
    </div>
  );
}
