import { useChat } from 'ai/react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: `/api/chat/openai`,
  })

  const examplePrompts = [
    "What is the Traction Gap Framework?",
    "Explain market engineering principles",
    "How do you scale a startup effectively?",
    "What are the key stages of company growth?",
    "How do you measure product-market fit?",
    "What is the difference between go-to-market and market engineering?"
  ]

  const handleExampleClick = (prompt: string) => {
    handleInputChange({ target: { value: prompt } } as any)
  }

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pinInput === '7893') {
      setIsAuthenticated(true)
      setPinError('')
    } else {
      setPinError('Invalid PIN code. Please try again.')
      setPinInput('')
    }
  }

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPinInput(e.target.value)
    if (pinError) setPinError('')
  }

  if (!isAuthenticated) {
    return (
      <div className="pin-overlay">
        <div className="pin-dialog">
          <div className="pin-header">
            <img src="/tgp-logo.webp" alt="Traction Gap Partners" className="pin-logo" />
            <h2>Welcome to Bruce Cleveland EM</h2>
            <p>Enter PIN code to chat with Bruce</p>
          </div>
          
          <form onSubmit={handlePinSubmit} className="pin-form">
            <input
              type="password"
              value={pinInput}
              onChange={handlePinChange}
              placeholder="Enter PIN code"
              className={`pin-input ${pinError ? 'pin-error' : ''}`}
              maxLength={4}
              autoFocus
            />
            {pinError && <div className="pin-error-message">{pinError}</div>}
            <button type="submit" className="pin-submit">
              Enter
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-content">
          <img src="/tgp-logo.webp" alt="Traction Gap Partners" className="header-logo" />
          <div className="header-text">
            <h1>Bruce Cleveland EM</h1>
            <p>Market Engineering Insights for TGP Partners</p>
          </div>
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div>
              <h3>Welcome to Bruce Cleveland EM</h3>
              <p>Ask me about market engineering, the Traction Gap Framework, or scaling strategies. Start a conversation by typing a message or try one of these examples:</p>
            </div>
            <div className="example-prompts">
              {examplePrompts.map((prompt, index) => (
                <button
                  key={index}
                  className="example-prompt"
                  onClick={() => handleExampleClick(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                <strong>{message.role === 'user' ? 'You' : 'Bruce Cleveland'}</strong>
                <div className="message-content">
                  {message.role === 'user' ? (
                    message.content
                  ) : (
                    <ReactMarkdown 
                      components={{
                        // Style code blocks
                        code: ({ node, inline, ...props }) => (
                          inline ? (
                            <code className="inline-code" {...props} />
                          ) : (
                            <pre className="code-block">
                              <code {...props} />
                            </pre>
                          )
                        ),
                        // Style lists
                        ul: ({ ...props }) => <ul className="markdown-list" {...props} />,
                        ol: ({ ...props }) => <ol className="markdown-list" {...props} />,
                        // Style links
                        a: ({ ...props }) => (
                          <a 
                            className="markdown-link" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            {...props} 
                          />
                        ),
                        // Style headers
                        h1: ({ ...props }) => <h1 className="markdown-h1" {...props} />,
                        h2: ({ ...props }) => <h2 className="markdown-h2" {...props} />,
                        h3: ({ ...props }) => <h3 className="markdown-h3" {...props} />,
                        // Style blockquotes
                        blockquote: ({ ...props }) => (
                          <blockquote className="markdown-blockquote" {...props} />
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message loading">
                <strong>Bruce Cleveland:</strong> <span className="thinking">Thinking...</span>
              </div>
            )}
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="input-container">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about market engineering, scaling strategies, or the Traction Gap Framework..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>

      <footer className="chat-footer">
        <p>
          Learn more about the Traction Gap Framework at{' '}
          <a 
            href="https://tractiongappartners.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-link"
          >
            tractiongappartners.com
          </a>
        </p>
      </footer>
    </div>
  )
}
