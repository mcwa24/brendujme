import { NextResponse } from "next/server";
import { sendContactFormEmail, type ContactTopic } from "@/lib/resend";

const rateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, limit = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const entry = rateLimit.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function parseTopic(value: unknown): ContactTopic {
  return value === "brand" ? "brand" : "general";
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    if (!checkRateLimit(`contact:${clientIp}`)) {
      return NextResponse.json(
        { error: "Previše zahteva. Pokušajte ponovo za nekoliko minuta." },
        { status: 429 }
      );
    }

    const body = (await request.json()) as {
      topic?: unknown;
      name?: string;
      email?: string;
      message?: string;
      brandName?: string;
      website?: string;
      country?: string;
      availability?: string;
      _honeypot?: string;
    };

    const honeypot = body._honeypot?.trim() ?? "";
    if (honeypot) {
      return NextResponse.json({ success: true });
    }

    const topic = parseTopic(body.topic);
    const name = body.name?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const message = body.message?.trim() ?? "";
    const brandName = body.brandName?.trim() ?? "";
    const website = body.website?.trim() ?? "";
    const country = body.country?.trim() ?? "";
    const availability = body.availability?.trim() ?? "";

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Ime, email i poruka su obavezni." },
        { status: 400 }
      );
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { error: "Unesite ispravnu email adresu." },
        { status: 400 }
      );
    }

    if (message.length < 10) {
      return NextResponse.json(
        { error: "Poruka je prekratka (minimum 10 karaktera)." },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: "Poruka je predugačka (maksimum 5000 karaktera)." },
        { status: 400 }
      );
    }

    if (topic === "brand") {
      if (!brandName) {
        return NextResponse.json(
          { error: "Naziv brenda je obavezan." },
          { status: 400 }
        );
      }
      if (!availability) {
        return NextResponse.json(
          { error: "Opišite gde je brend dostupan u Srbiji." },
          { status: 400 }
        );
      }
    }

    await sendContactFormEmail({
      topic,
      name,
      email,
      message,
      brandName,
      website,
      country,
      availability,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form submission failed:", error);
    return NextResponse.json(
      { error: "Slanje nije uspelo. Pokušajte ponovo." },
      { status: 500 }
    );
  }
}
