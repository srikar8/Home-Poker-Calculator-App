import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import { ArrowLeft, Plus, DollarSign, TrendingUp, Clock, User } from 'lucide-react';
import { Game, Player, RebuyTransaction } from '../App';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

interface GameInProgressProps {
  game: Game;
  onBack: () => void;
  onUpdateGame: (game: Game) => void;
  onEndGame: () => void;
}

export function GameInProgress({ game, onBack, onUpdateGame, onEndGame }: GameInProgressProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [rebuyAmount, setRebuyAmount] = useState('50');
  const [isRebuyDialogOpen, setIsRebuyDialogOpen] = useState(false);

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
      setRebuyAmount('50');
      setIsRebuyDialogOpen(false);
    }
  };

  const getTotalInvested = (player: Player) => {
    return player.buyIn + player.rebuys;
  };

  const getTotalPot = () => {
    return game.players.reduce((sum, player) => sum + getTotalInvested(player), 0);
  };

  const getTotalHostFees = () => {
    return game.hostFee * game.players.length;
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
            <h1 className="text-lg font-medium">Game in Progress</h1>
          </div>
          
          {/* Add Rebuy Button */}
          <Dialog open={isRebuyDialogOpen} onOpenChange={setIsRebuyDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="px-3 py-2 rounded-lg"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Rebuy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm rounded-xl">
              <DialogHeader>
                <DialogTitle>Add Rebuy</DialogTitle>
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
      </div>

      {/* Players List */}
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        <div className="space-y-4">
          {game.players.map((player) => (
            <Card key={player.id} className="p-4 border border-border/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {getInitials(player.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h3 className="text-sm font-medium">{player.name}</h3>
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
              </div>
            </Card>
          ))}
        </div>

        {/* Rebuy History */}
        {game.rebuyHistory.length > 0 && (
          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-medium">Rebuy History</h2>
            </div>
            
            <div className="space-y-2">
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
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action */}
      <div className="p-6 border-t border-border/50">
        <Button
          onClick={onEndGame}
          className="w-full h-12 text-base rounded-xl bg-green-600 hover:bg-green-700"
        >
          End Game & Cash Out
        </Button>
      </div>
    </div>
  );
}