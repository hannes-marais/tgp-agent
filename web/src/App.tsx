import { useChat } from 'ai/react'
import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')
  const [shouldSubmit, setShouldSubmit] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [input])

  // Submit when shouldSubmit is true
  useEffect(() => {
    if (shouldSubmit && input.trim()) {
      const form = document.querySelector('.inputForm') as HTMLFormElement
      if (form) {
        form.requestSubmit()
      }
      setShouldSubmit(false)
    }
  }, [shouldSubmit, input])

  // Global Enter key handler for PIN screen
  useEffect(() => {
    if (!isAuthenticated) {
      const handleGlobalKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
          const form = (e.target as HTMLElement).closest('form')
          if (form && form.classList.contains('pin-form')) {
            e.preventDefault()
            handlePinSubmit(e as any)
          }
        }
      }
      
      document.addEventListener('keydown', handleGlobalKeyDown)
      return () => document.removeEventListener('keydown', handleGlobalKeyDown)
    }
  }, [isAuthenticated, pinInput])

  const handleExampleClick = (prompt: string) => {
    // Set the input value
    handleInputChange({ target: { value: prompt } } as any)
    // Trigger submit on next render
    setShouldSubmit(true)
  }

  const downloadConversation = () => {
    if (messages.length === 0) return;
    
    // Create markdown content
    let markdown = `# Bruce Cleveland EM Conversation\n\n`;
    markdown += `Date: ${new Date().toLocaleString()}\n\n`;
    markdown += `---\n\n`;
    
    messages.forEach(msg => {
      if (msg.role === 'user') {
        markdown += `## User:\n${msg.content}\n\n`;
      } else {
        markdown += `## Bruce Cleveland:\n${msg.content}\n\n`;
      }
      markdown += `---\n\n`;
    });
    
    // Create blob and download
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bruce-cleveland-conversation-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/validate-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput })
      })
      const { valid } = await response.json()
      
      if (valid) {
        setIsAuthenticated(true)
        setPinError('')
      } else {
        setPinError('Invalid PIN code. Please try again.')
        setPinInput('')
      }
    } catch {
      setPinError('Error validating PIN. Please try again.')
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
        <div className="pin-container-wrapper">
          <div className="pin-stats-panel">
            <div className="stats-content">
              <div className="stats-row">
                <div className="stat-item">
                  <div className="stat-number">80%</div>
                  <div className="stat-text">of startups fail</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">60%</div>
                  <div className="stat-text">of new products fail from mature companies</div>
                </div>
              </div>
              <div className="stat-insight">
                <p>The #1 reason for startup and new product failure is no market need.</p>
                <p className="highlight">To succeed, you must engineer a market.</p>
              </div>
            </div>
          </div>
          <div className="pin-dialog">
            <div className="pin-header">
              <div className="pin-logos">
                <img src="/tgp-logo.webp" alt="Traction Gap Partners" className="pin-logo" />
                <img src="/bruce-thumb.jpg" alt="Bruce Cleveland" className="pin-bruce-photo" />
              </div>
              <h2>Bruce Cleveland EM</h2>
            </div>
            
            <form onSubmit={handlePinSubmit} className="pin-form">
              <div className="pin-input-group">
                <label htmlFor="pin">Enter PIN to continue:</label>
                <input
                  id="pin"
                  type="password"
                  value={pinInput}
                  onChange={handlePinChange}
                  className={`pin-input ${pinError ? 'pin-error' : ''}`}
                  placeholder="• • • •"
                  maxLength={4}
                  autoFocus
                />
                {pinError && <div className="pin-error">{pinError}</div>}
              </div>
              
              <button type="submit" className="pin-submit">
                Start consultation
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="appContainer">
      {/* Left Sidebar with Branding */}
      <div className="appSidebar">
        <div className="headerContent">
          <div className="branding">
            <div className="logos">
              <img src="/tgp-logo.webp" alt="Traction Gap Partners" className="tgpLogo" />
            </div>
          </div>
          
          <h1>Bruce Cleveland EM</h1>
          
          <div className="description">
            Get strategic guidance on category creation, market engineering, startup scaling, 
            and the Traction Gap Framework from Bruce Cleveland's expertise digitally coded 
            into an Expert Model.
          </div>
        </div>
        
        <div className="footer">
          <a href="https://tractiongappartners.com" target="_blank" rel="noopener noreferrer">
            Learn more about the Traction Gap Framework at tractiongappartners.com
          </a>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="appMain">
        <div className="chatContainer">
          {/* Chat Header with Download Button */}
          {messages.length > 0 && (
            <div className="chatHeader">
              <button 
                className="downloadButton" 
                onClick={downloadConversation}
                title="Download conversation as Markdown"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download Conversation
              </button>
            </div>
          )}
          <div className="messagesContainer">
            {messages.length === 0 && (
              <div className="examplePrompts">
                {examplePrompts.map((prompt, index) => (
                  <div
                    key={index}
                    className="examplePrompt"
                    onClick={() => handleExampleClick(prompt)}
                  >
                    {prompt}
                  </div>
                ))}
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`message ${message.role}`}>
                <div className="messageContent">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="message assistant">
                <div className="messageContent">
                  <em>Bruce is thinking...</em>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="inputContainer">
            <form onSubmit={handleSubmit} className="inputForm">
              <textarea
                ref={textareaRef}
                value={input}
                placeholder="Ask about market engineering, scaling strategies, or the Traction Gap Framework..."
                onChange={handleInputChange}
                className="messageInput"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="sendButton"
              >
                →
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
