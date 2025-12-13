import { createTheme } from '@mui/material';

declare module '@mui/material' {
  interface ButtonPropsColorOverrides {
    test: true;
    gray: true;
  }
}

declare module '@mui/material/styles' {
  // interface Palette {
  //   색이름: Palette["primary"];
  // }
  interface PaletteOptions {
    test?: PaletteOptions['primary'];
    gray?: PaletteOptions['primary'];
  }
}

export const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#78909c',
    },
    test: {
      main: '#4AD395',
      contrastText: '#fff',
      dark: '#339368',
    },
    gray: {
      main: '#9e9e9e',
      contrastText: '#fff',
      light: '#bdbdbd',
      dark: '#757575',
    },
  },
  components: {
    // MuiButton: {
    //   styleOverrides: {
    //     // Name of the slot
    //     root: {
    //       variants: [
    //         {
    //           // `dashed` is an example value, it can be any name.
    //           props: { variant: "dashed" },
    //           style: {
    //             textTransform: "none",
    //             border: `2px dashed ${blue[500]}`,
    //           },
    //         },
    //       ],
    //     },
    //   },
    // },
    MuiButton: {
      defaultProps: {
        size: 'small',
        variant: 'contained',
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
        variant: 'outlined',
      },
    },
    MuiSelect: {
      defaultProps: {
        size: 'small',
        variant: 'outlined',
      },
    },
    MuiList: {
      defaultProps: {
        dense: false,
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          //padding: '6px 8px',
          padding: '10px 8px',
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#f5f5f5',
        },
      },
    },
    MuiCheckbox: {
      defaultProps: {
        size: 'small',
      },
    },
  },
});

/*

  props: {
    MuiButton: {
      size: "small",
    },
    MuiButtonGroup: {
      size: "small",
    },
    MuiCheckbox: {
      size: "small",
    },
    MuiFab: {
      size: "small",
    },
    MuiFormControl: {
      margin: "dense",
      size: "small",
    },
    MuiFormHelperText: {
      margin: "dense",
    },
    MuiIconButton: {
      size: "small",
    },
    MuiInputBase: {
      margin: "dense",
    },
    MuiInputLabel: {
      margin: "dense",
    },
    MuiRadio: {
      size: "small",
    },
    MuiSwitch: {
      size: "small",
    },
    MuiTextField: {
      margin: "dense",
      size: "small",
    },
  }, 
*/
//export theme;
