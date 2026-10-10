import type { Game, PreExistingTransaction, Screen, Transaction, User } from '../App';

const APP_STATE_KEY = 'pokerAppState';
const LEGACY_CURRENT_GAME_KEY = 'currentGame';
const LEGACY_PAST_GAMES_KEY = 'pastGames';
const USER_KEY = 'user';
const NEW_GAME_DRAFT_KEY = 'newGameDraft';
const GAME_EXTRAS_KEY = 'pokerGameExtras';

export interface PersistedAppState {
  currentScreen: Screen;
  currentGames: Game[];
  pastGames: Game[];
  selectedPastGameId: string | null;
}

export interface NewGameDraft {
  players: { id: string; name: string; avatar?: string }[];
  buyInAmount: string;
  hostFee: string;
  defaultRebuyAmount: string;
  selectedHostId: string;
  selectedCoHostId?: string;
}

export interface GameExtras {
  preExistingTransactions?: PreExistingTransaction[];
  transactions?: Transaction[];
}

const GAME_SCREENS: Screen[] = ['gameInProgress', 'cashOut', 'summary', 'settlement'];

function normalizeGame(game: Game): Game {
  return {
    ...game,
    players: Array.isArray(game.players) ? game.players : [],
    rebuyHistory: Array.isArray(game.rebuyHistory) ? game.rebuyHistory : [],
    settlementTransactions: Array.isArray(game.settlementTransactions)
      ? game.settlementTransactions
      : [],
    preExistingTransactions: Array.isArray(game.preExistingTransactions)
      ? game.preExistingTransactions
      : game.preExistingTransactions,
    transactions: Array.isArray(game.transactions)
      ? game.transactions
      : game.transactions,
  };
}

function normalizeGames(games: unknown): Game[] {
  if (!Array.isArray(games)) return [];
  return games.filter(Boolean).map((g) => normalizeGame(g as Game));
}

export function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function saveUser(user: User | null) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function loadPersistedAppState(): PersistedAppState | null {
  try {
    const raw = localStorage.getItem(APP_STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedAppState;
      return {
        currentScreen: parsed.currentScreen || 'home',
        currentGames: normalizeGames(parsed.currentGames),
        pastGames: normalizeGames(parsed.pastGames),
        selectedPastGameId: parsed.selectedPastGameId ?? null,
      };
    }

    // Migrate legacy keys from earlier versions
    const legacyCurrent = localStorage.getItem(LEGACY_CURRENT_GAME_KEY);
    const legacyPast = localStorage.getItem(LEGACY_PAST_GAMES_KEY);
    const currentGames = legacyCurrent
      ? normalizeGames([JSON.parse(legacyCurrent)])
      : [];
    const pastGames = legacyPast ? normalizeGames(JSON.parse(legacyPast)) : [];

    if (currentGames.length === 0 && pastGames.length === 0) {
      return null;
    }

    return {
      currentScreen: currentGames.length > 0 ? 'gameInProgress' : 'home',
      currentGames,
      pastGames,
      selectedPastGameId: null,
    };
  } catch {
    return null;
  }
}

export function savePersistedAppState(state: PersistedAppState) {
  try {
    localStorage.setItem(APP_STATE_KEY, JSON.stringify(state));
    // Keep legacy keys in sync for any older helpers that still read them
    if (state.currentGames[0]) {
      localStorage.setItem(LEGACY_CURRENT_GAME_KEY, JSON.stringify(state.currentGames[0]));
    } else {
      localStorage.removeItem(LEGACY_CURRENT_GAME_KEY);
    }
    localStorage.setItem(LEGACY_PAST_GAMES_KEY, JSON.stringify(state.pastGames));
  } catch (error) {
    console.error('Error saving app state:', error);
  }
}

export function clearPersistedAppState() {
  localStorage.removeItem(APP_STATE_KEY);
  localStorage.removeItem(LEGACY_CURRENT_GAME_KEY);
  localStorage.removeItem(LEGACY_PAST_GAMES_KEY);
  localStorage.removeItem(NEW_GAME_DRAFT_KEY);
}

export function loadNewGameDraft(): NewGameDraft | null {
  try {
    const raw = localStorage.getItem(NEW_GAME_DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as NewGameDraft;
    if (!draft || !Array.isArray(draft.players)) return null;
    return draft;
  } catch {
    return null;
  }
}

export function saveNewGameDraft(draft: NewGameDraft) {
  try {
    localStorage.setItem(NEW_GAME_DRAFT_KEY, JSON.stringify(draft));
  } catch (error) {
    console.error('Error saving new game draft:', error);
  }
}

export function clearNewGameDraft() {
  localStorage.removeItem(NEW_GAME_DRAFT_KEY);
}

function loadAllGameExtras(): Record<string, GameExtras> {
  try {
    const raw = localStorage.getItem(GAME_EXTRAS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveGameExtras(gameId: string, extras: GameExtras) {
  try {
    const all = loadAllGameExtras();
    all[gameId] = {
      preExistingTransactions: extras.preExistingTransactions,
      transactions: extras.transactions,
    };
    localStorage.setItem(GAME_EXTRAS_KEY, JSON.stringify(all));
  } catch (error) {
    console.error('Error saving game extras:', error);
  }
}

export function loadGameExtras(gameId: string): GameExtras | null {
  const extras = loadAllGameExtras()[gameId];
  return extras || null;
}

export function clearGameExtras(gameId: string) {
  try {
    const all = loadAllGameExtras();
    delete all[gameId];
    localStorage.setItem(GAME_EXTRAS_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

/** Local calendar date YYYY-MM-DD (avoids UTC off-by-one). */
export function localDateString(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Prefer remote game data, but keep local-only fields that Supabase may not store. */
export function mergeGameWithLocalCache(remote: Game, localGames: Game[]): Game {
  const local = localGames.find((g) => g.id === remote.id);
  const extras = loadGameExtras(remote.id);

  return {
    ...remote,
    transactions:
      remote.transactions ?? local?.transactions ?? extras?.transactions,
    preExistingTransactions:
      remote.preExistingTransactions ??
      local?.preExistingTransactions ??
      extras?.preExistingTransactions,
  };
}

/** Persist settlement extras whenever a game is saved locally. */
export function persistGameExtrasFromGame(game: Game) {
  if (
    (game.preExistingTransactions && game.preExistingTransactions.length > 0) ||
    (game.transactions && game.transactions.length > 0)
  ) {
    saveGameExtras(game.id, {
      preExistingTransactions: game.preExistingTransactions,
      transactions: game.transactions,
    });
  }
}

export function resolveScreenAfterLoad(
  preferredScreen: Screen | null | undefined,
  currentGames: Game[],
  selectedPastGame: Game | null
): Screen {
  const screen = preferredScreen || 'home';

  if (GAME_SCREENS.includes(screen)) {
    return currentGames[0] ? screen : 'home';
  }

  if (screen === 'pastGameDetails') {
    return selectedPastGame ? screen : 'home';
  }

  // newGame / playerStats / home are always safe
  return screen;
}

export function isGameScreen(screen: Screen): boolean {
  return GAME_SCREENS.includes(screen);
}
