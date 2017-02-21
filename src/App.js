import React, { Component } from 'react';

import 'semantic-ui-css/semantic.min.css';
import './App.css';

class App extends Component {

    render() {
      return (
          <div className="app">
              <header>Employees</header>
              { this.props.children }
          </div>
      )
    }
}

export default App;
