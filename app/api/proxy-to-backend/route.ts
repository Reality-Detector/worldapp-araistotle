import { NextRequest, NextResponse } from 'next/server';

/**
 * Simple server-side proxy to forward a limited set of endpoints to the external
 * fact-check backend using a server-side API key. This prevents exposing the
 * backend API key in the browser and allows unauthenticated "machine-mode"
 * requests from the frontend.
 *
 * Environment variable required: FACT_CHECK_API_KEY (Bearer token)
 */
const ALLOWED_ENDPOINTS = new Set(['/extract-claim', '/fact-check-sync']);

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.FACT_CHECK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Server misconfiguration: FACT_CHECK_API_KEY not set' }, { status: 500 });
    }

    const body = await req.json();
    const { endpoint, payload } = body || {};

    if (!endpoint || typeof endpoint !== 'string' || !ALLOWED_ENDPOINTS.has(endpoint)) {
      return NextResponse.json({ success: false, error: 'Invalid or disallowed endpoint' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://r8wncu74i2.us-west-2.awsapprunner.com';
    const url = `${baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Validator': 'worldapp',
        'Frontend': 'worldapp'
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    let responseData: any = null;
    try { responseData = JSON.parse(text); } catch { responseData = text; }

    return NextResponse.json(responseData, { status: response.status });
  } catch (err) {
    console.error('proxy-to-backend error', err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
