import React, { useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { ArrowLeft, TrendingUp, TrendingDown, Calculator, Trophy } from 'lucide-react';
import { Game, Player } from '../App';

interface GameSummaryProps {
  game: Game;
  onBack: () => void;
  onSimplifyDebts: () => void;
}

export function GameSummary({ game, onBack, onSimplifyDebts }: GameSummaryProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getTotalInvested = (player: Player) => {
    // Return the full amount paid by the player (including host fee)
    return game.buyInAmount + player.rebuys;
  };

  const getNetResult = (player: Player) => {
    return player.cashOut - getTotalInvested(player);
  };

  const getTotalPot = () => {
    return game.players.reduce((sum, player) => sum + (player.buyIn + player.rebuys), 0);
  };

  const getTotalHostFees = () => {
    return game.hostFee * game.players.length;
  };

  const getBiggestWinner = () => {
    return game.players.reduce((biggest, player) => {
      const currentNet = getNetResult(player);
      const biggestNet = getNetResult(biggest);
      return currentNet > biggestNet ? player : biggest;
    });
  };

  const sortedPlayers = [...game.players].sort((a, b) => getNetResult(b) - getNetResult(a));
  const biggestWinner = getBiggestWinner();

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
            <h1 className="text-lg font-medium">Game Summary</h1>
            <p className="text-sm text-muted-foreground">
              Final results and breakdown
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto" style={{ paddingTop: 'var(--header-height, 80px)', paddingBottom: 'var(--bottom-height, 80px)' }}>
        <div className="p-6 space-y-4">
          {/* Summary Stats */}
          <Card className="p-4 border border-border/50 rounded-xl bg-muted/20">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-medium">${getTotalPot() + getTotalHostFees()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Players</p>
                  <p className="text-2xl font-medium">{game.players.length}</p>
                </div>
              </div>
              
              {game.hostFee > 0 && (
                <div className="pt-2 border-t border-border/30">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Game Pot:</span>
                    <span className="text-sm font-medium">
                      ${getTotalPot()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Host fees:</span>
                    <span className="text-sm font-medium text-green-600">
                      ${getTotalHostFees()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    (Total = Game Pot + Host Fees)
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Biggest Winner */}
          {getNetResult(biggestWinner) > 0 && (
            <Card className="p-4 border border-green-200/50 rounded-xl bg-green-50/50 dark:bg-green-950/20 dark:border-green-800/30">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Biggest Winner
                  </p>
                  <p className="text-lg font-medium text-green-900 dark:text-green-100">
                    {biggestWinner.name} (+${getNetResult(biggestWinner).toFixed(2)})
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Players Results */}
        <div className="px-6 space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-medium">Player Results</h2>
          </div>

          {sortedPlayers.map((player, index) => {
            const netResult = getNetResult(player);
            const isProfit = netResult > 0;
            const totalInvested = getTotalInvested(player);
            const isHost = game.hostId === player.id; // Check if this player is the host using the actual hostId
            
            return (
              <Card key={player.id} className="p-4 border border-border/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {getInitials(player.name)}
                      </AvatarFallback>
                    </Avatar>
                    {player.id === game.hostId && isProfit && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                        <Trophy className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium">{player.name}</h3>
                      {isHost && (
                        <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/30">
                          Host
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">
                        In: ${totalInvested}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Out: ${player.cashOut}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      {isProfit ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`font-medium ${
                        isProfit ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isProfit ? '+' : ''}${netResult.toFixed(2)}
                      </span>
                    </div>
                    <Badge 
                      variant={isProfit ? "default" : "destructive"}
                      className="text-xs mt-1"
                    >
                      {isProfit ? 'Profit' : 'Loss'}
                    </Badge>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Bottom Action - Fixed to screen bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-6 border-t border-border/50 bg-background z-10" id="bottom-button">
        <Button
          onClick={onSimplifyDebts}
          className="w-full h-12 text-base rounded-xl bg-blue-600 hover:bg-blue-700"
        >
          Simplify Debts
        </Button>
      </div>
    </div>
  );
}