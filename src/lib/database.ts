import { supabase } from './supabase'
import type { Game, User, Player, RebuyTransaction, GameTransaction } from '../App'

// User functions
export const createUser = async (user: User) => {
  // Convert Google OAuth ID to a valid format for Supabase
  const userId = user.id.startsWith('google_') ? user.id : `google_${user.id}`;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id: userId,
      email: user.email,
      name: user.name
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const getUser = async (userId: string) => {
  const formattedUserId = userId.startsWith('google_') ? userId : `google_${userId}`;
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', formattedUserId)
    .single()

  if (error) throw error
  return data
}

// Game functions
export const saveGame = async (game: Game, userId: string) => {
  const formattedUserId = userId.startsWith('google_') ? userId : `google_${userId}`;
  
  // First, save the main game record
  const { data: gameData, error: gameError } = await supabase
    .from('games')
    .upsert({
      id: game.id,
      user_id: formattedUserId,
      date: game.date,
      buy_in_amount: game.buyInAmount,
      host_fee: game.hostFee,
      default_rebuy_amount: game.defaultRebuyAmount,
      host_id: game.hostId,
      co_host_id: game.coHostId || null,
      total_pot: game.totalPot,
      is_active: game.isActive,
      game_started: game.gameStarted || false,
      game_code: game.gameCode || null,
      code_expires_at: game.codeExpiresAt || null,
      max_players: game.maxPlayers || 8
    })
    .select()
    .single()

  if (gameError) throw gameError

  // Delete existing related records
  await supabase.from('players').delete().eq('game_id', game.id)
  await supabase.from('rebuy_history').delete().eq('game_id', game.id)
  await supabase.from('settlement_transactions').delete().eq('game_id', game.id)

  // Save players
  if (game.players.length > 0) {
    const playersData = game.players.map(player => ({
      id: player.id,
      game_id: game.id,
      name: player.name,
      avatar: player.avatar || null,
      buy_in: player.buyIn,
      rebuys: player.rebuys,
      cash_out: player.cashOut
    }))

    const { error: playersError } = await supabase
      .from('players')
      .insert(playersData)

    if (playersError) throw playersError
  }

  // Save rebuy history
  if (game.rebuyHistory.length > 0) {
    const rebuyData = game.rebuyHistory.map(rebuy => ({
      id: rebuy.id,
      game_id: game.id,
      player_id: rebuy.playerId,
      player_name: rebuy.playerName,
      amount: rebuy.amount,
      timestamp: rebuy.timestamp
    }))

    const { error: rebuyError } = await supabase
      .from('rebuy_history')
      .insert(rebuyData)

    if (rebuyError) throw rebuyError
  }

  // Save settlement transactions
  if (game.settlementTransactions.length > 0) {
    const settlementData = game.settlementTransactions.map(transaction => ({
      game_id: game.id,
      from_player_id: transaction.from.id,
      from_player_name: transaction.from.name,
      to_player_id: transaction.to.id,
      to_player_name: transaction.to.name,
      amount: transaction.amount
    }))

    const { error: settlementError } = await supabase
      .from('settlement_transactions')
      .insert(settlementData)

    if (settlementError) throw settlementError
  }

  return gameData
}

export const getGames = async (userId: string): Promise<Game[]> => {
  const formattedUserId = userId.startsWith('google_') ? userId : `google_${userId}`;
  
  // Get games with all related data
  const { data: games, error: gamesError } = await supabase
    .from('games')
    .select(`
      *,
      players (*),
      rebuy_history (*),
      settlement_transactions (*)
    `)
    .eq('user_id', formattedUserId)
    .order('created_at', { ascending: false })

  if (gamesError) throw gamesError

  // Transform the data back to our Game interface
  return games.map(game => ({
    id: game.id,
    date: game.date,
    players: game.players.map((player: any) => ({
      id: player.id,
      name: player.name,
      avatar: player.avatar,
      buyIn: player.buy_in,
      rebuys: player.rebuys,
      cashOut: player.cash_out
    })),
    buyInAmount: game.buy_in_amount,
    hostFee: game.host_fee,
    defaultRebuyAmount: game.default_rebuy_amount,
    hostId: game.host_id,
    coHostId: game.co_host_id,
    rebuyHistory: game.rebuy_history.map((rebuy: any) => ({
      id: rebuy.id,
      playerId: rebuy.player_id,
      playerName: rebuy.player_name,
      amount: rebuy.amount,
      timestamp: rebuy.timestamp
    })),
    settlementTransactions: game.settlement_transactions.map((transaction: any) => ({
      from: {
        id: transaction.from_player_id,
        name: transaction.from_player_name,
        buyIn: 0, // We'll need to get this from players
        rebuys: 0,
        cashOut: 0
      },
      to: {
        id: transaction.to_player_id,
        name: transaction.to_player_name,
        buyIn: 0,
        rebuys: 0,
        cashOut: 0
      },
      amount: transaction.amount
    })),
    totalPot: game.total_pot,
    isActive: game.is_active,
    gameStarted: game.game_started || false,
    gameCode: game.game_code,
    codeExpiresAt: game.code_expires_at,
    maxPlayers: game.max_players
  }))
}

export const getCurrentGame = async (userId: string): Promise<Game | null> => {
  const formattedUserId = userId.startsWith('google_') ? userId : `google_${userId}`;
  
  const { data: games, error } = await supabase
    .from('games')
    .select(`
      *,
      players (*),
      rebuy_history (*),
      settlement_transactions (*)
    `)
    .eq('user_id', formattedUserId)
    .eq('is_active', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No active game found
      return null
    }
    throw error
  }

  // Transform the data back to our Game interface
  return {
    id: games.id,
    date: games.date,
    players: games.players.map((player: any) => ({
      id: player.id,
      name: player.name,
      avatar: player.avatar,
      buyIn: player.buy_in,
      rebuys: player.rebuys,
      cashOut: player.cash_out
    })),
    buyInAmount: games.buy_in_amount,
    hostFee: games.host_fee,
    defaultRebuyAmount: games.default_rebuy_amount,
    hostId: games.host_id,
    coHostId: games.co_host_id,
    rebuyHistory: games.rebuy_history.map((rebuy: any) => ({
      id: rebuy.id,
      playerId: rebuy.player_id,
      playerName: rebuy.player_name,
      amount: rebuy.amount,
      timestamp: rebuy.timestamp
    })),
    settlementTransactions: games.settlement_transactions.map((transaction: any) => ({
      from: {
        id: transaction.from_player_id,
        name: transaction.from_player_name,
        buyIn: 0,
        rebuys: 0,
        cashOut: 0
      },
      to: {
        id: transaction.to_player_id,
        name: transaction.to_player_name,
        buyIn: 0,
        rebuys: 0,
        cashOut: 0
      },
      amount: transaction.amount
    })),
    totalPot: games.total_pot,
    isActive: games.is_active,
    gameStarted: games.game_started || false,
    gameCode: games.game_code,
    codeExpiresAt: games.code_expires_at,
    maxPlayers: games.max_players
  }
}

export const deleteGame = async (gameId: string, userId: string) => {
  const formattedUserId = userId.startsWith('google_') ? userId : `google_${userId}`;
  
  // First verify the game belongs to the user
  const { data: game, error: gameError } = await supabase
    .from('games')
    .select('id')
    .eq('id', gameId)
    .eq('user_id', formattedUserId)
    .single()

  if (gameError) throw gameError

  // Delete the game (cascade will handle related records)
  const { error } = await supabase
    .from('games')
    .delete()
    .eq('id', gameId)

  if (error) throw error
}

// Game code generation
const generateGameCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Check if game code is unique
const isGameCodeUnique = async (gameCode: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('games')
    .select('id')
    .eq('game_code', gameCode)
    .eq('is_active', true)
    .single();
  
  // If no error and data exists, code is not unique
  return !data;
};

// Generate a unique game code
export const generateUniqueGameCode = async (): Promise<string> => {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const code = generateGameCode();
    const isUnique = await isGameCodeUnique(code);
    
    if (isUnique) {
      return code;
    }
    
    attempts++;
  }
  
  // Fallback: use timestamp-based code if we can't generate a unique random one
  return Date.now().toString().slice(-6).toUpperCase();
};

// Game code functions
export const getGameByCode = async (gameCode: string): Promise<Game | null> => {
  const { data: games, error } = await supabase
    .from('games')
    .select(`
      *,
      players (*),
      rebuy_history (*),
      settlement_transactions (*)
    `)
    .eq('game_code', gameCode)
    .eq('is_active', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No game found with this code
      return null
    }
    throw error
  }

  // Check if code has expired
  if (games.code_expires_at && new Date(games.code_expires_at) < new Date()) {
    return null
  }

  // Transform the data back to our Game interface
  return {
    id: games.id,
    date: games.date,
    players: games.players.map((player: any) => ({
      id: player.id,
      name: player.name,
      avatar: player.avatar,
      buyIn: player.buy_in,
      rebuys: player.rebuys,
      cashOut: player.cash_out
    })),
    buyInAmount: games.buy_in_amount,
    hostFee: games.host_fee,
    defaultRebuyAmount: games.default_rebuy_amount,
    hostId: games.host_id,
    coHostId: games.co_host_id,
    rebuyHistory: games.rebuy_history.map((rebuy: any) => ({
      id: rebuy.id,
      playerId: rebuy.player_id,
      playerName: rebuy.player_name,
      amount: rebuy.amount,
      timestamp: rebuy.timestamp
    })),
    settlementTransactions: games.settlement_transactions.map((transaction: any) => ({
      from: {
        id: transaction.from_player_id,
        name: transaction.from_player_name,
        buyIn: 0,
        rebuys: 0,
        cashOut: 0
      },
      to: {
        id: transaction.to_player_id,
        name: transaction.to_player_name,
        buyIn: 0,
        rebuys: 0,
        cashOut: 0
      },
      amount: transaction.amount
    })),
    totalPot: games.total_pot,
    isActive: games.is_active,
    gameStarted: games.game_started || false,
    gameCode: games.game_code,
    codeExpiresAt: games.code_expires_at,
    maxPlayers: games.max_players
  }
}

// Helper function to extract original user ID from composite player ID
const getOriginalUserId = (playerId: string) => {
  return playerId.includes('_') ? playerId.split('_')[1] : playerId;
};

export const joinGameByCode = async (gameCode: string, user: User): Promise<Game | null> => {
  // First get the game
  const game = await getGameByCode(gameCode)
  if (!game) {
    throw new Error('Game not found or expired')
  }

  // Check if user is already in the game
  const playerId = `${game.id}_${user.id}`
  const existingPlayer = game.players.find(p => p.id === playerId)
  if (existingPlayer) {
    throw new Error('You are already in this game')
  }

  // Check if game is full
  if (game.players.length >= (game.maxPlayers || 8)) {
    throw new Error('Game is full')
  }

  // Check if game has already started
  if (game.gameStarted) {
    throw new Error('Game has already started. No new players can join.')
  }

  // Add user as a player with a unique ID for this game
  const newPlayer: Player = {
    id: `${game.id}_${user.id}`, // Create unique player ID for this game
    name: user.name,
    avatar: undefined, // User interface doesn't have avatar, so we'll set it to undefined
    buyIn: game.buyInAmount,
    rebuys: 0,
    cashOut: 0
  }

  // Ensure host appears first, then other players in join order
  const hostPlayer = game.players.find(p => getOriginalUserId(p.id) === game.hostId);
  const otherPlayers = game.players.filter(p => getOriginalUserId(p.id) !== game.hostId);
  
  const updatedGame = {
    ...game,
    players: hostPlayer 
      ? [hostPlayer, ...otherPlayers, newPlayer]
      : [...game.players, newPlayer]
  }

  // Save the updated game
  await saveGame(updatedGame, game.hostId)
  
  return updatedGame
}
