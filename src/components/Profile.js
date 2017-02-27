import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import http from '../helpers/http';
import { apiPrefix } from '../../config';
import { Grid, Form, Button, Icon, Table, Segment, Image, Dropdown } from 'semantic-ui-react';

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
        messageError: false,
        message: '',
        preparedPositions: [],
        preparedSkills: [],
        positionSearch: '',
        skillSearch: '',
        newSkill: ''
    };

    uploadedImage = null;

    componentDidMount() {

        if(this.props.params.method === 'create') {

            http.get(`${apiPrefix}/employee/create`)
                .then(({data : { skills, positions }}) => {
                    this.setState({
                        preparedSkills: skills ? skills : [],
                        preparedPositions: positions ? positions : [],
                        isCreating: true,
                        readOnly: false
                    });
                })
                .catch(err => {
                    console.log(err);
                });

        } else {
            http.get(`${apiPrefix}/employee`, {
                params: {
                    _id: this.props.location.query.id
                }
            })
                .then(({ data: { employee, skills, positions } }) => {

                    this.setState(prevState => ({
                        _id: employee._id,
                        firstName: employee.firstName,
                        lastName: employee.lastName,
                        position: employee.position,
                        startedAt: new Date(employee.startedAt).toISOString().split('T')[0],
                        skills: employee.skills,
                        imageSrc: !employee.imageUrl ? prevState.imageSrc : employee.imageUrl,
                        preparedPositions: positions,
                        preparedSkills: skills
                    }));
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

    saveData = (e) => {

        e.preventDefault();

        let { _id, firstName, lastName, position, startedAt, skills, isCreating } = this.state;
        const requestUrl = `${apiPrefix}/employee/${ isCreating ? 'create' : 'update' }`;

        if(!firstName) return this.showAlert('First name must be required', true);
        if(!lastName) return this.showAlert('Last name must be required', true);
        if(!position) return this.showAlert('Position must be required', true);
        if(!startedAt) return this.showAlert('Start date must be required', true);

        const data = new FormData();

        data.append('firstName', firstName);
        data.append('lastName', lastName);
        data.append('position', position);
        data.append('startedAt', startedAt);
        data.append('image', this.uploadedImage ? this.uploadedImage : this.state.imageSrc);
        // Todo: fix code below
        skills.forEach(skill => {
            data.append('skills[]', skill);
        });

        if(!isCreating) {
            data.append('_id', _id);
        }

        http.post(requestUrl, data)
            .then(res => {
                if(isCreating) {
                    browserHistory.push('/');
                } else {
                    this.setState({ readOnly: true });
                    this.showAlert(isCreating ? 'User has been successfully created' : 'Data is updated');
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

    prepareOptions = (array) => array.map(item => ({
        value: item,
        text: item
    }));

    onAddNewPositionItem = (e) => {
        if(e.which === 13) {
            this.setState(prevState => ({
                preparedPositions: [
                    ...prevState.preparedPositions,
                    prevState.positionSearch
                ]
            }));
        }
    };

    onAddNewSkillItem = (e) => {
        if (e.which === 13 || e.type === 'click') {
            e.preventDefault();
            if (!this.state.newSkill && !this.state.skillSearch) {
                this.showAlert('Skill must be required!', true);
            } else {
                let skillToSave = this.state.skillSearch || this.state.newSkill;

                if(this.state.skills.includes(skillToSave)) {
                    this.showAlert('Skill already exist', true);
                } else {
                    this.setState(prevState => ({
                        skills: [...prevState.skills, skillToSave],
                        preparedSkills: !prevState.preparedSkills.includes(skillToSave)
                            ? [...prevState.preparedSkills, skillToSave]
                            : prevState.preparedSkills,
                        skillSearch: '',
                        newSkill: ''
                    }));
                }
            }
        }
    };

    render() {
        return (
            <Grid container centered columns={2}>
                <Grid.Column textAlign="left">
                    <Segment raised color="blue" style={{marginTop: "40px"}}>
                        <Form onKeyDown={(e) => {
                            if(e.keyCode === 13 && e.ctrlKey) this.saveData(e);
                        }}>
                            <Grid.Row>
                                <Grid.Column>
                                    <Icon color="blue"
                                          name="reply"
                                          size="big"
                                          style={{cursor: "pointer", float: "left"}}
                                          onClick={() => { browserHistory.push('/') }}>
                                    </Icon>
                                    {
                                        this.state.readOnly
                                            ? <Icon name="pencil"
                                                    size="big"
                                                    color="blue"
                                                    onClick={this.readOnlyFalse}
                                                    style={{cursor: "pointer", float: "right"}}/>
                                            : <Button color="blue"
                                                      onClick={this.saveData}
                                                      floated="right">
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
                                        <div style={{textAlign: "center", marginTop: "20px"}}>
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
                                <Dropdown fluid
                                          search
                                          selection
                                          placeholder="Position"
                                          disabled={this.state.readOnly}
                                          value={ this.state.position }
                                          options={ this.prepareOptions(this.state.preparedPositions)}
                                          onChange={ (e, data) => { this.setState({ position: data.value }) }}
                                          onSearchChange={ (e, value) => { this.setState({ positionSearch: value }) } }
                                          onKeyDown={ this.onAddNewPositionItem } />
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
                                                    <Dropdown fluid
                                                              search
                                                              selection
                                                              id="newSkills"
                                                              placeholder="Skill"
                                                              options={ this.prepareOptions(this.state.preparedSkills) }
                                                              value={ this.state.newSkill }
                                                              onChange={ (e, { value }) => { this.setState({ newSkill: value }) }}
                                                              onSearchChange={ (e, value) => { this.setState({ skillSearch: value }) } }
                                                              onKeyDown={ this.onAddNewSkillItem } />
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <Icon name="add"
                                                          color="blue"
                                                          style={{cursor: "pointer"}}
                                                          htmlFor="newSkills"
                                                          onClick={this.onAddNewSkillItem}/>
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