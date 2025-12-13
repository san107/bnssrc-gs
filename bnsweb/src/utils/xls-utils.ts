import { IfTbCamera } from '@/models/tb_camera';
import { IfTbCd } from '@/models/comm/tb_cd';
import { IfTbGate } from '@/models/gate/tb_gate';
import { IfTbWater } from '@/models/water/tb_water';
import { dateutil } from '@/utils/date-util';
import axios from 'axios';
import * as XLSX from 'xlsx';

export const exportToXls = (list: string[][], sheetname: string, filename: string) => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(list);
  XLSX.utils.book_append_sheet(wb, ws, sheetname);
  XLSX.writeFile(wb, filename);
};

export const exportToXlsYmdHms = (list: string[][], basename: string) => {
  const sheetname = basename;
  const filename = basename + '-' + dateutil.yyyymmdd_hhmmss(new Date()) + '.xlsx';
  exportToXls(list, sheetname, filename);
};

export const exportToXlsHeadersObjs = (fhs: string[][], objs: any[], basename: string) => {
  const list: string[][] = [];

  const headers: string[] = [];
  const fields: string[] = [];
  fhs.forEach((fh) => {
    fields.push(fh[0]);
    headers.push(fh[1]);
  });
  list.push(headers);

  objs.forEach((ele) => {
    const a: string[] = [];

    fields.forEach((field) => {
      const v = ele[field];
      if (typeof v === 'number') {
        a.push(v.toString());
      } else if (typeof v === 'string') {
        a.push(v);
      } else if (!v) {
        a.push('');
      } else {
        a.push(v.toString());
      }
    });

    list.push(a);
  });

  exportToXlsYmdHms(list, basename);
};

export const exportToXlsObjs = (headers: string[], objs: any[], basename: string) => {
  exportToXlsHeadersObjs(
    headers.map((h) => [h, h]),
    objs,
    basename
  );
};

export const getCodeMap = async (): Promise<{ [v: string]: IfTbCd }> => {
  const list = (await axios.get<IfTbCd[]>('/api/cd/list')).data;
  return list.reduce((acc, cur) => {
    acc[cur.cd] = cur;
    return acc;
  }, {});
};

export const getCodeName = (map: { [v: string]: IfTbCd }, grp: string, cdid?: string) => {
  if (!cdid) return '';
  const cd = grp + '.' + cdid;
  const nm = map[cd]?.cd_nm;
  return nm ? nm : '';
};

export const getCameraMap = async (): Promise<{ [v: number]: IfTbCamera }> => {
  const list = (await axios.get<IfTbCamera[]>('/api/camera/list')).data;
  return list.reduce<{ [v: number]: IfTbCamera }>((acc, cur) => {
    acc[cur.cam_seq!] = cur;
    return acc;
  }, {});
};

export const getCameraName = (map: { [v: number]: IfTbCamera }, seq?: number | null) => {
  if (!seq) return '';
  const nm = map[seq]?.cam_nm;
  return nm ? nm : '';
};

export const getGateMap = async (): Promise<{ [v: number]: IfTbGate }> => {
  const list = (await axios.get<IfTbGate[]>('/api/gate/list')).data;
  return list.reduce<{ [v: number]: IfTbGate }>((acc, cur) => {
    acc[cur.gate_seq!] = cur;
    return acc;
  }, {});
};

export const getGateName = (map: { [v: number]: IfTbGate }, seq?: number | null) => {
  if (!seq) return '';
  const nm = map[seq]?.gate_nm;
  return nm ? nm : '';
};

export const getWaterMap = async (): Promise<{ [v: number]: IfTbWater }> => {
  const list = (await axios.get<IfTbWater[]>('/api/water/list')).data;
  return list.reduce<{ [v: number]: IfTbWater }>((acc, cur) => {
    acc[cur.water_seq!] = cur;
    return acc;
  }, {});
};

// export const useWaterMap = (): { [v: number]: IfTbWater } | undefined => {
//   const { data } = useSWR<IfTbWater[]>(['/api/water/list']);
//   const [map, setMap] = useState<{ [v: number]: IfTbWater } | undefined>();
//   useEffect(() => {
//     setMap(
//       data?.reduce<{ [v: number]: IfTbWater }>((acc, cur) => {
//         acc[cur.water_seq!] = cur;
//         return acc;
//       }, {})
//     );
//   }, [data]);

//   return map;
// };

export const getWaterName = (map: { [v: number]: IfTbWater }, seq?: number | null) => {
  if (!seq) return '';
  const nm = map[seq]?.water_nm;
  return nm ? nm : '';
};
