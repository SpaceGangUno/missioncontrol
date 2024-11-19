import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Rocket, Mail, Lock, Loader2, Star, ArrowRight, ArrowLeft } from 'lucide-react';
import WelcomeBack from './WelcomeBack';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [userName, setUserName] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const name = userCredential.user.email?.split('@')[0] || 'Commander';
        setUserName(name);
        setIsAuthenticated(true);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const handleShowWelcome = () => {
    setShowWelcome(true);
  };

  if (showWelcome) {
    return <WelcomeBack name={userName} onComplete={() => setShowWelcome(false)} />;
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4">
      <div className="w-full max-w-md relative">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 -left-20 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -right-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        {/* Logo and Title */}
        <div className="text-center mb-8 relative">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Rocket className="w-12 h-12 text-sky-400" />
              <Star className="absolute -right-1 -bottom-1 w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
            Mission Control
          </h1>
          <p className="text-base text-sky-400/60 mt-2">Transform your goals into reality</p>
        </div>

        {isAuthenticated ? (
          <div className="glass-card p-6 text-center">
            <button
              onClick={handleShowWelcome}
              className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.02] backdrop-blur-sm active:scale-95 touch-manipulation text-base h-14"
            >
              <Rocket className="w-6 h-6" />
              Show Welcome Message
            </button>
          </div>
        ) : (
          <>
            {/* Mode Switch */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-4 px-4 rounded-lg transition-all touch-manipulation ${
                  isLogin 
                    ? 'glass-card bg-indigo-500/20 text-white' 
                    : 'text-sky-400/60 hover:text-sky-400'
                }`}
                type="button"
              >
                <div className="flex items-center justify-center gap-2">
                  <ArrowLeft className={`w-5 h-5 ${isLogin ? 'text-sky-400' : 'text-sky-400/60'}`} />
                  <span className="text-base">Sign In</span>
                </div>
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-4 px-4 rounded-lg transition-all touch-manipulation ${
                  !isLogin 
                    ? 'glass-card bg-indigo-500/20 text-white' 
                    : 'text-sky-400/60 hover:text-sky-400'
                }`}
                type="button"
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-base">Sign Up</span>
                  <ArrowRight className={`w-5 h-5 ${!isLogin ? 'text-sky-400' : 'text-sky-400/60'}`} />
                </div>
              </button>
            </div>

            {/* Login Form */}
            <div className="glass-card p-6 relative">
              {!isLogin && (
                <div className="mb-6 p-4 rounded-lg bg-sky-500/10 border border-sky-500/20">
                  <h3 className="text-sky-400 font-semibold mb-2 text-base">New Mission Commander</h3>
                  <p className="text-sm text-sky-400/60">
                    Create your account to start tracking your goals and transforming them into achievements.
                  </p>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 rounded-lg bg-rose-500/20 text-rose-300 text-sm break-words">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">
                <div>
                  <label htmlFor="email" className="block text-base font-medium text-sky-100 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-sky-400/40" />
                    <input
                      id="email"
                      type="email"
                      inputMode="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="glass-input pl-12 h-14 text-base w-full"
                      placeholder="Enter your email"
                      required
                      name="username"
                      autoComplete="email"
                      autoCapitalize="none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-base font-medium text-sky-100 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-sky-400/40" />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="glass-input pl-12 h-14 text-base w-full"
                      placeholder="Enter your password"
                      required
                      name="current-password"
                      autoComplete={isLogin ? "current-password" : "new-password"}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.02] backdrop-blur-sm active:scale-95 touch-manipulation text-base h-14"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Rocket className="w-6 h-6" />
                  )}
                  {isLogin ? 'Launch Mission' : 'Begin Journey'}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
