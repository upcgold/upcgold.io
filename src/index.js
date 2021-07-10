import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css'
import App from './components/App';
import * as serviceWorker from './serviceWorker';
import Intel from './components/Intel';
import { HashRouter, Route, Link } from "react-router-dom";


const routing = (
  <HashRouter>
      <Route path="/" component={App} />
      <Route path="/intel/:code" component={Intel} />
  </HashRouter>
)


ReactDOM.render(routing, document.getElementById('root'));


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
