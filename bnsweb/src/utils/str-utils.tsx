import { toast } from 'sonner';

// 스트링 자르기 함수
export const truncate = (str: string | undefined, n: number) => {
  if (str) return str?.length > n ? str.substring(0, n - 1) + '..' : str;
};

// 카메아 type id
export const getCamTypeId = (cam_type: string | undefined) => {
  return cam_type?.substring(3);
};

// 카메라 IP
export const getCamIP = (cam_url: string | undefined) => {
  const url: string = cam_url ? cam_url : '';
  const startIdx: number = url.indexOf('@');
  const endIdx: number = url.lastIndexOf('/');
  const ret = url?.substring(startIdx + 1, endIdx);
  return ret;
};

// 위.경도 7자리로 자르기
export const convLatLng = (pos: string | undefined) => {
  const strPos = pos ? pos : '';
  const index = strPos.indexOf('.');
  return strPos.substring(0, index + 8);
};

// 텍스트 복사
export function copyText(text: string, msg: string) {
  if (navigator.clipboard && window.isSecureContext) {
    // HTTPS 환경에서 Clipboard API 사용
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success(`복사되었습니다. (${msg})`);
      })
      .catch(() => {
        // Clipboard API 실패시 fallback으로 textarea 방식 사용
        fallbackCopyTextToClipboard(text, msg);
      });
  } else {
    // HTTP 환경에서는 바로 textarea 방식 사용
    fallbackCopyTextToClipboard(text, msg);
  }
}

function fallbackCopyTextToClipboard(text: string, msg: string) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-999999px';
  textarea.style.top = '-999999px';
  document.body.appendChild(textarea);

  textarea.focus();
  textarea.select();

  try {
    document.execCommand('copy');
    toast.success(`복사되었습니다. (${msg})`);
  } catch (err) {
    toast.error(`복사에 실패했습니다. (${err})`);
  }

  document.body.removeChild(textarea);
}

export const comma = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
