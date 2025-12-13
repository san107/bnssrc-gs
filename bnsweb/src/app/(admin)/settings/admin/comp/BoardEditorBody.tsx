'use client';

import { CKEditor } from '@ckeditor/ckeditor5-react';
import { Box, BoxProps, styled } from '@mui/material';
import {
  Alignment,
  Autoformat,
  Autosave,
  BalloonToolbar,
  BlockQuote,
  BlockToolbar,
  Bold,
  ClassicEditor,
  Code,
  CodeBlock,
  EditorConfig,
  Emoji,
  Essentials,
  FindAndReplace,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  GeneralHtmlSupport,
  Heading,
  Highlight,
  HorizontalLine,
  Indent,
  IndentBlock,
  Italic,
  List,
  ListProperties,
  Mention,
  Paragraph,
  PlainTableOutput,
  RemoveFormat,
  SourceEditing,
  SpecialCharacters,
  SpecialCharactersArrows,
  SpecialCharactersCurrency,
  SpecialCharactersEssentials,
  SpecialCharactersLatin,
  SpecialCharactersMathematical,
  SpecialCharactersText,
  Strikethrough,
  Style,
  Subscript,
  Superscript,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableLayout,
  TableProperties,
  TableToolbar,
  TextTransformation,
  Underline,
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import translations from 'ckeditor5/translations/ko.js';
//import domtoimage from 'dom-to-image';

/**
 * Create a free account with a trial: https://portal.ckeditor.com/checkout?plan=free
 */
const LICENSE_KEY = 'GPL'; // or <YOUR_LICENSE_KEY>.

export type BoardEditorProps = {
  data?: string;
  onChange?: (data: string) => void;
  editorheight?: string;
};
export function BoardEditorBody({
  data,
  editorheight,
  onChange,
  ...props
}: BoardEditorProps & BoxProps) {
  const editorContainerRef = useRef(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  useEffect(() => {
    setIsLayoutReady(true);

    return () => setIsLayoutReady(false);
  }, []);

  const { editorConfig }: { editorConfig: EditorConfig } = useMemo(() => {
    if (!isLayoutReady) {
      return {} as any;
    }

    return {
      editorConfig: {
        toolbar: {
          items: [
            'undo',
            'redo',
            '|',
            'sourceEditing',
            'findAndReplace',
            '|',
            'heading',
            //'style',
            '|',
            'fontSize',
            'fontFamily',
            'fontColor',
            'fontBackgroundColor',
            '|',
            'bold',
            'italic',
            'underline',
            'strikethrough',
            'subscript',
            'superscript',
            'code',
            'removeFormat',
            '|',
            'emoji',
            'specialCharacters',
            'horizontalLine',
            'insertTable',
            'insertTableLayout',
            'highlight',
            'blockQuote',
            'codeBlock',
            '|',
            'alignment',
            '|',
            'bulletedList',
            'numberedList',
            'outdent',
            'indent',
          ],
          shouldNotGroupWhenFull: true,
        },
        plugins: [
          Alignment,
          Autoformat,
          Autosave,
          BalloonToolbar,
          BlockQuote,
          BlockToolbar,
          Bold,
          Code,
          CodeBlock,
          Emoji,
          Essentials,
          FindAndReplace,
          FontBackgroundColor,
          FontColor,
          FontFamily,
          FontSize,
          GeneralHtmlSupport,
          Heading,
          Highlight,
          HorizontalLine,
          Indent,
          IndentBlock,
          Italic,
          List,
          ListProperties,
          Mention,
          Paragraph,
          PlainTableOutput,
          RemoveFormat,
          SourceEditing,
          SpecialCharacters,
          SpecialCharactersArrows,
          SpecialCharactersCurrency,
          SpecialCharactersEssentials,
          SpecialCharactersLatin,
          SpecialCharactersMathematical,
          SpecialCharactersText,
          Strikethrough,
          Style,
          Subscript,
          Superscript,
          Table,
          TableCaption,
          TableCellProperties,
          TableColumnResize,
          TableLayout,
          TableProperties,
          TableToolbar,
          TextTransformation,
          Underline,
        ],
        balloonToolbar: ['bold', 'italic', '|', 'bulletedList', 'numberedList'],
        blockToolbar: [
          'fontSize',
          'fontColor',
          'fontBackgroundColor',
          '|',
          'bold',
          'italic',
          '|',
          'insertTable',
          'insertTableLayout',
          '|',
          'bulletedList',
          'numberedList',
          'outdent',
          'indent',
        ],
        fontFamily: {
          supportAllValues: true,
        },
        fontSize: {
          options: [
            10,
            12,
            // 14,
            'default',
            16,
            18,
            20,
            22,
            24,
            26,
            28,
            30,
            32,
            34,
            36,
            38,
            40,
            42,
            44,
            46,
            48,
            50,
            52,
            54,
            56,
            58,
            60,
            62,
            64,
            66,
            68,
            70,
            72,
            74,
            76,
            78,
            80,
            82,
            84,
            86,
            88,
            90,
            92,
            94,
            96,
            98,
            100,
          ],
          supportAllValues: true,
        },
        heading: {
          options: [
            {
              model: 'paragraph',
              title: 'Paragraph',
              class: 'ck-heading_paragraph',
            },
            {
              model: 'heading1',
              view: 'h1',
              title: 'Heading 1',
              class: 'ck-heading_heading1',
            },
            {
              model: 'heading2',
              view: 'h2',
              title: 'Heading 2',
              class: 'ck-heading_heading2',
            },
            {
              model: 'heading3',
              view: 'h3',
              title: 'Heading 3',
              class: 'ck-heading_heading3',
            },
            {
              model: 'heading4',
              view: 'h4',
              title: 'Heading 4',
              class: 'ck-heading_heading4',
            },
            {
              model: 'heading5',
              view: 'h5',
              title: 'Heading 5',
              class: 'ck-heading_heading5',
            },
            {
              model: 'heading6',
              view: 'h6',
              title: 'Heading 6',
              class: 'ck-heading_heading6',
            },
          ],
        },
        htmlSupport: {
          allow: [
            {
              name: /^.*$/,
              styles: true,
              attributes: true,
              classes: true,
            },
          ],
        },
        initialData: data || '',
        licenseKey: LICENSE_KEY,
        list: {
          properties: {
            styles: true,
            startIndex: true,
            reversed: true,
          },
        },
        //placeholder: '내용을 입력하세요.',
        table: {
          contentToolbar: [
            'tableColumn',
            'tableRow',
            'mergeTableCells',
            'tableProperties',
            'tableCellProperties',
          ],
        },
        translations: [translations],
      },
    };
  }, [isLayoutReady, data]);

  //   const exportToPng = () => {
  //     if (!editorRef.current) return;

  //     const editorElement = editorRef.current.querySelector('.ck-content');
  //     if (!editorElement) return;
  //     (editorElement as HTMLElement).style.border = 'none';
  //     (editorElement as HTMLElement).style.outline = 'none';

  //     domtoimage.toPng(editorElement as HTMLElement).then((dataUrl) => {
  //       const link = document.createElement('a');
  //       link.download = 'editor-content.png';
  //       link.href = dataUrl;
  //       link.click();
  //     });
  //   };
  return (
    <StyledBox $editorheight={editorheight} {...props}>
      <div className='main-container'>
        <div
          // className='editor-container editor-container_classic-editor editor-container_include-style editor-container_include-block-toolbar'
          ref={editorContainerRef}
        >
          <div className='editor-container__editor'>
            <div ref={editorRef}>
              {editorConfig && (
                <CKEditor
                  editor={ClassicEditor}
                  config={editorConfig}
                  data={data || ''}
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    console.log('data', data);
                    onChange?.(data);
                    //console.log(event, editor);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </StyledBox>
  );
}

const StyledBox = styled(Box)<{ $editorheight?: string }>`
  .main-container {
    font-family: 'Lato';
    /* width: fit-content; */
    width: 100%;
    margin-left: auto;
    margin-right: auto;
  }

  .ck-content {
    font-family: 'Lato';
    line-height: 1.17;
    /* font-size: 32px; */
    word-break: break-word;
  }

  /* .editor-container_classic-editor .editor-container__editor {
    min-width: 795px;
    max-width: 795px;
  } */
  .editor-container__editor {
    width: 100%;
  }

  .editor-container_include-block-toolbar {
    margin-left: 42px;
  }

  .ck-content h3.category {
    font-family: 'Oswald';
    font-size: 20px;
    font-weight: bold;
    color: #555;
    letter-spacing: 10px;
    margin: 0;
    padding: 0;
  }

  .ck-content h2.document-title {
    font-family: 'Oswald';
    font-size: 50px;
    font-weight: bold;
    margin: 0;
    padding: 0;
    border: 0;
  }

  .ck-content h3.document-subtitle {
    font-family: 'Oswald';
    font-size: 20px;
    color: #555;
    margin: 0 0 1em;
    font-weight: bold;
    padding: 0;
  }

  .ck-content span.marker {
    background: yellow;
  }

  .ck-content span.spoiler {
    background: #000;
    color: #000;
  }

  .ck-content span.spoiler:hover {
    background: #000;
    color: #fff;
  }

  .ck-content .button {
    display: inline-block;
    width: 260px;
    border-radius: 8px;
    margin: 0 auto;
    padding: 12px;
    color: #ffffff;
    font-size: 24px;
    font-weight: 700;
    text-align: center;
    text-decoration: none;
  }

  .ck-content .button--green {
    background-color: #406b1e;
  }

  .ck-content .button--black {
    background-color: #141517;
  }

  .ck.ck-editor__editable_inline > :first-of-type {
    margin-top: 0;
  }

  .ck.ck-content.ck-editor__editable {
    padding: 10px;
    margin: 0;
    min-height: ${(p) => p.$editorheight || '300px'};
    //line-height: 1.17em;
    /* background-color: black; */
    /* color: yellow; */
  }
  .ck.ck-content.ck-editor__editable * {
    //line-height: 1.17em;
    //height: fit-content;
  }

  .ck.ck-reset.ck-list {
    max-height: 300px;
    overflow-y: auto;
  }
`;
