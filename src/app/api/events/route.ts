import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../utils/mongodb";

type Participant = {
  name: string;
  userId: string;
  isOwner: boolean;
};

export async function POST(req: NextRequest) {
  const { eventName, eventDate, ownerId, participant, userId } =
    await req.json();

  if (!eventName || !eventDate || !ownerId || !participant) {
    return NextResponse.json(
      { error: "Event name, date, owner ID, and participant are required" },
      { status: 400 }
    );
  }

  try {
    const { db } = await connectToDatabase();
    const event = await db.collection("events").findOne({ _id: eventName });

    if (event) {
      const updatedEvent = await db.collection("events").updateOne(
        { _id: eventName },
        {
          $addToSet: {
            participants: { name: participant, userId, isOwner: false },
          },
        }
      );
      return NextResponse.json(updatedEvent, { status: 200 });
    } else {
      const result = await db.collection("events").insertOne({
        _id: eventName,
        eventName,
        eventDate,
        participants: [{ name: participant, userId: ownerId, isOwner: true }],
      });
      return NextResponse.json({ _id: result.insertedId }, { status: 201 });
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to create or join event" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { eventName, userId, deleteEvent } = await req.json();

    if (!eventName || !userId || typeof deleteEvent !== "boolean") {
      console.error("Invalid request payload:", {
        eventName,
        userId,
        deleteEvent,
      });
      return NextResponse.json(
        { error: "Event name, user ID, and deleteEvent flag are required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const event = await db.collection("events").findOne({ _id: eventName });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const isOwner: boolean = event.participants.some(
      (p: Participant) => p.userId === userId && p.isOwner
    );

    if (deleteEvent) {
      if (!isOwner) {
        return NextResponse.json(
          { error: "Only the owner can delete the event" },
          { status: 403 }
        );
      }
      await db.collection("events").deleteOne({ _id: eventName });
      return NextResponse.json({ message: "Event deleted" }, { status: 200 });
    }

    const remainingParticipants = event.participants.filter(
      (p: Participant) => p.userId !== userId
    );

    const updatedEvent = await db
      .collection("events")
      .updateOne(
        { _id: eventName },
        { $set: { participants: remainingParticipants } }
      );

    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error) {
    console.error("Error processing DELETE request:", error);
    return NextResponse.json(
      { error: "Failed to remove participant" },
      { status: 500 }
    );
  }
}
