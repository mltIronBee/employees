import React from 'react';
import { Link } from 'react-router';
import { Grid, Table, Dropdown, Button } from 'semantic-ui-react';
import { DeleteEmployeeModal } from './DeleteEmployeeModal';

export const Home = (props) => (
    <Grid container>
        <DeleteEmployeeModal isModalOpened={ props.isModalOpened }
                             onModalClose={ props.onModalClose }
                             onEmployeeDelete={ props.onEmployeeDelete } />
        <Grid.Row>
            <Grid.Column width={8} floated="right">
                <Dropdown fluid
                          multiple
                          search
                          selection
                          options={ props.dropdownOptions }
                          placeholder="Search parameters"
                          style={{ marginTop: '40px' }}
                          onChange={ props.onDropdownChange } />
            </Grid.Column>
        </Grid.Row>
        <Grid.Row>
            <Grid.Column>
                <Link to="profile/create">
                    <Button floated="right" color="blue" style={{ margin: '20px 0' }}>
                        Add new employee
                    </Button>
                </Link>
                <Table singleLine
                       color="blue"
                       headerRow={ props.headerRow }
                       renderBodyRow={ props.renderBodyRow }
                       tableData={ props.tableData } />
            </Grid.Column>
        </Grid.Row>
    </Grid>
);