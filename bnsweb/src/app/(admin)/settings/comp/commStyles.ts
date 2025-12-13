/* 이 파일에서 settings 페이지에서 사용하는 공통 스타일을 정의 */

// 목록 페이지 스타일 정의
export const listStyles = {
  rootBox: {
    padding: 2,
    flexGrow: 1,
    height: '1px',
  },
  contentBox: {
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    gap: 2,
    height: '100%',
  },
  listBox: {
    flex: { xs: 'none', md: 1 },
    height: { xs: 'auto', md: '100%' },
    width: { xs: '100%', md: '1px' },
  },
  listBoxWH: {
    flex: { xs: 'none', md: '0 0 50%' },
    height: { xs: 'auto', md: '100%' },
    width: { xs: '100%', md: '50%' },
  },
  card: {
    padding: 2,
    height: { xs: 'auto', md: '100%' },
    display: 'flex',
    flexDirection: 'column',
    '& .MuiButton-root': {
      gap: 0.5,
      minWidth: '70px',
      minHeight: '60px',
      '& .MuiButton-startIcon': {
        margin: 0,
      },
    },
  },
  cardNone: {
    padding: 2,
    height: { xs: 'auto', md: '100%' },
    display: 'flex',
    flexDirection: 'column',
  },
  titleBox: {
    bgcolor: 'primary.main',
    color: 'primary.contrastText',
    borderRadius: 2,
    p: 1,
    mr: 2,
    display: 'flex',
    alignItems: 'center',
  },
  titleText: {
    width: { xs: '180px', md: 'auto' },
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  exelDownButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0.5,
    minWidth: '70px',
  },
  tableContainer: {
    height: { xs: 'auto', md: '1px' },
    mt: 2,
    boxShadow: 'none',
    borderRadius: 0,
    flexGrow: 1,
    '& .MuiTableCell-root': {
      padding: '8px 4px',
    },
    '& .sel': {
      backgroundColor: '#eef',
    },
    '& tr': {
      cursor: 'pointer',
    },
    '& .MuiTableCell-head': {
      color: '#666',
      borderTop: '3px solid #2c2c2c',
      borderBottom: '2px solid #e0e0e0',
      backgroundColor: '#f5f5f5',
    },
  },
  tableRow: {
    '&:last-child td, &:last-child th': { border: 0 },
  },
  tableRowNoPadding: {
    '&:last-child td, &:last-child th': { border: 0 },
    '& .MuiTableCell-root': {
      padding: '0',
    },
  },
  formBox: {
    width: { xs: '100%', md: '400px' },
    height: { xs: 'auto', md: '100%' },
  },
  formBox450: {
    width: { xs: '100%', md: '450px' },
    height: { xs: 'auto', md: '100%' },
  },
  formBoxWH: {
    width: { xs: '100%', md: '50%' },
    height: { xs: 'auto', md: '100%' },
  },
  commButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0.5,
    minWidth: '70px',
  },
};

// 폼 페이지 스타일 정의
export const formStyles = {
  comboLabel: {
    fontSize: '14px',
    color: '#5180fe',
  },
  selectLabel: {
    fontSize: '14px',
    // color: '#319a76',
  },
};

// Typography 스타일 정의
export const typoStyles = {
  subTitle: {
    fontSize: '20px',
    fontWeight: 500,
  },
  center: {
    textAlign: 'center',
  },
};
