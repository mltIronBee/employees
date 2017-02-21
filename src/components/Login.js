import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import basic from 'basic-auth-header';
import http, { setAuthHeader } from '../helpers/http';
import { apiPrefix } from '../../config.json';
import { Grid, Form, Button, Segment } from 'semantic-ui-react'

export class Login extends Component {

    state = {
        login: '',
        password: '',
        validationError: ''
    };

    onLogin = (e) => {
        e.preventDefault();

        let { login, password } = this.state;

        if(!login.length || !password.length) {
            this.setState({ validationError: 'Fields are required!' });
            return;
        }

        const key = basic(login, password);

        setAuthHeader(key);

        http.get(`${apiPrefix}/login`)
            .then(({ data }) => {
                localStorage.setItem('Authorization', key);
                browserHistory.push('/');
            })
            .catch(err => {
                this.setState({ validationError: 'Authorization error!' })
            })
    };

    render() {
        return (
            <Grid container centered columns={2}>
                <Grid.Column textAlign="left">
                    <Segment color="blue" style={{ marginTop: '40px' }}>
                        <Form onSubmit={this.onLogin}>
                            {
                                this.state.validationError
                                    && <Segment inverted color='red' tertiary>
                                            { this.state.validationError }
                                        </Segment>
                            }
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