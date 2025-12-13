// @flow
import * as React from 'react';
type Props = {
  cols: number[];
};
export const ColGrp = (props: Props) => {
  const tot = props.cols.reduce((acc, cur) => acc + cur, 0);
  const cols = props.cols.map((col) => '' + ((col * 100) / tot).toFixed(2) + '%');
  return (
    <colgroup>
      {cols.map((ele, idx) => (
        <col width={ele} key={idx} />
      ))}
    </colgroup>
  );
};
