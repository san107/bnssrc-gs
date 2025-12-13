import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import * as maputils from '@/utils/map-utils';
import { IfTbWater } from '@/models/water/tb_water';

const useAddress = (water: IfTbWater) => {
  const [address, setAddress] = useState<string>('주소(시군)');
  const [fullAddress, setFullAddress] = useState<string>('주소');

  const getAddress = useCallback(async () => {
    axios
      .get(
        `/api/req/address?service=address&request=getAddress&version=2.0&crs=epsg:4326&point=${
          water?.water_lng
        },${
          water?.water_lat
        }&format=json&key=${maputils.getApiKey()}&type=both&zipcode=true&simple=false`
      )
      .then((res) => {
        // console.log('res', res.data.response.result[0]);
        if (res.data.response?.result?.length > 0) {
          setAddress(res.data.response?.result[0]?.structure?.level2);
          setFullAddress(res.data.response?.result[0]?.text);
        }
      })
      .catch((err) => {
        console.log('err', err);
      });
  }, [water?.water_lat, water?.water_lng]);

  useEffect(() => {
    getAddress();
  }, [getAddress]);

  return { address, fullAddress };
};

export default useAddress;
