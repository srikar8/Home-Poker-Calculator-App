import React, { useState } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { NewGameSetup } from './components/NewGameSetup';
import { GameInProgress } from './components/GameInProgress';
import { CashOutScreen } from './components/CashOutScreen';
import { GameSummary } from './components/GameSummary';
import { SettlementScreen } from './components/SettlementScreen';
import { PastGameDetails } from './components/PastGameDetails';

export type Screen = 'home' | 'newGame' | 'gameInProgress' | 'cashOut' | 'summary' | 'settlement' | 'pastGameDetails';

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  buyIn: number;
  rebuys: number;
  cashOut: number;
}

export interface RebuyTransaction {
  id: string;
  playerId: string;
  playerName: string;
  amount: number;
  timestamp: string;
}

export interface SettlementTransaction {
  from: Player;
  to: Player;
  amount: number;
}

export interface Game {
  id: string;
  date: string;
  players: Player[];
  buyInAmount: number;
  hostFee: number;
  hostId: string;
  rebuyHistory: RebuyTransaction[];
  settlementTransactions: SettlementTransaction[];
  totalPot: number;
  isActive: boolean;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [pastGames, setPastGames] = useState<Game[]>([
    {
      id: '1',
      date: '2024-01-15',
      players: [
        { id: '1', name: 'Alice', buyIn: 45, rebuys: 25, cashOut: 120 }, // 50 - 5 = 45
        { id: '2', name: 'Bob', buyIn: 45, rebuys: 0, cashOut: 20 }, // 50 - 5 = 45
        { id: '3', name: 'Charlie', buyIn: 45, rebuys: 25, cashOut: 35 } // 50 - 5 = 45
      ],
      buyInAmount: 50,
      hostFee: 5,
      hostId: '1',
      rebuyHistory: [
        { id: '1', playerId: '1', playerName: 'Alice', amount: 25, timestamp: '14:30' },
        { id: '2', playerId: '3', playerName: 'Charlie', amount: 25, timestamp: '15:45' }
      ],
      settlementTransactions: [
        { from: { id: '2', name: 'Bob', buyIn: 45, rebuys: 0, cashOut: 20 }, to: { id: '1', name: 'Alice', buyIn: 45, rebuys: 25, cashOut: 120 }, amount: 25 },
        { from: { id: '3', name: 'Charlie', buyIn: 45, rebuys: 25, cashOut: 35 }, to: { id: '1', name: 'Alice', buyIn: 45, rebuys: 25, cashOut: 120 }, amount: 35 }
      ],
      totalPot: 185, // (45*3) + 25 + 25 = 185
      isActive: false
    },
    {
      id: '2',
      date: '2024-01-08',
      players: [
        { id: '1', name: 'Alice', buyIn: 95, rebuys: 0, cashOut: 80 }, // 100 - 5 = 95
        { id: '2', name: 'Bob', buyIn: 95, rebuys: 50, cashOut: 170 } // 100 - 5 = 95
      ],
      buyInAmount: 100,
      hostFee: 5,
      hostId: '1',
      rebuyHistory: [
        { id: '1', playerId: '2', playerName: 'Bob', amount: 50, timestamp: '16:20' }
      ],
      settlementTransactions: [
        { from: { id: '1', name: 'Alice', buyIn: 95, rebuys: 0, cashOut: 80 }, to: { id: '2', name: 'Bob', buyIn: 95, rebuys: 50, cashOut: 170 }, amount: 15 }
      ],
      totalPot: 240, // (95*2) + 50 = 240
      isActive: false
    }
  ]);

  const navigateToScreen = (screen: Screen, game?: Game) => {
    setCurrentScreen(screen);
    if (game) setCurrentGame(game);
    
    // Scroll to top when navigating to a new screen
    window.scrollTo(0, 0);
  };

  const createNewGame = (players: Omit<Player, 'buyIn' | 'rebuys' | 'cashOut'>[], buyInAmount: number, hostFee: number, hostId: string) => {
    const effectiveBuyIn = buyInAmount - hostFee; // Subtract host fee from buy-in amount
    const newGame: Game = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      players: players.map(p => ({
        ...p,
        buyIn: effectiveBuyIn, // This is the amount that actually goes to the pot
        rebuys: 0,
        cashOut: 0
      })),
      buyInAmount,
      hostFee,
      hostId,
      rebuyHistory: [],
      settlementTransactions: [],
      totalPot: 0,
      isActive: true
    };
    setCurrentGame(newGame);
    navigateToScreen('gameInProgress');
  };

  const updateGame = (updatedGame: Game) => {
    setCurrentGame(updatedGame);
  };

  const finishGame = (game: Game) => {
    setPastGames(prev => [game, ...prev]);
    setCurrentGame(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile App Container */}
      <div className="max-w-sm mx-auto min-h-screen bg-background border-x border-border">
        {currentScreen === 'home' && (
          <HomeScreen
            pastGames={pastGames}
            onStartNewGame={() => navigateToScreen('newGame')}
            onViewPastGame={(game) => navigateToScreen('pastGameDetails', game)}
          />
        )}
        
        {currentScreen === 'newGame' && (
          <NewGameSetup
            onBack={() => navigateToScreen('home')}
            onStartGame={createNewGame}
          />
        )}
        
        {currentScreen === 'gameInProgress' && currentGame && (
          <GameInProgress
            game={currentGame}
            onBack={() => navigateToScreen('home')}
            onUpdateGame={updateGame}
            onEndGame={() => navigateToScreen('cashOut')}
          />
        )}
        
        {currentScreen === 'cashOut' && currentGame && (
          <CashOutScreen
            game={currentGame}
            onBack={() => navigateToScreen('gameInProgress')}
            onUpdateGame={updateGame}
            onViewSummary={() => navigateToScreen('summary')}
          />
        )}
        
        {currentScreen === 'summary' && currentGame && (
          <GameSummary
            game={currentGame}
            onBack={() => navigateToScreen('cashOut')}
            onSimplifyDebts={() => navigateToScreen('settlement')}
          />
        )}
        
        {currentScreen === 'settlement' && currentGame && (
          <SettlementScreen
            game={currentGame}
            onBack={() => navigateToScreen('summary')}
            onFinishGame={(gameWithSettlements) => {
              finishGame(gameWithSettlements);
              navigateToScreen('home');
            }}
          />
        )}
        
        {currentScreen === 'pastGameDetails' && currentGame && (
          <PastGameDetails
            game={currentGame}
            onBack={() => navigateToScreen('home')}
          />
        )}
      </div>
    </div>
  );
}