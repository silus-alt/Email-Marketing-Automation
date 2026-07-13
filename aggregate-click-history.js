/**
 * Bi-weekly AI remarketing workflow — Code node 1
 * "Get row(s) in sheet" (click tracking) -> [this node] -> "Loop Over Items"
 *
 * Groups raw click-tracking rows by subscriber email, and derives a
 * per-subscriber discount code deterministically from their email address.
 *
 * Because the code is a pure function of the email (a checksum-style hash,
 * not a randomly generated value), re-running this node for an existing
 * subscriber always reproduces the same code. That is what lets the
 * downstream If node safely "update" an existing subscriber's record
 * without needing to look up their prior code — recomputing it is
 * equivalent to carrying it over.
 *
 * Field names below are translated from the source Google Sheet for
 * portfolio readability; the underlying logic is unchanged.
 */

const items = $input.all();
const grouped = {};

for (const item of items) {
  const email = item.json.Email;

  if (!grouped[email]) {
    // Deterministic discount code: 4-letter prefix from the email's
    // local part + a 3-digit number derived from a simple char-code sum.
    // Same email -> same code, every time this node runs.
    const prefix = email.split("@")[0].toUpperCase().slice(0, 4);
    const num = Math.abs(email.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 900 + 100;
    const code = "SUIGA-" + prefix + num;

    grouped[email] = {
      email,
      clicks: [],
      discountCode: code,
      totalClicks: 0,
    };
  }

  grouped[email].clicks.push({
    timestamp: new Date(item.json.Timestamp).toLocaleString("en-US", {
      timeZone: "Asia/Taipei",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    interestCategory: item.json.InterestCategory,
  });
  grouped[email].totalClicks++;
}

return Object.values(grouped).map((g) => ({ json: g }));
