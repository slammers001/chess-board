import { Bot, Zap, Brain } from 'lucide-react';

type BotDifficulty = 'easy' | 'medium' | 'hard';

interface BotSelectionDialogProps {
  onSelect: (difficulty: BotDifficulty) => void;
  onCancel: () => void;
}

export function BotSelectionDialog({ onSelect, onCancel }: BotSelectionDialogProps) {
  const botOptions = [
    {
      difficulty: 'easy' as BotDifficulty,
      name: 'Easy',
      description: 'Perfect for beginners - makes occasional mistakes',
      icon: Bot,
      color: 'bg-green-100 hover:bg-green-200 border-green-300',
      iconColor: 'text-green-600',
      disabled: false,
    },
    {
      difficulty: 'medium' as BotDifficulty,
      name: 'Medium',
      description: 'Challenging but fair - good intermediate opponent',
      icon: Zap,
      color: 'bg-gray-100 border-gray-300',
      iconColor: 'text-gray-400',
      disabled: true,
    },
    {
      difficulty: 'hard' as BotDifficulty,
      name: 'Hard',
      description: 'Strong opponent - think carefully!',
      icon: Brain,
      color: 'bg-gray-100 border-gray-300',
      iconColor: 'text-gray-400',
      disabled: true,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Choose Bot Difficulty</h2>
        <p className="text-gray-600 text-center mb-6">Select how challenging you want your opponent to be</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {botOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.difficulty}
                onClick={() => !option.disabled && onSelect(option.difficulty)}
                disabled={option.disabled}
                className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                  option.disabled 
                    ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-60' 
                    : `${option.color} hover:scale-105`
                }`}
              >
                <Icon size={32} className={`mx-auto mb-3 ${option.iconColor}`} />
                <h3 className="font-bold text-gray-800 mb-2">{option.name}</h3>
                <p className="text-sm text-gray-600">{option.description}</p>
                {option.disabled && (
                  <p className="text-xs text-gray-400 mt-2 italic">Coming soon</p>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex justify-center">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
