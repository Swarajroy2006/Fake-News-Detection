import { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:10000";

function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);

  useEffect(() => {
    const checkBackend = () => {
      fetch(`${API_BASE_URL}/health`)
        .then(() => setBackendOnline(true))
        .catch(() => setBackendOnline(false));
    };

    checkBackend();
    const intervalId = setInterval(checkBackend, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const analyzeNews = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });

      const data = await res.json();
      setResult(data);
    } catch {
      alert("Backend not reachable");
    }

    setLoading(false);
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="app">
      <main className="panel">
        <div className="panel-header">
          <div>
            <h1>Fake News Detector</h1>
            <p className="subtitle">AI-powered credibility analysis for students</p>
          </div>

          <div className={`status-pill ${backendOnline ? "online" : "offline"}`}>
            <span className="status-dot"></span>
            <span>{backendOnline ? "Backend Online" : "Backend Offline"}</span>
          </div>
        </div>

        <section className="composer">
          <label htmlFor="news-input">News Content</label>
          <textarea
            id="news-input"
            placeholder="Paste or type a news article snippet here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="composer-meta">
            <span>{wordCount} words</span>
            <span>{text.length} characters</span>
          </div>
        </section>

        <button
          className="analyze-btn"
          onClick={analyzeNews}
          disabled={loading || !backendOnline}
        >
          {loading ? "Analyzing..." : "Analyze News"}
        </button>

        {!backendOnline && (
          <p className="hint">Backend is offline. Start the API server to analyze news.</p>
        )}

        {result && (
          <div className={`result-card ${result.prediction === "Fake News" ? "fake" : "real"}`}>
            <p className="result-label">Analysis Result</p>
            <h2>{result.prediction}</h2>
            <p className="confidence">Confidence score: {result.confidence}</p>
          </div>
        )}
      </main>

      <footer className="footer">
        <span>Futuristic AI · Student Safety · Information Integrity</span>
        <span className="divider">|</span>

        <span className="credit">
          Developed by Swaraj Roy
          <a
            href="https://swaraj.ai.in"
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
            title="Website"
          >
            swaraj.ai.in
          </a>
          <a
            href="https://github.com/Swarajroy2006"
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
            title="GitHub Profile"
          >
            <svg
              height="16"
              width="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
        </span>
      </footer>
    </div>
  );
}

export default App;