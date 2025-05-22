import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import routes from './routes/routes';
import './styles/App.css';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import React from 'react';

function AppRoutes() {
  const element = useRoutes(routes);
  return element;
}
function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AppRoutes />
      </Router>
    </ThemeProvider>
  );
}
export default App;