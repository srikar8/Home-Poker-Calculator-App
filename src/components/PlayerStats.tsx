import React from 'react';
import { Card } from './ui/card';
import { ArrowLeft, Users, DollarSign, TrendingUp, Calendar, BarChart3, Trophy, Target, Award } from 'lucide-react';
import { Game } from '../App';

interface PlayerStatsProps {
  pastGames: Game[];
  onBack: () => void;
}

export function PlayerStats({ pastGames, onBack }: PlayerStatsProps) {
  // Helper function to identify demo/sample games
  const isDemoGame = (game: Game) => {
    return game.id === '1' || game.id === '2';
  };

  // Helper functions for player statistics
  const getPlayerStats = () => {
    const actualGames = pastGames.filter(game => !isDemoGame(game));
    if (actualGames.length === 0) return { totalPlayers: 0, uniquePlayers: 0, totalStakes: 0, avgStakes: 0, totalGames: 0, totalWinnings: 0 };

    const allPlayers = actualGames.flatMap(game => game.players);
    const uniquePlayerNames = new Set(allPlayers.map(player => player.name));
    
    const totalStakes = actualGames.reduce((sum, game) => sum + game.totalPot, 0);
    const avgStakes = Math.round(totalStakes / actualGames.length);
    
    const totalWinnings = allPlayers.reduce((sum, player) => {
      const totalInvested = player.buyIn + player.rebuys;
      const winnings = player.cashOut - totalInvested;
      return sum + winnings;
    }, 0);

    return {
      totalPlayers: allPlayers.length,
      uniquePlayers: uniquePlayerNames.size,
      totalStakes,
      avgStakes,
      totalGames: actualGames.length,
      totalWinnings
    };
  };

  const getTopPlayers = () => {
    const actualGames = pastGames.filter(game => !isDemoGame(game));
    if (actualGames.length === 0) return [];

    const playerStats = new Map<string, { 
      name: string; 
      gamesPlayed: number; 
      totalStakes: number;
      totalWinnings: number;
      totalInvested: number;
    }>();
    
    actualGames.forEach(game => {
      game.players.forEach(player => {
        const existing = playerStats.get(player.name) || { 
          name: player.name, 
          gamesPlayed: 0, 
          totalStakes: 0,
          totalWinnings: 0,
          totalInvested: 0
        };
        
        const totalInvested = player.buyIn + player.rebuys;
        const winnings = player.cashOut - totalInvested;
        
        playerStats.set(player.name, {
          name: player.name,
          gamesPlayed: existing.gamesPlayed + 1,
          totalStakes: existing.totalStakes + totalInvested,
          totalWinnings: existing.totalWinnings + winnings,
          totalInvested: existing.totalInvested + totalInvested
        });
      });
    });

    return Array.from(playerStats.values())
      .sort((a, b) => b.totalWinnings - a.totalWinnings) // Sort by total winnings
      .slice(0, 5);
  };

  const stats = getPlayerStats();
  const topPlayers = getTopPlayers();

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-border/50"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Player Statistics</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Comprehensive player insights and analytics</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 space-y-6 flex-1 overflow-y-auto">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-6 border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 shadow-lg">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
                  boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -2px rgba(59, 130, 246, 0.2)'
                }}
              >
                <Users className="w-6 h-6 text-white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }} />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.uniquePlayers}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  Unique Players
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 shadow-lg">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                  boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3), 0 4px 6px -2px rgba(16, 185, 129, 0.2)'
                }}
              >
                <Calendar className="w-6 h-6 text-white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }} />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.totalGames}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300 font-medium">
                  Total Games
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/40 dark:to-violet-950/40 shadow-lg">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)',
                  boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.3), 0 4px 6px -2px rgba(139, 92, 246, 0.2)'
                }}
              >
                <DollarSign className="w-6 h-6 text-white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }} />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  ${stats.totalStakes}
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                  Total Stakes
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/40 shadow-lg">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%)',
                  boxShadow: '0 10px 15px -3px rgba(249, 115, 22, 0.3), 0 4px 6px -2px rgba(249, 115, 22, 0.2)'
                }}
              >
                <TrendingUp className="w-6 h-6 text-white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }} />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  ${stats.avgStakes}
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300 font-medium">
                  Avg. Stakes
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Top Players */}
        <Card className="p-6 border-0 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/40 dark:to-gray-950/40 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div 
              className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #eab308 0%, #d97706 50%, #b45309 100%)',
                boxShadow: '0 10px 15px -3px rgba(234, 179, 8, 0.3), 0 4px 6px -2px rgba(234, 179, 8, 0.2)'
              }}
            >
              <Trophy className="w-5 h-5 text-white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Top Winners</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Players with highest total winnings</p>
            </div>
          </div>

          {topPlayers.length > 0 ? (
            <div className="space-y-3">
              {topPlayers.map((player, index) => (
                <div key={player.name} className="flex items-center justify-between p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-border/30">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-gray-900 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {player.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {player.gamesPlayed} game{player.gamesPlayed !== 1 ? 's' : ''} played
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${player.totalWinnings >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {player.totalWinnings >= 0 ? '+' : ''}${player.totalWinnings}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      total winnings
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      invested: ${player.totalInvested}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div 
                className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 50%, #4b5563 100%)',
                  boxShadow: '0 10px 15px -3px rgba(156, 163, 175, 0.3), 0 4px 6px -2px rgba(156, 163, 175, 0.2)'
                }}
              >
                <BarChart3 className="w-8 h-8 text-white opacity-50" style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }} />
              </div>
              <p className="font-medium text-gray-900 dark:text-gray-100">No player data yet</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Complete some games to see player statistics!</p>
            </div>
          )}
        </Card>

        {/* Additional Stats */}
        <Card className="p-6 border-0 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/40 dark:to-blue-950/40 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div 
              className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%)',
                boxShadow: '0 10px 15px -3px rgba(6, 182, 212, 0.3), 0 4px 6px -2px rgba(6, 182, 212, 0.2)'
              }}
            >
              <Target className="w-5 h-5 text-white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Game Insights</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Key metrics and trends</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-border/30">
              <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mb-1">
                {stats.totalGames > 0 ? Math.round(stats.totalPlayers / stats.totalGames) : 0}
              </div>
              <div className="text-sm text-cyan-700 dark:text-cyan-300 font-medium">
                Avg. Players per Game
              </div>
            </div>

            <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-border/30">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {stats.totalGames > 0 ? Math.round(stats.totalStakes / stats.totalPlayers) : 0}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                Avg. Stakes per Player
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <div className="px-6 py-4">
        <div className="text-center">
          <p className="text-xs text-muted-foreground/60 font-medium">
            Statistics exclude demo games
          </p>
        </div>
      </div>
    </div>
  );
}
