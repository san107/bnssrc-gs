'use client';
import { IfTbGrpTree } from '@/models/tb_grp_tree';
import { IfTbLogin, TbLogin } from '@/models/tb_login';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { create } from 'zustand';

const useLoginStore = create<{
  setLogin: (v: IfTbLogin) => void;
  login: IfTbLogin;
  grpDepth: number;
  setGrpDepth: (v: number) => void;
}>((set) => ({
  setLogin: (v: IfTbLogin) => set({ login: v }),
  login: new TbLogin(),
  grpDepth: 9,
  setGrpDepth: (v: number) => set({ grpDepth: v }),
}));

export const useLoginInfo = (): {
  login: IfTbLogin;
  logout: () => void;
  getlogin: () => void;
} => {
  const { login, setLogin } = useLoginStore();
  const router = useRouter();

  const getlogin = useCallback(() => {
    axios
      .get('/api/auth/login')
      .then((res) => {
        if (!res?.data?.user_id) {
          router.push('/login');
        }
        setLogin(res.data);
        console.log('login info', res.data);
      })
      .catch((e) => {
        console.error('E', e);
        setLogin(new TbLogin());
      });
  }, [router, setLogin]);
  const logout = useCallback(() => {
    setLogin(new TbLogin());
    axios.get('/api/auth/logout').finally(() => {
      router.push('/login');
    });
  }, [router, setLogin]);
  return { login, logout, getlogin };
};

export const useGrpDepth = (): number => {
  const { login, grpDepth, setGrpDepth } = useLoginStore();
  useEffect(() => {
    if (!login?.grp_id) {
      setGrpDepth(9);
      return;
    }
    axios
      .get<IfTbGrpTree>('/api/grp_tree/one?parentId=' + login.grp_id + '&childId=' + login.grp_id)
      .then((res) => {
        setGrpDepth(res.data?.grp_depth ?? 9);
        console.log('grpDepth', res.data?.grp_depth);
      })
      .catch(() => {
        setGrpDepth(9);
      });
  }, [grpDepth, login?.grp_id, setGrpDepth]);
  return grpDepth;
};

export const useLoginRole = (): {
  isAdmin: boolean;
  isInst: boolean;
  role: 'Admin' | 'Inst' | 'User';
  hasAuth: (targetRole?: 'Admin' | 'Inst' | 'User') => boolean;
} => {
  const { login } = useLoginInfo();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isInst, setIsInst] = useState(false);

  useEffect(() => {
    if (login.user_role == 'Admin') {
      setIsAdmin(true);
      setIsInst(false);
    } else if (login.user_role == 'Inst') {
      setIsInst(true);
      setIsAdmin(false);
    } else {
      setIsAdmin(false);
      setIsInst(false);
    }
  }, [login]);

  const hasAuth = (targetRole?: 'Admin' | 'Inst' | 'User') => {
    if (!targetRole) {
      return true;
    }
    if (targetRole == 'Admin') {
      return isAdmin || isInst;
    } else if (targetRole == 'Inst') {
      return isInst;
    }
    return true;
  };
  return { isAdmin, isInst, role: login.user_role ?? 'User', hasAuth };
};
