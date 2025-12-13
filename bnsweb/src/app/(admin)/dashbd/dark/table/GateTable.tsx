// @flow
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { CdIdLabel } from '@/app/(admin)/comp/input/CdIdLabel';
import { GateLabel } from '@/app/(admin)/comp/input/GateLabel';
import { ColGrp } from '@/app/(admin)/comp/table/ColGrp';
import { FormTd, FormTh, FormTr } from '@/app/(admin)/comp/table/FormTbl';
import { IfTbGate, TbGate } from '@/models/gate/tb_gate';
import { IfTbWater } from '@/models/water/tb_water';
import { IfTbCamera } from '@/models/tb_camera';
import * as gateutils from '@/utils/gate-utils';
import { Button } from '@mui/material';
import clsx from 'clsx';
import { useState } from 'react';
import useSWR from 'swr';
import useColor from '@/hooks/useColor';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useMobile } from '@/hooks/useMobile';
import axios from 'axios';

type Props = {
  selWater?: IfTbWater;
  mainOpen?: boolean;
  subOpen?: boolean;
  setSubOpen: (b: boolean, o?: IfTbGate) => void;
};
export const GateTable = ({ selWater, subOpen, setSubOpen }: Props) => {
  // 수위계가 있으면 연관 차단장비를, 없으면 전체 차단장비를 가져옴
  const { data: waterGates } = useSWR<IfTbGate[]>(
    selWater?.water_seq
      ? ['/api/water_gate/gatelist', { waterSeq: selWater.water_seq }]
      : ['/api/gate/list']
  );
  const [selGate, setSelGate] = useState<IfTbGate>(new TbGate());
  const { button } = useColor(); // color 설정
  const { theme } = useSettingsStore();
  const { isMobile } = useMobile();

  // 각 게이트의 보조 카메라 목록을 가져오기
  const { data: gateCameras } = useSWR<{ [key: number]: IfTbCamera[] }>(
    waterGates && waterGates.length > 0
      ? waterGates.map((gate) => `/api/gate_camera/camlist?gateSeq=${gate.gate_seq}`)
      : null,
    async (_urls) => {
      const results: { [key: number]: IfTbCamera[] } = {};
      for (const gate of waterGates || []) {
        try {
          const response = await axios.get(`/api/gate_camera/camlist?gateSeq=${gate.gate_seq}`);
          results[gate.gate_seq!] = response.data || [];
        } catch (error) {
          results[gate.gate_seq!] = [];
          console.log('error', error);
        }
      }
      return results;
    }
  );

  const handleClickRow = (ele: IfTbGate, bool: boolean) => {
    // if (mainOpen) {
    //   toast.error('주카메라를 먼저 닫고 확인바랍니다.');
    //   return;
    // }
    setSelGate(ele);
    setSubOpen(bool, ele);
  };

  return (
    <>
      <table
        width={'100%'}
        css={css`
          & .sel {
            background-color: ${theme === 'dark' ? 'rgba(36, 36, 39, 0.5)' : '#F5F7FF'};
          }
          & tr {
            cursor: pointer;
          }
        `}
        className={theme === 'dark' ? 'table-list' : 'table-list-light'}
      >
        <ColGrp cols={[3, 1, isMobile ? 0 : 2]} />
        <tbody>
          <FormTr>
            {/* <FormTh>No</FormTh> */}
            <FormTh>차단장비명</FormTh>
            <FormTh>상태</FormTh>
            {!isMobile && <FormTh>보조카메라</FormTh>}
          </FormTr>
          {waterGates && waterGates.length > 0 ? (
            waterGates?.map((ele) => {
              const subCameras = gateCameras?.[ele.gate_seq!] || [];
              const hasSubCameras = subCameras.length > 0;

              return (
                <FormTr
                  key={ele.gate_seq}
                  className={clsx({ sel: selGate.gate_seq === ele.gate_seq })}
                  onClick={() => handleClickRow(ele, false)}
                >
                  {/* <FormTd>{ele.gate_seq}</FormTd> */}
                  <FormTd className='left'>
                    <GateLabel gateSeq={ele.gate_seq} style={false} />
                  </FormTd>
                  <FormTd>
                    <span
                      className='bullet'
                      style={{ background: gateutils.gateStatColor(ele?.gate_stat) }}
                    ></span>
                    <span
                      style={{ color: gateutils.gateStatColor(ele?.gate_stat), paddingLeft: '5px' }}
                    >
                      <CdIdLabel grp='GS' id={ele?.gate_stat} />
                    </span>
                  </FormTd>
                  {!isMobile && (
                    <FormTd>
                      {hasSubCameras && (
                        <Button
                          className={
                            subOpen ? `btn btn-sm ${button} btn-simple` : `btn btn-sm ${button}`
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClickRow(ele, !subOpen);
                          }}
                          disabled={subOpen && selGate?.gate_seq !== ele.gate_seq}
                        >
                          {subOpen && selGate?.gate_seq === ele.gate_seq ? '닫기' : '보기'}
                        </Button>
                      )}
                    </FormTd>
                  )}
                </FormTr>
              );
            })
          ) : (
            <FormTr>
              <FormTd colSpan={3}>등록된 차단장비가 없습니다.</FormTd>
            </FormTr>
          )}
        </tbody>
      </table>
    </>
  );
};
