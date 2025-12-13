import { AxiosError } from 'axios';

export const get_err_msg = (err: AxiosError) => {
  const emsg: string[] = [];

  if (err.response?.data) {
    emsg.push(String(err.response?.data));
  } else if (err.message) {
    emsg.push(err.message);
  } else {
    emsg.push(String(err));
  }

  return emsg.join('\n');
};
