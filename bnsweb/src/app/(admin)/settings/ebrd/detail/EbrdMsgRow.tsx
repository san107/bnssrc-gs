// @flow
import { useConfirm } from '@/app/(admin)/comp/popup/DlgConfirm';
import { useDlgImg } from '@/app/(admin)/comp/popup/DlgImg';
import { ColGrp } from '@/app/(admin)/comp/table/ColGrp';
import { FormTd, FormTh, FormTr } from '@/app/(admin)/comp/table/FormTbl';
import { StyledFormTbl } from '@/app/(admin)/settings/comp/StyledForm';
import { FileLink } from '@/app/(admin)/settings/ebrd/detail/FileLink';
import { MsgTime } from '@/app/(admin)/settings/ebrd/detail/MsgTime';
import { useImgRefreshDate } from '@/hooks/useImgRefresh';
import { IfTbEbrd } from '@/models/ebrd/tb_ebrd';
import { IfEbrdMsgInfo } from '@/models/ebrd/tb_ebrd_msg';
import { get_err_msg } from '@/utils/err-util';
import { swrMutator } from '@/utils/swr-provider';
import { Box, Button, styled } from '@mui/material';
import clsx from 'clsx';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';

type Props = {
  ebrd: IfTbEbrd;
  ele: IfEbrdMsgInfo;
  edit: (ele: IfEbrdMsgInfo) => void;
};
export const EbrdMsgRow = ({ ebrd, ele, edit }: Props) => {
  const confirm = useConfirm();
  const { mutate } = useSWRConfig();

  const apiRoomDel = useSWRMutation('/api/ebrd/ctrl/room_del', swrMutator);
  const handleDeleteRoom = () => {
    confirm('삭제', ['삭제하시겠습니까?'])?.then(({}) => {
      apiRoomDel
        .trigger({ ebrd_seq: ele.ebrd_seq, ebrd_msg_pos: ele.ebrd_msg_pos })
        .then((res) => {
          console.log('res', res.data);
          toast.success('삭제 하였습니다');
          mutate(() => true);
        })
        .catch((e) => {
          console.error('E', e);
          toast.error('삭제 실패하였습니다(' + e?.message + ')');
          mutate(() => true);
        });
    });
  };

  const apiRoomInfo = useSWRMutation('/api/ebrd/ctrl/room_info_by_seq', swrMutator);

  const handleSendRoom = () => {
    console.log('handleSendRoom', ele);

    apiRoomInfo
      .trigger({
        ebrd_seq: ele.ebrd_seq,
        ebrd_msg_pos: ele.ebrd_msg_pos,
      })
      .then((res) => {
        console.log('res', res.data);
        toast.success('전송 하였습니다');
        mutate(() => true);
      })
      .catch((e) => {
        console.error('E', e);
        toast.error('전송 실패하였습니다(' + get_err_msg(e) + ')');
        mutate(() => true);
      });
  };

  const apiUpdateEmerMsgPos = useSWRMutation('/api/ebrd/update_emer_msg_pos', swrMutator);

  const handleUpdateEmerMsgPos = (clear: boolean) => {
    apiUpdateEmerMsgPos
      .trigger({ ebrd_seq: ebrd.ebrd_seq, ebrd_emer_msg_pos: clear ? undefined : ele.ebrd_msg_pos })
      .then((res) => {
        console.log('res', res.data);
        toast.success(clear ? '비상메시지 해제 하였습니다' : '비상메시지로 지정 하였습니다');
        mutate(() => true);
      })
      .catch((e) => {
        console.error('E', e);
        toast.error(
          clear
            ? '비상메시지 해제 실패하였습니다(' + get_err_msg(e) + ')'
            : '비상메시지로 지정 실패하였습니다(' + get_err_msg(e) + ')'
        );
        mutate(() => true);
      });
  };

  //const [dlgEbrdMsgEdit, DlgEbrdMsgEdit] = useDlgEbrdMsgEdit();
  const [dlgImg, DlgImg] = useDlgImg();
  const handleEbrdMsgModify = () => {
    //dlgEbrdMsgEdit.current?.show({ ebrd_seq: ebrd.ebrd_seq, ebrd_msg_pos: ele.ebrd_msg_pos });
    edit(ele);
  };

  const handleImgClick = (file_seq: number | undefined) => {
    console.log('handleImgClick', file_seq);
    if (file_seq) {
      dlgImg.current?.show({ file_seq });
    }
  };

  const imgKey = useImgRefreshDate(ele.file_seq);

  const useEmerMsg = false;
  return (
    <StyledFormTbl
      className='top-light-border'
      width={'100%'}
      sx={{
        '& td, & th': { height: '30px' },
        '& .emerg-msg': { color: 'red', fontWeight: 'bold' },
      }}
    >
      <ColGrp cols={[1, 2, 1, 2, 7]} />
      <tbody>
        <FormTr>
          <FormTh>방번호</FormTh>
          <FormTd sx={{ pr: 3, textAlign: 'left' }}>
            {ele?.ebrd_msg_pos} ({ele?.ebrd_msg_seq})
          </FormTd>
          <FormTh className={clsx({ 'emerg-msg': ele?.emerg_yn === 'Y' })}>긴급</FormTh>
          <FormTd
            className={clsx({ 'emerg-msg': ele?.emerg_yn === 'Y' })}
            sx={{ pr: 3, textAlign: 'left', '& span': { color: 'red', paddingLeft: 1 } }}
          >
            {ele?.emerg_yn}

            {ebrd?.ebrd_emer_msg_pos === ele?.ebrd_msg_pos && <span>(비상메시지)</span>}
          </FormTd>
          <FormTd rowSpan={10}>
            <Box sx={{ display: 'flex', justifyContent: 'center', border: '1px solid #ccc' }}>
              {ele.start_efct === 16 ? (
                <MsgTime width={ele.ebrd_size_w} height={ele.ebrd_size_h} />
              ) : (
                <>
                  {ele.ebrd_msg_type === 'Video' ? (
                    <div className='p-8'>
                      <div className='text-3xl h-10'>비디오</div>
                      <FileLink fileSeq={ele.file_seq} />
                    </div>
                  ) : (
                    <Img
                      src={`/api/file/download_nocache?fileSeq=${ele.file_seq}&key=${imgKey}`}
                      alt='이미지'
                      onClick={() => handleImgClick(ele.file_seq)}
                    />
                  )}
                </>
              )}
            </Box>
          </FormTd>
        </FormTr>
        <FormTr>
          <FormTh>타입</FormTh>
          <FormTd sx={{ pr: 3, textAlign: 'left' }}>
            {ele.start_efct === 16 ? 'Time(시작효과)' : ele.ebrd_msg_type}
          </FormTd>
          <FormTh>사이렌</FormTh>
          <FormTd sx={{ pr: 3, textAlign: 'left' }}>{ele.sound_yn}</FormTd>
        </FormTr>
        <FormTr>
          <FormTh>시작</FormTh>
          <FormTd sx={{ pr: 3, textAlign: 'left' }}>{ele.start_dt}</FormTd>
          <FormTh>종료</FormTh>
          <FormTd sx={{ pr: 3, textAlign: 'left' }}>{ele.end_dt}</FormTd>
        </FormTr>
        <FormTr>
          <FormTh>전송상태</FormTh>
          <FormTd sx={{ pr: 3, textAlign: 'left' }}>
            {ele.send_stat == 'Y' ? (
              <span className='text-green-500 font-bold'>전송</span>
            ) : (
              <span className='text-red-500 font-bold'>미전송</span>
            )}
          </FormTd>
          <FormTh>전송결과</FormTh>
          <FormTd sx={{ pr: 3, textAlign: 'left' }}>{ele.send_rslt}</FormTd>
        </FormTr>
        <FormTr>
          <FormTd colSpan={4}>
            <Box display='flex' gap={1} justifyContent='center'>
              <Button
                variant='outlined'
                color='primary'
                onClick={handleSendRoom}
                disabled={apiRoomInfo.isMutating}
              >
                전송
              </Button>
              {true && (
                <Button variant='outlined' color='warning' onClick={handleEbrdMsgModify}>
                  수정
                </Button>
              )}
              <Button
                variant='outlined'
                color='error'
                onClick={handleDeleteRoom}
                disabled={apiRoomDel.isMutating}
              >
                삭제
              </Button>

              {useEmerMsg && ele?.ebrd_msg_pos && ele.ebrd_msg_pos < 6 && (
                <Button
                  variant='outlined'
                  color='primary'
                  onClick={() =>
                    handleUpdateEmerMsgPos(ebrd?.ebrd_emer_msg_pos === ele.ebrd_msg_pos)
                  }
                >
                  {ebrd?.ebrd_emer_msg_pos === ele.ebrd_msg_pos
                    ? '비상메시지 해제'
                    : '비상메시지로 지정'}
                </Button>
              )}
            </Box>
          </FormTd>
        </FormTr>
      </tbody>
      <DlgImg />
    </StyledFormTbl>
  );
};

const Img = styled('img')`
  max-height: 230px;
  cursor: pointer;
`;
