"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useSession } from "next-auth/react";
import { FaTrash, FaCrown } from "react-icons/fa";
import { useRouter } from "next/navigation";
import styles from "./SecretFriend.module.css";

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
  const [drawResult, setDrawResult] = useState<{
    [key: string]: string;
  } | null>(null);
  const { data: session } = useSession();
  const router = useRouter();
  const [isRevealed, setIsRevealed] = useState(false);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${id}`);
      if (response.ok) {
        const data = await response.json();
        setEvent(data);
        setDrawResult(data.drawResult);
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

  const handleDeleteEventClick = async () => {
    if (!session) {
      console.error("No active session found.");
      return;
    }

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user?.id,
          deleteEvent: true,
        }),
      });

      if (response.ok) {
        setEvent(null);
        router.push("/home");
      } else {
        const errorText = await response.text();
        console.error(
          "Failed to delete event:",
          response.statusText,
          errorText
        );
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const handleDrawClick = async () => {
    if (!session) {
      console.error("No active session found.");
      return;
    }

    if (!event?.participants || event.participants.length < 3) {
      console.error(
        "At least 3 participants are required to perform the draw."
      );
      return;
    }

    try {
      const response = await fetch(`/api/events/${id}/draw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user?.id,
        }),
      });

      if (response.ok) {
        const updatedEvent = await response.json();
        setEvent(updatedEvent);
        setDrawResult(updatedEvent.drawResult);
      } else if (response.status === 404) {
        const errorText = await response.text();
        console.error("Event not found:", response.statusText, errorText);
      } else {
        console.error("Failed to perform draw:", response.statusText);
      }
    } catch (error) {
      console.error("Error performing draw:", error);
    } finally {
      fetchEvent();
    }
  };

  const handleRevealClick = () => {
    setIsRevealed((prev) => !prev);
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
                        event.participants?.find(
                          (participant) => participant.isOwner
                        )?.userId) ? (
                      <button
                        className="ml-4 text-red-500"
                        onClick={() => handleRemoveClick(p.userId)}
                        aria-label="remove participant"
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
      {event.participants?.find(
        (p) => p.userId === session?.user?.id && p.isOwner
      ) && (
        <>
          <button
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
            onClick={handleDeleteEventClick}
          >
            Excluir Amigo Secreto
          </button>
          <button
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
            onClick={handleDrawClick}
          >
            Realizar Sorteio
          </button>
        </>
      )}
      {drawResult && session?.user?.id && event?.participants && (
        <div className="mt-8 p-4 border rounded">
          <h2 className="text-xl font-bold">Seu amigo secreto é:</h2>
          <div
            className={`${styles.relative} w-64 h-32 mt-4 ${
              isRevealed ? "" : styles.flipped
            }`}
            onClick={handleRevealClick}
          >
            <div className={`${styles.inner}`}>
              <div className={`${styles.front} ${styles["backface-hidden"]}`}>
                <p className="text-gray-700">Click to reveal</p>
              </div>
              <div className={`${styles.back} ${styles["backface-hidden"]}`}>
                <p className="text-gray-700">
                  {
                    event.participants.find(
                      (participant) =>
                        participant.userId === drawResult[session.user.id]
                    )?.name
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
