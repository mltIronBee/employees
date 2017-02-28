import React from 'react';
import { Modal, Header, Button } from 'semantic-ui-react';

export const DeleteEmployeeModal = (props) => (
    <Modal basic
           open={ props.isModalOpened }
           size="small">
        <Header icon="user delete" content="Deleting" color="red" />
        <Modal.Content>
            <h3>Are you sure you want to delete an employee?</h3>
        </Modal.Content>
        <Modal.Actions>
            <Button basic
                    inverted
                    onClick={ props.onModalClose }>
                No
            </Button>
            <Button color='red'
                    basic
                    inverted
                    onClick={ props.onEmployeeDelete }>
                Yes</Button>
        </Modal.Actions>
    </Modal>
);