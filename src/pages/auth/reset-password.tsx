import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resetPassword } from '../../services/auth';
import { MailCheck, AlertCircle } from 'lucide-react';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        setError(error.message);
      } else {
        setIsSubmitted(true);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while sending reset instructions');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-md">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 rounded-full bg-blue-100 p-3">
            <MailCheck className="h-8 w-8 text-blue-600" />
          </div>
          
          <h2 className="mt-4 text-2xl font-extrabold text-gray-900">
            {isSubmitted ? 'Check Your Email' : 'Reset Password'}
          </h2>
          
          {isSubmitted ? (
            <p className="mt-2 text-center text-sm text-gray-600">
              We've sent a password reset link to <span className="font-medium text-blue-600">{email}</span>. 
              Please check your email inbox and follow the instructions.
            </p>
          ) : (
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
          )}

          {error && (
            <div className="mt-4 flex items-center justify-center rounded-md bg-red-50 p-4 text-red-700">
              <AlertCircle className="mr-2 h-5 w-5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {!isSubmitted ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Instructions'}
              </button>
            </div>

            <div className="text-sm text-center">
              <button
                type="button"
                onClick={() => navigate('/auth/login')}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Back to login
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <div>
              <button
                onClick={() => navigate('/auth/login')}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Back to Login
              </button>
            </div>
            
            <div className="text-sm text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setError(null);
                }}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Didn't receive the email? Try again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword; 