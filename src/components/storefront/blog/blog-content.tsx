interface BlogContentProps {
  html: string;
}

export function BlogContent({ html }: BlogContentProps) {
  return (
    <div
      className="prose prose-neutral prose-lg max-w-none prose-headings:font-heading prose-img:rounded-lg prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
