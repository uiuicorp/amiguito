import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../utils/mongodb";

type Participant = {
  name: string;
  userId: string;
  isOwner: boolean;
};

const drawParticipants = (participants: Participant[]) => {
  let shuffled = participants.slice().sort(() => Math.random() - 0.5);
  const result: { [key: string]: string } = {};

  const hasMultipleCycles = (result: { [key: string]: string }) => {
    const visited = new Set<string>();
    let current = Object.keys(result)[0];
    while (!visited.has(current)) {
      visited.add(current);
      current = result[current];
    }
    return visited.size !== participants.length;
  };

  do {
    shuffled = participants.slice().sort(() => Math.random() - 0.5);
    for (let i = 0; i < participants.length; i++) {
      result[participants[i].userId] = shuffled[i].userId;
    }
  } while (
    participants.some((p, i) => p.userId === shuffled[i].userId) ||
    hasMultipleCycles(result)
  );

  return result;
};

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").slice(-2, -1)[0];
  const { userId } = await req.json();

  if (!id || !userId) {
    console.error("Invalid Event ID or user ID:", id, userId);
    return NextResponse.json(
      { error: "Invalid Event ID or user ID" },
      { status: 400 }
    );
  }

  try {
    const { db } = await connectToDatabase();

    // @ts-expect-error: MongoDB expects ObjectId, but we are using string for simplicity
    const event = await db.collection("events").findOne({ _id: id });

    if (!event) {
      const errorText = "Event not found";
      console.error("Event not found for ID:", id, errorText);
      return NextResponse.json({ error: errorText }, { status: 404 });
    }

    if (event.participants.length < 3) {
      return NextResponse.json(
        { error: "At least 3 participants are required to perform the draw" },
        { status: 400 }
      );
    }

    const drawResult = drawParticipants(event.participants);

    const result = await db.collection("events").updateOne(
      // @ts-expect-error: MongoDB expects ObjectId, but we are using string for simplicity
      { _id: id },
      { $set: { drawResult } }
    );

    if (result.modifiedCount === 0) {
      console.error("Failed to save draw result for event ID:", id);
      return NextResponse.json(
        { error: "Failed to save draw result" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Draw performed successfully", drawResult },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error performing draw for event ID:", id, error);
    return NextResponse.json(
      { error: "Failed to perform draw" },
      { status: 500 }
    );
  }
}
