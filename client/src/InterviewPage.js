import React, { useState, useEffect, useCallback, useRef } from 'react';

const InterviewPage = ({ onComplete }) => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // <-- New state variable
  const [aiText, setAiText] = useState("Hello! Let's begin the interview. Could you please tell me a bit about yourself?");
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [questionCount, setQuestionCount] = useState(0);

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  const sendToAI = useCallback(async (text) => {
    const updatedHistory = [...interviewHistory, { role: 'user', text }];
    setInterviewHistory(updatedHistory);
    
    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatHistory: updatedHistory, userText: text }),
      });
      const data = await response.json();
      setAiText(data.message);
      setQuestionCount(prevCount => prevCount + 1);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setAiText("I am sorry, there was an error. Could you please try again?");
    }
  }, [interviewHistory]);

  const speakAndListen = useCallback((text) => {
    setIsSpeaking(true); // <-- Set flag to true at the start of speaking
    setInterviewHistory(prevHistory => [...prevHistory, { role: 'ai', text: text }]);

    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.onend = () => {
      console.log('AI finished speaking. Now listening...');
      setIsSpeaking(false); // <-- Reset flag after speaking is done
      if (questionCount < 5) {
        if (recognitionRef.current) {
          setIsListening(true);
          recognitionRef.current.start();
        }
      } else {
        onComplete([...interviewHistory, { role: 'ai', text: aiText }]);
      }
    };
    
    if (synthRef.current) {
      synthRef.current.speak(utterance);
    }
  }, [onComplete, interviewHistory, questionCount, aiText]);

  // --- 1. Initialize Objects and Clean Up (Runs Once) ---
  useEffect(() => {
    recognitionRef.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    synthRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // --- 2. Set Up Event Listeners (Runs when `sendToAI` changes) ---
  useEffect(() => {
    if (!recognitionRef.current) return;

    recognitionRef.current.onresult = (event) => {
      const last = event.results.length - 1;
      const text = event.results[last][0].transcript;
      setTranscript(text);
      setIsListening(false);
      sendToAI(text);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      recognitionRef.current.stop();
    };
  }, [sendToAI]);

  // --- 3. Manage the Interview Flow ---
  // This useEffect now checks if the assistant is already speaking before starting the next turn.
  useEffect(() => {
    if (aiText && !isSpeaking) {
      speakAndListen(aiText);
    }
  }, [aiText, isSpeaking, speakAndListen]);

  return (
    <div>
      <p>AI: {aiText}</p>
      <p>You: {transcript || (isListening ? "Listening..." : "Waiting for your response...")}</p>
      <div>
        <button onClick={() => {
            if (!isListening && recognitionRef.current) {
                setIsListening(true);
                recognitionRef.current.start();
            }
        }} disabled={isListening || isSpeaking}>
          {isListening ? "Listening..." : "Speak now"}
        </button>
      </div>
    </div>
  );
};

export default InterviewPage;