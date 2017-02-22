import React, { Component } from 'react';
import { browserHistory } from 'react-router';
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
        isCreating: false,
        newSkill: '',
        messageError: false,
        message: ''
    };

    uploadedImage = null;

    componentDidMount() {

        if(this.props.params.method === 'create') {

            this.setState({ isCreating: true, readOnly: false });

        } else {
            http.get(`${apiPrefix}/employee`, {
                params: {
                    _id: this.props.location.query.id
                }
            })
                .then(({ data }) => {

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

    showAlert = (message, isError = false) => {
        this.setState({
            messageError: isError,
            message
        });

        setTimeout(() => {
            this.setState({
                messageError: false,
                message: ''
            });
        }, 3000);
    };

    addSkill = () => {
        if (!this.state.newSkill.length) {
            this.showAlert('Field must be required!', true);
            return;
        }

        this.setState((prevState) => ({
            skills: [...prevState.skills, prevState.newSkill],
            newSkill: ''
        }));
    };

    saveData = (e) => {
        e.preventDefault();

        let { _id, firstName, lastName, position, startedAt, skills, isCreating } = this.state;
        const requestUrl = `${apiPrefix}/employee/${ isCreating ? 'create' : 'update' }`;

        if(!firstName || !lastName || !position || !startedAt) {
            this.showAlert('Field must be required!', true);
            return;
        }

        const data = new FormData();

        data.append('firstName', firstName);
        data.append('lastName', lastName);
        data.append('position', position);
        data.append('startedAt', startedAt);
        data.append('image', this.uploadedImage);
        skills.forEach(skill => {
            data.append('skills[]', skill);
        });

        if(!isCreating) {
            data.append('_id', _id);
        }

        http.post(requestUrl, data )
            .then(res => {
                console.log(res);
                this.setState({ readOnly: true });
                this.showAlert(isCreating ? 'User has been successfully created' : 'Data is updated');

                if(isCreating) {
                    browserHistory.push('/');
                }
            })
            .catch(err => {
                console.log(err);
                this.showAlert(isCreating ? 'Creating error!' : 'Updating error!', true);
            });
    };

    onUpload = (e) => {
        this.uploadedImage = e.target.files[0];

        this.imagePreview();
    };


    imagePreview = () => {
        const reader = new FileReader();

        reader.onload = () => {

            this.setState({
                imageSrc: reader.result
            });
        };

        reader.readAsDataURL(this.uploadedImage);
    };

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
                                        <div style={{textAlign: "center"}}>
                                            <label className="label-image" htmlFor="image" >
                                                <Icon name="download" /> Download profile image

                                            </label>
                                            <input type="file" className="upload-image" id="image" onChange={this.onUpload}/>
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
                                                                          link
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