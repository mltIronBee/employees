import React, { Component } from 'react';

export class Notification extends Component {

    state = {
        isActive: false,
        color: '',
        message: ''
    };

    show(message, color) {
        this.setState({
            isActive: true,
            message,
            color: this.defineColor(color)
        });

        setTimeout(() => {
            this.setState({ isActive: false })
        }, 3000);
    }

    defineColor(color) {
        switch (color) {
            case 'danger':
                return '#ff6666';

            case 'warning':
                return '#ffbb4d';

            default:
                return '#4ddbff';
        }
    }

    render() {
        return (
                <div className={ `notification${this.state.isActive ? ` active` : ``}` } >
                    <p style={{ color: this.state.color }} >{ this.state.message }</p>
                </div>
            );
    }
}