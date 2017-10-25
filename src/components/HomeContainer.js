import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';
import { Table, Icon, Menu, Dropdown } from 'semantic-ui-react';
import http, { setAuthHeader } from '../helpers/http';
import { apiPrefix } from '../../config';
import { Home } from './Home';
import { Admin } from './Admin';
import { UserPopup } from './UserPopup';

export class HomeContainer extends Component {

    state = {
        employees: [],
        filtered: [],
        currentPage: 0,
        users: [],
        isAdmin: false,
        isModalOpened: false,
        currentEmployeeId: '',
        filteredUsers: [],
        firstName: '',
        lastName: '',
        project: '',
        skills: [],
        fieldsPerPage: +localStorage.getItem('fieldsPerPage') || 10
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

    initializeUser = () => {
        const key = localStorage.getItem('Authorization');

        if(key) {
            setAuthHeader(key);

            http.get(`${apiPrefix}/login`)
                .then(({ data: user }) => {
                    if(user.isAdmin) {
                        return http.get(`${apiPrefix}/admin`)
                            .then(({ data: users }) => {
                                this.setState({
                                    users,
                                    isAdmin: true
                                });
                            });
                    } else {
                        return http.get(`${apiPrefix}/employees`)
                            .then(({ data }) => {
                                this.setState({ employees: this.formatEmployeesDate(data) })
                            });
                    }
                })
                .catch(err => {
                    localStorage.removeItem('Authorization');
                    browserHistory.push('/login');
                });

        } else {
            browserHistory.push('/login');
        }
    };

    componentDidMount() {
        this.initializeUser();
        document.addEventListener('keyup', this.onModalActions)
    }

    componentWillUnmount() {
        document.removeEventListener('keyup', this.onModalActions);
    }

    onModalActions = (e) => {
        if(e.which === 13 && this.state.isModalOpened) {
            this.onEmployeeDelete(this.state.currentEmployeeId)
        } else if(e.which === 27 && this.state.isModalOpened) {
            this.setState({ isModalOpened: false })
        }
    };

    onEmployeeDelete = (id) => {
        http.post(`${apiPrefix}/employee/delete`, { id })
            .then(res => {
                if(this.state.isAdmin) {
                    this.setState((prevState) => ({
                        users: prevState.users.map(user => {
                            user.employees = user.employees.filter(employee => employee._id !== id);
                            return user;
                        }),
                        isModalOpened: false,
                        employees: prevState.employees.filter(employee => employee._id !== id)
                    }));
                } else {
                    this.setState(prevState => ({
                        employees: prevState.employees.filter(employee => employee._id !== id),
                        isModalOpened: false
                    }));
                }
            })
            .catch(console.log)
    };

    formatEmployeesDate = (employees) => employees.map(employee => {
         employee.startedAt = new Date(employee.startedAt).toISOString().split('T')[0];

         return employee;
    });

    hasItem = (array, searchItem) => array.some(item => item['value'] === searchItem);

    prepareOptionsSkills = () => {
        const options = [];
        let key = 0;
        this.state.employees.forEach(employee => {
            employee.skills.forEach(skill => {
                if(!this.hasItem(options, skill)) {
                    options.push({
                        text: skill,
                        value: skill,
                        key
                    });
                    key++
                }
            });
        });

        return options;
    };

    prepareOptionsForSearch = key => {
        const options = [{
            text: 'selected none',
            value: '',
            key: 0
        }];

        this.state.employees.forEach((employee, index) => {
            if (!this.hasItem(options, employee[key]) && employee[key]) options.push({
                text: employee[key],
                value: employee[key],
                key: index + 1
            });
        });

        return options
    };

    prepareOptionForFirstAndLastName = () => {
        const options = [{
            text: 'selected none',
            value: '',
            key: 0
        }];

        this.state.employees.forEach((employee, index) => {
            options.push({
                text: `${employee.firstName} ${employee.lastName}`,
                value: `${employee.firstName} ${employee.lastName}`,
                key: index + 1
            })
        });

        return options
    };

    dropdownOnChange = (e, data) => {
        this.setChangedState(data);
    };

    setChangedState = ({ dataKey, value }) => {
        if (dataKey === 'firstName') {
            const [ firstName, lastName ] = value.replace(/\s{1,}/g, ' ').split(' ');
            this.setState({
                firstName,
                lastName
            }, this.filterTable)
        } else this.setState({ [dataKey]: value }, this.filterTable)
    };

    // filterTable = values => {
    //     let filtered = values.length
    //         ? this.state.employees
    //             .map(employee => ({
    //                 matches: employee.skills.filter(skill => values.includes(skill)).length,
    //                 employee
    //             }))
    //             .sort((a, b) => b.matches - a.matches)
    //             .filter(item => item.matches)
    //             .map(item => item.employee)
    //         : this.state.employees;
    //
    //     this.setState({ filtered })
    // };

    filterTable = () => {
        const filtered = this.state.employees
            .filter(employee => this.filterSkills(employee)
                && this.filtredByAnotherCriteria('project', employee)
                && this.filtredByAnotherCriteria('firstName', employee)
                && this.filtredByAnotherCriteria('lastName', employee));

        this.setState({ filtered })
    };

    filterSkills = employee => {
        return !this.state.skills.find(skill => !employee.skills.includes(skill));
    };

    filtredByAnotherCriteria = (criteria, employee) => {
        return this.state[criteria] !== ''
            ? employee[criteria] ? employee[criteria].includes(this.state[criteria]) : false
            : true
    };

    getClassName = employee => {
        return !employee.project
            ? 'empty-project'
            : employee.readyForTransition
                ? 'ready-for-transition'
                : '';
    };

    prepareEmployeesTableData = (array) => {
        if(array.length) {
            return array.map((employee, index) => ({
                className: this.getClassName(employee),
                index: index + 1,
                firstName: employee.firstName,
                lastName: employee.lastName,
                project: employee.project || '',
                position: employee.position,
                startedAt: employee.startedAt,
                actions: (
                    <Table.Cell key={ index + 3 }>
                        <UserPopup user={ employee }
                                   key={ index + 2 }
                                   trigger={
                                       <Link to={{ pathname: '/profile', query: { id: employee._id } }}>
                                           <Icon name="search"
                                                 size="large"
                                                 link color="blue" />
                                       </Link>
                                   } />
                        <Icon name="delete"
                              size="large"
                              link
                              color="red"
                              onClick={ () => { this.setState({ isModalOpened: true, currentEmployeeId: employee._id })} } />
                    </Table.Cell>
                )
            }));
        } else {
            return [{
                index: 'No employees'
            }]
        }
    };

    renderEmployeesTable = ({ className, index, firstName, lastName, position, project, startedAt, actions }) => ({
        key: index,
        className,
        cells: [
            index,
            firstName,
            lastName,
            position,
            project,
            startedAt,
            actions
        ]
    });

    paginate = (array) => {
        const startIndex = this.state.currentPage === 0 ? 0 : this.state.currentPage * this.state.fieldsPerPage;
        const endIndex = startIndex + this.state.fieldsPerPage;

        return array.slice(startIndex, endIndex);
    };

    getPageAmount = () => this.state.filtered.length
        ? Math.ceil(this.state.filtered.length / this.state.fieldsPerPage)
        : Math.ceil(this.state.employees.length / this.state.fieldsPerPage);

    getPageArray = () => {
        const pageAmount = this.getPageAmount();
        const pages = [];

        for(let i = 0; i < pageAmount; i++) {
            pages.push(i);
        }

        return pages;
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

    onPaginationPrev = () => {
        if(this.state.currentPage !== 0) {
            this.setState(prevState => ({
                currentPage: prevState.currentPage - 1
            }))
        }
    };

    onPaginationNumberChange = (e, { value }) => {
        localStorage.setItem('fieldsPerPage', value);
        this.setState(prevState => ({
            fieldsPerPage: value
        }));
    };

    getEmployeesSkillsSearchData = () => ({
        dropdownOptions: this.prepareOptionsSkills(),
        onDropdownChange: this.dropdownOnChange
    });

    getEmployeesTableProps = () => ({
        headerRow: ['#', 'First Name', 'Last Name', 'Position', 'Project', 'Started At', 'Actions'],
        footerRow: (
            <Table.Row>
                <Table.HeaderCell colSpan="6">
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
                        </Menu.Item >
                    </Menu>
                </Table.HeaderCell>
            </Table.Row>
        ),
        renderBodyRow: this.renderEmployeesTable,
        tableData: this.state.filtered.length
            ? this.prepareEmployeesTableData(this.paginate(this.state.filtered))
            : this.prepareEmployeesTableData(this.paginate(this.state.employees)),
        onEmployeeDelete: () => { this.onEmployeeDelete(this.state.currentEmployeeId) },
        onModalClose: () => { this.setState({ isModalOpened: false }) },
        isModalOpened: this.state.isModalOpened
    });

    onUserClick = (userId) => {
        let employees = this.state.users
            .find(user => user._id === userId)
            .employees;

        employees = this.formatEmployeesDate(employees);

        this.setState({ employees });
    };

    onFilterUsers = (e, data) => {
        const seachUser = data.value.toLowerCase();
        const filtered = this.state.users.filter(user => `${user.firstName} ${user.lastName}`
            .toLowerCase()
            .includes(seachUser));

        this.setState({ filteredUsers: filtered});
    };

    render() {
        return this.state.isAdmin
            ? <Admin getEmployeesTableProps={ this.getEmployeesTableProps }
                     getEmployeesSkillsSearchData={ this.getEmployeesSkillsSearchData }
                     users={ this.state.filteredUsers.length ? this.state.filteredUsers : this.state.users }
                     onUserClick={ this.onUserClick }
                     onSearchUsers={ this.onFilterUsers }
                     dropdownOnChange={ this.dropdownOnChange }
                     prepareOptionsForSearch={ this.prepareOptionsForSearch }
                     prepareOptionForFirstAndLastName={ this.prepareOptionForFirstAndLastName }/>
            : <Home getEmployeesTableProps={ this.getEmployeesTableProps }
                    getEmployeesSkillsSearchData={ this.getEmployeesSkillsSearchData }
                    prepareOptionsForSearch={ this.prepareOptionsForSearch }
                    dropdownOnChange={ this.dropdownOnChange }
                    prepareOptionForFirstAndLastName={ this.prepareOptionForFirstAndLastName }/>
    }
}