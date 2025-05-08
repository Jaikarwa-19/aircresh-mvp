import type { NextApiRequest, NextApiResponse } from 'next';

// Optional: import fetch if not using global fetch (Node 16 or lower)
// import fetch from 'node-fetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST allowed' });
  }

  const { to_email, subject, message } = req.body;

  if (!to_email || !subject || !message) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email,
          subject,
          message,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('EmailJS Error:', err);
      return res.status(500).json({ message: 'Email send failed' });
    }

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
