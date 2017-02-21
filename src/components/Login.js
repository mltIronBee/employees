import React, { Component } from 'react';
import { Grid, Form, Button, Segment } from 'semantic-ui-react'

export class Login extends Component {

    state = {
        login: '',
        password: '',
        error: ''
    };

    onSubmit = (e) => {
        e.preventDefault();
    };

    render() {
        return (
            <Grid container centered columns={2}>
                <Grid.Column>
                    <Segment color="blue" style={{ marginTop: '40px' }}>
                        <Form onSubmit={this.onSubmit}>
                            <Form.Field>
                                <label>Login</label>
                                <input placeholder='Type your login' />
                            </Form.Field>
                            <Form.Field>
                                <label>Password</label>
                                <input placeholder='Type your password' />
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