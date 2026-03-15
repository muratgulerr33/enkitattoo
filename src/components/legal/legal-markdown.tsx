import { Fragment } from "react";

type MarkdownBlock =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "blockquote"; lines: string[] }
  | { type: "hr" };

function renderInlineMarkdown(text: string): React.ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={`${part}-${index}`} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }

      return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
    });
}

function tokenizeMarkdown(markdown: string): MarkdownBlock[] {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  let paragraphLines: string[] = [];
  let listItems: string[] = [];
  let quoteLines: string[] = [];

  function flushParagraph() {
    if (!paragraphLines.length) {
      return;
    }

    blocks.push({
      type: "paragraph",
      text: paragraphLines.join(" ").replace(/\s+/g, " ").trim(),
    });
    paragraphLines = [];
  }

  function flushList() {
    if (!listItems.length) {
      return;
    }

    blocks.push({ type: "list", items: [...listItems] });
    listItems = [];
  }

  function flushQuote() {
    if (!quoteLines.length) {
      return;
    }

    blocks.push({ type: "blockquote", lines: [...quoteLines] });
    quoteLines = [];
  }

  function flushAll() {
    flushParagraph();
    flushList();
    flushQuote();
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushAll();
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushAll();
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2].trim(),
      });
      continue;
    }

    if (/^---+$/.test(line)) {
      flushAll();
      blocks.push({ type: "hr" });
      continue;
    }

    const quoteMatch = line.match(/^>\s?(.*)$/);
    if (quoteMatch) {
      flushParagraph();
      flushList();
      quoteLines.push(quoteMatch[1].trim());
      continue;
    }

    const listMatch = line.match(/^- (.+)$/);
    if (listMatch) {
      flushParagraph();
      flushQuote();
      listItems.push(listMatch[1].trim());
      continue;
    }

    if (/^\*\*[^*]+:\*\*/.test(line)) {
      flushAll();
      blocks.push({ type: "paragraph", text: line });
      continue;
    }

    flushList();
    flushQuote();
    paragraphLines.push(line);
  }

  flushAll();

  return blocks;
}

export function LegalMarkdown({ markdown }: { markdown: string }) {
  const blocks = tokenizeMarkdown(markdown);

  return (
    <div className="space-y-4 text-sm leading-7 text-foreground/90 sm:text-[15px]">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          if (block.level === 2) {
            return (
              <h2 key={index} className="pt-3 text-xl font-semibold tracking-tight text-foreground">
                {renderInlineMarkdown(block.text)}
              </h2>
            );
          }

          if (block.level >= 3) {
            return (
              <h3 key={index} className="pt-2 text-base font-semibold text-foreground">
                {renderInlineMarkdown(block.text)}
              </h3>
            );
          }

          return (
            <h2 key={index} className="text-xl font-semibold tracking-tight text-foreground">
              {renderInlineMarkdown(block.text)}
            </h2>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={index} className="space-y-2 pl-5 text-foreground/85 list-disc marker:text-foreground/65">
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`}>{renderInlineMarkdown(item)}</li>
              ))}
            </ul>
          );
        }

        if (block.type === "blockquote") {
          return (
            <blockquote
              key={index}
              className="rounded-2xl border border-border bg-surface-1 px-4 py-3 text-foreground/85"
            >
              {block.lines.map((line, lineIndex) => (
                <p key={`${line}-${lineIndex}`}>{renderInlineMarkdown(line)}</p>
              ))}
            </blockquote>
          );
        }

        if (block.type === "hr") {
          return <hr key={index} className="border-border" />;
        }

        return (
          <p key={index} className="text-foreground/85">
            {renderInlineMarkdown(block.text)}
          </p>
        );
      })}
    </div>
  );
}
