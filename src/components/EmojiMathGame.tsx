import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

// Emoji mappings for numbers and operations
const EMOJI_NUMBERS = {
  '🍎': 3,
  '🍌': 5,
  '🍇': 7,
  '🍓': 2,
  '🥕': 4,
  '🍊': 6,
  '🍉': 8,
  '🥝': 1,
  '🍒': 9
};

const EMOJI_OPERATORS = {
  '➕': '+',
  '➖': '-',
  '✖️': '*',
  '➗': '/'
};

const NUMBER_EMOJIS = Object.keys(EMOJI_NUMBERS);
const OPERATOR_EMOJIS = Object.keys(EMOJI_OPERATORS);

interface GameState {
  currentProblem: {
    num1: number;
    num2: number;
    operator: string;
    answer: number;
  };
  score: number;
  timeLeft: number;
  gameActive: boolean;
  userInput: string[];
  showFeedback: boolean;
  feedbackType: 'correct' | 'incorrect' | null;
}

const EmojiMathGame = () => {
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>({
    currentProblem: { num1: 0, num2: 0, operator: '+', answer: 0 },
    score: 0,
    timeLeft: 30,
    gameActive: false,
    userInput: [],
    showFeedback: false,
    feedbackType: null
  });

  // Generate a new math problem
  const generateProblem = useCallback(() => {
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    let num1, num2, answer;

    if (operator === '+') {
      num1 = Math.floor(Math.random() * 8) + 1;
      num2 = Math.floor(Math.random() * 8) + 1;
      answer = num1 + num2;
    } else if (operator === '-') {
      num1 = Math.floor(Math.random() * 10) + 5;
      num2 = Math.floor(Math.random() * num1) + 1;
      answer = num1 - num2;
    } else {
      num1 = Math.floor(Math.random() * 5) + 2;
      num2 = Math.floor(Math.random() * 5) + 2;
      answer = num1 * num2;
    }

    return { num1, num2, operator, answer };
  }, []);

  // Start game
  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      currentProblem: generateProblem(),
      score: 0,
      timeLeft: 30,
      gameActive: true,
      userInput: [],
      showFeedback: false,
      feedbackType: null
    }));
  };

  // Handle emoji button click
  const handleEmojiClick = (emoji: string) => {
    if (!gameState.gameActive || gameState.showFeedback) return;

    setGameState(prev => ({
      ...prev,
      userInput: [...prev.userInput, emoji]
    }));
  };

  // Clear user input
  const clearInput = () => {
    setGameState(prev => ({
      ...prev,
      userInput: []
    }));
  };

  // Check answer
  const checkAnswer = () => {
    if (!gameState.gameActive || gameState.userInput.length === 0) return;

    const inputString = gameState.userInput.join('');
    let calculatedAnswer = 0;
    
    // Parse the emoji input to calculate answer
    try {
      let expression = inputString;
      
      // Replace emojis with their values
      Object.entries(EMOJI_NUMBERS).forEach(([emoji, value]) => {
        expression = expression.split(emoji).join(value.toString());
      });
      
      Object.entries(EMOJI_OPERATORS).forEach(([emoji, operator]) => {
        expression = expression.split(emoji).join(operator);
      });

      // Evaluate the expression (simple cases only)
      calculatedAnswer = eval(expression);
    } catch {
      calculatedAnswer = -1; // Invalid input
    }

    const isCorrect = calculatedAnswer === gameState.currentProblem.answer;
    
    setGameState(prev => ({
      ...prev,
      showFeedback: true,
      feedbackType: isCorrect ? 'correct' : 'incorrect',
      score: isCorrect ? prev.score + 10 : prev.score
    }));

    // Show feedback toast
    toast({
      title: isCorrect ? "🎉 Correct!" : "😅 Try again!",
      description: isCorrect 
        ? `Great job! +10 points` 
        : `The answer was ${gameState.currentProblem.answer}`,
      duration: 1500
    });

    // Generate new problem after delay
    setTimeout(() => {
      if (gameState.gameActive) {
        setGameState(prev => ({
          ...prev,
          currentProblem: generateProblem(),
          userInput: [],
          showFeedback: false,
          feedbackType: null
        }));
      }
    }, 1500);
  };

  // Timer effect
  useEffect(() => {
    if (gameState.gameActive && gameState.timeLeft > 0) {
      const timer = setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState.timeLeft === 0) {
      setGameState(prev => ({
        ...prev,
        gameActive: false
      }));
      toast({
        title: "⏰ Time's up!",
        description: `Final score: ${gameState.score} points`,
        duration: 3000
      });
    }
  }, [gameState.gameActive, gameState.timeLeft, gameState.score, toast]);

  // Get timer emoji and class based on time left
  const getTimerDisplay = () => {
    if (gameState.timeLeft > 20) {
      return { emoji: '😊', className: 'timer-calm' };
    } else if (gameState.timeLeft > 10) {
      return { emoji: '😰', className: 'timer-warning' };
    } else {
      return { emoji: '😱', className: 'timer-danger' };
    }
  };

  const timerDisplay = getTimerDisplay();

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center space-y-6">
      {/* Game Header */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold text-primary">
          🧮 Emoji Math Madness! 🎯
        </h1>
        
        {gameState.gameActive && (
          <div className="flex items-center justify-center space-x-8">
            <div className="text-2xl font-bold">
              Score: <span className="text-primary">{gameState.score}</span>
            </div>
            <div className={`text-3xl font-bold ${timerDisplay.className}`}>
              {timerDisplay.emoji} {gameState.timeLeft}s
            </div>
          </div>
        )}
      </div>

      {/* Game Area */}
      <Card className="p-8 min-w-[600px] bg-card/80 backdrop-blur-sm shadow-[var(--shadow-game)]">
        {!gameState.gameActive && gameState.timeLeft === 30 ? (
          /* Start Screen */
          <div className="text-center space-y-6">
            <div className="text-xl text-muted-foreground">
              Solve math problems using emoji numbers and operators!
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>🍎 = 3</div>
              <div>🍌 = 5</div>
              <div>🍇 = 7</div>
              <div>➕ = +</div>
              <div>➖ = -</div>
              <div>✖️ = ×</div>
            </div>
            <Button 
              onClick={startGame}
              className="game-button text-2xl px-8 py-4"
            >
              🚀 Start Game!
            </Button>
          </div>
        ) : gameState.gameActive ? (
          /* Game Playing */
          <div className="space-y-6">
            {/* Current Problem */}
            <div className="text-center">
              <div className="text-4xl font-bold mb-4">
                {gameState.currentProblem.num1} {gameState.currentProblem.operator} {gameState.currentProblem.num2} = ?
              </div>
              
              {/* User Input Display */}
              <div className="min-h-[60px] p-4 bg-muted rounded-xl text-3xl border-2 border-dashed border-border">
                {gameState.userInput.length > 0 ? gameState.userInput.join(' ') : 'Select emojis...'}
              </div>
            </div>

            {/* Emoji Buttons */}
            <div className="space-y-4">
              {/* Number Emojis */}
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Numbers:</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {NUMBER_EMOJIS.map(emoji => (
                    <Button
                      key={emoji}
                      onClick={() => handleEmojiClick(emoji)}
                      className="number-button"
                      disabled={gameState.showFeedback}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Operator Emojis */}
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Operators:</h3>
                <div className="flex justify-center gap-2">
                  {OPERATOR_EMOJIS.map(emoji => (
                    <Button
                      key={emoji}
                      onClick={() => handleEmojiClick(emoji)}
                      className="operator-button"
                      disabled={gameState.showFeedback}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <Button
                onClick={clearInput}
                variant="outline"
                className="px-6 py-2"
                disabled={gameState.showFeedback}
              >
                🗑️ Clear
              </Button>
              <Button
                onClick={checkAnswer}
                className={gameState.showFeedback 
                  ? (gameState.feedbackType === 'correct' ? 'success-button' : 'error-button')
                  : 'game-button'
                }
                disabled={gameState.userInput.length === 0}
              >
                {gameState.showFeedback 
                  ? (gameState.feedbackType === 'correct' ? '🎉 Correct!' : '❌ Wrong')
                  : '✅ Submit'
                }
              </Button>
            </div>
          </div>
        ) : (
          /* Game Over */
          <div className="text-center space-y-6">
            <div className="text-3xl">🎮 Game Over!</div>
            <div className="text-2xl font-bold text-primary">
              Final Score: {gameState.score} points
            </div>
            <Button 
              onClick={startGame}
              className="game-button text-2xl px-8 py-4"
            >
              🔄 Play Again!
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default EmojiMathGame;