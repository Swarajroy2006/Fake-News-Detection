import { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "development" ? "http://127.0.0.1:10000" : "/api");

function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

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

  const getProbabilities = () => {
    if (!result) {
      return { fakeProbability: 50, realProbability: 50 };
    }

    const rawConfidence = Number(result.confidence);

    if (Number.isNaN(rawConfidence)) {
      return { fakeProbability: 50, realProbability: 50 };
    }

    let fakeProbability;

    if (rawConfidence >= 0 && rawConfidence <= 1) {
      fakeProbability = rawConfidence * 100;
    } else {
      fakeProbability = (1 / (1 + Math.exp(-rawConfidence))) * 100;
    }

    if (result.prediction === "Fake News" && fakeProbability < 50) {
      fakeProbability = 100 - fakeProbability;
    }

    if (result.prediction !== "Fake News" && fakeProbability > 50) {
      fakeProbability = 100 - fakeProbability;
    }

    fakeProbability = Math.min(99.99, Math.max(0.01, fakeProbability));
    const realProbability = 100 - fakeProbability;

    return {
      fakeProbability,
      realProbability
    };
  };

  const { fakeProbability, realProbability } = getProbabilities();
  const probabilityLabel = result?.prediction === "Fake News" ? "Fake Probability" : "Real Probability";
  const probabilityValue = result?.prediction === "Fake News" ? fakeProbability : realProbability;

  return (
    <div className="app">
      <header className="top-header">
        <div className="profile-chip-wrap">
          <h2 className="profile-name">Swaraj Roy</h2>
          <span className="profile-badge">BCA '28</span>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle light and dark theme"
            title="Toggle theme"
          >
            {theme === "dark" ? (
              <svg
                className="theme-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3c0 0 0 0 0 0a7 7 0 0 0 9.79 9.79z" />
              </svg>
            ) : (
              <svg
                className="theme-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
            )}
          </button>

          <a
            href="https://github.com/Swarajroy2006/Fake-News-Detection"
            target="_blank"
            rel="noopener noreferrer"
            className="header-github"
            aria-label="Open GitHub profile"
            title="GitHub"
          >
            <svg
              className="github-icon"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
        </div>
      </header>

      <main className="panel">
        <div className="panel-header">
          <div>
            <h1>Fake News Detector</h1>
            <p className="subtitle">AI-powered credibility analysis for students</p>
          </div>

          <div className={`status-pill ${backendOnline ? "online" : "offline"}`}>
            <span className="status-dot"></span>
            <span>{backendOnline ? "Server Online" : "Server Down"}</span>
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
          <div className="result-stage">
            <div className={`result-card result-3d ${result.prediction === "Fake News" ? "fake" : "real"}`}>
              <p className="result-label">Analysis Result</p>
              <h2>{result.prediction}</h2>
              <div className="probability-block">
                <p className="confidence">{probabilityLabel}: {probabilityValue.toFixed(0)}%</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p className="footer-title">Made by Swaraj Roy</p>

        <div className="social-links">
          <a
            href="https://www.facebook.com/swarajs.world"
            target="_blank"
            rel="noopener noreferrer"
            className="social-btn"
            aria-label="Facebook"
            title="Facebook"
          >
            <svg viewBox="0 0 24 24" className="social-icon" aria-hidden="true">
              <path fill="currentColor" d="M14 8h3V4h-3c-3 0-5 2-5 5v2H6v4h3v5h4v-5h3l1-4h-4V9c0-.6.4-1 1-1z" />
            </svg>
          </a>

          <a
            href="https://www.instagram.com/swaraj.php/"
            target="_blank"
            rel="noopener noreferrer"
            className="social-btn"
            aria-label="Instagram"
            title="Instagram"
          >
            <svg viewBox="0 0 24 24" className="social-icon" aria-hidden="true">
              <path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm11.5 1.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
            </svg>
          </a>

          <a
            href="https://www.linkedin.com/in/swarajroy2006/"
            target="_blank"
            rel="noopener noreferrer"
            className="social-btn"
            aria-label="LinkedIn"
            title="LinkedIn"
          >
            <svg viewBox="0 0 24 24" className="social-icon" aria-hidden="true">
              <path fill="currentColor" d="M6.94 8.5a1.94 1.94 0 1 1 0-3.88 1.94 1.94 0 0 1 0 3.88zM5.2 9.8h3.5V20H5.2V9.8zm5.7 0h3.36v1.4h.05c.47-.9 1.62-1.84 3.33-1.84 3.56 0 4.22 2.35 4.22 5.4V20h-3.5v-4.68c0-1.12-.02-2.56-1.56-2.56-1.56 0-1.8 1.22-1.8 2.48V20h-3.5V9.8z" />
            </svg>
          </a>

          <a
            href="https://github.com/Swarajroy2006"
            target="_blank"
            rel="noopener noreferrer"
            className="social-btn"
            aria-label="GitHub"
            title="GitHub"
          >
            <svg viewBox="0 0 16 16" className="social-icon" aria-hidden="true">
              <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
        </div>

        <p className="footer-copy">© 2026 Swaraj Roy. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;