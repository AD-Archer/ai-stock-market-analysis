interface ProgressBarProps {
  progress: number;
  total: number;
  message: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, total, message }) => {
  const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <div className="mb-6">
      {/* Progress bar container */}
      <div className="w-full bg-gray-200 rounded-full h-6 dark:bg-gray-700 overflow-hidden">
        {/* Progress bar */}
        <div 
          className="bg-primary h-6 rounded-full flex items-center justify-center text-xs font-medium text-white transition-all duration-300"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {percentage > 5 ? `${percentage}%` : ''}
        </div>
      </div>
      
      {/* Message below progress bar */}
      <div className="text-center mt-2 text-sm text-gray-600 dark:text-gray-300">{message}</div>
    </div>
  );
};

export default ProgressBar; 