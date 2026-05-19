const HUBSPOT_PORTAL_ID = '143796114';
const HUBSPOT_FORM_GUID = '8f7d78bf-0f85-40e1-9ce4-5d1185accda0';
const HUBSPOT_API_URL = `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_GUID}`;

export async function onRequestPost(context: { request: Request }) {
  let body: Record<string, unknown>;

  try {
    body = await context.request.json();
  } catch {
    return new Response('Invalid JSON body', { status: 400 });
  }

  const { page_url, ...formFields } = body;

  const reasonCheckbox = Array.isArray(formFields.reason_checkbox)
    ? (formFields.reason_checkbox as string[]).join(', ')
    : '';
  const reasonText = typeof formFields.reason_text === 'string' ? formFields.reason_text : '';
  const reasonForContact = [reasonCheckbox, reasonText].filter(Boolean).join('\n');

  const fields = Object.entries(formFields)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .flatMap(([name, value]) => {
      if (name === 'reason_checkbox' || name === 'reason_text') {
        return [];
      }
      return [{ name, value: String(value) }];
    });

  if (reasonForContact) {
    fields.push({ name: 'reason_for_contact', value: reasonForContact });
  }

  const payload: {
    fields: { name: string; value: string }[];
    context?: { pageUri?: string };
  } = { fields };

  if (page_url && typeof page_url === 'string') {
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
