"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function SecretFriend() {
  const { id } = useParams() as { id: string };
  const [event, setEvent] = useState<{
    eventName: string;
    eventDate: string;
    participants: string[];
  } | null>(null);

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
          Participants: {event.participants.join(", ")}
        </div>
      </div>
      <button className="mt-8 px-4 py-2 bg-blue-500 text-white rounded">
        Join Secret Friend
      </button>
    </div>
  );
}
