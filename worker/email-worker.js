// Cloudflare Email Worker: meneruskan email mentah ke Tmail Zanara (Vercel).
// Parsing MIME dilakukan di server agar worker tetap kecil (tanpa dependency).
const MAX_RAW = 256 * 1024;

const worker = {
  async email(message, env) {
    const raw = await new Response(message.raw).text();

    const res = await fetch(env.TMAIL_INBOUND_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${env.TMAIL_INBOUND_SECRET}`,
      },
      body: JSON.stringify({
        from: message.from,
        to: message.to,
        raw: raw.slice(0, MAX_RAW),
      }),
    });

    if (!res.ok) {
      console.error("tmail inbound failed", res.status, await res.text());
      message.setReject("Mailbox unavailable, try again later.");
    }
  },
};

export default worker;
