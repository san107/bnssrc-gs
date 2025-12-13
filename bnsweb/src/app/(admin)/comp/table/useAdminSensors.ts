// @flow
import { MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';

export const useAdminSensors = () => {
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 6,
      },
    })
  );
  return sensors;
};
