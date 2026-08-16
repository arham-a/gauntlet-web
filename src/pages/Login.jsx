import { useState } from "react";
import { toast, Toaster } from "sonner";
import axios from "axios"; 
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/bg.jpeg";
import { useUser } from "../context/UserContext";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const isValid = validateForm();
    if (!isValid) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        username: formData.username,
        password: formData.password,
      });

      const data = response.data;

      if (response.status === 200) {
        // Save token to cookies
        document.cookie = `token=${data.token}; path=/`;
        document.cookie = `userID=${data.data._id}; path=/;`;
        
        // Trigger context login to refresh user data
        await login();
        
        toast.success('Login successful!');
        navigate('/');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Display specific error message from server if available
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('An error occurred during login');
      }
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.username || !formData.password) {
      toast.error("Please fill in both username and password.");
      return false;
    }
    return true;
  };

  return (
    <div className="min-h-screen flex font-['Poppins',sans-serif] bg-black">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid #dc2626',
          },
        }}
      />
      
      {/* Left side - Enhanced Branding */}
      <div className="w-full lg:w-1/2 hidden lg:flex relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-red-800/30 to-black/80 z-10"></div>
        <img src={bgImage} alt="" className="w-full h-full object-cover"/>
        {/* <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-white p-12">
          <div className="text-center space-y-6">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              Gauntlet
            </h1>
            <p className="text-xl text-gray-300 max-w-md leading-relaxed">
              Welcome back! Ready to compete and showcase your talents?
            </p>
            <div className="flex space-x-4 justify-center">
              <div className="w-12 h-1 bg-red-500 rounded-full"></div>
              <div className="w-8 h-1 bg-red-400 rounded-full"></div>
              <div className="w-4 h-1 bg-red-300 rounded-full"></div>
            </div>
          </div>
        </div> */}
      </div>

      {/* Right side - Enhanced Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-red-950 p-4 relative">
        {/* Animated background elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-red-600/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-red-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        
        <div className="w-full max-w-[420px] p-10 bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm rounded-lg shadow-2xl border border-red-900/30 relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-400">Sign in to your account</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 block">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white 
                           focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 
                           transition-all duration-300 placeholder-gray-500"
                  placeholder="Enter your username"
                  required
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-600/0 via-red-600/0 to-red-600/0 
                              hover:from-red-600/5 hover:via-red-600/5 hover:to-red-600/5 transition-all duration-300 pointer-events-none"></div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 block">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white 
                           focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 
                           transition-all duration-300 placeholder-gray-500"
                  placeholder="Enter your password"
                  required
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-600/0 via-red-600/0 to-red-600/0 
                              hover:from-red-600/5 hover:via-red-600/5 hover:to-red-600/5 transition-all duration-300 pointer-events-none"></div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-400">
                <input type="checkbox" className="mr-2 rounded border-gray-600 bg-black/50 text-red-500 focus:ring-red-500/20" />
                Remember me
              </label>
              <a href="#" className="text-red-400 hover:text-red-300 transition-colors font-medium hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 
                       text-white rounded-lg transition-all duration-300 font-semibold text-lg
                       transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                       shadow-lg hover:shadow-red-500/25"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>

            <div className="text-center pt-4">
              <p className="text-gray-400 text-sm">
                Don't have an account?{" "}
                <a 
                  href="/signup" 
                  className="text-red-400 hover:text-red-300 transition-colors font-medium hover:underline"
                >
                  Create Account
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
