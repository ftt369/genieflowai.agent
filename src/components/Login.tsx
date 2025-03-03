import { useState } from 'react';
import { useAuthStore } from '../store/authStore';

export function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const { signIn, signUp, error, setError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isSignUp) {
      const { error } = await signUp(email, password, fullName);
      if (!error) {
        // Redirect or show success message
      }
    } else {
      const { error } = await signIn(email, password);
      if (!error) {
        // Redirect or show success message
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-card-foreground">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {isSignUp && (
              <div>
                <label htmlFor="full-name" className="block text-sm font-medium text-card-foreground mb-1">
                  Full Name
                </label>
                <input
                  id="full-name"
                  name="fullName"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-input 
                           placeholder-muted-foreground text-card-foreground rounded-md focus:outline-none 
                           focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm 
                           bg-background/50 backdrop-blur-sm transition-colors"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-card-foreground mb-1">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-input 
                         placeholder-muted-foreground text-card-foreground rounded-md focus:outline-none 
                         focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm 
                         bg-background/50 backdrop-blur-sm transition-colors"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-card-foreground mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-input 
                         placeholder-muted-foreground text-card-foreground rounded-md focus:outline-none 
                         focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm 
                         bg-background/50 backdrop-blur-sm transition-colors"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-destructive text-sm text-center font-medium">{error}</div>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium 
                       rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none 
                       focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-primary hover:text-primary/90 transition-colors font-medium"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 