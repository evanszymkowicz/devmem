import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";

/**
 * Parse and validate a JSON request body against a Zod schema. Returns the typed
 * data, or a 400 `NextResponse` (in the standard `{ success, error }` shape) the
 * caller returns as-is — for a malformed body or a Zod validation failure. Any
 * non-Zod error is rethrown so the route's own try/catch can handle it.
 *
 * Usage:
 *   const parsed = await parseJsonBody(request, registerSchema);
 *   if (parsed instanceof NextResponse) return parsed;
 *   const { email, password } = parsed.data;
 */
export async function parseJsonBody<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<{ data: T } | NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  try {
    return { data: schema.parse(body) };
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }
    throw error;
  }
}
