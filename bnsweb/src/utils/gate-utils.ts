import { GateCmdRes, IfTbGate } from '@/models/gate/tb_gate';
import { gconf } from '@/utils/gconf';
import { lang } from '@/utils/lang';
import axios from 'axios';

export const gateCmdTxt = (stat: string) => {
  if (stat === 'Up') return lang.open;
  else if (stat === 'Down') return lang.close;
  else if (stat === 'Stop') return '정지';
  else return 'N/A';
};

export const gateStatIcon = (stat: IfTbGate['gate_stat']) => {
  if (stat === 'UpOk' || stat == 'UpLock') return '/images/gate_icon_open.png';
  else if (stat === 'DownOk') return '/images/gate_icon_close.png';
  else if (stat === 'Stop') return '/images/gate_icon_stop.png';
  else return '/images/gate_icon_na.png';
};

export const gateStatTxt = (stat: IfTbGate['gate_stat']) => {
  if (stat === 'UpOk' || stat == 'UpLock') return '열림';
  else if (stat === 'DownOk') return '닫힘';
  else if (stat === 'Stop') return '정지';
  else return '장애';
};

export const gateStatColor = (stat: IfTbGate['gate_stat']) => {
  if (stat === 'UpOk' || stat === 'UpLock') {
    return '#429e22';
  } else if (stat === 'DownOk') {
    return '#cc4655';
  } else if (stat === 'Stop') {
    return '#3399cc';
  } else {
    return '#9f9898';
  }
};

export const gateCmdAllSettled = async (
  ele: IfTbGate,
  cmd: 'Up' | 'Down' | 'Stop' | 'Stat'
): Promise<object> => {
  const req = {
    gate_seq: ele.gate_seq,
    gate_cmd: cmd,
  };
  const result = {
    gate_seq: ele.gate_seq,
    gate_nm: ele.gate_nm,
    cam_seq: ele.cam_seq,
  };

  return new Promise((resolve, reject) => {
    axios
      .post<GateCmdRes>('/api/gate/control', req, { timeout: gconf.gateControlTimeoutMs })
      .then((res) => {
        resolve({
          ...result,
          gate_stat: res.data.gate_status,
          cmd_rslt: res.data.cmd_res,
        });
      })
      .catch((e) => {
        console.error('E', e);
        reject({
          ...result,
          gate_stat: ele.gate_stat,
          cmd_rslt: 'Fail',
        });
      });
  });
};
