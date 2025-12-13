'use client';

//import { EbrdEdior } from '@/app/(admin)/settings/ebrd/comp/EbrdEditor';
import { Box } from '@mui/material';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

const TestEditor = dynamic(
  () => import('@/app/(tests)/tests/ckeditor/TestEditor').then((mod) => mod.TestEditor),
  { ssr: false, loading: () => <div>Loading editor...</div> }
);

const EbrdEditor = dynamic(
  () => import('@/app/(admin)/settings/ebrd/comp/EbrdEditor').then((mod) => mod.EbrdEditor),
  { ssr: false, loading: () => <div>Loading editor...</div> }
);

export default function Page() {
  const [data, setData] = useState('');
  const [fontSize, setFontSize] = useState(10);
  const editorRef = useRef<any>(null);
  const editorBodyRef = useRef<any>(null);

  useEffect(() => {
    console.log('fontSize', fontSize);
    console.log('editorBodyRef.editor', editorBodyRef.current?.editor);
    console.log('editorBodyRef.editor.execute', editorBodyRef.current?.editor.execute);
    //editorBodyRef.current?.execute('fontSize', { value: fontSize });
    editorBodyRef.current?.editor.execute('fontSize', { value: fontSize + 'px' });
  }, [fontSize]);

  console.log('editorBodyRef', editorBodyRef.current);
  return (
    <Box>
      <input
        type='text'
        value={fontSize}
        onChange={(e) => setFontSize(Number(e.target.value))}
        style={{ width: '100%', border: '1px solid #ccc', padding: '10px' }}
      />
      <TestEditor editorRef={editorRef} editorBodyRef={editorBodyRef} />
      <EbrdEditor data={data} editorheight='200px' sx={{ width: '700px' }} />
      <button onClick={() => setData('test')}>Set Data</button>
    </Box>
  );
}
