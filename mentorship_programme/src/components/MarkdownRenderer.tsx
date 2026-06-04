import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Renders markdown content with full GFM support.
 * Handles Jekyll front matter by stripping it before rendering.
 */
export default function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  // Strip Jekyll front matter (--- ... ---)
  const cleaned = content.replace(/^---[\s\S]*?---\n*/m, "");

  return (
    <div className={`content ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {cleaned}
      </ReactMarkdown>
    </div>
  );
}

/**
 * Parse Jekyll front matter from markdown content.
 * Returns metadata as a record and the body content separately.
 */
export function parseFrontMatter(content: string): {
  metadata: Record<string, unknown>;
  body: string;
} {
  const match = content.match(/^---\n([\s\S]*?)\n---\n*/m);
  if (!match) return { metadata: {}, body: content };

  const yamlBlock = match[1];
  const body = content.slice(match[0].length);
  const metadata: Record<string, unknown> = {};

  // Simple YAML key-value parser for front matter
  for (const line of yamlBlock.split("\n")) {
    const kvMatch = line.match(/^\s*(\w+):\s*(.+)/);
    if (kvMatch) {
      const val = kvMatch[2].trim();
      // Try boolean/number conversion
      if (val === "true") metadata[kvMatch[1]] = true;
      else if (val === "false") metadata[kvMatch[1]] = false;
      else if (!isNaN(Number(val))) metadata[kvMatch[1]] = Number(val);
      else metadata[kvMatch[1]] = val;
    }
  }

  return { metadata, body };
}
