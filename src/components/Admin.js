import React from 'react';
import { Grid, Segment } from 'semantic-ui-react';
import { EmployeesTable } from './EmployeesTable';
import { SearchDropdown } from './SearchDropdown';
import { UserList } from './UserList';

export const Admin = (props) => {

    const userItems = [
        {key: '0', icon: { name: 'user', color: 'grey' }, content: 'name1'},
        {key: '1', icon: { name: 'user', color: 'grey' }, content: 'name1'},
        {key: '3', icon: { name: 'user', color: 'grey' }, content: 'name1'},
        {key: '4', icon: { name: 'user', color: 'grey' }, content: 'name1'},
        {key: 'sd', icon: { name: 'user', color: 'grey' }, content: 'name1'},
        {key: 'sdf', icon: { name: 'user', color: 'grey' }, content: 'name1'},
        {key: 'dfg', icon: { name: 'user', color: 'grey' }, content: 'name1'},
        {key: 'sfdf', icon: { name: 'user', color: 'grey' }, content: 'name1'},
        {key: 'ghjk', icon: { name: 'user', color: 'grey' }, content: 'name1'},
        {key: 'jvbnm', icon: { name: 'user', color: 'grey' }, content: 'name1'},
        {key: 'cvbnm', icon: { name: 'user', color: 'grey' }, content: 'name1'},
        {key: 'y;', icon: { name: 'user', color: 'grey' }, content: 'name1'},
        {key: 'vbn', icon: { name: 'user', color: 'grey' }, content: 'name1'},
        {key: 'lk', icon: { name: 'user', color: 'grey' }, content: 'name1'},
    ];
    const tableStyles = {
        height: '400px',
        overflowY: 'scroll'
    };

    return (
        <Grid container>
            <Grid.Row>
                <Grid.Column width={8} floated="right">
                    <SearchDropdown { ...props.getEmployeesSkillsSearchData()}/>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row style={{ marginTop: '30px' }}>
                <Grid.Column width={5}>
                    <Segment color="blue"
                             className="custom-scroll"
                             style={{ height: '400px'}}>
                        <UserList userItems={userItems} />
                    </Segment>
                </Grid.Column>
                <Grid.Column width={11}>
                    <EmployeesTable { ...props.getEmployeesTableProps()} tableStyles={tableStyles} />
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );
};