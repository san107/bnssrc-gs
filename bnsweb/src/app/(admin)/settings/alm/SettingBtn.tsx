// @flow
import { Button, ButtonProps, Icon } from '@mui/material';
import * as React from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckIcon from '@mui/icons-material/Check';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import { TbFileTypeXls } from 'react-icons/tb';
import SyncIcon from '@mui/icons-material/Sync';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SendIcon from '@mui/icons-material/Send';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import StopIcon from '@mui/icons-material/Stop';
import CloseIcon from '@mui/icons-material/Close';

type Props = ButtonProps & {
  btnType:
    | 'add'
    | 'edit'
    | 'delete'
    | 'reset'
    | 'save'
    | 'cancel'
    | 'confirm'
    | 'move'
    | 'xls'
    | 'select'
    | 'prev'
    | 'next'
    | 'sync'
    | 'down'
    | 'stop'
    | 'close'
    | 'send';
};
export const SettingBtn = ({ btnType, children, ...props }: Props) => {
  const getColor = (): ButtonProps['color'] => {
    switch (btnType) {
      case 'sync':
        return 'primary';
      case 'select':
        return 'secondary';
      case 'add':
        return 'primary';
      case 'edit':
        return 'primary';
      case 'save':
        return 'primary';
      case 'delete':
        return 'error';
      case 'reset':
        return 'secondary';
      case 'cancel':
        return 'secondary';
      case 'xls':
        return 'secondary';
      case 'confirm':
        return 'primary';
      case 'prev':
        return 'primary';
      case 'next':
        return 'primary';
      case 'move':
        return 'primary';
      case 'send':
        return 'success';
      case 'down':
        return 'error';
      case 'stop':
        return 'warning';
      case 'close':
        return 'secondary';
    }
  };

  const getIcon = () => {
    switch (btnType) {
      case 'sync':
        return <SyncIcon />;
      case 'add':
        return <AddIcon />;
      case 'edit':
        return <EditIcon />;
      case 'delete':
        return <DeleteIcon />;
      case 'reset':
        return <RestoreIcon />;
      case 'save':
        return <SaveIcon />;
      case 'cancel':
        return <CancelIcon />;
      case 'confirm':
        return <CheckIcon />;
      case 'move':
        return <ZoomOutMapIcon />;
      case 'select':
        return <SearchIcon />;
      case 'prev':
        return <ArrowBackIosIcon />;
      case 'next':
        return <ArrowForwardIosIcon />;
      case 'send':
        return <SendIcon />;
      case 'down':
        return <ArrowDownwardIcon />;
      case 'stop':
        return <StopIcon />;
      case 'close':
        return <CloseIcon />;
      case 'xls':
        return (
          <Icon>
            <TbFileTypeXls />
          </Icon>
        );
    }
  };
  return (
    <Button {...props} color={getColor()} startIcon={getIcon()}>
      {children}
    </Button>
  );
};
