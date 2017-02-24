import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';
import { Grid, Table, Dropdown, Icon, Modal, Header, Button } from 'semantic-ui-react';
import http, { setAuthHeader } from '../helpers/http';
import { apiPrefix } from '../../config';
import { UserPopup } from './UserPopup';

export class Home extends Component {

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

    onModalActions = (e) => {

        if(e.which === 13 && this.state.isModalOpened) {
            this.onDelete(this.state.currentEmployeeId)
        } else if(e.which === 27 && this.state.isModalOpened) {
            this.setState({ isModalOpened: false })
        }
    };

    componentWillUnmount() {
        document.removeEventListener('keyup', this.onModalActions);
    }

    onDelete = (id) => {
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
            <Grid container>

                <Modal basic
                       open={ this.state.isModalOpened }
                       size="small">
                    <Header icon="user delete" content="Deleting" color="red" />
                    <Modal.Content>
                        <h3>Are you sure you want to delete an employee?</h3>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button basic
                                inverted
                                onClick={ () => { this.setState({ isModalOpened: false }) } }>
                            No
                        </Button>
                        <Button color='red'
                                basic
                                inverted
                                onClick={ () => { this.onDelete(this.state.currentEmployeeId) } }>
                            Yes</Button>
                    </Modal.Actions>
                </Modal>

                <Grid.Row>
                    <Grid.Column width={8} floated="right">
                        <Dropdown fluid
                                  multiple
                                  search
                                  selection
                                  options={ this.prepareOptions() }
                                  placeholder="Search parameters"
                                  style={{ marginTop: '40px' }}
                                  onChange={ this.dropdownOnChange } />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column>
                        <Link to="profile/create">
                            <Button floated="right" color="blue" style={{ margin: '20px 0' }}>
                                Add new employee
                            </Button>
                        </Link>
                        <Table singleLine color="blue">
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>#</Table.HeaderCell>
                                    <Table.HeaderCell>First Name</Table.HeaderCell>
                                    <Table.HeaderCell>Last Name</Table.HeaderCell>
                                    <Table.HeaderCell>Position</Table.HeaderCell>
                                    <Table.HeaderCell>Started At</Table.HeaderCell>
                                    <Table.HeaderCell>Actions</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>

                            <Table.Body>
                                {
                                    this.state.filtered.length
                                        ? this.arrayToRows(this.state.filtered)
                                        : this.arrayToRows(this.state.employees)
                                }
                            </Table.Body>
                        </Table>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        );
    }
}