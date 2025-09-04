import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { ArrowLeft, Users, Copy, Check, QrCode, Clock, Share2, RefreshCw } from 'lucide-react';
import QRCode from 'react-qr-code';
import { supabase } from '../lib/supabase';
import type { Game, User, Player } from '../App';

interface GameLobbyProps {
  game: Game;
  user: User | null;
  onBack: () => void;
  onStartGame: () => void;
  onUpdateGame?: (game: Game) => void;
  onNavigateToPlayerView?: () => void;
}

export const GameLobby: React.FC<GameLobbyProps> = ({
  game,
  user,
  onBack,
  onStartGame,
  onUpdateGame,
  onNavigateToPlayerView
}) => {
  const [players, setPlayers] = useState<Player[]>(game.players);
  const [copied, setCopied] = useState(false);
  const [joinUrl, setJoinUrl] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const isHost = user?.id === game.hostId;

  // Update players state when game prop changes
  useEffect(() => {
    setPlayers(game.players);
  }, [game.players]);

  // Redirect non-host players to player view if game has started
  useEffect(() => {
    if (game.gameStarted && !isHost && onNavigateToPlayerView) {
      onNavigateToPlayerView();
    }
  }, [game.gameStarted, isHost, onNavigateToPlayerView]);

  useEffect(() => {
    // Set the join URL using path-based format
    const baseUrl = window.location.origin;
    setJoinUrl(`${baseUrl}/join/${game.gameCode}`);
  }, [game.gameCode]);

  // Function to refresh game data
  const refreshGameData = async () => {
    setRefreshing(true);
    try {
      const { getGameByCode } = await import('../lib/database');
      const updatedGame = await getGameByCode(game.gameCode!);
      if (updatedGame) {
        setPlayers(updatedGame.players);
        setLastUpdated(new Date());
        // Also update the main game state if callback is provided
        if (onUpdateGame) {
          onUpdateGame(updatedGame);
        }
      }
    } catch (error) {
      console.error('Error fetching updated game data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Set up real-time subscription for player updates
  useEffect(() => {
    if (!game.id) return;

    const channel = supabase
      .channel(`game-${game.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `game_id=eq.${game.id}`
        },
        async (payload) => {
          console.log('Player update received:', payload);
          await refreshGameData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${game.id}`
        },
        async (payload) => {
          console.log('Game update received:', payload);
          await refreshGameData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [game.id, game.gameCode]);

  // Set up polling as a fallback for real-time updates
  useEffect(() => {
    if (!game.id || !game.gameCode) return;

    // Poll every 5 seconds to check for updates (less aggressive to avoid too many requests)
    const pollInterval = setInterval(async () => {
      console.log('Polling for game updates...');
      await refreshGameData();
    }, 5000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [game.id, game.gameCode]);

  const copyGameCode = async () => {
    try {
      await navigator.clipboard.writeText(game.gameCode || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy game code:', err);
    }
  };

  const copyJoinUrl = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy join URL:', err);
    }
  };

  const shareGame = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join My Poker Game',
          text: `Join my poker game! Code: ${game.gameCode}`,
          url: joinUrl
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to copying URL
      copyJoinUrl();
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Helper function to extract original user ID from composite player ID
  const getOriginalUserId = (playerId: string) => {
    return playerId.includes('_') ? playerId.split('_')[1] : playerId;
  };

  const canStartGame = players.length >= 2;

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
            <h1 className="text-2xl font-bold">Game Lobby</h1>
            <p className="text-sm text-muted-foreground">
              {players.length === 1 ? 'Share the QR code to invite players' : 'Waiting for players to join'}
            </p>
          </div>
        </div>

        {/* Game Code Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Game Code
            </CardTitle>
            <CardDescription>
              {game.gameStarted 
                ? "Game has started - no new players can join"
                : "Share this code or QR code with players to join"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-mono font-bold tracking-wider bg-muted p-4 rounded-lg mb-4">
                {game.gameCode}
              </div>
              <Button
                onClick={copyGameCode}
                variant="outline"
                className="w-full"
                disabled={game.gameStarted}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </>
                )}
              </Button>
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg">
                <QRCode
                  value={joinUrl}
                  size={200}
                  level="M"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={copyJoinUrl}
                variant="outline"
                className="w-full"
                disabled={game.gameStarted}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Join Link
              </Button>
              <Button
                onClick={shareGame}
                variant="outline"
                className="w-full"
                disabled={game.gameStarted}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Game
              </Button>
            </div>

            {game.codeExpiresAt && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatTimeRemaining(game.codeExpiresAt)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Game Details */}
        <Card>
          <CardHeader>
            <CardTitle>Game Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Buy-in</p>
                <p className="font-semibold">${game.buyInAmount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Snack Fund</p>
                <p className="font-semibold">${game.hostFee}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Max Players</p>
              <p className="font-semibold">{game.maxPlayers || 8}</p>
            </div>
          </CardContent>
        </Card>

        {/* Players List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Players ({players.length}/{game.maxPlayers || 8})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshGameData}
                disabled={refreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {players.map((player) => (
                <div key={player.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(player.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{player.name}</p>
                    <p className="text-sm text-muted-foreground">${player.buyIn} buy-in</p>
                  </div>
                  {getOriginalUserId(player.id) === game.hostId && (
                    <Badge variant="default">Host</Badge>
                  )}
                  {getOriginalUserId(player.id) === game.coHostId && (
                    <Badge variant="secondary">Co-host</Badge>
                  )}
                </div>
              ))}
              
              {players.length < (game.maxPlayers || 8) && (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    Waiting for {game.maxPlayers! - players.length} more player{game.maxPlayers! - players.length !== 1 ? 's' : ''}...
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Start Game Button */}
        {isHost && (
          <div className="space-y-4">
            {players.length < 2 && (
              <Alert>
                <AlertDescription>
                  Waiting for players to join. You need at least 2 players to start the game.
                </AlertDescription>
              </Alert>
            )}
            
            <Button
              onClick={onStartGame}
              disabled={players.length < 2}
              className="w-full"
              size="lg"
            >
              {players.length >= 2 ? 'Start Game' : 'Waiting for Players...'}
              {players.length > 0 && (
                <span className="ml-2 text-sm opacity-75">
                  ({players.length} player{players.length !== 1 ? 's' : ''})
                </span>
              )}
            </Button>
          </div>
        )}

        {/* Instructions for non-hosts */}
        {!isHost && (
          <Card>
            <CardHeader>
              <CardTitle>Waiting for Host</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                The host will start the game when all players have joined.
                You'll be automatically taken to the game when it begins.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
