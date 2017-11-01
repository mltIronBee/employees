import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import http from '../helpers/http';
import { apiPrefix } from '../../config';
import { Grid, Form, Button, Icon, Segment } from 'semantic-ui-react';
import { Notification } from './Notification';

export class Project extends Component {

    state = {
        id: '',
        name: '',
        messageError: false,
        message: '',
        isCreating: false
    };

    componentDidMount() {
        this.props.params.method === 'create'
            ? this.setState({ isCreating: true })
            : this.getProject();
    }

    getProject = () => {
        const params = { _id: this.props.location.query.id };

        return http.get(`${apiPrefix}/project`, { params })
            .then(this.onGetProject)
            .catch(console.log)
    };

    onGetProject = ({data: { _id, name, startDate}}) => {
        this.setState({ id: _id, name, startDate })
    };

    saveData = e => {
        e.preventDefault();
        let { id, name, isCreating } = this.state;
        const requestUrl = `${apiPrefix}/project/${ isCreating ? 'create' : 'update' }`;

        if(!name) return this.notification.show('Project name must be required!', 'danger');

        const obj = { name };
        if (!isCreating) obj._id = id;

        http.post(requestUrl, obj)
            .then(result => {
                this.notification.show('Data is updated');
                browserHistory.push('/projects');
            })
            .catch(err => {
                this.notification.show(isCreating ? 'Creating error!' : 'Updating error!', 'danger');
            });

    };

    render() {
        return (
            <Grid container centered columns={2}>
                <Notification ref={ node => { this.notification = node } }/>
                <Grid.Column textAlign='left'>
                    <Segment raised color='blue' style={{marginTop: "40px"}}>
                        <Form onKeyDown={e => { if(e.keyCode === 13 && e.ctrlKey) this.saveData(e); }}>
                            <Grid.Row>
                                <Grid.Column>
                                    <Icon color="blue"
                                          name="reply"
                                          size="big"
                                          style={{cursor: "pointer", float: "left"}}
                                          onClick={() => { browserHistory.push('/projects') }}>
                                    </Icon>
                                    <Button color="blue"
                                            onClick={this.saveData}
                                            floated="right">
                                        Save
                                    </Button>
                                </Grid.Column>
                            </Grid.Row>
                            <Form.Field style={{marginTop: "40px"}}>
                                <label>Project name</label>
                                <input type='text'
                                       value={this.state.name}
                                       placeholder="Project name"
                                       onChange={e => { this.setState({ name: e.target.value }) }} />
                            </Form.Field>
                        </Form>
                    </Segment>
                </Grid.Column>
            </Grid>
        )
    }
}
