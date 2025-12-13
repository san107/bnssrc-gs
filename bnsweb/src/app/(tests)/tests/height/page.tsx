'use client';
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

export default function Index() {
  return (
    <div
      css={css`
        height: 500px;
        width: 800px;
        border: 1px solid red;
        div:nth-child(even) {
          border: 1px solid red;
        }
        div:nth-child(odd) {
          border: 1px solid blue;
        }
        display: flex;
        flex-direction: column;
      `}
    >
      <div>테스트</div>
      <div
        css={css`
          //height: 100%;
          flex-grow: 1;
          width: 50%;
          display: flex;
          //overflow: auto;
          justify-content: stretch;
          flex-direction: column;
        `}
      >
        <div
          css={css`
            flex-grow: 1;
          `}
        >
          테스트1
        </div>
        <div
          css={css`
            display: flex;
            flex-grow: 1;
            flex-direction: column;
            overflow-y: auto;
            //height: 200px;
            height: 1px;
            &&& {
              background-color: #ccc;
            }
          `}
        >
          테스트
          {new Array(50).fill(0).map((ele, idx) => (
            <div key={idx}>{idx}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
