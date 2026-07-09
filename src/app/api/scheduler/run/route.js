import { NextResponse } from "next/server";
import { runScheduler } from "@/lib/services/scheduler.service";
import { SCHEDULER_AUTH_HEADER } from "@/lib/utils/constants";

/**
 * Trigger endpoint for the auto-refill scheduler.
 *
 * Protected by a shared secret rather than user auth, since this is called
 * by the GitHub Actions cron job (workflows/scheduler-cron.yml), not by a
 * logged-in user. Expects:
 *
 *   Authorization: Bearer <SCHEDULER_SECRET>
 */
export async function POST(request) {
  try {
    const secret = process.env.SCHEDULER_SECRET;
    if (!secret) {
      return NextResponse.json(
        { message: "Scheduler is not configured (missing SCHEDULER_SECRET)" },
        { status: 500 }
      );
    }

    const authHeader = request.headers.get(SCHEDULER_AUTH_HEADER) || "";
    const providedSecret = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (providedSecret !== secret) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const summary = await runScheduler();
    return NextResponse.json(summary);
  } catch (err) {
    return NextResponse.json(
      { message: err.message || "Scheduler run failed" },
      { status: 500 }
    );
  }
}