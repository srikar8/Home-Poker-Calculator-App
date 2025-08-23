import { useState, useEffect } from 'react';

interface VisitorStats {
  totalVisitors: number;
  dailyVisitors: number;
  lastVisitDate: string;
  isNewVisitor: boolean;
  isNewDailyVisitor: boolean;
}

export function useVisitorCount() {
  const [stats, setStats] = useState<VisitorStats>({
    totalVisitors: 0,
    dailyVisitors: 0,
    lastVisitDate: '',
    isNewVisitor: false,
    isNewDailyVisitor: false
  });

  useEffect(() => {
    const today = new Date().toDateString();
    
    // Get stored stats
    const storedStats = localStorage.getItem('poker-app-visitor-stats');
    const currentStats = storedStats ? JSON.parse(storedStats) : {
      totalVisitors: 0,
      dailyVisitors: 0,
      lastVisitDate: '',
      dailyVisitorsDate: ''
    };
    
    // Check if this is a new session
    const hasVisitedThisSession = sessionStorage.getItem('poker-app-session-visited');
    
    let newStats = { ...currentStats };
    let isNewVisitor = false;
    let isNewDailyVisitor = false;
    
    if (!hasVisitedThisSession) {
      // Increment total visitors
      newStats.totalVisitors += 1;
      isNewVisitor = true;
      
      // Check if this is a new day
      if (newStats.dailyVisitorsDate !== today) {
        newStats.dailyVisitors = 1;
        newStats.dailyVisitorsDate = today;
        isNewDailyVisitor = true;
      } else {
        newStats.dailyVisitors += 1;
      }
      
      newStats.lastVisitDate = today;
      
      // Save to localStorage
      localStorage.setItem('poker-app-visitor-stats', JSON.stringify(newStats));
      sessionStorage.setItem('poker-app-session-visited', 'true');
    }
    
    setStats({
      totalVisitors: newStats.totalVisitors,
      dailyVisitors: newStats.dailyVisitors,
      lastVisitDate: newStats.lastVisitDate,
      isNewVisitor,
      isNewDailyVisitor
    });
  }, []);

  const resetStats = () => {
    localStorage.removeItem('poker-app-visitor-stats');
    sessionStorage.removeItem('poker-app-session-visited');
    setStats({
      totalVisitors: 0,
      dailyVisitors: 0,
      lastVisitDate: '',
      isNewVisitor: false,
      isNewDailyVisitor: false
    });
  };

  return { 
    visitorCount: stats.totalVisitors,
    dailyVisitors: stats.dailyVisitors,
    lastVisitDate: stats.lastVisitDate,
    isNewVisitor: stats.isNewVisitor,
    isNewDailyVisitor: stats.isNewDailyVisitor,
    resetStats
  };
}
