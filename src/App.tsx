import React, { useState, useEffect } from 'react';
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
import { createUser, getUser, saveGame, getGames, getCurrentGame, getCurrentGames, deleteGame } from './lib/database';

export type Screen = 'home' | 'newGame' | 'gameInProgress' | 'cashOut' | 'summary' | 'settlement' | 'pastGameDetails' | 'playerStats';

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



export interface GameTransaction {
  from: Player;
  to: Player;
  amount: number;
}

export interface PreExistingTransaction {
  id: string;
  from: Player;
  to: Player;
  amount: number;
  description?: string;
}

export interface Transaction {
  id: string;
  from: Player;
  to: Player;
  amount: number;
  description: string;
  timestamp: string;
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
  settlementTransactions: GameTransaction[];
  preExistingTransactions?: PreExistingTransaction[];
  transactions?: Transaction[];
  totalPot: number;
  isActive: boolean;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [user, setUser] = useState<User | null>(null);
  const [currentGames, setCurrentGames] = useState<Game[]>([]);
  const [pastGames, setPastGames] = useState<Game[]>([]);
  const [selectedPastGame, setSelectedPastGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user and games from Supabase on app initialization
  useEffect(() => {
    const loadUserAndGames = async () => {
      try {
        // Check if user is stored in localStorage (from Google OAuth)
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          
          // Create user in Supabase if not exists
          try {
            await createUser(userData);
          } catch (error) {
            console.log('User already exists or error creating user:', error);
          }
          
          // Load games from Supabase
          const games = await getGames(userData.id);
          setPastGames(games);
          
          // Load current active games
          const activeGames = await getCurrentGames(userData.id);
          setCurrentGames(activeGames);
        } else {
          // No user logged in - check localStorage for saved games first
          const savedPastGames = localStorage.getItem('pastGames');
          if (savedPastGames) {
            try {
              const localGames = JSON.parse(savedPastGames);
              setPastGames(localGames);
            } catch (error) {
              console.error('Error loading local games:', error);
              // Fallback to demo games
              setPastGames([
          {
            id: '1',
            date: '2024-01-15',
            players: [
              { id: '1', name: 'Alice', buyIn: 50, rebuys: 25, cashOut: 120 },
              { id: '2', name: 'Bob', buyIn: 50, rebuys: 0, cashOut: 20 },
              { id: '3', name: 'Charlie', buyIn: 50, rebuys: 25, cashOut: 35 }
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
            totalPot: 200,
            isActive: false
          },
          {
            id: '2',
            date: '2024-01-08',
            players: [
              { id: '1', name: 'Alice', buyIn: 100, rebuys: 0, cashOut: 80 },
              { id: '2', name: 'Bob', buyIn: 100, rebuys: 50, cashOut: 170 }
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
            totalPot: 250,
            isActive: false
          }
        ]);
            }
          } else {
            // No local games - show demo games
            setPastGames([
              {
                id: '1',
                date: '2024-01-15',
                players: [
                  { id: '1', name: 'Alice', buyIn: 50, rebuys: 25, cashOut: 120 },
                  { id: '2', name: 'Bob', buyIn: 50, rebuys: 0, cashOut: 20 },
                  { id: '3', name: 'Charlie', buyIn: 50, rebuys: 25, cashOut: 35 }
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
                totalPot: 200,
                isActive: false
              },
              {
                id: '2',
                date: '2024-01-08',
                players: [
                  { id: '1', name: 'Alice', buyIn: 100, rebuys: 0, cashOut: 80 },
                  { id: '2', name: 'Bob', buyIn: 100, rebuys: 50, cashOut: 170 }
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
                totalPot: 250,
                isActive: false
              }
            ]);
          }
          
          // Check for current game in localStorage when not logged in
          const savedCurrentGame = localStorage.getItem('currentGame');
          if (savedCurrentGame) {
            try {
              const currentGame = JSON.parse(savedCurrentGame);
              setCurrentGames([currentGame]);
            } catch (error) {
              console.error('Error loading current game:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error loading user and games:', error);
        // Fallback to demo games on error
        setPastGames([
          {
            id: '1',
            date: '2024-01-15',
            players: [
              { id: '1', name: 'Alice', buyIn: 50, rebuys: 25, cashOut: 120 },
              { id: '2', name: 'Bob', buyIn: 50, rebuys: 0, cashOut: 20 },
              { id: '3', name: 'Charlie', buyIn: 50, rebuys: 25, cashOut: 35 }
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
            totalPot: 200,
            isActive: false
          },
          {
            id: '2',
            date: '2024-01-08',
            players: [
              { id: '1', name: 'Alice', buyIn: 100, rebuys: 0, cashOut: 80 },
              { id: '2', name: 'Bob', buyIn: 100, rebuys: 50, cashOut: 170 }
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
            totalPot: 250,
            isActive: false
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadUserAndGames();
  }, []);

  const navigateToScreen = (screen: Screen, game?: Game) => {
    setCurrentScreen(screen);
    if (game && screen === 'pastGameDetails') {
      setSelectedPastGame(game);
    }
    
    // Scroll to top when navigating to a new screen
    window.scrollTo(0, 0);
  };

  const createNewGame = async (players: Omit<Player, 'buyIn' | 'rebuys' | 'cashOut'>[], buyInAmount: number, hostFee: number, defaultRebuyAmount: number, hostId: string, coHostId?: string) => {
    const newGame: Game = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      players: players.map(p => ({
        ...p,
        buyIn: buyInAmount,
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

    if (user) {
      try {
        await saveGame(newGame, user.id);
        setCurrentGames(prev => [newGame, ...prev]);
        navigateToScreen('gameInProgress');
      } catch (error) {
        console.error('Error creating new game:', error);
      }
    } else {
      // Demo mode - just set the game locally
      setCurrentGames([newGame]);
      navigateToScreen('gameInProgress');
    }
  };

  const updateGame = async (updatedGame: Game) => {
    setCurrentGames(prev => {
      const updated = prev.map(game => game.id === updatedGame.id ? updatedGame : game);
      return updated;
    });
    
    if (user) {
      try {
        await saveGame(updatedGame, user.id);
      } catch (error) {
        console.error('Error updating game:', error);
      }
    } else {
      // Save to localStorage when not logged in (demo mode)
      localStorage.setItem('currentGame', JSON.stringify(updatedGame));
    }
  };

  const saveGameToHome = async () => {
    // Save the current game to database and navigate to home
    if (currentGames[0] && user) {
      try {
        await saveGame(currentGames[0], user.id);
        // Refresh current games from database to ensure we have the latest state
        const activeGames = await getCurrentGames(user.id);
        setCurrentGames(activeGames);
      } catch (error) {
        console.error('Error saving game when leaving:', error);
      }
    } else if (currentGames[0] && !user) {
      // Demo mode - save to localStorage
      localStorage.setItem('currentGame', JSON.stringify(currentGames[0]));
    }
    navigateToScreen('home');
  };

  const resumeGame = (game?: Game) => {
    const gameToResume = game || currentGames[0];
    if (gameToResume && gameToResume.isActive) {
      // Set the selected game as the first in currentGames for the GameInProgress component
      if (game && game.id !== currentGames[0]?.id) {
        setCurrentGames(prev => {
          const filtered = prev.filter(g => g.id !== game.id);
          return [game, ...filtered];
        });
      }
      navigateToScreen('gameInProgress');
    }
  };

  const finishGame = async (game: Game) => {
    if (user) {
      try {
        // Mark game as inactive and save to Supabase using the same ID
        const finishedGame = { ...game, isActive: false };
        await saveGame(finishedGame, user.id);
        
        // Update local state - add finished game to past games and remove from current games
        setPastGames(prev => [finishedGame, ...prev]);
        setCurrentGames(prev => prev.filter(g => g.id !== game.id));
      } catch (error) {
        console.error('Error finishing game:', error);
      }
    } else {
      // Demo mode - save to localStorage using the same ID
      const finishedGame = { ...game, isActive: false };
      setPastGames(prev => [finishedGame, ...prev]);
      setCurrentGames(prev => prev.filter(g => g.id !== game.id));
      localStorage.removeItem('currentGame');
      
      // Save past games to localStorage
      const updatedPastGames = [finishedGame, ...pastGames];
      localStorage.setItem('pastGames', JSON.stringify(updatedPastGames));
    }
  };

  const removePastGame = async (gameId: string) => {
    if (user) {
      try {
        await deleteGame(gameId, user.id);
        setPastGames(prev => prev.filter(game => game.id !== gameId));
      } catch (error) {
        console.error('Error deleting game:', error);
      }
    } else {
      // Demo mode - remove from localStorage
      const updatedPastGames = pastGames.filter(game => game.id !== gameId);
      setPastGames(updatedPastGames);
      localStorage.setItem('pastGames', JSON.stringify(updatedPastGames));
    }
  };

  const removeActiveGame = async (gameId: string) => {
    if (user) {
      try {
        await deleteGame(gameId, user.id);
        setCurrentGames(prev => prev.filter(game => game.id !== gameId));
      } catch (error) {
        console.error('Error deleting active game:', error);
      }
    } else {
      // Demo mode - remove from localStorage
      setCurrentGames(prev => prev.filter(game => game.id !== gameId));
      localStorage.removeItem('currentGame');
    }
  };

  const handleLogin = async (userData: User) => {
    setUser(userData);
    // Save user to localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    
    try {
      // Create user in Supabase
      await createUser(userData);
      
      // Load user's games from Supabase
      const games = await getGames(userData.id);
      setPastGames(games);
      
      // Load current active games
      const activeGames = await getCurrentGames(userData.id);
      setCurrentGames(activeGames);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
    
    // Navigate back to home after successful login
    navigateToScreen('home');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentGames([]);
    setPastGames([]);
    // Remove user from localStorage
    localStorage.removeItem('user');
    // Stay on the same home page instead of navigating to login
    // navigateToScreen('login'); // Removed this line
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId="704930473706-ak626kpb4btplhpod3e0bv4v20sgqh9u.apps.googleusercontent.com">
      <div className="min-h-screen bg-background">
        {/* Mobile App Container */}
        <div className="max-w-sm mx-auto min-h-screen bg-background border-x border-border relative">
          {currentScreen === 'home' && (
            <HomeScreen
              user={user}
              pastGames={pastGames}
              currentGames={currentGames}
              onStartNewGame={() => navigateToScreen('newGame')}
              onViewPastGame={(game) => navigateToScreen('pastGameDetails', game)}
              onResumeGame={resumeGame}
              onViewStats={() => navigateToScreen('playerStats')}
              onLogin={handleLogin}
              onLogout={handleLogout}
              onDeleteActiveGame={removeActiveGame}
            />
          )}
          
          {currentScreen === 'newGame' && (
            <NewGameSetup
              user={user}
              pastGames={pastGames}
              onBack={() => navigateToScreen('home')}
              onStartGame={createNewGame}
            />
          )}
          
          {currentScreen === 'gameInProgress' && currentGames[0] && (
            <GameInProgress
              game={currentGames[0]}
              onBack={() => navigateToScreen('home')}
              onUpdateGame={updateGame}
              onEndGame={() => navigateToScreen('cashOut')}
              onSaveAndLeave={saveGameToHome}
            />
          )}
          
          {currentScreen === 'cashOut' && currentGames[0] && (
            <CashOutScreen
              game={currentGames[0]}
              onBack={() => navigateToScreen('gameInProgress')}
              onUpdateGame={updateGame}
              onViewSummary={() => navigateToScreen('summary')}
            />
          )}
          
          {currentScreen === 'summary' && currentGames[0] && (
            <GameSummary
              game={currentGames[0]}
              onBack={() => navigateToScreen('cashOut')}
              onSimplifyDebts={() => navigateToScreen('settlement')}
              onUpdateGame={updateGame}
            />
          )}
          
          {currentScreen === 'settlement' && currentGames[0] && (
            <SettlementScreen
              game={currentGames[0]}
              onBack={() => navigateToScreen('summary')}
              onFinishGame={(gameWithSettlements) => {
                finishGame(gameWithSettlements);
                navigateToScreen('home');
              }}
              onUpdateGame={updateGame}
            />
          )}
          
          {currentScreen === 'pastGameDetails' && selectedPastGame && (
            <PastGameDetails
              game={selectedPastGame}
              onBack={() => {
                setSelectedPastGame(null);
                navigateToScreen('home');
              }}
              onDeleteGame={(gameId) => {
                removePastGame(gameId);
                setSelectedPastGame(null);
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

        </div>
        <Analytics />
      </div>
    </GoogleOAuthProvider>
  );
}