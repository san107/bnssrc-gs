import axios from 'axios';

// group type
export const getGrpType = (type: string | undefined) => {
  if (type === 'gate') return '차단장비';
  else if (type === 'water') return '수위계';
  else return 'N/A';
};

// 그룹에 등록된 요소 갯수 가져오기
export const cntGroupEl = async (seq: number) => {
  const count = await axios.get(`/api/group_el/list?grpSeq=${seq}`).then((res) => {
    return res.data.length;
  });
  // console.log('count', count);
  return count;
};

// 그룹화 함수
export function groupByDevice<T>(arr: T[], key: (item: T) => string | undefined) {
  return arr.reduce((acc, item) => {
    const k = key(item) || '';
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}
