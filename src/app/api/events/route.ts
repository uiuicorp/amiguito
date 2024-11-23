import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../utils/mongodb";

export async function POST(req: NextRequest) {
  const { eventName, eventDate, ownerId, participant } = await req.json();

  if (!eventName || !eventDate || !ownerId || !participant) {
    return NextResponse.json(
      { error: "Event name, date, owner ID, and participant are required" },
      { status: 400 }
    );
  }

  try {
    const { db } = await connectToDatabase();
    const result = await db.collection("events").insertOne({
      _id: eventName,
      eventName,
      eventDate,
      participants: [{ name: participant, userId: ownerId, isOwner: true }],
    });
    return NextResponse.json({ _id: result.insertedId }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
