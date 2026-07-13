/**
 * Bi-weekly AI remarketing workflow — Code node 2
 * "AI Agent" -> [this node] -> "Send a message"
 *
 * Combines the AI-generated email body with a fixed-format footer:
 * a short call-to-action, three tracked links (one per interest
 * category), and a header image matched to the subscriber's
 * dominant interest. Ties between categories fall back to a
 * dedicated "mixed interest" image rather than picking one at random.
 *
 * Cloudinary URLs and the localhost webhook host are left as-is from
 * the actual workflow.
 */

const aiContent = $('AI Agent').first().json.output;
const email = $('Loop Over Items').item.json.email;
const clicks = $('Loop Over Items').item.json.clicks;

// Determine the subscriber's dominant interest category
const counts = { coffee: 0, shop: 0, location: 0 };
for (const click of clicks) {
  if (counts[click.interestCategory] !== undefined) {
    counts[click.interestCategory]++;
  }
}

const max = Math.max(counts.coffee, counts.shop, counts.location);
const dominant = Object.keys(counts).filter((k) => counts[k] === max);

let imageUrl;
if (dominant.length > 1) {
  imageUrl = "https://res.cloudinary.com/dejpsznvh/image/upload/v1780804812/S__65110021_b8hvnh.jpg"; // mixed interest
} else if (dominant[0] === "coffee") {
  imageUrl = "https://res.cloudinary.com/dejpsznvh/image/upload/v1780804518/S__65110023_xig88b.jpg";
} else if (dominant[0] === "shop") {
  imageUrl = "https://res.cloudinary.com/dejpsznvh/image/upload/v1780804806/S__65110020_tk1js4.jpg";
} else {
  imageUrl = "https://res.cloudinary.com/dejpsznvh/image/upload/v1780804784/S__65110022_bvdrsa.jpg"; // location
}

const links = `
<br>
<p>Explore Suiga:</p>
<a href="http://localhost:5678/webhook/track?email=${email}&interest=coffee"> View menu</a>　
<a href="http://localhost:5678/webhook/track?email=${email}&interest=shop"> The shop</a>　
<a href="http://localhost:5678/webhook/track?email=${email}&interest=location"> Find us</a>
<br><br>
<img src="${imageUrl}" style="width:100%;max-width:600px;display:block;margin:0 auto;">
`;

return [{ json: { body: aiContent + links, email: email } }];
