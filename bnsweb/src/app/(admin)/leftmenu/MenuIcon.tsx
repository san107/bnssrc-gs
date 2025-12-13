'use client';

import { useMounted } from '@/hooks/useMounted';
// @flow
import { SvgIconComponent } from '@mui/icons-material';
import { Box } from '@mui/material';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MouseEventHandler } from 'react';
import { IconType } from 'react-icons/lib';
type Props = {
  comp: SvgIconComponent | IconType;
  href: string | string[];
  title: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  hideTitle?: boolean;
};
export const MenuIcon = ({ comp: Comp, href, onClick, title, hideTitle }: Props) => {
  const path = usePathname();
  const isMounted = useMounted();

  const isCurrentMenu = () => {
    if (Array.isArray(href)) {
      return href.reduce((acc, cur) => {
        if (acc) return acc;
        return path.startsWith(cur);
      }, false);
    }
    if (href === '/') {
      if (path === href) {
        return true;
      }
      return false;
    }
    return path.startsWith(href);
  };

  if (!isMounted) return null;
  return (
    <Box
      sx={{ textAlign: 'center', paddingTop: 1, paddingBottom: 1 }}
      className={clsx('menubox', isCurrentMenu() ? 'sel' : undefined)}
    >
      <Link
        href={Array.isArray(href) ? href[0] : href}
        onClick={onClick}
        title={title}
        prefetch={false}
      >
        <Comp style={{ width: 70, height: 40, padding: 5 }} className='menu-svg' />

        {hideTitle ? (
          <Box sx={{ height: '1px' }}></Box>
        ) : (
          <Box className='label menu-title'>
            <label>{title}</label>
          </Box>
        )}
      </Link>
    </Box>
  );
};
