import React from 'react';
import { Link } from 'react-router';
import { Grid, Button } from 'semantic-ui-react';
import { EmployeesTable } from './EmployeesTable';

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
            <Grid.Column width={16}>
                <EmployeesTable { ...props.getEmployeesTableProps() } />
            </Grid.Column>
        </Grid.Row>
    </Grid>
);