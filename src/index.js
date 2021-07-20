import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css'
import App from './components/App';
import * as serviceWorker from './serviceWorker';
import Intel from './components/Intel';
import { HashRouter, Route, Link } from "react-router-dom";
import { browserHistory } from 'react-router'

const routing = (
  <HashRouter>
      <Route render= {(props)=>window.location.reload()} path="/intel/:code" component={App} />
  </HashRouter>
)


ReactDOM.render(routing, document.getElementById('root'));


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
