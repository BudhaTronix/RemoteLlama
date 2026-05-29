"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function CodeBlock({
  className,
  children,
  inline,
}: {
  className?: string;
  children?: React.ReactNode;
  inline?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const code = String(children ?? "").replace(/\n$/, "");
  const language = className?.replace("language-", "") || "text";

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  if (inline) {
    return (
      <code className="rounded-md bg-brandSoft px-1.5 py-0.5 text-[0.92em] font-medium text-brand">
        {children}
      </code>
    );
  }

  return (
    <div className="group relative my-5 overflow-hidden rounded-[24px] border border-strokeStrong bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface-solid)_92%,transparent),color-mix(in_srgb,var(--surface-alt)_96%,transparent))] shadow-soft">
      <div className="flex items-center justify-between border-b border-stroke px-4 py-2.5 text-xs uppercase tracking-[0.24em] text-muted">
        <span>{language}</span>
        <button
          type="button"
          onClick={() => void copyCode()}
          className="focus-ring token-pill micro-lift inline-flex items-center gap-2 rounded-full px-2.5 py-1.5 transition hover:text-ink"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-4 text-sm leading-6 text-[color:var(--ink-soft)]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose max-w-none text-inkSoft prose-headings:font-heading prose-headings:tracking-[-0.03em] prose-headings:text-ink prose-p:my-3 prose-p:leading-7 prose-pre:my-0 prose-code:before:hidden prose-code:after:hidden prose-strong:text-ink prose-li:my-1 prose-li:text-inkSoft prose-blockquote:border-l-brand prose-blockquote:text-muted prose-a:text-brand dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeBlock,
          a: ({ ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-brand underline decoration-brand/30 underline-offset-4"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
