import React from 'react';
import MaterialDemo from '../components/MaterialDemo';

const MaterialDemoPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Material Effects Showcase</h1>
        <MaterialDemo />
      </div>
    </div>
  );
};

export default MaterialDemoPage; 