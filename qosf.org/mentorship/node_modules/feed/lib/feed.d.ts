//#region src/typings/index.d.ts
interface Item {
  title: string;
  id?: string;
  link: string;
  date: Date;
  description?: string;
  content?: string;
  category?: Category[];
  guid?: string;
  image?: string | Enclosure;
  audio?: string | Enclosure;
  video?: string | Enclosure;
  enclosure?: Enclosure;
  author?: Author[];
  contributor?: Author[];
  published?: Date;
  copyright?: string;
  extensions?: Extension[];
}
interface Enclosure {
  url: string;
  type?: string;
  length?: number;
  title?: string;
  duration?: number;
}
interface Author {
  name?: string;
  email?: string;
  link?: string;
  avatar?: string;
}
interface Category {
  name?: string;
  domain?: string;
  scheme?: string;
  term?: string;
}
interface FeedOptions {
  id?: string;
  title: string;
  updated?: Date;
  generator?: string;
  language?: string;
  ttl?: number;
  stylesheet?: string;
  feed?: string;
  feedLinks?: {
    rss?: string;
    atom?: string;
    json?: string;
    [key: string]: string | undefined;
  };
  hub?: string;
  docs?: string;
  podcast?: boolean;
  category?: string;
  author?: Author;
  link?: string;
  description?: string;
  image?: string;
  favicon?: string;
  copyright?: string;
}
interface Extension {
  name: string;
  objects: Record<string, unknown>;
} //#endregion
//#region src/feed.d.ts
/**
 * Class used to generate Feeds
 */
declare class Feed {
  options: FeedOptions;
  items: Item[];
  categories: string[];
  contributors: Author[];
  extensions: Extension[];
  constructor(options: FeedOptions);
  /**
   * Add a feed item
   * @param item
   */
  addItem: (item: Item) => number;
  /**
   * Add a category
   * @param category
   */
  addCategory: (category: string) => number;
  /**
   * Add a contributor
   * @param contributor
   */
  addContributor: (contributor: Author) => number;
  /**
   * Adds an extension
   * @param extension
   */
  addExtension: (extension: Extension) => number;
  /**
   * Returns a Atom 1.0 feed
   */
  atom1: () => string;
  /**
   * Returns a RSS 2.0 feed
   */
  rss2: () => string;
  /**
   * Returns a JSON1 feed
   */
  json1: () => string;
} //#endregion
export { Author, Category, Enclosure, Extension, Feed, FeedOptions, Item };
//# sourceMappingURL=feed.d.ts.map