import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useStore } from '@/store/useStore';

const useColor = () => {
  // color 설정
  const { setColor } = useSettingsStore();
  const color = useStore(useSettingsStore, (state) => {
    return !state.color ? 'blue' : state.color;
  });

  const [button, setButton] = useState<string>('');
  const [block, setBlock] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [lineColor, setLineColor] = useState<string>('');
  const [selColor, setSelColor] = useState<string>('');
  const [hovColor, setHovColor] = useState<string>('');

  useEffect(() => {
    if (color === 'blue') {
      setButton('btn-info');
      setBlock('author');
      setText('card-description');
      setLineColor('#01bfff');
      setSelColor('#1d8cf8');
      setHovColor('#264d91');
    } else if (color === 'pink') {
      setButton('btn-primary');
      setBlock('author2');
      setText('card-description2');
      setLineColor('#c552e9');
      setSelColor('#c552e9');
      setHovColor('#713875');
    } else {
      setButton('btn-warning');
      setBlock('author3');
      setText('card-description3');
      setLineColor('#df7962');
      setSelColor('#df7962');
      setHovColor('#ab594e');
    }
  }, [color]);

  return { color, button, block, text, lineColor, selColor, hovColor, setColor };
};

export default useColor;
