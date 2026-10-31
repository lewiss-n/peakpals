import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getSession } from "@/lib/auth";
import { IMAGE_TYPES, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES, VIDEO_TYPES } from "@/lib/media";

export const runtime = "nodejs";

/** Issues short-lived tokens so the admin's browser can upload large files straight to Vercel Blob. */
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!(await getSession())) throw new Error("Unauthorised");
        if (!pathname.startsWith("incoming/")) throw new Error("Invalid upload path");
        return {
          allowedContentTypes: [...IMAGE_TYPES, ...Object.keys(VIDEO_TYPES)],
          maximumSizeInBytes: Math.max(MAX_IMAGE_BYTES, MAX_VIDEO_BYTES),
          addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload not allowed" }, { status: 400 });
  }
}
