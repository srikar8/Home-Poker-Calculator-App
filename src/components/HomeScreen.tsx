import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Plus, Clock, DollarSign, Users, Calendar, ArrowRight, Trophy } from 'lucide-react';
import { Game } from '../App';

interface HomeScreenProps {
  pastGames: Game[];
  onStartNewGame: () => void;
  onViewPastGame: (game: Game) => void;
}

export function HomeScreen({ pastGames, onStartNewGame, onViewPastGame }: HomeScreenProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getBiggestWinner = (game: Game) => {
    const getNetResult = (player: any) => {
      return player.cashOut - (game.buyInAmount + player.rebuys);
    };
    
    return game.players.reduce((biggest, player) => {
      const currentNet = getNetResult(player);
      const biggestNet = getNetResult(biggest);
      return currentNet > biggestNet ? player : biggest;
    });
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 pb-4 bg-background border-b border-border/50">
        <h1 className="text-4xl font-medium text-foreground" style={{ fontSize: '4rem' }}>Pre FLOP</h1>
        <h1 className="text-4xl font-medium text-foreground" style={{ fontSize: '3rem' }}>ALL IN</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your poker nights</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Start New Game - Centered */}
        <div className="flex-1 flex items-center justify-center p-6 ">
          <Card className="p-12 border-2 border-dashed border-green-500/30 rounded-xl bg-gradient-to-br from-green-500/5 to-green-500/10 hover:from-green-500/10 hover:to-green-500/15 transition-all duration-200 cursor-pointer max-w-md w-full" onClick={onStartNewGame}>
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
                <Plus className="w-10 h-10 text-green-600" />
                <div>
                <h2 className="text-2xl font-semibold text-foreground mb-3"> Start New Game</h2>
              </div>
              </div>
              <p className="text-base text-muted-foreground">Create a new poker night and track your game</p>
            </div>
          </Card>
        </div>

        {/* Past Games Section */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-lg font-medium text-foreground">Recent Games</h2>
          </div>
          
          {pastGames.length > 0 ? (
            <div className="space-y-3">
              {pastGames.map((game) => (
                <Card 
                  key={game.id} 
                  className="p-4 border border-border/50 shadow-sm rounded-xl cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => onViewPastGame(game)}
                >
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {formatDate(game.date)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {game.players.length} players
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                          ${game.totalPot}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Total Pot</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center border border-border/50 rounded-xl">
              <div className="text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No games yet</p>
                <p className="text-xs mt-1">Start your first poker night!</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}