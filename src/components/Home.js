import React from 'react';
import { Link } from 'react-router';
import { Grid, Button, Dropdown } from 'semantic-ui-react';
import { EmployeesTable } from './EmployeesTable';
import { SearchDropdown } from './SearchDropdown';

export const Home = (props) => (
    <Grid container>
        <Grid.Row>
            <Grid.Column floated="right">
                <Link to="profile/create">
                    <Button floated="right" color="blue" style={{ marginTop: '40px' }}>
                        Add new employee
                    </Button>
                </Link>
            </Grid.Column>
        </Grid.Row>
        <Grid.Row>
            <Grid.Column width={4} floated="right">
                <Dropdown fluid
                          search
                          dataKey='firstName'
                          selection
                          scrolling
                          options={ props.prepareOptionForFirstAndLastName() }
                          placeholder='Searched first name'
                          onChange={ props.dropdownOnChange } />
            </Grid.Column>
            <Grid.Column width={4} floated="right">
                <Dropdown fluid
                          search
                          dataKey='project'
                          selection
                          scrolling
                          options={ props.prepareOptionsForSearch('project') }
                          placeholder='Searched project'
                          onChange={ props.dropdownOnChange } />
            </Grid.Column>
            <Grid.Column width={4} floated="right">
                <SearchDropdown { ...props.getEmployeesSkillsSearchData()}/>
            </Grid.Column>
            <Grid.Column width={16}>
                <EmployeesTable { ...props.getEmployeesTableProps() } containerStyles={{ marginTop: '20px' }} />
            </Grid.Column>
        </Grid.Row>
    </Grid>
);