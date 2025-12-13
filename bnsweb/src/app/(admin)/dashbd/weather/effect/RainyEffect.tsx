import { useEffect, useState } from 'react';

type Drop = {
  left: string;
  delay: string;
  duration: string;
};

export const RainyEffect = ({ theme }: { theme?: string }) => {
  const [drops, setDrops] = useState<Array<Drop>>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const newDrops = Array.from({ length: 50 }).map(() => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${0.5 + Math.random() * 0.5}s`,
    }));
    setDrops(newDrops);

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.5s ease-in' }}>
      {drops.map((drop, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: drop?.left,
            width: '2px',
            height: '100px',
            background:
              theme === 'dark' || !theme
                ? 'linear-gradient(transparent, rgba(255, 255, 255, 0.8))'
                : 'linear-gradient(transparent, rgba(134, 134, 134, 0.8))',
            animation: 'rain linear infinite',
            animationDelay: drop?.delay,
            animationDuration: drop?.duration,
            opacity: 0.6,
          }}
        />
      ))}
      <style>
        {`
          @keyframes rain {
            0% {
              transform: translateY(-100px);
            }
            100% {
              transform: translateY(calc(100vh + 100px));
            }
          }
        `}
      </style>
    </div>
  );
};
