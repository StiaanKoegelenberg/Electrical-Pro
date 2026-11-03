import { useEffect } from "react";

// Gives a page its own tab title and search-result description (see src/lib/page-meta.ts), and puts back
// the previous ones when the visitor moves on
export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previous = { title: document.title, description: meta?.content };
    document.title = title;
    if (meta && description) meta.content = description;
    return () => {
      document.title = previous.title;
      if (meta && previous.description !== undefined) meta.content = previous.description;
    };
  }, [title, description]);
}
