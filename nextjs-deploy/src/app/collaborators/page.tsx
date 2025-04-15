export default function CollaboratorsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Find Collaborators</h1>
      
      <div className="space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow flex">
            <div className="mr-4 flex-shrink-0">
              <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-300">
                  {String.fromCharCode(65 + i)}
                </span>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-1">Researcher #{i + 1}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                {["Professor", "PhD Student", "Research Scientist", "Postdoctoral Fellow", "Principal Investigator"][i]} 
                at {["Stanford University", "MIT", "Oxford University", "Harvard University", "UC Berkeley"][i]}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Interests: 
                {[
                  " Machine Learning, Data Science, Natural Language Processing",
                  " Climate Science, Renewable Energy, Sustainability",
                  " Genetics, Molecular Biology, Bioinformatics",
                  " Quantum Computing, Theoretical Physics, Algorithms",
                  " Neuroscience, Brain Imaging, Cognitive Psychology"
                ][i]}
              </p>
              <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
                Connect
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
