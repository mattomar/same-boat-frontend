import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import routes from './routes/routes';
import './styles/App.css';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import React from 'react';

import { Provider } from 'react-redux';
import store from './store'; // Your Redux store file

function AppRoutes() {
  const element = useRoutes(routes);
  return element;
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <Router>
          <AppRoutes />
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;