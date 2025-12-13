// @flow
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { CdIdLabel } from '@/app/(admin)/comp/input/CdIdLabel';
import { GateLabel } from '@/app/(admin)/comp/input/GateLabel';
import { ColGrp } from '@/app/(admin)/comp/table/ColGrp';
import { FormTd, FormTh, FormTr } from '@/app/(admin)/comp/table/FormTbl';
import { IfTbGate, TbGate } from '@/models/gate/tb_gate';
import { IfTbWater } from '@/models/water/tb_water';
import * as gateutils from '@/utils/gate-utils';
import { Button } from '@mui/material';
import clsx from 'clsx';
import { useState } from 'react';
import useSWR from 'swr';

type Props = {
  selWater: IfTbWater;
  mainOpen?: boolean;
  subOpen?: boolean;
  setSubOpen: (b: boolean, o?: IfTbGate) => void;
};
export const GateTable = ({ selWater, subOpen, setSubOpen }: Props) => {
  const { data: waterGates } = useSWR<IfTbGate[]>(
    !!selWater.water_seq && ['/api/water_gate/gatelist', { waterSeq: selWater.water_seq }]
  );
  const [selGate, setSelGate] = useState<IfTbGate>(new TbGate());

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
            background-color: #eef;
          }
          & tr {
            cursor: pointer;
          }
        `}
        className='table-list'
      >
        <ColGrp cols={[3, 1.5, 1.5]} />
        <tbody>
          <FormTr>
            {/* <FormTh>No</FormTh> */}
            <FormTh>이름</FormTh>
            <FormTh>상태</FormTh>
            <FormTh>보조카메라</FormTh>
          </FormTr>
          {waterGates && waterGates.length > 0 ? (
            waterGates?.map((ele) => (
              <FormTr
                key={ele.gate_seq}
                className={clsx({ sel: selGate.gate_seq === ele.gate_seq })}
              >
                {/* <FormTd>{ele.gate_seq}</FormTd> */}
                <FormTd className='left'>
                  <GateLabel gateSeq={ele.gate_seq} />
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
                <FormTd>
                  <Button
                    size='small'
                    color={subOpen ? 'secondary' : 'info'}
                    onClick={() => handleClickRow(ele, !subOpen)}
                    disabled={subOpen && selGate?.gate_seq !== ele.gate_seq}
                  >
                    {subOpen && selGate?.gate_seq === ele.gate_seq ? '닫기' : '보기'}
                  </Button>
                </FormTd>
              </FormTr>
            ))
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
