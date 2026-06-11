import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import RollingThreeLogo from '../assets/rolling-three-whitebg-logo.png'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
 
  .login-root {
    min-height: 100vh;
    background: #F5F7FA;
    color: #0D1B4B;
    font-family: 'DM Sans', sans-serif;
    display: flex;
    flex-direction: column;
  }
 
  .login-header {
    padding: 28px 48px;
    border-bottom: 1px solid #DDE2EE;
  }
 
  .login-logo {
    display: flex;
    align-items: center;
    justify-content: center;
  }
 
  .login-body {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px 24px;
  }
 
  .login-card {
    width: 100%;
    max-width: 420px;
  }
 
  .login-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #1DC8A8;
    margin-bottom: 10px;
  }
 
  .login-title {
    font-family: 'DM Serif Display', serif;
    font-size: 38px;
    font-weight: 400;
    letter-spacing: -0.8px;
    color: #0D1B4B;
    margin: 0 0 8px;
    line-height: 1.15;
  }
 
  .login-subtitle {
    font-size: 14px;
    color: #94A3B8;
    font-weight: 300;
    margin: 0 0 40px;
  }
 
  .field-group {
    margin-bottom: 20px;
  }
 
  .field-label {
    display: block;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #64748B;
    margin-bottom: 8px;
  }
 
  .field-input {
    width: 100%;
    background: #FFFFFF;
    border: 1px solid #DDE2EE;
    color: #0D1B4B;
    padding: 12px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
    box-sizing: border-box;
  }
 
  .field-input:focus {
    border-color: #1DC8A8;
  }
 
  .field-input::placeholder {
    color: #C8D0E0;
  }
 
  .btn-login {
    width: 100%;
    background: #1DC8A8;
    color: #FFFFFF;
    border: none;
    padding: 14px 32px;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
    margin-top: 8px;
  }
 
  .btn-login:hover:not(:disabled) {
    background: #17B398;
    transform: translateY(-1px);
  }
 
  .btn-login:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
 
  .error-banner {
    background: #FEF2F2;
    border: 1px solid #FECACA;
    color: #DC2626;
    padding: 14px 20px;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    margin-bottom: 24px;
  }
 
  .login-footer {
    padding: 24px 48px;
    border-top: 1px solid #DDE2EE;
    text-align: center;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: #C8D0E0;
    letter-spacing: 0.06em;
  }
`

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (authError) {
      setError(authError.message)
      setSubmitting(false)
      return
    }

    navigate('/')
  }

  return (
    <>
      <style>{styles}</style>
      <div className="login-root">
        <header className="login-header">
          <div className="login-logo">
            <img src={RollingThreeLogo} alt="Rolling Three" height="125" />
          </div>
        </header>

        <main className="login-body">
          <div className="login-card">
            <div className="login-eyebrow">Welcome back</div>
            <h1 className="login-title">Sign in</h1>
            <p className="login-subtitle">Track your continuing education credits.</p>

            {error && <div className="error-banner">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="field-group">
                <label className="field-label">Email</label>
                <input
                  className="field-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoFocus
                />
              </div>

              <div className="field-group">
                <label className="field-label">Password</label>
                <input
                  className="field-input"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button type="submit" className="btn-login" disabled={submitting}>
                {submitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>
        </main>

        <footer className="login-footer">
          Rolling Three — continuing education record keeper
        </footer>
      </div>
    </>
  )
}
