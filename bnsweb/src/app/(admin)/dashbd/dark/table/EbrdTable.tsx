// @flow
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { ColGrp } from '@/app/(admin)/comp/table/ColGrp';
import { FormTd, FormTh, FormTr } from '@/app/(admin)/comp/table/FormTbl';
import { IfTbEbrd } from '@/models/ebrd/tb_ebrd';
import { useSettingsStore } from '@/store/useSettingsStore';
import { CdIdLabel } from '@/app/(admin)/comp/input/CdIdLabel';
import * as ebrdutils from '@/utils/ebrd-utils';

type Props = {
  ebrds?: IfTbEbrd[];
};

export const EbrdTable = ({ ebrds }: Props) => {
  const { theme } = useSettingsStore();

  return (
    <table
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
      <ColGrp cols={[1, 4, 1]} />
      <tbody>
        <FormTr>
          <FormTh>No</FormTh>
          <FormTh>전광판명</FormTh>
          <FormTh>상태</FormTh>
        </FormTr>
        {ebrds && ebrds.length > 0 ? (
          ebrds?.map((ele, idx) => (
            <FormTr key={ele.ebrd_seq}>
              <FormTd>{idx + 1 || ele.ebrd_seq}</FormTd>
              <FormTd className='left'>{ele.ebrd_nm}</FormTd>
              <FormTd>
                <span
                  className='bullet'
                  style={{ background: ebrdutils.ebrdStatColor(ele.comm_stat) }}
                ></span>
                <span style={{ color: ebrdutils.ebrdStatColor(ele.comm_stat), paddingLeft: '5px' }}>
                  <CdIdLabel grp='CS' id={ele.comm_stat} />
                </span>
              </FormTd>
            </FormTr>
          ))
        ) : (
          <FormTr>
            <FormTd colSpan={4}>등록된 전광판이 없습니다.</FormTd>
          </FormTr>
        )}
      </tbody>
    </table>
  );
};
