import React, { Component } from 'react'
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css'
import App from './components/App';
import Client from './components/Client';
import * as serviceWorker from './serviceWorker';

import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";


class WrappedApp extends Component {
  state = {}; //...some vals }

  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/server" component={App} />
          <Route exact path="/client" component={Client} />
        </Switch>
      </Router>
    );
  }
}




ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
