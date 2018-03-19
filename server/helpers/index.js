import _ from 'lodash';
import moment from 'moment';

const SINGLE_PROJECT_WORKHOURS = 8;

export const calculateProjectSummary = (project, employees, date) => {
	const projectId = String(project._id);
	//uniqBy for case, if somehow database was messed up and employee have duplicating project
	//in projectsHistory
	const employeeCurrentProjects = employees.map(employee => {
		return _.uniqBy(
			employee.projectsHistory.filter(proj => 
				String(proj._id) !== projectId &&
				!!project.startDate && !!proj.startDate
				&& (project.finishDate && project.finishDate.getTime() > date.getTime() 
					|| !project.finishDate && proj.startDate.getTime() < date.getTime()
					|| proj.finishDate && proj.finishDate.getTime() >= project.startDate.getTime()))
		, '_id')
	});
	//Alright, this thing requires some explanations. We need to build array
	//of key dates of all projects. Those key dates are projects start date and finish date
	//We put them together in one array, sort them (ascending) and filter from duplicates
	const breakpoints = employeeCurrentProjects.map(projects =>
		_.sortedUniqBy(
			_.dropWhile(
				[moment(project.startDate).startOf('day'), moment(date).endOf('day'),
				...projects.reduce( (prevProject, curProject) => {
					return curProject.finishDate
					? prevProject.concat([moment(curProject.startDate).startOf('day'), moment(curProject.finishDate).endOf('day')])
					: prevProject.concat([moment(curProject.startDate).startOf('day')])
					}, [])]
				.sort( (a, b) => b.isSameOrBefore(a) ? 1 : -1 ),
				(val) => val.isBefore(moment(project.startDate).startOf('day'))
			)
		, item => item.format())
	);
	let totalWorkHours, divider, hoursPerProject;
	const obj = {};
	//Later, we inspect pairs of consecutive breakpoints and check how any projects were active
	//in that period of time. Each active project increases divider by 1
	const summary = employeeCurrentProjects.map( (projects, i) => {
		totalWorkHours=0;
		for( let j = 0; j < breakpoints[i].length - 1; j++) {
			divider = 1;
			let daysBetween = Math.round(breakpoints[i][j+1].diff(breakpoints[i][j], 'days', true));
			projects.forEach( proj => {
				projectIsActive(proj, breakpoints[i][j], breakpoints[i][j+1]) && divider++
			})
			totalWorkHours += daysBetween * SINGLE_PROJECT_WORKHOURS/divider;
		}
		obj.totalWorkHours = prettyPrintDecimals(totalWorkHours);
		hoursPerProject = SINGLE_PROJECT_WORKHOURS/employees[i].projects.length;
		if(!project.finishDate)
			obj.hoursPerProject = `${prettyPrintDecimals(hoursPerProject)} hours/day`;

		return Object.assign({}, obj);
	})

	return summary;
}

const prettyPrintDecimals = value =>
	Math.trunc(value) === value ? value : value.toFixed(2)

//Function to check project status between given period of time
//(from left to right). Project is active if it's started earlier (or
//simultaneously) than left and finished before (or simultaneously) than right.
//Also we check that finish date is later, than left, so it won't count as active,
//if it was finished at the same date, as current project started.
//Project is also active, if it have been started before left and did not finished
const projectIsActive = (project, left, right) => {
	const startDate = moment(project.startDate).startOf('day');
	const finishDate = !!project.finishDate ? moment(project.finishDate).endOf('day') : false;
	
	return startDate.isSameOrBefore(left)
	? finishDate && finishDate.isSameOrAfter(right)
	  && finishDate.isAfter(left) || !finishDate
	: false
}
