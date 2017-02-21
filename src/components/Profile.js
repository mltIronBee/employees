import React, { Component } from 'react';
import { Grid, Form, Button, Icon, Table, Segment, Image } from 'semantic-ui-react';

export class Profile extends Component {

    state = {
        imageSrc: 'http://lazyadmin.nl/wp-content/plugins/all-in-one-seo-pack/images/default-user-image.png',
        firstName: '',
        lastName: '',
        position: '',
        skills: [],
        readOnly: true,
        newSkill: ''
    };

    componentDidMount() {

        this.setState({
            firstName: 'First',
            lastName: 'Last',
            position: 'HR',
            skills: [],
            validationError: false
        });
    }

    readOnlyFalse = () => {
        this.setState({readOnly: false});
    };

    deleteSkill = (e) => {
        const skills = this.state.skills;
        const index = skills.indexOf(e.target.value);
        skills.splice(index, 1);
        this.setState({skills: skills});
    };

    addSkill = () => {
        if (!this.state.newSkill.length) {
            this.setState({
                validationError: 'Field must be required!'
            });

            setTimeout(() => {
                this.setState({
                    validationError: ''
                });
            }, 3000);

            return;
        }
        this.setState((prevState) => ({
            skills: [...prevState.skills, prevState.newSkill],
            newSkill: ''
        }));
    };
    
    saveData = () => {

    };

    render() {
        return (
            <Grid container centered columns={2}>
                <Grid.Column>
                    <Segment raised style={{marginTop: "40px"}}>
                        <Form>
                            <Grid.Row>
                                <Grid.Column width={1} style={{textAlign: "right"}}>
                                    {
                                        this.state.readOnly
                                            ? <Icon name="large pencil"
                                                    color="blue"
                                                    onClick={this.readOnlyFalse}
                                                    style={{cursor: "pointer"}}/>
                                            : <Button color="blue"
                                                      onClick={this.saveData}>
                                                Save
                                            </Button>
                                    }
                                </Grid.Column>
                            </Grid.Row>
                            <Form.Field>
                                <Image src={this.state.imageSrc}
                                       size='small'
                                       shape='circular'
                                       centered />
                                {
                                    !this.state.readOnly && (
                                        <label style={{ textAlign: "center", cursor: "pointer"}}>
                                            <Icon name="download" /> Download profile image
                                        </label>
                                    )
                                }
                            </Form.Field>
                            {
                                this.state.validationError && (
                                    <Segment inverted color="red" tertiary>
                                        {this.state.validationError}
                                    </Segment>
                                )
                            }
                            <Form.Field>
                                <label>First name</label>
                                <input type='text'
                                       value={this.state.firstName}
                                       disabled={this.state.readOnly}
                                       onChange={(e) => { this.setState({ firstName: e.target.value }) }} />
                            </Form.Field>
                            <Form.Field>
                                <label>Last name</label>
                                <input type='text'
                                       value={this.state.lastName}
                                       disabled={this.state.readOnly}
                                       onChange={(e) => { this.setState({ lastName: e.target.value }) }} />
                            </Form.Field>
                            <Form.Field>
                                <label>Position</label>
                                <input type='text'
                                       value={this.state.position}
                                       disabled={this.state.readOnly}
                                       onChange={(e) => { this.setState({ position: e.target.value }) }} />
                            </Form.Field>
                            <Form.Field>
                                <Table>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.HeaderCell>Skills</Table.HeaderCell>
                                            {
                                                !this.state.readOnly && <Table.HeaderCell />
                                            }
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                    {
                                        this.state.skills.length
                                            ? this.state.skills.map((skill) => (
                                                    <Table.Row>
                                                        <Table.Cell>{skill}</Table.Cell>
                                                        {
                                                            !this.state.readOnly && (
                                                                <Table.Cell>
                                                                    <Icon name="delete"
                                                                          style={{cursor: "pointer"}}
                                                                          onClick={this.deleteSkill} />
                                                                </Table.Cell>
                                                            )
                                                        }
                                                    </Table.Row>
                                                )
                                            )
                                            : (
                                                <Table.Row>
                                                    <Table.Cell>No skills</Table.Cell>
                                                </Table.Row>
                                            )

                                    }
                                    {
                                        !this.state.readOnly && (
                                            <Table.Row>
                                                <Table.Cell>
                                                    <input type="text"
                                                           value={this.state.newSkill}
                                                           onChange={(e) => {
                                                               this.setState({ newSkill: e.target.value });
                                                           }} />
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <Icon name="add"
                                                          style={{cursor: "pointer"}}
                                                          onClick={this.addSkill} />
                                                </Table.Cell>
                                            </Table.Row>
                                        )
                                    }
                                    </Table.Body>
                                </Table>
                            </Form.Field>
                        </Form>
                    </Segment>
                </Grid.Column>
            </Grid>
        )
    }
}