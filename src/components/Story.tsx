import React from 'react';
import './file.css';

const MainComponent: React.FC = () => {
  return (
    <main id="main" className="main">
      <div className="avatar">
        <img src={require('./assets/arsenal.jpg').default} alt="Your story" />
        <h4>Your story</h4>
      </div>
    </main>
  );
};

export default MainComponent;
