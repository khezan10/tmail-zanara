// Cloudflare Email Worker: menerima email untuk domain yang diarahkan ke worker ini,
// lalu meneruskannya ke Tmail Zanara (Vercel) sebagai JSON.
import PostalMime from "postal-mime";

export default {
  async email(message, env, ctx) {
    const parsed = await PostalMime.parse(new Response(message.raw));

    const payload = {
      from: message.from,
      to: message.to,
      subject: parsed.subject || "",
      text: parsed.text || "",
      html: parsed.html || "",
    };

    const res = await fetch(env.TMAIL_INBOUND_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${env.TMAIL_INBOUND_SECRET}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("tmail inbound failed", res.status, await res.text());
      // Tolak supaya pengirim tahu email tidak tersimpan.
      message.setReject("Mailbox unavailable, try again later.");
    }
  },
};
