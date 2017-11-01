import React, { Component }  from 'react';
import moment from 'moment';
import { Table, Grid, Button, Icon, Dropdown, Menu } from 'semantic-ui-react';
import { Link } from 'react-router';
import http from '../helpers/http';
import { apiPrefix } from '../../config';
import { DeleteEmployeeModal } from './DeleteEmployeeModal';

export class ProjectTable extends Component {
    state = {
        projects: [],
        isModalOpened: false,
        currentProjectId: '',
        currentPage: 0,
        fieldsPerPage: +localStorage.getItem('fieldsPerPage') || 10
    };

    dropdownOptions = [
        {
            text: '5',
            value: 5
        },
        {
            text: '10',
            value: 10
        },
        {
            text: '15',
            value: 15
        },
        {
            text: '20',
            value: 20
        },
        {
            text: '25',
            value: 25
        },
        {
            text: '30',
            value: 30
        },
        {
            text: '40',
            value: 40
        },
        {
            text: '50',
            value: 50
        }
    ];


    componentDidMount() {
        this.props.isAdmin && this.initializeData();
        document.addEventListener('keyup', this.onModalActions)
    }

    componentWillReceiveProps(nextProps) {
        nextProps.isAdmin && this.initializeData();
    }

    initializeData = () => {
        return http.get(`${apiPrefix}/projects`)
                .then(({data}) => this.setState({ projects: data }))
                .catch(console.log)
    };

    startProject = projectId => {
        const obj = {
            _id: projectId,
            startDate: new Date()
        };

        return http.post(`${apiPrefix}/project/update`, obj)
                .then(res =>
                    this.setState(prevState => ({
                        projects:
                            prevState.projects.map(project => project._id === obj._id
                                ? Object.assign({}, project, { startDate: obj.startDate })
                                : project)
                    }))
                )
                .catch(console.log)
    };

    onModalClose = () => this.setState({ isModalOpened: false });

    onProjectDelete = () => {
        const id = this.state.currentProjectId;
        return http.post(`${apiPrefix}/project/delete`, { id })
                .then(({data}) =>
                    this.setState(prevState => ({
                        projects: prevState.projects.filter(project => project._id !== id),
                        isModalOpened: false
                    }))
                )
                .catch(console.log)
    };

    onModalActions = ({which}) => {
        which === 13 && this.state.isModalOpened
            ? this.onProjectDelete(this.state.currentProjectId)
            : (which === 27 && this.state.isModalOpened) && this.setState({ isModalOpened: false });
    };

    onPaginationNumberChange = (e, { value }) => {
        localStorage.setItem('fieldsPerPage', value);
        this.setState(prevState => ({
            fieldsPerPage: value
        }));
    };

    onPaginationPrev = () => {
        if(this.state.currentPage !== 0) {
            this.setState(prevState => ({
                currentPage: prevState.currentPage - 1
            }))
        }
    };

    onPaginationChange = (page) => {
        this.setState({ currentPage: page });
    };

    onPaginationNext = () => {
        if(this.state.currentPage < this.getPageAmount() - 1) {
            this.setState(prevState => ({
                currentPage: prevState.currentPage + 1
            }))
        }
    };

    getPageAmount = () => Math.ceil(this.state.projects.length / this.state.fieldsPerPage);

    getPageArray = () => {
        const pageAmount = this.getPageAmount();
        const pages = [];

        for(let i = 0; i < pageAmount; i++) {
            pages.push(i);
        }

        return pages;
    };


    getProjectsHeaderRowForTable = ['#', 'Project name', 'Start Date', 'Start Project', 'Actions'];

    getProjectsTableData = projects => {
        return projects.length
            ? projects.map((project, index) => ({
                index: index + 1,
                name: project.name,
                startDate: project.startDate ? moment(project.startDate).format('YYYY-MM-DD') : '',
                startProject: (
                    <Table.Cell key={ index + 4 }>
                        <Button color={!!project.startDate ? 'blue' : 'green'}
                                style={{width: '90px'}}
                                inverted
                                content={!!project.startDate ? 'Started' : 'Start'}
                                disabled={!!project.startDate}
                                onClick={ () => this.startProject(project._id) }/>
                    </Table.Cell>
                ),
                actions: (
                    <Table.Cell key={ index + 5 }>
                        <Link to={{ pathname: '/project', query: { id: project._id } }}>
                            <Icon name="edit"
                                  size="large"
                                  link color="blue" />
                        </Link>
                        <Icon name="delete"
                              size="large"
                              link
                              color="red"
                              onClick={ () => { this.setState({ isModalOpened: true, currentProjectId: project._id })} } />
                    </Table.Cell>
                )
            }))
            : [{ index: 'No projects yet' }]
    };

    renderProjectsTable = ({ index, name, startDate, startProject, actions }) => ({
        key: index,
        cells: [
            index,
            name,
            startDate,
            startProject,
            actions
        ]
    });

    getFooterRow = (
        <Table.Row>
            <Table.HeaderCell colSpan="7">
                <Dropdown placeholder="Per page"
                selection
                value={ this.state.fieldsPerPage }
                options={ this.dropdownOptions }
                onChange={ this.onPaginationNumberChange }/>
                <Menu floated="right" pagination>
                    <Menu.Item icon onClick={ this.onPaginationPrev }>
                        <Icon name="left chevron" />
                    </Menu.Item>
                    {
                        this.getPageArray().map(pageNumber => (
                            <Menu.Item key={ pageNumber }
                                       active={ pageNumber === this.state.currentPage }
                                       onClick={() => {
                                           this.onPaginationChange(pageNumber);
                                       }}>
                                { pageNumber + 1 }
                            </Menu.Item>
                        ))
                    }
                    <Menu.Item icon onClick={ this.onPaginationNext }>
                        <Icon name="right chevron" />
                    </Menu.Item >
                </Menu>
            </Table.HeaderCell>
        </Table.Row>
    );

    paginate = array => {
        const startIndex = this.state.currentPage === 0 ? 0 : this.state.currentPage * this.state.fieldsPerPage;
        const endIndex = startIndex + this.state.fieldsPerPage;

        return array.slice(startIndex, endIndex);
    };

    componentWillUnmount() {
        document.removeEventListener('keyup', this.onModalActions);
    }

    render() {
        return <Grid container>
            <Grid.Row>
                <Grid.Column width={6} floated='right'>
                    <Link to="project/create">
                        <Button floated="right" color="blue" style={{ marginTop: '40px' }}>
                            Add new project
                        </Button>
                    </Link>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row>
                <DeleteEmployeeModal isModalOpened={ this.state.isModalOpened }
                                     onModalClose={ this.onModalClose }
                                     onDelete={ this.onProjectDelete }
                                     entity='project'/>
                <Grid.Column width={16}>
                    <Table singleLine
                           compact
                           color="blue"
                           headerRow={ this.getProjectsHeaderRowForTable }
                           footerRow={ this.getFooterRow }
                           tableData={ this.getProjectsTableData(this.paginate(this.state.projects)) }
                           renderBodyRow={ this.renderProjectsTable }
                    />
                </Grid.Column>
            </Grid.Row>
        </Grid>
    }
}
