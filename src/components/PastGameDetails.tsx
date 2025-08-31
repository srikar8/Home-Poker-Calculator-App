import React, { useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { ArrowLeft, TrendingUp, TrendingDown, Calculator, Trophy, DollarSign, Users, Calendar, ArrowRight, RefreshCw, Download, Trash2, X } from 'lucide-react';
import { Game, Player } from '../App';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';

interface PastGameDetailsProps {
  game: Game;
  onBack: () => void;
  onDeleteGame: (gameId: string) => void;
}

interface Transaction {
  from: Player;
  to: Player;
  amount: number;
}

export function PastGameDetails({ game, onBack, onDeleteGame }: PastGameDetailsProps) {
  const printableContentRef = useRef<HTMLDivElement>(null);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Helper function to identify demo/sample games
  const isDemoGame = (game: Game) => {
    return game.id === '1' || game.id === '2';
  };

  const downloadResults = async () => {
    console.log('Download button clicked!');
    
    if (!printableContentRef.current) {
      console.error('❌ Printable content ref is not available');
      return;
    }

    console.log('✅ Ref found, starting image generation...');
    console.log('📏 Element dimensions:', {
      scrollHeight: printableContentRef.current.scrollHeight,
      scrollWidth: printableContentRef.current.scrollWidth,
      offsetHeight: printableContentRef.current.offsetHeight,
      offsetWidth: printableContentRef.current.offsetWidth
    });

    try {
      console.log('📦 Loading html2canvas...');
      const html2canvas = (await import('html2canvas')).default;
      console.log('✅ html2canvas loaded successfully');
      
      // Add a small delay to ensure styles are loaded
      console.log('⏳ Waiting for styles to load...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('📸 Starting canvas capture...');
      const canvas = await html2canvas(printableContentRef.current, {
        backgroundColor: '#ffffff',
        scale: 1,
        useCORS: true,
        allowTaint: false,
        logging: false,
        removeContainer: true,
        ignoreElements: (element) => {
          // Skip SVG elements and style/script tags that cause oklch issues
          return element.tagName === 'STYLE' || 
                 element.tagName === 'SCRIPT' || 
                 element.tagName === 'svg' || 
                 element.tagName === 'SVG';
        },
        onclone: (clonedDoc) => {
          // Remove ALL existing stylesheets
          const existingStyles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
          existingStyles.forEach(style => style.remove());
          
          // Remove all SVG elements that might have problematic CSS
          const svgs = clonedDoc.querySelectorAll('svg');
          svgs.forEach(svg => svg.remove());
          
          // Apply comprehensive CSS that matches the original layout
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * {
              box-sizing: border-box;
            }
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              background: white;
              color: rgb(15, 23, 42);
              line-height: 1.5;
            }
            
            /* Spacing utilities */
            .space-y-4 > * + * { margin-top: 1rem; }
            .space-y-3 > * + * { margin-top: 0.75rem; }
            .space-y-2 > * + * { margin-top: 0.5rem; }
            
            /* Padding */
            .p-6 { padding: 1.5rem; }
            .p-4 { padding: 1rem; }
            .p-2 { padding: 0.5rem; }
            .pb-4 { padding-bottom: 1rem; }
            .pt-2 { padding-top: 0.5rem; }
            .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
            .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
            
            /* Margins */
            .mt-1 { margin-top: 0.25rem; }
            .mb-1 { margin-top: 0.25rem; }
            .mb-4 { margin-bottom: 1rem; }
            
            /* Typography */
            .text-2xl { font-size: 1.5rem; line-height: 2rem; font-weight: 500; }
            .text-lg { font-size: 1.125rem; line-height: 1.75rem; font-weight: 500; }
            .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
            .text-xs { font-size: 0.75rem; line-height: 1rem; }
            .font-medium { font-weight: 500; }
            
            /* Colors */
            .text-muted-foreground { color: rgb(100, 116, 139); }
            .text-green-600 { color: rgb(22, 163, 74); }
            .text-green-700 { color: rgb(21, 128, 61); }
            .text-green-800 { color: rgb(22, 101, 52); }
            .text-green-900 { color: rgb(20, 83, 45); }
            .text-red-600 { color: rgb(220, 38, 38); }
            .text-yellow-500 { color: rgb(234, 179, 8); }
            .text-primary { color: rgb(59, 130, 246); }
            
            /* Backgrounds */
            .bg-white { background-color: white; }
            .bg-muted\\/20, .bg-gray-50 { background-color: rgb(248, 250, 252); }
            .bg-green-50 { background-color: rgb(240, 253, 244); }
            .bg-green-100 { background-color: rgb(220, 252, 231); }
            .bg-green-950 { background-color: rgb(5, 46, 22); }
            .bg-red-100 { background-color: rgb(254, 226, 226); }
            .bg-red-950 { background-color: rgb(69, 10, 10); }
            .bg-primary\\/10 { background-color: rgb(219, 234, 254); }
            .bg-yellow-500 { background-color: rgb(234, 179, 8); }
            
            /* Layout */
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .justify-center { justify-content: center; }
            .items-center { align-items: center; }
            .items-start { align-items: flex-start; }
            .flex-1 { flex: 1 1 0%; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .relative { position: relative; }
            .absolute { position: absolute; }
            
            /* Gaps */
            .gap-1 { gap: 0.25rem; }
            .gap-2 { gap: 0.5rem; }
            .gap-3 { gap: 0.75rem; }
            .gap-4 { gap: 1rem; }
            
            /* Borders and Radius */
            .border { border: 1px solid rgb(226, 232, 240); }
            .border-t { border-top: 1px solid rgb(226, 232, 240); }
            .border-green-200 { border: 1px solid rgb(187, 247, 208); }
            .border-green-800 { border: 1px solid rgb(22, 101, 52); }
            .rounded-xl { border-radius: 0.75rem; }
            .rounded-lg { border-radius: 0.5rem; }
            .rounded-full { border-radius: 9999px; }
            
            /* Sizing */
            .w-2 { width: 0.5rem; }
            .h-2 { height: 0.5rem; }
            .w-4 { width: 1rem; }
            .h-4 { height: 1rem; }
            .w-6 { width: 1.5rem; }
            .h-6 { height: 1.5rem; }
            .w-8 { width: 2rem; }
            .h-8 { height: 2rem; }
            .w-10 { width: 2.5rem; }
            .h-10 { height: 2.5rem; }
            .w-12 { width: 3rem; }
            .h-12 { height: 3rem; }
            
            /* Positioning */
            .-top-1 { top: -0.25rem; }
            .-right-1 { right: -0.25rem; }
            
            /* Dark mode support (for avatar fallbacks) */
            @media (prefers-color-scheme: dark) {
              .dark\\:bg-green-950 { background-color: rgb(5, 46, 22); }
              .dark\\:text-green-300 { color: rgb(134, 239, 172); }
              .dark\\:bg-red-950 { background-color: rgb(69, 10, 10); }
              .dark\\:text-red-300 { color: rgb(252, 165, 165); }
              .dark\\:border-green-800 { border-color: rgb(22, 101, 52); }
            }
          `;
          clonedDoc.head.appendChild(style);
        }
      });
      
      console.log('✅ Canvas generated successfully:', canvas.width, 'x', canvas.height);
      
      // Create download link
      const link = document.createElement('a');
      link.download = `poker-game-${game.date}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      console.log('🎉 Image download initiated successfully!');
      
    } catch (error) {
      console.error('❌ Image generation failed:', error);
      console.log('🔄 Falling back to text download...');
      
      // Fallback to text download
      const element = document.createElement('a');
      const file = new Blob([`Poker Game Results\n\nDate: ${formatDate(game.date)}\n\n` + 
        game.players.map(p => {
          const net = getNetResult(p);
          return `${p.name}: ${net >= 0 ? '+$' : '-$'}${Math.abs(net).toFixed(2)}`;
        }).join('\n')], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `poker-game-${game.date}.txt`;
      element.click();
      console.log('📄 Text fallback download completed');
    }
  };

  const getTotalInvested = (player: Player) => {
    // Return the full amount paid by the player (including host fee)
    return game.buyInAmount + game.hostFee + player.rebuys;
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
            {isDemoGame(game) && (
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                Demo game - cannot be deleted
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadResults}
            className="p-2 rounded-full"
          >
            <Download className="w-5 h-5" />
          </Button>
          
          {/* Only show delete button for non-demo games */}
          {!isDemoGame(game) && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Game</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this game? This action cannot be undone and will permanently remove the game from your history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <Button 
                    onClick={() => onDeleteGame(game.id)}
                    variant="destructive"
                  >
                    Delete Game
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Printable Content */}
      <div ref={printableContentRef} className="bg-white">
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
            <div className="flex justify-between items-start">
              <div className="text-center flex-1">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Buy-in</p>
                </div>
                <p className="text-sm font-medium">${game.buyInAmount}</p>
              </div>
              <div className="text-center flex-1">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Host Fee</p>
                </div>
                <p className="text-sm font-medium">${game.hostFee}</p>
              </div>
              <div className="text-center flex-1">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <RefreshCw className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Rebuy</p>
                </div>
                <p className="text-sm font-medium">${game.defaultRebuyAmount}</p>
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
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium">{player.name}</h3>
                    {player.id === game.hostId && (
                      <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/30">
                        Host
                      </Badge>
                    )}
                    {player.id === game.coHostId && (
                      <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/30">
                        Co-host
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
    </div>
  );
}
