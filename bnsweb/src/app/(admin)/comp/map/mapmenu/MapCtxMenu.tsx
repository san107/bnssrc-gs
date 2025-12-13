// @flow
import { useHandleSetHome } from '@/app/(admin)/comp/map/mapmenu/useHandleSetHome';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import { Home } from '@mui/icons-material';
import { Box, styled } from '@mui/material';
import { useHandleAddFav } from '@/app/(admin)/comp/map/mapmenu/useHandleAddFav';
import { useDlgInput } from '@/app/(admin)/comp/popup/DlgInput';

type Props = {
  show: boolean;
  setShow: (v: boolean) => void;
  top: number;
  left: number;
};

export const MapCtxMenu = ({ show, top, left, setShow }: Props) => {
  const handleSetHome = useHandleSetHome({ top, left, setShow });
  const handleAddFavorites = useHandleAddFav({ top, left, setShow });
  const [dlgInput, DlgInput] = useDlgInput();

  return (
    <>
      {show && (
        <MenuBody
          className='absolute bg-white rounded-xs text-gray-700'
          sx={{ top, left, zIndex: 100, minWidth: 150 }}
        >
          <Box className='menu-item px-2 py-1' onClick={handleSetHome}>
            <Home sx={{ width: '18px' }} />
            &nbsp; 기본 위치로 지정
          </Box>
          <hr />
          <Box
            className='menu-item px-2 py-1'
            onClick={() => {
              dlgInput.current
                ?.show('즐겨찾기 이름 입력', ['즐겨찾기 이름을 입력하여 주십시오'])
                .then((fav_nm) => {
                  handleAddFavorites(fav_nm);
                })
                .catch((e) => {
                  console.error('E', e);
                })
                .finally(() => setShow(false));
            }}
          >
            <ControlPointIcon sx={{ width: '18px' }} />
            &nbsp; 즐겨찾기 추가
          </Box>
        </MenuBody>
      )}
      <DlgInput />
    </>
  );
};

const MenuBody = styled(Box)`
  border: 1px solid black;
  font-size: medium;
  & .menu-item {
    cursor: pointer;
    &:hover {
      background-color: #ddd;
    }
  }
`;
