import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Eye, EyeOff, Lock, Mail } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      if (err?.message && err.message !== '{}') {
        setError(err.message)
      } else {
        setError('Server error: Your admin account might be corrupted. Please recreate it in the Supabase Dashboard.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Animated background */}
      <div className="login-bg">
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />
        <div className="login-orb login-orb-4" />
        <div className="login-grid-overlay" />
      </div>

      <div className="login-container">
        <div className="login-split-card login-card-reveal">
          {/* Left Side Container */}
          <div className="login-split-left">
             <div className="login-split-left-content login-left-animate">
                <div className="login-title-row login-anim-item" style={{animationDelay: '0.3s'}}>
                   <img src="/logos/TMPSD.png" alt="TMPSD Logo" className="login-inline-logo login-logo-float" />
                   <div className="login-title-text">
                     <h2 className="login-split-left-title">Traffic Management<br/>and Public Safety Division</h2>
                     <p className="login-split-left-desc">Palayan City • Capital of Nueva Ecija</p>
                   </div>
                </div>
                
                <div className="login-compliance-footer left-pane-footer login-anim-item" style={{animationDelay: '0.5s'}}>
                  <div className="login-compliance-logos">
                    <img src="/logos/NPC.png" alt="National Privacy Commission" className="login-compliance-logo" />
                    <img src="/logos/ICT.png" alt="Department of Information and Communications Technology" className="login-compliance-logo logo-circle" />
                  </div>
                  <p className="login-powered-by">
                    Powered by <strong>Palayan City ICT Division</strong>
                  </p>
                  <p className="login-copyright">
                    Tricycle Driver Rating System &copy; {new Date().getFullYear()}
                  </p>
                  <p className="login-compliance-text">
                    This system complies with the Data Privacy Act of 2012 (RA 10173)
                  </p>
                </div>

                <div className="login-split-dots login-anim-item" style={{animationDelay: '0.7s'}}>
                   <span className="dot active"></span>
                   <span className="dot"></span>
                   <span className="dot"></span>
                </div>
             </div>
          </div>
          
          {/* Right Side Container */}
          <div className="login-split-right">
            <div className="login-card-header login-anim-item" style={{animationDelay: '0.4s'}}>
              <h2 className="login-card-title">Welcome Back</h2>
              <p className="login-card-desc">Sign in to access the admin dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {error && (
                <div className="login-error fade-in">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  {error}
                </div>
              )}

              <div className="login-field login-anim-item" style={{animationDelay: '0.55s'}}>
                <Label htmlFor="email" className="login-label">
                  <Mail className="login-label-icon" />
                  Email Address
                </Label>
                <div className="login-input-wrap">
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="login-input"
                  />
                </div>
              </div>

              <div className="login-field login-anim-item" style={{animationDelay: '0.7s'}}>
                <Label htmlFor="password" className="login-label">
                  <Lock className="login-label-icon" />
                  Password
                </Label>
                <div className="login-input-wrap">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="login-input login-input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="login-eye-btn"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="login-anim-item" style={{animationDelay: '0.85s'}}>
              <Button
                type="submit"
                disabled={loading}
                className="login-submit-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 spinner" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  )
}
