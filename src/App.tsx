import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import './App.css'

function App() {
  const [prompt, setPrompt] = useState('');
  const [discussionResult, setDiscussionResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setDiscussionResult('');

    try {
      const response = await fetch('https://express-server-rvyr.onrender.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt }),
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        const decodedChunk = decoder.decode(value);
        setDiscussionResult((prevResult) => prevResult + decodedChunk);
      }

    } catch (error) {
      setDiscussionResult('通信中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1>AI協議システム</h1>
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="ここに協議させたいテーマを入力してください..."
          rows={4}
          cols={50}
        />
        <br />
        <button type="submit" disabled={loading}>
          {loading ? '協議中...' : '協議を開始'}
        </button>
      </form>

      {discussionResult && (
        <div className="response-card">
          <h2>AIによる協議結果:</h2>
          <ReactMarkdown>{discussionResult}</ReactMarkdown>
        </div>
      )}
    </>
  )
}

export default App

// Force re-deploy on Cloudflare