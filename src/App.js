import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { Icon } from 'semantic-ui-react';

import './App.css';

class App extends Component {

    render() {
      return (
          <div className="app">
              <header>
                  Employees
                  <Icon name="log out"
                        size="large"
                        link
                        style={{ float: 'right', marginRight: '30px' }}
                        onClick={() => {
                            localStorage.removeItem('Authorization');
                            browserHistory.push('/login');
                        }} />
              </header>
              { this.props.children }
          </div>
      )
    }
}

export default App;
