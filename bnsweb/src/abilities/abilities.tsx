import type { MongoAbility } from '@casl/ability';
import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { createContextualCan } from '@casl/react';
import { useContext } from 'react';
import { AbilityContext } from './AbilityContext';
import { Box, Typography } from '@mui/material';
import { useLoginInfo } from '@/app/(admin)/leftmenu/useLoginInfo';

// Action 타입 정의
export type Action =
  | 'manage'
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'view'
  | 'export'
  | 'upload';

// Subject 타입 정의
export type Subject = 'all' | 'dashbd' | 'home' | 'ndms' | 'settings' | 'inst';

// AppAbility 타입 정의
export type AppAbility = MongoAbility<[Action, Subject]>;

// Can 컴포넌트 생성 (권한 체크용)
export const Can = createContextualCan(AbilityContext.Consumer);

/**
 * useAbility Hook
 * 컴포넌트에서 ability 객체에 접근
 */
export function useAbility() {
  const context = useContext(AbilityContext);
  if (!context) {
    throw new Error('useAbility must be used within AbilityProvider');
  }
  return context;
}

/**
 * usePermission Hook
 * 특정 권한 확인용 커스텀 훅
 */
export function usePermission(action: Action, subject: Subject, field?: string) {
  const ability = useAbility();
  return ability.can(action, subject, field);
}

/**
 * ProtectedComponent
 * 권한이 있을 때만 컴포넌트를 렌더링
 */
export function ProtectedComponent({
  action,
  subject,
  fallback = null,
  children,
}: {
  action: Action;
  subject: Subject;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const hasPermission = usePermission(action, subject);
  const { login } = useLoginInfo();
  if (hasPermission) return children;
  if (!login.user_id) return null; // 로그인되어 있지 않으면 렌더링하지 않음.
  if (fallback) return fallback;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      <Typography variant='h1' color='error'>
        403
      </Typography>
      <Typography variant='h5'>접근 권한이 없습니다.</Typography>
      <Typography variant='body1' color='text.secondary'>
        이 기능은 현재 비활성화되어 있습니다. 관리자에게 문의 바랍니다.
      </Typography>
    </Box>
  );
}

/**
 * 사용자별 권한 정의 함수
 * @param roles - 사용자 역할 배열
 * @returns Ability 인스턴스
 */

// function defineAbilityForAdmin(
//   can: AbilityBuilder<AppAbility>['can'],
//   cannot: AbilityBuilder<AppAbility>['cannot']
// ) {
//   //can('view', 'dashbd');
//   //can('view', 'developer');
// }

// function defineAbilityForInst(
//   can: AbilityBuilder<AppAbility>['can'],
//   cannot: AbilityBuilder<AppAbility>['cannot']
// ) {
//   //can('manage', 'all');
// }

// function defineAbilityForUser(
//   can: AbilityBuilder<AppAbility>['can'],
//   cannot: AbilityBuilder<AppAbility>['cannot']
// ) {}

export type Role = 'Admin' | 'Inst' | 'User';

export function defineAbilitiesFor(str_roles: string[]): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  const roles = str_roles as Role[];

  // 기본 전체 허용.
  //can('manage', 'all');
  can('view', 'dashbd');
  can('view', 'home');

  for (const role of roles) {
    switch (role) {
      case 'Inst':
        can('manage', 'all');
        //defineAbilityForInst(can, cannot);
        //can('view', 'inst');
        break;
      case 'Admin':
        //defineAbilityForAdmin(can, cannot);
        can('view', 'ndms');
        can('view', 'settings');
        break;
      case 'User':
        //defineAbilityForUser(can, cannot);
        break;
    }
  }

  return build();
}

/**
 * 권한 업데이트 (동적)
 */
export function updateAbility(ability: AppAbility, roles: string[]): AppAbility {
  const updatedAbility = defineAbilitiesFor(roles);
  ability.update(updatedAbility.rules);
  return ability;
}
