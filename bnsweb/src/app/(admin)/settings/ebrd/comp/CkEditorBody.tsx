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

/**
 * Create a free account with a trial: https://portal.ckeditor.com/checkout?plan=free
 */
const LICENSE_KEY = 'GPL'; // or <YOUR_LICENSE_KEY>.

export type CkEditorProps = {
  initialData?: string;
};

export function CkEditorBody({ initialData }: CkEditorProps & BoxProps) {
  const editorContainerRef = useRef(null);
  const editorRef = useRef(null);
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
            'style',
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
          options: [10, 12, 14, 'default', 18, 20, 22],
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
        initialData: initialData || '',
        licenseKey: LICENSE_KEY,
        list: {
          properties: {
            styles: true,
            startIndex: true,
            reversed: true,
          },
        },
        mention: {
          feeds: [
            {
              marker: '@',
              feed: [
                /* See: https://ckeditor.com/docs/ckeditor5/latest/features/mentions.html */
              ],
            },
          ],
        },
        placeholder: 'Type or paste your content here!',
        style: {
          definitions: [
            {
              name: 'Article category',
              element: 'h3',
              classes: ['category'],
            },
            {
              name: 'Title',
              element: 'h2',
              classes: ['document-title'],
            },
            {
              name: 'Subtitle',
              element: 'h3',
              classes: ['document-subtitle'],
            },
            {
              name: 'Info box',
              element: 'p',
              classes: ['info-box'],
            },
            {
              name: 'CTA Link Primary',
              element: 'a',
              classes: ['button', 'button--green'],
            },
            {
              name: 'CTA Link Secondary',
              element: 'a',
              classes: ['button', 'button--black'],
            },
            {
              name: 'Marker',
              element: 'span',
              classes: ['marker'],
            },
            {
              name: 'Spoiler',
              element: 'span',
              classes: ['spoiler'],
            },
          ],
        },
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
  }, [isLayoutReady, initialData]);

  return (
    <StyledBox>
      <div className='main-container'>
        <div
          className='editor-container editor-container_classic-editor editor-container_include-style editor-container_include-block-toolbar'
          ref={editorContainerRef}
        >
          <div className='editor-container__editor'>
            <div ref={editorRef}>
              {editorConfig && <CKEditor editor={ClassicEditor} config={editorConfig} />}
            </div>
          </div>
        </div>
      </div>
    </StyledBox>
  );
}

const StyledBox = styled(Box)({
  '& .main-container': {
    fontFamily: 'Lato',
    width: 'fit-content',
    marginLeft: 'auto',
    marginRight: 'auto',
  },

  '& .ck-content': {
    fontFamily: 'Lato',
    lineHeight: 1.6,
    wordBreak: 'break-word',
  },

  '& .editor-container_classic-editor .editor-container__editor': {
    minWidth: '795px',
    maxWidth: '795px',
  },

  '& .editor-container_include-block-toolbar': {
    marginLeft: 42,
  },

  '& .ck-content h3.category': {
    fontFamily: 'Oswald',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#555',
    letterSpacing: 10,
    margin: 0,
    padding: 0,
  },

  '& .ck-content h2.document-title': {
    fontFamily: 'Oswald',
    fontSize: 50,
    fontWeight: 'bold',
    margin: 0,
    padding: 0,
    border: 0,
  },

  '& .ck-content h3.document-subtitle': {
    fontFamily: 'Oswald',
    fontSize: 20,
    color: '#555',
    margin: '0 0 1em',
    fontWeight: 'bold',
    padding: 0,
  },

  '& .ck-content p.info-box': {
    '--background-size': '30px',
    '--background-color': '#e91e63',
    padding: '1.2em 2em',
    border: '1px solid var(--background-color)',
    background:
      'linear-gradient(135deg, var(--background-color) 0%, var(--background-color) var(--background-size), transparent var(--background-size))',
    borderRadius: 10,
    margin: '1.5em 2em',
    boxShadow: '5px 5px 0 #ffe6ef',
  },

  '& .ck-content span.marker': {
    background: 'yellow',
  },

  '& .ck-content span.spoiler': {
    background: '#000',
    color: '#000',
  },

  '& .ck-content span.spoiler:hover': {
    background: '#000',
    color: '#fff',
  },

  '& .ck-content .button': {
    display: 'inline-block',
    width: 260,
    borderRadius: 8,
    margin: '0 auto',
    padding: 12,
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 700,
    textAlign: 'center',
    textDecoration: 'none',
  },

  '& .ck-content .button--green': {
    backgroundColor: '#406b1e',
  },

  '& .ck-content .button--black': {
    backgroundColor: '#141517',
  },
});
