interface ProgressBarProps {
  progress: number;
  total: number;
  message: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, total, message }) => {
  const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <div className="progress-container mb-4">
      <div className="progress" style={{ height: '25px' }}>
        <div
          className="progress-bar progress-bar-striped progress-bar-animated"
          role="progressbar"
          style={{ width: `${percentage}%` }}
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {percentage}%
        </div>
      </div>
      <div className="text-center mt-2">{message}</div>
    </div>
  );
};

export default ProgressBar; 