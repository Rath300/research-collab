export default function ResearchPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Research Feed</h1>
      
      <div className="space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Example Research Post {i + 1}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              This is a placeholder for a research post. In the actual app, this would display real content.
            </p>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span className="mr-4">Posted by: Researcher #{i + 1}</span>
              <span>Tags: Research, Science, Technology</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
