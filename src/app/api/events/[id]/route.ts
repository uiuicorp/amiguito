import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../utils/mongodb";

type Participant = {
  name: string;
  userId: string;
  isOwner: boolean;
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  console.log("Received GET request for event ID:", id);

  if (!id) {
    console.error("Invalid Event ID:", id);
    return NextResponse.json({ error: "Invalid Event ID" }, { status: 400 });
  }

  try {
    const { db } = await connectToDatabase();
    console.log("Connected to database");

    // @ts-expect-error: MongoDB expects ObjectId, but we are using string for simplicity
    const event = await db.collection("events").findOne({ _id: id });

    if (!event) {
      console.error("Event not found for ID:", id);
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    console.log("Event found:", event);
    return NextResponse.json(event, { status: 200 });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();
  const { participant, userId } = await req.json();

  console.log(
    "Received POST request to join event ID:",
    id,
    "with participant:",
    participant,
    "and user ID:",
    userId
  );

  if (!id || !participant || !userId) {
    console.error(
      "Invalid Event ID, participant, or user ID:",
      id,
      participant,
      userId
    );
    return NextResponse.json(
      { error: "Invalid Event ID, participant, or user ID" },
      { status: 400 }
    );
  }

  try {
    const { db } = await connectToDatabase();
    console.log("Connected to database");

    const result = await db.collection("events").updateOne(
      // @ts-expect-error: MongoDB expects ObjectId, but we are using string for simplicity
      { _id: id },
      { $addToSet: { participants: { name: participant, userId: userId } } }
    );

    if (result.modifiedCount === 0) {
      console.error("Failed to add participant to event ID:", id);
      return NextResponse.json(
        { error: "Failed to add participant" },
        { status: 500 }
      );
    }

    // @ts-expect-error: MongoDB expects ObjectId, but we are using string for simplicity
    const updatedEvent = await db.collection("events").findOne({ _id: id });

    console.log("Participant added successfully to event ID:", id);
    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error) {
    console.error("Error adding participant to event ID:", id, error);
    return NextResponse.json(
      { error: "Failed to add participant" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();
  const { userId } = await req.json();

  console.log(
    "Received DELETE request for event ID:",
    id,
    "and user ID:",
    userId
  );

  if (!id || !userId) {
    console.error("Invalid Event ID or user ID:", id, userId);
    return NextResponse.json(
      { error: "Invalid Event ID or user ID" },
      { status: 400 }
    );
  }

  try {
    const { db } = await connectToDatabase();
    console.log("Connected to database");

    // @ts-expect-error: MongoDB expects ObjectId, but we are using string for simplicity
    const event = await db.collection("events").findOne({ _id: id });

    if (!event) {
      console.error("Event not found for ID:", id);
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const isOwner: boolean = event.participants.some(
      (p: Participant) => p.userId === userId && p.isOwner
    );
    const remainingParticipants = event.participants.filter(
      (p: Participant) => p.userId !== userId
    );

    if (isOwner && remainingParticipants.length === 0) {
      return NextResponse.json(
        { error: "Owner cannot be removed if there are other participants" },
        { status: 400 }
      );
    }

    const updatedEvent = await db.collection("events").updateOne(
      // @ts-expect-error: MongoDB expects ObjectId, but we are using string for simplicity
      { _id: id },
      { $set: { participants: remainingParticipants } }
    );

    console.log("Participant removed successfully from event ID:", id);
    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error) {
    console.error("Error removing participant from event ID:", id, error);
    return NextResponse.json(
      { error: "Failed to remove participant" },
      { status: 500 }
    );
  }
}
