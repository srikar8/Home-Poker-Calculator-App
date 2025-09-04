import React, { useState } from 'react';
import { Card } from './ui/card';
import { Plus, Play, Clock, DollarSign, Users, ChevronDown, ChevronRight, Spade, Calendar, Heart, Diamond, Club, Sparkles, BarChart3 } from 'lucide-react';
import { Game } from '../App';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Badge } from './ui/badge';

interface HomeScreenProps {
  user: any;
  pastGames: Game[];
  currentGame: Game | null;
  onStartNewGame: () => void;
  onViewPastGame: (game: Game) => void;
  onResumeGame: () => void;
  onViewStats: () => void;
  onLogin: () => void;
  onLogout: () => void;
  onJoinGame: () => void;
  onViewMyGame: () => void;
}

export function HomeScreen({ user, pastGames, currentGame, onStartNewGame, onViewPastGame, onResumeGame, onViewStats, onLogin, onLogout, onJoinGame, onViewMyGame }: HomeScreenProps) {
  const [isRecentGamesOpen, setIsRecentGamesOpen] = useState(false);
  
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

  const getCurrentPot = () => {
    if (!currentGame) return 0;
    return currentGame.players.reduce((sum, player) => sum + (player.buyIn + player.rebuys), 0);
  };



  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Header Section */}
      <div className="header-container">
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
      </div>

      {/* Main Action Cards */}
      <div className="px-6 space-y-4 mb-8">
        {/* Resume Game Card - Only show if there's an active game */}
        {currentGame && currentGame.isActive && (
          <Card 
            className="p-6 border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-[1.03] hover:-translate-y-1 border-l-4 border-l-blue-500 hover:border-l-blue-400"
            onClick={onResumeGame}
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
              <div className="flex-1">
                <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-1 text-lg">Resume Game</h3>
                <div className="flex items-center gap-4 text-sm text-blue-700 dark:text-blue-300">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{currentGame.players.length} players</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span>${getCurrentPot()} pot</span>
                  </div>
                </div>
              </div>
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
            </div>
          </Card>
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

        {/* Join Game Card */}
        <Card 
          className="p-6 border-0 bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-purple-950/40 dark:via-violet-950/40 dark:to-indigo-950/40 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-[1.03] hover:-translate-y-1 border-l-4 border-l-purple-500 hover:border-l-purple-400"
          onClick={onJoinGame}
          style={{
            background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 25%, #e9d5ff 50%, #d8b4fe 75%, #c084fc 100%)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.03) translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.background = 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 25%, #d8b4fe 50%, #c084fc 75%, #a855f7 100%)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            e.currentTarget.style.background = 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 25%, #e9d5ff 50%, #d8b4fe 75%, #c084fc 100%)';
          }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)',
                boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.4)'
              }}
            >
              <Users className="w-6 h-6 text-white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-purple-900 dark:text-purple-100 mb-1 text-lg">Join Game</h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">Enter a game code to join an existing game</p>
            </div>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
          </div>
        </Card>

        {/* View My Game Card */}
        <Card 
          className="p-6 border-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/40 dark:via-orange-950/40 dark:to-yellow-950/40 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-[1.03] hover:-translate-y-1 border-l-4 border-l-amber-500 hover:border-l-amber-400"
          onClick={onViewMyGame}
          style={{
            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 25%, #fde68a 50%, #f59e0b 75%, #d97706 100%)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.03) translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.background = 'linear-gradient(135deg, #fef3c7 0%, #fde68a 25%, #f59e0b 50%, #d97706 75%, #b45309 100%)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            e.currentTarget.style.background = 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 25%, #fde68a 50%, #f59e0b 75%, #d97706 100%)';
          }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
                boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.3), 0 4px 6px -2px rgba(245, 158, 11, 0.2)'
              }}
            >
              <Calendar className="w-6 h-6 text-white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-amber-900 dark:text-amber-100 mb-1 text-lg">View My Game</h3>
              <div className="flex items-center gap-4 text-sm text-amber-700 dark:text-amber-300">
                {currentGame && currentGame.isActive ? (
                  <>
                    <div className="flex items-center gap-1">
                      <Badge variant="default" className="bg-green-500 text-white text-xs">
                        In Progress
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{currentGame.players.length} players</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>${getCurrentPot()} pot</span>
                    </div>
                  </>
                ) : pastGames.length > 0 ? (
                  <>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{pastGames.length} games played</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>${pastGames[0].totalPot} total</span>
                    </div>
                  </>
                ) : (
                  <span>No games yet</span>
                )}
              </div>
            </div>
            <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
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
                    <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
                      <span>{pastGames.filter(game => !isDemoGame(game)).length} total</span>
                      {currentGame && currentGame.isActive && (
                        <>
                          <span>•</span>
                          <Badge variant="default" className="bg-green-500 text-white text-xs">
                            In Progress
                          </Badge>
                        </>
                      )}
                    </div>
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
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                              {formatDate(game.date)}
                            </h3>
                            {game.isActive ? (
                              <Badge variant="default" className="bg-green-500 text-white text-xs">
                                In Progress
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                Completed
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-700 dark:text-gray-300">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{game.players.length} players</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              <span>${game.buyInAmount} buy-in</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              <span>${game.totalPot} total pot</span>
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
        <div className="text-center space-y-3">
          <p className="text-xs text-muted-foreground/60 font-medium flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" />
            Created by Srikar | 2025
            <Sparkles className="w-3 h-3" />
          </p>
          {user ? (
            <button
              onClick={onLogout}
              className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
            >
              Logout ({user.name?.split(' ')[0] || 'User'})
            </button>
          ) : (
            <button
              onClick={onLogin}
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
            >
              Login / Signup
            </button>
          )}
        </div>
      </div>
    </div>
  );
}