import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Mail } from 'lucide-react';
import { sendPasswordResetEmail } from '../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await sendPasswordResetEmail(email);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Reset your password</h2>
          <p className="mt-2 text-gray-600">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <div className="card">
          {success ? (
            <div className="text-center">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
                <p>Check your email for password reset instructions.</p>
              </div>
              <Link to="/login" className="btn btn-primary inline-flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-10"
                    placeholder="Enter your email"
                  />
                  <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full py-2.5"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>

              <div className="text-center">
                <Link to="/login" className="text-sm text-blue-800 hover:text-blue-700">
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;