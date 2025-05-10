export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function ResearchPostPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Research Post Page</h1>
      <p>This is a static research post page for demonstration purposes.</p>
      <p>Post ID: {params.id}</p>
    </div>
  );
} 