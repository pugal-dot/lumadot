export const C = {
  bg:           '#000000',
  surface:      '#131313',
  surfaceMid:   '#1c1b1b',
  surfaceHigh:  '#2a2a2a',
  border:       'rgba(255,255,255,0.10)',
  borderBright: 'rgba(255,255,255,0.30)',
  borderSelect: 'rgba(255,255,255,0.50)',
  accent:       '#5B4FE8',
  accentDim:    'rgba(91,79,232,0.25)',
  accentGlow:   'rgba(91,79,232,0.8)',
  text:         '#F5F5F5',
  textMuted:    'rgba(255,255,255,0.50)',
  textDim:      'rgba(255,255,255,0.25)',
  textFaint:    'rgba(255,255,255,0.10)',
  white:        '#FFFFFF',
  black:        '#000000',
  cardBg:       'rgba(255,255,255,0.04)',
  cardSelect:   'rgba(255,255,255,0.10)',
  navBg:        'rgba(0,0,0,0.85)',
};

export const F = {
  serif:      'PlayfairDisplay_700Bold',
  serifReg:   'PlayfairDisplay_400Regular',
  serifItal:  'PlayfairDisplay_400Regular_Italic',
  body:       'Inter_400Regular',
  medium:     'Inter_500Medium',
  semibold:   'Inter_600SemiBold',
};

export const FIELDS = [
  { id: 'technology',  label: 'Technology',  icon: 'terminal',          desc: 'The frontiers of silicon and code.',     emoji: '⌨' },
  { id: 'finance',     label: 'Finance',     icon: 'account-balance',   desc: 'Markets, flow, and capital movements.',  emoji: '🏦' },
  { id: 'ai',          label: 'AI',          icon: 'psychology',        desc: 'Neural networks and machine evolution.', emoji: '🧠' },
  { id: 'health',      label: 'Health',      icon: 'biotech',           desc: 'Longevity, biotech, and wellness.',      emoji: '🔬' },
  { id: 'space',       label: 'Space',       icon: 'rocket-launch',     desc: 'Orbital economy and deep exploration.',  emoji: '🚀' },
  { id: 'geopolitics', label: 'Geopolitics', icon: 'public',            desc: 'Power shifts across the global map.',   emoji: '🌍' },
  { id: 'crypto',      label: 'Crypto',      icon: 'currency-bitcoin',  desc: 'Decentralized protocols and assets.',   emoji: '₿' },
  { id: 'energy',      label: 'Energy',      icon: 'bolt',              desc: 'The grid, renewables, and fusion.',     emoji: '⚡' },
];

export const CATEGORY_MAP: Record<string, string> = {
  technology:  'technology',
  finance:     'business',
  ai:          'technology',
  health:      'health',
  space:       'science',
  geopolitics: 'general',
  crypto:      'business',
  energy:      'science',
};
