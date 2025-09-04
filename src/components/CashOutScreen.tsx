import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Game, Player } from '../App';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

interface CashOutScreenProps {
  game: Game;
  onBack: () => void;
  onUpdateGame: (game: Game) => void;
  onViewSummary: () => void;
}

export function CashOutScreen({ game, onBack, onUpdateGame, onViewSummary }: CashOutScreenProps) {
  const [cashOutValues, setCashOutValues] = useState<{ [playerId: string]: string }>({});
  const [isCashOutDialogOpen, setIsCashOutDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [tempCashOutValue, setTempCashOutValue] = useState('');

  // Initialize cash out values with 0 for all players
  React.useEffect(() => {
    if (game.players.length > 0) {
      const initialValues: { [playerId: string]: string } = {};
      
      // Check if players already have cashOut values from the game object
      const hasExistingCashOut = game.players.some(player => player.cashOut > 0);
      
      if (hasExistingCashOut) {
        // Use existing cashOut values from the game
        game.players.forEach(player => {
          initialValues[player.id] = player.cashOut.toString();
        });
      } else {
        // Set default values: all players start with 0
        game.players.forEach((player) => {
          initialValues[player.id] = '0';
        });
      }
      
      setCashOutValues(initialValues);
    }
  }, [game.players]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getTotalBuyIn = (player: Player) => {
    // Return the full amount paid by the player (including host fee)
    return player.buyIn + player.rebuys;
  };

  const getTotalPot = () => {
    return game.players.reduce((sum, player) => sum + (player.buyIn + player.rebuys), 0);
  };

  const getTotalHostFees = () => {
    return game.hostFee * game.players.length;
  };

  const getTotalCashOut = (): number => {
    return Object.values(cashOutValues).reduce((sum: number, value: unknown) => {
      const amount = parseFloat(String(value)) || 0;
      return sum + amount;
    }, 0);
  };

  const getNetResult = (player: Player) => {
    const cashOut = parseFloat(cashOutValues[player.id]) || 0;
    const buyIn = getTotalBuyIn(player);
    return cashOut - buyIn;
  };

  const updateCashOut = (playerId: string, value: string) => {
    const newValues = {
      ...cashOutValues,
      [playerId]: value
    };
    
    setCashOutValues(newValues);
    
    // Also update the game object to persist the values
    const updatedGame = {
      ...game,
      players: game.players.map(player => 
        player.id === playerId 
          ? { ...player, cashOut: parseFloat(value) || 0 }
          : player
      )
    };
    onUpdateGame(updatedGame);
  };

  const openCashOutDialog = (player: Player) => {
    console.log('Opening dialog for player:', player.name);
    
    setSelectedPlayer(player);
    setTempCashOutValue(cashOutValues[player.id] || '');
    setIsCashOutDialogOpen(true);
  };

  const saveCashOutValue = () => {
    console.log('Saving cashout value:', tempCashOutValue, 'for player:', selectedPlayer?.name);
    if (selectedPlayer) {
      updateCashOut(selectedPlayer.id, tempCashOutValue);
      setIsCashOutDialogOpen(false);
      setSelectedPlayer(null);
      setTempCashOutValue('');
    }
  };

  const canViewSummary = () => {
    const totalCashOut = getTotalCashOut();
    const totalPot = getTotalPot();
    return Math.abs(totalCashOut - totalPot) < 0.01; // Allow for small rounding differences
  };

  const showConfirmationDialog = () => {
    setIsConfirmationDialogOpen(true);
  };

  const proceedToSummary = () => {
    const updatedGame = {
      ...game,
      players: game.players.map(player => ({
        ...player,
        cashOut: parseFloat(cashOutValues[player.id]) || 0
      })),
      totalPot: getTotalPot()
    };
    onUpdateGame(updatedGame);
    onViewSummary();
    setIsConfirmationDialogOpen(false);
  };

  const cancelConfirmation = () => {
    setIsConfirmationDialogOpen(false);
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
          <div className="flex-1">
            <h1 className="text-lg font-medium">Cash Out</h1>
            <p className="text-sm text-muted-foreground">
              Enter final amounts for each player
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto" style={{ paddingTop: 'var(--header-height, 80px)', paddingBottom: 'var(--bottom-height, 80px)' }}>
        <div className="p-6 space-y-4">
          {/* Pot Summary */}
          <Card className="p-4 border border-border/50 rounded-xl bg-muted/20">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Total Stakes</p>
                  <p className="text-lg font-medium">${getTotalPot()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Cash Out Total</p>
                  <p className={`text-lg font-medium ${
                    getTotalCashOut() === getTotalPot() 
                      ? 'text-green-600' 
                      : 'text-orange-600'
                  }`}>
                    ${getTotalCashOut()}
                  </p>
                </div>
              </div>
              

              
              {getTotalCashOut() !== getTotalPot() && (
                <div className="pt-2 border-t border-border/30">
                  <p className="text-xs text-orange-600">
                    Difference: ${Math.abs(getTotalCashOut() - getTotalPot()).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Players Cash Out */}
          {game.players.map((player, index) => {
            const netResult = getNetResult(player);
            const isProfit = netResult > 0;
            const isComplete = cashOutValues[player.id] && parseFloat(cashOutValues[player.id]) > 0;
            const isHost = player.id.split('_')[1] === game.hostId; // Use the actual hostId from the game
            
            return (
              <Card 
                key={player.id} 
                className="p-4 border border-border/50 rounded-xl transition-colors hover:bg-muted/20 cursor-pointer"
                onClick={() => openCashOutDialog(player)}
              >
                <div className="space-y-3">
                  {/* Player Header */}
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {getInitials(player.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium">{player.name}</h3>
                        {isHost && (
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
                      <p className="text-xs text-muted-foreground">
                        Total buyin: ${getTotalBuyIn(player)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        ${cashOutValues[player.id] || '0'}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Cash Out
                      </p>
                    </div>
                  </div>

                  {/* Net Result */}
                  {isComplete && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                      {isProfit ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`text-sm font-medium ${
                        isProfit ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isProfit ? '+' : ''}${netResult.toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {isProfit ? 'Profit' : 'Loss'}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Bottom Action - Fixed to screen bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-6 border-t border-border/50 bg-background z-10" id="bottom-button">
        <Button
          onClick={showConfirmationDialog}
          disabled={!canViewSummary()}
          className="w-full h-12 text-base rounded-xl"
        >
          {canViewSummary() ? 'View Summary' : 'Balance the amounts first'}
        </Button>
        {!canViewSummary() && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Cash out total must equal the pot total
          </p>
        )}
      </div>

      {/* Cash Out Dialog */}
      <Dialog open={isCashOutDialogOpen} onOpenChange={setIsCashOutDialogOpen}>
        <DialogContent className="max-w-sm rounded-xl" aria-describedby="cash-out-description">
          <DialogHeader>
            <DialogTitle>Update Cash Out Amount</DialogTitle>
            <p id="cash-out-description" className="sr-only">
              Update the cash out amount for the selected player
            </p>
          </DialogHeader>
          <div className="space-y-4">
            {selectedPlayer && (
              <>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(selectedPlayer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{selectedPlayer.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Total buyin: ${getTotalBuyIn(selectedPlayer)}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cash Out Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="0"
                      value={tempCashOutValue}
                      onChange={(e) => setTempCashOutValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && saveCashOutValue()}
                      className="pl-10 rounded-lg"
                    />
                  </div>
                </div>
                
                <Button
                  onClick={saveCashOutValue}
                  disabled={!tempCashOutValue.trim()}
                  className="w-full rounded-lg"
                >
                  Update Amount
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmationDialogOpen} onOpenChange={setIsConfirmationDialogOpen}>
        <DialogContent className="max-w-sm rounded-xl" aria-describedby="confirmation-description">
          <DialogHeader>
            <DialogTitle>Confirm Cash Out</DialogTitle>
            <p id="confirmation-description" className="sr-only">
              Confirm that you want to proceed to the summary and finalize cash out amounts
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to proceed to the summary? This will finalize the cash out amounts for all players.
              </p>
              
              <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Stakes:</span>
                  <span className="font-medium">${getTotalPot()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cash Out Total:</span>
                  <span className="font-medium text-green-600">${getTotalCashOut()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={cancelConfirmation}
                className="flex-1 rounded-lg"
              >
                Keep Editing
              </Button>
              <Button
                onClick={proceedToSummary}
                className="flex-1 rounded-lg"
              >
                Confirm & View Summary
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}