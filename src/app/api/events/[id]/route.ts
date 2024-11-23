import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../utils/mongodb";

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
