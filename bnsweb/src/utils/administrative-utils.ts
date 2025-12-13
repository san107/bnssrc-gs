export interface AdministrativeRegion {
  code: string;
  name: string;
  level: 'sido' | 'sigungu' | 'dong';
  parentCode?: string;
}

// 행정구역 코드 정의
export const ADMINISTRATIVE_REGIONS: AdministrativeRegion[] = [
  // 시도
  { code: '11000', name: '서울특별시', level: 'sido' },
  // { code: '26000', name: '부산광역시', level: 'sido' },
  // { code: '27000', name: '대구광역시', level: 'sido' },
  // { code: '28000', name: '인천광역시', level: 'sido' },
  // { code: '29000', name: '광주광역시', level: 'sido' },
  // { code: '30000', name: '대전광역시', level: 'sido' },
  // { code: '31000', name: '울산광역시', level: 'sido' },
  { code: '41000', name: '경기도', level: 'sido' },
  // { code: '42000', name: '강원도', level: 'sido' },
  // { code: '43000', name: '충청북도', level: 'sido' },
  // { code: '44000', name: '충청남도', level: 'sido' },
  // { code: '45000', name: '전라북도', level: 'sido' },
  // { code: '46000', name: '전라남도', level: 'sido' },
  // { code: '47000', name: '경상북도', level: 'sido' },
  // { code: '48000', name: '경상남도', level: 'sido' },
  // { code: '50000', name: '제주특별자치도', level: 'sido' },
];

// 서울시 구별 목록
export const SEOUL_DISTRICTS = [
  { code: '1100009', name: '강북구' },
  { code: '1100023', name: '강남구' },
  { code: '1100025', name: '강동구' },
  { code: '1100016', name: '강서구' },
  { code: '1100005', name: '광진구' },
  { code: '1100017', name: '구로구' },
  { code: '1100018', name: '금천구' },
  { code: '1100021', name: '관악구' },
  { code: '1100010', name: '도봉구' },
  { code: '1100006', name: '동대문구' },
  { code: '1100020', name: '동작구' },
  { code: '1100012', name: '은평구' },
  { code: '1100019', name: '영등포구' },
  { code: '1100001', name: '종로구' },
  { code: '1100002', name: '중구' },
  { code: '1100007', name: '중랑구' },
  { code: '1100014', name: '마포구' },
  { code: '1100011', name: '노원구' },
  { code: '1100013', name: '서대문구' },
  { code: '1100022', name: '서초구' },
  { code: '1100008', name: '성북구' },
  { code: '1100004', name: '성동구' },
  { code: '1100024', name: '송파구' },
  { code: '1100003', name: '용산구' },
  { code: '1100015', name: '양천구' },
];

// 경기도 시군구별 목록
export const GYEONGGI_DISTRICTS = [
  { code: '4100001', name: '수원시장안구' },
  { code: '4100002', name: '수원시권선구' },
  { code: '4100003', name: '수원시팔달구' },
  { code: '4100004', name: '수원시영통구' },
  { code: '4100005', name: '성남시수정구' },
  { code: '4100006', name: '성남시중원구' },
  { code: '4100007', name: '성남시분당구' },
  { code: '4100008', name: '의정부시' },
  { code: '4100009', name: '안양시만안구' },
  { code: '4100010', name: '안양시동안구' },
  { code: '4100011', name: '부천시원미구' },
  { code: '4100012', name: '부천시소사구' },
  { code: '4100013', name: '부천시오정구' },
  { code: '4100014', name: '광명시' },
  { code: '4100015', name: '평택시' },
  { code: '4100016', name: '동두천시' },
  { code: '4100017', name: '안산시상록구' },
  { code: '4100018', name: '안산시단원구' },
  { code: '4100019', name: '고양시덕양구' },
  { code: '4100020', name: '고양시일산동구' },
  { code: '4100021', name: '고양시일산서구' },
  { code: '4100022', name: '과천시' },
  { code: '4100023', name: '구리시' },
  { code: '4100024', name: '남양주시' },
  { code: '4100025', name: '오산시' },
  { code: '4100026', name: '시흥시' },
  { code: '4100027', name: '군포시' },
  { code: '4100028', name: '의왕시' },
  { code: '4100029', name: '하남시' },
  { code: '4100030', name: '용인시처인구' },
  { code: '4100031', name: '용인시기흥구' },
  { code: '4100032', name: '용인시수지구' },
  { code: '4100033', name: '파주시' },
  { code: '4100034', name: '이천시' },
  { code: '4100035', name: '안성시' },
  { code: '4100036', name: '김포시' },
  { code: '4100037', name: '화성시' },
  { code: '4100038', name: '광주시' },
  { code: '4100039', name: '여주시' },
  { code: '4100040', name: '양평군' },
  { code: '4100042', name: '연천군' },
  { code: '4100043', name: '가평군' },
  { code: '4100044', name: '포천시' },
  { code: '4100045', name: '양주시' },
];

// JSON 파일에서 경계 데이터 가져오기
export const getBoundaryFromRegionFile = async (regionCode: string): Promise<any> => {
  try {
    let fileName = '';

    // 서울시 구별 처리
    if (regionCode.startsWith('11000') && regionCode !== '11000') {
      // 서울시 구별 코드를 구 이름으로 매핑
      const districtMap: { [key: string]: string } = {
        '1100001': '종로구',
        '1100002': '중구',
        '1100003': '용산구',
        '1100004': '성동구',
        '1100005': '광진구',
        '1100006': '동대문구',
        '1100007': '중랑구',
        '1100008': '성북구',
        '1100009': '강북구',
        '1100010': '도봉구',
        '1100011': '노원구',
        '1100012': '은평구',
        '1100013': '서대문구',
        '1100014': '마포구',
        '1100015': '양천구',
        '1100016': '강서구',
        '1100017': '구로구',
        '1100018': '금천구',
        '1100019': '영등포구',
        '1100020': '동작구',
        '1100021': '관악구',
        '1100022': '서초구',
        '1100023': '강남구',
        '1100024': '송파구',
        '1100025': '강동구',
      };

      const districtName = districtMap[regionCode];
      if (districtName) {
        fileName = `${districtName}.json`;
        const boundaryData = await import(
          `@/app/(admin)/comp/map/administrative/districts/seoul/${fileName}`
        );
        return boundaryData.default || boundaryData;
      }
    }

    // 경기도 시군구별 처리
    if (regionCode.startsWith('41000') && regionCode !== '41000') {
      // 경기도 시군구별 코드를 시군구 이름으로 매핑
      const districtMap: { [key: string]: string } = {
        '4100001': '수원시장안구',
        '4100002': '수원시권선구',
        '4100003': '수원시팔달구',
        '4100004': '수원시영통구',
        '4100005': '성남시수정구',
        '4100006': '성남시중원구',
        '4100007': '성남시분당구',
        '4100008': '의정부시',
        '4100009': '안양시만안구',
        '4100010': '안양시동안구',
        '4100011': '부천시원미구',
        '4100012': '부천시소사구',
        '4100013': '부천시오정구',
        '4100014': '광명시',
        '4100015': '평택시',
        '4100016': '동두천시',
        '4100017': '안산시상록구',
        '4100018': '안산시단원구',
        '4100019': '고양시덕양구',
        '4100020': '고양시일산동구',
        '4100021': '고양시일산서구',
        '4100022': '과천시',
        '4100023': '구리시',
        '4100024': '남양주시',
        '4100025': '오산시',
        '4100026': '시흥시',
        '4100027': '군포시',
        '4100028': '의왕시',
        '4100029': '하남시',
        '4100030': '용인시처인구',
        '4100031': '용인시기흥구',
        '4100032': '용인시수지구',
        '4100033': '파주시',
        '4100034': '이천시',
        '4100035': '안성시',
        '4100036': '김포시',
        '4100037': '화성시',
        '4100038': '광주시',
        '4100039': '여주시',
        '4100040': '양평군',
        '4100042': '연천군',
        '4100043': '가평군',
        '4100044': '포천시',
        '4100045': '양주시',
      };

      const districtName = districtMap[regionCode];
      if (districtName) {
        fileName = `${districtName}.json`;
        const boundaryData = await import(
          `@/app/(admin)/comp/map/administrative/districts/gyeonggi/${fileName}`
        );
        return boundaryData.default || boundaryData;
      }
    }

    // 시도별 전체 경계 데이터
    switch (regionCode) {
      case '11000':
        fileName = 'seoul.json';
        break;
      case '41000':
        fileName = 'gyeonggi.json';
        break;
      // TODO: 다른 시도 추가
      default:
        return null;
    }

    const boundaryData = await import(`@/app/(admin)/comp/map/administrative/${fileName}`);
    return boundaryData.default || boundaryData;
  } catch (error) {
    console.error('시도별 경계 파일 import 실패:', error);
    return null;
  }
};

// VWorld API를 사용한 행정구역 경계 데이터 가져오기
export const getAdministrativeBoundary = async (regionCode: string): Promise<any> => {
  try {
    // console.log('지역 코드:', regionCode);

    // 시도별 json 파일에서 실제 행정구역 경계 데이터 가져오기
    const boundaryData = await getBoundaryFromRegionFile(regionCode);

    if (boundaryData) {
      // console.log('시도별 파일에서 행정구역 경계 데이터를 가져왔습니다:', boundaryData);
      return boundaryData;
    }

    console.log('해당 지역의 경계 데이터를 찾을 수 없습니다.');
    return null;
  } catch (error) {
    console.error('행정구역 경계 데이터 가져오기 실패:', error);
    return null;
  }
};

// 데이터 캐싱을 위한 Map (데이터파일 크기가 커서 캐시 사용)
const boundaryCache = new Map<string, any>();

// 캐시된 경계 데이터 가져오기
export const getBoundaryCache = async (regionCode: string): Promise<any> => {
  // 캐시에서 먼저 확인
  if (boundaryCache.has(regionCode)) {
    console.log('캐시된 경계 데이터를 사용합니다:', regionCode);
    return boundaryCache.get(regionCode);
  }

  try {
    // 실제 데이터 가져오기
    const boundaryData = await getAdministrativeBoundary(regionCode);

    // 캐시에 저장
    if (boundaryData) {
      boundaryCache.set(regionCode, boundaryData);
      // console.log('경계 데이터를 캐시에 저장했습니다:', regionCode);
    }

    return boundaryData;
  } catch (error) {
    console.error('캐시된 경계 데이터 가져오기 실패:', error);
    throw error;
  }
};

// 캐시 초기화
export const clearBoundaryCache = (): void => {
  boundaryCache.clear();
  console.log('경계 데이터 캐시가 초기화되었습니다.');
};

// 캐시 상태 확인
export const getBoundaryCacheStatus = (): { size: number; keys: string[] } => {
  return {
    size: boundaryCache.size,
    keys: Array.from(boundaryCache.keys()),
  };
};

// 특정 지역의 캐시 삭제
export const removeBoundaryCache = (regionCode: string): void => {
  boundaryCache.delete(regionCode);
  console.log('캐시에서 경계 데이터가 삭제되었습니다:', regionCode);
};
