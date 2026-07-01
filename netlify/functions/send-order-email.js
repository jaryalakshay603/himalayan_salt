import nodemailer from "nodemailer";

const requiredFields = ["name", "phone", "address", "city", "pincode", "orderDetails"];
const DEFAULT_WHATSAPP_TO = "918559023422";

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildEmailText(order) {
  return [
    "New Himachali Green Salt order",
    "",
    order.orderDetails,
    "",
    `Customer: ${order.name}`,
    `Phone: ${order.phone}`,
    `Email: ${order.email || "Not provided"}`,
    `Address: ${order.address}`,
    `City: ${order.city}`,
    `Pincode: ${order.pincode}`,
    `Notes: ${order.notes || "None"}`,
  ].join("\n");
}

function buildWhatsAppText(order) {
  return buildEmailText(order);
}

function buildEmailHtml(order) {
  const rows = [
    ["Customer", order.name],
    ["Phone", order.phone],
    ["Email", order.email || "Not provided"],
    ["Address", order.address],
    ["City", order.city],
    ["Pincode", order.pincode],
    ["Notes", order.notes || "None"],
  ];

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#172018">
      <h2 style="margin:0 0 12px">New Himachali Green Salt order</h2>
      <pre style="white-space:pre-wrap;background:#f3f6ef;padding:12px;border-radius:6px">${escapeHtml(
        order.orderDetails
      )}</pre>
      <table cellpadding="6" cellspacing="0" style="border-collapse:collapse">
        ${rows
          .map(
            ([label, value]) => `
              <tr>
                <td style="font-weight:700;vertical-align:top">${escapeHtml(label)}</td>
                <td>${escapeHtml(value)}</td>
              </tr>`
          )
          .join("")}
      </table>
    </div>
  `;
}

async function sendWhatsAppNotification(order) {
  const {
    WHATSAPP_ACCESS_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID,
    WHATSAPP_API_VERSION = "v20.0",
    ORDER_WHATSAPP_TO = DEFAULT_WHATSAPP_TO,
  } = process.env;

  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    return { configured: false, sent: false };
  }

  const response = await fetch(
    `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: ORDER_WHATSAPP_TO,
        type: "text",
        text: {
          preview_url: false,
          body: buildWhatsAppText(order),
        },
      }),
    }
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`WhatsApp send failed: ${response.status} ${details}`);
  }

  return { configured: true, sent: true };
}

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const { EMAIL_USER, EMAIL_APP_PASSWORD, ORDER_RECEIVER_EMAIL } = process.env;

  if (!EMAIL_USER || !EMAIL_APP_PASSWORD || !ORDER_RECEIVER_EMAIL) {
    return json(500, {
      error:
        "Email server is not configured. Set EMAIL_USER, EMAIL_APP_PASSWORD, and ORDER_RECEIVER_EMAIL in Netlify environment variables.",
    });
  }

  let order;
  try {
    order = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Invalid request body" });
  }

  const missingFields = requiredFields.filter((field) => !String(order[field] || "").trim());
  if (missingFields.length > 0) {
    return json(400, { error: `Missing required field: ${missingFields.join(", ")}` });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_APP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Himachali Salt Store" <${EMAIL_USER}>`,
      to: ORDER_RECEIVER_EMAIL,
      replyTo: order.email || EMAIL_USER,
      subject: "New Himachali Green Salt order",
      text: buildEmailText(order),
      html: buildEmailHtml(order),
    });

    try {
      const whatsapp = await sendWhatsAppNotification(order);
      return json(200, { ok: true, whatsapp });
    } catch (error) {
      console.error("WhatsApp send failed", error);
      return json(200, {
        ok: true,
        whatsapp: {
          configured: true,
          sent: false,
          error: "WhatsApp notification failed. Check the function logs for the provider response.",
        },
      });
    }
  } catch (error) {
    console.error("SMTP send failed", error);
    return json(502, {
      error: "SMTP send failed. Check the function logs for the Gmail response.",
    });
  }
};
