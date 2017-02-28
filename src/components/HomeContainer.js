import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';
import { Table, Icon } from 'semantic-ui-react';
import http, { setAuthHeader } from '../helpers/http';
import { apiPrefix } from '../../config';
import { Home } from './Home';

export class HomeContainer extends Component {

    state = {
        employees: [],
        filtered: [],
        isModalOpened: false,
        currentEmployeeId: '',
        popupTrigger: null
    };

    initializeUser = () => {
        const key = localStorage.getItem('Authorization');

        if(key) {
            setAuthHeader(key);

            http.get(`${apiPrefix}/login`)
                .then((res) => {
                    return http.get(`${apiPrefix}/employees`)
                })
                .then(({ data }) => {
                    this.setState({ employees: this.formatEmployeesDate(data) })
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
                this.setState((prevState) => ({
                    employees: prevState.employees.filter((employee) => employee._id !== id),
                    isModalOpened: false
                }));
            })
            .catch(err => {
                console.log('Deleting error');
            })
    };

    formatEmployeesDate = (employees) => employees.map(employee => {
         employee.startedAt = new Date(employee.startedAt).toISOString().split('T')[0];

         return employee;
    });

    hasItem = (array, searchItem) => array.some(item => item['value'] === searchItem);

    prepareOptions = () => {
        const options = [];

        this.state.employees.forEach(employee => {

            employee.skills.forEach(skill => {

                if(!this.hasItem(options, skill)) {
                    options.push({
                        text: skill,
                        value: skill
                    })
                }
            });
        });

        return options;
    };

    dropdownOnChange = (e, data) => {
        this.filterTable(data.value);
    };

    filterTable = (values) => {
        let filtered = values.length
            ? this.state.employees
                .map(employee => ({
                    matches: employee.skills.filter(skill => values.includes(skill)).length,
                    employee
                }))
                .sort((a, b) => b.matches - a.matches)
                .filter(item => item.matches)
                .map(item => item.employee)
            : this.state.employees;

        this.setState({ filtered })
    };

    prepareEmployeesTableData = (array) => {
        if(array.length) {
            return array.map(({ _id, firstName, lastName, position, startedAt }, index) => ({
                index: index + 1,
                firstName,
                lastName,
                position,
                startedAt,
                actions: (
                    <Table.Cell key={ index }>
                        <Link to={{ pathname: '/profile', query: { id: _id } }}>
                            <Icon name="search"
                                  size="large"
                                  link color="blue" />
                        </Link>
                        <Icon name="delete"
                              size="large"
                              link
                              color="red"
                              onClick={ () => { this.setState({ isModalOpened: true, currentEmployeeId: _id })} } />
                    </Table.Cell>
                )
            }));
        } else {
            return [{
                index: 'No employees'
            }]
        }
    };

    renderEmployeesTable = ({ index, firstName, lastName, position, startedAt, actions }) => ({
        key: index,
        cells: [
            index,
            firstName,
            lastName,
            position,
            startedAt,
            actions
        ]
    });

    render() {
        return (
            <Home headerRow={['#', 'First Name', 'Last Name', 'Position', 'Started At', 'Actions']}
                  tableData={ this.state.filtered.length
                      ? this.prepareEmployeesTableData(this.state.filtered)
                      : this.prepareEmployeesTableData(this.state.employees) }
                  renderBodyRow={ this.renderEmployeesTable }
                  dropdownOptions={ this.prepareOptions() }
                  onDropdownChange={ this.dropdownOnChange }
                  onEmployeeDelete={ () => { this.onEmployeeDelete(this.state.currentEmployeeId) } }
                  isModalOpened={ this.state.isModalOpened }
                  onModalClose={ () => { this.setState({ isModalOpened: false }) } } />
        );
    }
}