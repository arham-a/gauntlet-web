import { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  PlusCircleIcon,
  DocumentTextIcon,
  BookOpenIcon,
  CogIcon,
  LockClosedIcon,
  TrophyIcon,
  CloudArrowUpIcon
} from "@heroicons/react/24/outline";
import { useUser } from "../context/UserContext";
import { useGlobalStats } from "../context/GlobalStatsContext";

const AddComp = () => {
  const [compData, setCompData] = useState({
    compName: "",
    compDescription: "",
    compType: "",
    isPrivate: false,
    passCode: "",
    problemStatement: "",
    compRuleBook: "",
    submissionRules: "",
  });
  const [competitionTypes, setCompetitionTypes] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshUserData, createCompetition } = useUser();
  const { refreshGlobalStats } = useGlobalStats();

  const getUserId = () => {
    const uidCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('userID='));
    return uidCookie ? uidCookie.split('=')[1] : null;
  };

  useEffect(() => {
    const fetchCompetitionTypes = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/comp/type`);
        if (!response.ok) {
          throw new Error('Failed to fetch competition types');
        }
        const data = await response.json();
        setCompetitionTypes(data);
      } catch (err) {
        toast.error(err.message);
      }
    };

    fetchCompetitionTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCompData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleAddCompetition = async () => {
    const userId = getUserId();
    if (!userId) {
      toast.error("Please login to add competitions");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = {
        compOwnerUserId: userId,
        compName: compData.compName,
        compDescription: compData.compDescription,
        compType: compData.compType,
        isPrivate: compData.isPrivate,
        passCode: compData.isPrivate ? compData.passCode : "",
        problemStatement: compData.problemStatement,
        compRuleBook: compData.compRuleBook,
        submissionRules: compData.submissionRules,
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/comp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to add competition');
      }

      const result = await response.json();
      
      // Note: Backend already adds the competition to user's myCreatedComp
      // in the createCompetition controller, so we don't need to call it again

      // Refresh user data and global stats
      await refreshUserData();
      await refreshGlobalStats();

      toast.success('Successfully added competition!');
      navigate('/');
    } catch (err) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-['Poppins',sans-serif]">
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
      
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-red-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-red-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 pt-20 pb-12 px-4 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <TrophyIcon className="w-12 h-12 text-red-400" />
            <h1 className="text-5xl font-bold text-white">
              Create <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">Competition</span>
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Design and launch your own competition to challenge talented individuals worldwide
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="relative z-10 px-4 lg:px-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm rounded-lg border border-red-900/30 shadow-2xl overflow-hidden">
            
            {/* Form Header */}
            <div className="p-8 border-b border-red-900/20">
              <div className="flex items-center space-x-3">
                <PlusCircleIcon className="w-8 h-8 text-red-400" />
                <h2 className="text-3xl font-bold text-white">Competition Details</h2>
              </div>
              <p className="text-gray-400 mt-2">Fill in the information below to create your competition</p>
            </div>

            {/* Form Body */}
            <div className="p-8 space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <CogIcon className="w-6 h-6 text-red-400" />
                  <h3 className="text-xl font-semibold text-white">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 block">
                      Competition Name *
                    </label>
                    <input
                      type="text"
                      name="compName"
                      value={compData.compName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white 
                               focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 
                               transition-all duration-300 placeholder-gray-500"
                      placeholder="Enter competition name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 block">
                      Competition Type *
                    </label>
                    <select
                      name="compType"
                      value={compData.compType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white 
                               focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 
                               transition-all duration-300"
                      required
                    >
                      <option value="">Select Competition Type</option>
                      {competitionTypes.map((type) => (
                        <option key={type._id} value={type.compTypeName}>
                          {type.compTypeName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 block">
                    Description *
                  </label>
                  <textarea
                    name="compDescription"
                    value={compData.compDescription}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white 
                             focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 
                             transition-all duration-300 placeholder-gray-500 resize-none"
                    placeholder="Describe your competition..."
                    required
                  />
                </div>

                {/* Privacy Settings */}
                <div className="p-6 bg-black/30 rounded-lg border border-gray-700">
                  <div className="flex items-center space-x-3 mb-4">
                    <LockClosedIcon className="w-5 h-5 text-red-400" />
                    <h4 className="text-lg font-semibold text-white">Privacy Settings</h4>
                  </div>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isPrivate"
                      checked={compData.isPrivate}
                      onChange={handleChange}
                      className="w-5 h-5 text-red-600 bg-black/50 border-gray-600 rounded 
                               focus:ring-red-500 focus:ring-2"
                    />
                    <span className="text-gray-300">Make this competition private</span>
                  </label>
                  
                  {compData.isPrivate && (
                    <div className="mt-4 space-y-2">
                      <label className="text-sm font-medium text-gray-300 block">
                        Pass Code (Optional)
                      </label>
                      <input
                        type="text"
                        name="passCode"
                        value={compData.passCode}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white 
                                 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 
                                 transition-all duration-300 placeholder-gray-500"
                        placeholder="Enter pass code for private access"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Content Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <DocumentTextIcon className="w-6 h-6 text-red-400" />
                  <h3 className="text-xl font-semibold text-white">Competition Content</h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 block">
                      Problem Statement *
                    </label>
                    <textarea
                      name="problemStatement"
                      value={compData.problemStatement}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white 
                               focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 
                               transition-all duration-300 placeholder-gray-500 resize-none"
                      placeholder="Describe the problem participants need to solve..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 block">
                      Competition Rules *
                    </label>
                    <textarea
                      name="compRuleBook"
                      value={compData.compRuleBook}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white 
                               focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 
                               transition-all duration-300 placeholder-gray-500 resize-none"
                      placeholder="Define the rules and guidelines for your competition..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 block">
                      Submission Guidelines *
                    </label>
                    <textarea
                      name="submissionRules"
                      value={compData.submissionRules}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white 
                               focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 
                               transition-all duration-300 placeholder-gray-500 resize-none"
                      placeholder="Specify how participants should submit their solutions..."
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Footer */}
            <div className="p-8 border-t border-red-900/20 bg-black/20">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="flex-1 py-3 px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-lg 
                           transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCompetition}
                  disabled={loading}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 
                           text-white rounded-lg transition-all duration-300 font-semibold
                           transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                           shadow-lg hover:shadow-red-500/25 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Creating Competition...</span>
                    </>
                  ) : (
                    <>
                      <CloudArrowUpIcon className="w-5 h-5" />
                      <span>Create Competition</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddComp;
