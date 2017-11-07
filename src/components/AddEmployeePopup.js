import React, { Component } from 'react';
import { Popup, Grid, Dropdown, Button } from 'semantic-ui-react';

export class AddEmployeePopup extends Component {
    state = {
        selectedEmployees: []
    };

    selectingEmployees = (e, { value }) => {
        this.setState({ selectedEmployees: value });
    };

    addEmployeesToTable = () => {
        this.props.addEmployees(this.state.selectedEmployees);
    };

    close = e => {
        if(e.target.name === 'addEmployeesButton') {
            this.setState({selectedEmployees: []});
            this.props.setPopupState(false);
        }
    };

    render() {
        return (
            <Popup
                on='click'
                positioning='bottom left'
                className='add-employee-popup'
                trigger={this.props.trigger}
                onClick={this.close}
                open={this.props.popupIsOpen}
                closeOnDocumentClick={false}>
                <Grid>
                    <Grid.Column width={16}>
                        <Dropdown fluid
                                  style={{marginBottom: '10px'}}
                                  search
                                  selection
                                  multiple
                                  scrolling
                                  placeholder='Select employees'
                                  onChange={ this.selectingEmployees }
                                  options={this.props.employees}/>
                        <Button inverted
                                style={{width: '100%'}}
                                name='addEmployeesButton'
                                color='green'
                                disabled={ !this.state.selectedEmployees.length }
                                onClick={ this.addEmployeesToTable } >
                            Add to project
                        </Button>
                    </Grid.Column>
                </Grid>
        </Popup>
        )
    }
}
