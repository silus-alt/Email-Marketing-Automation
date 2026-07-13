// Bi-weekly AI remarketing workflow — groups click-tracking rows by
// subscriber and derives a deterministic discount code from their email.

const items = $input.all();
const grouped = {};

for (const item of items) {
  const email = item.json.Email;

  if (!grouped[email]) {
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
