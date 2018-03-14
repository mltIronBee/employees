import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import http from '../helpers/http';
import { apiPrefix } from '../../config';
import { Grid, Form, Button, Icon, Segment, Table } from 'semantic-ui-react';
import { Notification } from './Notification';
import { AddEmployeePopup } from "./AddEmployeePopup";
import AddPMPopup from './AddPMPopup';
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
        isModalOpened: 0,       //0b01 Employees modal is opened, 0b10 PMs modal is opened
        popupIsOpen: 0,         //Same, as modal
        allManagers: [],
        projectManagers: [],
        currentManagerId: '',
        succeeded: false        //Notification is failing to show due to transitioning to anoter
    };                          //page. Adding delay and this variable to disable controls and ensure
                                //while notification is being shown
    componentDidMount() {
        this.props.params.method === 'create'
            ? this.getDataForProjectCreation()
            : this.getProjectById();
        document.addEventListener('keyup', this.onModalActions)
    }

    onModalActions = ({which}) => {
        if( this.state.succeeded ) { return; }
        if( which === 13 && this.state.isModalOpened ) {
            if( this.state.currentEmployeeId )
                this.employeeDeleteFromTable();
            else if( this.state.currentManagerId )
                this.managerDeleteFromTable();
        }
        else if( which === 27 && this.state.isModalOpened )
            this.setState({ isModalOpened: 0 });
        /*which === 13 && this.state.isModalOpened
            ? this.employeeDeleteFromTable()
            : (which === 27 && this.state.isModalOpened) && this.setState({ isModalOpened: false });*/
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

    onGetProject = ({ data: { project, allEmployees, allManagers } }) => {
        this.setState({
            id: project._id,
            name: project.name,
            startDate: project.startDate,
            projectEmployees: project.employees,
            allEmployees,
            projectManagers: !!project.managers ? project.managers : [],
            allManagers
        })
    };

    //Getting rid of getEmployeesTable due to necessity to duplicate code for
    //Project Managers table
    getTable = (item, renderFunc) => (
        <div className={item.length > 10 ? 'table-body-projects' : ''} >
            <Table  singleLine
                    compact
                    fixed
                    size='small'
                    color='blue'>
                <Table.Body>
                    { renderFunc() }
                </Table.Body>
            </Table>
        </div>
    );

    renderManagersData = () => {
        return this.state.projectManagers.length
            ? this.state.projectManagers.map(( manager, index ) => (
                <Table.Row key={index}>
                    <Table.Cell width={2}>{index+1}</Table.Cell>
                    <Table.Cell width={6}>{`${manager.firstName} ${manager.lastName}`}</Table.Cell>
                    <Table.Cell width={1}>
                        <Icon name='delete'
                            size='large'
                            link
                            color='red'
                            onClick={ () => { this.setState({ isModalOpened: 2, currentManagerId: manager._id })} } />
                    </Table.Cell>
                </Table.Row>
            ))
            : <Table.Row><Table.Cell>No project managers has been assigned to this project</Table.Cell></Table.Row>
    };

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
                            onClick={ () => { this.setState({ isModalOpened: 1, currentEmployeeId: employee._id })} } />
                    </Table.Cell>
                </Table.Row>
            ))
            : <Table.Row><Table.Cell>No employees yet</Table.Cell></Table.Row>
    };

    //getting rid of preparedEmployers in order to avoid code duplication
    prepareValues = ( values ) => (
        values.map(( item, index ) => ({
            text: `${item.firstName} ${item.lastName}`,
            value: item._id,
            key: index
        }))
    );

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

    addManagersToTable = managers => {
        const filteredManagers = this.state.allManagers
            .filter(manager => !managers.includes(manager._id));

        const managersForAdding = managers
            .map(id => this.state.allManagers.find(manager => manager._id === id));
        this.setState(prevState => ({
            allManagers: filteredManagers,
            projectManagers: [...prevState.projectManagers, ...managersForAdding]
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

    onModalClose = () => this.setState({ isModalOpened: 0, currentManagerId: '', currentEmployeeId: '' });

    managerDeleteFromTable = () => {
        this.setState(prevState => ({
            projectManagers: prevState.projectManagers
                .filter(manager => manager._id !== prevState.currentManagerId),
            allManagers: [ ...prevState.allManagers, prevState.projectManagers
                .find(manager => manager._id === prevState.currentManagerId)],
            isModalOpened: 0,
            currentManagerId: ''
        }))
    };

    employeeDeleteFromTable = () => {
        this.setState(prevState => ({
            projectEmployees: prevState.projectEmployees
                .filter(employee => employee._id !== prevState.currentEmployeeId),
            allEmployees: [ ...prevState.allEmployees, prevState.projectEmployees
                .find(employee => employee._id === prevState.currentEmployeeId)],
            isModalOpened: 0,
            currentEmployeeId: ''
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
        let { id, name, projectManagers, isCreating } = this.state;
        const requestUrl = `${apiPrefix}/project/${ isCreating ? 'create' : 'update' }`;

        if(!name) return this.notification.show('Project name must be required!', 'danger');
        if(!projectManagers) return this.notification.show('Project must have at least one project manager', 'danger');
        const obj = { name, managers: projectManagers };
        if (!isCreating) obj._id = id;

        http.post(requestUrl, obj)
            .then(({data}) =>
                Promise.all([
                    this.addEmployees(data._id),
                    this.deleteEmployeesFromProject(data._id)
                ]))
            .then(result => {
                this.notification.show('Data is updated');
                this.setState( {succeeded: true}, () => {
                    setTimeout(() => { browserHistory.push('/projects') }, 3000);
                });
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
                <DeleteEmployeeModal isModalOpened={ !!(this.state.isModalOpened & 1) }
                                     onModalClose={ this.onModalClose }
                                     onDelete={ this.employeeDeleteFromTable }
                                     entity='employee from project'/>
                {/*Yeah, it's not an employee modal, but still.*/}
                <DeleteEmployeeModal isModalOpened={ !!(this.state.isModalOpened & 2) }
                                     onModalClose={ this.onModalClose }
                                     onDelete={ this.managerDeleteFromTable }
                                     entity='project manager from project'/>
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
                                            disabled={ this.state.succeeded }
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
                                        employees={ this.prepareValues(this.state.allEmployees) }
                                        addEmployeesToTable={ this.addEmployeesToTable }
                                        popupIsOpen={ !!(this.state.popupIsOpen & 1) }
                                        setPopupState={ this.setPopupState }
                                        trigger={
                                            <Button className='add-employee-button'
                                                    onClick={ e => {
                                                        e.preventDefault();
                                                        this.setState(prevState => (
                                                            {popupIsOpen: ~prevState.popupIsOpen & 1}
                                                        ))
                                                    }}>
                                                Add employee
                                            </Button>
                                        }/>
                                    <AddPMPopup
                                        employees={ this.prepareValues(this.state.allManagers) }
                                        addEmployeesToTable={ this.addManagersToTable }
                                        popupIsOpen={ !!(this.state.popupIsOpen & 2) }
                                        setPopupState={ this.setPopupState }
                                        trigger={
                                            <Button className='add-employee-button'
                                                    onClick={ e => {
                                                        e.preventDefault();
                                                        this.setState(prevState => (
                                                            {popupIsOpen: ~prevState.popupIsOpen & 2}
                                                        ))
                                                    }}>
                                                Add PM
                                            </Button>
                                        }/>
                                </span>
                                <label>Project Managers</label>
                                { this.getTable(this.state.projectManagers, this.renderManagersData) }
                                <br />
                                <label>Employees</label>
                                { this.getTable(this.state.projectEmployees, this.renderEmployeesData) }
                            </Form.Field>
                        </Form>
                    </Segment>
                </Grid.Column>
            </Grid>
        )
    }
}