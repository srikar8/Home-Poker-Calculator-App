import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { ArrowLeft, Users, DollarSign, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { getGameByCode, joinGameByCode } from '../lib/database';
import type { Game, User } from '../App';

interface JoinGameScreenProps {
  gameCode?: string;
  user: User | null;
  onBack: () => void;
  onJoinGame: (game: Game) => void;
  onLogin: () => void;
}

export const JoinGameScreen: React.FC<JoinGameScreenProps> = ({
  gameCode: initialGameCode,
  user,
  onBack,
  onJoinGame,
  onLogin
}) => {
  const [gameCode, setGameCode] = useState(initialGameCode || '');
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // If gameCode is provided initially, try to load the game
  useEffect(() => {
    if (initialGameCode) {
      handleFindGame(initialGameCode);
    }
  }, [initialGameCode]);

  const handleFindGame = async (code: string) => {
    if (!code.trim()) {
      setError('Please enter a game code');
      return;
    }

    // Check if user is logged in
    if (!user) {
      setError('You must be logged in to join a game. Please login first.');
      return;
    }

    setLoading(true);
    setError(null);
    setGame(null);

    try {
      const foundGame = await getGameByCode(code.toUpperCase());
      if (foundGame) {
        setGame(foundGame);
        setGameCode(code.toUpperCase());
      } else {
        setError('Game not found or expired. Please check the code and try again.');
      }
    } catch (err) {
      setError('Error finding game. Please try again.');
      console.error('Error finding game:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (!user) {
      onLogin();
      return;
    }

    if (!game) {
      setError('Please find a game first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedGame = await joinGameByCode(game.gameCode!, user);
      setSuccess('Successfully joined the game!');
      
      // Wait a moment to show success message, then join the game
      setTimeout(() => {
        onJoinGame(updatedGame!);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error joining game. Please try again.');
      console.error('Error joining game:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Join Game</h1>
        </div>

        {/* Game Code Input */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Enter Game Code</CardTitle>
            <CardDescription>
              {user 
                ? "Ask the host for the 6-character game code"
                : "You must be logged in to join a game. Please login first."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="ABC123"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center text-lg font-mono tracking-wider"
                disabled={loading}
              />
              <Button
                onClick={() => handleFindGame(gameCode)}
                disabled={loading || !gameCode.trim() || !user}
                className="px-6"
              >
                {loading ? 'Finding...' : user ? 'Find Game' : 'Login Required'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error/Success Messages */}
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Game Details */}
        {game && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Game Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Buy-in Amount</p>
                  <p className="font-semibold flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {game.buyInAmount}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Players</p>
                  <p className="font-semibold">
                    {game.players.length}/{game.maxPlayers || 8}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Code Expires</p>
                <p className="font-semibold flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {game.codeExpiresAt ? formatTimeRemaining(game.codeExpiresAt) : 'No expiration'}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Current Players</p>
                <div className="space-y-1">
                  {game.players.map((player) => (
                    <div key={player.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="font-medium">{player.name}</span>
                      <span className="text-sm text-muted-foreground">
                        ${player.buyIn}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Join Button */}
              <Button
                onClick={handleJoinGame}
                disabled={loading || !user || game.players.length >= (game.maxPlayers || 8)}
                className="w-full"
                size="lg"
              >
                {!user ? 'Login to Join' : 
                 game.players.length >= (game.maxPlayers || 8) ? 'Game Full' :
                 loading ? 'Joining...' : 'Join Game'}
              </Button>

              {!user && (
                <p className="text-sm text-muted-foreground text-center">
                  You need to be logged in to join a game
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Join</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {user ? (
              <>
                <p>1. Ask the game host for the 6-character game code</p>
                <p>2. Enter the code above and click "Find Game"</p>
                <p>3. Review the game details</p>
                <p>4. Click "Join Game" to participate</p>
                <p className="pt-2 text-xs">
                  You can also scan a QR code if the host shared one
                </p>
              </>
            ) : (
              <>
                <p>1. Login to your account first</p>
                <p>2. Ask the game host for the 6-character game code</p>
                <p>3. Enter the code and join the game</p>
                <div className="pt-2">
                  <Button onClick={onLogin} className="w-full">
                    Login to Join Games
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
