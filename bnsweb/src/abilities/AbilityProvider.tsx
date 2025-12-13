'use client';
import { useEffect, useMemo, useState } from 'react';
import { defineAbilitiesFor, Role } from './abilities';
import { AbilityContext } from './AbilityContext';
import { useLoginInfo } from '@/app/(admin)/leftmenu/useLoginInfo';

/**
 * AbilityProvider 컴포넌트
 * 애플리케이션 전체에 ability를 제공
 */
export function AbilityProvider({ children }) {

  const { login } = useLoginInfo();

  const roles: Role[] = useMemo(() => {
    if (!login?.user_role) {
      return [];
    }
    return [login.user_role as Role];
  }, [login]);
  const [ability, setAbility] = useState(() => defineAbilitiesFor(roles));



  // 사용자 변경 시 ability 업데이트
  useEffect(() => {
    const newAbility = defineAbilitiesFor(roles);
    setAbility(newAbility);
  }, [roles]);

  return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>;
}
