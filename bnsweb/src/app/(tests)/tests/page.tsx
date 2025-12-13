'use client';

import { useAlert, useDlgAlert } from '@/app/(admin)/comp/popup/DlgAlert';
import { useConfirm } from '@/app/(admin)/comp/popup/DlgConfirm';
import { useDlgMap } from '@/app/(admin)/comp/popup/DlgMap';
import { LatLng } from '@/models/models';
import styled from '@emotion/styled';
import { Box, Button, ButtonProps } from '@mui/material';
import { MouseEventHandler, useEffect, useState } from 'react';
import { toast } from 'sonner';
import useSWR, { KeyedMutator, useSWRConfig } from 'swr';
import { z, ZodError } from 'zod';
import { create } from 'zustand';
import ReactDOMServer, { renderToStaticMarkup } from 'react-dom/server';
import { useDlgInput } from '@/app/(admin)/comp/popup/DlgInput';
import { exportToXls, exportToXlsYmdHms } from '@/utils/xls-utils';
import { useDlgGate } from '@/app/(admin)/comp/popup/DlgGate';
import { useDlgWater } from '@/app/(admin)/comp/popup/DlgWater';
import { useDlgDateRange } from '@/app/(admin)/comp/popup/DlgDateRange';
import { useDlgFileUpload } from '@/app/(admin)/comp/popup/DlgFileUpload';
import { useDlgAutogate } from '@/app/(admin)/comp/gatectl/autogate/DlgAutogate';
import { useDlgCommErr } from '@/app/(admin)/comp/water_grp/DlgCommErr';
import { useDlgWaterGrpWarn } from '@/app/(admin)/comp/water_grp/DlgWaterGrpWarn';
import { useDlgWaterGrpCrit } from '@/app/(admin)/comp/water_grp/DlgWaterGrpCrit';

const User = z.object({
  username: z.string().max(1),
});

const useApiTest = (): [unknown, KeyedMutator<unknown>] => {
  const { data, mutate } = useSWR<unknown>('/api/auth/login?a=b');
  return [data, mutate];
};

const useTestStore = create<{
  setV: (v: number) => void;
  v: number;
}>((set) => ({
  setV: (v: number) => set({ v }),
  v: 0,
}));

const testStore = () => {
  useTestStore.setState({ v: 1 });
};

export default function Main() {
  const mySchema = z.string();
  const [apiTest] = useApiTest();
  const alert = useAlert();
  const confirm = useConfirm();
  const [dlgMap, DlgMap] = useDlgMap();
  const [dlgGate, DlgGate] = useDlgGate();
  const [dlgWater, DlgWater] = useDlgWater();
  const { mutate } = useSWRConfig();
  const { data: gates } = useSWR(['/api/gate/list']);
  const { setV, v } = useTestStore();

  useEffect(() => {
    console.log('gates', gates);
  }, [gates]);

  useEffect(() => {
    console.log('apiTest', apiTest);
  }, [apiTest]);
  const btns: [string, ButtonProps['color'] | '', MouseEventHandler<HTMLButtonElement>][] = [
    ['API TEST1', '', (_e) => console.log('test')],
    ['mutate test', '', (_e) => mutate((e) => console.log(e))],
    ['mutate test2', '', (_e) => mutate('/api/auth/login')],
    ['mutate gates', '', (_e) => mutate(['/api/gate/list'])],
    [
      'dlg alert',
      '',
      (_e) => refAlert.current?.show('', ['테스트 메시지입니다', '테스트 메시지입니다2']),
    ],
    ['use alert', '', () => alert('title', ['msgs1', 'msgs2'])],
    ['use confirm', '', () => confirm('title', ['msgs1', 'msgs2'])],
    [
      'toaster',
      '',
      (_e) => {
        toast('test... ... \ntest');
        toast.error('에러 ');
        toast.warning('warning ');
        toast.info('info ');
        toast.success('성공 ');
      },
    ],
    [
      'toaster2',
      'secondary',
      (_e) =>
        toast(
          <div>
            테스트
            <br />
            테스트2
          </div>,
          {
            style: {},
          }
        ),
    ],
    [
      'zod',
      'info',
      () => {
        console.log('zod tset');
        // parsing
        mySchema.parse('tuna'); // => "tuna"
        try {
          mySchema.parse(12); // => throws ZodError
        } catch (e) {
          if (e instanceof ZodError) {
            console.log('zod error');
          }
          console.error('E', e);
        }
        // "safe" parsing (doesn't throw error if validation fails)
        console.log(mySchema.safeParse('tuna')); // => { success: true; data: "tuna" }
        console.log(mySchema.safeParse(12)); // => { success: false; error: ZodError }

        try {
          console.log(User.parse({ username: 'test' }));
        } catch (e) {
          console.error('E', e);
        }
        console.log('saveparse', User.safeParse({ username: 'test' }));
      },
    ],
    ['error', 'error', () => null],
    ['info', 'info', () => null],
    ['primary', 'primary', () => null],
    ['secondary', 'secondary', () => null],
    ['success', 'success', () => null],
    ['warning', 'warning', () => null],
    ['test', 'test', () => null],
    ['dlg map', '', () => dlgMap.current?.show('지도 좌표 선택', new LatLng())],
    ['dlg gate', '', () => dlgGate.current?.show()],
    ['dlg water', '', () => dlgWater.current?.show()],
    [
      'jsx',
      '',
      () => {
        console.log('jsx test', test());
        // renderToStatic Markup.
        console.log('jsx test', ReactDOMServer.renderToString(test()));

        const html = renderToStaticMarkup(test());
        console.log('html is ', html);
      },
    ],
    ['add v', '', () => setV(v + 1)],
    [
      'xls',
      '',
      () => {
        exportToXls(
          [
            ['a', 'b', 'c'],
            ['a', 'b', 'c'],
            ['한글', 'b', 'c'],
          ],
          'a',
          'a.xlsx'
        );
      },
    ],
    [
      'xls2',
      '',
      () => {
        exportToXlsYmdHms(
          [
            ['a', 'b', 'c'],
            ['a', 'b', 'c'],
            ['한글', 'b', 'c'],
          ],
          'a'
        );
      },
    ],
    ['add v global', '', () => testStore()],
    [
      'dlg input',
      '',
      () =>
        dlgInput.current
          ?.show('즐겨찾기 이름 입력', ['즐겨찾기 이름을', '입력하여 주십시오'])
          .then((res) => {
            console.log('res', res);
          })
          .catch((e) => {
            console.error('E', e);
          }),
    ],
    [
      'dlg date range',
      '',
      () =>
        dlgDateRange.current
          ?.show()
          .then((res) => console.log('res', res))
          .catch((e) => console.error('E', e)),
    ],
    [
      'dlg file upload',
      '',
      () => dlgFileUpload.current?.show({}).then((res) => console.log('res is ', res)),
    ],
    ['dlg autogate', '', () => dlgAutogate.current?.show({})],
    ['dlg comm err', '', () => refCommErr.current?.show({ waterGrpId: '1,5' })],
    ['dlg water grp warn', '', () => refWaterGrpWarn.current?.show({ waterGrpId: '1,5' })],
    ['dlg water grp crit', '', () => refWaterGrpCrit.current?.show({ waterGrpId: '1,5' })],
  ];

  const test = () => {
    return (
      <div className='testred'>
        <Box sx={{ minHeight: '10px' }}></Box>
      </div>
    );
  };

  const { count, increment, decrement } = useStore();
  const [refAlert, DlgAlert] = useDlgAlert();
  const [dlgInput, DlgInput] = useDlgInput();
  const [dlgDateRange, DlgDateRange] = useDlgDateRange();
  const [dlgFileUpload, DlgFileUpload] = useDlgFileUpload();
  const [fileSeq, setFileSeq] = useState<number | null>(null);
  const [dlgAutogate, DlgAutogate] = useDlgAutogate();

  const [refCommErr, DlgCommErr] = useDlgCommErr();
  const [refWaterGrpWarn, DlgWaterGrpWarn] = useDlgWaterGrpWarn();
  const [refWaterGrpCrit, DlgWaterGrpCrit] = useDlgWaterGrpCrit();

  //(window as any).crit = refWaterGrpCrit;
  return (
    <Body>
      {btns.map(([name, color, handler], index) => (
        <Button key={index} onClick={handler} color={color || 'primary'} sx={{ m: 0.2 }}>
          {name}
        </Button>
      ))}
      <div>
        <Counter />
      </div>
      <div>
        <Button onClick={() => increment()}>inc</Button>
        <Button onClick={() => decrement()}>dec</Button>
        outer : {count}
        <hr />
        api test is
        {JSON.stringify(apiTest)}
      </div>
      <div className='bg-slate-200'>
        <div>test</div>
      </div>
      <div>테스트 v is {v}</div>
      <div>
        <input
          type='text'
          value={fileSeq ?? ''}
          onChange={(e) => setFileSeq(Number(e.target.value))}
          placeholder='Enter file sequence number'
        />
        <img
          src={`/api/public/file/download?fileSeq=${fileSeq}`}
          alt='Preview'
          style={{
            maxWidth: '100%',
            maxHeight: '300px',
            objectFit: 'contain',
          }}
        />
      </div>
      <DlgAlert />
      <DlgMap />
      <DlgInput />
      <DlgGate />
      <DlgWater />
      <DlgDateRange />
      <DlgFileUpload />
      <DlgAutogate />
      <DlgCommErr />
      <DlgWaterGrpWarn />
      <DlgWaterGrpCrit />
    </Body>
  );
}

const Body = styled(Box)`
  & button {
    margin: 2px;
  }
`;

const useStore = create<{ count: number; increment: () => void; decrement: () => void }>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));
const Counter = () => {
  const { count, increment, decrement } = useStore();
  return (
    <div>
      <Button onClick={() => increment()}>inc</Button>
      <Button onClick={() => decrement()}>dec</Button>
      inner : {count}
    </div>
  );
};
