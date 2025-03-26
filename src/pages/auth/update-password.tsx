import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { updatePassword } from '../../services/auth';
import { LockKeyhole, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

const UpdatePassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if there's a valid token in the URL
    const queryParams = new URLSearchParams(location.search);
    const hasToken = queryParams.has('token');
    
    if (!hasToken) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [location]);

  const validatePassword = (password: string): boolean => {
    // Require at least 8 characters, one uppercase, one lowercase, one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters and include uppercase, lowercase, and numbers');
      return;
    }
    
    setIsUpdating(true);
    setError(null);
    
    try {
      const { error } = await updatePassword(password);
      
      if (error) {
        setError(error.message);
      } else {
        setIsUpdated(true);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating your password');
    } finally {
      setIsUpdating(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-md">
        <div className="flex flex-col items-center justify-center text-center">
          {isUpdated ? (
            <div className="mb-4 rounded-full bg-green-100 p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          ) : (
            <div className="mb-4 rounded-full bg-blue-100 p-3">
              <LockKeyhole className="h-8 w-8 text-blue-600" />
            </div>
          )}
          
          <h2 className="mt-4 text-2xl font-extrabold text-gray-900">
            {isUpdated ? 'Password Updated!' : 'Set New Password'}
          </h2>
          
          {isUpdated ? (
            <p className="mt-2 text-center text-sm text-gray-600">
              Your password has been successfully updated. You can now log in with your new password.
            </p>
          ) : (
            <p className="mt-2 text-center text-sm text-gray-600">
              Create a new password for your account. Make sure it's secure and you'll remember it.
            </p>
          )}

          {error && (
            <div className="mt-4 flex items-center justify-center rounded-md bg-red-50 p-4 text-red-700">
              <AlertCircle className="mr-2 h-5 w-5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {!isUpdated ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 8 characters and include uppercase, lowercase, and numbers.
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isUpdating}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
              >
                {isUpdating ? 'Updating...' : 'Update Password'}
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
          <div className="mt-8">
            <button
              onClick={() => navigate('/auth/login')}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdatePassword; 