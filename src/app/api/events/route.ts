import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../utils/mongodb";

export async function POST(req: NextRequest) {
  const { eventName, eventDate } = await req.json();

  if (!eventName || !eventDate) {
    return NextResponse.json(
      { error: "Event name and date are required" },
      { status: 400 }
    );
  }

  try {
    const { db } = await connectToDatabase();
    const result = await db.collection("events").insertOne({
      _id: eventName,
      eventName,
      eventDate,
      participants: [],
    });
    return NextResponse.json({ _id: result.insertedId }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
