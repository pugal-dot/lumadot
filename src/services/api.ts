import axios from 'axios';
import { Platform } from 'react-native';

// ─── KEYS LOADED FROM ENVIRONMENT VARIABLES (never hardcode keys!) ────
const NEWS_API_KEY  = process.env.EXPO_PUBLIC_NEWS_API_KEY  ?? '';
const GROQ_API_KEY  = process.env.EXPO_PUBLIC_GROQ_API_KEY  ?? '';
// ─────────────────────────────────────────────────────────────────────

// On web, use the Vercel serverless proxy to avoid CORS issues with NewsAPI
const IS_WEB = Platform.OS === 'web';

export interface Article {
  id:        string;
  source:    string;
  headline:  string;
  summary:   string;
  url:       string;
  time:      string;
  imageUrl?: string;
  raw?:      string;
}

// Fetch headlines from NewsAPI
export async function fetchNews(category: string, query?: string): Promise<Article[]> {
  try {
    let res;

    if (IS_WEB) {
      // Use Vercel serverless proxy on web to avoid CORS
      const params: any = query ? { q: query } : { category };
      res = await axios.get('/api/news', { params });
    } else {
      // Direct API call on native (no CORS restriction)
      const endpoint = query ? 'everything' : 'top-headlines';
      const params: any = { language: 'en', pageSize: 10, apiKey: NEWS_API_KEY };
      if (query) { params.q = query; params.sortBy = 'publishedAt'; }
      else { params.category = category; }
      res = await axios.get(`https://newsapi.org/v2/${endpoint}`, { params });
    }

    const articles = res.data.articles.filter(
      (a: any) => a.title && a.title !== '[Removed]'
    );

    return articles.map((a: any, i: number) => ({
      id:       String(i),
      source:   a.source?.name?.toUpperCase() ?? 'UNKNOWN',
      headline: a.title,
      summary:  a.description ?? '',
      url:      a.url,
      time:     timeAgo(a.publishedAt),
      imageUrl: a.urlToImage ?? undefined,
      raw:      a.description ?? a.title,
    }));
  } catch (e: any) {
    console.error('NewsAPI error:', e?.message);
    return FALLBACK_NEWS;
  }
}

// Summarise a single article with Groq (Llama 3.3)
export async function summariseWithGroq(text: string): Promise<string> {
  try {
    const res = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        max_tokens: 80,
        messages: [
          {
            role: 'system',
            content:
              'You are a concise financial news editor. Summarise the article in exactly 2 sentences. Be direct, no fluff.',
          },
          { role: 'user', content: text },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return res.data.choices[0].message.content.trim();
  } catch (e: any) {
    console.error('Groq error:', e?.message);
    return text.slice(0, 140) + '…';
  }
}

// Batch summarise — summarises up to 5 articles
export async function fetchAndSummarise(category: string, query?: string): Promise<Article[]> {
  const articles = await fetchNews(category, query);
  const top5 = articles.slice(0, 5);

  const summarised = await Promise.all(
    top5.map(async (a) => ({
      ...a,
      summary: a.raw ? await summariseWithGroq(a.raw) : a.summary,
    }))
  );

  return summarised;
}

// Time helper
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60)  return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  return `${Math.floor(m / 1440)}d ago`;
}

// Fallback data when API keys not set
export const FALLBACK_NEWS: Article[] = [
  {
    id: '1',
    source: 'REUTERS • BLOOMBERG',
    headline: 'Global semiconductor rally pushes indices to record highs',
    summary: 'AI chip demand continues to outpace supply chain projections, triggering a 4.2% surge across key Asian tech corridors.',
    url: '',
    time: '12m ago',
  },
  {
    id: '2',
    source: 'THE ECONOMIST',
    headline: 'Central bank shifts policy on digital asset liquidity',
    summary: 'New regulatory frameworks suggest a move toward institutional adoption of decentralized ledgers for cross-border settlements.',
    url: '',
    time: '2h ago',
  },
  {
    id: '3',
    source: 'WSJ • EXCLUSIVE',
    headline: 'Green energy mergers hit 10-year high as subsidy deadlines approach',
    summary: 'Private equity firms are pivoting into wind and solar infrastructure as national grid modernization projects receive federal backing.',
    url: '',
    time: '4h ago',
  },
  {
    id: '4',
    source: 'FINANCIAL TIMES',
    headline: 'Venture capital slows as interest rates find new plateau',
    summary: 'Series B and C rounds face stricter valuation metrics as investors shift focus from growth-at-all-costs to unit economics.',
    url: '',
    time: 'Yesterday',
  },
];

// --- AI RAG FEATURES ---

export async function chatAboutArticle(articleText: string, question: string): Promise<string> {
  try {
    const res = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are an AI assistant explaining news articles. Use the provided article to directly answer the user. Be concise, insightful, and helpful.' },
          { role: 'user', content: `Context Article: ${articleText}\n\nUser Question: ${question}` }
        ]
      },
      { headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' } }
    );
    return res.data.choices[0].message.content.trim();
  } catch (e: any) {
    return 'Sorry, I am currently out of tokens or unreachable. Try again later!';
  }
}

export async function fetchMarketSentiment(articles: Article[]): Promise<string> {
  try {
    const headlines = articles.map(a => a.headline).join('; ');
    const res = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        max_tokens: 30,
        messages: [
          { role: 'system', content: 'Analyze the sentiment of the provided headlines. Return exactly in this format: [Bullish/Bearish/Neutral/Volatile] • [Volatility score out of 100 as integer]. Example: "Bullish • 82" or "Volatile Bearish • 45". Nothing else.' },
          { role: 'user', content: headlines }
        ]
      },
      { headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' } }
    );
    return res.data.choices[0].message.content.trim().replace(/['"]+/g, '');
  } catch (e: any) {
    return 'low stable • 12';
  }
}

export async function generatePersonalBriefing(fields: string[], articles: Article[]): Promise<string[]> {
  try {
    if (articles.length === 0) return ["No data available today."];
    const context = articles.slice(0, 8).map(a => a.headline).join(' | ');
    const res = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        max_tokens: 200,
        messages: [
          { role: 'system', content: `You are generating a daily market briefing for a user interested in: ${fields.join(', ')}. Based on the provided headlines, return EXACTLY 3 bullet points. Each bullet should be 1 short sentence. Separate bullets using double pipes "||" without any asterisks or numbering.` },
          { role: 'user', content: context }
        ]
      },
      { headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' } }
    );
    const text = res.data.choices[0].message.content;
    return text.split('||').map((b: string) => b.trim().replace(/^- /,'')).filter((b: string) => b.length > 0);
  } catch (e: any) {
    return ["Markets are fluid today.", "Check individual fields for details.", "AI Briefing unavailable."];
  }
}
