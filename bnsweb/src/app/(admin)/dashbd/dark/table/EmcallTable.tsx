// @flow
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { ColGrp } from '@/app/(admin)/comp/table/ColGrp';
import { FormTd, FormTh, FormTr } from '@/app/(admin)/comp/table/FormTbl';
import { IfTbEmcall } from '@/models/emcall/tb_emcall';
import { useSettingsStore } from '@/store/useSettingsStore';
import { CdIdLabel } from '@/app/(admin)/comp/input/CdIdLabel';
import * as emcallutils from '@/utils/emcall-utils';

type Props = {
  emcalls?: IfTbEmcall[];
};

export const EmcallTable = ({ emcalls }: Props) => {
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
          <FormTh>비상통화장치명</FormTh>
          <FormTh>상태</FormTh>
        </FormTr>
        {emcalls && emcalls.length > 0 ? (
          emcalls?.map((ele, idx) => (
            <FormTr key={ele.emcall_seq}>
              <FormTd>{idx + 1 || ele.emcall_seq}</FormTd>
              <FormTd className='left'>{ele.emcall_nm}</FormTd>
              <FormTd>
                <span
                  className='bullet'
                  style={{ background: emcallutils.emcallStatColor(ele.comm_stat) }}
                ></span>
                <span
                  style={{ color: emcallutils.emcallStatColor(ele.comm_stat), paddingLeft: '5px' }}
                >
                  <CdIdLabel grp='CS' id={ele.comm_stat} />
                </span>
              </FormTd>
            </FormTr>
          ))
        ) : (
          <FormTr>
            <FormTd colSpan={4}>등록된 비상통화장치가 없습니다.</FormTd>
          </FormTr>
        )}
      </tbody>
    </table>
  );
};
