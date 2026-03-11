import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, User, Lock, AlertCircle, ArrowLeft, HeartPulse, Activity, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { authService } from '../api/service';

const Login = () => {
  const [schoolId, setSchoolId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const data = await authService.login(schoolId, password);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Role-based redirection
      if (data.role === 'admin') {
        navigate('/admin');
      } else if (data.role === 'staff') {
        navigate('/staff');
      } else {
        navigate('/student');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex relative overflow-hidden">
      {/* Left Column - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-cpsu-green mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
          
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-cpsu-green flex items-center justify-center text-white font-bold text-sm">
                C
              </div>
              <span className="text-xl font-bold font-outfit text-gray-900">
                Health<span className="text-cpsu-green">AI</span>
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 font-outfit tracking-tight">
              Welcome back
            </h2>
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <span className="text-sm text-gray-600 font-medium">New here? Let's get you set up.</span>
              <Link 
                to="/register" 
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-cpsu-green bg-cpsu-green/10 hover:bg-cpsu-green/20 rounded-lg transition-colors border border-cpsu-green/20"
              >
                Create an account
              </Link>
            </div>
          </div>

          <div className="mt-8">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="school-id" className="block text-sm font-semibold text-gray-700">
                  School ID
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="school-id"
                    name="school-id"
                    type="text"
                    required
                    value={schoolId}
                    onChange={(e) => setSchoolId(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-cpsu-green focus:border-transparent focus:bg-white transition-all text-sm outline-none"
                    placeholder="e.g. 2021-123-456"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-12 py-3 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-cpsu-green focus:border-transparent focus:bg-white transition-all text-sm outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-cpsu-green transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-end">
                  <Link 
                    to="/forgot-password" 
                    className="text-sm font-semibold text-cpsu-green hover:text-cpsu-green-dark transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-xl bg-red-50 p-4 border border-red-100"
                >
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </motion.div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-3.5 px-6 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-cpsu-green hover:bg-cpsu-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cpsu-green transition-all shadow-cpsu-green/20 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 active:scale-95'}`}
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <>
                      Sign In
                      <LogIn className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right Column - Animated Visual (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-[#0a192f] flex-col items-center justify-center p-12 overflow-hidden text-white">
        {/* Dynamic Abstract Background Animation */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3]
          }} 
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-cpsu-green/40 to-teal-500/20 blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            rotate: [0, -90, 0],
            opacity: [0.2, 0.4, 0.2]
          }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-cpsu-gold/30 to-yellow-500/10 blur-3xl"
        />

        <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
          
          <div className="relative w-72 h-72 mb-12 flex items-center justify-center">
            {/* Center animated orb */}
            <motion.div 
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.5, 0.8, 0.5]
              }} 
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-tr from-cpsu-green to-teal-400 rounded-full blur-2xl"
            />
            <motion.div 
              animate={{ 
                y: [0, -10, 0] 
              }} 
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-36 h-36 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 flex items-center justify-center shadow-2xl"
            >
              <HeartPulse className="w-16 h-16 text-white" />
            </motion.div>

            {/* Orbiting elements */}
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute w-full h-full rounded-full border border-white/10"
            >
              <div className="absolute top-4 left-4 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-cpsu-gold" />
              </div>
            </motion.div>
            
            <motion.div 
              animate={{ rotate: -360 }} 
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute w-[130%] h-[130%] rounded-full border border-white/5"
            >
              <div className="absolute bottom-10 right-0 w-14 h-14 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center">
                <Activity className="w-7 h-7 text-cpsu-green" />
              </div>
            </motion.div>
          </div>

          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-extrabold font-outfit mb-4 tracking-tight"
          >
            Welcome to <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cpsu-green to-teal-400">
              Future of Wellness
            </span>
          </motion.h3>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 leading-relaxed text-lg"
          >
            Access personalized care, manage medical records, and connect with campus clinic staff seamlessly.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 text-center"
          >
             <p className="text-sm text-gray-500 font-medium">
               Secured by Central Philippines State University
             </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
