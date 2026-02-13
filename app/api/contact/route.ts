import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { name, email, company, industry, message, preferredTime } = await request.json()

    // Validate required fields
    if (!name || !email || !message || message.length < 50) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields' },
        { status: 400 }
      )
    }

    // Send email to David
    await resend.emails.send({
      from: 'website@unimpossible.co.uk',
      to: 'david@candengo.com',
      subject: `Consultation Request from ${name}`,
      html: `
        <h2>New Consultation Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Company:</strong> ${company || 'N/A'}</p>
        <p><strong>Industry:</strong> ${industry}</p>
        <p><strong>Preferred Time:</strong> ${preferredTime || 'N/A'}</p>
        <hr />
        <p>${message}</p>
      `
    })

    // Auto-reply to user
    await resend.emails.send({
      from: 'david@unimpossible.co.uk',
      to: email,
      subject: 'Thanks for reaching out',
      html: `
        <p>Hi ${name},</p>
        <p>Thanks for getting in touch. I'll review your message and get back to you within 24 hours.</p>
        <p>— David Riches<br />Founder, Unimpossible</p>
      `
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
