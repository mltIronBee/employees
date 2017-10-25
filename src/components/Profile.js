import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import http from '../helpers/http';
import { apiPrefix } from '../../config';
import { Grid, Form, Button, Icon, Table, Segment, Image, Dropdown, Checkbox } from 'semantic-ui-react';
import { Notification } from './Notification';

export class Profile extends Component {

    state = {
        _id: '',
        imageSrc: 'http://lazyadmin.nl/wp-content/plugins/all-in-one-seo-pack/images/default-user-image.png',
        firstName: '',
        lastName: '',
        position: '',
        project: '',
        projects: [],
        prevProject: '',
        startedAt: '',
        skills: [],
        readOnly: true,
        isCreating: false,
        messageError: false,
        message: '',
        preparedPositions: [],
        preparedSkills: [],
        preparedProjects: [],
        positionSearch: '',
        projectSearch: '',
        skillSearch: '',
        newSkill: '',
        readyForTransition: false
    };

    uploadedImage = null;

    componentDidMount() {

        if (this.props.params.method === 'create') {

            http.get(`${apiPrefix}/employee/create`)
                .then(({data : { skills, positions, projects }}) => {
                    this.setState({
                        preparedSkills: skills ? skills : [],
                        preparedPositions: positions ? positions : [],
                        preparedProjects: this.filterArrayOfProject(projects),
                        isCreating: true,
                        readOnly: false
                    });
                })
                .catch(console.log);

        } else {
            http.get(`${apiPrefix}/employee`, {
                params: {
                    _id: this.props.location.query.id
                }
            })
                .then(({ data: { employee, skills, positions, projects } }) => {

                    this.setState(prevState => ({
                        _id: employee._id,
                        firstName: employee.firstName,
                        lastName: employee.lastName,
                        position: employee.position,
                        project: !employee.project ? prevState.project : employee.project,
                        startedAt: new Date(employee.startedAt).toISOString().split('T')[0],
                        skills: employee.skills,
                        imageSrc: !employee.imageUrl ? prevState.imageSrc : employee.imageUrl,
                        preparedPositions: positions,
                        preparedSkills: skills,
                        preparedProjects: this.filterArrayOfProject(projects),
                        prevProject: !employee.project ? prevState.project : employee.project,
                        projects: employee.projects,
                        readyForTransition: !!employee.readyForTransition
                    }), this.checkProjectsArray);
                })
                .catch(console.log);
        }
    }

    filterArrayOfProject = projects => {
        return projects.length
            ? projects.filter(project => project !== 'undefined' && project !== '')
            : []
    };

    readOnlyFalse = () => {
        this.setState({readOnly: false});
    };

    renderProjectsData = () => {
        return this.state.projects.length
            ? this.state.projects.map((project, index) => (
                <Table.Row key={index + 1}>
                    <Table.Cell>{index + 1}</Table.Cell>
                    <Table.Cell>{project}</Table.Cell>
                </Table.Row>
            ))
            : (<Table.Row><Table.Cell>No projects yet</Table.Cell></Table.Row>)
    };

    deleteSkill = skillValue => {
        this.setState(prevState => ({
            skills: prevState.skills.filter(skill => skill !== skillValue)
        }));
    };

    saveData = e => {
        e.preventDefault();
        this.onAddNewProjectToArray();
    };

    continueSaveData = () => {
        let { _id, firstName, lastName, position, project, projects, startedAt, skills, isCreating, readyForTransition } = this.state;
        const requestUrl = `${apiPrefix}/employee/${ isCreating ? 'create' : 'update' }`;

        if(!firstName) return this.notification.show('First name must be required!', 'danger');
        if(!lastName) return this.notification.show('Last name must be required!', 'danger');
        if(!position) return this.notification.show('Position must be required!', 'danger');
        if(!startedAt) return this.notification.show('Start date must be required!', 'danger');

        const data = new FormData();

        data.append('firstName', firstName);
        data.append('lastName', lastName);
        data.append('position', position);
        data.append('project', project);
        data.append('startedAt', startedAt);
        data.append('readyForTransition', readyForTransition);
        data.append('image', this.uploadedImage ? this.uploadedImage : this.state.imageSrc);
        // Todo: fix code below
        skills.forEach(skill => data.append('skills[]', skill));
        projects.forEach(project => data.append('projects[]', project));

        if(!isCreating) data.append('_id', _id);

        http.post(requestUrl, data)
            .then(res => {
                if(isCreating) {
                    browserHistory.push('/');
                } else {
                    this.setState({ readOnly: true });
                    this.notification.show('Data is updated');
                }
            })
            .catch(err => {
                this.notification.show(isCreating ? 'Creating error!' : 'Updating error!', 'danger');
            });
    };

    onUpload = (e) => {
        this.uploadedImage = e.target.files[0];
        this.imagePreview();
    };


    imagePreview = () => {
        const reader = new FileReader();

        reader.onload = () => {
            this.setState({ imageSrc: reader.result });
        };

        reader.readAsDataURL(this.uploadedImage);
    };

    prepareOptions = (array) => array.map(item => ({
        value: item,
        text: item
    }));

    onAddNewPositionItem = (e) => {
        if(e.which === 13) {
            if(this.state.preparedPositions.includes(this.state.positionSearch)) {
                this.notification.show('This position already exists!', 'danger');
            } else if(!this.state.positionSearch) {
                this.notification.show('Position must be required!', 'danger');
            } else {
                this.setState(prevState => ({
                    preparedPositions: [
                        ...prevState.preparedPositions,
                        prevState.positionSearch
                    ]
                }));
            }
        }
    };

    onAddNewProjectItem = e => {
        if(e.which === 13) {
            if(this.state.preparedProjects.includes(this.state.projectSearch)) {
                this.notification.show('This project already exists!', 'danger');
            } else if(!this.state.projectSearch) {
                this.notification.show('Project must be required!', 'danger');
            } else {
                this.setState(prevState => ({
                    preparedProjects: [
                        ...prevState.preparedProjects,
                        prevState.projectSearch
                    ]
                }));
            }
        }
    };

    onAddNewSkillItem = (e) => {
        if (e.which === 13 || e.type === 'click') {
            e.preventDefault();
            if (!this.state.newSkill && !this.state.skillSearch) {
                this.notification.show('Skill must be required!', 'danger');
            } else {
                let skillToSave = this.state.newSkill || this.state.skillSearch;

                if(this.state.skills.includes(skillToSave)) {
                    this.notification.show('Skill already exist!', 'danger');
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

    onChangeReadyForTransition = e => {
        if (e.which === 13 || e.type === 'click') {
            e.preventDefault();
            this.setState(prevState => ({ readyForTransition: !prevState.readyForTransition }))
        }
    };

    onAddNewProjectToArray = () => {
        if (this.state.prevProject !== this.state.project && this.state.project)
            this.setState(prevState => ({
                projects: !prevState.projects.includes(this.state.project)
                    ? [...prevState.projects, this.state.project]
                    : prevState.projects
            }), this.continueSaveData);
    };

    checkProjectsArray = () => {
        if (this.state.projects.includes('undefined') || this.state.projects.includes('')) {
            const filtredArray = this.state.projects.filter(project => project !== 'undefined' && project !== '');
            this.setState({ projects: filtredArray })
        }
    };

    render() {
        return (
            <Grid container centered columns={2}>
                <Notification ref={ (node) => { this.notification = node } }/>
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
                            <Form.Field>
                                <label>First name</label>
                                <input type='text'
                                       value={this.state.firstName}
                                       disabled={this.state.readOnly}
                                       placeholder="First name"
                                       onChange={(e) => { this.setState({ firstName: e.target.value }) }} />
                            </Form.Field>
                            <Form.Field>
                                <label>Last name</label>
                                <input type='text'
                                       value={this.state.lastName}
                                       disabled={this.state.readOnly}
                                       placeholder="Last name"
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
                                <label>Project</label>
                                <Dropdown fluid
                                          search
                                          selection
                                          placeholder="Project"
                                          disabled={ this.state.readOnly }
                                          value={ this.state.project }
                                          options={ this.prepareOptions(this.state.preparedProjects)}
                                          onChange={ (e, data) => { this.setState({ project: data.value }) }}
                                          onSearchChange={ (e, value) => { this.setState({ projectSearch: value }) } }
                                          onKeyDown={ this.onAddNewProjectItem } />
                            </Form.Field>
                            <Form.Field>
                                <label>Projects</label>
                                <div className={this.state.projects.length > 3 ? 'table-body-projects' : ''}>
                                    <Table singleLine
                                           compact
                                           fixed
                                           size='small'
                                           color='blue'>
                                        <Table.Body>
                                            {this.renderProjectsData()}
                                        </Table.Body>
                                    </Table>
                                </div>
                            </Form.Field>
                            <Form.Field>
                                <Checkbox className='ready-for-transition-checkbox'
                                          label='ready for transition on another project'
                                          disabled={ this.state.readOnly }
                                          checked={ this.state.readyForTransition }
                                          onChange={ this.onChangeReadyForTransition }
                                />
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
                                                                          onClick={() => {
                                                                              this.deleteSkill(skill)
                                                                          }} />
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
                                                              onChange={ (e, { value }) => { this.setState({ newSkill: value }) }}
                                                              onSearchChange={ (e, value) => { this.setState({ skillSearch: value, newSkill: '' }) } }
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