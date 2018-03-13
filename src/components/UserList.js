import React, { Component } from 'react';
import { List } from 'semantic-ui-react';

export class UserList extends Component {

    state = {
        selectedUserId: ''
    };

    prepareUserItems = (users) => users.map((user, index) => ({
        key: index,
        content: `${user.firstName} ${user.lastName}`,
        onClick: () => {
            this.props.onUserClick(user._id);
            this.setState({ selectedUserId: user._id });
        },
        icon: {
            name: 'user',
            color: this.state.selectedUserId === user._id ? 'blue' : 'grey',
            size: this.state.selectedUserId === user._id ? 'big' : 'large'
        },
        style: {
            padding: '10px',
            cursor: 'pointer',
            transition: 'all .5s'
        }
}));

    componentDidMount() {
        if( this.props.previouslySelectedId ) {
            this.props.onUserClick( this.props.previouslySelectedId );
            this.setState({ selectedUserId: this.props.previouslySelectedId });
        }
    }

    render() {
        return (
            <List divided
                  className='user-list'
                  animated
                  verticalAlign="middle"
                  size="medium"
                  items={ this.prepareUserItems(this.props.users) } />
        );
    }
}