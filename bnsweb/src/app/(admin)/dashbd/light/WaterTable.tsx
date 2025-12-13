// @flow
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { ColGrp } from '@/app/(admin)/comp/table/ColGrp';
import { FormTd, FormTh, FormTr } from '@/app/(admin)/comp/table/FormTbl';
import { IfTbWater } from '@/models/water/tb_water';
import clsx from 'clsx';
import { Dispatch, SetStateAction } from 'react';
import * as waterutils from '@/utils/water-utils';

type Props = {
  waters?: IfTbWater[];
  selWater: IfTbWater;
  setSelWater: Dispatch<SetStateAction<IfTbWater>>;
  mainOpen?: boolean;
  subOpen?: boolean;
};

export const WaterTable = ({ waters, selWater, setSelWater, mainOpen, subOpen }: Props) => {
  const handleClickRow = (ele: IfTbWater) => {
    if (mainOpen || subOpen) return;
    setSelWater(ele);
  };

  return (
    <table
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
      <ColGrp cols={[1, 2.2, 3, 2]} />
      <tbody>
        <FormTr>
          <FormTh>No</FormTh>
          <FormTh>장치ID</FormTh>
          <FormTh>이름</FormTh>
          <FormTh>상태</FormTh>
        </FormTr>
        {waters?.map((ele, idx) => (
          <FormTr
            key={ele.water_seq}
            onClick={() => {
              handleClickRow(ele);
            }}
            className={clsx({ sel: selWater.water_seq === ele.water_seq })}
          >
            <FormTd>{idx + 1 || ele.water_seq}</FormTd>
            <FormTd>{ele.water_dev_id}</FormTd>
            <FormTd>{ele.water_nm}</FormTd>
            <FormTd>
              <span
                className='bullet'
                style={{ background: waterutils.getWaterStatColor(ele) }}
              ></span>
              <span style={{ color: waterutils.getWaterStatColor(ele), paddingLeft: '5px' }}>
                {waterutils.getWaterStat(ele)}
              </span>
            </FormTd>
          </FormTr>
        ))}
      </tbody>
    </table>
  );
};
