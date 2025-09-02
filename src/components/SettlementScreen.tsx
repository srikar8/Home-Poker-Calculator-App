import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { ArrowLeft, ArrowRight, Share, RefreshCw, CheckCircle, Plus, Trash2, Users, Copy } from 'lucide-react';
import { Game, Player } from '../App';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';

interface SettlementScreenProps {
  game: Game;
  onBack: () => void;
  onFinishGame: (gameWithSettlements: Game) => void;
  onUpdateGame?: (game: Game) => void; // Added for saving pre-existing transactions
}

interface Transaction {
  from: Player;
  to: Player;
  amount: number;
}

export function SettlementScreen({ game, onBack, onFinishGame, onUpdateGame }: SettlementScreenProps) {
  const [showSimplified, setShowSimplified] = useState(true);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showPlayerSummaries, setShowPlayerSummaries] = useState(false);
  const [preExistingTransactions, setPreExistingTransactions] = useState<{ id: string; from: Player; to: Player; amount: number; description: string }[]>(
    game.preExistingTransactions || []
  );
  const [newTransaction, setNewTransaction] = useState({
    fromId: '',
    toId: '',
    amount: '',
    description: ''
  });
  const [showAddTransactionDialog, setShowAddTransactionDialog] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 3);
  };

  const getShortName = (name: string) => {
    return name.length > 3 ? name.substring(0, 3) + '...' : name;
  };

  const getTotalInvested = (player: Player) => {
    // Return the full amount paid by the player (including host fee)
    return game.buyInAmount + game.hostFee + player.rebuys;
  };

  const getNetResult = (player: Player) => {
    const isHost = player.id === game.hostId; // Use the actual hostId from the game
    const hostFees = isHost ? (game.hostFee * game.players.length) : 0;
    return (player.cashOut + hostFees) - getTotalInvested(player);
  };

  // Calculate simplified debts using a greedy algorithm (like Splitwise)
  const calculateSimplifiedDebts = (): Transaction[] => {
    // Calculate net results for all players (including host fees)
    let adjustedNetResults = game.players.map(player => ({
      player,
      netResult: getNetResult(player)
    }));
    
    // Apply pre-existing transactions to adjust net results
    preExistingTransactions.forEach(transaction => {
      const fromPlayer = adjustedNetResults.find(r => r.player.id === transaction.from.id);
      const toPlayer = adjustedNetResults.find(r => r.player.id === transaction.to.id);
      
      if (fromPlayer && toPlayer) {
        fromPlayer.netResult += transaction.amount; // Debtor owes less
        toPlayer.netResult -= transaction.amount;  // Creditor gets less
      }
    });
    
    // Separate creditors and debtors
    const creditors = adjustedNetResults.filter(r => r.netResult > 0.01).sort((a, b) => b.netResult - a.netResult);
    const debtors = adjustedNetResults.filter(r => r.netResult < -0.01).sort((a, b) => a.netResult - b.netResult);
    
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
    // Calculate adjusted net results including pre-existing transactions
    let adjustedNetResults = game.players.map(player => ({
      player,
      netResult: getNetResult(player)
    }));
    
    // Apply pre-existing transactions to adjust net results
    preExistingTransactions.forEach(transaction => {
      const fromPlayer = adjustedNetResults.find(r => r.player.id === transaction.from.id);
      const toPlayer = adjustedNetResults.find(r => r.player.id === transaction.to.id);
      
      if (fromPlayer && toPlayer) {
        fromPlayer.netResult += transaction.amount; // Debtor owes less
        toPlayer.netResult -= transaction.amount;  // Creditor gets less
      }
    });
    
    const transactions: Transaction[] = [];
    const creditors = adjustedNetResults.filter(r => r.netResult > 0.01).map(r => r.player);
    const debtors = adjustedNetResults.filter(r => r.netResult < -0.01).map(r => r.player);
    
    debtors.forEach(debtor => {
      const debtorResult = adjustedNetResults.find(r => r.player.id === debtor.id);
      if (!debtorResult) return;
      
      const debtorAmount = Math.abs(debtorResult.netResult);
      creditors.forEach(creditor => {
        const creditorResult = adjustedNetResults.find(r => r.player.id === creditor.id);
        if (!creditorResult) return;
        
        const creditorAmount = creditorResult.netResult;
        const totalCreditorAmount = adjustedNetResults
          .filter(r => r.netResult > 0.01)
          .reduce((sum, r) => sum + r.netResult, 0);
        
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

  // Calculate individual player summaries
  const calculatePlayerSummaries = () => {
    const summaries = game.players.map(player => {
      const netResult = getNetResult(player);
      const isCreditor = netResult > 0.01;
      const isDebtor = netResult < -0.01;
      
      // Get settlement transactions where this player is involved
      const playerTransactions = transactions.filter(t => 
        t.from.id === player.id || t.to.id === player.id
      );
      
      // Get pre-existing transactions where this player is involved
      const playerPreExistingTransactions = preExistingTransactions.filter(t => 
        t.from.id === player.id || t.to.id === player.id
      );
      
      // Calculate what they owe to others (from settlement transactions)
      const owesToSettlement = playerTransactions
        .filter(t => t.from.id === player.id)
        .map(t => ({
          player: t.to,
          amount: t.amount,
          type: 'settlement'
        }));
      
      // Calculate what they owe to others (from pre-existing transactions)
      const owesToPreExisting = playerPreExistingTransactions
        .filter(t => t.from.id === player.id)
        .map(t => ({
          player: t.to,
          amount: t.amount,
          type: 'pre-existing',
          description: t.description
        }));
      
      // Combine all what they owe
      const owesTo = [...owesToSettlement, ...owesToPreExisting];
      
      // Calculate what others owe them (from settlement transactions)
      const owedBySettlement = playerTransactions
        .filter(t => t.to.id === player.id)
        .map(t => ({
          player: t.from,
          amount: t.amount,
          type: 'settlement'
        }));
      
      // Calculate what others owe them (from pre-existing transactions)
      const owedByPreExisting = playerPreExistingTransactions
        .filter(t => t.to.id === player.id)
        .map(t => ({
          player: t.from,
          amount: t.amount,
          type: 'pre-existing',
          description: t.description
        }));
      
      // Combine all what they're owed
      const owedBy = [...owedBySettlement, ...owedByPreExisting];
      
      const totalOwes = owesTo.reduce((sum, t) => sum + t.amount, 0);
      const totalOwed = owedBy.reduce((sum, t) => sum + t.amount, 0);
      
      return {
        player,
        netResult,
        isCreditor,
        isDebtor,
        owesTo,
        owedBy,
        totalOwes,
        totalOwed
      };
    });
    
    return summaries;
  };

  const playerSummaries = calculatePlayerSummaries().filter(summary => 
    summary.owesTo.length > 0 || summary.owedBy.length > 0
  );

  const copyPlayerSummary = (summary: any) => {
    const { player, netResult, owesTo, owedBy, totalOwes, totalOwed } = summary;
    
    let summaryText = `${player.name}'s Settlement Summary\n\n`;
    summaryText += `Net Result: ${netResult >= 0 ? '+' : ''}$${netResult.toFixed(2)}\n\n`;
    
    if (owesTo.length > 0) {
      summaryText += `You need to pay:\n`;
      owesTo.forEach(({ player: toPlayer, amount }) => {
        summaryText += `• ${toPlayer.name}: $${amount.toFixed(2)}\n`;
      });
      summaryText += `Total to pay: $${totalOwes.toFixed(2)}\n\n`;
    }
    
    if (owedBy.length > 0) {
      summaryText += `You will receive:\n`;
      owedBy.forEach(({ player: fromPlayer, amount }) => {
        summaryText += `• ${fromPlayer.name}: $${amount.toFixed(2)}\n`;
      });
      summaryText += `Total to receive: $${totalOwed.toFixed(2)}\n\n`;
    }
    
    if (owesTo.length === 0 && owedBy.length === 0) {
      summaryText += `No money needs to change hands for you.`;
    }
    
    navigator.clipboard.writeText(summaryText);
    // Could show a toast here
  };

  const shareToWhatsApp = (summary: any) => {
    const { player, netResult, owesTo, owedBy, totalOwes, totalOwed } = summary;
    
    let summaryText = `${player.name}'s Settlement Summary\n\n`;
    summaryText += `Net Result: ${netResult >= 0 ? '+' : ''}$${netResult.toFixed(2)}\n\n`;
    
    if (owedBy.length > 0) {
      const hasPreExisting = owedBy.some(t => t.type === 'pre-existing');
      summaryText += `${hasPreExisting ? 'You received:' : 'You will receive:'}\n`;
      owedBy.forEach(({ player: fromPlayer, amount, type, description }) => {
        let line = `• ${fromPlayer.name}: $${amount.toFixed(2)}`;
        if (type === 'pre-existing' && description) {
          line += ` (${description})`;
        }
        if (type === 'pre-existing') {
          line += ` [Pre-sent]`;
        }
        summaryText += line + '\n';
      });
      summaryText += `Total: $${totalOwed.toFixed(2)}\n\n`;
    }
    
    if (owesTo.length > 0) {
      const hasPreExisting = owesTo.some(t => t.type === 'pre-existing');
      summaryText += `${hasPreExisting ? 'You need to pay:' : 'You need to pay:'}\n`;
      owesTo.forEach(({ player: toPlayer, amount, type, description }) => {
        let line = `• ${toPlayer.name}: $${amount.toFixed(2)}`;
        if (type === 'pre-existing' && description) {
          line += ` (${description})`;
        }
        if (type === 'pre-existing') {
          line += ` [Pre-sent]`;
        }
        summaryText += line + '\n';
      });
      summaryText += `Total: $${totalOwes.toFixed(2)}\n\n`;
    }
    
    if (owesTo.length === 0 && owedBy.length === 0) {
      summaryText += `No money needs to change hands for you.`;
    }
    
    // Create WhatsApp share URL
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(summaryText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const addPreExistingTransaction = () => {
    if (!newTransaction.fromId || !newTransaction.toId || !newTransaction.amount) return;

    const fromPlayer = game.players.find(p => p.id === newTransaction.fromId);
    const toPlayer = game.players.find(p => p.id === newTransaction.toId);

    if (!fromPlayer || !toPlayer) return;

    const newId = Date.now().toString();
    const newTransactionItem = {
      id: newId,
      from: fromPlayer,
      to: toPlayer,
      amount: parseFloat(newTransaction.amount),
      description: newTransaction.description || ''
    };
    
    const updatedTransactions = [...preExistingTransactions, newTransactionItem];
    setPreExistingTransactions(updatedTransactions);
    
    // Update the game object with the new pre-existing transaction
    const updatedGame = {
      ...game,
      preExistingTransactions: updatedTransactions
    };
    
    // Call the onUpdateGame prop to save the changes
    if (onUpdateGame) {
      onUpdateGame(updatedGame);
    }
    
    setNewTransaction({ fromId: '', toId: '', amount: '', description: '' });
    setShowAddTransactionDialog(false);
  };

  const removePreExistingTransaction = (id: string) => {
    const updatedTransactions = preExistingTransactions.filter(t => t.id !== id);
    setPreExistingTransactions(updatedTransactions);
    
    // Update the game object by removing the transaction
    const updatedGame = {
      ...game,
      preExistingTransactions: updatedTransactions
    };
    
    // Call the onUpdateGame prop to save the changes
    if (onUpdateGame) {
      onUpdateGame(updatedGame);
    }
  };

  const resetNewTransaction = () => {
    setNewTransaction({ fromId: '', toId: '', amount: '', description: '' });
    setShowAddTransactionDialog(false);
  };

  const shareResults = () => {
    const totalAmount = game.players.reduce((sum, p) => sum + getTotalInvested(p), 0);
    const hostFees = game.hostFee * game.players.length;
    const gamePot = totalAmount - hostFees;
    
    let summary = `Poker Game Results\n\n` +
      `Total Amount: $${totalAmount}\n` +
      `Game Pot: $${gamePot}\n` +
      `Host Fees: $${hostFees}\n` +
      `Players: ${game.players.length}\n\n` +
      `Results:\n` +
      game.players.map(p => {
        const net = getNetResult(p);
        return `${p.name}: ${net >= 0 ? '+' : ''}$${net.toFixed(2)}`;
      }).join('\n');
    // Add rebuy history to the share summary if available
    if (game.rebuyHistory && game.rebuyHistory.length > 0) {
      summary += `\n\nRebuy History:\n` +
        game.rebuyHistory
          .map(rebuy => `${rebuy.playerName}: +$${rebuy.amount} (${rebuy.timestamp})`)
          .join('\n');
    }
    // Add pre-existing transactions to the share results
    if (preExistingTransactions.length > 0) {
      summary += `\n\nPre-Sent Transactions:\n` +
        preExistingTransactions.map(t => 
          `${t.from.name} → ${t.to.name}: $${t.amount.toFixed(2)}${t.description ? ` (${t.description})` : ''}`
        ).join('\n');
    }
    
    summary += `\n\nFinal Settlements:\n` +
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
              {showPlayerSummaries 
                ? `${game.players.length} player summaries`
                : `${transactions.length} transaction${transactions.length !== 1 ? 's' : ''} needed`
              }
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
          {/* Pre-existing Transactions Section */}
          <Card className="p-4 border border-border/50 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium">Pre-Sent Transactions</h3>
                <p className="text-sm text-muted-foreground">
                  Money already sent between players during the game
                </p>
                {preExistingTransactions.length > 0 && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Total: ${preExistingTransactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)} already settled
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 py-1"
                onClick={() => setShowAddTransactionDialog(true)}
              >
                <Plus className="w-3 h-3" />
                <span className="hidden sm:inline ml-1">Add Transaction</span>
              </Button>
            </div>

            {/* Pre-existing Transactions List */}
            {preExistingTransactions.length > 0 ? (
              <div className="space-y-2">
                {preExistingTransactions.map((transaction) => (
                  <Card key={transaction.id} className="p-3 border border-border/50 rounded-lg">
                    <div className="flex items-center justify-between gap-3">
                      {/* Left side: From -> Arrow -> To */}
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-sm font-medium">{getShortName(transaction.from.name)}</span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium">{getShortName(transaction.to.name)}</span>
                      </div>
                      
                      {/* Right side: amount + delete */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="text-sm font-medium px-3 py-1">
                          ${transaction.amount.toFixed(2)}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePreExistingTransaction(transaction.id)}
                          className="p-1 h-6 w-6 shrink-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Description if exists */}
                    {transaction.description && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {transaction.description}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No pre-sent transactions yet
              </p>
            )}
          </Card>

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

          {/* Player Summaries Toggle */}
          <Card className="p-4 border border-border/50 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="player-summaries-mode" className="text-sm font-medium">
                  WhatsApp Player Summaries
                </Label>
                <p className="text-xs text-muted-foreground">
                  {showPlayerSummaries 
                    ? `${playerSummaries.length} player summaries`
                    : `${transactions.length} transaction${transactions.length !== 1 ? 's' : ''} needed`
                  }
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <Switch
                  id="player-summaries-mode"
                  checked={showPlayerSummaries}
                  onCheckedChange={setShowPlayerSummaries}
                />
              </div>
            </div>
          </Card>

          {/* Conditional Content: Transactions or Player Summaries */}
          {showPlayerSummaries ? (
            /* Player Summaries */
            <div className="space-y-4">
              {playerSummaries.map((summary, index) => (
                <Card key={index} className="p-4 border border-border/50 rounded-xl">
                  {/* Player Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className={`text-sm font-medium ${
                          summary.netResult >= 0 
                            ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                        }`}>
                          {getInitials(summary.player.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{summary.player.name}</h3>
                        <p className={`text-sm font-medium ${
                          summary.netResult >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {summary.netResult >= 0 ? '+' : ''}${summary.netResult.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareToWhatsApp(summary)}
                      className="h-8 px-3"
                    >
                      <Share className="w-3 h-3 mr-1" />
                      Share
                    </Button>
                  </div>

                  {/* Settlement Details */}
                  <div className="space-y-3">
                    {summary.owedBy.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                          {summary.owedBy.some(t => t.type === 'pre-existing') ? 'You received:' : 'You will receive:'}
                        </h4>
                        <div className="space-y-2">
                          {summary.owedBy.map(({ player: fromPlayer, amount, type, description }, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{fromPlayer.name}</span>
                                {type === 'pre-existing' && description && (
                                  <span className="text-xs text-muted-foreground">{description}</span>
                                )}
                                {type === 'pre-existing' && (
                                  <Badge variant="secondary" className="text-xs mt-1 w-fit">Pre-sent</Badge>
                                )}
                              </div>
                              <Badge variant="outline" className="text-green-600 dark:text-green-400">
                                ${amount.toFixed(2)}
                              </Badge>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 text-right">
                          <Badge variant="outline" className="text-green-600 dark:text-green-400">
                            Total: ${summary.totalOwed.toFixed(2)}
                          </Badge>
                        </div>
                      </div>
                    )}

                    {summary.owesTo.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                          {summary.owesTo.some(t => t.type === 'pre-existing') ? 'You need to pay:' : 'You need to pay:'}
                        </h4>
                        <div className="space-y-2">
                          {summary.owesTo.map(({ player: toPlayer, amount, type, description }, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950/20 rounded-lg">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{toPlayer.name}</span>
                                {type === 'pre-existing' && description && (
                                  <span className="text-xs text-muted-foreground">{description}</span>
                                )}
                                {type === 'pre-existing' && (
                                  <Badge variant="secondary" className="text-xs mt-1 w-fit">Pre-sent</Badge>
                                )}
                              </div>
                              <Badge variant="outline" className="text-red-600 dark:text-red-400">
                                ${amount.toFixed(2)}
                              </Badge>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 text-right">
                          <Badge variant="outline" className="text-red-600 dark:text-red-400">
                            Total: ${summary.totalOwes.toFixed(2)}
                          </Badge>
                        </div>
                      </div>
                    )}


                  </div>
                </Card>
              ))}
            </div>
          ) : (
            /* Transactions */
            <>
              {transactions.length > 0 ? (
                transactions.map((transaction, index) => (
                  <Card key={index} className="p-4 border border-border/50 rounded-xl">
                    <div className="flex items-center gap-4">
                      {/* From Player */}
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8 shrink-0">
                          <AvatarFallback className="bg-red-100 text-red-700 text-xs dark:bg-red-950 dark:text-red-300">
                            {getInitials(transaction.from.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{transaction.from.name.slice(0, 3)}</span>
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
                        <Avatar className="w-8 h-8 shrink-0">
                          <AvatarFallback className="bg-green-100 text-green-700 text-xs dark:bg-green-950 dark:text-green-300">
                            {getInitials(transaction.to.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{transaction.to.name.slice(0, 3)}</span>
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
            </>
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
              preExistingTransactions: preExistingTransactions,
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

      {/* Add Transaction Dialog */}
      <Dialog open={showAddTransactionDialog} onOpenChange={setShowAddTransactionDialog}>
        <DialogContent className="sm:max-w-md" aria-describedby="add-transaction-description">
          <DialogHeader>
            <DialogTitle>Add Pre-Sent Transaction</DialogTitle>
            <p id="add-transaction-description" className="sr-only">
              Add a pre-existing transaction between players
            </p>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from-player">From</Label>
                <Select value={newTransaction.fromId} onValueChange={(value) => setNewTransaction({...newTransaction, fromId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select player" />
                  </SelectTrigger>
                  <SelectContent>
                    {game.players.map(player => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="to-player">To</Label>
                <Select value={newTransaction.toId} onValueChange={(value) => setNewTransaction({...newTransaction, toId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select player" />
                  </SelectTrigger>
                  <SelectContent>
                    {game.players.map(player => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  type="text"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  placeholder="e.g., Venmo, Cash"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetNewTransaction}>
              Cancel
            </Button>
            <Button onClick={addPreExistingTransaction}>
              Add Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}