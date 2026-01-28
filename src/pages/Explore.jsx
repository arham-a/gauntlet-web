import { useState, useEffect } from 'react';
import { toast, Toaster } from "sonner";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlassIcon, UsersIcon, ClockIcon } from "@heroicons/react/24/outline";
import { HeartIcon, LockClosedIcon } from "@heroicons/react/24/solid";
import { useUser } from "../context/UserContext";
import { useGlobalStats } from "../context/GlobalStatsContext";

const Explore = () => {
  const [competitions, setCompetitions] = useState([]);
  const [categories, setCategories] = useState(['all']);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState(new Set());
  const [joiningCompetitions, setJoiningCompetitions] = useState(new Set());
  const navigate = useNavigate();
  const { joinCompetition, refreshUserData, joinedCompetitions } = useUser();
  const { refreshGlobalStats } = useGlobalStats();

  useEffect(() => {
    const mockImages = [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop',
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=600&fit=crop',
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=600&fit=crop',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=600&fit=crop',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&h=600&fit=crop'
    ];

    const controller = new AbortController();

    const fetchData = async () => {
      try {
        // Fetch competitions and competition types in parallel
        const [compRes, typeRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/comp`, { signal: controller.signal }),
          fetch(`${import.meta.env.VITE_API_URL}/comp/type`, { signal: controller.signal })
        ]);

        // Handle competitions
        if (!compRes.ok) throw new Error('Failed to fetch competitions');
        const data = await compRes.json();
        const fetched = (data.competitions || []).map((comp, idx) => ({
          id: comp._id,
          title: comp.compName || 'Untitled Competition',
          description: comp.compDescription || '',
          category: comp.compType?.name || comp.compType || 'General',
          prize: comp.price || 'Free',
          participants: comp.participantCount || 0,
          deadline: new Date(Date.now() + (7 + idx) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          difficulty: ['Beginner', 'Intermediate', 'Advanced'][idx % 3],
          tags: comp.compType ? [comp.compType?.name || comp.compType] : [],
          image: mockImages[idx % mockImages.length],
          organizer: comp.compOwnerUserId?.username || 'Organizer',
          status: comp.isPrivate ? 'Private' : 'Active'
        }));
        setCompetitions(fetched);

        // Handle competition types
        if (typeRes.ok) {
          const typeData = await typeRes.json();
          // Extract category names from competition types
          const categoryNames = typeData.map(type => type.compTypeName || type.name).filter(Boolean);
          setCategories(['all', ...categoryNames]);
        } else {
          // Fallback: extract unique categories from fetched competitions
          const uniqueCategories = [...new Set(fetched.map(c => c.category).filter(c => c && c !== 'General'))];
          setCategories(['all', ...uniqueCategories]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Could not load competitions. Showing no results.');
        setCompetitions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, []);

  const filteredCompetitions = competitions.filter(comp => {
    const matchesSearch = comp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         comp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         comp.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || comp.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getUserId = () => {
    const uidCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('userID='));
    return uidCookie ? uidCookie.split('=')[1] : null;
  };

  const toggleFavorite = (id) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
      toast.success('Removed from favorites');
    } else {
      newFavorites.add(id);
      toast.success('Added to favorites');
    }
    setFavorites(newFavorites);
  };

  const handleJoinCompetition = async (competition) => {
    const userId = getUserId();
    if (!userId) {
      toast.error("Please login to join competitions");
      navigate('/login');
      return;
    }

    // Check if already joined
    if (joinedCompetitions && joinedCompetitions.includes(competition.id)) {
      toast.info("You've already joined this competition!");
      navigate(`/competition-page/${competition.id}`);
      return;
    }

    setJoiningCompetitions(prev => new Set([...prev, competition.id]));

    try {
      if (competition.status === 'Private') {
        // For private competitions, show a notification that admin approval is needed
        const response = await fetch(`${import.meta.env.VITE_API_URL}/comp/${competition.id}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
          throw new Error('Failed to request to join private competition');
        }
        
        toast.success('Request sent! Waiting for admin approval.');
      } else {
        // For public competitions, join directly using the user route
        const response = await fetch(`${import.meta.env.VITE_API_URL}/user/${userId}/${competition.id}/myJoinComp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to join competition');
        }

        // Also update the competition's participant list
        await fetch(`${import.meta.env.VITE_API_URL}/comp/${competition.id}/participants`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });

        // Refresh user data to update sidebar stats and activity
        await refreshUserData();
        await refreshGlobalStats();

        toast.success('Successfully joined competition!');
        navigate(`/competition-page/${competition.id}`);
      }
    } catch (err) {
      toast.error(err.message);
      console.error('Join competition error:', err);
    } finally {
      setJoiningCompetitions(prev => {
        const newSet = new Set(prev);
        newSet.delete(competition.id);
        return newSet;
      });
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400 bg-green-400/10';
      case 'Intermediate': return 'text-yellow-400 bg-yellow-400/10';
      case 'Advanced': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const formatDeadline = (deadline) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Ended';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days left`;
  };

  if (loading) {
    return (
      <div className="font-['Poppins',sans-serif] flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Discovering competitions...</p>
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
      </div>

      {/* Header */}
      <div className="relative z-10 pt-20 pb-12 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
            <span className="text-white">Explore </span>
            <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              Competitions
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Discover amazing competitions, showcase your skills, and compete with talented individuals worldwide
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="relative z-10 px-4 lg:px-8 mb-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-lg border border-red-900/20 p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search Bar - More Space */}
              <div className="flex-1 lg:flex-[3]">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search competitions, tags, or organizers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white 
                             focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 
                             transition-all duration-300 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Category Filter Dropdown */}
              <div className="lg:flex-1">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white 
                           focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 
                           transition-all duration-300"
                >
                  <option value="all">All Categories</option>
                  {categories.slice(1).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Competition Grid */}
      <div className="relative z-10 px-4 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {filteredCompetitions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCompetitions.map((competition) => (
                <div key={competition.id} className="group">
                  <div className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm rounded-lg border border-red-900/30 
                                  shadow-2xl hover:shadow-red-500/10 transition-all duration-500 overflow-hidden
                                  hover:border-red-500/50 transform hover:-translate-y-2">
                    
                    {/* Competition Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={competition.image} 
                        alt={competition.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      
                      {/* Favorite Button */}
                      <button
                        onClick={() => toggleFavorite(competition.id)}
                        className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-full 
                                 hover:bg-black/70 transition-all duration-300"
                      >
                        <HeartIcon 
                          className={`w-5 h-5 ${favorites.has(competition.id) ? 'text-red-500' : 'text-white'}`}
                        />
                      </button>

                      {/* Prize Badge */}
                      <div className="absolute top-4 left-4 bg-red-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {competition.prize}
                      </div>
                      
                      {/* Private Competition Indicator */}
                      {competition.status === 'Private' && (
                        <div className="absolute bottom-4 left-4">
                          <div className="bg-yellow-600/20 backdrop-blur-sm rounded-full p-2 border border-yellow-500/30">
                            <LockClosedIcon className="w-4 h-4 text-yellow-400" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Header */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-red-400 text-sm font-medium">{competition.category}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(competition.difficulty)}`}>
                            {competition.difficulty}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-100 transition-colors">
                          {competition.title}
                        </h3>
                        <p className="text-gray-300 text-sm leading-relaxed line-clamp-2">
                          {competition.description}
                        </p>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {competition.tags.map((tag, index) => (
                          <span key={index} className="bg-gray-800/50 text-gray-300 px-2 py-1 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <UsersIcon className="w-4 h-4" />
                            <span>{competition.participants.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="w-4 h-4" />
                            <span>{formatDeadline(competition.deadline)}</span>
                          </div>
                        </div>
                        <span className="text-gray-500">by {competition.organizer}</span>
                      </div>

                      {/* Action Button */}
                      <button 
                        onClick={() => handleJoinCompetition(competition)}
                        disabled={joiningCompetitions.has(competition.id)}
                        className={`w-full py-3 ${
                          joinedCompetitions && joinedCompetitions.includes(competition.id)
                            ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                            : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                        } text-white rounded-lg transition-all duration-300 font-semibold
                                 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-red-500/25
                                 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}>
                        {joiningCompetitions.has(competition.id) ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>{competition.status === 'Private' ? 'Requesting...' : 'Joining...'}</span>
                          </div>
                        ) : joinedCompetitions && joinedCompetitions.includes(competition.id) ? (
                          'View Competition ✓'
                        ) : (
                          competition.status === 'Private' ? 'Request to Join' : 'Join Competition'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-gray-500 text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-2">No competitions found</h3>
              <p className="text-gray-400">Try adjusting your search terms or category filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Explore;
