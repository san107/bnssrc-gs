// @flow
import { useApiGateOne } from '@/api/useApiGateOne';
import { CameraViewer } from '@/app/(admin)/comp/display/CameraViewer';
import { useApiGateCtl } from '@/app/(admin)/comp/gatectl/useApiGateCtl';
import { useApiGateStat } from '@/app/(admin)/comp/gatectl/useApiGateStat';
import {
  GateCmdResYesung,
  IfGateCmdReq,
  IfGateCmdRes,
  parseGateCmdResYesung,
} from '@/models/gate/tb_gate';
import { Close, Cyclone, Lock, LockOpen } from '@mui/icons-material';
import { CardContent, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import {
  Container,
  MainContent,
  CameraSection,
  StatusSection,
  CameraCard,
  StatusCard,
  ControlCard,
  StatusGrid,
  StatusItem,
  ButtonGroup,
  ControlButton,
  TitleTypography,
} from '@/app/(admin)/comp/gatectl/commStyles';
import { useApiCd } from '@/api/useApiCd';
import { lang } from '@/utils/lang';

type Props = {
  gateSeq?: number;
  onClose: () => void;
};

/*
stat 응답포맷은 아래와 같다. 

{"cmd_res":"Success","cmd_res_msg":"Remote:Off,Up:Off,Down:On,Doing:Off,Fault:Off,Auto:On","gate_status":"DownOk"}


http://localhost:3010/api/gate/control
{
    "gate_seq": 13,
    "gate_cmd": "Stat"
}
*/

export const YesungCtl = ({ gateSeq, onClose }: Props) => {
  const { gate, mutateGate } = useApiGateOne(gateSeq);
  const { stat } = useApiGateStat<IfGateCmdRes>(gateSeq);
  const { isMutating, trigger } = useApiGateCtl<IfGateCmdRes>();

  const [statYesung, setStatYesung] = useState<GateCmdResYesung | null>(null);

  useEffect(() => {
    console.log('stat', stat);
    if (stat) {
      setStatYesung(parseGateCmdResYesung(stat));
    }
  }, [stat]);

  const handleTrigger = (gateCmd: IfGateCmdReq['gate_cmd'], msg?: string) => {
    if (gateSeq) {
      trigger(gateSeq, gateCmd, msg)
        .then((res) => {
          console.log('res', res);
          mutateGate();
        })
        .catch((err) => {
          console.error('err', err);
        });
    }
  };

  const cd = useApiCd({ grp: 'GT', id: 'Yesung' });
  return (
    <Container>
      <MainContent>
        <CameraSection>
          <CameraCard>
            <CameraViewer width={'100%'} cam_seq={gate?.cam_seq} />
          </CameraCard>
        </CameraSection>
        <StatusSection>
          <StatusCard>
            <CardContent>
              <TitleTypography variant='h6'>차단막 {cd?.cd_nm} 상태</TitleTypography>
              <StatusGrid>
                <StatusItem>
                  <Typography variant='subtitle2' color='text.secondary'>
                    처리상태
                  </Typography>
                  <Typography variant='body1'>{stat?.cmd_res}</Typography>
                </StatusItem>
                <StatusItem>
                  <Typography variant='subtitle2' color='text.secondary'>
                    자동모드
                  </Typography>
                  <Typography variant='body1'>{statYesung?.auto}</Typography>
                </StatusItem>
                <StatusItem>
                  <Typography variant='subtitle2' color='text.secondary'>
                    원격모드
                  </Typography>
                  <Typography variant='body1'>{statYesung?.remote}</Typography>
                </StatusItem>
                <StatusItem>
                  <Typography variant='subtitle2' color='text.secondary'>
                    차단막 상승
                  </Typography>
                  <Typography variant='body1'>{statYesung?.up}</Typography>
                </StatusItem>
                <StatusItem>
                  <Typography variant='subtitle2' color='text.secondary'>
                    차단막 하강
                  </Typography>
                  <Typography variant='body1'>{statYesung?.down}</Typography>
                </StatusItem>
                <StatusItem>
                  <Typography variant='subtitle2' color='text.secondary'>
                    차단막 동작중
                  </Typography>
                  <Typography variant='body1'>{statYesung?.doing}</Typography>
                </StatusItem>
                <StatusItem>
                  <Typography variant='subtitle2' color='text.secondary'>
                    차단막 오류
                  </Typography>
                  <Typography variant='body1'>{statYesung?.fault}</Typography>
                </StatusItem>
              </StatusGrid>
            </CardContent>
          </StatusCard>
        </StatusSection>
      </MainContent>

      <ControlCard>
        <CardContent>
          <TitleTypography variant='h6'>차단막 {cd?.cd_nm} 제어</TitleTypography>
          <ButtonGroup>
            <ControlButton
              variant='contained'
              color='primary'
              disabled={isMutating}
              onClick={() => gateSeq && handleTrigger('UpAsync')}
            >
              <LockOpen style={{ marginRight: 8 }} />
              {lang.open}
            </ControlButton>
            <ControlButton
              variant='contained'
              color='error'
              disabled={isMutating}
              onClick={() => gateSeq && handleTrigger('DownAsync')}
            >
              <Lock style={{ marginRight: 8 }} />
              {lang.close}
            </ControlButton>
            <ControlButton
              variant='contained'
              color='warning'
              disabled={isMutating}
              onClick={() => gateSeq && handleTrigger('Stop')}
            >
              <Cyclone style={{ marginRight: 8 }} />
              정지
            </ControlButton>
            <ControlButton
              variant='contained'
              color='secondary'
              disabled={isMutating}
              onClick={onClose}
            >
              <Close style={{ marginRight: 8 }} />
              창닫기
            </ControlButton>
          </ButtonGroup>
        </CardContent>
      </ControlCard>
    </Container>
  );
};
