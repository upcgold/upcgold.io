import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css'
import App from './components/App';
import * as serviceWorker from './serviceWorker';
import Intel from './components/Intel';
import { HashRouter, Route, Link } from "react-router-dom";


const routing = (
  <HashRouter>
    <div>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/intel">Intel</Link>
        </li>
      </ul>	
      <Route path="/" component={App} />
      <Route path="/intel" component={Intel} />
    </div>
  </HashRouter>
)


ReactDOM.render(routing, document.getElementById('root'));


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
