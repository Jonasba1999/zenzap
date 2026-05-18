const HUBSPOT_PORTAL_ID = '143796114';
const HUBSPOT_FORM_GUID = '8f7d78bf-0f85-40e1-9ce4-5d1185accda0';
const HUBSPOT_API_URL = `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_GUID}`;

export async function onRequestPost(context: { request: Request }) {
  let body: Record<string, string>;

  try {
    body = await context.request.json();
  } catch {
    return new Response('Invalid JSON body', { status: 400 });
  }

  // Extract page_url separately so it doesn't get sent as a form field
  const { page_url, ...formFields } = body;

  const fields = Object.entries(formFields).map(([name, value]) => ({ name, value }));

  const payload: {
    fields: { name: string; value: string }[];
    context?: { pageUri?: string };
  } = { fields };

  if (page_url) {
    payload.context = { pageUri: page_url };
  }

  const response = await fetch(HUBSPOT_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('HubSpot submission failed:', response.status, errorBody);
    return new Response('HubSpot submission failed', { status: 502 });
  }

  return new Response('OK', { status: 200 });
}
