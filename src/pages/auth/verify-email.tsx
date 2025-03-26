import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyEmail, resendVerificationEmail } from '../../services/auth';
import { MailCheck, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

const VerifyEmail = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    const email = queryParams.get('email');
    
    if (email) {
      setEmail(email);
    }

    if (token) {
      verifyToken(token);
    }
  }, [location]);

  const verifyToken = async (token: string) => {
    setIsVerifying(true);
    setError(null);
    
    try {
      const { error } = await verifyEmail(token);
      
      if (error) {
        setError(error.message);
        setIsVerified(false);
      } else {
        setIsVerified(true);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during verification');
      setIsVerified(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setIsVerifying(true);
    setError(null);
    
    try {
      const { error } = await resendVerificationEmail(email);
      
      if (error) {
        setError(error.message);
      } else {
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while sending verification email');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-md">
        <div className="flex flex-col items-center justify-center text-center">
          {isVerified ? (
            <div className="mb-4 rounded-full bg-green-100 p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          ) : (
            <div className="mb-4 rounded-full bg-blue-100 p-3">
              <MailCheck className="h-8 w-8 text-blue-600" />
            </div>
          )}
          
          <h2 className="mt-4 text-2xl font-extrabold text-gray-900">
            {isVerified ? 'Email Verified!' : 'Verify Your Email'}
          </h2>
          
          {isVerified ? (
            <p className="mt-2 text-center text-sm text-gray-600">
              Your email has been successfully verified. You can now access all features.
            </p>
          ) : (
            <p className="mt-2 text-center text-sm text-gray-600">
              Please check your email and click the verification link or enter the verification code below.
            </p>
          )}

          {error && (
            <div className="mt-4 flex items-center justify-center rounded-md bg-red-50 p-4 text-red-700">
              <AlertCircle className="mr-2 h-5 w-5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {isVerified ? (
          <div className="mt-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Continue to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
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
            
            <button
              onClick={handleResendVerification}
              disabled={isVerifying}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
            >
              {isVerifying ? 'Processing...' : 'Resend Verification Email'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail; 