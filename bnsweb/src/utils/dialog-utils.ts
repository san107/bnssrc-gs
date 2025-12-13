export const handleDialogRejection = (rejection: any) => {
  if (rejection && rejection.cmd === 'close') {
    console.log('cancel || close');
  } else {
    console.error('error', rejection?.message);
  }
};
