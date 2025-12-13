// @flow
import { useApiGateOne } from '@/api/useApiGateOne';
import { CameraViewer } from '@/app/(admin)/comp/display/CameraViewer';
import {
  ButtonGroup,
  CameraCard,
  CameraSection,
  Container,
  ControlButton,
  ControlCard,
  MainContent,
  StatusCard,
  StatusGrid,
  StatusItem,
  StatusSection,
  TitleTypography,
} from '@/app/(admin)/comp/gatectl/commStyles';
import { useApiGateCtl } from '@/app/(admin)/comp/gatectl/useApiGateCtl';
import { useApiGateStat } from '@/app/(admin)/comp/gatectl/useApiGateStat';
import {
  GateCmdResFptech,
  IfGateCmdReq,
  IfGateCmdRes,
  parseGateCmdResFptech,
} from '@/models/gate/tb_gate';
import { lang } from '@/utils/lang';
import { Close, Lock, LockOpen } from '@mui/icons-material';
import { CardContent, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

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

export const FptechCtl = ({ gateSeq, onClose }: Props) => {
  const { gate, mutateGate } = useApiGateOne(gateSeq);
  const { stat } = useApiGateStat<IfGateCmdRes>(gateSeq);
  const { isMutating, trigger } = useApiGateCtl<IfGateCmdRes>();

  const [statFptech, setStatFptech] = useState<GateCmdResFptech | null>(null);

  useEffect(() => {
    console.log('stat', stat);
    if (stat) {
      setStatFptech(parseGateCmdResFptech(stat));
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
              <TitleTypography variant='h6'>{gate?.gate_nm} 상태</TitleTypography>
              <StatusGrid>
                <StatusItem>
                  <Typography variant='subtitle2' color='text.secondary'>
                    처리상태
                  </Typography>
                  <Typography variant='body1'>{stat?.cmd_res}</Typography>
                </StatusItem>
                <StatusItem>
                  <Typography variant='subtitle2' color='text.secondary'>
                    DownDoing
                  </Typography>
                  <Typography variant='body1'>{statFptech?.DownDoing}</Typography>
                </StatusItem>
                <StatusItem>
                  <Typography variant='subtitle2' color='text.secondary'>
                    DownDone
                  </Typography>
                  <Typography variant='body1'>{statFptech?.DownDone}</Typography>
                </StatusItem>
                <StatusItem>
                  <Typography variant='subtitle2' color='text.secondary'>
                    UpDoing
                  </Typography>
                  <Typography variant='body1'>{statFptech?.UpDoing}</Typography>
                </StatusItem>
                <StatusItem>
                  <Typography variant='subtitle2' color='text.secondary'>
                    UpDone
                  </Typography>
                  <Typography variant='body1'>{statFptech?.UpDone}</Typography>
                </StatusItem>
                <StatusItem>
                  <Typography variant='subtitle2' color='text.secondary'>
                    CenterUpLock
                  </Typography>
                  <Typography variant='body1'>{statFptech?.CenterUpLock}</Typography>
                </StatusItem>
                <StatusItem>
                  <Typography variant='subtitle2' color='text.secondary'>
                    CenterDownLock
                  </Typography>
                  <Typography variant='body1'>{statFptech?.CenterDownLock}</Typography>
                </StatusItem>
              </StatusGrid>
            </CardContent>
          </StatusCard>
        </StatusSection>
      </MainContent>

      <ControlCard>
        <CardContent>
          <TitleTypography variant='h6'>에프피텍 제어</TitleTypography>
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
            {/* <ControlButton
              variant='contained'
              color='warning'
              disabled={isMutating}
              onClick={() => gateSeq && handleTrigger('Stop')}
            >
              <Cyclone style={{ marginRight: 8 }} />
              정지
            </ControlButton> */}
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
