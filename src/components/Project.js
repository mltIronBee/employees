import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import http from '../helpers/http';
import { apiPrefix } from '../../config';
import { Menu, Grid, Form, Button, Icon, Segment, Table } from 'semantic-ui-react';
import { Notification } from './Notification';
import { AddEmployeePopup } from "./AddEmployeePopup";
import AddPMPopup from './AddPMPopup';
import { DeleteEmployeeModal } from './DeleteEmployeeModal';
import ProjectSmallTable from './ProjectSmallTable';
import moment from 'moment';
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
        isModalOpened: 0b00,       //0b01 Employees modal is opened, 0b10 PMs modal is opened
        popupIsOpen: 0b00,         //Same, as modal
        allManagers: [],
        projectManagers: [],
        currentManagerId: '',
        activeItem: 'personel',
        succeeded: false        //Notification is failing to show due to transitioning to anoter
    };                          //page. Adding delay and this variable to disable controls and ensure
                                //that notification is being shown
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
    };

    getDataForProjectCreation = () => {
        return http.get(`${apiPrefix}/project`)
            .then(({data}) => this.setState({ isCreating: true, allEmployees: data.allEmployees, allManagers: data.allManagers }))
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
            finishDate: project.finishDate || '',
            allEmployees,
            projectManagers: !!project.managers ? project.managers : [],
            allManagers,
            summary: project.summary
        });
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
        return this.state.projectManagers.map( manager => (
            [{
                width: 6,
                item: `${manager.firstName} ${manager.lastName}`
            },
            {
                width: 1,
                item: !this.state.finishDate && (<Icon name='delete'
                            size='large'
                            link
                            color='red'
                            onClick={ () => { this.setState({ isModalOpened: 0b10, currentManagerId: manager._id }) } } />)
            }])
        )
    };

    renderEmployeesData = () => {
        return this.state.projectEmployees.map( employee => (
            [{
                width: 6,
                item: `${employee.firstName} ${employee.lastName}`
            }, {
                width: 1,
                item: !this.state.finishDate && (<Icon name="delete"
                    size="large"
                    link
                    color="red"
                    onClick={ () => { this.setState({ isModalOpened: 0b01, currentEmployeeId: employee._id })} } />)
            }])
        )
    };

    summaryHeader = () => (
        !!this.state.finishDate
        ? ['#', 'Employee Name', 'Total tracked time']
        : ['#', 'Employee Name', 'Tracking', 'Total tracked time']
    );

    renderSummaryData = () => {
        return this.state.summary.map( info => (
            !!this.state.finishDate
            ?   [{
                    width: 6,
                    item: info.employeeName
                }, {
                    width: 2,
                    item: `${info.totalWorkHours} hours`
                }]
            :   [{
                    width: 6,
                    item: info.employeeName
                }, {
                    width: 2,
                    item: `${info.hoursPerProject} hours/day`
                }, {
                    width: 2,
                    item: `${info.totalWorkHours} hours`
                }]
        ));
    };

    summaryFooter = () => {
        let totalHoursPerDay = 0, totalHours = 0;
        this.state.summary.forEach( info => {
            totalHours += info.totalWorkHours;
            if( !this.state.finishDate )
                totalHoursPerDay += info.hoursPerProject;
        });
        const footer = ['', 'Totals:', `${totalHours} man-hours`];
        if (!this.state.finishDate)
            footer.splice(2, 0, `${totalHoursPerDay} hours/day`)
        return footer;
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
                employee.projectsHistory = employee.projectsHistory
                    .filter(project => project !== projectId);
                return this.updateEmployeeQuery(employee)
            });

        return Promise.all(alreadyAddedEmployees);
    };

    saveData = e => {
        e.preventDefault();
        if( this.state.finishDate ) return;
        let { id, name, projectManagers, isCreating } = this.state;
        const requestUrl = `${apiPrefix}/project/${ isCreating ? 'create' : 'update' }`;
        if(!name) return this.notification.show('Project name must be required!', 'danger');
        if(!projectManagers.length) return this.notification.show('Project must have at least one project manager', 'danger');
        const obj = { name, managers: projectManagers };
        if (!isCreating) { obj._id = id; }
        else { obj.startDate = new Date(); }
        http.post(requestUrl, obj)
            .then(({data}) =>
                Promise.all([
                    this.addEmployees(data._id),
                    this.deleteEmployeesFromProject(data._id)
                ]))
            .then(result => {
                //this.notification.show('Data is updated');
                this.setState( {succeeded: true}, () => {
                    browserHistory.push({
                            pathname: this.props.location.state && this.props.location.state.from === 'dashboard' ? '/' : '/projects',
                            state: { selectedUserId: this.props.location.state && this.props.location.state.from === 'dashboard' ? this.props.location.state.selectedUserId : '' }
                        }) 
                    })
            })
            .catch(err => {
                this.notification.show(isCreating ? 'Creating error!' : 'Updating error!', 'danger');
            });

    };

    handleTabClick = (e, {name}) => this.setState({ activeItem: name });

    parseSummaryData = () => {
        if ( this.state.summary ) {
            const parsed = this.state.summary.map( report => {
                const dates = [];
                const hoursPerProject = [];
                for( let i = 0; i < report.details.length; i++ ) {
                    const detail = report.details[i];
                    const rightDate = detail.rightDate !== 'skip' ? moment(detail.rightDate) : moment(report.details[i+1].leftDate);
                    const skipping = detail.rightDate === 'skip';
                    let leftDate = moment(detail.leftDate);
                    let daysBetween = rightDate.diff(leftDate, 'days');
                    while( daysBetween > 0 ) {
                        dates.push(moment(leftDate).format('YYYY-MM-DD'));
                        skipping ? hoursPerProject.push(0) : hoursPerProject.push(detail.hoursPerProject);
                        leftDate.add(1, 'd');
                        daysBetween = rightDate.diff(leftDate, 'days');
                    }
                }
                return { id: report.employeeName, xVal: dates, yVal: hoursPerProject };
            });
            return parsed;
        }

        return [];
    };

    componentWillUnmount() {
        document.removeEventListener('keyup', this.onModalActions);
    }

    render() {
        return (
            <Grid container centered columns={2}>
                <DeleteEmployeeModal isModalOpened={ !!(this.state.isModalOpened & 0b01) }
                                     onModalClose={ this.onModalClose }
                                     onDelete={ this.employeeDeleteFromTable }
                                     entity='employee from project'/>
                {/*Yeah, it's not an employee modal, but still.*/}
                <DeleteEmployeeModal isModalOpened={ !!(this.state.isModalOpened & 0b10) }
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
                                          onClick={() => { browserHistory.push({
                                                pathname: this.props.location.state && this.props.location.state.from === 'dashboard' ? '/' : '/projects',
                                                state: { selectedUserId: this.props.location.state && this.props.location.state.from === 'dashboard' ? this.props.location.state.selectedUserId : '' }
                                            }) }}>
                                    </Icon>
                                    { !this.state.finishDate &&
                                        <Button color="blue"
                                                disabled={ this.state.succeeded }
                                                onClick={ this.saveData }
                                                floated="right">
                                            Save
                                        </Button>
                                    }
                                </Grid.Column>
                            </Grid.Row>
                            <Form.Field>
                                <label>Project name</label>
                                <input type='text'
                                       value={ this.state.name }
                                       placeholder="Project name"
                                       disabled={ this.state.succeded || !!this.state.finishDate }
                                       onChange={e => { this.setState({ name: e.target.value }) }} />
                            </Form.Field>
                            <Form.Field>
                                 { !this.state.finishDate &&
                                    <span className='add-employee-row' style={{marginBottom: '10px'}}>
                                        <AddEmployeePopup
                                            employees={ this.prepareValues(this.state.allEmployees) }
                                            addEmployeesToTable={ this.addEmployeesToTable }
                                            popupIsOpen={ !!(this.state.popupIsOpen & 0b01) }
                                            setPopupState={ this.setPopupState }
                                            trigger={
                                                <Button className='add-employee-button'
                                                        onClick={ e => {
                                                            e.preventDefault();
                                                            this.setState(prevState => (
                                                                {popupIsOpen: ~prevState.popupIsOpen & 0b01}
                                                            ))
                                                        }}>
                                                    Add employee
                                                </Button>
                                            }/>
                                        <AddPMPopup
                                            employees={ this.prepareValues(this.state.allManagers) }
                                            addEmployeesToTable={ this.addManagersToTable }
                                            popupIsOpen={ !!(this.state.popupIsOpen & 0b10) }
                                            setPopupState={ this.setPopupState }
                                            trigger={
                                                <Button className='add-employee-button'
                                                        onClick={ e => {
                                                            e.preventDefault();
                                                            this.setState(prevState => (
                                                                {popupIsOpen: ~prevState.popupIsOpen & 0b10}
                                                            ))
                                                        }}>
                                                    Add PM
                                                </Button>
                                            }/>
                                    </span>
                                }
                                <Menu tabular>
                                    <Menu.Item name='personel' 
                                        active={this.state.activeItem === 'personel'}
                                        onClick={this.handleTabClick} >
                                        Presonel
                                    </Menu.Item>
                                    {!this.state.isCreating && <Menu.Item name='summary'
                                        active={this.state.activeItem === 'summary'}
                                        onClick={this.handleTabClick} >
                                        Summary
                                    </Menu.Item>}
                                </Menu>
                                { this.state.activeItem === 'personel' &&
                                    <div>
                                        <label>Project Managers</label>
                                        <ProjectSmallTable 
                                            tableBody={this.renderManagersData()}
                                            bodyFallback='No project managers has been assigned to this project' />
                                        <br />
                                        <label>Employees</label>
                                        <ProjectSmallTable 
                                            tableBody={this.renderEmployeesData()}
                                            bodyFallback='No employees yet' />
                                    </div>
                                }
                                {
                                    this.state.activeItem === 'summary' &&
                                    <div>
                                        <label>Project summary</label>
                                        <ProjectSmallTable 
                                            tableBody={this.renderSummaryData()}
                                            bodyFallback='Cannot get project summary'
                                            tableHeaders={this.summaryHeader()}
                                            tableFooters={this.summaryFooter()} />
                                    </div>
                                }
                            </Form.Field>
                        </Form>
                    </Segment>
                </Grid.Column>
            </Grid>
        )
    }
}