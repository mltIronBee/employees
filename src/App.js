import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { Icon } from 'semantic-ui-react';

import './Main.css';

class App extends Component {

    render() {
      return (
          <div className="app">
              <header>
                  Employees
                  { location.pathname !== '/login'
                        && <Icon name="log out"
                                 size="large"
                                 link
                                 onClick={() => {
                                     localStorage.removeItem('Authorization');
                                     browserHistory.push('/login');
                                 }} />
                  }
              </header>
              { this.props.children }
          </div>
      )
    }
}

export default App;
