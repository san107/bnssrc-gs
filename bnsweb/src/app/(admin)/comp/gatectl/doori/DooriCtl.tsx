// @flow
import { useApiGateOne } from '@/api/useApiGateOne';
import { CameraViewer } from '@/app/(admin)/comp/display/CameraViewer';
import { useApiGateCtl } from '@/app/(admin)/comp/gatectl/useApiGateCtl';
import { useApiGateStat } from '@/app/(admin)/comp/gatectl/useApiGateStat';
import { IfGateCmdReq, IfGateCmdResDoori } from '@/models/gate/tb_gate';
import { CardContent, Typography } from '@mui/material';
import { Lock, LockOpen, Cyclone, Close } from '@mui/icons-material';
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
import { lang } from '@/utils/lang';

type Props = {
  gateSeq?: number;
  onClose: () => void;
};

export const DooriCtl = ({ gateSeq, onClose }: Props) => {
  const { gate, mutateGate } = useApiGateOne(gateSeq);
  const { stat } = useApiGateStat<IfGateCmdResDoori>(gateSeq);
  const { isMutating, trigger } = useApiGateCtl<IfGateCmdResDoori>();

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
              <TitleTypography variant='h6'>두리 차단장비 상태</TitleTypography>
              <StatusGrid>
                <StatusItem>
                  <Typography variant='subtitle2' color='text.secondary'>
                    처리상태
                  </Typography>
                  <Typography variant='body1'>{stat?.cmd_res}</Typography>
                </StatusItem>
                <StatusItem>
                  <Typography variant='subtitle2' color='text.secondary'>
                    자동/수동
                  </Typography>
                  <Typography variant='body1'>{stat?.auto_man}</Typography>
                </StatusItem>
                <StatusItem>
                  <Typography variant='subtitle2' color='text.secondary'>
                    운전모드
                  </Typography>
                  <Typography variant='body1'>{stat?.rem_loc}</Typography>
                </StatusItem>
                <StatusItem>
                  <Typography variant='subtitle2' color='text.secondary'>
                    차단막 상태
                  </Typography>
                  <Typography variant='body1'>{stat?.gate_status}</Typography>
                </StatusItem>
                <StatusItem>
                  <Typography variant='subtitle2' color='text.secondary'>
                    동작모드
                  </Typography>
                  <Typography variant='body1'>
                    {stat?.wind_mode == 'Wind' ? '태풍모드' : '일반모드'}
                  </Typography>
                </StatusItem>
              </StatusGrid>
            </CardContent>
          </StatusCard>
        </StatusSection>
      </MainContent>

      <ControlCard>
        <CardContent>
          <TitleTypography variant='h6'>두리 차단장비 제어</TitleTypography>
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
              onClick={() =>
                gateSeq && handleTrigger('Wind', stat?.wind_mode == 'Wind' ? 'Off' : 'On')
              }
            >
              <Cyclone style={{ marginRight: 8 }} />
              {stat?.wind_mode == 'Wind' ? '일반모드 설정' : '태풍모드 설정'}
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
