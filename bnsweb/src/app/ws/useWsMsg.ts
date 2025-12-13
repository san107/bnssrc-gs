'use client';
import { IfTbWaterHist } from '@/models/water/tb_water_hist';
import { getDynamicPort } from '@/utils/host-util';
import { useEffect } from 'react';
import { useSWRConfig } from 'swr';

export interface IfWsMsg<T = unknown> {
  cmd:
    | 'WaterEvt'
    | 'WaterSave'
    | 'WaterDel'
    | 'WaterStat'
    | 'WaterGrpStat'
    | 'WaterGrpAction'
    | 'GateSave'
    | 'GateDel'
    | 'GateStat'
    | 'CameraStat'
    | 'CameraSave'
    | 'CameraDel'
    | 'EbrdStat'
    | 'EmcallEvt'
    | 'EmcallStat'; // waterevt ==> 수위계 데이터 수신. 1분에 1회.
  data: T;
}

export interface IfWsMsgGateStat {
  gate_seq?: number;
  gate_stat?: '' | 'UpOk' | 'UpLock' | 'DownOk' | 'Stop' | 'Na';
  cmd_rslt?: '' | 'Success' | 'Fail';
  msg?: string;
}

export interface IfWsMsgWaterStat {
  water_seq?: number;
  comm_stat?: '' | 'Ok' | 'Err';
}

export interface IfWsMsgWaterGrpStat {
  water_grp_id?: string;
  grp_stat?: '' | 'Ok' | 'CommErr' | 'Warn' | 'Crit';
}

export interface IfWsMsgWaterGrpAction {
  water_grp_id?: string;
  grp_action?: '' | 'Autodown' | 'Down' | 'Stop' | 'Close' | 'Unknown' | 'None';
}

export const isWaterEvt = (v: IfWsMsg): v is IfWsMsg<IfTbWaterHist> => v.cmd === 'WaterEvt';
export const isWaterStat = (v: IfWsMsg): v is IfWsMsg<IfWsMsgWaterStat> => v.cmd === 'WaterStat';
export const isWaterGrpStat = (v: IfWsMsg): v is IfWsMsg<IfWsMsgWaterGrpStat> =>
  v.cmd === 'WaterGrpStat';
export const isWaterGrpAction = (v: IfWsMsg): v is IfWsMsg<IfWsMsgWaterGrpAction> =>
  v.cmd === 'WaterGrpAction';
export const isWaterCmd = (v: IfWsMsg): v is IfWsMsg =>
  v.cmd === 'WaterSave' || v.cmd === 'WaterDel';
export const isGateStat = (v: IfWsMsg): v is IfWsMsg<IfWsMsgGateStat> => v.cmd === 'GateStat';
export const isGateCmd = (v: IfWsMsg): v is IfWsMsg => v.cmd === 'GateSave' || v.cmd === 'GateDel';
export const isCameraCmd = (v: IfWsMsg): v is IfWsMsg =>
  v.cmd === 'CameraDel' || v.cmd === 'CameraSave';
// 카메라 상태 변화시 수신.
export const isCameraStat = (v: IfWsMsg): v is IfWsMsg => v.cmd === 'CameraStat';
export const isEmcallEvt = (v: IfWsMsg): v is IfWsMsg => v.cmd === 'EmcallEvt';
export const isEmcallStat = (v: IfWsMsg): v is IfWsMsg => v.cmd === 'EmcallStat';
export const isEbrdStat = (v: IfWsMsg): v is IfWsMsg => v.cmd === 'EbrdStat';
class WsCtx {
  ws?: WebSocket;
  inited: boolean = false;
  callbacks: ((v: IfWsMsg) => void)[] = [];
  addCallback: (fn: (v: IfWsMsg) => void) => void = () => null;
  removeCallback: (fn: (v: IfWsMsg) => void) => void = () => null;
}

const debug = false;

function createWsManger() {
  const wsport = getDynamicPort(Number(process.env.NEXT_PUBLIC_API_PORT));
  console.log('api port', wsport);

  const url = 'ws://' + document.location.hostname + ':' + wsport + '/ws/wsevent'; // 변경사항이 일어났을 때 수신받는 경로.

  const ctx = new WsCtx();
  if (!wsport) {
    if (debug) console.error('웹소켓 통신을 위해서 NEXT_PUBLIC_API_PORT 환경변수 설정필요 ');
    return ctx;
  }

  ctx.callbacks = [];
  ctx.removeCallback = (fn: (v: IfWsMsg) => void) => {
    const idx = ctx.callbacks.indexOf(fn);
    //if (idx === undefined) return;
    if (idx >= 0) {
      ctx.callbacks.splice(idx, 1);
    }
  };
  ctx.addCallback = (fn: (v: IfWsMsg) => void) => {
    ctx.callbacks.push(fn);
  };

  const initWs = () => {
    ctx.ws = new WebSocket(url);
    ctx.ws.onclose = (e) => {
      console.error('close web socket', e.reason);
    };
    ctx.ws.onerror = (e) => {
      console.error('error websocket ', e.type);
    };
    ctx.ws.onopen = (_e) => {
      console.log('open websokcet ok');
    };
    ctx.ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (debug) console.log('broadcast msg is ', msg);
        console.log('broadcast msg is ', msg);
        ctx.callbacks.forEach((fn) => fn(msg));
      } catch (e) {
        console.error('E', e);
      }
    };
  };

  initWs();

  setInterval(() => {
    if (debug) console.log('ws', ctx.ws);
    if (ctx.ws && ctx.ws.readyState !== 3) return; // closed
    //if (!ctx.callbacks || ctx.callbacks.length == 0) return; // 대기하는 수신자가 없는 경우.
    if (debug) console.log('new connect....');

    initWs();
  }, 10 * 1000);

  ctx.inited = true; // 초기화 완료.

  return ctx;
}

let wsmgr: WsCtx = new WsCtx();

export const useWsMsg = (fn: (msg: IfWsMsg) => void) => {
  useEffect(() => {
    if (wsmgr.inited === false) {
      wsmgr = createWsManger();
    }
    wsmgr.addCallback(fn);
    return () => {
      wsmgr.removeCallback(fn);
    };
  }, [fn]);
};

/**
 * useWsMsg의 기본동작을 수행함.
 * 예들들어서, 각 메시지 유형별 처리해야 갱신해야 하는 목록을 별도로 처리함.
 * 여러개의 메시지가 한번에 들어오는 경우, 한번에 조회할 수 있도록 debounce 처리를 수행함.
 */
export const useWsMsgHandler = () => {
  const { mutate } = useSWRConfig();
  useWsMsg((msg) => {
    if (isWaterEvt(msg) || isWaterCmd(msg)) {
      console.log('water evt', msg.data);
      mutate((key) => {
        if (Array.isArray(key)) {
          //console.log('mutae key is ', key);
          if (key?.[0].startsWith('/api/water')) {
            return true;
          }
        } else if (typeof key === 'string') {
          if (key?.startsWith('/api/water')) {
            return true;
          }
        }
        return false;
      });
    }
    if (isGateStat(msg) || isGateCmd(msg)) {
      console.log('gate stat', msg.data);
      mutate((key) => {
        if (Array.isArray(key)) {
          if (key?.[0].startsWith('/api/gate')) return true;
        } else if (typeof key === 'string') {
          if (key?.startsWith('/api/gate')) return true;
        }
        return false;
      });
    }
    if (isCameraCmd(msg)) {
      console.log('camera', msg.data);
      mutate((key) => {
        if (Array.isArray(key)) {
          if (key?.[0].startsWith('/api/camera')) return true;
        } else if (typeof key === 'string') {
          if (key?.startsWith('/api/camera')) return true;
        }
        return false;
      });
    }
  });
};
