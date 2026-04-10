import { NextResponse } from "next/server";
import {
  processGatewayRequest,
  getFlowConfigById,
} from "@/lib/n8n-gateway";
import type { N8nGatewayRequest } from "@/lib/n8n-gateway";

const WEBHOOK_SECRET =
  process.env.VESPER_WEBHOOK_SECRET || "vesper-dev-secret";

/**
 * POST /api/n8n/execute
 *
 * Triggers an n8n workflow through the HIPAA/PHI-compliant gateway.
 * Accepts: { flowId, agentSlug, agentName, agentZone?, payload? }
 */
export async function POST(request: Request) {
  const secret = request.headers.get("x-vesper-webhook-secret");
  if (secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { flowId, agentSlug, agentName, agentZone, payload } = body as {
    flowId: string;
    agentSlug: string;
    agentName?: string;
    agentZone?: string;
    payload?: Record<string, unknown>;
  };

  if (!flowId || !agentSlug) {
    return NextResponse.json(
      { error: "flowId and agentSlug are required" },
      { status: 400 }
    );
  }

  // Verify flow exists
  const flow = getFlowConfigById(flowId);
  if (!flow) {
    return NextResponse.json(
      { error: `Flow not found: ${flowId}` },
      { status: 404 }
    );
  }

  // Build gateway request
  const gatewayRequest: N8nGatewayRequest = {
    flowId,
    agentId: agentSlug,
    agentName: (agentName as string) ?? agentSlug,
    agentZone: (agentZone as "clinical" | "operations" | "external") ?? flow.agentZone,
    payload: (payload as Record<string, unknown>) ?? {},
    userId: "system",
    sessionId: crypto.randomUUID(),
    executionMode: flow.executionMode,
    timestamp: new Date().toISOString(),
  };

  // Process through gateway (PHI scan, audit, forward to n8n)
  const response = await processGatewayRequest(gatewayRequest);

  return NextResponse.json(response, {
    status: response.success ? 200 : 502,
  });
}
