import React from 'react';
import { Grid, Table, Dropdown } from 'semantic-ui-react';
import { DeleteEmployeeModal } from './DeleteEmployeeModal';

export const EmployeesTable = (props) => (
    <Grid>
        <DeleteEmployeeModal isModalOpened={ props.isModalOpened }
                             onModalClose={ props.onModalClose }
                             onEmployeeDelete={ props.onEmployeeDelete } />
        <Grid.Column width={8} floated="right">
            <Dropdown fluid
                      multiple
                      search
                      selection
                      options={ props.dropdownOptions }
                      placeholder="Search parameters"
                      onChange={ props.onDropdownChange } />
        </Grid.Column>
        <Grid.Column width={16}>
            <Table singleLine
                   style={{ marginTop: '20px' }}
                   color="blue"
                   headerRow={ props.headerRow }
                   renderBodyRow={ props.renderBodyRow }
                   tableData={ props.tableData } />
        </Grid.Column>
    </Grid>
);