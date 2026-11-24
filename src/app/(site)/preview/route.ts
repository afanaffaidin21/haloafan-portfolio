import { draftMode } from "next/headers";
import { NextResponse } from "next/server";
import { getPayload } from "payload";

import { isOwner } from "@/access/roles";
import { getPost } from "@/lib/content";
import { isValidSlug, previewTarget } from "@/lib/preview";
import config from "@/payload.config";

export async function GET(request: Request): Promise<Response> {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });
  if (!isOwner(user)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const slug = new URL(request.url).searchParams.get("slug");
  if (!isValidSlug(slug)) {
    return new Response("Invalid slug", { status: 400 });
  }

  const post = await getPost(slug, { draft: true });
  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  const draft = await draftMode();
  draft.enable();

  const target = previewTarget(isValidSlug(post.slug) ? post.slug : slug);
  return NextResponse.redirect(new URL(target, request.url), 307);
}
