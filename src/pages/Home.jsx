import React, { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";
import { MagnifyingGlassIcon, PlusIcon, TrophyIcon, UsersIcon, FireIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import CompetitionCard from "../assets/components/CompetitionCard";
import { useGlobalStats } from "../context/GlobalStatsContext";

const Home = () => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState('all');
  const { globalStats, refreshGlobalStats } = useGlobalStats();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/comp`);
        if (!response.ok) {
          throw new Error("Failed to fetch competitions");
        }
        const data = await response.json();
        // Transform the API data to match our CompetitionCard props structure
        const transformedData = data.competitions.map((comp) => ({
          id: comp._id,
          name: comp.compName,
          description: comp.compDescription,
          admin: comp.compType,
          entryFee: comp.price === 0 ? "Free" : `$${comp.price}`,
          isPrivate: comp.isPrivate,
        }));
        setCompetitions(transformedData);
      } catch (err) {
        setError(err.message);
        toast.error('Failed to load competitions');
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitions();
  }, []);

  const filteredCompetitions = competitions.filter((comp) => {
    const matchesSearch = comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         comp.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'free') return matchesSearch && comp.entryFee === 'Free';
    if (activeFilter === 'private') return matchesSearch && comp.isPrivate;
    if (activeFilter === 'public') return matchesSearch && !comp.isPrivate;
    
    return matchesSearch;
  });

  // Format participant count for display
  const formatParticipantCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K+`;
    }
    return count.toString();
  };

  const stats = [
    { label: 'Total Competitions', value: globalStats.totalCompetitions || competitions.length, icon: TrophyIcon, color: 'text-red-400' },
    { label: 'Active Participants', value: formatParticipantCount(globalStats.totalParticipants), icon: UsersIcon, color: 'text-blue-400' },
    { label: 'Trending Now', value: globalStats.trendingCompetitions || Math.min(competitions.length, 5), icon: FireIcon, color: 'text-orange-400' },
  ];

  if (loading) {
    return (
      <div className="font-['Poppins',sans-serif] flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading competitions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="font-['Poppins',sans-serif] flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-white text-xl mb-2">Oops! Something went wrong</p>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

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
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-400/3 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 pt-20 pb-16 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">
              Gauntlet
            </span>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Join the ultimate competition platform where talent meets opportunity. 
            Showcase your skills, compete with the best, and win amazing prizes.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {stats.map((stat, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-lg p-6 border border-red-900/20">
                <div className="flex items-center justify-center mb-4">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-4 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Available <span className="text-red-400">Competitions</span>
            </h2>
            <p className="text-gray-400 text-lg">Choose your challenge and start competing today</p>
          </div>

          {/* Search and Filters */}
          <div className="mb-12">
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-grow max-w-2xl">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search competitions by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-700 rounded-lg text-white 
                           focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 
                           transition-all duration-300 placeholder-gray-400 backdrop-blur-sm"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-3">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'free', label: 'Free' },
                  { key: 'public', label: 'Public' },
                  { key: 'private', label: 'Private' }
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setActiveFilter(filter.key)}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                      activeFilter === filter.key
                        ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Competition Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCompetitions.length > 0 ? (
              filteredCompetitions.map((comp) => (
                <div key={comp.id} className="transform hover:scale-105 transition-all duration-300">
                  <CompetitionCard comp={comp} />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <div className="text-gray-500 text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-white mb-2">No competitions found</h3>
                <p className="text-gray-400">
                  {searchQuery ? 'Try adjusting your search terms or filters' : 'Check back later for new competitions'}
                </p>
              </div>
            )}
          </div>

          {/* Call to Action */}
          {competitions.length > 0 && (
            <div className="text-center mt-16">
              <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-lg p-8 border border-red-900/20">
                <h3 className="text-2xl font-bold text-white mb-4">Ready to Create Your Own Competition?</h3>
                <p className="text-gray-400 mb-6">Host your own competition and challenge others in your field</p>
                <button 
                  onClick={() => navigate('/add-comp')}
                  className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 
                                 text-white rounded-lg transition-all duration-300 font-semibold text-lg
                                 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-red-500/25
                                 flex items-center space-x-2 mx-auto">
                  <PlusIcon className="w-5 h-5" />
                  <span>Create Competition</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
