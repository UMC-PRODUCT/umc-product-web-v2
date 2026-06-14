import ReactMarkdown from "react-markdown"

import { cn } from "@/shared/lib/utils"

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  return (
    <div className={cn("text-body-1-regular text-teal-gray-900", className)}>
      <ReactMarkdown
        components={{
          p: ({ node: _node, children, ...props }) => (
            <p
              className="mb-5 leading-relaxed break-words whitespace-pre-wrap"
              {...props}
            >
              {children}
            </p>
          ),
          ul: ({ node: _node, children, ...props }) => (
            <ul className="mb-5 list-disc space-y-1 pl-5" {...props}>
              {children}
            </ul>
          ),
          ol: ({ node: _node, children, ...props }) => (
            <ol className="mb-5 list-decimal space-y-1 pl-5" {...props}>
              {children}
            </ol>
          ),
          li: ({ node: _node, children, ...props }) => (
            <li className="pl-0.5" {...props}>
              {children}
            </li>
          ),
          strong: ({ node: _node, children, ...props }) => (
            <strong className="text-teal-gray-900 font-semibold" {...props}>
              {children}
            </strong>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
