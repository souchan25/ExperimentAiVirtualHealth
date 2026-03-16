import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, User, Mail, Lock, Building, GraduationCap, AlertCircle, ArrowLeft, CheckCircle2, Bot, FileText, Clock, Eye, EyeOff } from 'lucide-react';
import { authService } from '../api/service';

const featuresList = [
  {
    icon: Bot,
    title: 'Intelligent Symptom Checker',
    desc: 'Describe how you feel, and our AI will provide an immediate initial assessment.'
  },
  {
    icon: FileText,
    title: 'Medical Document AI',
    desc: 'Upload certificates and lab results. We automatically extract and store the clinical data.'
  },
  {
    icon: Clock,
    title: '24/7 Availability',
    desc: 'Get initial guidance outside of regular campus clinic hours, anywhere you are.'
  }
];

const Register = () => {
  const [formData, setFormData] = useState({
    school_id: '',
    name: '',
    department: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const getPasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return score;
    if (pass.length > 7) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (getPasswordStrength(formData.password) < 3) {
      setError('Please choose a stronger password (must contain at least 8 characters, uppercase, and numbers/symbols)');
      setIsLoading(false);
      return;
    }
    
    try {
      const dataToSubmit = { ...formData };
      delete dataToSubmit.confirmPassword;
      await authService.register(dataToSubmit);
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please check the information provided.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-cpsu-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-12 w-12 text-cpsu-green" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 font-outfit">Account Created!</h2>
          <p className="text-gray-500 mb-6">Your student health account has been successfully registered. You're being redirected to login...</p>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2 }}
              className="bg-cpsu-green h-full"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex relative overflow-hidden">
      
      {/* Left Column - Registration Form */}
      <div className="w-full lg:w-3/5 flex flex-col justify-center px-4 sm:px-6 lg:px-16 xl:px-24 py-12 lg:py-0 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl">
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
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-cpsu-green hover:text-cpsu-green-dark transition-colors">
                Sign in here
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <form className="space-y-6" onSubmit={handleRegister}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700">Full Name</label>
                  <div className="mt-1 relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="block w-full pl-11 pr-4 py-3 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-cpsu-green focus:border-transparent focus:bg-white transition-all text-sm outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="school_id" className="block text-sm font-semibold text-gray-700">School ID</label>
                  <div className="mt-1 relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <GraduationCap className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="school_id"
                      name="school_id"
                      type="text"
                      required
                      value={formData.school_id}
                      onChange={handleChange}
                      className="block w-full pl-11 pr-4 py-3 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-cpsu-green focus:border-transparent focus:bg-white transition-all text-sm outline-none"
                      placeholder="2021-123-456"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-semibold text-gray-700">Department</label>
                  <div className="mt-1 relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400 z-10" />
                    </div>
                    <select
                      id="department"
                      name="department"
                      required
                      value={formData.department}
                      onChange={handleChange}
                      className="block w-full pl-11 pr-10 py-3 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-cpsu-green focus:border-transparent focus:bg-white transition-all text-sm outline-none appearance-none"
                    >
                      <option value="" disabled>Select Department</option>
                      <option value="College of Computer Studies">College of Computer Studies</option>
                      <option value="College of Criminal Justice Education">College of Criminal Justice Education</option>
                      <option value="College of Engineering">College of Engineering</option>
                      <option value="College of Teacher Education">College of Teacher Education</option>
                      <option value="College of Agriculture and Forestry">College of Agriculture and Forestry</option>
                      <option value="College of Hospitality Management">College of Hospitality Management</option>
                      <option value="College of Arts and Sciences">College of Arts and Sciences</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email Address (Optional)</label>
                  <div className="mt-1 relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-11 pr-4 py-3 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-cpsu-green focus:border-transparent focus:bg-white transition-all text-sm outline-none"
                      placeholder="john@cpsu.edu.ph"
                    />
                  </div>
                </div>



                <div className="md:col-span-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Password</label>
                  <div className="mt-1 relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-11 pr-12 py-3 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-cpsu-green focus:border-transparent focus:bg-white transition-all text-sm outline-none"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center focus:outline-none"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" /> : <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500 font-medium tracking-wide uppercase">Password Strength</span>
                        <span className={`text-xs font-bold ${
                          getPasswordStrength(formData.password) === 0 ? 'text-gray-400' :
                          getPasswordStrength(formData.password) === 1 ? 'text-red-500' :
                          getPasswordStrength(formData.password) === 2 ? 'text-yellow-500' :
                          getPasswordStrength(formData.password) === 3 ? 'text-blue-500' :
                          'text-cpsu-green'
                        }`}>
                          {getPasswordStrength(formData.password) === 0 ? 'Too Weak' :
                           getPasswordStrength(formData.password) === 1 ? 'Weak' :
                           getPasswordStrength(formData.password) === 2 ? 'Fair' :
                           getPasswordStrength(formData.password) === 3 ? 'Good' :
                           'Strong'}
                        </span>
                      </div>
                      <div className="flex gap-1 h-1.5 w-full">
                        {[...Array(4)].map((_, index) => (
                          <div
                            key={index}
                            className={`h-full w-full rounded-full transition-colors duration-300 ${
                              index < getPasswordStrength(formData.password) 
                                ? (getPasswordStrength(formData.password) < 2 ? 'bg-red-500' : getPasswordStrength(formData.password) < 3 ? 'bg-yellow-500' : getPasswordStrength(formData.password) < 4 ? 'bg-blue-500' : 'bg-cpsu-green')
                                : 'bg-gray-200'
                            }`}
                          ></div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">Confirm Password</label>
                  <div className="mt-1 relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block w-full pl-11 pr-12 py-3 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-cpsu-green focus:border-transparent focus:bg-white transition-all text-sm outline-none"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center focus:outline-none"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" /> : <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-xl bg-red-50 p-4 border border-red-100 mt-6"
                >
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </motion.div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center py-3.5 px-6 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-cpsu-green hover:bg-cpsu-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cpsu-green transition-all shadow-cpsu-green/20 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 active:scale-95'}`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <UserPlus className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right Column - Animated Visual (Hidden on Mobile) */}
      <div className="hidden lg:flex w-2/5 bg-[#0a192f] flex-col items-center justify-center p-12 text-white relative overflow-hidden">
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
          
          <div className="relative w-64 h-64 mb-12 flex items-center justify-center">
            {/* Center animated orb */}
            <motion.div 
              animate={{ 
                y: [0, -20, 0] 
              }} 
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-tr from-cpsu-green to-teal-400 rounded-full blur-xl opacity-50"
            />
            <motion.div 
              animate={{ 
                y: [0, -20, 0] 
              }} 
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-32 h-32 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center shadow-2xl"
            >
              <Bot className="w-16 h-16 text-white" />
            </motion.div>

            {/* Orbiting elements */}
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute w-full h-full rounded-full border border-white/10"
            >
              <div className="absolute top-0 left-1/2 -ml-4 -mt-4 w-8 h-8 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center">
                <FileText className="w-4 h-4 text-cpsu-gold" />
              </div>
            </motion.div>
            
            <motion.div 
              animate={{ rotate: -360 }} 
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute w-[140%] h-[140%] rounded-full border border-white/5"
            >
              <div className="absolute bottom-0 right-1/4 -mb-4 -mr-4 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-cpsu-green" />
              </div>
            </motion.div>
          </div>

          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-extrabold font-outfit mb-4 tracking-tight"
          >
            Intelligent <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cpsu-green to-teal-400">
              Campus Healthcare
            </span>
          </motion.h3>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 leading-relaxed text-lg"
          >
            Your AI-powered medical assistant, ready 24/7 to provide intelligent symptom assessments and secure record management.
          </motion.p>
        </div>
      </div>
      
    </div>
  );
};

export default Register;
