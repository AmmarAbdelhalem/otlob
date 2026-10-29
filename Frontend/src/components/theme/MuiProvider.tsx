'use client';

import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { muiWhiteTheme } from '@/lib/theme/muiTheme';

export default function MuiProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={muiWhiteTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
