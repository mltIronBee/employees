import React from 'react';
import { Dimmer, Loader } from 'semantic-ui-react';

export const LoaderComponent = props => (
    <Dimmer active={ props.loaderActive }>
        <Loader>Loading</Loader>
    </Dimmer>
);
