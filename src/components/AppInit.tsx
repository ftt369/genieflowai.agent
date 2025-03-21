import React, { useEffect } from 'react';
import { ModesLoader } from './ModesLoader';

export const AppInit: React.FC = () => {
  useEffect(() => {
    console.log('Application initializing...');
    // Add any other initialization logic here
  }, []);

  return (
    <>
      <ModesLoader />
      {/* Add other initialization components here */}
    </>
  );
};

export default AppInit; 