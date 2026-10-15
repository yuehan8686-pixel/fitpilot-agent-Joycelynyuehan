import { coachRequestSchema } from "../../../domain/schemas";
import type { CoachRequest } from "../../../domain/types";
import { getCoachResponse } from "../../../lib/openai-coach";

export async function POST(request: Request) {
  let input: unknown;

  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }

  const parsed = coachRequestSchema.safeParse(input);
  if (!parsed.success) {
    return Response.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }

  const response = await getCoachResponse(parsed.data as CoachRequest);
  return Response.json(response, {
    headers: { "Cache-Control": "no-store" },
  });
}
