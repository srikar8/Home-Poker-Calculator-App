import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { ArrowLeft, Plus, X, Users, DollarSign } from 'lucide-react';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Game } from '../App';

interface NewGameSetupProps {
  onBack: () => void;
  onStartGame: (players: { id: string; name: string; avatar?: string }[], buyInAmount: number, hostFee: number, defaultRebuyAmount: number, hostId: string) => void;
}

// Utility function to extract unique players from past games, excluding demo games
const getUniquePlayersFromPastGames = (): { id: string; name: string; avatar?: string }[] => {
  try {
    const savedPastGames = localStorage.getItem('pastGames');
    if (!savedPastGames) return [];
    
    const pastGames: Game[] = JSON.parse(savedPastGames);
    
    // Filter out demo games (games with id '1' or '2')
    const nonDemoGames = pastGames.filter(game => game.id !== '1' && game.id !== '2');
    
    // Extract all players from non-demo games
    const allPlayers = nonDemoGames.flatMap(game => 
      game.players.map(player => ({
        id: player.id,
        name: player.name,
        avatar: player.avatar
      }))
    );
    
    // Remove duplicates based on player name (case-insensitive)
    const uniquePlayers = allPlayers.filter((player, index, self) => 
      index === self.findIndex(p => p.name.toLowerCase() === player.name.toLowerCase())
    );
    
    return uniquePlayers;
  } catch (error) {
    console.error('Error loading players from past games:', error);
    return [];
  }
};

// Utility function to get the most recent game's settings
const getMostRecentGameSettings = (): { buyInAmount: number; hostFee: number; defaultRebuyAmount: number } | null => {
  try {
    const savedPastGames = localStorage.getItem('pastGames');
    if (!savedPastGames) return null;
    
    const pastGames: Game[] = JSON.parse(savedPastGames);
    
    // Filter out demo games (games with id '1' or '2')
    const nonDemoGames = pastGames.filter(game => game.id !== '1' && game.id !== '2');
    
    if (nonDemoGames.length === 0) return null;
    
    // Get the most recent game (first in the array since they're stored newest first)
    const mostRecentGame = nonDemoGames[0];
    
    return {
      buyInAmount: mostRecentGame.buyInAmount,
      hostFee: mostRecentGame.hostFee,
      defaultRebuyAmount: mostRecentGame.defaultRebuyAmount
    };
  } catch (error) {
    console.error('Error loading settings from past games:', error);
    return null;
  }
};

export function NewGameSetup({ onBack, onStartGame }: NewGameSetupProps) {
  const [players, setPlayers] = useState<{ id: string; name: string; avatar?: string }[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [buyInAmount, setBuyInAmount] = useState('50');
  const [hostFee, setHostFee] = useState('5');
  const [defaultRebuyAmount, setDefaultRebuyAmount] = useState('50');
  const [selectedHostId, setSelectedHostId] = useState<string>('');
  const [isAddPlayerDialogOpen, setIsAddPlayerDialogOpen] = useState(false);
  const [isGameStakesDialogOpen, setIsGameStakesDialogOpen] = useState(false);

  const [autoPopulated, setAutoPopulated] = useState(false);

  // Auto-populate players and game settings from past games on component mount
  useEffect(() => {
    const pastPlayers = getUniquePlayersFromPastGames();
    const recentSettings = getMostRecentGameSettings();
    
    if (pastPlayers.length > 0) {
      setPlayers(pastPlayers);
      // Set the first player as host by default
      setSelectedHostId(pastPlayers[0].id);
      setAutoPopulated(true);
    }
    
    // Auto-populate game settings from the most recent game
    if (recentSettings) {
      setBuyInAmount(recentSettings.buyInAmount.toString());
      setHostFee(recentSettings.hostFee.toString());
      setDefaultRebuyAmount(recentSettings.defaultRebuyAmount.toString());
    }
  }, []);

  const addPlayer = () => {
    if (newPlayerName.trim()) {
      const newPlayer = {
        id: Date.now().toString(),
        name: newPlayerName.trim(),
        avatar: undefined
      };
      const updatedPlayers = [...players, newPlayer];
      setPlayers(updatedPlayers);
      
      // Set the first player as host by default only if no host is currently selected
      if (updatedPlayers.length === 1 || selectedHostId === '') {
        setSelectedHostId(newPlayer.id);
      }
      
      setNewPlayerName('');
      setIsAddPlayerDialogOpen(false);
    }
  };

  const removePlayer = (playerId: string) => {
    const updatedPlayers = players.filter(p => p.id !== playerId);
    setPlayers(updatedPlayers);
    
    // If the removed player was the host, set the first remaining player as host
    if (playerId === selectedHostId && updatedPlayers.length > 0) {
      setSelectedHostId(updatedPlayers[0].id);
    } else if (updatedPlayers.length === 0) {
      setSelectedHostId('');
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const canStartGame = players.length >= 2 && selectedHostId !== '' && parseFloat(buyInAmount) > 0 && parseFloat(hostFee) >= 0;

  const getTotalPlayerCost = () => {
    const buyIn = parseFloat(buyInAmount) || 0;
    const fee = parseFloat(hostFee) || 0;
    return buyIn + fee; // Players pay buy-in + host fee
  };

  const getEffectiveBuyIn = () => {
    return parseFloat(buyInAmount) || 0; // Full buy-in amount goes to the pot
  };

  const getTotalPotContribution = () => {
    return getEffectiveBuyIn() * players.length;
  };

  const getTotalHostFeeCollection = () => {
    const fee = parseFloat(hostFee) || 0;
    return fee * players.length;
  };

  // Calculate header and bottom heights for proper spacing
  useEffect(() => {
    const updateSpacing = () => {
      const header = document.getElementById('header') as HTMLElement;
      const bottomButton = document.getElementById('bottom-button') as HTMLElement;
      
      if (header) {
        const headerHeight = header.offsetHeight;
        document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
      }
      
      if (bottomButton) {
        const bottomHeight = bottomButton.offsetHeight;
        document.documentElement.style.setProperty('--bottom-height', `${bottomHeight}px`);
      }
    };

    updateSpacing();
    window.addEventListener('resize', updateSpacing);
    
    return () => window.removeEventListener('resize', updateSpacing);
  }, []);

  return (
    <div className="h-screen flex flex-col">
      {/* Header - Fixed to screen top */}
      <div className="fixed top-0 left-0 right-0 p-4 bg-background border-b border-border/50 z-10" id="header">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-medium">New Game Setup</h1>
            <p className="text-sm text-muted-foreground">Configure game settings</p>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto" style={{ paddingTop: 'var(--header-height, 80px)', paddingBottom: 'var(--bottom-height, 80px)' }}>
        <div className="p-6 space-y-6">
          {/* Game Stakes */}
          <Card className="p-4 border border-border/50 rounded-xl">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-medium">Game Stakes</h2>
              </div>
              
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Label htmlFor="buy-in-amount" className="text-xs text-muted-foreground mb-1 block">
                    Buy-in
                  </Label>
                  <Input
                    id="buy-in-amount"
                    type="number"
                    placeholder="50"
                    value={buyInAmount}
                    onChange={(e) => setBuyInAmount(e.target.value)}
                    className="h-8 text-sm rounded-md border-border/50"
                  />
                </div>
                
                <div className="flex-1">
                  <Label htmlFor="host-fee" className="text-xs text-muted-foreground mb-1 block">
                    Host Fee
                  </Label>
                  <Input
                    id="host-fee"
                    type="number"
                    placeholder="5"
                    value={hostFee}
                    onChange={(e) => setHostFee(e.target.value)}
                    className="h-8 text-sm rounded-md border-border/50"
                  />
                </div>

                <div className="flex-1">
                  <Label htmlFor="default-rebuy" className="text-xs text-muted-foreground mb-1 block">
                    Rebuy
                  </Label>
                  <Input
                    id="default-rebuy"
                    type="number"
                    placeholder="50"
                    value={defaultRebuyAmount}
                    onChange={(e) => setDefaultRebuyAmount(e.target.value)}
                    className="h-8 text-sm rounded-md border-border/50"
                  />
                </div>
              </div>
              
              {players.length > 0 && (
                <div className="pt-2 border-t border-border/30">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Per player pays:</span>
                      <span className="font-medium">${getTotalPlayerCost()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">BuyIn per player:</span>
                      <span className="font-medium">${getEffectiveBuyIn()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Stakes:</span>
                      <span className="font-medium text-blue-600">${getTotalPotContribution()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Host fees:</span>
                      <span className="font-medium text-green-600">${getTotalHostFeeCollection()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

                     {/* Add Player Dialog */}
           <Dialog open={isAddPlayerDialogOpen} onOpenChange={setIsAddPlayerDialogOpen}>
             <DialogTrigger asChild>
               <Button 
                 className="w-full h-12 text-base rounded-xl"
               >
                 <Plus className="w-4 h-4 mr-2" />
                 Add Player
               </Button>
             </DialogTrigger>
             <DialogContent className="max-w-sm rounded-xl">
               <DialogHeader>
                 <DialogTitle>Add New Player</DialogTitle>
               </DialogHeader>
               <div className="space-y-4">
                 <div className="space-y-2">
                   <label className="text-sm font-medium">Player Name</label>
                   <Input
                     placeholder="Enter player name"
                     value={newPlayerName}
                     onChange={(e) => setNewPlayerName(e.target.value)}
                     onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                     className="rounded-lg"
                   />
                 </div>
                 
                 <Button
                   onClick={addPlayer}
                   disabled={!newPlayerName.trim()}
                   className="w-full rounded-lg"
                 >
                   Add Player
                 </Button>
               </div>
             </DialogContent>
           </Dialog>

          {/* Players List */}
          {players.length > 0 && (
            <Card className="p-4 border border-border/50 rounded-xl">
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Select Host</h3>
                  {autoPopulated && (
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      Auto-filled from past games
                    </Badge>
                  )}
                </div>
                {players.map((player) => (
                  <div key={player.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/20">
                    <input
                      type="radio"
                      id={`host-${player.id}`}
                      name="host"
                      value={player.id}
                      checked={selectedHostId === player.id}
                      onChange={(e) => setSelectedHostId(e.target.value)}
                      className="w-4 h-4 text-primary border-border/50 focus:ring-primary"
                    />
                    <label htmlFor={`host-${player.id}`} className="flex items-center gap-3 flex-1 cursor-pointer">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(player.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{player.name}</span>
                      {selectedHostId === player.id && (
                        <Badge variant="default" className="text-xs">
                          Host
                        </Badge>
                      )}
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePlayer(player.id)}
                      className="p-1 rounded-full text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}


          {/* Auto-populated message */}
          {autoPopulated && players.length > 0 && (
            <div className="text-center py-2">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Players and game settings from your most recent game have been automatically loaded. You can modify them as needed.
              </p>
            </div>
          )}

          {/* Minimum players message */}
          {players.length === 1 && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                Add at least one more player to start the game
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action - Fixed to screen bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-6 border-t border-border/50 bg-background z-10" id="bottom-button">
        <Button
          onClick={() => onStartGame(players, parseFloat(buyInAmount), parseFloat(hostFee), parseFloat(defaultRebuyAmount), selectedHostId)}
          disabled={!canStartGame}
          className="w-full h-12 text-base rounded-xl"
        >
          Start Game
          {players.length > 0 && (
            <span className="ml-2 text-sm opacity-75">
              ({players.length} players • ${getTotalPlayerCost()} each)
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}