import { useEffect } from "react";

// Gives a page its own tab title and search-result description, and puts back the previous ones
// (index.html's, on the home page) when the visitor moves on
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
