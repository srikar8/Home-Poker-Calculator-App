import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { ArrowLeft, DollarSign, Users, Clock } from 'lucide-react';
import type { Game, User, Player } from '../App';

interface PlayerGameViewProps {
  game: Game;
  user: User | null;
  onBack: () => void;
}

export const PlayerGameView: React.FC<PlayerGameViewProps> = ({
  game,
  user,
  onBack
}) => {
  // Find the current player's data
  const currentPlayer = game.players.find(p => p.id === `${game.id}_${user?.id}`);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Helper function to extract original user ID from composite player ID
  const getOriginalUserId = (playerId: string) => {
    return playerId.includes('_') ? playerId.split('_')[1] : playerId;
  };

  const getTotalInvested = (player: Player) => {
    return player.buyIn + player.rebuys;
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
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
            <h1 className="text-2xl font-bold">Game in Progress</h1>
            <p className="text-sm text-muted-foreground">
              Game started - {game.players.length} players
            </p>
          </div>
        </div>

        {/* Game Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Game Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Buy-in</p>
                <p className="font-semibold">${game.buyInAmount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Players</p>
                <p className="font-semibold">{game.players.length}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-semibold">{new Date(game.date).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Your Player Info */}
        {currentPlayer && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Your Game Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {getInitials(currentPlayer.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-lg">{currentPlayer.name}</h3>
                    <Badge variant="default">You</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Buy-in:</span>
                      <span className="font-medium">${currentPlayer.buyIn}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Rebuys:</span>
                      <span className="font-medium">${currentPlayer.rebuys}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold border-t pt-1">
                      <span>Total Invested:</span>
                      <span>${getTotalInvested(currentPlayer)}</span>
                    </div>
                    {currentPlayer.cashOut > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Cash Out:</span>
                        <span className="font-medium text-green-600">${currentPlayer.cashOut}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Game Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Game Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-lg font-medium mb-2">Game is Active</p>
              <p className="text-sm text-muted-foreground">
                The host is managing the game. You can see your own progress above.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Only the host can see all players and manage the game.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• The host will manage rebuys and cash-outs</p>
            <p>• You can see your own investment and progress</p>
            <p>• The game will continue until the host ends it</p>
            <p>• You'll be notified when the game is finished</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
