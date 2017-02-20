import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute,browserHistory } from 'react-router';
import App from './App';
import { Login } from './components/Login';
import { Home } from './components/Home';

ReactDOM.render(
  <Router history={ browserHistory }>
      <Route path="/" component={ App }>
          <IndexRoute component={ Home }/>
          <Route path="login" component={ Login }/>
      </Route>
  </Router>,
  document.getElementById('root')
);
