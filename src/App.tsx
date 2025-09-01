import React, { useState } from 'react';
import { Analytics } from "@vercel/analytics/react";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { HomeScreen } from './components/HomeScreen';
import { NewGameSetup } from './components/NewGameSetup';
import { GameInProgress } from './components/GameInProgress';
import { CashOutScreen } from './components/CashOutScreen';
import { GameSummary } from './components/GameSummary';
import { SettlementScreen } from './components/SettlementScreen';
import { PastGameDetails } from './components/PastGameDetails';
import { PlayerStats } from './components/PlayerStats';
import { LoginDemo } from './components/LoginDemo';

export type Screen = 'home' | 'newGame' | 'gameInProgress' | 'cashOut' | 'summary' | 'settlement' | 'pastGameDetails' | 'playerStats' | 'login';

export interface User {
  id: string;
  email: string;
  name: string;
}

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
  defaultRebuyAmount: number;
  hostId: string;
  coHostId?: string;
  rebuyHistory: RebuyTransaction[];
  settlementTransactions: SettlementTransaction[];
  totalPot: number;
  isActive: boolean;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [user, setUser] = useState<User | null>(() => {
    // Load user from localStorage on app initialization
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [currentGame, setCurrentGame] = useState<Game | null>(() => {
    // Load current game from localStorage on app initialization
    const savedGame = localStorage.getItem('currentGame');
    return savedGame ? JSON.parse(savedGame) : null;
  });
  
  // Helper function to save past games to localStorage
  const savePastGamesToStorage = (games: Game[]) => {
    localStorage.setItem('pastGames', JSON.stringify(games));
  };

  const [pastGames, setPastGames] = useState<Game[]>(() => {
    // Load past games from localStorage on app initialization
    const savedPastGames = localStorage.getItem('pastGames');
    if (savedPastGames) {
      return JSON.parse(savedPastGames);
    }
    
    // Fallback to default games if no localStorage data exists
    return [
      {
        id: '1',
        date: '2024-01-15',
        players: [
          { id: '1', name: 'Alice', buyIn: 50, rebuys: 25, cashOut: 120 }, // Full buy-in amount
          { id: '2', name: 'Bob', buyIn: 50, rebuys: 0, cashOut: 20 }, // Full buy-in amount
          { id: '3', name: 'Charlie', buyIn: 50, rebuys: 25, cashOut: 35 } // Full buy-in amount
        ],
        buyInAmount: 50,
        hostFee: 5,
        defaultRebuyAmount: 50,
        hostId: '1',
        coHostId: undefined,
        rebuyHistory: [
          { id: '1', playerId: '1', playerName: 'Alice', amount: 25, timestamp: '14:30' },
          { id: '2', playerId: '3', playerName: 'Charlie', amount: 25, timestamp: '15:45' }
        ],
        settlementTransactions: [
          { from: { id: '2', name: 'Bob', buyIn: 50, rebuys: 0, cashOut: 20 }, to: { id: '1', name: 'Alice', buyIn: 50, rebuys: 25, cashOut: 120 }, amount: 25 },
          { from: { id: '3', name: 'Charlie', buyIn: 50, rebuys: 25, cashOut: 35 }, to: { id: '1', name: 'Alice', buyIn: 50, rebuys: 25, cashOut: 120 }, amount: 35 }
        ],
        totalPot: 200, // (50*3) + 25 + 25 = 200
        isActive: false
      },
      {
        id: '2',
        date: '2024-01-08',
        players: [
          { id: '1', name: 'Alice', buyIn: 100, rebuys: 0, cashOut: 80 }, // Full buy-in amount
          { id: '2', name: 'Bob', buyIn: 100, rebuys: 50, cashOut: 170 } // Full buy-in amount
        ],
        buyInAmount: 100,
        hostFee: 5,
        defaultRebuyAmount: 50,
        hostId: '1',
        coHostId: undefined,
        rebuyHistory: [
          { id: '1', playerId: '2', playerName: 'Bob', amount: 50, timestamp: '16:20' }
        ],
        settlementTransactions: [
          { from: { id: '1', name: 'Alice', buyIn: 100, rebuys: 0, cashOut: 80 }, to: { id: '2', name: 'Bob', buyIn: 100, rebuys: 50, cashOut: 170 }, amount: 15 }
        ],
        totalPot: 250, // (100*2) + 50 = 250
        isActive: false
      }
    ];
  });

  const navigateToScreen = (screen: Screen, game?: Game) => {
    setCurrentScreen(screen);
    if (game) setCurrentGame(game);
    
    // Scroll to top when navigating to a new screen
    window.scrollTo(0, 0);
  };

  const createNewGame = (players: Omit<Player, 'buyIn' | 'rebuys' | 'cashOut'>[], buyInAmount: number, hostFee: number, defaultRebuyAmount: number, hostId: string, coHostId?: string) => {
    const newGame: Game = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      players: players.map(p => ({
        ...p,
        buyIn: buyInAmount, // Full buy-in amount goes to the pot
        rebuys: 0,
        cashOut: 0
      })),
      buyInAmount,
      hostFee,
      defaultRebuyAmount,
      hostId,
      coHostId,
      rebuyHistory: [],
      settlementTransactions: [],
      totalPot: 0,
      isActive: true
    };
    setCurrentGame(newGame);
    // Save the new game to localStorage
    localStorage.setItem('currentGame', JSON.stringify(newGame));
    navigateToScreen('gameInProgress');
  };

  const updateGame = (updatedGame: Game) => {
    setCurrentGame(updatedGame);
    // Auto-save the current game to localStorage
    localStorage.setItem('currentGame', JSON.stringify(updatedGame));
  };

  const saveGameToHome = () => {
    // Keep the current game active but navigate to home
    // The game will remain in localStorage and can be resumed
    navigateToScreen('home');
  };

  const resumeGame = () => {
    if (currentGame && currentGame.isActive) {
      navigateToScreen('gameInProgress');
    }
  };

  const finishGame = (game: Game) => {
    setPastGames(prev => {
      const updatedPastGames = [game, ...prev];
      // Save updated past games to localStorage
      savePastGamesToStorage(updatedPastGames);
      return updatedPastGames;
    });
    setCurrentGame(null);
    // Clear the current game from localStorage when finished
    localStorage.removeItem('currentGame');
  };

  const removePastGame = (gameId: string) => {
    setPastGames(prev => {
      const updatedPastGames = prev.filter(game => game.id !== gameId);
      // Save updated past games to localStorage
      savePastGamesToStorage(updatedPastGames);
      return updatedPastGames;
    });
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    // Save user to localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    // Navigate back to home after successful login
    navigateToScreen('home');
  };

  const handleLogout = () => {
    setUser(null);
    // Remove user from localStorage
    localStorage.removeItem('user');
    // Stay on the same home page instead of navigating to login
    // navigateToScreen('login'); // Removed this line
  };

  return (
    <GoogleOAuthProvider clientId="704930473706-ak626kpb4btplhpod3e0bv4v20sgqh9u.apps.googleusercontent.com">
      <div className="min-h-screen bg-background">
        {/* Mobile App Container */}
        <div className="max-w-sm mx-auto min-h-screen bg-background border-x border-border relative">
          {currentScreen === 'home' && (
            <HomeScreen
              user={user}
              pastGames={pastGames}
              currentGame={currentGame}
              onStartNewGame={() => navigateToScreen('newGame')}
              onViewPastGame={(game) => navigateToScreen('pastGameDetails', game)}
              onResumeGame={resumeGame}
              onViewStats={() => navigateToScreen('playerStats')}
              onLogin={() => navigateToScreen('login')}
              onLogout={handleLogout}
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
              onSaveAndLeave={saveGameToHome}
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
              onUpdateGame={updateGame}
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
              onBack={() => {
                setCurrentGame(null);
                navigateToScreen('home');
              }}
              onDeleteGame={(gameId) => {
                removePastGame(gameId);
                setCurrentGame(null);
                navigateToScreen('home');
              }}
            />
          )}
          
          {currentScreen === 'playerStats' && (
            <PlayerStats
              pastGames={pastGames}
              onBack={() => navigateToScreen('home')}
            />
          )}

          {currentScreen === 'login' && (
            <LoginDemo onLogin={handleLogin} onBack={() => navigateToScreen('home')} />
          )}
        </div>
        <Analytics />
      </div>
    </GoogleOAuthProvider>
  );
}