import { IfTbBoard } from '@/models/tb_board';
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import { DlgNotice } from '../popup/DlgNotice';

export const NoticeTicker = () => {
  const { data, error } = useSWR<IfTbBoard[]>(['/api/board/list', { bd_type: 'NOTICE' }]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<IfTbBoard | null>(null);

  useEffect(() => {
    if (!data) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % data.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [data]);

  const handleClick = (item: IfTbBoard) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  if (error) return <div>에러가 발생했습니다.</div>;
  if (!data) return <div>로딩중...</div>;
  if (data.length === 0) return <div className='no-data'>게시물이 없습니다.</div>;

  const currentItem = data[currentIndex];
  const formattedDate = currentItem?.bd_create_dt
    ? new Date(currentItem.bd_create_dt).toISOString().split('T')[0]
    : '';

  return (
    <>
      <div className='tickerContainer'>
        <div className='tickerContent' onClick={() => handleClick(currentItem)}>
          <span className='date'>{formattedDate}</span>
          <span className='title'>{currentItem?.bd_title}</span>
        </div>
        <style jsx>{`
          .tickerContainer {
            width: 100%;
            height: 40px;
            background-color: transparent;
            overflow: hidden;
            position: relative;
            display: flex;
            align-items: center;
          }

          .tickerContent {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0 1rem;
            animation: slide 10s ease-in-out infinite;
            opacity: 1;
            cursor: pointer;
          }

          .date {
            color: #09f3e3;
            font-size: 0.9rem;
            white-space: nowrap;
          }

          .title {
            color: #fff;
            font-weight: 500;
            white-space: nowrap;
          }

          .no-data {
            width: 100%;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 0.9rem;
          }

          @keyframes slide {
            0% {
              transform: translateX(100%);
              opacity: 0;
            }
            10% {
              transform: translateX(0);
              opacity: 1;
            }
            80% {
              transform: translateX(0);
              opacity: 1;
            }
            100% {
              transform: translateX(-100%);
              opacity: 0;
            }
          }
        `}</style>
      </div>

      <DlgNotice
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        notice={selectedItem}
      />
    </>
  );
};
