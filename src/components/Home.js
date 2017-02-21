import React, { Component } from 'react';


export class Home extends Component {

    state = {
        employees: [
            {
                _id: 1,
                fistName: 'Afss',
                lastName: 'ADfsgs',
                position: 'Hghgh',
                startedAt: '2017/02/20'
            },
            {
                _id: 2,
                fistName: 'Fgssg',
                lastName: 'AFsgs',
                position: 'Hghgh',
                startedAt: '2017/02/20'
            },
            {
                _id: 3,
                fistName: 'AFgsg',
                lastName: 'Ahjhjaf',
                position: 'Hghgh',
                startedAt: '2017/02/20'
            }
        ]
    };

    render() {
        return (
            <div className="authorization">

            </div>
        );
    }
}