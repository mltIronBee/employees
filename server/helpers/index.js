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
	//Stuff to save 'skip' keyword from deleting
	let uniqBreaker = 0;
	//Alright, this thing requires some explanations. We need to build array
	//of key dates of all projects. Those key dates are projects start date and finish date
	//We put them together in one array, sort them (ascending) and filter from duplicates
	//The idea of startOf('day') and endOf('day') is that project always starts at 00:00 and
	//finished at 23:59, because we have flexible work schedule and precise man-hours cannot
	//be calculated without additional info, which is hard to maintain. Thus between project start
	//and project finish is minimum 1 day, and calculations have acceptable accuracy
	const breakpoints = employeeCurrentProjects.map(projects =>
		_.sortedUniqBy(
			excludeWeekends(
				_.dropWhile(
					//TODO: instead of project.startDate insert day, when employee started working on this project
					//TODO: if employee stopped working on project prematurely, filter all breakpoints after it's date
					[moment(project.startDate).startOf('day'), moment(date).endOf('day'),
					...projects.reduce( (prevProject, curProject) => {
						return curProject.finishDate
						? prevProject.concat([moment(curProject.startDate).startOf('day'), moment(curProject.finishDate).endOf('day')])
						: prevProject.concat([moment(curProject.startDate).startOf('day')])
						}, [])]
					.sort( (a, b) => b.isSameOrBefore(a) ? 1 : -1 ),
					(val) => val.isBefore(moment(project.startDate).startOf('day'))
				))
		, item => item !== 'skip' ? moment(item).format() : ++uniqBreaker)
	);
	let totalWorkHours, divider, hoursPerProject, details;
	const obj = {};

	//Later, we inspect pairs of consecutive breakpoints and check how any projects were active
	//in that period of time. Each active project increases divider by 1
	const summary = employeeCurrentProjects.map( (projects, i) => {
		obj.employeeName = `${employees[i].firstName} ${employees[i].lastName}`
		totalWorkHours=0;
		details = [];

		for( let j = 0; j < breakpoints[i].length - 1; j++) {
			//This is mess. j++ inside next statement doesn't do anything, so  we have this
			if( breakpoints[i][j] === 'skip' )
				continue;

			if( breakpoints[i][j+1] === 'skip' ) {
				details.push({
					leftDate: moment(breakpoints[i][j]).add(1, 'ms').format('YYYY-MM-DD'),
					rightDate: 'skip',
					totalWorkHours: 0,
					hoursPerProject: 0
				});
				continue;
			}

			divider = 1;
			let daysBetween = Math.round(breakpoints[i][j+1].diff(breakpoints[i][j], 'days', true));
			projects.forEach( proj => {
				projectIsActive(proj, breakpoints[i][j], breakpoints[i][j+1]) && divider++
			})
			totalWorkHours += daysBetween * SINGLE_PROJECT_WORKHOURS/divider;
			details.push({
				leftDate: moment(breakpoints[i][j]).add(1, 'ms').format('YYYY-MM-DD'), 
				rightDate: moment(breakpoints[i][j+1]).add(1, 'ms').format('YYYY-MM-DD'),
				totalWorkHours: prettyPrintDecimals(totalWorkHours), 
				hoursPerProject: prettyPrintDecimals(SINGLE_PROJECT_WORKHOURS/divider)
			})
		}
		obj.totalWorkHours = prettyPrintDecimals(totalWorkHours);
		obj.details = details;
		hoursPerProject = SINGLE_PROJECT_WORKHOURS/employees[i].projects.length;
		if(!project.finishDate)
			obj.hoursPerProject = prettyPrintDecimals(hoursPerProject);

		return Object.assign({}, obj);
	})

	return summary;
}

const includesWeekend = (left, right) => 
	left.isoWeek() !== right.isoWeek() || right.isoWeekday() >= 6

const excludeWeekends = dates => {
	//if there was no weekends just return original value
	if( !includesWeekend(dates[0], dates[dates.length-1]) )
		return dates;
	
	return dates.reduce( (acc, next) => {
		//Round anything, that lands on weekend to monday, thus, if someone for some reason start and finish project on weekend
		//it'll last 0 days long and shouldn't be accounted anywhere
		const curDate = acc[acc.length-1];
		const nextDate = next.isoWeekday() < 6 ? next : moment(next).isoWeekday(8).startOf('day');

		if( !curDate || !includesWeekend(curDate, nextDate) )
			return acc.concat(nextDate);
		
		let temp = curDate.isoWeekday() < 6 ? curDate : moment(curDate).isoWeekday(8).startOf('day');
		const toInsert = [];
		//inserting fridays and mondayls 'till we get rid of all weekends. Last date should alsways
		//be working day
		while( temp.isoWeek() !== nextDate.isoWeek() ) {
			toInsert.push( moment(temp).isoWeekday(5).endOf('day'), 'skip', moment(temp).isoWeekday(8).startOf('day') );
			temp = moment(temp).isoWeekday(8).startOf('day');
		}


		return acc.concat(toInsert, nextDate);
	}, []);
}

const prettyPrintDecimals = value =>
	Math.trunc(value) === value ? value : +value.toFixed(2)

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
