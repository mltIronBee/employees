import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';
import { Table, Icon } from 'semantic-ui-react';
import http, { setAuthHeader } from '../helpers/http';
import { apiPrefix } from '../../config';
import { UserPopup } from './UserPopup';
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

    arrayToRows = (array) => {

        if(array.length) {
            return array.map((item, index) => {
                return (
                    <Table.Row key={ index }>
                        <Table.Cell>{ index + 1 }</Table.Cell>
                        <Table.Cell>{ item.firstName }</Table.Cell>

                        <UserPopup user={ item } trigger={ <Table.Cell>{ item.lastName }</Table.Cell> } />
                        <Table.Cell>{ item.position }</Table.Cell>
                        <Table.Cell>{ item.startedAt }</Table.Cell>
                        <Table.Cell>
                            <Link to={{ pathname: '/profile', query: { id: item._id } }}>
                                <Icon name="search"
                                      size="large"
                                      link color="blue" />
                            </Link>
                            <Icon name="delete"
                                  size="large"
                                  link
                                  color="red"
                                  onClick={ () => { this.setState({ isModalOpened: true, currentEmployeeId: item._id })} } />
                        </Table.Cell>
                    </Table.Row>
                );
            });
        } else {
            return (
                <Table.Row textAlign="center">
                    <Table.Cell>No employees</Table.Cell>
                </Table.Row>
            )
        }
    };

    render() {
        return (
            <Home tableBody={ this.state.filtered.length
                ? this.arrayToRows(this.state.filtered)
                : this.arrayToRows(this.state.employees) }
                  dropdownOptions={ this.prepareOptions() }
                  onDropdownChange={ this.dropdownOnChange }
                  onEmployeeDelete={ () => { this.onEmployeeDelete(this.state.currentEmployeeId) } }
                  isModalOpened={ this.state.isModalOpened }
                  onModalClose={ () => { this.setState({ isModalOpened: false }) } } />
        );
    }
}