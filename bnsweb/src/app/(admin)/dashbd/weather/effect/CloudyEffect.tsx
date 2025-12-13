import { useEffect, useState } from 'react';

export const CloudyEffect = ({ theme }: { theme?: string }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.5s ease-in',
        backgroundImage: `url("/images/clouds-01.png"), 
                        url("/images/none.png"), 
                        url("/images/clouds-02.png"), 
                        url("/images/none.png")`,
        backgroundSize: '100%, 40%, 50%, 20%',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '-300px 10%, -200px 70%, 200px 40%, 400px 80%',
        filter: theme === 'dark' ? 'none' : 'brightness(0.8)',
        animation: 'animater 50s linear infinite',
      }}
    >
      <style>
        {`
          @keyframes animater {
            0% {
              background-position: -300px 10%, -200px 70%, 200px 40%, 400px 80%;
            }
            33% {
              background-position: calc(50vw - 150px) 10%, calc(50vw - 100px) 70%, calc(50vw - 50px) 40%, calc(50vw - 25px) 80%;
            }
            66% {
              background-position: -300px 10%, -200px 70%, 200px 40%, 400px 80%;
            }
            100% {
              background-position: calc(50vw - 150px) 10%, calc(50vw - 100px) 70%, calc(50vw - 50px) 40%, calc(50vw - 25px) 80%;
            }
          }
        `}
      </style>
    </div>
  );
};
