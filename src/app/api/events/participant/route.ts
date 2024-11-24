import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../utils/mongodb";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    console.error("Invalid user ID:", userId);
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  try {
    const { db } = await connectToDatabase();

    const events = await db
      .collection("events")
      .find({ "participants.userId": userId })
      .toArray();

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error("Error fetching events for user ID:", userId, error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
