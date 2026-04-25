import { NextResponse } from "next/server";
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import { env } from "@/lib/env";

export const revalidate = 0;

function createSafeId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function GET(request: Request) {
  if (!env.liveKitUrl || !env.liveKitApiKey || !env.liveKitApiSecret) {
    return NextResponse.json(
      {
        error:
          "LiveKit is not configured. Set LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET in your local environment."
      },
      { status: 500 }
    );
  }

  const requestUrl = new URL(request.url);
  const requestedRoom = requestUrl.searchParams.get("room");
  const roomName = requestedRoom?.startsWith("vidya-room-") ? requestedRoom : createSafeId("vidya-room");
  const identity = createSafeId("student");
  const liveKitHttpUrl = env.liveKitUrl.replace(/^wss:/, "https:").replace(/^ws:/, "http:");
  const roomClient = new RoomServiceClient(liveKitHttpUrl, env.liveKitApiKey, env.liveKitApiSecret);

  const existingRooms = await roomClient.listRooms([roomName]);
  if (existingRooms.length === 0) {
    await roomClient.createRoom({
      name: roomName,
      emptyTimeout: 120,
      departureTimeout: 60,
      maxParticipants: 4
    });
  }
  const token = new AccessToken(env.liveKitApiKey, env.liveKitApiSecret, {
    identity,
    name: "Vidya student",
    ttl: "1h"
  });

  token.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true
  });

  return NextResponse.json(
    {
      serverUrl: env.liveKitUrl,
      token: await token.toJwt(),
      roomName,
      identity
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
