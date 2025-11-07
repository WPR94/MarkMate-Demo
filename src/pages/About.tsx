export default function About() {
  return (
    <div className="max-w-3xl mx-auto p-8 text-gray-800 dark:text-gray-200">
      <h1 className="text-4xl font-bold mb-4 text-blue-900 dark:text-blue-300">About Simple Rubriq</h1>
      <p className="text-lg mb-6 leading-relaxed">
        <strong>Simplify grading. Amplify teaching.</strong> Simple Rubriq is an AI-powered grading assistant that helps teachers save time and improve feedback quality by aligning comments directly to your rubric criteria.
      </p>
      
      <h2 className="text-2xl font-semibold mt-8 mb-3 text-blue-800 dark:text-blue-300">Our Mission</h2>
      <p className="mb-6 leading-relaxed">
        We believe teachers shouldn't have to choose between speed and quality when marking essays. 
        Our mission is to make grading smarter, fairer, and more consistent, while keeping the human 
        touch that makes great teaching meaningful. Teachers deserve tools that respect their 
        expertise and free up time for what really matters: connecting with students.
      </p>
      
      <h2 className="text-2xl font-semibold mt-8 mb-3 text-blue-800 dark:text-blue-300">How It Works</h2>
      <ol className="list-decimal pl-6 mb-6 space-y-2 leading-relaxed">
        <li>Upload or paste an essay (supports .docx, .pdf, or plain text)</li>
        <li>Add your grading rubric or use one of our templates</li>
        <li>Get instant AI-powered feedback aligned to your criteria</li>
        <li>Review, adjust, and save the feedback to track student progress</li>
      </ol>
      
      <h2 className="text-2xl font-semibold mt-8 mb-3 text-blue-800 dark:text-blue-300">Why Teachers Love It</h2>
      <ul className="list-disc pl-6 mb-6 space-y-2 leading-relaxed">
        <li>Reduces marking time by up to 70%, giving you hours back every week</li>
        <li>Maintains consistent, structured feedback across all student work</li>
        <li>Works with handwritten essays using optical character recognition</li>
        <li>Adapts to any subject area, from English to History to Science</li>
        <li>Keeps you in control with the ability to edit and personalize every comment</li>
      </ul>
      
      <h2 className="text-2xl font-semibold mt-8 mb-3 text-blue-800 dark:text-blue-300">Built by Teachers, For Teachers</h2>
      <p className="mb-4 leading-relaxed">
        Simple Rubriq was created by <strong>Wilson Roserie</strong>, an IT engineer and educator 
        who understands the challenges of marking at scale. After seeing firsthand how marking 
        fatigue affects feedback quality, Wilson built Simple Rubriq to give teachers the support 
        they need without sacrificing the personal touch students deserve.
      </p>
      <p className="mb-8 leading-relaxed text-gray-700 dark:text-gray-300 border-l-4 border-blue-500 pl-4 italic">
        "Simple Rubriq is about helping teachers focus on what matters most: inspiring learning 
        and building relationships with students. Technology should make teaching easier, not 
        more complicated."
      </p>
      
      <div className="mt-8 text-sm text-gray-600 dark:text-gray-400 space-y-2">
        <p>🌐 <strong>Demo:</strong> <a href="https://simple-rubriq-demo.vercel.app" className="text-blue-600 dark:text-blue-400 underline hover:text-blue-700">simple-rubriq-demo.vercel.app</a></p>
        <p>📂 <strong>GitHub:</strong> <a href="https://github.com/WPR94/MarkMate-Demo" className="text-blue-600 dark:text-blue-400 underline hover:text-blue-700">View our open source code</a></p>
        <p>📧 <strong>Contact:</strong> simplrubriq@gmail.com</p>
      </div>
    </div>
  );
}