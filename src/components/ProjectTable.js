import React, { Component }  from 'react';
import moment from 'moment';
import _ from 'lodash';
import { Table, Grid, Button, Icon, Dropdown, Menu } from 'semantic-ui-react';
import { Link } from 'react-router';
import http from '../helpers/http';
import { apiPrefix } from '../../config';
import { DeleteEmployeeModal } from './DeleteEmployeeModal';
import { LoaderComponent } from './Loader';
import { UserPopup } from './UserPopup';

export class ProjectTable extends Component {
    state = {
        projects: [],
        isModalOpened: false,
        loaderActive: false,
        currentProjectId: '',
        currentPage: 0,
        fieldsPerPage: +localStorage.getItem('fieldsPerPage') || 10,
        column: '',
        direction: '',
        managerFirstName: '',
        managerLastName: '',
        employeeFirstName: '',
        employeeLastName: '',
        filtered: []
    };

    dropdownOptions = [
        {
            text: '5',
            value: 5
        },
        {
            text: '10',
            value: 10
        },
        {
            text: '15',
            value: 15
        },
        {
            text: '20',
            value: 20
        },
        {
            text: '25',
            value: 25
        },
        {
            text: '30',
            value: 30
        },
        {
            text: '40',
            value: 40
        },
        {
            text: '50',
            value: 50
        }
    ];


    componentDidMount() {
        this.checkUserAndGetData(this.props.user);
        document.addEventListener('keyup', this.onModalActions)
    }

    componentWillReceiveProps(nextProps) {
        this.checkUserAndGetData(nextProps.user);
    }

    checkUserAndGetData = user => {
        user
            ? !this.state.projects.length ? this.initializeData() : this.setState({ loaderActive: false })
            : this.setState({ loaderActive: true });
    };

    initializeData = () => {
        return http.get(`${apiPrefix}/projects`)
                .then(({data}) => this.setState({
                    projects: data,
                    loaderActive: false
                }))
                .catch(console.log)
    };

    //Replaced startProject w/ changeProjectStatus
    //Basically, we need the same query for both starting and finishing
    //project w/ difference in only one field
    changeProjectStatus = (projectId, field) => {
        const obj = {
            _id: projectId,
            [field]: new Date()
        };

        return http.post(`${apiPrefix}/project/update`, obj)
                .then(res =>
                    this.setState(prevState => ({
                        projects:
                            prevState.projects.map(project => project._id === obj._id
                                ? Object.assign({}, project, { [field]: obj[field] })
                                : project)
                    }))
                )
                .catch(console.log)
    };



    onModalClose = () => this.setState({ isModalOpened: false });

    onProjectDelete = () => {
        const id = this.state.currentProjectId;
        return http.post(`${apiPrefix}/project/delete`, { id })
                .then(({data}) =>
                    this.setState(prevState => ({
                        projects: prevState.projects.filter(project => project._id !== id),
                        isModalOpened: false
                    }))
                )
                .catch(console.log)
    };

    onModalActions = ({which}) => {
        which === 13 && this.state.isModalOpened
            ? this.onProjectDelete(this.state.currentProjectId)
            : (which === 27 && this.state.isModalOpened) && this.setState({ isModalOpened: false });
    };

    onPaginationNumberChange = (e, { value }) => {
        localStorage.setItem('fieldsPerPage', value);
        this.setState(prevState => ({
            fieldsPerPage: value
        }));
    };

    onPaginationPrev = () => {
        if(this.state.currentPage !== 0) {
            this.setState(prevState => ({
                currentPage: prevState.currentPage - 1
            }))
        }
    };

    onPaginationChange = (page) => {
        this.setState({ currentPage: page });
    };

    onPaginationNext = () => {
        if(this.state.currentPage < this.getPageAmount() - 1) {
            this.setState(prevState => ({
                currentPage: prevState.currentPage + 1
            }))
        }
    };

    getPageAmount = () => Math.ceil(this.state.projects.length / this.state.fieldsPerPage);

    getPageArray = () => {
        const pageAmount = this.getPageAmount();
        const pages = [];

        for(let i = 0; i < pageAmount; i++) {
            pages.push(i);
        }

        return pages;
    };

    handleSort = clickedColumn => {
        const { column, projects, direction } = this.state;
        const sortedProjects = _.sortBy(projects, [clickedColumn]);

        if (column !== clickedColumn) {
            this.setState({
                column: clickedColumn,
                projects: sortedProjects,
                direction: 'ascending',
            });
            return
        }

        this.setState({
            projects: direction === 'ascending' ? sortedProjects.reverse() : sortedProjects,
            direction: direction === 'ascending' ? 'descending' : 'ascending',
        })
    };

    getProjectsHeaderRowForTable = () => (
        <Table.Row>
            <Table.HeaderCell>#</Table.HeaderCell>
            <Table.HeaderCell
                sorted={this.state.column === 'name' ? this.state.direction : null}
                onClick={ e => this.handleSort('name')}>
                Project name
            </Table.HeaderCell>
            <Table.HeaderCell
                sorted={this.state.column === 'managers' ? this.state.direction : null}
                onClick={ e => this.handleSort('managers') } >
                Project Managers
            </Table.HeaderCell>
            <Table.HeaderCell 
                sorted={this.state.column === 'employees' ? this.state.direction : null}
                onClick={ e => this.handleSort('employees') } >
                Project Employees
            </Table.HeaderCell>
            <Table.HeaderCell
                sorted={this.state.column === 'startDate' ? this.state.direction : null}
                onClick={ e => this.handleSort('startDate')}>
                Start Date
            </Table.HeaderCell>
            <Table.HeaderCell
                sorted={this.state.column === 'finishDate' ? this.state.direction : null}
                onClick={ e => this.handleSort('finishDate') } >
                Finish Date
            </Table.HeaderCell>
            <Table.HeaderCell
                sorted={this.state.column === 'finishDate' ? this.state.direction : null}
                onClick={ e => this.handleSort('finishDate')}>
                Finish Project
            </Table.HeaderCell>
            <Table.HeaderCell>Actions</Table.HeaderCell>
        </Table.Row>
    );

    getProjectsTableData = projects => {
        return projects.length
            ? projects.map((project, index) => ({
                index: index + 1,
                name: project.name,
                managers: {key: index+2, content: this.getStringNameOfManagers(project.managers)},
                employees: {key: index+3, content: this.getStringNameOfEmployees(project.employees)},
                startDate: {key: index+4, content: project.startDate ? moment(project.startDate).format('YYYY-MM-DD') : ''},
                finishDate: {key: index+5, content: project.finishDate ? moment(project.finishDate).format('YYYY-MM-DD') : ''},
                finishProject: (
                    <Table.Cell key={ index + 6 }>
                        {/*Projects now will start automatically when cerated, but some may be still not started before update*/}
                        { !!project.startDate
                            ? <Button color={!!project.finishDate ? 'blue' : 'red'}
                                style={{width: '90px'}}
                                inverted
                                content={!!project.finishDate ? 'Finished' : 'Finish'}
                                disabled={!!project.finishDate}
                                onClick={ () => this.changeProjectStatus(project._id, 'finishDate') }/>
                            : <Button color='green'
                                style={{width: '90px'}}
                                inverted
                                content='Start'
                                onClick={ () => this.changeProjectStatus(project._id, 'startDate') }/>
                        }
                    </Table.Cell>
                ),
                actions: (
                    <Table.Cell key={ index + 7 }>
                        <Link to={{ pathname: '/project', query: { id: project._id } }}>
                            <Icon name="edit"
                                  size="large"
                                  link color="blue" />
                        </Link>
                        <Icon name="delete"
                              size="large"
                              link
                              color="red"
                              onClick={ () => { this.setState({ isModalOpened: true, currentProjectId: project._id })} } />
                    </Table.Cell>
                )
            }))
            : [{ index: 'No projects yet' }]
    };

    getStringNameOfManagers = managers => (
        managers && managers.length
        ? managers.map( (manager, i) => (
            <span key={manager._id}>
                <Link to={{ pathname: '/profile', query: { id: manager._id }, state: {from: 'projects'} }} >
                    {`${manager.firstName} ${manager.lastName}`}
                </Link>
                { i < managers.length-1 && ', ' }
            </span>))
        : 'No managers have been assigned for this project'
    );

    getStringNameOfEmployees = employees => (
        employees && employees.length
        ? employees.map( (employee, i) => (
            <span key={employee._id} >
                <UserPopup user={ employee }
                    projects={this.getStringOfNameProjects(employee.projects)}
                    trigger={
                        <Link to={{ pathname: '/profile', query: { id: employee._id }, state: {from: 'projects'} }} >
                            {`${employee.firstName} ${employee.lastName}`}
                        </Link> } />
                { i < employees.length-1 && ', ' }
            </span>)
        )
        : 'No employees have been assigned for this project'
    );

    getStringOfNameProjects = projects => {
        const res = [];
        projects.forEach( id => {
            const item = this.state.projects.find( project => 
                project._id === id )
            item && res.push(item.name)
        });
        return res.join(', ');
    }

    renderProjectsTable = ({ index, name, managers, employees, startDate, finishDate, finishProject, actions }) => ({
        key: index,
        cells: [
            index,
            name,
            managers,
            employees,
            startDate,
            finishDate,
            finishProject,
            actions
        ]
    });

    getFooterRow = (
        <Table.Row>
            <Table.HeaderCell colSpan="8">
                <Dropdown placeholder="Per page"
                selection
                value={ this.state.fieldsPerPage }
                options={ this.dropdownOptions }
                onChange={ this.onPaginationNumberChange }/>
                <Menu floated="right" pagination>
                    <Menu.Item icon onClick={ this.onPaginationPrev }>
                        <Icon name="left chevron" />
                    </Menu.Item>
                    {
                        this.getPageArray().map(pageNumber => (
                            <Menu.Item key={ pageNumber }
                                       active={ pageNumber === this.state.currentPage }
                                       onClick={() => {
                                           this.onPaginationChange(pageNumber);
                                       }}>
                                { pageNumber + 1 }
                            </Menu.Item>
                        ))
                    }
                    <Menu.Item icon onClick={ this.onPaginationNext }>
                        <Icon name="right chevron" />
                    </Menu.Item>
                </Menu>
            </Table.HeaderCell>
        </Table.Row>
    );

    paginate = array => {
        const startIndex = this.state.currentPage === 0 ? 0 : this.state.currentPage * this.state.fieldsPerPage;
        const endIndex = startIndex + this.state.fieldsPerPage;

        return array.slice(startIndex, endIndex);
    };

    componentWillUnmount() {
        document.removeEventListener('keyup', this.onModalActions);
    }

    prepareOptions = field => {
        const options = [{
            text: 'selected none',
            value: '',
            key: 0
        }];
        const items = [];
        
        this.state.projects.forEach( project => {
            if( project[field] ) {
                project[field].forEach( item => {
                    items.push(`${item.firstName} ${item.lastName}`)
                });
            }
        })

        _.uniq(items).forEach( (item, index) => {
            options.push({
                text: item,
                value: item,
                key: index+1
            });
        });

        return options;
    };

    dropdownOnChange = (e, {dataKey, value}) => {
        if(value) {
            const [ firstName, lastName ] = value.replace(/\s{1,}/g, ' ').split(' ');
            this.setState({
                [`${dataKey}FirstName`]: firstName,
                [`${dataKey}LastName`]: lastName
            }, this.filterTable);
        }
        else {
            this.setState({
                [`${dataKey}FirstName`]: '',
                [`${dataKey}LastName`]: ''
            }, this.filterTable);
        }
    };

    filterTable = () => {
        const filtered = this.state.projects
            .filter( project => 
                this.filterManagers(project) && this.filterEmployees(project)
            );

        this.setState({ filtered });
    };

    filterManagers = project => {
        return this.state.managerFirstName !== '' && this.state.managerLastName
            ? project.managers && project.managers.length 
            && project.managers.find( manager => manager.firstName.includes(this.state.managerFirstName) && manager.lastName.includes(this.state.managerLastName))
            : true
    };

    filterEmployees = project => {
        return this.state.employeeFirstName !== '' && this.state.employeeLastName !== ''
        ? project.employees && project.employees.length
        && project.employees.find( employee => employee.firstName.includes(this.state.employeeFirstName) && employee.lastName.includes(this.state.employeeLastName) )
        : true
    }

    getProjectsList = () => {
        return this.state.filtered.length
            ? this.state.filtered
            : this.state.projects;
    };

    render() {
        return (
            <Grid container>
                <LoaderComponent loaderActive={ this.state.loaderActive }/>
                <Grid.Row>
                    <Grid.Column width={5} floated='left' style={{ marginTop: '40px'}} >
                        <Dropdown fluid
                              search
                              selection
                              scrolling
                              dataKey={'manager'}
                              options={ this.prepareOptions('managers') }
                              placeholder='Search Project Manager'
                              onChange={ this.dropdownOnChange } />
                    </Grid.Column>
                    <Grid.Column width={5} floated='left' style={{ marginTop: '40px'}} >
                        <Dropdown fluid
                              search
                              selection
                              scrolling
                              dataKey={'employee'}
                              options={ this.prepareOptions('employees') }
                              placeholder='Search Employee'
                              onChange={ this.dropdownOnChange } />
                    </Grid.Column>
                    <Grid.Column width={6} floated='right'>
                        <Link to="project/create">
                            <Button floated="right" color="blue" style={{ marginTop: '40px' }}>
                                Add new project
                            </Button>
                        </Link>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <DeleteEmployeeModal isModalOpened={ this.state.isModalOpened }
                                         onModalClose={ this.onModalClose }
                                         onDelete={ this.onProjectDelete }
                                         entity='project'/>
                    <Grid.Column width={16}>
                        <Table singleLine
                               sortable
                               compact
                               color="blue"
                               headerRow={ this.getProjectsHeaderRowForTable() }
                               footerRow={ this.getFooterRow }
                               tableData={ this.getProjectsTableData(this.paginate(this.getProjectsList())) }
                               renderBodyRow={ this.renderProjectsTable }
                        />
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        )
    }
}
