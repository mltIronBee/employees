import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { Icon, Menu } from 'semantic-ui-react';
import http, { setAuthHeader } from './helpers/http';
import { apiPrefix } from './../config';

import './Main.css';

class App extends Component {
    state = {
        user: null,
        activeItem: 'Employees'
    };

    componentWillMount() {
        this.initializeUser();
    }

    initializeUser = () => {
        const key = localStorage.getItem('Authorization');
        if (key) {
            setAuthHeader(key);
            http.get(`${apiPrefix}/login`)
                .then(({ data: user }) => this.setState({ user }))
                .catch(err => {
                    localStorage.removeItem('Authorization');
                    browserHistory.push('/login');
                });
        } else {
            browserHistory.push('/login');
        }
    };

    handleItemClick = (e, data) => this.setState({ activeItem: data.name }, this.onHandleItemClick);

    onHandleItemClick = () => {
        this.state.activeItem === 'Employees'
            ? !this.checkLocationPathname('Employees') && browserHistory.push('/')
            : !this.checkLocationPathname('Projects') && browserHistory.push('/projects')
    };

    checkLocationPathname = pathname => {
        return this.props.location.pathname === pathname.toLowerCase()
    };

    checkCurrentLocationEmployees = () => {
        return this.props.location.pathname === '/'
    };

    checkCurrentLocationProjects = () => {
        return this.props.location.pathname === '/projects'
    };

    showLogout() {
        if (this.checkCurrentStateNotLoginAndRegister()) {
            return (
                <span>
                    <Icon name="log out"
                          size="large"
                          link
                          onClick={() => {
                              this.setUser(null);
                              localStorage.removeItem('Authorization');
                              browserHistory.push('/login');
                          }} />
                </span>
            );
        }
    }

    checkCurrentStateNotLoginAndRegister = () => {
        return this.props.location.pathname !== '/login' && this.props.location.pathname !== '/register'
    };

    showMenu = () => {
        if (this.checkIsAdmin()) return (
            <Menu inverted pointing secondary className='header-admin-menu'>
                <Menu.Item name='Employees' active={this.checkCurrentLocationEmployees()} onClick={ this.handleItemClick } />
                <Menu.Item name='Projects' active={this.checkCurrentLocationProjects()} onClick={ this.handleItemClick } />
            </Menu>
        )
    };

    checkIsAdmin = () => {
        return this.state.user && this.state.user.isAdmin && this.checkCurrentStateNotLoginAndRegister()
    };

    setUser  = user => this.setState({ user });

    mapChildren = () => {
        const children = React.Children.map(this.props.children, child => React.cloneElement(child,
            { setUser: this.setUser, user: this.state.user }));

        return <div>{children}</div>
    };

    componentWillUnmount() {
        this.setUser(null);
    }

    render() {
      return (
          <div className="app">
              <header className={this.checkIsAdmin() ? 'header-top-admin' : 'header-top'}>
                  { this.showMenu() }
                  <span className={this.checkIsAdmin() ? 'header-title' : ''}>Employees</span>
                  { this.showLogout() }
              </header>
              { this.mapChildren() }
          </div>
      )
    }
}

export default App;
