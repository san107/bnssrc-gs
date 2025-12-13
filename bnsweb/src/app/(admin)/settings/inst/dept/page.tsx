'use client';

import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import { FormDept } from '@/app/(admin)/settings/inst/dept/FormDept';
import { RelatedItems } from '@/app/(admin)/settings/inst/dept/RelatedItems';
import { useGrpList } from '@/hooks/useGrpList';
import { IfTbGrp, TbGrp } from '@/models/tb_grp';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import { Box, Card, SvgIcon, Typography } from '@mui/material';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import clsx from 'clsx';
import { useState } from 'react';
import { listStyles } from '@/app/(admin)/settings/comp/commStyles';

export default function DepartmentIndex() {
  const [sel, setSel] = useState(new TbGrp());
  //const [openDlg, setOpenDlg] = useState<boolean>(false);
  const { data: list } = useGrpList();

  const handleClickRow = (row: IfTbGrp) => {
    setSel({ ...row });
  };

  return (
    <Box sx={{ padding: 2, flexGrow: 1, height: '1px' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          height: '100%',
        }}
      >
        <Box
          sx={{
            flex: { xs: 'none', md: 1 },
            height: { xs: 'auto', md: '100%' },
          }}
        >
          <Card
            sx={{
              padding: 2,
              height: { xs: 'auto', md: '100%' },
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <SettingTitle>
              <Box sx={listStyles.titleBox}>
                <SvgIcon fontSize='large'>
                  <FolderSharedIcon />
                </SvgIcon>
              </Box>
              <Box>
                <Typography variant='h5' fontWeight={700} color='text.primary'>
                  부서 목록
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={listStyles.titleText}>
                  등록된 부서의 정보를 보여줍니다.
                </Typography>
              </Box>
            </SettingTitle>
            {/* <Button variant='outlined' size='small' onClick={() => setOpenDlg(true)}>
                부서트리 관리
              </Button> */}
            <TableContainer
              component={Paper}
              sx={listStyles.tableContainer}
              className='scroll-table'
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell align='center'>ID</TableCell>
                    <TableCell>부서명</TableCell>
                    <TableCell align='center'>부서설명</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {list?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ textAlign: 'center' }}>
                        등록된 부서가 없습니다.
                      </TableCell>
                    </TableRow>
                  )}
                  {(list || []).map((row) => (
                    <TableRow
                      key={row.grp_id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      onClick={() => handleClickRow(row)}
                      className={clsx({ sel: row.grp_id === sel?.grp_id })}
                    >
                      <TableCell>{row.grp_id}</TableCell>
                      <TableCell>{row.grp_nm}</TableCell>
                      <TableCell>{row.grp_desc}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>
        <Box
          sx={{
            width: { xs: '100%', md: '400px' },
            height: { xs: 'auto', md: '100%' },
          }}
        >
          <FormDept sel={sel} setSel={setSel} />
        </Box>
        <Box
          sx={{
            flex: { xs: 'none', md: 2 },
            height: { xs: 'auto', md: '100%' },
          }}
        >
          <RelatedItems sel={sel} />
        </Box>
      </Box>
      {/* <DlgGrpTree open={openDlg} onClose={() => setOpenDlg(false)} /> */}
    </Box>
  );
}
