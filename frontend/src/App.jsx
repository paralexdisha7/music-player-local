// src/App.jsx

import React from 'react';
import MusicPlayer from './components/MusicPlayer';
import './index.css'; // Import Tailwind CSS

const App = () => {
  return (
    <div className="h-screen flex items-center justify-center">
      <MusicPlayer />
    </div>
  );
};

export default App;
