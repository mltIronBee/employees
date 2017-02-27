import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { Icon } from 'semantic-ui-react';

import './Main.css';

class App extends Component {

    showLogout() {
        if(this.props.location.pathname !== '/login' && this.props.location.pathname !== '/register') {
            return (
                <Icon name="log out"
                      size="large"
                      link
                      onClick={() => {
                          localStorage.removeItem('Authorization');
                          browserHistory.push('/login');
                      }} />
            );
        }
    }

    render() {
      return (
          <div className="app">
              <header>
                  Employees
                  { this.showLogout() }
              </header>
              { this.props.children }
          </div>
      )
    }
}

export default App;
