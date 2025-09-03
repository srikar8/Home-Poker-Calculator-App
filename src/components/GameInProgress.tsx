import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import { ArrowLeft, Plus, DollarSign, TrendingUp, Clock, User, ChevronDown, ChevronRight, Users, Trash2 } from 'lucide-react';
import { Game, Player, RebuyTransaction } from '../App';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from './ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Label } from './ui/label';

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

// Utility function to get available players from past games (excluding those already in current game)
const getAvailablePastPlayers = (currentPlayers: Player[]): { id: string; name: string; avatar?: string }[] => {
  const allPastPlayers = getUniquePlayersFromPastGames();
  
  // Filter out players who are already in the current game
  return allPastPlayers.filter(pastPlayer => 
    !currentPlayers.some(currentPlayer => 
      currentPlayer.name.toLowerCase() === pastPlayer.name.toLowerCase()
    )
  );
};

interface GameInProgressProps {
  game: Game;
  onBack: () => void;
  onUpdateGame: (game: Game) => void;
  onEndGame: () => void;
  onSaveAndLeave: () => void;
}

export function GameInProgress({ game, onBack, onUpdateGame, onEndGame, onSaveAndLeave }: GameInProgressProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [rebuyAmount, setRebuyAmount] = useState(game.defaultRebuyAmount.toString());
  const [isRebuyDialogOpen, setIsRebuyDialogOpen] = useState(false);
  const [isPlayersListOpen, setIsPlayersListOpen] = useState(false);
  const [isRebuyHistoryOpen, setIsRebuyHistoryOpen] = useState(true);
  const [isAddPlayerDialogOpen, setIsAddPlayerDialogOpen] = useState(false);
  const [isLeaveConfirmationOpen, setIsLeaveConfirmationOpen] = useState(false);
  const [isRemovePlayerDialogOpen, setIsRemovePlayerDialogOpen] = useState(false);
  const [playerToRemove, setPlayerToRemove] = useState<Player | null>(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [selectedPastPlayerId, setSelectedPastPlayerId] = useState<string>('');

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const addRebuy = () => {
    const amount = parseFloat(rebuyAmount);
    const player = game.players.find(p => p.id === selectedPlayerId);
    
    if (amount > 0 && player) {
      const rebuyTransaction: RebuyTransaction = {
        id: Date.now().toString(),
        playerId: selectedPlayerId,
        playerName: player.name,
        amount: amount,
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
      };

      const updatedGame = {
        ...game,
        players: game.players.map(p =>
          p.id === selectedPlayerId
            ? { ...p, rebuys: p.rebuys + amount }
            : p
        ),
        rebuyHistory: [...game.rebuyHistory, rebuyTransaction]
      };
      
      onUpdateGame(updatedGame);
      setSelectedPlayerId('');
      setRebuyAmount(game.defaultRebuyAmount.toString());
      setIsRebuyDialogOpen(false);
    }
  };

  const removeRebuy = (rebuyId: string) => {
    const rebuyToRemove = game.rebuyHistory.find(r => r.id === rebuyId);
    
    if (rebuyToRemove) {
      const updatedGame = {
        ...game,
        players: game.players.map(p =>
          p.id === rebuyToRemove.playerId
            ? { ...p, rebuys: p.rebuys - rebuyToRemove.amount }
            : p
        ),
        rebuyHistory: game.rebuyHistory.filter(r => r.id !== rebuyId)
      };
      
      onUpdateGame(updatedGame);
    }
  };

  const addNewPlayer = () => {
    let playerToAdd: Player | null = null;

    // Check if a past player is selected
    if (selectedPastPlayerId) {
      const availablePastPlayers = getAvailablePastPlayers(game.players);
      const selectedPastPlayer = availablePastPlayers.find(p => p.id === selectedPastPlayerId);
      if (selectedPastPlayer) {
        playerToAdd = {
          id: selectedPastPlayer.id,
          name: selectedPastPlayer.name,
          buyIn: game.buyInAmount, // Full buy-in amount goes to pot
          rebuys: 0,
          cashOut: 0
        };
      }
    }
    // Check if a new player name is entered
    else if (newPlayerName.trim()) {
      playerToAdd = {
        id: Date.now().toString(),
        name: newPlayerName.trim(),
        buyIn: game.buyInAmount, // Full buy-in amount goes to pot
        rebuys: 0,
        cashOut: 0
      };
    }

    if (playerToAdd) {
      const updatedGame = {
        ...game,
        players: [...game.players, playerToAdd]
      };
      
      onUpdateGame(updatedGame);
      // Reset form
      setNewPlayerName('');
      setSelectedPastPlayerId('');
      setIsAddPlayerDialogOpen(false);
    }
  };

  const removePlayer = (player: Player) => {
    setPlayerToRemove(player);
    setIsRemovePlayerDialogOpen(true);
  };

  const confirmRemovePlayer = () => {
    if (playerToRemove) {
      // Remove the player from the game
      const updatedGame = {
        ...game,
        players: game.players.filter(p => p.id !== playerToRemove.id),
        // Also remove any rebuy transactions for this player
        rebuyHistory: game.rebuyHistory.filter(r => r.playerId !== playerToRemove.id)
      };
      
      onUpdateGame(updatedGame);
      setPlayerToRemove(null);
      setIsRemovePlayerDialogOpen(false);
    }
  };

  const getTotalInvested = (player: Player) => {
    return player.buyIn + player.rebuys;
  };

  const getTotalPot = () => {
    return game.players.reduce((sum, player) => sum + (player.buyIn + player.rebuys), 0);
  };

  const getTotalHostFees = () => {
    return game.hostFee * game.players.length;
  };

  const getTotalBoardAmount = () => {
    return game.players.reduce((total, player) => {
      return total + player.buyIn + player.rebuys;
    }, 0);
  };

  const resetAddPlayerForm = () => {
    setNewPlayerName('');
    setSelectedPastPlayerId('');
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
            onClick={() => setIsLeaveConfirmationOpen(true)}
            className="p-2 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-medium">Game in Progress</h1>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto" style={{ paddingTop: 'var(--header-height, 80px)', paddingBottom: 'var(--bottom-height, 80px)' }}>
        <div className="p-6 space-y-4">
          {/* Total Stakes */}
          <Card className="p-4 border border-border/50 rounded-xl bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Total Stakes</p>
                  <p className="text-xs text-muted-foreground">All buy-ins and rebuys</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">${getTotalBoardAmount()}</p>
                <p className="text-xs text-muted-foreground">
                  {game.players.length} player{game.players.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </Card>

          {/* Add New Player and Rebuy Buttons */}
          <div className="flex gap-3">
            <Dialog 
              open={isAddPlayerDialogOpen} 
              onOpenChange={(open) => {
                setIsAddPlayerDialogOpen(open);
                if (!open) {
                  resetAddPlayerForm();
                }
              }}
            >
              <DialogTrigger asChild>
                <Button 
                  className="flex-1 h-12 text-base rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Player
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm rounded-xl" aria-describedby="add-player-description">
                <DialogHeader>
                  <DialogTitle>Add Player</DialogTitle>
                  <p id="add-player-description" className="sr-only">
                    Add a new player to the game or select from past players
                  </p>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Option 1: Add New Player */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Add New Player</Label>
                    <Input
                      placeholder="Enter new player name"
                      value={newPlayerName}
                      onChange={(e) => {
                        setNewPlayerName(e.target.value);
                        // Clear past player selection when typing new name
                        if (e.target.value.trim()) {
                          setSelectedPastPlayerId('');
                        }
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && addNewPlayer()}
                      className="rounded-lg"
                    />
                  </div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  {/* Option 2: Select from Past Players */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Add from Past Games</Label>
                    <Select 
                      value={selectedPastPlayerId} 
                      onValueChange={(value) => {
                        setSelectedPastPlayerId(value);
                        // Clear new player name when selecting past player
                        if (value) {
                          setNewPlayerName('');
                        }
                      }}
                    >
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder="Select a player from past games" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailablePastPlayers(game.players).map((player) => (
                          <SelectItem key={player.id} value={player.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {getInitials(player.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{player.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                        {getAvailablePastPlayers(game.players).length === 0 && (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            No past players available
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Payment Breakdown</Label>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">${game.buyInAmount + game.hostFee}</p>
                          <p className="text-xs text-muted-foreground">Total amount to pay</p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <p>To pot: ${game.buyInAmount}</p>
                          <p>Snack Fund: ${game.hostFee}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={addNewPlayer}
                    disabled={!newPlayerName.trim() && !selectedPastPlayerId}
                    className="w-full rounded-lg"
                  >
                    Add Player
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

                         {/* Add Rebuy Button */}
             <Dialog open={isRebuyDialogOpen} onOpenChange={setIsRebuyDialogOpen}>
               <DialogTrigger asChild>
                 <Button 
                   className="flex-1 h-12 text-base rounded-xl"
                 >
                   <Plus className="w-4 h-4 mr-2" />
                   Rebuy
                 </Button>
               </DialogTrigger>
              <DialogContent className="max-w-sm rounded-xl" aria-describedby="add-rebuy-description">
                <DialogHeader>
                  <DialogTitle>Add Rebuy</DialogTitle>
                  <p id="add-rebuy-description" className="sr-only">
                    Add a rebuy for the selected player
                  </p>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Player</label>
                    <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder="Choose player" />
                      </SelectTrigger>
                      <SelectContent>
                        {game.players.map((player) => (
                          <SelectItem key={player.id} value={player.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-5 h-5">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {getInitials(player.name)}
                                </AvatarFallback>
                              </Avatar>
                              {player.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Amount</label>
                    <Input
                      type="number"
                      placeholder="50"
                      value={rebuyAmount}
                      onChange={(e) => setRebuyAmount(e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  
                  <Button
                    onClick={addRebuy}
                    disabled={!selectedPlayerId || !rebuyAmount || parseFloat(rebuyAmount) <= 0}
                    className="w-full rounded-lg"
                  >
                    Add Rebuy
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Players List - Collapsible */}
          <Collapsible open={isPlayersListOpen} onOpenChange={setIsPlayersListOpen}>
            <CollapsibleTrigger asChild>
              <Card className="p-4 border border-border/50 rounded-xl hover:bg-muted/20 cursor-pointer transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <h3 className="text-sm font-medium">Players</h3>
                      <p className="text-xs text-muted-foreground">
                        {game.players.length} player{game.players.length !== 1 ? 's' : ''} • Total: ${getTotalBoardAmount()}
                      </p>
                    </div>
                  </div>
                  {isPlayersListOpen ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </Card>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="space-y-3 mt-3">
                {game.players.map((player) => (
                  <Card key={player.id} className="p-4 border border-border/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(player.name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium">{player.name}</h3>
                          {player.id === game.hostId && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full dark:bg-green-900/30 dark:text-green-300">
                              Host
                            </span>
                          )}
                          {player.id === game.coHostId && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full dark:bg-green-900/30 dark:text-green-300">
                              Co-host
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col gap-1 mt-1">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Buy-in: ${player.buyIn}</span>
                            <span>Rebuys: ${player.rebuys}</span>
                          </div>
                          <div className="text-sm font-medium text-foreground">
                            Total: ${getTotalInvested(player)}
                          </div>
                        </div>
                      </div>
                      
                      {game.players.length > 2 && player.id !== game.hostId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removePlayer(player);
                          }}
                          className="p-2 h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Rebuy History - Collapsible */}
          {game.rebuyHistory.length > 0 && (
            <Collapsible open={isRebuyHistoryOpen} onOpenChange={setIsRebuyHistoryOpen}>
              <CollapsibleTrigger asChild>
                <Card className="p-4 border border-border/50 rounded-xl hover:bg-muted/20 cursor-pointer transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <h3 className="text-sm font-medium">Rebuy History</h3>
                        <p className="text-xs text-muted-foreground">
                          {game.rebuyHistory.length} rebuy{game.rebuyHistory.length !== 1 ? 's' : ''} • Total: ${game.rebuyHistory.reduce((sum, rebuy) => sum + rebuy.amount, 0)}
                        </p>
                      </div>
                    </div>
                    {isRebuyHistoryOpen ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </Card>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="space-y-2 mt-3">
                  {game.rebuyHistory.slice().reverse().map((rebuy) => (
                    <Card key={rebuy.id} className="p-3 border border-border/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm font-medium">{rebuy.playerName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-green-600">
                            +${rebuy.amount}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {rebuy.timestamp}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRebuy(rebuy.id)}
                            className="p-1 h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </div>

      {/* Bottom Action - Fixed to screen bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-6 border-t border-border/50 bg-background z-10" id="bottom-button">
        <Button
          onClick={onEndGame}
          className="w-full h-12 text-base rounded-xl bg-green-600 hover:bg-green-700"
        >
          End Game & Cash Out
        </Button>
      </div>

      {/* Leave Game Confirmation Dialog */}
      <Dialog open={isLeaveConfirmationOpen} onOpenChange={setIsLeaveConfirmationOpen}>
        <DialogContent className="max-w-sm rounded-xl" aria-describedby="leave-game-description">
          <DialogHeader>
            <DialogTitle>Leave Game?</DialogTitle>
            <p id="leave-game-description" className="sr-only">
              Confirm whether to leave the game and save progress
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your game progress will be automatically saved. You can resume this game anytime from the home screen.
            </p>
            <div className="p-3 bg-blue-50/50 rounded-lg">
              <div className="text-sm">
                <p className="font-medium text-blue-900">Current Game Status:</p>
                <p className="text-blue-700">{game.players.length} players • ${game.players.reduce((sum, p) => sum + p.buyIn + p.rebuys, 0)} total stakes</p>
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsLeaveConfirmationOpen(false)}
              className="flex-1"
            >
              Continue Game
            </Button>
            <Button
              onClick={() => {
                setIsLeaveConfirmationOpen(false);
                onSaveAndLeave();
              }}
              className="flex-1"
            >
              Save & Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Player Confirmation Dialog */}
      <Dialog open={isRemovePlayerDialogOpen} onOpenChange={setIsRemovePlayerDialogOpen}>
        <DialogContent className="max-w-sm rounded-xl max-h-[80vh] overflow-y-auto" aria-describedby="remove-player-description">
          <DialogHeader>
            <DialogTitle>Remove Player</DialogTitle>
            <p id="remove-player-description" className="sr-only">
              Confirm removal of the selected player from the game
            </p>
          </DialogHeader>
          <div className="space-y-4">
            {playerToRemove && (
              <>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(playerToRemove.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{playerToRemove.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Total invested: ${getTotalInvested(playerToRemove)}
                    </p>
                  </div>
                </div>
                
                <div className="p-3 bg-red-50/50 rounded-lg">
                  <p className="text-sm text-red-700">
                    <strong>Warning:</strong> This will permanently remove {playerToRemove.name} from the game and delete all their rebuy history. This action cannot be undone.
                  </p>
                </div>
              </>
            )}
          </div>
          <div className="mt-6 pt-4 border-t border-border/30">
            <Button
              onClick={confirmRemovePlayer}
              className="w-full h-10 !bg-red-600 hover:!bg-red-700 text-white font-medium border-red-600"
            >
              Remove Player
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}