import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import basic from 'basic-auth-header';
import http, { setAuthHeader } from '../helpers/http';
import { apiPrefix } from '../../config';
import { Grid, Form, Button, Segment } from 'semantic-ui-react';
import { Notification } from './Notification';

export class Auth extends Component {

    state = {
        authType: '',
        login: '',
        password: '',
        confirmPassword: ''
    };

    componentDidMount() {
        if(this.props.location.pathname === '/register') {
            this.setState({ authType: 'register' });
        } else {
            this.setState({ authType: 'login' });
        }
    }

    onLogin = (e) => {
        e.preventDefault();

        let { login, password } = this.state;

        if(!login.length) return this.notification.show('Login must be required!', 'danger');
        if(!password.length) return this.notification.show('Password must be required!', 'danger');

        const key = basic(login, password);

        setAuthHeader(key);

        http.get(`${apiPrefix}/login`)
            .then(({ data }) => {
                localStorage.setItem('Authorization', key);
                browserHistory.push('/');
            })
            .catch(err => {
                this.notification.show('Authorization error!', 'danger')
            });
    };

    onRegister = (e) => {
        e.preventDefault();

        let { login, password, confirmPassword } = this.state;

        if(!login) return this.notification.show('Login must be required', 'danger');
        if(!password) return this.notification.show('Password must be required', 'danger');
        if(password.length < 6) return this.notification.show('Password must be at least 8 characters', 'danger');
        if(password !== confirmPassword) return this.notification.show('Password doesn\'t match', 'danger');

        http.post(`${apiPrefix}/register`, {
            login,
            password
        })
            .then(({ data: user }) => {
                const key = basic(user.login, user.password);

                localStorage.setItem('Authorization', key);
                browserHistory.push('/');
            })
            .catch(err => {
                console.log(err);
            });
    };

    render() {
        return (
            <Grid container centered columns={2}>
                <Grid.Column textAlign="left">
                    <Notification ref={ (node) => { this.notification = node } } />
                    <Segment color="blue" style={{ marginTop: '40px' }} raised>
                        <Form onSubmit={ this.state.authType === 'register' ? this.onRegister : this.onLogin }>
                            <Form.Field>
                                <label>Login</label>
                                <input type="text"
                                       placeholder='Type your login'
                                       name="login"
                                       value={ this.state.login }
                                       onChange={(e) => { this.setState({ login: e.target.value }) }} />
                            </Form.Field>
                            <Form.Field>
                                <label>Password</label>
                                <input type="password"
                                       placeholder='Type your password'
                                       name="password"
                                       value={ this.state.password }
                                       onChange={(e) => { this.setState({ password: e.target.value }) }}/>
                            </Form.Field>
                            {
                                this.state.authType === 'register' && (
                                    <Form.Field>
                                        <label>Confirm password</label>
                                        <input type="password"
                                               placeholder='Confirm your password'
                                               name="password"
                                               value={ this.state.confirmPassword }
                                               onChange={(e) => { this.setState({ confirmPassword: e.target.value }) }}/>
                                    </Form.Field>
                                )
                            }
                            <Form.Field style={{ textAlign: 'right' }}>
                                <Button type='submit' color="blue">Submit</Button>
                            </Form.Field>
                        </Form>
                    </Segment>
                </Grid.Column>
            </Grid>
        );
    }
}