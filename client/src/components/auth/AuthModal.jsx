import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Input } from "@heroui/input"
import { GoArrowUpRight } from "react-icons/go"
import { AiOutlineClose } from "react-icons/ai"
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { GoogleLogin } from '@react-oauth/google'
import { LoginUser, RegisterUser, GoogleAuth } from '../../store/slices/authSlice'
import LoadingScreen from '../LoadingScreen'

// Only defined once a real Google Cloud OAuth Client ID is added to the
// client .env (VITE_GOOGLE_CLIENT_ID). Until then this is undefined and the
// Google button below simply doesn't render - everything else in this modal
// (and the rest of the app) behaves exactly as it did before this existed.
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

/**
 * Reusable login/signup modal.
 *
 * Two usage modes:
 *  - allowClose=true  (default): dismissable "log in if you want" trigger,
 *    e.g. from the navbar.
 *  - allowClose=false: a hard gate - no close button, used on Assign Project
 *    where login is required to proceed. The modal disappears on its own
 *    once isLoggedIn flips true in Redux (the parent stops rendering it).
 */
const AuthModal = ({ isOpen, onClose, onSuccess, allowClose = true, title, subtitle }) => {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [loginValue, setLoginValue] = useState({ email: '', password: '' })
  const [signupValue, setSignupValue] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()

  // GoogleLogin's width prop is pixels, not a percentage, so it has to be
  // measured from the actual rendered container to stay responsive across
  // phone-width screens instead of overflowing or looking tiny.
  const googleBtnWrapRef = useRef(null)
  const panelRef = useRef(null)
  const [googleBtnWidth, setGoogleBtnWidth] = useState(320)

  useEffect(() => {
    if (isOpen && googleBtnWrapRef.current) {
      setGoogleBtnWidth(googleBtnWrapRef.current.offsetWidth)
    }
  }, [isOpen, mode])

  // Focus management: moves focus into the modal on open (or when switching
  // between login/signup), traps Tab/Shift+Tab within it while open, wires
  // Escape to the same close path as the X button and backdrop click, and
  // restores focus to whatever triggered the modal once it closes. Keyed on
  // [isOpen, mode] only (matching the effect above) so it reacts to the
  // modal opening or switching forms, not to every keystroke in the fields
  // below - depending on handleClose/resetFields directly would re-run this
  // (and re-steal focus to the first field) on every render, including ones
  // triggered by typing.
  useEffect(() => {
    if (!isOpen) return

    const previouslyFocused = document.activeElement

    const getFocusable = () =>
      Array.from(
        panelRef.current?.querySelectorAll(
          'input, button, [href], select, textarea, [tabindex]:not([tabindex="-1"])'
        ) ?? []
      )

    getFocusable()[0]?.focus()

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (allowClose) {
          resetFields()
          onClose?.()
        }
        return
      }

      if (e.key !== 'Tab') return
      const nodes = getFocusable()
      if (nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [isOpen, mode])

  if (!isOpen) return null

  const isLoginValid = loginValue.email.includes('@') && loginValue.password.trim().length > 0
  const isSignupValid =
    signupValue.firstName.trim().length >= 3 &&
    signupValue.email.includes('@') &&
    signupValue.password.trim().length >= 6

  const resetFields = () => {
    setLoginValue({ email: '', password: '' })
    setSignupValue({ firstName: '', lastName: '', email: '', password: '' })
    setMode('login')
  }

  const handleClose = () => {
    if (!allowClose) return
    resetFields()
    onClose?.()
  }

  const handleLogin = async () => {
    if (!isLoginValid || loading) return
    setLoading(true)
    const result = await dispatch(LoginUser(loginValue))
    setLoading(false)
    if (result?.success) {
      resetFields()
      onSuccess?.(result.role)
    }
  }

  const handleSignup = async () => {
    if (!isSignupValid || loading) return
    setLoading(true)
    const result = await dispatch(RegisterUser(signupValue))
    setLoading(false)
    if (result?.success) {
      resetFields()
      onSuccess?.(result.role)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential || loading) return
    setLoading(true)
    const result = await dispatch(GoogleAuth(credentialResponse.credential))
    setLoading(false)
    if (result?.success) {
      resetFields()
      onSuccess?.(result.role)
    }
  }

  const handleGoogleError = () => {
    toast.error('Google sign-in was cancelled or failed.')
  }

  const primaryBtnClasses = (disabled) =>
    `w-full ${disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-300'} inline-flex items-center justify-center relative leading-tight shadow-none overflow-hidden rounded-full border-default text-black py-2.5 px-5`
  const iconBtnClasses = (disabled) =>
    `${disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-300'} flex-shrink-0 overflow-hidden flex items-center justify-center -ml-1 rounded-full transform transition-transform | w-9 h-9 | group-hover:translate-x-1 group-hover:rotate-45`

  return (
    <AnimatePresence>
      <motion.div
        key="auth-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md px-4 py-8 overflow-y-auto"
      >
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-[26rem] bg-white dark:bg-black border border-black/[0.08] dark:border-white/[0.15] rounded-3xl shadow-2xl p-6 sm:p-8 my-auto"
        >
          {allowClose && (
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full text-black/60 hover:text-black hover:bg-black/5 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
            >
              <AiOutlineClose className="h-4 w-4" />
            </button>
          )}

          <h3 id="auth-modal-title" className="text-2xl sm:text-3xl font-semibold text-black dark:text-white mb-1 pr-8">
            {title || (mode === 'login' ? 'Welcome back' : 'Create an account')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {subtitle || (mode === 'login' ? 'Log in to continue.' : 'Sign up to get started.')}
          </p>

          {googleClientId && (
            <div className="mb-5">
              <div ref={googleBtnWrapRef} className="w-full flex justify-center [&>div]:!w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"
                  shape="pill"
                  size="large"
                  width={googleBtnWidth}
                  text={mode === 'login' ? 'signin_with' : 'signup_with'}
                />
              </div>
              <div className="flex items-center gap-3 mt-5">
                <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
                <span className="text-xs text-gray-400 dark:text-gray-500">or continue with email</span>
                <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
              </div>
            </div>
          )}

          {mode === 'login' ? (
            <div className="flex flex-col gap-4">
              <Input
                label="Email" size="md" variant="faded" type="email"
                value={loginValue.email}
                onChange={(e) => setLoginValue((v) => ({ ...v, email: e.target.value }))}
                isRequired
              />
              <Input
                label="Password" size="md" variant="faded" type="password"
                value={loginValue.password}
                onChange={(e) => setLoginValue((v) => ({ ...v, password: e.target.value }))}
                isRequired
              />

              <button
                type="submit"
                disabled={!isLoginValid || loading}
                onClick={handleLogin}
                className="mt-1 inline-flex relative group outline-none | focus:outline-none w-full"
              >
                <div className={primaryBtnClasses(!isLoginValid || loading)}>
                  <div className="relative inline-flex items-center justify-center top-px flex-shrink-0">
                    {loading ? <LoadingScreen /> : 'Login'}
                  </div>
                </div>
                <div className={iconBtnClasses(!isLoginValid || loading)}>
                  <GoArrowUpRight />
                </div>
              </button>

              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                Don&apos;t have an account?{' '}
                <button type="button" onClick={() => setMode('signup')} className="text-emerald-500 font-medium hover:underline">
                  Sign up
                </button>
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <Input
                  label="First name" size="md" variant="faded" type="text"
                  value={signupValue.firstName}
                  onChange={(e) => setSignupValue((v) => ({ ...v, firstName: e.target.value }))}
                  isRequired
                />
                <Input
                  label="Last name" size="md" variant="faded" type="text"
                  value={signupValue.lastName}
                  onChange={(e) => setSignupValue((v) => ({ ...v, lastName: e.target.value }))}
                />
              </div>
              <Input
                label="Email" size="md" variant="faded" type="email"
                value={signupValue.email}
                onChange={(e) => setSignupValue((v) => ({ ...v, email: e.target.value }))}
                isRequired
              />
              <Input
                label="Password" size="md" variant="faded" type="password"
                value={signupValue.password}
                onChange={(e) => setSignupValue((v) => ({ ...v, password: e.target.value }))}
                isRequired
                errorMessage="Password must be at least 6 characters"
              />

              <button
                type="submit"
                disabled={!isSignupValid || loading}
                onClick={handleSignup}
                className="mt-1 inline-flex relative group outline-none | focus:outline-none w-full"
              >
                <div className={primaryBtnClasses(!isSignupValid || loading)}>
                  <div className="relative inline-flex items-center justify-center top-px flex-shrink-0">
                    {loading ? <LoadingScreen /> : 'Sign up'}
                  </div>
                </div>
                <div className={iconBtnClasses(!isSignupValid || loading)}>
                  <GoArrowUpRight />
                </div>
              </button>

              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                Already have an account?{' '}
                <button type="button" onClick={() => setMode('login')} className="text-emerald-500 font-medium hover:underline">
                  Login
                </button>
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AuthModal
