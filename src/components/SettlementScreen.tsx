import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { ArrowLeft, ArrowRight, Share, RefreshCw, CheckCircle } from 'lucide-react';
import { Game, Player } from '../App';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

interface SettlementScreenProps {
  game: Game;
  onBack: () => void;
  onFinishGame: (gameWithSettlements: Game) => void;
}

interface Transaction {
  from: Player;
  to: Player;
  amount: number;
}

export function SettlementScreen({ game, onBack, onFinishGame }: SettlementScreenProps) {
  const [showSimplified, setShowSimplified] = useState(true);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getTotalInvested = (player: Player) => {
    // Return the full amount paid by the player (including host fee)
    return game.buyInAmount + player.rebuys;
  };

  const getNetResult = (player: Player) => {
    const isHost = player.id === game.hostId; // Use the actual hostId from the game
    const hostFees = isHost ? (game.hostFee * game.players.length) : 0;
    return (player.cashOut + hostFees) - getTotalInvested(player);
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

  // Calculate all individual debts (every debtor pays every creditor proportionally)
  const calculateFullDebts = (): Transaction[] => {
    const transactions: Transaction[] = [];
    const creditors = game.players.filter(p => getNetResult(p) > 0);
    const debtors = game.players.filter(p => getNetResult(p) < 0);
    
    debtors.forEach(debtor => {
      const debtorAmount = Math.abs(getNetResult(debtor));
      creditors.forEach(creditor => {
        const creditorAmount = getNetResult(creditor);
        const totalCreditorAmount = creditors.reduce((sum, c) => sum + getNetResult(c), 0);
        const proportionalAmount = (creditorAmount / totalCreditorAmount) * debtorAmount;
        
        if (proportionalAmount > 0.01) {
          transactions.push({
            from: debtor,
            to: creditor,
            amount: proportionalAmount
          });
        }
      });
    });
    
    return transactions;
  };

  const simplifiedTransactions = calculateSimplifiedDebts();
  const fullTransactions = calculateFullDebts();
  const transactions = showSimplified ? simplifiedTransactions : fullTransactions;

  const shareResults = () => {
    const totalAmount = game.players.reduce((sum, p) => sum + getTotalInvested(p), 0);
    const hostFees = game.hostFee * game.players.length;
    const gamePot = totalAmount - hostFees;
    
    const summary = `Poker Game Results\n\n` +
      `Total Amount: $${totalAmount}\n` +
      `Game Pot: $${gamePot}\n` +
      `Host Fees: $${hostFees}\n` +
      `Players: ${game.players.length}\n\n` +
      `Results:\n` +
      game.players.map(p => {
        const net = getNetResult(p);
        return `${p.name}: ${net >= 0 ? '+' : ''}$${net.toFixed(2)}`;
      }).join('\n') +
      `\n\nSettlements:\n` +
      transactions.map(t => 
        `${t.from.name} pays ${t.to.name} $${t.amount.toFixed(2)}`
      ).join('\n');
    
    if (navigator.share) {
      navigator.share({
        title: 'Poker Game Results',
        text: summary
      });
    } else {
      navigator.clipboard.writeText(summary);
      // Could show a toast here
    }
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
            <h1 className="text-lg font-medium">Settlement</h1>
            <p className="text-sm text-muted-foreground">
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} needed
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={shareResults}
            className="p-2 rounded-full"
          >
            <Share className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto" style={{ paddingTop: 'var(--header-height, 80px)', paddingBottom: 'var(--bottom-height, 80px)' }}>
        <div className="p-6 space-y-4">
          {/* Toggle */}
          <Card className="p-4 border border-border/50 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="simplified-mode" className="text-sm font-medium">
                  Simplified Debts
                </Label>
                <p className="text-xs text-muted-foreground">
                  {showSimplified 
                    ? `Minimized to ${simplifiedTransactions.length} transactions`
                    : `All individual debts (${fullTransactions.length} transactions)`
                  }
                </p>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
                <Switch
                  id="simplified-mode"
                  checked={showSimplified}
                  onCheckedChange={setShowSimplified}
                />
              </div>
            </div>
          </Card>

          {/* Transactions */}
          {transactions.length > 0 ? (
            transactions.map((transaction, index) => (
              <Card key={index} className="p-4 border border-border/50 rounded-xl">
                <div className="flex items-center gap-4">
                  {/* From Player */}
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-red-100 text-red-700 text-xs dark:bg-red-950 dark:text-red-300">
                        {getInitials(transaction.from.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{transaction.from.name}</span>
                  </div>

                  {/* Arrow and Amount */}
                  <div className="flex-1 flex items-center justify-center gap-2">
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <Badge variant="outline" className="text-sm font-medium px-3 py-1">
                      ${transaction.amount.toFixed(2)}
                    </Badge>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>

                  {/* To Player */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{transaction.to.name}</span>
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-green-100 text-green-700 text-xs dark:bg-green-950 dark:text-green-300">
                        {getInitials(transaction.to.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center border border-border/50 rounded-xl">
              <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-4" />
              <p className="text-lg font-medium">All Settled!</p>
              <p className="text-sm text-muted-foreground mt-1">
                No money needs to change hands
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Bottom Actions - Fixed to screen bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-6 border-t border-border/50 bg-background z-10 space-y-3" id="bottom-button">
        {transactions.length > 0 && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              {showSimplified 
                ? `Reduced from ${fullTransactions.length} to ${simplifiedTransactions.length} transactions`
                : 'Showing all individual settlements'
              }
            </p>
          </div>
        )}
        
        <Button
          onClick={() => {
            const gameWithSettlements = {
              ...game,
              settlementTransactions: simplifiedTransactions,
              isActive: false
            };
            onFinishGame(gameWithSettlements);
          }}
          className="w-full h-12 text-base rounded-xl bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Finish Game
        </Button>
      </div>
    </div>
  );
}