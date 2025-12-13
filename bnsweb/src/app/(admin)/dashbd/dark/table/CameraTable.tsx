// @flow
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { ColGrp } from '@/app/(admin)/comp/table/ColGrp';
import { FormTd, FormTh, FormTr } from '@/app/(admin)/comp/table/FormTbl';
import { IfTbCamera } from '@/models/tb_camera';
import { camerautils } from '@/utils/camera-utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import { CdIdLabel } from '@/app/(admin)/comp/input/CdIdLabel';

type Props = {
  cameras?: IfTbCamera[];
  isMobile: boolean;
};

export const CameraTable = ({ cameras, isMobile }: Props) => {
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
          <FormTh>카메라명</FormTh>
          <FormTh>상태</FormTh>
        </FormTr>
        {!isMobile && cameras && cameras.length > 0 ? (
          cameras?.map((ele, idx) => (
            <FormTr key={ele.cam_seq}>
              <FormTd>{idx + 1 || ele.cam_seq}</FormTd>
              <FormTd className='left'>{ele.cam_nm}</FormTd>
              <FormTd>
                <span
                  className='bullet'
                  style={{ background: camerautils.statColor(ele.cam_stat) }}
                ></span>
                <span style={{ color: camerautils.statColor(ele.cam_stat), paddingLeft: '5px' }}>
                  <CdIdLabel grp='CS' id={ele.cam_stat} />
                </span>
              </FormTd>
            </FormTr>
          ))
        ) : (
          <FormTr>
            <FormTd colSpan={4}>등록된 카메라가 없습니다.</FormTd>
          </FormTr>
        )}
      </tbody>
    </table>
  );
};
