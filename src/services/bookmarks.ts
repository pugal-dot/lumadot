import AsyncStorage from '@react-native-async-storage/async-storage';
import { Article } from './api';

const KEY = 'lumadot_bookmarks';

export async function getBookmarks(): Promise<Article[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export async function addBookmark(article: Article): Promise<void> {
  const current = await getBookmarks();
  const exists = current.find(a => a.id === article.id);
  if (!exists) {
    await AsyncStorage.setItem(KEY, JSON.stringify([article, ...current]));
  }
}

export async function removeBookmark(id: string): Promise<void> {
  const current = await getBookmarks();
  await AsyncStorage.setItem(KEY, JSON.stringify(current.filter(a => a.id !== id)));
}

export async function isBookmarked(id: string): Promise<boolean> {
  const current = await getBookmarks();
  return current.some(a => a.id === id);
}
