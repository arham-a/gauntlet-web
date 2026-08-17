import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const UserContext = createContext(null);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userInfo, setUserInfo] = useState({ username: '', email: '', createdAt: '' });
  const [stats, setStats] = useState({ 
    competitionsJoined: 0, 
    competitionsCreated: 0, 
    totalPoints: 0,
    wins: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [joinedCompetitions, setJoinedCompetitions] = useState([]);
  const [createdCompetitions, setCreatedCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get userId from cookie
  const getUserIdFromCookie = useCallback(() => {
    const uidCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('userID='));
    return uidCookie ? uidCookie.split('=')[1] : null;
  }, []);

  // Fetch user info
  const fetchUserInfo = useCallback(async (uid) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/user/${uid}`);
      if (response.data.message === 'User details fetched successfully') {
        const { username, email, createdAt } = response.data.data;
        setUserInfo({ username, email, createdAt });
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  }, []);

  // Fetch user stats
  const fetchStats = useCallback(async (uid) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/user/${uid}/stats`);
      if (res.data) {
        setStats({
          competitionsJoined: res.data.competitionsJoined || 0,
          competitionsCreated: res.data.competitionsCreated || 0,
          totalPoints: res.data.totalPoints || 0,
          wins: res.data.wins || 0
        });
      }
    } catch (err) {
      console.error('Error fetching user stats:', err);
    }
  }, []);

  // Fetch joined competitions
  const fetchJoinedCompetitions = useCallback(async (uid) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/user/${uid}/myJoinComp`);
      if (res.data && res.data.myJoinComp) {
        setJoinedCompetitions(res.data.myJoinComp);
      }
    } catch (err) {
      console.error('Error fetching joined competitions:', err);
    }
  }, []);

  // Fetch created competitions
  const fetchCreatedCompetitions = useCallback(async (uid) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/user/${uid}/myCreatedComp`);
      if (res.data && res.data.myCreatedComp) {
        setCreatedCompetitions(res.data.myCreatedComp);
      }
    } catch (err) {
      console.error('Error fetching created competitions:', err);
    }
  }, []);

  // Fetch recent activity (from competitions joined/created)
  const fetchRecentActivity = useCallback(async (uid) => {
    try {
      const [joinedRes, createdRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/user/${uid}/myJoinComp`),
        axios.get(`${import.meta.env.VITE_API_URL}/user/${uid}/myCreatedComp`)
      ]);

      const activities = [];
      
      // Get joined competition IDs
      const joinedIds = joinedRes.data?.myJoinComp || [];
      const createdIds = createdRes.data?.myCreatedComp || [];

      // Fetch competition details for recent activity
      const allCompIds = [...new Set([...joinedIds.slice(-3), ...createdIds.slice(-3)])];
      
      if (allCompIds.length > 0) {
        const compRes = await axios.get(`${import.meta.env.VITE_API_URL}/comp`);
        const competitions = compRes.data?.competitions || [];
        
        joinedIds.slice(-3).reverse().forEach(compId => {
          const comp = competitions.find(c => c._id === compId);
          if (comp) {
            activities.push({
              action: 'Joined',
              competition: comp.compName,
              date: getRelativeTime(comp.createdAt),
              type: 'participation',
              compId: comp._id
            });
          }
        });

        createdIds.slice(-2).reverse().forEach(compId => {
          const comp = competitions.find(c => c._id === compId);
          if (comp) {
            activities.push({
              action: 'Created',
              competition: comp.compName,
              date: getRelativeTime(comp.createdAt),
              type: 'creation',
              compId: comp._id
            });
          }
        });
      }

      setRecentActivity(activities.slice(0, 5));
    } catch (err) {
      console.error('Error fetching recent activity:', err);
    }
  }, []);

  // Helper function to get relative time
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    // A missing or unparseable date must degrade to null, not "NaN years ago".
    if (!dateString || Number.isNaN(date.getTime())) return null;
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Refresh all user data
  const refreshUserData = useCallback(async () => {
    const uid = getUserIdFromCookie();
    if (uid) {
      await Promise.all([
        fetchUserInfo(uid),
        fetchStats(uid),
        fetchJoinedCompetitions(uid),
        fetchCreatedCompetitions(uid),
        fetchRecentActivity(uid)
      ]);
    }
  }, [getUserIdFromCookie, fetchUserInfo, fetchStats, fetchJoinedCompetitions, fetchCreatedCompetitions, fetchRecentActivity]);

  // Initialize user data on mount
  useEffect(() => {
    const uid = getUserIdFromCookie();
    if (uid) {
      setUserId(uid);
      setIsSignedIn(true);
      
      Promise.all([
        fetchUserInfo(uid),
        fetchStats(uid),
        fetchJoinedCompetitions(uid),
        fetchCreatedCompetitions(uid),
        fetchRecentActivity(uid)
      ]).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [getUserIdFromCookie, fetchUserInfo, fetchStats, fetchJoinedCompetitions, fetchCreatedCompetitions, fetchRecentActivity]);

  // Handle joining a competition
  const joinCompetition = useCallback(async (compId) => {
    const uid = getUserIdFromCookie();
    if (!uid) {
      throw new Error('User not signed in');
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/user/${uid}/${compId}/myJoinComp`);
      
      // Refresh stats and joined competitions
      await Promise.all([
        fetchStats(uid),
        fetchJoinedCompetitions(uid),
        fetchRecentActivity(uid)
      ]);

      return true;
    } catch (error) {
      console.error('Error joining competition:', error);
      throw error;
    }
  }, [getUserIdFromCookie, fetchStats, fetchJoinedCompetitions, fetchRecentActivity]);

  // Handle creating a competition
  const createCompetition = useCallback(async (compId) => {
    const uid = getUserIdFromCookie();
    if (!uid) {
      throw new Error('User not signed in');
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/user/${uid}/${compId}/myCreatedComp`);
      
      // Refresh stats and created competitions
      await Promise.all([
        fetchStats(uid),
        fetchCreatedCompetitions(uid),
        fetchRecentActivity(uid)
      ]);

      return true;
    } catch (error) {
      console.error('Error creating competition:', error);
      throw error;
    }
  }, [getUserIdFromCookie, fetchStats, fetchCreatedCompetitions, fetchRecentActivity]);

  // Handle logout
  const logout = useCallback(() => {
    document.cookie = "token=; Max-Age=0; path=/";
    document.cookie = "userID=; Max-Age=0; path=/";
    setIsSignedIn(false);
    setUserId(null);
    setUserInfo({ username: '', email: '', createdAt: '' });
    setStats({ competitionsJoined: 0, competitionsCreated: 0, totalPoints: 0, wins: 0 });
    setRecentActivity([]);
    setJoinedCompetitions([]);
    setCreatedCompetitions([]);
  }, []);

  // Handle login
  const login = useCallback(async () => {
    const uid = getUserIdFromCookie();
    if (uid) {
      setUserId(uid);
      setIsSignedIn(true);
      await refreshUserData();
    }
  }, [getUserIdFromCookie, refreshUserData]);

  const value = {
    isSignedIn,
    userId,
    userInfo,
    stats,
    recentActivity,
    joinedCompetitions,
    createdCompetitions,
    loading,
    refreshUserData,
    joinCompetition,
    createCompetition,
    logout,
    login,
    fetchStats: () => fetchStats(userId),
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
