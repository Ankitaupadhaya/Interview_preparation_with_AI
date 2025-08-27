import React, { useState } from 'react';
import HomePage from './HomePage';
import InterviewPage from './InterviewPage';
import ResultPage from './ResultPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [emailSent, setEmailSent] = useState(false);

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onStart={() => navigateTo('interview')} />;
      case 'interview':
        return <InterviewPage onComplete={(history) => {
          setInterviewHistory(history);
          navigateTo('result');
        }} />;
      case 'result':
        return <ResultPage history={interviewHistory} onEmailSent={() => setEmailSent(true)} emailSent={emailSent} />;
      default:
        return <HomePage onStart={() => navigateTo('interview')} />;
    }
  };

  return (
    <div>
      <h1>AI Interviewer</h1>
      {renderPage()}
    </div>
  );
}
