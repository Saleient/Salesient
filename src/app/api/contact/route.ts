import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, company, seats, topic, billingCycle, message } = body;

    // Validate required fields
    if (!(name && email && message)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const subjectPrefix = topic ? `[${topic}]` : "[Contact Inquiry]";

    // Send email using Resend
    const { error } = await resend.emails.send({
      from: "Salesient <onboarding@resend.dev>",
      to: process.env.CONTACT_EMAIL || "onboarding@resend.dev",
      replyTo: email,
      subject: `${subjectPrefix} New Submission from ${name}`,
      html: `
        <h2>New Salesient Commercial / Support Submission</h2>
        ${topic ? `<p><strong>Inquiry Type:</strong> ${topic}</p>` : ""}
        ${billingCycle ? `<p><strong>Billing Cycle:</strong> ${billingCycle}</p>` : ""}
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Work Email:</strong> ${email}</p>
        ${company ? `<p><strong>Company:</strong> ${company}</p>` : ""}
        ${seats ? `<p><strong>Estimated Seats:</strong> ${seats}</p>` : ""}
        <p><strong>Message / Requirements:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });

    if (error) {
      console.error("Contact form email send error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
