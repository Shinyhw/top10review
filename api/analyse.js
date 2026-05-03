export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'No query provided' });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `You are a product review analyst for top10reviews.io — a UK Amazon affiliate site.

The user has searched for: "${query}"

Generate a realistic top 10 list of products for this category as they would appear on Amazon UK. For each product provide:
- A realistic product name with brand and model
- Star rating (4.0–4.9)
- Number of reviews (300–50000)
- Price in GBP (realistic for category)
- A 1–2 sentence AI summary of what customers love about it
- 2 pros and 1 con from reviews
- A realistic Amazon ASIN (format: B0XXXXXXXX)

Respond ONLY with a JSON array, no markdown, no explanation:
[
  {
    "rank": 1,
    "name": "Product Name",
    "rating": 4.7,
    "reviews": 12453,
    "price": "£89.99",
    "summary": "Customers consistently praise the exceptional sound quality and comfortable fit.",
    "pros": ["Outstanding battery life", "Clear balanced audio"],
    "con": "Slightly bulky for commuting",
    "asin": "B09XXXXXXX"
  }
]

Return exactly 10 items. Be realistic and specific to UK Amazon products.`
      }]
    })
  });

  const data = await response.json();
  const text = data.content.map(b => b.text || '').join('');
  const clean = text.replace(/```json|```/g, '').trim();

  res.status(200).json({ products: JSON.parse(clean) });
}
