import { useChat } from 'ai/react'
import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import html2pdf from 'html2pdf.js'
import { marked } from 'marked'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')
  const [shouldSubmit, setShouldSubmit] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

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
    
    // Configure marked for proper rendering
    marked.setOptions({
      breaks: true,
      gfm: true
    });
    
    // Create HTML content for PDF
    const element = document.createElement('div');
    element.style.padding = '40px';
    element.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    element.style.lineHeight = '1.6';
    element.style.color = '#333';
    
    // Header with TGP branding
    element.innerHTML = `
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="color: #36164A; font-size: 28px; margin-bottom: 10px;">Bruce Cleveland EM Consultation</h1>
        <p style="color: #666; font-size: 14px;">Traction Gap Partners</p>
        <p style="color: #666; font-size: 14px;">${new Date().toLocaleString()}</p>
      </div>
      <hr style="border: none; border-top: 2px solid #36164A; margin: 30px 0;">
    `;
    
    // Add CSS styles for markdown content
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      .pdf-content h1, .pdf-content h2, .pdf-content h3, .pdf-content h4 { 
        color: #36164A; 
        margin-top: 20px; 
        margin-bottom: 10px; 
      }
      .pdf-content h1 { font-size: 24px; }
      .pdf-content h2 { font-size: 20px; }
      .pdf-content h3 { font-size: 18px; }
      .pdf-content h4 { font-size: 16px; }
      .pdf-content p { margin-bottom: 10px; }
      .pdf-content ul, .pdf-content ol { 
        margin-left: 30px; 
        margin-bottom: 10px; 
      }
      .pdf-content li { margin-bottom: 5px; }
      .pdf-content code { 
        background: #f4f4f4; 
        padding: 2px 4px; 
        border-radius: 3px; 
        font-family: 'Courier New', monospace;
        font-size: 14px;
      }
      .pdf-content pre { 
        background: #f4f4f4; 
        padding: 15px; 
        border-radius: 5px; 
        overflow-x: auto;
        margin-bottom: 15px;
      }
      .pdf-content pre code { 
        background: none; 
        padding: 0; 
      }
      .pdf-content blockquote { 
        border-left: 3px solid #36164A; 
        padding-left: 15px; 
        margin-left: 0;
        color: #666;
      }
      .pdf-content strong { font-weight: 600; }
      .pdf-content em { font-style: italic; }
    `;
    element.appendChild(styleSheet);
    
    // Add messages
    messages.forEach((msg, index) => {
      const messageDiv = document.createElement('div');
      messageDiv.style.marginBottom = '30px';
      
      if (msg.role === 'user') {
        messageDiv.innerHTML = `
          <h3 style="color: #36164A; margin-bottom: 10px; font-size: 16px;">Question:</h3>
          <div style="background: #f5f5f5; padding: 15px; border-left: 3px solid #36164A; margin-left: 20px;">
            ${msg.content.replace(/\n/g, '<br>')}
          </div>
        `;
      } else {
        // Parse markdown content to HTML
        const parsedContent = marked.parse(msg.content);
        messageDiv.innerHTML = `
          <h3 style="color: #542375; margin-bottom: 10px; font-size: 16px;">Bruce Cleveland:</h3>
          <div class="pdf-content" style="padding: 15px; margin-left: 20px;">
            ${parsedContent}
          </div>
        `;
      }
      
      element.appendChild(messageDiv);
      
      if (index < messages.length - 1) {
        const hr = document.createElement('hr');
        hr.style.border = 'none';
        hr.style.borderTop = '1px solid #e0e0e0';
        hr.style.margin = '20px 0';
        element.appendChild(hr);
      }
    });
    
    // Footer
    const footer = document.createElement('div');
    footer.style.marginTop = '40px';
    footer.style.paddingTop = '20px';
    footer.style.borderTop = '2px solid #36164A';
    footer.style.textAlign = 'center';
    footer.style.color = '#666';
    footer.style.fontSize = '12px';
    footer.innerHTML = `
      <p>Generated from Bruce Cleveland Expert Model</p>
      <p>Learn more at <span style="color: #36164A;">tractiongappartners.com</span></p>
    `;
    element.appendChild(footer);
    
    // Configure PDF options
    const opt = {
      margin: 0.5,
      filename: `bruce-cleveland-consultation-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    // Generate PDF
    try {
      html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Please try again.');
    }
  }

  const [isPinLoading, setIsPinLoading] = useState(false);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPinLoading(true);
    setPinError('');
    try {
      const response = await fetch('/api/validate-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput })
      });
      const data = await response.json();
      
      if (data.valid) {
        setIsAuthenticated(true);
      } else {
        setPinError(data.error || 'Invalid PIN code. Please try again.');
        setPinInput('');
      }
    } catch {
      setPinError('Error validating PIN. Please try again.');
      setPinInput('');
    } finally {
      setIsPinLoading(false);
    }
  };

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
              
              <button type="submit" className="pin-submit" disabled={isPinLoading}>
                {isPinLoading ? 'Validating...' : 'Start consultation'}
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
                title="Download conversation as PDF"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download PDF
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
