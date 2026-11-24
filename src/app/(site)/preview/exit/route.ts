import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

import { isValidSlug, previewTarget } from "@/lib/preview";

export async function POST(request: Request): Promise<Response> {
  const slug = new URL(request.url).searchParams.get("slug");
  const draft = await draftMode();
  draft.disable();

  const target = isValidSlug(slug) ? previewTarget(slug) : "/blog/";
  return NextResponse.redirect(new URL(target, request.url), 303);
}
