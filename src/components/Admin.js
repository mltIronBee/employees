import React from 'react';
import { Grid, Segment, Input, Dropdown } from 'semantic-ui-react';
import { EmployeesTable } from './EmployeesTable';
import { SearchDropdown } from './SearchDropdown';
import { UserList } from './UserList';

export const Admin = (props) => (
    <Grid container>
        <Grid.Row style={{ marginTop: '50px' }}>
            <Grid.Column width={5} floated="left" style={{ marginRight: '15px' }}>
                <Input icon={{name: 'search'}}
                       placeholder='Search...'
                       onChange={ props.onSearchUsers } />
            </Grid.Column>
            <Grid.Column width={3} floated="right" style={{ padding: 0 }}>
                <Dropdown fluid
                          search
                          dataKey='firstName'
                          selection
                          scrolling
                          options={ props.prepareOptionForFirstAndLastName() }
                          placeholder='Search first/last name'
                          onChange={ props.dropdownOnChange } />
            </Grid.Column>
            <Grid.Column width={3} floated="right" style={{ padding: 0 }}>
                <Dropdown fluid
                          search
                          dataKey='project'
                          selection
                          scrolling
                          options={ props.prepareOptionsForSearch('project') }
                          placeholder='Search project'
                          onChange={ props.dropdownOnChange } />
            </Grid.Column>
            <Grid.Column width={3} floated="right" style={{ padding: 0 }}>
                <SearchDropdown { ...props.getEmployeesSkillsSearchData() } />
            </Grid.Column>
        </Grid.Row>
        <Grid.Row>
            <Grid.Column width={5}>
                <Segment color="blue"
                         className="custom-scroll"
                         style={{ maxHeight: '473px', overflowY: 'scroll' }} >
                    <UserList users={ props.users }
                              onUserClick={ props.onUserClick } />
                </Segment>
            </Grid.Column>
            <Grid.Column width={11}>
                <EmployeesTable { ...props.getEmployeesTableProps() } />
            </Grid.Column>
        </Grid.Row>
    </Grid>
);