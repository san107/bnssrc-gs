import { get_err_msg } from '@/utils/err-util';
import axios from 'axios';
import { toast } from 'sonner';

export const useApiWaterGrpControl = (): {
  apiControlDown: (waterGrpId: string) => void;
  apiControlStop: (waterGrpId: string) => void;
  apiControlAutodown: (waterGrpId: string) => void;
  apiControlClose: (waterGrpId: string, callback: () => void) => void;
} => {
  const apiControlDown = (waterGrpId: string) => {
    console.log('handleDown');
    axios
      .post('/api/water_grp_stat/control', {
        water_grp_id: waterGrpId,
        action: 'Down',
      })
      .then(() => {
        toast.success('차단 처리를 요청했습니다.', { position: 'bottom-right' });
      })
      .catch((err) => {
        toast.error('차단 처리를 요청하는데 실패했습니다.(' + get_err_msg(err) + ')', {
          position: 'bottom-right',
        });
      });
  };
  const apiControlStop = (waterGrpId: string) => {
    console.log('handleStop');
    axios
      .post('/api/water_grp_stat/control', {
        water_grp_id: waterGrpId,
        action: 'Stop',
      })
      .then(() => {
        toast.success('중지 처리를 요청했습니다.', { position: 'bottom-right' });
      })
      .catch((err) => {
        toast.error('중지 처리를 요청하는데 실패했습니다.(' + get_err_msg(err) + ')', {
          position: 'bottom-right',
        });
      });
  };

  const apiControlAutodown = (waterGrpId: string) => {
    console.log('handleStop');
    axios
      .post('/api/water_grp_stat/control', {
        water_grp_id: waterGrpId,
        action: 'Autodown',
      })
      .then(() => {
        toast.success('자동하강 처리를 요청했습니다.', { position: 'bottom-right' });
      })
      .catch((err) => {
        toast.error('자동하강 처리를 요청하는데 실패했습니다.(' + get_err_msg(err) + ')', {
          position: 'bottom-right',
        });
      });
  };
  const apiControlClose = (waterGrpId: string, callback: () => void) => {
    axios
      .post('/api/water_grp_stat/control', {
        water_grp_id: waterGrpId,
        action: 'Close',
      })
      .then(() => {
        toast.success('닫기 처리를 요청했습니다.', { position: 'bottom-right' });
      })
      .catch((err) => {
        toast.error('닫기 처리를 요청하는데 실패했습니다.(' + get_err_msg(err) + ')', {
          position: 'bottom-right',
        });
      })
      .finally(() => {
        callback();
      });
  };

  return {
    apiControlDown,
    apiControlStop,
    apiControlAutodown,
    apiControlClose,
  };
};
