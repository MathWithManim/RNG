import type { RPSMove, TTTDifficulty, Card, Suit, Rank } from '../types';

// ==========================================
// TIC TAC TOE ENGINE (Minimax)
// ==========================================

export const checkTTTWinner = (squares: (string | null)[]) => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], 
    [0, 3, 6], [1, 4, 7], [2, 5, 8], 
    [0, 4, 8], [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
};

const minimax = (squares: (string | null)[], depth: number, isMaximizing: boolean): number => {
    const winner = checkTTTWinner(squares);
    if (winner === 'O') return 10 - depth; // AI wins (O)
    if (winner === 'X') return depth - 10; // Player wins (X)
    if (!squares.includes(null)) return 0; // Draw

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (!squares[i]) {
                squares[i] = 'O';
                const score = minimax(squares, depth + 1, false);
                squares[i] = null;
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (!squares[i]) {
                squares[i] = 'X';
                const score = minimax(squares, depth + 1, true);
                squares[i] = null;
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
};

export const getBestTTTMove = (squares: (string | null)[], difficulty: TTTDifficulty): number => {
    let errorRate = 0;
    switch (difficulty) {
        case 'easy': errorRate = 0.8; break; // 80% Random
        case 'medium': errorRate = 0.4; break; // 40% Random
        case 'hard': errorRate = 0.1; break; // 10% Random
        case 'impossible': errorRate = 0.0; break; // 0% Random (Perfect)
    }

    const available = squares.map((v, i) => v === null ? i : null).filter(v => v !== null);

    // Random error move based on difficulty
    if (Math.random() < errorRate) {
        return available[Math.floor(Math.random() * available.length)] as number;
    }

    let bestScore = -Infinity;
    let move = -1;
    
    // Optimization: If it's the very first move and center is open, take it
    if (available.length === 9 || (available.length === 8 && !squares[4])) {
        if (!squares[4]) return 4;
    }

    // Run Minimax for all available moves
    for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
            squares[i] = 'O';
            const score = minimax(squares, 0, false);
            squares[i] = null;
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
};

// ==========================================
// RPS ENGINE (Markov Chain Pattern Recognition)
// ==========================================

export const predictRPSMove = (
    history: Record<string, Record<string, number>>, 
    lastPlayerMove: RPSMove | null
): { move: RPSMove, confidence: number } => {
    
    // If no history or first move, return random
    if (!lastPlayerMove) {
        const moves: RPSMove[] = ['rock', 'paper', 'scissors'];
        return {
            move: moves[Math.floor(Math.random() * moves.length)],
            confidence: 0
        };
    }

    // Look at history: What does player usually do after 'lastPlayerMove'?
    const moveHistory = history[lastPlayerMove];
    
    // Calculate total samples for this state
    const total = moveHistory.rock + moveHistory.paper + moveHistory.scissors;
    
    if (total === 0) {
        const moves: RPSMove[] = ['rock', 'paper', 'scissors'];
        return {
            move: moves[Math.floor(Math.random() * moves.length)],
            confidence: 0
        };
    }

    // Find the move with highest frequency
    let predicted: RPSMove = 'rock';
    let maxCount = -1;
    
    (Object.keys(moveHistory) as RPSMove[]).forEach(move => {
        if (moveHistory[move] > maxCount) {
            maxCount = moveHistory[move];
            predicted = move;
        }
    });

    // Calculate confidence
    const confidence = Math.round((maxCount / total) * 100);

    // AI Logic: Counter the predicted move
    const counters: Record<RPSMove, RPSMove> = {
        rock: 'paper',
        paper: 'scissors',
        scissors: 'rock'
    };
    
    return {
        move: counters[predicted],
        confidence
    };
};

// ==========================================
// BLACKJACK ENGINE
// ==========================================

export const createDeck = (): Card[] => {
    const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck: Card[] = [];

    for (const suit of suits) {
        for (const rank of ranks) {
            let value = parseInt(rank);
            if (rank === 'A') value = 11;
            if (['J', 'Q', 'K'].includes(rank)) value = 10;
            deck.push({ suit, rank, value });
        }
    }
    
    // Fisher-Yates Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
};

export const calculateHandValue = (hand: Card[]): number => {
    let value = 0;
    let aces = 0;

    for (const card of hand) {
        if (card.isHidden) continue;
        value += card.value;
        if (card.rank === 'A') aces += 1;
    }

    while (value > 21 && aces > 0) {
        value -= 10;
        aces -= 1;
    }

    return value;
};

// ==========================================
// MEMORY HACK ENGINE
// ==========================================

export const generateMemorySequence = (length: number): number[] => {
    const sequence: number[] = [];
    for (let i = 0; i < length; i++) {
        sequence.push(Math.floor(Math.random() * 9));
    }
    return sequence;
};