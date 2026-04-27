import { NextResponse } from "next/server";
import { cloudinary } from "../../../../lib/cloudinary";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const paramsToSign = body?.paramsToSign;

    if (!paramsToSign || typeof paramsToSign !== "object") {
      return NextResponse.json(
        { error: "Missing paramsToSign" },
        { status: 400 }
      );
    }

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET as string
    );

    return NextResponse.json({ signature });
  } catch (error) {
    console.error("Cloudinary sign error:", error);
    return NextResponse.json(
      { error: "Failed to sign upload request" },
      { status: 500 }
    );
  }
}