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
  const { eventName, userId } = await req.json();

  if (!eventName || !userId) {
    return NextResponse.json(
      { error: "Event name and user ID are required" },
      { status: 400 }
    );
  }

  try {
    const { db } = await connectToDatabase();
    const event = await db.collection("events").findOne({ _id: eventName });

    if (!event) {
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

    const updatedEvent = await db
      .collection("events")
      .updateOne(
        { _id: eventName },
        { $set: { participants: remainingParticipants } }
      );

    return NextResponse.json(updatedEvent, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to remove participant" },
      { status: 500 }
    );
  }
}
