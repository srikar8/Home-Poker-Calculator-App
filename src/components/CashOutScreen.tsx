import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Game, Player } from '../App';

interface CashOutScreenProps {
  game: Game;
  onBack: () => void;
  onUpdateGame: (game: Game) => void;
  onViewSummary: () => void;
}

export function CashOutScreen({ game, onBack, onUpdateGame, onViewSummary }: CashOutScreenProps) {
  const [cashOutValues, setCashOutValues] = useState<{ [playerId: string]: string }>({});

  // Initialize cash out values with total buy-in amounts
  React.useEffect(() => {
    if (game.players.length > 0 && Object.keys(cashOutValues).length === 0) {
      const initialValues: { [playerId: string]: string } = {};
      game.players.forEach(player => {
        const totalBuyIn = getTotalBuyIn(player);
        initialValues[player.id] = totalBuyIn.toString();
      });
      setCashOutValues(initialValues);
    }
  }, [game.players, cashOutValues]);

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

  const getTotalCashOut = () => {
    return Object.values(cashOutValues).reduce((sum, value) => {
      const amount = parseFloat(value) || 0;
      return sum + amount;
    }, 0);
  };

  const getNetResult = (player: Player) => {
    const cashOut = parseFloat(cashOutValues[player.id]) || 0;
    const buyIn = getTotalBuyIn(player);
    return cashOut - buyIn;
  };

  const updateCashOut = (playerId: string, value: string) => {
    setCashOutValues(prev => ({
      ...prev,
      [playerId]: value
    }));
  };

  const canViewSummary = () => {
    const totalCashOut = getTotalCashOut();
    const totalPot = getTotalPot();
    return Math.abs(totalCashOut - totalPot) < 0.01; // Allow for small rounding differences
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
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 bg-background border-b border-border/50">
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

      {/* Pot Summary */}
      <div className="p-6 pb-4">
        <Card className="p-4 border border-border/50 rounded-xl bg-muted/20">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Game Pot</p>
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
      </div>

      {/* Players Cash Out */}
      <div className="flex-1 px-6 space-y-4">
        {game.players.map((player, index) => {
          const netResult = getNetResult(player);
          const isProfit = netResult > 0;
          const isComplete = cashOutValues[player.id] && parseFloat(cashOutValues[player.id]) > 0;
          const isHost = index === 0; // First player is considered the host
          
          return (
            <Card key={player.id} className="p-4 border border-border/50 rounded-xl">
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
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total buyin: ${getTotalBuyIn(player)}
                    </p>
                  </div>
                </div>

                {/* Cash Out Input */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Cash Out Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="0"
                      value={cashOutValues[player.id] || ''}
                      onChange={(e) => updateCashOut(player.id, e.target.value)}
                      className="pl-10 rounded-lg"
                    />
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

      {/* Bottom Action */}
      <div className="p-6 border-t border-border/50">
        <Button
          onClick={proceedToSummary}
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
    </div>
  );
}