import React from 'react';
import { List } from 'semantic-ui-react';

export const UserList = (props) => {
    return (
        <List divided
              animated
              verticalAlign="middle"
              size="big"
              items={ props.userItems }/>
    );
};