// @flow
import { useMapClickStore } from '@/app/(admin)/comp/map/useMapClickStore';
import { Box } from '@mui/material';
// import { toast } from 'sonner';
import { copyText } from '@/utils/str-utils';
type Props = {};
export const LabelLatLng = ({}: Props) => {
  const { clickInfo: info } = useMapClickStore();
  const handleClick = () => {
    // Copy the text inside the text field
    const s = `${info.lat},${info.lng},${info.zoom}`;
    // window.navigator.clipboard.writeText(s);
    // toast.success(`복사되었습니다.(${s})`);

    copyText(s, '위도,경도,줌');
  };
  return (
    <>
      {info.lat ? (
        <Box
          onClick={handleClick}
          className='absolute right-0 bottom-0 z-50 bg-white text-black rounded-sm px-2 opacity-70 cursor-pointer'
        >
          {info.lat && `위도 ${info.lat} 경도 ${info.lng} 줌 ${info.zoom}`}
        </Box>
      ) : null}
    </>
  );
};
