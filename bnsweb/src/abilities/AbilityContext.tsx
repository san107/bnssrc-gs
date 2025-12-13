import { createContext } from 'react';
import { createMongoAbility } from '@casl/ability';
import type { AppAbility } from './abilities';

// Ability Context 생성 - createContextualCan이 non-null을 요구하므로 기본값 제공
export const AbilityContext = createContext<AppAbility>(createMongoAbility());
