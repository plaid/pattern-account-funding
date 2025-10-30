import React from 'react';
import { createRoot } from 'react-dom/client';
import { Router as BrowserRouter } from 'react-router-dom';
import { createBrowserHistory } from 'history';

import './index.scss';
import App from './App';

const history = createBrowserHistory();
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <BrowserRouter history={history}>
    <App />
  </BrowserRouter>
);
