import React from 'react';
import { Modal, Header, Button } from 'semantic-ui-react';

export const DeleteEmployeeModal = props => (
    <Modal basic
           open={ props.isModalOpened }
           size="small">
        <Header icon="trash" content="Deleting" color="red" />
        <Modal.Content>
            <h3>{`Are you sure you want to delete ${ props.entity }?`}</h3>
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
                    onClick={ props.onDelete }>
                Yes</Button>
        </Modal.Actions>
    </Modal>
);