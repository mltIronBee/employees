import React from 'react';
import { Popup, Grid, Dropdown, Button } from 'semantic-ui-react';
import { AddEmployeePopup } from './AddEmployeePopup';

//It's maybe confusing, that functions and state named as Employees
//but it's a needed step in order to avoid unnecessary code duplication

export default class AddPMPopup extends AddEmployeePopup {
	close = e => {
        if(e.target.name === 'addPMButton') {
            this.setState({selectedEmployees: []});
            this.props.setPopupState(0);
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
                                  placeholder='Select project managers'
                                  onChange={ this.selectingEmployees }
                                  options={this.props.employees}/>
                        <Button inverted
                                style={{width: '100%'}}
                                name='addPMButton'
                                color='green'
                                disabled={ !this.state.selectedEmployees.length }
                                onClick={ this.addEmployeesToTable } >
                            Add to project
                        </Button>
                    </Grid.Column>
                </Grid>
        	</Popup>
		);
	}
}