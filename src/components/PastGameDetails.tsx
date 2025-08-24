import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { ArrowLeft, TrendingUp, TrendingDown, Calculator, Trophy, DollarSign, Users, Calendar, ArrowRight } from 'lucide-react';
import { Game, Player } from '../App';

interface PastGameDetailsProps {
  game: Game;
  onBack: () => void;
}

interface Transaction {
  from: Player;
  to: Player;
  amount: number;
}

export function PastGameDetails({ game, onBack }: PastGameDetailsProps) {
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

  // Calculate simplified debts using a greedy algorithm (like Splitwise)
  const calculateSimplifiedDebts = (): Transaction[] => {
    // Calculate net results for all players (including host fees)
    const netResults = game.players.map(player => ({
      player,
      netResult: getNetResult(player)
    }));
    
    // Separate creditors and debtors
    const creditors = netResults.filter(r => r.netResult > 0.01).sort((a, b) => b.netResult - a.netResult);
    const debtors = netResults.filter(r => r.netResult < -0.01).sort((a, b) => a.netResult - b.netResult);
    
    const transactions: Transaction[] = [];
    let creditorIndex = 0;
    let debtorIndex = 0;
    
    // Create arrays to track remaining amounts
    const creditorAmounts = creditors.map(r => r.netResult);
    const debtorAmounts = debtors.map(r => Math.abs(r.netResult));
    
    while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
      const creditor = creditors[creditorIndex].player;
      const debtor = debtors[debtorIndex].player;
      
      const creditorAmount = creditorAmounts[creditorIndex];
      const debtorAmount = debtorAmounts[debtorIndex];
      
      const transactionAmount = Math.min(creditorAmount, debtorAmount);
      
      if (transactionAmount > 0.01) { // Avoid tiny amounts due to floating point precision
        transactions.push({
          from: debtor,
          to: creditor,
          amount: transactionAmount
        });
      }
      
      // Update the remaining amounts
      creditorAmounts[creditorIndex] -= transactionAmount;
      debtorAmounts[debtorIndex] -= transactionAmount;
      
      // Move to next creditor or debtor
      if (creditorAmounts[creditorIndex] <= 0.01) {
        creditorIndex++;
      }
      if (debtorAmounts[debtorIndex] <= 0.01) {
        debtorIndex++;
      }
    }
    
    return transactions;
  };

  const sortedPlayers = [...game.players].sort((a, b) => getNetResult(b) - getNetResult(a));
  const biggestWinner = getBiggestWinner();
  const simplifiedTransactions = game.settlementTransactions || calculateSimplifiedDebts();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
            <h1 className="text-lg font-medium">Game Details</h1>
            <p className="text-sm text-muted-foreground">
              {formatDate(game.date)}
            </p>
          </div>
        </div>
      </div>

      {/* Game Overview */}
      <div className="p-6 pb-4 space-y-4">
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

        {/* Game Settings */}
        <Card className="p-4 border border-border/50 rounded-xl">
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Game Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Buy-in</p>
                  <p className="text-sm font-medium">${game.buyInAmount}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Host Fee</p>
                  <p className="text-sm font-medium">${game.hostFee}</p>
                </div>
              </div>
            </div>
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
                  <h3 className="text-sm font-medium">{player.name}</h3>
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



      {/* Simplified Transactions */}
      {simplifiedTransactions.length > 0 && (
        <div className="p-6 pt-4">
          <Card className="p-4 border border-border/50 rounded-xl">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Final Settlements</h3>
              <p className="text-xs text-muted-foreground">
                {simplifiedTransactions.length} transaction{simplifiedTransactions.length !== 1 ? 's' : ''} needed
              </p>
              <div className="space-y-2">
                {simplifiedTransactions.map((transaction, index) => (
                  <div key={index} className="flex items-center gap-4 p-2 bg-muted/30 rounded-lg">
                    {/* From Player */}
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="bg-red-100 text-red-700 text-xs dark:bg-red-950 dark:text-red-300">
                          {getInitials(transaction.from.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{transaction.from.name}</span>
                    </div>

                    {/* Arrow and Amount */}
                    <div className="flex-1 flex items-center justify-center gap-2">
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <Badge variant="outline" className="text-xs font-medium px-2 py-1">
                        ${transaction.amount.toFixed(2)}
                      </Badge>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    </div>

                    {/* To Player */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{transaction.to.name}</span>
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="bg-green-100 text-green-700 text-xs dark:bg-green-950 dark:text-green-300">
                          {getInitials(transaction.to.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Rebuy History */}
      {game.rebuyHistory.length > 0 && (
        <div className="p-6 pt-4">
          <Card className="p-4 border border-border/50 rounded-xl">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Rebuy History</h3>
              <div className="space-y-2">
                {game.rebuyHistory.map((rebuy) => (
                  <div key={rebuy.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{rebuy.playerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-green-600">
                        +${rebuy.amount}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {rebuy.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
