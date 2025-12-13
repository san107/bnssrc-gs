import { useMediaQuery, useTheme } from '@mui/material';

export const useMobile = () => {
  const theme = useTheme();

  // 데스크탑 : 1280px 이상
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  // 태블릿 : 900px 이상, 1280px 미만
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  // 모바일 : 600px 이하
  // const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // 모바일 : 900px 이하
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  return { isDesktop, isTablet, isMobile };
};
