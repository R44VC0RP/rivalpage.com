import { render } from '@react-email/render';
import { AnalysisCompleteEmail } from '../emails/analysis-complete';

interface SendAnalysisCompleteEmailParams {
  to: string;
  firstName: string;
  domain: string;
  competitorCount: number;
  analysisUrl: string;
}

export async function sendAnalysisCompleteEmail({
  to,
  firstName,
  domain,
  competitorCount,
  analysisUrl,
}: SendAnalysisCompleteEmailParams): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.INBOUND_API_KEY;
  
  if (!apiKey) {
    console.error('INBOUND_API_KEY is not set');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    // Render the email template to HTML
    const html = await render(
      AnalysisCompleteEmail({
        firstName,
        domain,
        competitorCount,
        analysisUrl,
        companyName: 'RivalPage',
      }),
      { pretty: true }
    );

    // Send email via Inbound API
    const response = await fetch('https://inbound.new/api/v2/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'RivalPage <info@rivalpage.com>', // Using test sender for now
        to: [to],
        subject: `Your competitor analysis for ${domain} is ready`,
        html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Failed to send email:', errorData);
      return { success: false, error: errorData.error || 'Failed to send email' };
    }

    const data = await response.json();
    console.log('Email sent successfully:', data.id);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

