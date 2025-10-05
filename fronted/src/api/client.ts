import axios from 'axios';

const DEFAULT_BASE_URL = 'https://nasa2025-backend-164841539788.europe-west1.run.app';

const apiBaseUrl = (process.env.REACT_APP_API_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, '');

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

type Nullable<T> = T | null | undefined;

export interface ApiDocumentHit {
  title: string;
  abstract: string;
  content_preview: string;
  link: Nullable<string>;
  certainty: Nullable<number>;
  full_abstract: string;
  full_content: string;
}

export interface DocumentHit extends ApiDocumentHit {
  id: string;
  snippet: string;
  keywords: string[];
  sourceHost: string | null;
  certaintyScore: number | null;
}

export interface SearchResponse {
  items: ApiDocumentHit[];
}

export interface TitleResponse {
  title: string;
  source: string;
}

export interface SearchOptions {
  limit?: number;
  onlyFullContent?: boolean;
}

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'from', 'this', 'have', 'been', 'were', 'such', 'into',
  'their', 'they', 'which', 'these', 'those', 'within', 'than', 'using', 'used', 'while', 'where',
  'when', 'what', 'your', 'about', 'space', 'microgravity', 'gravity', 'effects', 'study', 'studies',
  'research', 'analysis', 'health', 'human', 'cells', 'system', 'systems', 'based', 'also', 'however',
  'between', 'during', 'over', 'under', 'into', 'there', 'been', 'more', 'most', 'after', 'before',
  'like', 'into', 'data', 'results', 'including', 'among', 'many', 'across', 'impact', 'impacts',
  'effects', 'effect', 'may', 'might', 'could', 'would', 'should', 'well', 'made', 'make', 'findings',
  'important', 'significant', 'key', 'new', 'using', 'such', 'showed', 'shows', 'show', 'provide',
]);

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim();

const extractKeywords = (text: string, limit = 5): string[] => {
  if (!text) {
    return [];
  }

  const tokens = normalizeWhitespace(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .filter((word) => word.length > 4 && !STOP_WORDS.has(word));

  const frequencies = tokens.reduce<Record<string, number>>((acc, token) => {
    acc[token] = (acc[token] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(frequencies)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([word]) => word);
};

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const buildDocumentId = (item: ApiDocumentHit, index: number) => {
  if (item.link) {
    return `doc-${hashString(item.link)}`;
  }
  return `doc-${index}-${hashString(item.title)}`;
};

const toDocumentHit = (item: ApiDocumentHit, index: number): DocumentHit => {
  let sourceHost: string | null = null;
  if (item.link) {
    try {
      const url = new URL(item.link);
      sourceHost = url.hostname.replace(/^www\./, '');
    } catch (error) {
      sourceHost = null;
    }
  }

  const snippet = item.abstract?.trim() || item.content_preview?.trim() || '';

  const certaintyScore = typeof item.certainty === 'number'
    ? Math.round(item.certainty * 100)
    : null;

  return {
    ...item,
    id: buildDocumentId(item, index),
    snippet,
    keywords: extractKeywords(item.abstract || item.content_preview, 6),
    sourceHost,
    certaintyScore,
  };
};

export const searchDocuments = async (
  query: string,
  options: SearchOptions = {}
): Promise<DocumentHit[]> => {
  const payload = {
    query,
    limit: options.limit ?? 10,
    only_full_content: options.onlyFullContent ?? true,
  };

  const { data } = await apiClient.post<SearchResponse>('/search', payload);
  return (data.items ?? []).map(toDocumentHit);
};

export const generateEditorialTitle = async (text: string): Promise<TitleResponse | null> => {
  if (!text || text.length < 3) {
    return null;
  }

  const requestPayload = {
    text: text.slice(0, 5000),
  };

  const { data } = await apiClient.post<TitleResponse>('/title', requestPayload);
  return data;
};

export { apiBaseUrl as API_BASE_URL };
