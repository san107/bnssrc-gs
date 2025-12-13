'use client';
import { NcdCombo } from '@/app/(admin)/comp/input/NcdCombo';
import { ColGrp } from '@/app/(admin)/comp/table/ColGrp';
import { FormTd, FormTh, FormTr } from '@/app/(admin)/comp/table/FormTbl';
import { SelectD2 } from '@/app/(admin)/settings/comp/SelectD2';
import { SelectN } from '@/app/(admin)/settings/comp/SelectN';
import { StyledFormTbl } from '@/app/(admin)/settings/comp/StyledForm';
import { DayPicker } from '@/app/(admin)/settings/ebrd/comp/DayPicker';
import { get_end_efcts, get_start_efcts } from '@/app/(admin)/settings/ebrd/msg/msg-cb-filter';
import { IfTbEbrd } from '@/models/ebrd/tb_ebrd';
import { IfTbEbrdMsg } from '@/models/ebrd/tb_ebrd_msg';
import { ymd } from '@/utils/time-util';
import { Box, Checkbox } from '@mui/material';
import 'react-datepicker/dist/react-datepicker.css';

type Props = {
  sel?: IfTbEbrd;
  ebrdMsg?: IfTbEbrdMsg | null;
  setEbrdMsg: (ebrdMsg: IfTbEbrdMsg) => void;

  msgPos?: number | null;
  topBorder?: boolean;
  edit?: boolean; // 수정 모드 - 전광판 w, h를 메시지에 있는 것으로 사용.
};
export const EbrdMsgTbl = ({ sel, ebrdMsg, setEbrdMsg, msgPos, topBorder, edit }: Props) => {
  return (
    <StyledFormTbl
      width={'100%'}
      sx={{ '& td, & th': { height: '40px' } }}
      className={topBorder ? 'top-border' : ''}
    >
      <ColGrp cols={[35, 65, 35, 65]} />
      <tbody>
        <FormTr>
          <FormTh sx={{ color: 'red' }}>긴급</FormTh>
          <FormTd>
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
              onClick={() => {
                if (msgPos) return;
                setEbrdMsg({ ...ebrdMsg, emerg_yn: ebrdMsg?.emerg_yn === 'Y' ? 'N' : 'Y' });
              }}
            >
              <Checkbox checked={ebrdMsg?.emerg_yn === 'Y'} />
              긴급 메시지
            </Box>
          </FormTd>
          <FormTh>소리</FormTh>
          <FormTd>
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
              onClick={() =>
                setEbrdMsg({ ...ebrdMsg, sound_yn: ebrdMsg?.sound_yn === 'Y' ? 'N' : 'Y' })
              }
            >
              <Checkbox checked={ebrdMsg?.sound_yn === 'Y'} />
              사이렌
            </Box>
          </FormTd>
        </FormTr>
        <FormTr>
          <FormTh>크기(가로 x 세로)</FormTh>
          <FormTd sx={{ pr: 3 }}>
            {sel?.ebrd_id && (
              <Box sx={{ display: 'flex', alignItems: 'center', minHeight: '40px' }}>
                가로 {edit ? ebrdMsg?.ebrd_size_w : sel?.ebrd_size_w} X 세로{' '}
                {edit ? ebrdMsg?.ebrd_size_h : sel?.ebrd_size_h}
              </Box>
            )}
          </FormTd>
          <FormTh>표출대기</FormTh>
          <FormTd sx={{ pr: 3, textAlign: 'left' }}>
            <SelectN
              start={0}
              end={30}
              val={ebrdMsg?.start_wait_time || 0}
              setVal={(v) => setEbrdMsg({ ...ebrdMsg, start_wait_time: v })}
            />
          </FormTd>
        </FormTr>
        <FormTr>
          <FormTh>시작 일자</FormTh>
          <FormTd sx={{ pr: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DayPicker
                sx={{ pl: 1, pr: 1 }}
                disabled={ebrdMsg?.emerg_yn === 'Y'}
                ymd={ebrdMsg?.start_dt}
                setYmd={(v) => setEbrdMsg({ ...ebrdMsg, start_dt: v })}
              />
              &nbsp;
              <SelectD2
                start={0}
                end={23}
                disabled
                val={ymd.gethour(ebrdMsg?.start_dt)}
                sx={{ minWidth: '40px' }}
                setVal={(v) => {
                  const dt = ebrdMsg?.start_dt ? ebrdMsg.start_dt : ymd.gettoday() + '0000';
                  setEbrdMsg({ ...ebrdMsg, start_dt: ymd.sethour(dt, v) });
                }}
              />
              <Box sx={{ padding: '0 10px' }}>시</Box>
              <SelectD2
                start={0}
                end={59}
                disabled
                val={ymd.getminute(ebrdMsg?.start_dt)}
                sx={{ minWidth: '40px' }}
                setVal={(v) => {
                  const dt = ebrdMsg?.start_dt ? ebrdMsg.start_dt : ymd.gettoday() + '2359';
                  setEbrdMsg({ ...ebrdMsg, start_dt: ymd.setminute(dt, v) });
                }}
              />
              <Box sx={{ padding: '0 10px' }}>분</Box>
            </Box>
          </FormTd>
          <FormTh>완료 일자</FormTh>
          <FormTd sx={{ pr: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DayPicker
                disabled={ebrdMsg?.emerg_yn === 'Y'}
                sx={{ pl: 1, pr: 1 }}
                ymd={ebrdMsg?.end_dt}
                setYmd={(v) => setEbrdMsg({ ...ebrdMsg, end_dt: v })}
              />
              &nbsp;
              <SelectD2
                start={0}
                end={23}
                disabled
                val={ymd.gethour(ebrdMsg?.end_dt)}
                sx={{ minWidth: '40px' }}
                setVal={(v) => {
                  const dt = ebrdMsg?.end_dt ? ebrdMsg.end_dt : ymd.gettoday() + '0000';
                  setEbrdMsg({ ...ebrdMsg, end_dt: ymd.sethour(dt, v) });
                }}
              />
              <Box sx={{ padding: '0 10px' }}>시</Box>
              <SelectD2
                start={0}
                end={59}
                disabled
                val={ymd.getminute(ebrdMsg?.end_dt)}
                sx={{ minWidth: '40px' }}
                setVal={(v) => {
                  const dt = ebrdMsg?.end_dt ? ebrdMsg.end_dt : ymd.gettoday() + '0000';
                  setEbrdMsg({ ...ebrdMsg, end_dt: ymd.setminute(dt, v) });
                }}
              />
              <Box sx={{ padding: '0 10px' }}>분</Box>
            </Box>
          </FormTd>
        </FormTr>

        <FormTr>
          <FormTh>시작효과</FormTh>
          <FormTd sx={{ pr: 3, textAlign: 'left' }}>
            <NcdCombo
              grp='StartEfct'
              value={ebrdMsg?.start_efct}
              onChange={(v) => setEbrdMsg({ ...ebrdMsg, start_efct: v })}
              sx={{ minWidth: '150px' }}
              inlist={get_start_efcts(sel?.ebrd_type)}
            />
          </FormTd>
          <FormTh>완료효과</FormTh>
          <FormTd sx={{ pr: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <NcdCombo
                grp='EndEfct'
                value={ebrdMsg?.end_efct}
                onChange={(v) => setEbrdMsg({ ...ebrdMsg, end_efct: v })}
                sx={{ minWidth: '150px' }}
                inlist={get_end_efcts(sel?.ebrd_type)}
              />
            </Box>
          </FormTd>
        </FormTr>
        <FormTr>
          <FormTh>시작속도</FormTh>
          <FormTd sx={{ pr: 3, textAlign: 'left' }}>
            <NcdCombo
              grp='StartSpd'
              value={ebrdMsg?.start_spd}
              onChange={(v) => setEbrdMsg({ ...ebrdMsg, start_spd: v })}
              sx={{ minWidth: '150px' }}
            />
          </FormTd>
          <FormTh>완료속도</FormTh>
          <FormTd sx={{ pr: 3, textAlign: 'left' }}>
            <NcdCombo
              grp='EndSpd'
              value={ebrdMsg?.end_spd}
              onChange={(v) => setEbrdMsg({ ...ebrdMsg, end_spd: v })}
              sx={{ minWidth: '150px' }}
            />
          </FormTd>
        </FormTr>
        {/* <FormTr>
          <FormTh>표출대기</FormTh>
          <FormTd sx={{ pr: 3, textAlign: 'left' }}>
            <SelectN
              start={0}
              end={30}
              val={ebrdMsg?.start_wait_time || 0}
              setVal={(v) => setEbrdMsg({ ...ebrdMsg, start_wait_time: v })}
            />
          </FormTd>
          <FormTh>반복회수</FormTh>
          <FormTd sx={{ pr: 3, textAlign: 'left' }}>
            <SelectN
              start={1}
              end={10}
              val={ebrdMsg?.repeat_cnt || 1}
              setVal={(v) => setEbrdMsg({ ...ebrdMsg, repeat_cnt: v })}
            />
          </FormTd>
        </FormTr> */}
      </tbody>
    </StyledFormTbl>
  );
};
