import React from 'react';
import { Table } from 'semantic-ui-react';

const ProjectSmallTable = (props) => {
	const { startDate, finishDate, tableHeaders, tableBody, tableFooters, bodyFallback } = props;
	
	return (
		<div className={tableBody.length > 10 ? 'table-body-projects' : ''} >
			<Table  singleLine
			compact
			fixed
			size='small'
			color='blue'>
				{ tableHeaders.length &&
					<Table.Header>
						<Table.Row>
							{ tableHeaders.map( (header, index) =>
								<Table.HeaderCell key={index}>{header}</Table.HeaderCell>
							)}
						</Table.Row>
					</Table.Header>
				}
				<Table.Body>
					{ tableBody.length
						? tableBody.map( (row, index) =>
							<Table.Row key={index}>
								<Table.Cell width={2}>{index+1}</Table.Cell>
								{ row.map( (cell, j)  =>
									<Table.Cell 
										key={j}
										width={cell.width} >
										{cell.item}
									</Table.Cell>)
								}
							</Table.Row>)
						: <Table.Row>
							<Table.Cell>{bodyFallback}</Table.Cell>	
						</Table.Row>
					}
				</Table.Body>
				<Table.Footer fullWidth>
					{ tableFooters.length &&
						<Table.Row>
							{ tableFooters.map( (item, index) => 
								<Table.HeaderCell key={index}>
									{item}
								</Table.HeaderCell>
							)}
						</Table.Row>
					}
				</Table.Footer>
			</Table>
		</div>
	);
};

export default ProjectSmallTable;