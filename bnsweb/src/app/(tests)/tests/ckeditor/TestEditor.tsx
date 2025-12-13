'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  ClassicEditor,
  Alignment,
  Autoformat,
  AutoImage,
  AutoLink,
  Autosave,
  BalloonToolbar,
  BlockQuote,
  BlockToolbar,
  Bold,
  Bookmark,
  Code,
  CodeBlock,
  Essentials,
  FindAndReplace,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  FullPage,
  Fullscreen,
  GeneralHtmlSupport,
  Heading,
  Highlight,
  HorizontalLine,
  HtmlComment,
  HtmlEmbed,
  ImageBlock,
  ImageCaption,
  ImageInline,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  Indent,
  IndentBlock,
  Italic,
  Link,
  LinkImage,
  List,
  ListProperties,
  MediaEmbed,
  Paragraph,
  PasteFromOffice,
  PlainTableOutput,
  RemoveFormat,
  ShowBlocks,
  SourceEditing,
  SpecialCharacters,
  SpecialCharactersArrows,
  SpecialCharactersCurrency,
  SpecialCharactersEssentials,
  SpecialCharactersLatin,
  SpecialCharactersMathematical,
  SpecialCharactersText,
  Strikethrough,
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
  TodoList,
  Underline,
  EditorConfig,
} from 'ckeditor5';

import translations from 'ckeditor5/translations/ko.js';

import 'ckeditor5/ckeditor5.css';
import { styled } from '@mui/material';
import { useIsMounted } from '@/hooks/useIsMounted';

const LICENSE_KEY = 'GPL'; // or <YOUR_LICENSE_KEY>.

export function TestEditor({
  editorRef,
  editorBodyRef,
}: {
  editorRef: React.RefObject<HTMLDivElement | null>;
  editorBodyRef: React.RefObject<any | null>;
}) {
  const editorContainerRef = useRef(null);
  //const editorRef = useRef(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const isMounted = useIsMounted();

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
            'showBlocks',
            'findAndReplace',
            'fullscreen',
            '|',
            'heading',
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
            'specialCharacters',
            'horizontalLine',
            'link',
            'bookmark',
            'insertImageViaUrl',
            'mediaEmbed',
            'insertTable',
            'insertTableLayout',
            'highlight',
            'blockQuote',
            'codeBlock',
            'htmlEmbed',
            '|',
            'alignment',
            '|',
            'bulletedList',
            'numberedList',
            'todoList',
            'outdent',
            'indent',
          ],
          shouldNotGroupWhenFull: false,
        },
        plugins: [
          Alignment,
          Autoformat,
          AutoImage,
          AutoLink,
          Autosave,
          BalloonToolbar,
          BlockQuote,
          BlockToolbar,
          Bold,
          Bookmark,
          Code,
          CodeBlock,
          Essentials,
          FindAndReplace,
          FontBackgroundColor,
          FontColor,
          FontFamily,
          FontSize,
          FullPage,
          Fullscreen,
          GeneralHtmlSupport,
          Heading,
          Highlight,
          HorizontalLine,
          HtmlComment,
          HtmlEmbed,
          ImageBlock,
          ImageCaption,
          ImageInline,
          ImageInsertViaUrl,
          ImageResize,
          ImageStyle,
          ImageTextAlternative,
          ImageToolbar,
          Indent,
          IndentBlock,
          Italic,
          Link,
          LinkImage,
          List,
          ListProperties,
          MediaEmbed,
          Paragraph,
          PasteFromOffice,
          PlainTableOutput,
          RemoveFormat,
          ShowBlocks,
          SourceEditing,
          SpecialCharacters,
          SpecialCharactersArrows,
          SpecialCharactersCurrency,
          SpecialCharactersEssentials,
          SpecialCharactersLatin,
          SpecialCharactersMathematical,
          SpecialCharactersText,
          Strikethrough,
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
          TodoList,
          Underline,
        ],
        balloonToolbar: ['bold', 'italic', '|', 'link', '|', 'bulletedList', 'numberedList'],
        blockToolbar: [
          'fontSize',
          'fontColor',
          'fontBackgroundColor',
          '|',
          'bold',
          'italic',
          '|',
          'link',
          'insertTable',
          'insertTableLayout',
          '|',
          'bulletedList',
          'numberedList',
          'outdent',
          'indent',
        ],
        fontFamily: {
          options: [
            'default',
            // 기본 폰트
            'Arial, Helvetica, sans-serif',
            'Times New Roman, Times, serif',

            // 커스텀 폰트
            'Noto Sans KR, sans-serif',
            'Nanum Gothic, sans-serif',
            'Malgun Gothic, sans-serif',
            '맑은 고딕, sans-serif',
            '굴림체,굴림체',
            '나눔고딕,나눔고딕',
            'Noto Sans KR, sans-serif',
          ],
          supportAllValues: true,
        },
        fontSize: {
          options: [
            10,
            12,
            13,
            14,
            'default',
            18,
            20,
            22,
            ...Array(200)
              .fill(0)
              .map((ele, idx) => idx + 23),
          ],
          supportAllValues: true,
        },
        fullscreen: {
          onEnterCallback: (container) =>
            container.classList.add(
              'editor-container',
              'editor-container_classic-editor',
              'editor-container_include-block-toolbar',
              'editor-container_include-fullscreen',
              'main-container'
            ),
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
        image: {
          toolbar: [
            'toggleImageCaption',
            'imageTextAlternative',
            '|',
            'imageStyle:inline',
            'imageStyle:wrapText',
            'imageStyle:breakText',
            '|',
            'resizeImage',
          ],
        },
        initialData: 'initdata<br/>테스트',
        language: 'ko',
        licenseKey: LICENSE_KEY,
        link: {
          addTargetToExternalLinks: true,
          defaultProtocol: 'https://',
          decorators: {
            toggleDownloadable: {
              mode: 'manual',
              label: 'Downloadable',
              attributes: {
                download: 'file',
              },
            },
          },
        },
        list: {
          properties: {
            styles: true,
            startIndex: true,
            reversed: true,
          },
        },
        placeholder: 'Type or paste your content here!',
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
  }, [isLayoutReady]);

  if (!isMounted) return null;

  return (
    <Body>
      <div className='main-container'>
        <div
          className='editor-container editor-container_classic-editor editor-container_include-block-toolbar editor-container_include-fullscreen'
          ref={editorContainerRef}
        >
          <div className='editor-container__editor'>
            <div ref={editorRef}>
              {editorConfig && (
                <CKEditor ref={editorBodyRef} editor={ClassicEditor} config={editorConfig} />
              )}
            </div>
          </div>
        </div>
      </div>
      <FontTest>
        <p>
          <span>테스트</span>
        </p>
        <p>
          <span>테스트2</span>
        </p>
        <p>
          <span>la;s jfaldk aslf ;</span>
        </p>
      </FontTest>
    </Body>
  );
}

const FontTest = styled('div')`
  background-color: black;
  color: white;

  & p {
    min-height: 0;
    padding: 0;
    margin: 0;
    line-height: 0%;
  }

  & p > span {
    line-height: 2em;
    background-color: blue;
    //height: 3em;
    display: inline-block;
    min-height: 0;
  }

  & :first-child > span {
    font-size: 15px;
  }
  & :nth-child(2) > span {
    font-size: 20px;
  }
  & :nth-child(3) > span {
    font-size: 25px;
  }
`;

const Body = styled('div')`
  @media print {
    body {
      margin: 0 !important;
    }
  }

  .main-container {
    font-family: 'Lato';
    width: fit-content;
    margin-left: auto;
    margin-right: auto;
  }

  .ck-content {
    font-family: 'Lato';
    line-height: 1.6;
    word-break: break-word;
  }

  .editor-container_classic-editor .editor-container__editor {
    min-width: 795px;
    max-width: 795px;
  }

  .editor-container_include-block-toolbar {
    margin-left: 42px;
  }
  .ck.ck-content.ck-editor__editable {
    min-height: 200px;
    line-height: 1em;
    background-color: black;
    color: yellow;
  }
`;
