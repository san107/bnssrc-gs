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
  GateCmdResHpsys,
  IfGateCmdReq,
  IfGateCmdRes,
  parseGateCmdResHpsys,
} from '@/models/gate/tb_gate';
import { lang } from '@/utils/lang';
import { Close, Cyclone, Lock, LockOpen } from '@mui/icons-material';
import { CardContent, styled, Typography } from '@mui/material';
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

export const HpsysCtl = ({ gateSeq, onClose }: Props) => {
  const { gate, mutateGate } = useApiGateOne(gateSeq);
  const { stat } = useApiGateStat<IfGateCmdRes>(gateSeq);
  const { isMutating, trigger } = useApiGateCtl<IfGateCmdRes>();

  const [detail, setDetail] = useState<GateCmdResHpsys | null>(null);

  useEffect(() => {
    console.log('stat', stat);
    if (stat) {
      setDetail(parseGateCmdResHpsys(stat));
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
                    Gate Status
                  </Typography>
                  <Typography variant='body1'>{detail?.gate_status}</Typography>
                </StatusItem>
                <StatusItem>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Remote
                  </Typography>
                  <Typography variant='body1'>{detail?.Remote}</Typography>
                </StatusItem>
                <StatusItem>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Down
                  </Typography>
                  <Typography variant='body1'>{detail?.Down}</Typography>
                </StatusItem>
                <StatusItem>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Doing
                  </Typography>
                  <Typography variant='body1'>{detail?.Doing}</Typography>
                </StatusItem>
                <StatusItem>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Up
                  </Typography>
                  <Typography variant='body1'>{detail?.Up}</Typography>
                </StatusItem>
                <StatusItem>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Moving
                  </Typography>
                  <Typography variant='body1'>{detail?.Moving}</Typography>
                </StatusItem>
                <StatusItem>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Side
                  </Typography>
                  <Typography variant='body1'>{detail?.Side}</Typography>
                </StatusItem>
                <StatusItem>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Center
                  </Typography>
                  <Typography variant='body1'>{detail?.Center}</Typography>
                </StatusItem>
                <StatusItem>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Fault
                  </Typography>
                  <Typography variant='body1'>{detail?.Fault}</Typography>
                </StatusItem>
              </StatusGrid>
            </CardContent>
          </StatusCard>
        </StatusSection>
      </MainContent>

      <ControlCard>
        <CardContent>
          <TitleTypography variant='h6'>HP 차단막 제어</TitleTypography>
          <ButtonGroup>
            <ControlButton2
              variant='contained'
              color='primary'
              disabled={isMutating}
              onClick={() => gateSeq && handleTrigger('UpAsync')}
            >
              <LockOpen style={{ marginRight: 8 }} />
              {lang.open}
            </ControlButton2>
            <ControlButton2
              variant='contained'
              color='error'
              disabled={isMutating}
              onClick={() => gateSeq && handleTrigger('DownAsync')}
            >
              <Lock style={{ marginRight: 8 }} />
              {lang.close}
            </ControlButton2>
            <ControlButton2
              variant='contained'
              color='warning'
              disabled={isMutating}
              onClick={() => gateSeq && handleTrigger('Stop')}
            >
              <Cyclone style={{ marginRight: 8 }} />
              정지
            </ControlButton2>
            <ControlButton2
              variant='contained'
              color='warning'
              disabled={isMutating}
              onClick={() => gateSeq && handleTrigger('Side')}
            >
              <Cyclone style={{ marginRight: 8 }} />
              Side
            </ControlButton2>
            <ControlButton2
              variant='contained'
              color='warning'
              disabled={isMutating}
              onClick={() => gateSeq && handleTrigger('Center')}
            >
              <Cyclone style={{ marginRight: 8 }} />
              Center
            </ControlButton2>
            <ControlButton2
              variant='contained'
              color='secondary'
              disabled={isMutating}
              onClick={onClose}
            >
              <Close style={{ marginRight: 8 }} />
              창닫기
            </ControlButton2>
          </ButtonGroup>
        </CardContent>
      </ControlCard>
    </Container>
  );
};

const ControlButton2 = styled(ControlButton)`
  min-width: 130px;
  width: 130px;
`;
