import React, { Component } from 'react';
import { Grid, Table, Dropdown, Icon } from 'semantic-ui-react';

export class Home extends Component {

    state = {
        employees: [
            {
                _id: 1,
                firstName: 'User 1',
                lastName: 'User 11',
                position: 'Position 1',
                skills: ['php', 'laravel'],
                startedAt: '2017/02/20'
            },
            {
                _id: 2,
                firstName: 'User 2',
                lastName: 'User 22',
                position: 'Position 2',
                skills: ['js', 'react', 'ember'],
                startedAt: '2017/02/19'
            },
            {
                _id: 3,
                firstName: 'User 3',
                lastName: 'User 33',
                position: 'Position 3',
                skills: ['js', 'angular2', 'react'],
                startedAt: '2017/02/22'
            }
        ],

        filtered: []
    };

    hasItem = (array, searchItem, propName = null) => {

        return array.some(item => {
            return propName ? item[propName] === searchItem : item === searchItem;
        });

    };

    prepareOptions = () => {
        const options = [];

        this.state.employees.forEach(employee => {

            employee.skills.forEach(skill => {

                if(!this.hasItem(options, skill, 'value')) {
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

        return array.map((item, index) => (
            <Table.Row key={ index }>
                <Table.Cell>{ index + 1 }</Table.Cell>
                <Table.Cell>{ item.firstName }</Table.Cell>
                <Table.Cell>{ item.lastName }</Table.Cell>
                <Table.Cell>{ item.position }</Table.Cell>
                <Table.Cell>{ item.startedAt }</Table.Cell>
                <Table.Cell>
                    <Icon name="write" size="large" link />
                    <Icon name="delete" size="large" link/>
                </Table.Cell>
            </Table.Row>
        ));
    };

    render() {
        return (
            <Grid container>
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
                        <Table singleLine style={{ marginTop: '40px' }} color="blue">
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