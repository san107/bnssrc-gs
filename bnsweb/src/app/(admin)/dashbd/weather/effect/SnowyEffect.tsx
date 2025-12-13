import { useEffect, useState } from 'react';

type Snowflake = {
  left: string;
  top: string;
  delay: string;
  duration: string;
  size: string;
  sway: string;
  opacity: string;
  rotate: string;
};

export const SnowyEffect = ({ theme }: { theme?: string }) => {
  const [snowflakes, setSnowflakes] = useState<Array<Snowflake>>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const newSnowflakes = Array.from({ length: 50 }).map(() => {
      const size = 1 + Math.random() * 5;
      const duration = 3 + Math.random() * 7;
      const swayAmount = 20 + Math.random() * 60;
      const rotateAmount = Math.random() * 360;

      return {
        left: `${Math.random() * 100}%`,
        top: '-10px',
        delay: `${Math.random() * 5}s`,
        duration: `${duration}s`,
        size: `${size}px`,
        sway: `${swayAmount}px`,
        opacity: `${0.3 + Math.random() * 0.7}`,
        rotate: `${rotateAmount}deg`,
      };
    });
    setSnowflakes(newSnowflakes);

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div style={{ opacity: 1, transition: 'opacity 1s ease-in' }}>
      {snowflakes.map((snowflake, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: snowflake?.left,
            top: snowflake?.top,
            width: snowflake?.size,
            height: snowflake?.size,
            background: theme === 'dark' ? '#fff' : '#b9babd',
            borderRadius: '50%',
            animation: 'snow linear infinite',
            animationDelay: snowflake?.delay,
            animationDuration: snowflake?.duration,
            opacity: snowflake?.opacity,
            transform: `rotate(${snowflake?.rotate})`,
          }}
        >
          <div
            style={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: theme === 'dark' ? '#fff' : '#b9babd',
              borderRadius: '50%',
              animation: 'sway ease-in-out infinite alternate',
              transform: `translateX(${snowflake?.sway})`,
              animationDuration: `${2 + Math.random() * 4}s`,
            }}
          />
        </div>
      ))}
      <style>
        {`
          @keyframes snow {
            0% {
              transform: translateY(0) rotate(0deg);
            }
            25% {
              transform: translateY(25vh) rotate(90deg);
            }
            50% {
              transform: translateY(50vh) rotate(180deg);
            }
            75% {
              transform: translateY(75vh) rotate(270deg);
            }
            100% {
              transform: translateY(calc(100vh + 100px)) rotate(360deg);
            }
          }
          @keyframes sway {
            0% {
              transform: translateX(0);
            }
            50% {
              transform: translateX(25px);
            }
            100% {
              transform: translateX(-25px);
            }
          }
        `}
      </style>
    </div>
  );
};
