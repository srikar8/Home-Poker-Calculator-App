import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Users, DollarSign, Calendar, Play, Eye, Clock, CheckCircle } from 'lucide-react';
import type { Game, User } from '../App';

interface ViewMyGameScreenProps {
  user: User | null;
  currentGame: Game | null;
  pastGames: Game[];
  onBack: () => void;
  onResumeGame: () => void;
  onViewPastGame: (game: Game) => void;
}

export const ViewMyGameScreen: React.FC<ViewMyGameScreenProps> = ({
  user,
  currentGame,
  pastGames,
  onBack,
  onResumeGame,
  onViewPastGame
}) => {
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

  const getTotalInvested = (game: Game) => {
    return game.players.reduce((sum, player) => sum + (player.buyIn + player.rebuys), 0);
  };

  const getTotalCashOut = (game: Game) => {
    return game.players.reduce((sum, player) => sum + player.cashOut, 0);
  };

  const isDemoGame = (game: Game) => {
    return game.id === '1' || game.id === '2';
  };

  const realPastGames = pastGames.filter(game => !isDemoGame(game));

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">View My Game</h1>
            <p className="text-sm text-muted-foreground">
              {user ? `Welcome back, ${user.name?.split(' ')[0] || 'User'}!` : 'Your poker games'}
            </p>
          </div>
        </div>

        {/* Current Game Section */}
        {currentGame && currentGame.isActive && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-green-600" />
                    Current Game
                  </CardTitle>
                  <CardDescription>
                    Your active poker game
                  </CardDescription>
                </div>
                <Badge variant="default" className="bg-green-500 text-white">
                  In Progress
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-semibold">{formatDate(currentGame.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Players</p>
                    <p className="font-semibold">{currentGame.players.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Current Pot</p>
                    <p className="font-semibold">${getCurrentPot()}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Buy-in Amount</p>
                    <p className="font-semibold">${currentGame.buyInAmount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Host Fee</p>
                    <p className="font-semibold">${currentGame.hostFee}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={onResumeGame} className="w-full" size="lg">
                  <Play className="h-4 w-4 mr-2" />
                  Resume Game
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Past Games Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Past Games
            </CardTitle>
            <CardDescription>
              {realPastGames.length > 0 
                ? `You've hosted ${realPastGames.length} game${realPastGames.length !== 1 ? 's' : ''}`
                : 'No past games yet'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {realPastGames.length > 0 ? (
              <div className="space-y-4">
                {realPastGames.map((game) => (
                  <Card 
                    key={game.id} 
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onViewPastGame(game)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{formatDate(game.date)}</h3>
                            <Badge variant="secondary" className="text-xs">
                              Completed
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{game.players.length} players</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              <span>${game.buyInAmount} buy-in</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              <span>${getTotalInvested(game)} invested</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              <span>${getTotalCashOut(game)} cashed out</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">No past games yet</h3>
                <p className="text-sm text-muted-foreground">
                  Start your first poker game to see it here!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats Summary */}
        {realPastGames.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{realPastGames.length}</p>
                  <p className="text-sm text-muted-foreground">Games Hosted</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">
                    ${realPastGames.reduce((sum, game) => sum + getTotalInvested(game), 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Invested</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">
                    ${realPastGames.reduce((sum, game) => sum + getTotalCashOut(game), 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Cashed Out</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
