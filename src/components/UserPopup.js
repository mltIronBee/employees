import React from 'react';
import { Popup, List, Image } from 'semantic-ui-react';

const defaultImageSrc = 'http://lazyadmin.nl/wp-content/plugins/all-in-one-seo-pack/images/default-user-image.png';

export const UserPopup = ({ user, trigger }) => (
    <Popup trigger={ trigger }
           flowing
           inverted
           style={{ opacity: 0.9 }}>
        <Image src={ user.imageUrl ? user.imageUrl : defaultImageSrc }
               centered
               size="small"
               shape="rounded" />
        <List style={{ maxWidth: '180px' }}>
            <List.Item>
                <List.Icon name="user"/>
                <List.Content>{ `${user.firstName} ${user.lastName}` }</List.Content>
            </List.Item>
            <List.Item>
                <List.Icon name="briefcase"/>
                <List.Content>{ user.position }</List.Content>
            </List.Item>
            <List.Item>
                <List.Icon name="calendar"/>
                <List.Content>{ user.startedAt }</List.Content>
            </List.Item>
            <List.Item>
                <List.Icon name="keyboard"/>
                <List.Content>{ user.skills.join(', ') }</List.Content>
            </List.Item>
        </List>
    </Popup>
);