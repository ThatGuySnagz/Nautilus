'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline prose-code:font-mono prose-code:text-sm prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800 prose-img:rounded-lg prose-hr:border-zinc-800 text-zinc-100">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content || ''}
      </ReactMarkdown>
    </div>
  );
}
