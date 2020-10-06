import React from 'react';
import { connect } from 'react-redux';
import * as actions from './redux/actions';
import './App.css';

class App extends React.Component {
	constructor(props) {
		super(props);
		this.dragStartBoundary = this.dragStartBoundary.bind(this);
		this.dragEndBoundary = this.dragEndBoundary.bind(this);
		this.drawBoundary = this.drawBoundary.bind(this);
		this.saveAnnotations = this.saveAnnotations.bind(this);
		this.clearAnnotations = this.clearAnnotations.bind(this);
		this.state = this.getStateFromProps(this.props);
	}

	/* Life cycle methods */

	componentWillReceiveProps(nextProps) {
		this.setState(this.getStateFromProps(nextProps.data),
		() => {
			if(Object.keys(this.state.endBoundary).length > 0) {
				this.drawBoundary();
			}
			if(this.state.cells.length > 0) this.drawAllCells();
		});
		
	}

	getStateFromProps(props) {
		return {
			tableDrawn: false,
			startBoundary: props.startBoundary || {},
			endBoundary: props.endBoundary || {},
			startCell: props.startCell || {},
			endCell: props.endCell || {},
			cells: props.cells || [],
			intersection:props.intersection || [],
			mouseDown: false
		}
	}

	componentDidMount() {
		/* Retrieve the saved annotation */
		this.props.getData();
	}

	/* For drawing boundary */
	dragStartBoundary(event) {
		/* Save start coordinates for boundary */
		let x = event.clientX;
		let y = event.clientY;
		this.setState({
			mouseDown: true,
			startBoundary : {
				x, y
			},
		});
	}

	dragEndBoundary(event) {
		/* Save end coordinates for boundary */
		if(this.state.mouseDown) {
			let x = event.clientX;
			let y = event.clientY;
			this.setState({
				mouseDown: false,
				endBoundary : {
					x, y
				},
			}, () => {
				this.drawBoundary();
			});
		}
	}

	drawOutline(e) {
		/* Mark outline while drawing boundary */
		if(!this.state.mouseDown) return;
		let table = document.getElementById('table');
		if (!this.state.tableDrawn && this.state.mouseDown) {
			let finX = e.clientX;
			let finY = e.clientY;
			table.style.width = finX - this.state.startBoundary.x;
			table.style.height = (finY - this.state.startBoundary.y);
			table.style.position = "absolute";
			table.style.display = "block";
			table.style.width =  (finX - this.state.startBoundary.x) + 'px';
			table.style.height =  (finY - this.state.startBoundary.y) + 'px';
			table.style.left = this.state.startBoundary.x+'px';
			table.style.top = this.state.startBoundary.y+'px';
			table.style.display =  'block';
			table.style.border =  '2px dashed #ccc';
		};
	}

	drawBoundary() {
		/* Draw boundary */
		if(this.state.tableDrawn) {
			return;
		}
		let d = document.getElementById('table');
		d.style.position = "absolute";
		let { startBoundary, endBoundary } = this.state;
		d.style.left = startBoundary.x < endBoundary.x ? startBoundary.x+'px' : endBoundary.x+'px';
		d.style.top = startBoundary.y < endBoundary.y ? startBoundary.y+'px' : endBoundary.y+'px';
		d.style.display = 'block';
		d.style.border =  '3px solid red';
		d.style.width = startBoundary.x > endBoundary.x ?  (startBoundary.x - endBoundary.x) +'px' : (endBoundary.x - startBoundary.x) +'px';
		d.style.height = startBoundary.y > endBoundary.y ?  (startBoundary.y - endBoundary.y) +'px' : (endBoundary.y - startBoundary.y) +'px';
		this.setState({
			tableDrawn: true,
		});
	}

	/* For drawing rows and column */
	startCell(event) {
		let x = event.clientX;
		let y = event.clientY;
		this.setState({
			startCell : {
				x, y
			},
		});
		event.stopPropagation();
	}

	endCell(event) {
		if(this.state.tableDrawn) {
			let x = event.clientX;
			let y = event.clientY;
			this.setState({
				endCell: {
					x, y,
				},
			}, () => {
				this.addCells();
				this.drawCell();
			});
		}
	}

	drawAllCells() {
		/* Draw saved rows and column */
		this.state.cells.forEach(item => {
			this.drawCell(item.startCell, item.endCell);
		})
	}

	drawCell(a = this.state.startCell, b = this.state.endCell) {
		if(this.state.tableDrawn || a) {
			let d = document.createElement('div');
			let table = document.getElementById('table');
			let start = {}, end = {}, line = '', dataAttr;

			// style
			d.setAttribute("class", "cell");
			d.style.position = "absolute";
			d.style.display = 'block';

			
			if (a.x < b.x) {
				start = a;
				end = b;
			} else {
				start = b;
				end = a;
			}

			function yAxisDifference () {
				if (end.y - start.y < 0) {
					return (start.y - end.y);
				} else {
					return (end.y - start.y);
				}
			}

			if (yAxisDifference() > (end.x - start.x)) {
				dataAttr = a.x - this.state.startBoundary.x;
				d.style.left = dataAttr+'px';
				d.style.width = '0';
				d.style.height = '100%';
				d.style.top = '0';
				line =  "column";
				d.setAttribute("class", line);
				d.setAttribute('data-coord-x', dataAttr);
			} else {
				dataAttr = a.y - this.state.startBoundary.y;
				d.style.top = dataAttr+'px';
				d.style.width = '100%';
				d.style.height = '0';
				d.style.left = '0';
				line = 'row';
				d.setAttribute("class", line);
				d.setAttribute('data-coord-y', dataAttr);
			}
			this.calculateCoords(line, dataAttr);
			table.appendChild(d);
		}
	}

	addCells() {
		/* Save all rows and columns' co-ordinates */
		let cells = this.state.cells;
		cells.push({
			startCell: this.state.startCell,
			endCell: this.state.endCell,
		});
		this.setState({
			cells,
		})
	}

	calculateCoords(line, myCoord) {
		/* Save all cells' co-ordinates */
		const table = document.getElementById('table')
		let checkFor = line === 'row' ? 'column' : 'row';
		let list = table.querySelectorAll(`.${checkFor}`);
		let intersection = this.state.intersection;
		let coordinates = line === 'row' ? 'x' : 'y';
		if (list.length > 0) {
			list.forEach(item => {
				let point = item.getAttribute(`data-coord-${coordinates}`);
				let intersectionPoint = line === 'row' ? `(${myCoord},${point})` : `(${point},${myCoord})`;
				if (!intersection.includes(intersectionPoint)) 
					intersection.push(intersectionPoint);
			});
		}
		this.setState({
			intersection,
		});
	}

	saveAnnotations() {
		/* Save the annotation */
		this.props.save(this.state);
	}

	clearAnnotations() {
		/* Clear the annotation */
		this.setState(this.getStateFromProps({}));
		document.getElementById('table').style = {};
		document.getElementById('table').innerHTML = '';
		this.props.clear(this.state);
	}

	/* onFileChange(e) {
		var reader = new FileReader();
		reader.onload = function (e) {
			document.getElementById('img').src = e.target.result;
		};
		reader.readAsDataURL(e.target.files[0]);
	} */

	render() {
		return (
			<div>
				<div className="header">
					<h1>Annotation Tool</h1>
				</div>
				<div className="img-container" 
					onMouseDown={(event) => this.dragStartBoundary(event)} 
					onMouseUp={(event) =>{ this.dragEndBoundary(event);}} 
					onMouseMove={(e) => this.drawOutline(e)}  
					draggable={false}>
						
					<img src="table-given.png" className="img" id="img" alt="table" draggable={false} />
					<div id="table"
						onMouseDown={(event) => this.startCell(event)} 
						onMouseUp={(event) => this.endCell(event)}>
					</div>
				</div>
				<div className="buttons">
					{/* <label className="custom-file-upload button">
						<input type="file" onChange={(e) => this.onFileChange(e)} /> 
						Upload File
					</label> */}
					
					<button className="button" onClick={this.saveAnnotations}>Save</button>
					<button className="button" onClick={this.clearAnnotations}>Clear</button>
				</div>
			</div>
		);
	}
}

const mapStateToProps = (state, props) => ({
	data: state,
});

const mapDispatchToProps = dispatch => ({
	clear: () => {
		dispatch(actions.saveData({}));
	},
	save: (value) => {
        dispatch(actions.saveData(value));
	},
	getData: () => {
		dispatch(actions.getData());
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(App);

