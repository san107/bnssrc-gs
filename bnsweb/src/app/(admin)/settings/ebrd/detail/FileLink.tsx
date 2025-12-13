// @flow
import { IfTbFile } from '@/models/tb_file';
import { comma } from '@/utils/str-utils';
import * as React from 'react';
import useSWR from 'swr';
type Props = {
  fileSeq?: number;
};
export const FileLink = (props: Props) => {
  const { data: file } = useSWR<IfTbFile>([
    props.fileSeq && `/api/file/one?fileSeq=${props.fileSeq}`,
  ]);
  return (
    <>
      <a
        href={`/api/file/download_nocache?fileSeq=${props.fileSeq}`}
        className='text-xl underline underline-offset-8'
      >
        파일 다운로드 : {file?.file_nm} ({comma(file?.file_size ?? 0)})
      </a>
    </>
  );
};
