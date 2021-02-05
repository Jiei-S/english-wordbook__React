import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import './component.css';

import { Routers } from './routers';
import { Header } from './components/header';
import { Footer } from './components/footer';


ReactDOM.render(
  <BrowserRouter>
    <Header />
    <Routers />
    <Footer />
  </BrowserRouter>,
  document.getElementById('root')
);