export default function ResearchPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Research Feed</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Machine Learning Applications in Climate Science</h2>
          <p className="text-gray-600 mb-4">
            Exploring how machine learning algorithms can be applied to climate data to improve predictions and mitigation strategies.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-md">Machine Learning</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-md">Climate Science</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Quantum Computing: Recent Advances</h2>
          <p className="text-gray-600 mb-4">
            A review of the latest breakthroughs in quantum computing and their implications for computational research.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-md">Quantum Computing</span>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-md">Computer Science</span>
          </div>
        </div>
      </div>
    </div>
  );
} 