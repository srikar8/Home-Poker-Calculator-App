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
  
  // First, save the main game record with proper conflict resolution
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
      is_active: game.isActive
    }, {
      onConflict: 'id'
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
  
  // Get games with all related data - only inactive games (past games)
  const { data: games, error: gamesError } = await supabase
    .from('games')
    .select(`
      *,
      players (*),
      rebuy_history (*),
      settlement_transactions (*)
    `)
    .eq('user_id', formattedUserId)
    .eq('is_active', false)
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
    isActive: game.is_active
  }))
}

export const getCurrentGames = async (userId: string): Promise<Game[]> => {
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
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  if (!games || games.length === 0) {
    return []
  }

  // Transform the data back to our Game interface
  return games.map((game: any) => ({
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
    totalPot: game.total_pot,
    isActive: game.is_active
  }))
}

// Keep the old function for backward compatibility, but it now returns the first active game
export const getCurrentGame = async (userId: string): Promise<Game | null> => {
  const activeGames = await getCurrentGames(userId);
  return activeGames.length > 0 ? activeGames[0] : null;
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
