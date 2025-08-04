import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'
import { generateTrackingId } from '@/lib/utils'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface SendEmailOptions {
  to: string
  subject: string
  content: string
  leadId?: string
  userId: string
  companyId: string
}

/**
 * Skickar e-post med tracking och loggar i databas
 */
export async function sendEmail({
  to,
  subject,
  content,
  leadId,
  userId,
  companyId,
}: SendEmailOptions) {
  try {
    const trackingId = generateTrackingId()
    const trackingPixelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/email/track/${trackingId}`
    
    // Lägg till tracking pixel i e-postinnehållet
    const contentWithTracking = `
      ${content}
      <img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="" />
    `

    // Skicka e-post med Resend
    const { data, error } = await resend.emails.send({
      from: 'CRM System <noreply@yourapp.com>', // TODO: Konfigurera med din domän
      to: [to],
      subject,
      html: contentWithTracking,
    })

    if (error) {
      throw new Error(`Failed to send email: ${error.message}`)
    }

    // Logga e-post i databas
    const emailLog = await prisma.emailLog.create({
      data: {
        subject,
        content: contentWithTracking,
        recipientEmail: to,
        senderEmail: 'noreply@yourapp.com', // TODO: Konfigurera
        status: 'SENT',
        trackingId,
        companyId,
        leadId,
        sentById: userId,
      },
    })

    return {
      success: true,
      emailLog,
      resendData: data,
    }
  } catch (error) {
    console.error('Error sending email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Loggar e-post öppning när tracking pixel laddas
 */
export async function trackEmailOpen(trackingId: string) {
  try {
    await prisma.emailLog.update({
      where: { trackingId },
      data: {
        openedAt: new Date(),
        openCount: {
          increment: 1,
        },
        status: 'OPENED',
      },
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error tracking email open:', error)
    return { success: false }
  }
}
