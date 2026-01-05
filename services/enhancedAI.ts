import * as tf from '@tensorflow/tfjs';

// Enhanced AI using TensorFlow.js for the arcade games
class EnhancedArcadeAI {
  private tttModel: tf.LayersModel | null = null;
  private rpsModel: tf.LayersModel | null = null;
  private memoryModel: tf.LayersModel | null = null;

  // Initialize all AI models
  async initializeModels() {
    console.log('Initializing enhanced AI models...');

    this.tttModel = this.createTicTacToeModel();
    this.rpsModel = this.createRPSModel();
    this.memoryModel = this.createMemoryModel();

    await this.warmUpModels();

    console.log('Enhanced AI models initialized successfully!');
  }

  // Create Tic-Tac-Toe neural network model
  private createTicTacToeModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          units: 128,
          activation: 'relu',
          inputShape: [9]
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 9, activation: 'softmax' })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  // Create RPS neural network model
  private createRPSModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          units: 64,
          activation: 'relu',
          inputShape: [10]
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 3, activation: 'softmax' })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  // Create Memory game neural network model
  private createMemoryModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.lstm({
          units: 50,
          returnSequences: true,
          inputShape: [null, 1]
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.lstm({ units: 50 }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 9, activation: 'softmax' })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  // Warm up models to avoid initial latency
  private async warmUpModels() {
    // Warm up Tic-Tac-Toe model
    if (this.tttModel) {
      const dummyInput = tf.tensor2d([Array(9).fill(0)], [1, 9]);
      const prediction = this.tttModel.predict(dummyInput) as tf.Tensor;
      await prediction.data();
      prediction.dispose();
      dummyInput.dispose();
    }

    // Warm up RPS model
    if (this.rpsModel) {
      const dummyInput = tf.tensor2d([Array(10).fill(0)], [1, 10]);
      const prediction = this.rpsModel.predict(dummyInput) as tf.Tensor;
      await prediction.data();
      prediction.dispose();
      dummyInput.dispose();
    }

    // Warm up Memory model
    if (this.memoryModel) {
      const dummyInput = tf.tensor3d([[[0], [1], [2]]], [1, 3, 1]);
      const prediction = this.memoryModel.predict(dummyInput) as tf.Tensor;
      await prediction.data();
      prediction.dispose();
      dummyInput.dispose();
    }
  }

  // Predict best move for Tic-Tac-Toe
  predictTicTacToeMove(board: (string | null)[], difficulty: 'easy' | 'medium' | 'hard' | 'impossible'): number {
    if (!this.tttModel) {
      console.error('Tic-Tac-Toe model not initialized');
      return -1;
    }

    const boardNumeric = board.map(cell => {
      if (cell === 'O') return 1;
      if (cell === 'X') return -1;
      return 0;
    });

    // Add some randomness based on difficulty
    const randomFactor = {
      'easy': 0.7,
      'medium': 0.4,
      'hard': 0.1,
      'impossible': 0.0
    }[difficulty];

    if (Math.random() < randomFactor) {
      // Return a random valid move
      const availableMoves = board
        .map((cell, index) => cell === null ? index : null)
        .filter(index => index !== null) as number[];

      if (availableMoves.length > 0) {
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
      }
    }

    // Use the neural network to predict
    const input = tf.tensor2d([boardNumeric], [1, 9]);
    const prediction = this.tttModel.predict(input) as tf.Tensor;
    const predictionData = prediction.dataSync();

    // Find the best move that's available
    let bestMove = -1;
    let bestScore = -Infinity;

    for (let i = 0; i < 9; i++) {
      if (board[i] === null && predictionData[i] > bestScore) {
        bestScore = predictionData[i];
        bestMove = i;
      }
    }

    // Fallback to random if no valid move found
    if (bestMove === -1) {
      const availableMoves = board
        .map((cell, index) => cell === null ? index : null)
        .filter(index => index !== null) as number[];

      if (availableMoves.length > 0) {
        bestMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
      }
    }

    input.dispose();
    prediction.dispose();

    return bestMove;
  }

  // Predict opponent's next move in RPS
  predictRPSMove(playerHistory: string[], aiHistory: string[]): 'rock' | 'paper' | 'scissors' {
    if (!this.rpsModel) {
      console.error('RPS model not initialized');
      return ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)] as 'rock' | 'paper' | 'scissors';
    }

    // Encode the history into a numeric format
    // Use last 5 moves from each player (pad with 0s if not enough)
    const encodedHistory: number[] = [];
    
    // Encode player history (last 5 moves)
    const playerLast5 = playerHistory.slice(-5);
    for (let i = 0; i < 5; i++) {
      if (i < playerLast5.length) {
        encodedHistory.push(playerLast5[i] === 'rock' ? 0 : playerLast5[i] === 'paper' ? 1 : 2);
      } else {
        encodedHistory.push(0); // Padding
      }
    }
    
    // Encode AI history (last 5 moves)
    const aiLast5 = aiHistory.slice(-5);
    for (let i = 0; i < 5; i++) {
      if (i < aiLast5.length) {
        encodedHistory.push(aiLast5[i] === 'rock' ? 0 : aiLast5[i] === 'paper' ? 1 : 2);
      } else {
        encodedHistory.push(0); // Padding
      }
    }

    const input = tf.tensor2d([encodedHistory], [1, 10]);
    const prediction = this.rpsModel.predict(input) as tf.Tensor;
    const predictionData = prediction.dataSync();
    
    // Find the predicted player move (highest probability)
    let predictedPlayerMoveIndex = 0;
    let maxProb = predictionData[0];
    for (let i = 1; i < 3; i++) {
      if (predictionData[i] > maxProb) {
        maxProb = predictionData[i];
        predictedPlayerMoveIndex = i;
      }
    }
    
    // Counter the predicted move
    const predictedPlayerMove = ['rock', 'paper', 'scissors'][predictedPlayerMoveIndex] as 'rock' | 'paper' | 'scissors';
    const counterMove = this.getRPSCounterMove(predictedPlayerMove);
    
    input.dispose();
    prediction.dispose();
    
    return counterMove;
  }

  private getRPSCounterMove(move: 'rock' | 'paper' | 'scissors'): 'rock' | 'paper' | 'scissors' {
    switch (move) {
      case 'rock': return 'paper';
      case 'paper': return 'scissors';
      case 'scissors': return 'rock';
    }
  }

  // Predict next sequence in memory game
  predictMemorySequence(sequence: number[]): number {
    if (!this.memoryModel) {
      console.error('Memory model not initialized');
      return Math.floor(Math.random() * 9);
    }

    // Prepare input sequence
    const inputSequence = sequence.map(num => [num / 8]); // Normalize to 0-1 range
    
    const input = tf.tensor3d([inputSequence], [1, inputSequence.length, 1]);
    const prediction = this.memoryModel.predict(input) as tf.Tensor;
    const predictionData = prediction.dataSync();
    
    // Find the most probable next number
    let predictedIndex = 0;
    let maxProb = predictionData[0];
    for (let i = 1; i < 9; i++) {
      if (predictionData[i] > maxProb) {
        maxProb = predictionData[i];
        predictedIndex = i;
      }
    }
    
    input.dispose();
    prediction.dispose();
    
    return predictedIndex;
  }

  // Train the Tic-Tac-Toe model with game data
  async trainTicTacToeModel(gameData: Array<{board: (string | null)[], move: number}>): Promise<void> {
    if (!this.tttModel) {
      console.error('Tic-Tac-Toe model not initialized');
      return;
    }

    if (gameData.length < 10) {
      // Not enough data to train effectively
      return;
    }

    // Prepare training data
    const inputs: number[][] = [];
    const outputs: number[][] = [];

    for (const data of gameData) {
      // Convert board to numeric representation
      const boardNumeric = data.board.map(cell => {
        if (cell === 'O') return 1;   // AI's move
        if (cell === 'X') return -1;  // Player's move
        return 0;  // Empty space
      });

      // Create one-hot encoded output for the move
      const output = Array(9).fill(0);
      output[data.move] = 1;

      inputs.push(boardNumeric);
      outputs.push(output);
    }

    // Convert to tensors
    const xs = tf.tensor2d(inputs, [inputs.length, 9]);
    const ys = tf.tensor2d(outputs, [outputs.length, 9]);

    // Use a smaller learning rate for fine-tuning
    const optimizer = tf.train.adam(0.0005);
    this.tttModel.compile({ optimizer, loss: 'categoricalCrossentropy', metrics: ['accuracy'] });

    console.log(`Training Tic-Tac-Toe model with ${inputs.length} samples...`);

    // Train with early stopping concept
    await this.tttModel.fit(xs, ys, {
      epochs: 15,
      batchSize: 16,
      validationSplit: 0.15,
      shuffle: true,
      verbose: 0
    });

    console.log('Tic-Tac-Toe model training completed');

    xs.dispose();
    ys.dispose();
    optimizer.dispose();
  }

  // Train the RPS model with game data
  async trainRPSModel(gameData: Array<{playerMove: 'rock' | 'paper' | 'scissors', aiMove: 'rock' | 'paper' | 'scissors', outcome: 'win' | 'lose' | 'draw'}>): Promise<void> {
    if (!this.rpsModel) {
      console.error('RPS model not initialized');
      return;
    }

    if (gameData.length < 10) {
      // Not enough data to train effectively
      return;
    }

    // Create sequences of moves for better pattern recognition
    const sequenceLength = 3;
    const inputs: number[][] = [];
    const outputs: number[][] = [];

    // Create move sequences to identify patterns
    for (let i = sequenceLength; i < gameData.length; i++) {
      const sequence: number[] = [];

      // Add the last few player moves
      for (let j = i - sequenceLength; j < i; j++) {
        const game = gameData[j];
        // Encode player move: rock=0, paper=1, scissors=2
        sequence.push(game.playerMove === 'rock' ? 0 : game.playerMove === 'paper' ? 1 : 2);
      }

      // Add the last few AI moves
      for (let j = i - sequenceLength; j < i; j++) {
        const game = gameData[j];
        sequence.push(game.aiMove === 'rock' ? 0 : game.aiMove === 'paper' ? 1 : 2);
      }

      // Add the last few outcomes (win=0, lose=1, draw=2)
      for (let j = i - sequenceLength; j < i; j++) {
        const game = gameData[j];
        sequence.push(game.outcome === 'win' ? 0 : game.outcome === 'lose' ? 1 : 2);
      }

      // The target is the next player move
      const nextGame = gameData[i];
      const output = [
        nextGame.playerMove === 'rock' ? 1 : 0,
        nextGame.playerMove === 'paper' ? 1 : 0,
        nextGame.playerMove === 'scissors' ? 1 : 0
      ];

      inputs.push(sequence);
      outputs.push(output);
    }

    if (inputs.length > 0) {
      const xs = tf.tensor2d(inputs, [inputs.length, sequenceLength * 3]); // 3 sequences of length 3
      const ys = tf.tensor2d(outputs, [outputs.length, 3]);

      // Use a smaller learning rate for fine-tuning
      const optimizer = tf.train.adam(0.0005);
      this.rpsModel.compile({ optimizer, loss: 'categoricalCrossentropy', metrics: ['accuracy'] });

      console.log(`Training RPS model with ${inputs.length} samples...`);

      await this.rpsModel.fit(xs, ys, {
        epochs: 20,
        batchSize: 8,
        validationSplit: 0.15,
        shuffle: true,
        verbose: 0
      });

      console.log('RPS model training completed');

      xs.dispose();
      ys.dispose();
      optimizer.dispose();
    }
  }

  // Train the Memory model with game data
  async trainMemoryModel(gameData: Array<{sequence: number[], playerSequence: number[], success: boolean}>): Promise<void> {
    if (!this.memoryModel) {
      console.error('Memory model not initialized');
      return;
    }

    if (gameData.length < 5) {
      // Not enough data to train effectively
      return;
    }

    const inputs: number[][][] = [];
    const outputs: number[][] = [];

    // Process each game to create training samples
    for (const data of gameData) {
      if (data.sequence.length > 1) {
        // Create multiple training samples from one sequence
        // For each position in the sequence, train to predict the next
        for (let i = 1; i < data.sequence.length; i++) {
          // Input is the sequence up to position i-1
          const inputSequence = data.sequence.slice(0, i).map(num => [num / 8]); // Normalize 0-8 to 0-1

          // Output is the next expected number
          const output = Array(9).fill(0);
          output[data.sequence[i]] = 1;

          inputs.push(inputSequence);
          outputs.push(output);
        }
      }
    }

    if (inputs.length > 0) {
      // Pad sequences to the same length
      const maxLength = Math.max(...inputs.map(seq => seq.length));
      const paddedInputs = inputs.map(seq => {
        const padded = [...seq];
        while (padded.length < maxLength) {
          padded.push([0]); // Pad with zeros
        }
        return padded;
      });

      const xs = tf.tensor3d(paddedInputs, [paddedInputs.length, maxLength, 1]);
      const ys = tf.tensor2d(outputs, [outputs.length, 9]);

      // Use a smaller learning rate for fine-tuning
      const optimizer = tf.train.adam(0.0005);
      this.memoryModel.compile({ optimizer, loss: 'categoricalCrossentropy', metrics: ['accuracy'] });

      console.log(`Training Memory model with ${inputs.length} samples...`);

      await this.memoryModel.fit(xs, ys, {
        epochs: 25,
        batchSize: 4,
        validationSplit: 0.1,
        shuffle: true,
        verbose: 0
      });

      console.log('Memory model training completed');

      xs.dispose();
      ys.dispose();
      optimizer.dispose();
    }
  }

  // Get the trained models for saving
  getModels() {
    return {
      tttModel: this.tttModel,
      rpsModel: this.rpsModel,
      memoryModel: this.memoryModel
    };
  }
}

// Singleton instance
const enhancedArcadeAI = new EnhancedArcadeAI();

export default enhancedArcadeAI;