import type { ReactNode } from "react";

/**
 * Minimal markdown renderer for the article bodies: `##`/`###` headings,
 * paragraphs, `>` blockquotes and inline `**bold**` / `*italic*`.
 * Kept tiny on purpose — the content layer is local and controlled.
 */
function inline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;

  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      out.push(
        <strong key={`${keyPrefix}-b${i}`} className="font-semibold">
          {m[1]}
        </strong>,
      );
    } else {
      out.push(<em key={`${keyPrefix}-i${i}`}>{m[2]}</em>);
    }
    last = m.index + m[0].length;
    i += 1;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ source }: { source: string }) {
  const lines = source.split("\n");
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let quote: string[] = [];
  let key = 0;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const text = paragraph.join(" ").trim();
    if (text) {
      blocks.push(
        <p key={`p${key++}`} className="t-body">
          {inline(text, `p${key}`)}
        </p>,
      );
    }
    paragraph = [];
  };

  const flushQuote = () => {
    if (quote.length === 0) return;
    blocks.push(
      <blockquote
        key={`q${key++}`}
        className="my-2 border-l-2 border-ink pl-6"
      >
        <p className="t-h4">{inline(quote.join(" ").trim(), `q${key}`)}</p>
      </blockquote>,
    );
    quote = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.startsWith("### ")) {
      flushParagraph();
      flushQuote();
      blocks.push(
        <h3 key={`h3${key++}`} className="t-h4 mt-6">
          {inline(line.slice(4), `h3${key}`)}
        </h3>,
      );
      continue;
    }
    if (line.startsWith("## ")) {
      flushParagraph();
      flushQuote();
      blocks.push(
        <h2 key={`h2${key++}`} className="t-h3 mt-8">
          {inline(line.slice(3), `h2${key}`)}
        </h2>,
      );
      continue;
    }
    if (line.startsWith(">")) {
      flushParagraph();
      const rest = line.replace(/^>\s?/, "");
      if (rest.trim() === "") {
        flushQuote();
      } else {
        quote.push(rest);
      }
      continue;
    }
    if (line.trim() === "") {
      flushParagraph();
      flushQuote();
      continue;
    }
    if (/^\[.+\]\(.+\)$/.test(line.trim()) || line.startsWith("# ")) continue;
    paragraph.push(line);
  }
  flushParagraph();
  flushQuote();

  return <div className="flex flex-col gap-6">{blocks}</div>;
}
