'use client';
// import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
// import RefreshIcon from "@mui/icons-material/Refresh";
// import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Toaster } from 'sonner';
/** @jsxImportSource @emotion/react */

export const ToasterProvider = () => {
  return (
    <Toaster
      expand={true}
      richColors
      position='bottom-center'
      toastOptions={{ className: 'text-base' }}
      //   toastOptions={{
      //     //unstyled: true,
      //     classNames: {
      //       error: "error bg-red-500 text-white",
      //       success: "text-green-400",
      //       warning: "text-yellow-400",
      //       info: "bg-blue-400",
      //     },
      //   }}
      //   icons={{
      //     success: <CheckCircleOutlineIcon />,
      //     warning: <WarningAmberIcon />,
      //     error: <WarningAmberIcon />,
      //     loading: <RefreshIcon />,
      //   }}
    />
  );
};
