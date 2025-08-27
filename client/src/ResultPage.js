import React, { useState } from 'react';

const ResultPage = ({ history, onEmailSent, emailSent }) => {
  const [email, setEmail] = useState('');

  const sendEmail = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email, history }),
      });
      if (response.ok) {
        onEmailSent();
      } else {
        console.error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  return (
    <div>
      <h2>Interview Complete!</h2>
      <p>Here is a summary of your conversation:</p>
      <div>
        {history.map((item, index) => (
          <div key={index}>
            <strong>{item.role === 'user' ? 'You' : 'AI'}:</strong> {item.text}
          </div>
        ))}
      </div>
      <p>
        Enter your email to receive a detailed performance summary.
      </p>
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
        />
        <button
          onClick={sendEmail}
          disabled={emailSent}
        >
          {emailSent ? "Email Sent!" : "Send Email"}
        </button>
      </div>
    </div>
  );
};

export default ResultPage;
