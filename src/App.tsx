import React, { useState, useEffect, useRef } from 'react';
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
import { createUser, saveGame, getGames, getCurrentGames, deleteGame } from './lib/database';
import { isSupabaseConfigured } from './lib/supabase';
import {
  clearNewGameDraft,
  clearPersistedAppState,
  isGameScreen,
  loadPersistedAppState,
  loadUser,
  localDateString,
  mergeGameWithLocalCache,
  persistGameExtrasFromGame,
  resolveScreenAfterLoad,
  savePersistedAppState,
  saveUser,
} from './lib/persistence';

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '704930473706-ak626kpb4btplhpod3e0bv4v20sgqh9u.apps.googleusercontent.com';

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
  const persisted = useRef(loadPersistedAppState());
  const savedUser = useRef(loadUser());

  const [currentScreen, setCurrentScreen] = useState<Screen>(
    persisted.current?.currentScreen || 'home'
  );
  const [user, setUser] = useState<User | null>(savedUser.current);
  const [currentGames, setCurrentGames] = useState<Game[]>(
    persisted.current?.currentGames || []
  );
  const [pastGames, setPastGames] = useState<Game[]>(
    persisted.current?.pastGames || []
  );
  const [selectedPastGame, setSelectedPastGame] = useState<Game | null>(() => {
    const id = persisted.current?.selectedPastGameId;
    if (!id || !persisted.current) return null;
    return persisted.current.pastGames.find((g) => g.id === id) || null;
  });
  const [loading, setLoading] = useState(true);

  // Persist session whenever game/screen state changes (survives refresh)
  useEffect(() => {
    if (loading) return;

    savePersistedAppState({
      currentScreen,
      currentGames,
      pastGames,
      selectedPastGameId: selectedPastGame?.id ?? null,
    });

    currentGames.forEach(persistGameExtrasFromGame);
    pastGames.forEach(persistGameExtrasFromGame);
  }, [currentScreen, currentGames, pastGames, selectedPastGame, loading]);

  // If a game screen is active but the game is gone, recover to home
  useEffect(() => {
    if (loading) return;

    if (isGameScreen(currentScreen) && !currentGames[0]) {
      setCurrentScreen('home');
    }
    if (currentScreen === 'pastGameDetails' && !selectedPastGame) {
      setCurrentScreen('home');
    }
  }, [currentScreen, currentGames, selectedPastGame, loading]);

  // Load user and games on app initialization
  useEffect(() => {
    const loadUserAndGames = async () => {
      const localState = persisted.current;
      const preferredScreen = localState?.currentScreen;

      try {
        const userData = savedUser.current;

        if (userData && isSupabaseConfigured) {
          try {
            await createUser(userData);
          } catch (error) {
            console.log('User already exists or error creating user:', error);
          }

          try {
            const [remotePast, remoteActive] = await Promise.all([
              getGames(userData.id),
              getCurrentGames(userData.id),
            ]);

            const localCurrent = localState?.currentGames || [];
            const localPast = localState?.pastGames || [];

            const mergedActive = remoteActive.map((game) =>
              mergeGameWithLocalCache(game, localCurrent)
            );
            // Keep any local active games that haven't synced yet
            const remoteIds = new Set(mergedActive.map((g) => g.id));
            const unsyncedLocal = localCurrent.filter(
              (g) => g.isActive && !remoteIds.has(g.id)
            );

            const mergedPast = remotePast.map((game) =>
              mergeGameWithLocalCache(game, localPast)
            );

            setCurrentGames([...unsyncedLocal, ...mergedActive]);
            setPastGames(mergedPast);

            const nextSelected =
              (preferredScreen === 'pastGameDetails' &&
                localState?.selectedPastGameId &&
                mergedPast.find((g) => g.id === localState.selectedPastGameId)) ||
              null;
            setSelectedPastGame(nextSelected);

            setCurrentScreen(
              resolveScreenAfterLoad(
                preferredScreen,
                [...unsyncedLocal, ...mergedActive],
                nextSelected
              )
            );
          } catch (error) {
            console.error('Error loading games from Supabase, using local cache:', error);
            // Keep whatever was restored from localStorage
            setCurrentScreen(
              resolveScreenAfterLoad(
                preferredScreen,
                localState?.currentGames || [],
                selectedPastGame
              )
            );
          }
        } else if (userData && !isSupabaseConfigured) {
          // Logged in but no backend — stay on local cache
          setCurrentScreen(
            resolveScreenAfterLoad(
              preferredScreen,
              localState?.currentGames || [],
              selectedPastGame
            )
          );
        } else {
          // Guest / demo mode — localStorage is source of truth
          setCurrentScreen(
            resolveScreenAfterLoad(
              preferredScreen,
              localState?.currentGames || [],
              selectedPastGame
            )
          );
        }
      } catch (error) {
        console.error('Error loading user and games:', error);
        setCurrentScreen(
          resolveScreenAfterLoad(
            preferredScreen,
            localState?.currentGames || [],
            selectedPastGame
          )
        );
      } finally {
        setLoading(false);
      }
    };

    loadUserAndGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigateToScreen = (screen: Screen, game?: Game) => {
    setCurrentScreen(screen);
    if (game && screen === 'pastGameDetails') {
      setSelectedPastGame(game);
    }

    window.scrollTo(0, 0);
  };

  const createNewGame = async (
    players: Omit<Player, 'buyIn' | 'rebuys' | 'cashOut'>[],
    buyInAmount: number,
    hostFee: number,
    defaultRebuyAmount: number,
    hostId: string,
    coHostId?: string
  ) => {
    const newGame: Game = {
      id: Date.now().toString(),
      date: localDateString(),
      players: players.map((p) => ({
        ...p,
        buyIn: buyInAmount,
        rebuys: 0,
        cashOut: 0,
      })),
      buyInAmount,
      hostFee,
      defaultRebuyAmount,
      hostId,
      coHostId,
      rebuyHistory: [],
      settlementTransactions: [],
      totalPot: 0,
      isActive: true,
    };

    clearNewGameDraft();

    // Always update local state first so refresh cannot wipe a brand-new game
    setCurrentGames((prev) => [newGame, ...prev.filter((g) => g.id !== newGame.id)]);
    navigateToScreen('gameInProgress');

    if (user && isSupabaseConfigured) {
      try {
        await saveGame(newGame, user.id);
      } catch (error) {
        console.error('Error creating new game in database:', error);
      }
    }
  };

  const updateGame = async (updatedGame: Game) => {
    persistGameExtrasFromGame(updatedGame);

    setCurrentGames((prev) => {
      const exists = prev.some((game) => game.id === updatedGame.id);
      if (exists) {
        return prev.map((game) => (game.id === updatedGame.id ? updatedGame : game));
      }
      return [updatedGame, ...prev];
    });

    if (user && isSupabaseConfigured) {
      try {
        await saveGame(updatedGame, user.id);
      } catch (error) {
        console.error('Error updating game:', error);
      }
    }
  };

  const saveGameToHome = async () => {
    if (currentGames[0] && user && isSupabaseConfigured) {
      try {
        await saveGame(currentGames[0], user.id);
        const activeGames = await getCurrentGames(user.id);
        const merged = activeGames.map((game) =>
          mergeGameWithLocalCache(game, currentGames)
        );
        setCurrentGames(merged);
      } catch (error) {
        console.error('Error saving game when leaving:', error);
      }
    }
    navigateToScreen('home');
  };

  const resumeGame = (game?: Game) => {
    const gameToResume = game || currentGames[0];
    if (gameToResume && gameToResume.isActive) {
      if (game && game.id !== currentGames[0]?.id) {
        setCurrentGames((prev) => {
          const filtered = prev.filter((g) => g.id !== game.id);
          return [game, ...filtered];
        });
      }
      navigateToScreen('gameInProgress');
    }
  };

  const finishGame = async (game: Game) => {
    const finishedGame = { ...game, isActive: false };
    persistGameExtrasFromGame(finishedGame);

    setPastGames((prev) => [finishedGame, ...prev.filter((g) => g.id !== finishedGame.id)]);
    setCurrentGames((prev) => prev.filter((g) => g.id !== game.id));

    if (user && isSupabaseConfigured) {
      try {
        await saveGame(finishedGame, user.id);
      } catch (error) {
        console.error('Error finishing game:', error);
      }
    }
  };

  const removePastGame = async (gameId: string) => {
    setPastGames((prev) => prev.filter((game) => game.id !== gameId));

    if (user && isSupabaseConfigured) {
      try {
        await deleteGame(gameId, user.id);
      } catch (error) {
        console.error('Error deleting game:', error);
      }
    }
  };

  const removeActiveGame = async (gameId: string) => {
    setCurrentGames((prev) => prev.filter((game) => game.id !== gameId));

    if (user && isSupabaseConfigured) {
      try {
        await deleteGame(gameId, user.id);
      } catch (error) {
        console.error('Error deleting active game:', error);
      }
    }
  };

  const handleLogin = async (userData: User) => {
    setUser(userData);
    saveUser(userData);

    if (isSupabaseConfigured) {
      try {
        await createUser(userData);
        const games = await getGames(userData.id);
        const activeGames = await getCurrentGames(userData.id);

        const localCurrent = currentGames;
        const localPast = pastGames;

        setPastGames(games.map((g) => mergeGameWithLocalCache(g, localPast)));
        setCurrentGames([
          ...localCurrent.filter(
            (g) => g.isActive && !activeGames.some((r) => r.id === g.id)
          ),
          ...activeGames.map((g) => mergeGameWithLocalCache(g, localCurrent)),
        ]);
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    }

    navigateToScreen('home');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentGames([]);
    setPastGames([]);
    setSelectedPastGame(null);
    saveUser(null);
    clearPersistedAppState();
    setCurrentScreen('home');
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
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen bg-background">
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
