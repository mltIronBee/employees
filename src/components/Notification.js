import React, { Component } from 'react';
import { Icon} from 'semantic-ui-react';

export class Notification extends Component {

    state = {
        isActive: true
    };

    render() {
        return this.state.isActive && (
                <div className="notification">
                    <p>{ this.props.message }</p>
                </div>
            );
    }
}