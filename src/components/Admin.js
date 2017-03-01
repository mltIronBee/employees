import React from 'react';
import { Grid, Segment } from 'semantic-ui-react';
import { EmployeesTable } from './EmployeesTable';
import { SearchDropdown } from './SearchDropdown';
import { UserList } from './UserList';

export const Admin = (props) => {

    const tableStyles = {
        height: '400px',
        overflowY: 'scroll'
    };

    return (
        <Grid container>
            <Grid.Row style={{ marginTop: '50px' }}>
                <Grid.Column width={8} floated="right">
                    <SearchDropdown { ...props.getEmployeesSkillsSearchData() } />
                </Grid.Column>
            </Grid.Row>
            <Grid.Row>
                <Grid.Column width={5}>
                    <Segment color="blue"
                             className="custom-scroll"
                             style={{ maxHeight: '400px', overflowY: 'scroll' }} >
                        <UserList users={ props.users }
                                  onUserClick={ props.onUserClick } />
                    </Segment>
                </Grid.Column>
                <Grid.Column width={11}>
                    <EmployeesTable { ...props.getEmployeesTableProps() } tableStyles={ tableStyles } />
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );
};