export type Post = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  image: string;
  body: string;
};

/** No articles yet: /blog shows its empty state until the owner adds one. */
export const posts: Post[] = [];
