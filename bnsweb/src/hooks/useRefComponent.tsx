'use client';
import * as React from 'react';
import { JSX, RefObject, useCallback, useRef, useState } from 'react';

export function useRefComponent<Props>(
  Comp: React.ForwardRefExoticComponent<any>
): [v: RefObject<Props>, e: () => JSX.Element] {
  const ref = useRef<Props>(undefined as Props);
  const [comp] = useState(<Comp ref={ref} />);
  const element = useCallback(() => comp, [comp]);
  return [ref, element];
}
