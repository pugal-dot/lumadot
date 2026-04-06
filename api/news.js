export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { category, q } = req.query;
  const apiKey = process.env.EXPO_PUBLIC_NEWS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    let url;
    if (q) {
      url = `https://newsapi.org/v2/everything?language=en&pageSize=10&sortBy=publishedAt&q=${encodeURIComponent(q)}&apiKey=${apiKey}`;
    } else {
      url = `https://newsapi.org/v2/top-headlines?language=en&pageSize=10&category=${encodeURIComponent(category)}&apiKey=${apiKey}`;
    }

    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
}
