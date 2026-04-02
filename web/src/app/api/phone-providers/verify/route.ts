import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { provider, credentials } = await req.json();

  if (!provider || !credentials) {
    return NextResponse.json({ success: false, error: "Missing provider or credentials" }, { status: 400 });
  }

  try {
    if (provider === "twilio") {
      const { account_sid, auth_token } = credentials;
      if (!account_sid || !auth_token) {
        return NextResponse.json({ success: false, error: "Account SID and Auth Token are required" }, { status: 400 });
      }

      const basicAuth = Buffer.from(`${account_sid}:${auth_token}`).toString("base64");
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${account_sid}.json`, {
        headers: { Authorization: `Basic ${basicAuth}` },
      });

      if (res.status === 401) {
        return NextResponse.json({ success: false, error: "Invalid Account SID or Auth Token" });
      }
      if (res.status === 404) {
        return NextResponse.json({ success: false, error: "Account SID not found" });
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return NextResponse.json({ success: false, error: data?.message || `Twilio returned ${res.status}` });
      }

      const data = await res.json();
      return NextResponse.json({ success: true, accountName: data.friendly_name });
    }

    if (provider === "callhippo") {
      const { api_key } = credentials;
      if (!api_key) {
        return NextResponse.json({ success: false, error: "API Key is required" }, { status: 400 });
      }

      const res = await fetch("https://api.callhippo.com/app/account/profile", {
        headers: { Authorization: api_key },
      });

      if (res.status === 401 || res.status === 403) {
        return NextResponse.json({ success: false, error: "Invalid API Key" });
      }
      if (!res.ok) {
        return NextResponse.json({ success: false, error: `CallHippo returned ${res.status}` });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: `Unknown provider: ${provider}` }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, error: "Network error — could not reach provider" }, { status: 502 });
  }
}
