import EmojiMathGame from '@/components/EmojiMathGame';
import gameBackground from '@/assets/game-background.jpg';

const Index = () => {
  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: `url(${gameBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-background/40 backdrop-blur-sm"></div>
      <div className="relative z-10">
        <EmojiMathGame />
      </div>
    </div>
  );
};

export default Index;
