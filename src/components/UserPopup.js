import React from 'react';
import { Popup, Grid, List, Image } from 'semantic-ui-react';

const defaultImageSrc = 'http://lazyadmin.nl/wp-content/plugins/all-in-one-seo-pack/images/default-user-image.png';

export const UserPopup = ({ user, trigger, projects }) => (
    <Popup trigger={ trigger }
           className="user-popup custom-scroll"
           flowing
           hoverable
           inverted >
        <Grid>
            <Grid.Column width={4}>
                <Image src={ user.imageUrl ? user.imageUrl : defaultImageSrc }
                       size="small"
                       floated="left"
                       shape="rounded" />
            </Grid.Column>
            <Grid.Column width={12}>
                <List>
                    <List.Item>
                        <List.Icon name="user"/>
                        <List.Content>{ `${user.firstName} ${user.lastName}` }</List.Content>
                    </List.Item>
                    <List.Item>
                        <List.Icon name="briefcase"/>
                        <List.Content>{ user.position }</List.Content>
                    </List.Item>
                    <List.Item>
                        <List.Icon name="industry"/>
                        <List.Content>{ projects }</List.Content>
                    </List.Item>
                    <List.Item>
                        <List.Icon name="calendar"/>
                        <List.Content>{ user.startedAt }</List.Content>
                    </List.Item>
                </List>
            </Grid.Column>
            <Grid.Column width={16}>
                Skills: { user.skills && user.skills.join(', ') }
            </Grid.Column>
        </Grid>
    </Popup>
);