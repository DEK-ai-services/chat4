import React from 'react';
import JarvisChat from '~/components/Chat/Input/JarvisChat';

const JarvisPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="h-full">
        <JarvisChat />
      </div>
    </div>
  );
};

export default JarvisPage; 