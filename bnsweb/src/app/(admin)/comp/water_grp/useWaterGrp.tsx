import { IfDlgCommErr, useDlgCommErr } from '@/app/(admin)/comp/water_grp/DlgCommErr';
import {
  IfDlgWaterGrpCrit,
  useDlgWaterGrpCrit,
} from '@/app/(admin)/comp/water_grp/DlgWaterGrpCrit';
import {
  IfDlgWaterGrpWarn,
  useDlgWaterGrpWarn,
} from '@/app/(admin)/comp/water_grp/DlgWaterGrpWarn';
import { JSX, RefObject } from 'react';

export const useWaterGrp = (): {
  refCommErr: RefObject<IfDlgCommErr>;
  DlgCommErr: () => JSX.Element;
  refWaterGrpWarn: RefObject<IfDlgWaterGrpWarn>;
  DlgWaterGrpWarn: () => JSX.Element;
  refWaterGrpCrit: RefObject<IfDlgWaterGrpCrit>;
  DlgWaterGrpCrit: () => JSX.Element;
} => {
  const [refCommErr, DlgCommErr] = useDlgCommErr();
  const [refWaterGrpWarn, DlgWaterGrpWarn] = useDlgWaterGrpWarn();
  const [refWaterGrpCrit, DlgWaterGrpCrit] = useDlgWaterGrpCrit();

  return {
    refCommErr,
    DlgCommErr,
    refWaterGrpWarn,
    DlgWaterGrpWarn,
    refWaterGrpCrit,
    DlgWaterGrpCrit,
  };
};
