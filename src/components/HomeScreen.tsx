import React, { useState } from 'react';
import { Card } from './ui/card';
import { Plus, Play, Clock, DollarSign, Users, ChevronDown, ChevronRight, Spade, Calendar, Heart, Diamond, Club, Sparkles, BarChart3, LogIn, LogOut, Trash2 } from 'lucide-react';
import { Game } from '../App';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

interface HomeScreenProps {
  user: any;
  pastGames: Game[];
  currentGames: Game[];
  onStartNewGame: () => void;
  onViewPastGame: (game: Game) => void;
  onResumeGame: (game?: Game) => void;
  onViewStats: () => void;
  onLogin: (user: any) => void;
  onLogout: () => void;
  onDeleteActiveGame: (gameId: string) => void;
}

export function HomeScreen({ user, pastGames, currentGames, onStartNewGame, onViewPastGame, onResumeGame, onViewStats, onLogin, onLogout, onDeleteActiveGame }: HomeScreenProps) {
  const [isRecentGamesOpen, setIsRecentGamesOpen] = useState(false);
  const [isResumeGamesOpen, setIsResumeGamesOpen] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [gameToDelete, setGameToDelete] = useState<string | null>(null);

  const handleGoogleSuccess = (credentialResponse: any) => {
    try {
      const decoded: any = jwtDecode(credentialResponse.credential);
      const userData = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name
      };
      onLogin(userData);
      setLoginError('');
    } catch (err) {
      setLoginError('Failed to process Google login. Please try again.');
    }
  };

  const handleGoogleError = () => {
    setLoginError('Google login failed. Please try again.');
  };
  
  // Helper function to identify demo/sample games
  const isDemoGame = (game: Game) => {
    return game.id === '1' || game.id === '2';
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

  const getCurrentPot = (game: Game) => {
    return game.players.reduce((sum, player) => sum + (player.buyIn + player.rebuys), 0);
  };



  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">

      {/* Header Section */}
      <div className="header-container">
        {/* Logout button - only show when user is logged in */}
        {user && (
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <LogOut className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Logout</span>
            </button>
          </div>
        )}
        <div className="header-content">
          <div className="poker-suits-container">
            <div className="poker-suit spade">
              <Spade className="poker-suit-icon" />
            </div>
            <div className="poker-suit heart">
              <Heart className="poker-suit-icon" />
            </div>
            <div className="poker-suit diamond">
              <Diamond className="poker-suit-icon" />
            </div>
            <div className="poker-suit club">
              <Club className="poker-suit-icon" />
            </div>
          </div>
          <div className="poker-chips-container">
            {/* Red Chip - $5 */}
            <div className="poker-chip red">
              <div className="poker-chip-center red">5</div>
            </div>
            
            {/* Blue Chip - $10 */}
            <div className="poker-chip blue">
              <div className="poker-chip-center blue">10</div>
            </div>
            
            {/* Green Chip - $25 */}
            <div className="poker-chip green">
              <div className="poker-chip-center green">25</div>
            </div>
            
            {/* Yellow Chip - $50 */}
            <div className="poker-chip yellow">
              <div className="poker-chip-center yellow">50</div>
            </div>
          </div>
        </div>
        <div className="header-text-container">
          <h1 className="header-title">
            Pre Flop <span className="header-title-accent">ALL IN</span>
          </h1>
          <p className="header-subtitle">
            {user ? `Welcome, ${user.name?.split(' ')[0] || 'User'}!` : 'Manage your poker nights'}
          </p>
        </div>
        {/* login with google container - only show when user is not logged in */}
        {!user && (
          <div className="header-login-container px-6" style={{ marginTop: '3rem' }}>
            <div className="w-full flex justify-center">
              <div className="w-full max-w-none">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  theme="outline"
                  size="large"
                  text="continue_with"
                  shape="rectangular"
                />
              </div>
            </div>
            {loginError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400 text-center">{loginError}</p>
              </div>
            )}
            <p className="text-sm">Login to save your games</p>
          </div>
        )}
      </div>

      {/* Main Action Cards */}
      <div className="px-6 space-y-4 mb-8">

        {/* Resume Games Section - Show if there are active games */}
        {currentGames.length > 0 && (
          <Collapsible open={isResumeGamesOpen} onOpenChange={setIsResumeGamesOpen}>
            <CollapsibleTrigger asChild>
              <Card 
                className="p-6 border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-[1.03] hover:-translate-y-1 border-l-4 border-l-blue-500 hover:border-l-blue-400"
                style={{
                  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 25%, #bfdbfe 50%, #93c5fd 75%, #3b82f6 100%)',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.03) translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 25%, #93c5fd 50%, #3b82f6 75%, #2563eb 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1) translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 25%, #bfdbfe 50%, #93c5fd 75%, #3b82f6 100%)';
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg"
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
                        boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -2px rgba(59, 130, 246, 0.2)'
                      }}
                    >
                      <Play className="w-6 h-6 text-white fill-white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-1 text-lg">Active Games</h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {currentGames.length} game{currentGames.length !== 1 ? 's' : ''} in progress
                      </p>
                    </div>
                  </div>
                  {isResumeGamesOpen ? (
                    <ChevronDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
              </Card>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="space-y-3 mt-3">
                {currentGames.map((game, index) => (
                  <Card 
                    key={game.id} 
                    className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-l-4 border-l-blue-500 cursor-pointer bg-gradient-to-r from-gray-50 to-slate-100 dark:from-gray-950/50 dark:to-slate-900/50"
                    style={{ 
                      animationDelay: isResumeGamesOpen ? `${index * 50}ms` : '0ms'
                    }}
                    onClick={() => onResumeGame(game)}
                  >
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex items-center gap-4 flex-1 cursor-pointer"
                        onClick={() => onResumeGame(game)}
                      >
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center shadow-md">
                          <Play className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {formatDate(game.date)}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-700 dark:text-gray-300">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{game.players.length} players</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              <span>${getCurrentPot(game)} pot</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setGameToDelete(game.id);
                          }}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors duration-200"
                          title="Delete game"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Start New Game Card */}
        <Card 
          className="p-6 border-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/40 dark:via-green-950/40 dark:to-teal-950/40 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-[1.03] hover:-translate-y-1 border-l-4 border-l-emerald-500 hover:border-l-emerald-400"
          onClick={onStartNewGame}
          style={{
            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 25%, #a7f3d0 50%, #6ee7b7 75%, #34d399 100%)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.03) translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.background = 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 25%, #6ee7b7 50%, #34d399 75%, #10b981 100%)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            e.currentTarget.style.background = 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 25%, #a7f3d0 50%, #6ee7b7 75%, #34d399 100%)';
          }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3), 0 4px 6px -2px rgba(16, 185, 129, 0.2)'
              }}
            >
              <Plus className="w-6 h-6 text-white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-emerald-900 dark:text-emerald-100 mb-1 text-lg">Start New Game</h3>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">Set up players and begin a fresh poker night</p>
            </div>
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
          </div>
        </Card>

        {/* View Stats Card */}
        <Card 
          className="p-6 border-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-sky-100 dark:from-cyan-950/40 dark:via-blue-950/40 dark:to-sky-900/40 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-[1.03] hover:-translate-y-1 border-l-4 border-l-cyan-500 hover:border-l-cyan-400"
          onClick={onViewStats}
          style={{
            background: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 25%, #a5f3fc 50%, #67e8f9 75%, #06b6d4 100%)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.03) translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.background = 'linear-gradient(135deg, #cffafe 0%, #a5f3fc 25%, #67e8f9 50%, #06b6d4 75%, #0891b2 100%)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            e.currentTarget.style.background = 'linear-gradient(135deg, #ecfeff 0%, #cffafe 25%, #a5f3fc 50%, #67e8f9 75%, #06b6d4 100%)';
          }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%)',
                boxShadow: '0 10px 15px -3px rgba(6, 182, 212, 0.3), 0 4px 6px -2px rgba(6, 182, 212, 0.2)'
              }}
            >
              <BarChart3 className="w-6 h-6 text-white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-cyan-900 dark:text-cyan-100 mb-1 text-lg">View Player Stats</h3>
              <p className="text-sm text-cyan-700 dark:text-cyan-300">Detailed analytics and player insights</p>
            </div>
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
          </div>
        </Card>

        {/* Recent Games Section */}
        <Collapsible open={isRecentGamesOpen} onOpenChange={setIsRecentGamesOpen}>
          <CollapsibleTrigger asChild>
            <Card 
              className="p-6 border-0 bg-gradient-to-br from-purple-50 via-indigo-50 to-slate-100 dark:from-purple-950/40 dark:via-indigo-950/40 dark:to-slate-900/40 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-[1.03] hover:-translate-y-1 border-l-4 border-l-purple-500 hover:border-l-purple-400"
              style={{
                background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 25%, #e9d5ff 50%, #c084fc 75%, #8b5cf6 100%)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.03) translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 25%, #c084fc 50%, #8b5cf6 75%, #7c3aed 100%)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 25%, #e9d5ff 50%, #c084fc 75%, #8b5cf6 100%)';
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)',
                      boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.3), 0 4px 6px -2px rgba(139, 92, 246, 0.2)'
                    }}
                  >
                    <Clock className="w-6 h-6 text-white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-purple-900 dark:text-purple-100 mb-1 text-lg">Games Hosted</h3>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      {pastGames.filter(game => !isDemoGame(game)).length} game{pastGames.filter(game => !isDemoGame(game)).length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                {isRecentGamesOpen ? (
                  <ChevronDown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                )}
              </div>
            </Card>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="space-y-3 mt-3">
              {pastGames.length > 0 ? (
                pastGames.map((game, index) => (
                  <Card 
                    key={game.id} 
                    className={`p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-l-4 relative group ${
                      isDemoGame(game) 
                        ? 'bg-gradient-to-r from-orange-50/50 to-amber-50/50 dark:from-orange-950/20 dark:to-amber-950/20 border-l-orange-400' 
                        : 'bg-gradient-to-r from-gray-50 to-slate-100 dark:from-gray-950/50 dark:to-slate-900/50 border-l-gray-500'
                    }`}
                    style={{ 
                      animationDelay: isRecentGamesOpen ? `${index * 50}ms` : '0ms'
                    }}
                  >
                    {/* Demo/Sample Badge */}
                    {isDemoGame(game) && (
                      <Badge 
                        variant="secondary" 
                        className="absolute top-2 right-2 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 text-xs font-medium"
                      >
                        Demo
                      </Badge>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex items-center gap-4 flex-1 cursor-pointer"
                        onClick={() => onViewPastGame(game)}
                      >
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center shadow-md">
                          <Calendar className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {formatDate(game.date)}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-700 dark:text-gray-300">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{game.players.length} players</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              <span>${game.totalPot} stakes</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      

                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-8 text-center border-dashed border-2 border-border/50">
                  <div className="text-muted-foreground">
                    <div className="w-12 h-12 mx-auto mb-3 bg-muted/50 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 opacity-50" />
                    </div>
                    <p className="font-medium">No games yet</p>
                    <p className="text-sm mt-1">Start your first poker night!</p>
                  </div>
                </Card>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Footer - Created by Srikar */}
      <div className="mt-auto pt-6 pb-4 px-6">
        <div className="text-center">
          <p className="text-xs text-muted-foreground/60 font-medium flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" />
            Created by Srikar | 2025
            <Sparkles className="w-3 h-3" />
          </p>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!gameToDelete} onOpenChange={() => setGameToDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <DialogTitle className="text-center">Delete Active Game?</DialogTitle>
            <DialogDescription className="text-center">
              This will permanently delete the game and all its data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 sm:justify-center">
            <Button
              variant="outline"
              onClick={() => setGameToDelete(null)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (gameToDelete) {
                  onDeleteActiveGame(gameToDelete);
                  setGameToDelete(null);
                }
              }}
              className="flex-1"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}