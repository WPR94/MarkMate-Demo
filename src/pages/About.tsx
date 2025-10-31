import React from "react";

export default function About() {
  return (
    <div className="max-w-3xl mx-auto p-8 text-gray-800">
      <h1 className="text-4xl font-bold mb-4 text-blue-900">About Simple Rubriq</h1>
      <p className="text-lg mb-6">
        <strong>Simplify grading. Amplify teaching.</strong> Simple Rubriq is an AI-powered grading assistant designed to help teachers save time and improve feedback quality by aligning feedback directly to rubric criteria.
      </p>
      <h2 className="text-2xl font-semibold mt-8 mb-3 text-blue-800">Our Mission</h2>
      <p className="mb-6">
        We believe teachers shouldn't have to choose between speed and quality.
        Our mission is to make marking smarter, fairer, and data-driven —
        without removing the human touch that makes great teaching meaningful.
      </p>
      <h2 className="text-2xl font-semibold mt-8 mb-3 text-blue-800">How It Works</h2>
      <ol className="list-decimal pl-6 mb-6 space-y-2">
        <li>Upload or paste an essay (.docx, .pdf, or .txt)</li>
        <li>Optionally upload or paste your grading rubric</li>
        <li>Generate instant AI-powered feedback</li>
        <li>Save and track essay feedback (coming soon)</li>
      </ol>
      <h2 className="text-2xl font-semibold mt-8 mb-3 text-blue-800">Why Teachers Love It</h2>
      <ul className="list-disc pl-6 mb-6 space-y-1">
        <li>Cuts marking time by up to 70%</li>
        <li>Keeps feedback structured and consistent</li>
        <li>Supports scanned handwriting (OCR)</li>
        <li>Expanding to all subjects</li>
      </ul>
      <h2 className="text-2xl font-semibold mt-8 mb-3 text-blue-800">Built for Teachers</h2>
      <p className="mb-4">
        Simple Rubriq was created by <strong>Wilson Roserie</strong>, an IT engineer
        passionate about using technology to make teaching simpler, smarter, and
        more human.
      </p>
      <p className="italic text-gray-700 mb-8">
        "Simple Rubriq is about helping teachers focus on what matters most — inspiring
        learning — not fighting marking fatigue."
      </p>
      <div className="mt-8 text-sm text-gray-600">
        <p>🌐 <strong>Demo:</strong> <a href="https://markmate.vercel.app" className="text-blue-600 underline">https://markmate.vercel.app</a></p>
        <p>📂 <strong>GitHub:</strong> <a href="https://github.com/WPR94/MarkMate-Demo" className="text-blue-600 underline">GitHub Repository</a></p>
        <p>📧 <strong>Email:</strong> markmate.ai@gmail.com</p>
      </div>
    </div>
  );
}