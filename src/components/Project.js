import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import http from '../helpers/http';
import { apiPrefix } from '../../config';
import { Grid, Form, Button, Icon, Segment, Table } from 'semantic-ui-react';
import { Notification } from './Notification';
import { AddEmployeePopup } from "./AddEmployeePopup";
import { DeleteEmployeeModal } from './DeleteEmployeeModal';

export class Project extends Component {

    state = {
        id: '',
        name: '',
        messageError: false,
        message: '',
        isCreating: false,
        projectEmployees: [],
        allEmployees: [],
        currentEmployeeId: '',
        isModalOpened: false,
        popupIsOpen: false
    };

    componentDidMount() {
        this.props.params.method === 'create'
            ? this.getDataForProjectCreation()
            : this.getProjectById();
        document.addEventListener('keyup', this.onModalActions)
    }

    onModalActions = ({which}) => {
        which === 13 && this.state.isModalOpened
            ? this.employeeDeleteFromTable()
            : (which === 27 && this.state.isModalOpened) && this.setState({ isModalOpened: false });
    };

    getDataForProjectCreation = () => {
        return http.get(`${apiPrefix}/project`)
            .then(({data}) => this.setState({ isCreating: true, allEmployees: data }))
            .catch(console.log)
    };

    getProjectById = () => {
        const params = { _id: this.props.location.query.id };

        return http.get(`${apiPrefix}/project`, { params })
            .then(this.onGetProject)
            .catch(console.log)
    };

    onGetProject = ({ data: { project, allEmployees} }) => {
        this.setState({
            id: project._id,
            name: project.name,
            startDate: project.startDate,
            projectEmployees: project.employees,
            allEmployees
        })
    };

    getEmployeesTable = () => (
        <div className={this.state.projectEmployees.length > 10 ? 'table-body-projects' : ''}>
            <Table singleLine
                   compact
                   fixed
                   size='small'
                   color='blue'>
                <Table.Body>
                    { this.renderEmployeesData() }
                </Table.Body>
            </Table>
        </div>
    );

    renderEmployeesData = () => {
        return this.state.projectEmployees.length
            ? this.state.projectEmployees.map((employee, index) => (
                <Table.Row key={index}>
                    <Table.Cell width={2}>{index + 1}</Table.Cell>
                    <Table.Cell width={6}>{`${employee.firstName} ${employee.lastName}`}</Table.Cell>
                    <Table.Cell width={1}>
                        <Icon name="delete"
                            size="large"
                            link
                            color="red"
                            onClick={ () => { this.setState({ isModalOpened: true, currentEmployeeId: employee._id })} } />
                    </Table.Cell>
                </Table.Row>
            ))
            : <Table.Row><Table.Cell>No employees yet</Table.Cell></Table.Row>
    };

    preparedEmployees = () =>
        this.state.allEmployees.map((employee, index) => ({
            text: `${employee.firstName} ${employee.lastName}`,
            value: employee._id,
            key: index
        }));

    addEmployeesToTable = employees => {
        const filtredEmployees = this.state.allEmployees
            .filter(employee => !employees.includes(employee._id));

        const employeesForAdding = employees
            .map(id => this.state.allEmployees.find(employee => employee._id === id));

        this.setState(prevState => ({
            allEmployees: filtredEmployees,
            projectEmployees: [...prevState.projectEmployees, ...employeesForAdding]
        }));
    };

    addEmployees = projectId => {
        const employeesForAdding = this.state.projectEmployees
            .filter(employee => !employee.projects.includes(projectId))
            .map(employee => {
                employee.projects.push(projectId);
                employee.projectsHistory[employee.projectsHistory.length - 1] !== projectId
                && employee.projectsHistory.push(projectId);

                return employee
            })
            .map(employee => this.updateEmployeeQuery(employee));

        return Promise.all(employeesForAdding)
    };

    updateEmployeeQuery = employee => {
        const requestUrl = `${apiPrefix}/employee/update`;
        const data = new FormData();

        data.append('_id', employee._id);
        data.append('firstName', employee.firstName);
        data.append('lastName', employee.lastName);
        data.append('position', employee.position);
        data.append('startedAt', employee.startedAt);
        data.append('readyForTransition', employee.readyForTransition);
        data.append('image', employee.imageSrc);
        employee.skills.forEach(skill => data.append('skills[]', skill));
        employee.projects.forEach(project => data.append('projects[]', project));
        employee.projectsHistory.forEach(project => data.append('projectsHistory[]', project));

        return http.post(requestUrl, data)
    };

    setPopupState = popupIsOpen => this.setState({ popupIsOpen });

    onModalClose = () => this.setState({ isModalOpened: false });

    employeeDeleteFromTable = () => {
        this.setState(prevState => ({
            projectEmployees: prevState.projectEmployees
                .filter(employee => employee._id !== prevState.currentEmployeeId),
            allEmployees: [ ...prevState.allEmployees, prevState.projectEmployees
                .find(employee => employee._id === prevState.currentEmployeeId)],
            isModalOpened: false
        }))
    };

    deleteEmployeesFromProject = projectId => {
        const alreadyAddedEmployees = this.state.allEmployees
            .filter(employee => employee.projects.includes(projectId));
        alreadyAddedEmployees.length &&
        alreadyAddedEmployees
            .map(employee => {
                employee.projects = employee.projects
                    .filter(project => project !== projectId);
                return this.updateEmployeeQuery(employee)
            });

        return Promise.all(alreadyAddedEmployees);
    };

    saveData = e => {
        e.preventDefault();
        let { id, name, isCreating } = this.state;
        const requestUrl = `${apiPrefix}/project/${ isCreating ? 'create' : 'update' }`;

        if(!name) return this.notification.show('Project name must be required!', 'danger');

        const obj = { name };
        if (!isCreating) obj._id = id;

        http.post(requestUrl, obj)
            .then(({data}) =>
                Promise.all([
                    this.addEmployees(data._id),
                    this.deleteEmployeesFromProject(data._id)
                ]))
            .then(result => {
                this.notification.show('Data is updated');
                browserHistory.push('/projects');
            })
            .catch(err => {
                this.notification.show(isCreating ? 'Creating error!' : 'Updating error!', 'danger');
            });

    };

    componentWillUnmount() {
        document.removeEventListener('keyup', this.onModalActions);
    }

    render() {
        return (
            <Grid container centered columns={2}>
                <DeleteEmployeeModal isModalOpened={ this.state.isModalOpened }
                                     onModalClose={ this.onModalClose }
                                     onDelete={ this.employeeDeleteFromTable }
                                     entity='employee from project'/>
                <Notification ref={ node => { this.notification = node } }/>
                <Grid.Column textAlign='left'>
                    <Segment raised color='blue' style={{marginTop: "40px"}}>
                        <Form onKeyDown={e => { if(e.keyCode === 13 && e.ctrlKey) this.saveData(e); }}>
                            <Grid.Row className='top-menu-project'>
                                <Grid.Column>
                                    <Icon color="blue"
                                          name="reply"
                                          size="big"
                                          style={{cursor: "pointer", float: "left"}}
                                          onClick={() => { browserHistory.push('/projects') }}>
                                    </Icon>
                                    <Button color="blue"
                                            onClick={ this.saveData }
                                            floated="right">
                                        Save
                                    </Button>
                                </Grid.Column>
                            </Grid.Row>
                            <Form.Field>
                                <label>Project name</label>
                                <input type='text'
                                       value={ this.state.name }
                                       placeholder="Project name"
                                       onChange={e => { this.setState({ name: e.target.value }) }} />
                            </Form.Field>
                            <Form.Field>
                                <span className='add-employee-row' style={{marginBottom: '10px'}}>
                                    <AddEmployeePopup
                                        employees={ this.preparedEmployees() }
                                        addEmployeesToTable={ this.addEmployeesToTable }
                                        popupIsOpen={ this.state.popupIsOpen }
                                        setPopupState={ this.setPopupState }
                                        trigger={
                                            <Button className='add-employee-button'
                                                    onClick={ e => {
                                                        e.preventDefault();
                                                        this.setState(prevState => (
                                                            {popupIsOpen: !prevState.popupIsOpen}
                                                        ))
                                                    }}>
                                                Add employee
                                            </Button>
                                        }/>

                                </span>
                                <label>Employees</label>
                                { this.getEmployeesTable() }
                            </Form.Field>
                        </Form>
                    </Segment>
                </Grid.Column>
            </Grid>
        )
    }
}
