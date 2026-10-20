import { initDb, pool } from "./db.js";
import { embedText } from "./embed.js";

const documents = [
  {
    id: "password-reset",
    title: "Reset a forgotten password",
    content:
      "If you forget your password, open the sign-in page, select Forgot Password, and follow the recovery link sent to your registered email address.",
  },
  {
    id: "refund-policy",
    title: "Request a refund",
    content:
      "Customers can request refunds within 14 days of purchase. Contact the support team with your order number and reason for the refund.",
  },
  {
    id: "shipping-status",
    title: "Track a delivery",
    content:
      "To track a delivery, open your orders page and select the tracking number. Shipping updates show the package's current status and estimated arrival.",
  },
  {
    id: "account-security",
    title: "Secure your account",
    content:
      "Enable two-factor authentication to help protect your account. It adds a verification step when signing in from an unrecognized device.",
  },
];

async function main() {
  await initDb();

  for (const doc of documents) {
    // 1. Convert the document into a vector.
    const vector = await embedText(
      doc.content,
      "RETRIEVAL_DOCUMENT",
      doc.title
    );

    // 2. Store content and vector together.
    await pool.query(
      `
      INSERT INTO documents (id, title, content, embedding)
      VALUES ($1, $2, $3, $4::vector)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        embedding = EXCLUDED.embedding
      `,
      [
        doc.id,
        doc.title,
        doc.content,
        JSON.stringify(vector),
      ]
    );

    console.log(`Stored: ${doc.title}`);
  }
}

main()
  .catch((error) => {
    console.error("Ingestion failed:", error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());