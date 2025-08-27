import React from 'react';

const HomePage = ({ onStart }) => {
  return (
    <div>
      <p>
        Get ready for your virtual interview. The AI will ask you questions, and you will respond by speaking into your microphone.
      </p>
      <button onClick={onStart}>
        Start Interview
      </button>
    </div>
  );
};

export default HomePage;
