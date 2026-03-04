export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/submit' && request.method === 'POST') {
      let email;
      try {
        const body = await request.json();
        email = body.email;
      } catch {
        return json({ error: 'Invalid request' }, 400);
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json({ error: 'Invalid email' }, 400);
      }

      try {
        await env.DB.prepare(
          'INSERT OR IGNORE INTO waitlist (email, created_at) VALUES (?, ?)'
        ).bind(email.toLowerCase().trim(), new Date().toISOString()).run();
      } catch {
        return json({ error: 'Database error' }, 500);
      }

      return json({ success: true }, 200);
    }

    return env.ASSETS.fetch(request);
  },
};

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
