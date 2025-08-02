// Tailwind Test Component
import React from 'react';

const TailwindTest = () => {
  return (
    <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-2">Tailwind CSS is Working! 🎉</h2>
      <p className="text-sm opacity-90">
        This component uses Tailwind classes for styling.
      </p>
      <div className="mt-4 space-x-2">
        <button className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100 transition-colors">
          Button 1
        </button>
        <button className="bg-transparent border border-white px-4 py-2 rounded hover:bg-white hover:text-blue-600 transition-colors">
          Button 2
        </button>
      </div>
    </div>
  );
};

export default TailwindTest;
