import React, { Component } from 'react';
import http from '../helpers/http';
import { apiPrefix } from '../../config.json';
import { Grid, Form, Button, Icon, Table, Segment, Image } from 'semantic-ui-react';

export class Profile extends Component {

    state = {
        _id: '',
        imageSrc: 'http://lazyadmin.nl/wp-content/plugins/all-in-one-seo-pack/images/default-user-image.png',
        firstName: '',
        lastName: '',
        position: '',
        startedAt: '',
        skills: [],
        readOnly: true,
        newSkill: '',
        messageError: false,
        message: ''
    };

    componentDidMount() {

        http.get(`${apiPrefix}/employee`, {
            params: {
                _id: this.props.location.query.id
            }
        })
            .then(({ data }) => {

            console.log(data);
            this.setState({
                _id: data._id,
                firstName: data.firstName,
                lastName: data.lastName,
                position: data.position,
                startedAt: new Date(data.startedAt).toISOString().split('T')[0],
                skills: data.skills
            });
        })
            .catch(err => {
            console.log(err);
        });
    }

    readOnlyFalse = () => {
        this.setState({readOnly: false});
    };

    deleteSkill = (e) => {
        const skills = this.state.skills;
        const index = skills.indexOf(e.target.value);
        skills.splice(index, 1);
        this.setState({skills: skills});
    };

    addSkill = () => {
        if (!this.state.newSkill.length) {
            this.setState({
                messageError: true,
                message: 'Field must be required!'
            });

            setTimeout(() => {
                this.setState({
                    messageError: false,
                    message: ''
                });
            }, 3000);

            return;
        }
        this.setState((prevState) => ({
            skills: [...prevState.skills, prevState.newSkill],
            newSkill: ''
        }));
    };

    saveData = (e) => {
        e.preventDefault();
        console.log(this.state.startedAt);
        const data = {
            _id: this.state._id,
            firstName: this.state.firstName,
            lastName: this.state.lastName,
            position: this.state.position,
            startedAt: this.state.startedAt,
            skills: this.state.skills,
        };

        http.post(`${apiPrefix}/employee/update`, data )
            .then(result => {
                this.setState({
                    readOnly: true,
                    message: 'Data updated'
                });
                setTimeout(() => {
                    this.setState({
                        message: ''
                    });
                }, 3000);
            })
            .catch(err => {
                this.setState({
                    message: 'Data is not updated',
                    messageError: true
                });
                setTimeout(() => {
                    this.setState({
                        messageError: false,
                        message: ''
                    });
                }, 3000);
            })
    };

    // saveImage = (e) => {
    //
    // };

    render() {
        return (
            <Grid container centered columns={2}>
                <Grid.Column textAlign="left">
                    <Segment raised style={{marginTop: "40px"}}>
                        <Form>
                            <Grid.Row>
                                <Grid.Column width={1} style={{textAlign: "right"}}>
                                    {
                                        this.state.readOnly
                                            ? <Icon name="pencil"
                                                    size="large"
                                                    color="blue"
                                                    onClick={this.readOnlyFalse}
                                                    style={{cursor: "pointer"}}/>
                                            : <Button color="blue"
                                                      onClick={this.saveData}>
                                                Save
                                              </Button>
                                    }
                                </Grid.Column>
                            </Grid.Row>
                            <Form.Field>
                                <Image src={this.state.imageSrc}
                                       size='small'
                                       shape='circular'
                                       centered />
                                {
                                    !this.state.readOnly && (
                                        <div style={{ textAlign: "center", cursor: "pointer"}}>
                                            <label>
                                                <Icon name="download" /> Download profile image
                                            </label>
                                            <input type="file" className="upload-image" onChange={this.saveImage}/>
                                        </div>
                                    )
                                }
                            </Form.Field>
                            {
                                this.state.message && (
                                    <Segment inverted color={!this.state.messageError ? 'blue' : 'red'} tertiary>
                                        {this.state.message}
                                    </Segment>
                                )
                            }
                            <Form.Field>
                                <label>First name</label>
                                <input type='text'
                                       value={this.state.firstName}
                                       disabled={this.state.readOnly}
                                       onChange={(e) => { this.setState({ firstName: e.target.value }) }} />
                            </Form.Field>
                            <Form.Field>
                                <label>Last name</label>
                                <input type='text'
                                       value={this.state.lastName}
                                       disabled={this.state.readOnly}
                                       onChange={(e) => { this.setState({ lastName: e.target.value }) }} />
                            </Form.Field>
                            <Form.Field>
                                <label>Position</label>
                                <input type='text'
                                       value={this.state.position}
                                       disabled={this.state.readOnly}
                                       onChange={(e) => { this.setState({ position: e.target.value }) }} />
                            </Form.Field>
                            <Form.Field>
                                <label>Started at</label>
                                <input type='date'
                                       value={this.state.startedAt}
                                       disabled={this.state.readOnly}
                                       onChange={(e) => { this.setState({ startedAt: e.target.value }) }} />
                            </Form.Field>
                            <Form.Field>
                                <Table>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.HeaderCell>Skills</Table.HeaderCell>
                                            {!this.state.readOnly && <Table.HeaderCell />}
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                    {
                                        this.state.skills.length
                                            ? this.state.skills.map((skill, index) => (
                                                    <Table.Row key={index}>
                                                        <Table.Cell>{skill}</Table.Cell>
                                                        {
                                                            !this.state.readOnly && (
                                                                <Table.Cell>
                                                                    <Icon name="delete"
                                                                          color="blue"
                                                                          style={{cursor: "pointer"}}
                                                                          onClick={this.deleteSkill} />
                                                                </Table.Cell>
                                                            )
                                                        }
                                                    </Table.Row>
                                                )
                                            )
                                            : (
                                                <Table.Row>
                                                    <Table.Cell>No skills</Table.Cell>
                                                </Table.Row>
                                            )
                                    }
                                    {
                                        !this.state.readOnly && (
                                            <Table.Row>
                                                <Table.Cell>
                                                    <input type="text"
                                                           value={this.state.newSkill}
                                                           onChange={(e) => {
                                                               this.setState({ newSkill: e.target.value });
                                                           }} />
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <Icon name="add"
                                                          color="blue"
                                                          style={{cursor: "pointer"}}
                                                          onClick={this.addSkill} />
                                                </Table.Cell>
                                            </Table.Row>
                                        )
                                    }
                                    </Table.Body>
                                </Table>
                            </Form.Field>
                        </Form>
                    </Segment>
                </Grid.Column>
            </Grid>
        )
    }
}