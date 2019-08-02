/*
  Grid is a component that is fed data of a schedule from GridContainer to build a
  grid with ReactDataGrid. Grid contains functions to manipulate gridData and give 
  visual feedback. It also is a mid point for contact between GridContainer.js functions and 
  the component within Grid CustomToolbar.js buttons.

  Grid is created given an array of columns and array of rows
  column = { key:"column1Key", name:"column1" }
  row = { column1Key:"cellText", column2Key:"cellText", column3Key:"cellText" }
*/

import React from "react";
import ReactDataGrid from "react-data-grid";
import update from "immutability-helper";
import { Data, Filters } from "react-data-grid-addons";
import PropTypes from 'prop-types';
import CustomToolbar from "./CustomToolbar";
import "./GridStyles.css";

const { Editors } = require('react-data-grid-addons');
const { DropDownEditor } = Editors;
const { NumericFilter } = Filters;
const Selectors = Data.Selectors;

// constants for setting text of an assigned and blocked cell
const vAssigned = 'Assigned';
const vBlocked = 'Blocked';

// global to set the default amount of non-project columns 
// current default columns: id, student, bc, assigned
const infoColumns = 4;

// dropdown list options 
// value is what is placed in the cell
const priorities = [
 { id: 1, value: '1', text: '1', title: '1' },
 { id: 2, value: '2', text: '2', title: '2' },
 { id: 3, value: '3', text: '3', title: '3' },
 { id: 4, value: '4', text: '4', title: '4' },
 { id: 5, value: '5', text: '5', title: '5' },
 { id: 6, value: '6', text: '6', title: '6' },
 { id: 7, value: '7', text: '7', title: '7' },
 { id: 8, value: '8', text: '8', title: '8' },
 { id: 9, value: '9', text: '9', title: '9' },
 { id: 10, value: '10', text: '10', title: '10'},
 { id: 11, value: '-', text: 'Unassigned', title: ' ' },
 { id: 12, value: vAssigned, text: 'Assign', title: 'Assign' },
 { id: 13, value: vBlocked, text: 'Block', title: 'Block' }
 ];

// creates dropdown list for cells
const PrioritiesEditor = <DropDownEditor options={priorities} />;


class Grid extends React.Component {
  // passed in props that are accepted
  static propTypes = {
    gridData: PropTypes.object.isRequired,
    currentStudent: PropTypes.object,
    currentProject: PropTypes.object,
    handleRunAlg: PropTypes.func,
    toggleVersions: PropTypes.func,
    handleGetStudentByID: PropTypes.func,
    handleGetProjectByID: PropTypes.func,
    handleGetUnassignedSchedule: PropTypes.func,
    handleGetSchedulerRunVersions: PropTypes.func,
    handleGetSchedule: PropTypes.func,
    handleGetScheduleByVersion: PropTypes.func,
    handleFinalizeSchedule: PropTypes.func,
    toggleShowStudent: PropTypes.func,
    toggleShowProject: PropTypes.func,
    setStudentPriority: PropTypes.func
  };

  constructor(props, context) {
    super(props, context);

    // sets first 3 columns which currently is always the same for every grid
    this._columns = [
      {
        key: "id",
        name: "ID",
        sortable: true,
        frozen: true,
        resizable: true,
        filterable: true,
        width: 0
      },
      {
        key: "student",
        name: "",
        sortable: true,
        frozen: true,
        resizable: true,
        filterable: true,
        width: 150
      },
      {
        key: "bc",
        name: "BC?",
        sortable: true,
        frozen: true,
        filterable: true,
        //formatter: (props)=> <div style={{color: '#000000'}} ><center>{props.value}</center></div>,
        width: 60
      }
    ];
    
    // gridData object is passed by reference for direct manipulation
    this.gridData = this.props.gridData;

    // currentStudent object is passed by reference for direct manipulation
    this.currentStudent = this.props.currentStudent;
    this.currentProject = {};

    // array of student ids is made from initial gridData
    // this is to mirror the grid so based on row index we can match an unique id
    // studentIDs mirrors the visual grid based on index so studentIDs[0] has the id for row[0]
    // fullStudentIds mirrors the gridData index's based on id so gridData.Students[5] and fullStudentIds[5] have the same ids
    this.studentIDs = [];
    this.gridData.Students.forEach(student => {
      this.studentIDs.push(student.ID);
    });
    this.fullStudentIDs = this.studentIDs;

    // columnOffest is the total amount of non-project columns including term if it is spring
    this.columnOffset = infoColumns;
    if(this.gridData.Term === "Spring")
      this.columnOffset++;

    // creates additional columns
    this.createColumns();

    // sets initial state
    this.state = { 
      rows: this.createRows(),
      filters: {},
      selectedRow: 0,
      selectedColumn: 5,
      gridFiltered: [],
      isLocked: true,
      isStudentLocked: false,
      isProjectOptionsLocked: true,
      isStudentOptionsLocked: true
    };
  };

  /*
    createColumns pushes more columns on this._columns
    if term is spring then term column is pushed
    assigned column is always pushed
    then a project column is pushed for every project in gridData
  */
  createColumns = () =>{
    if(this.gridData.Term === "Spring")
    {
      this._columns.push(
        {
          key: "term",
          name: "Term",
          sortable: true,
          frozen: true,
          filterable: true,
          width: 80
        }
      )
    }
    this._columns.push(
      {
        key: "assigned",
        name: "Assigned",
        sortable: true,
        frozen: true,
        filterable: true,
        width: 100
      }
    )
    for(let i = 0; i < this.gridData.Projects.length; i++)
    {
      this._columns.push(
        {
          key: "project"+(i+1),
          name: this.gridData.Projects[i].Name,
          editable: true,
          sortable: true,
          resizable: true,
          width: 150,
          editor: PrioritiesEditor,
          filterable: true,
          filterRenderer: NumericFilter,
          getRowMetaData: (row) => row
        }
      )
    }
  };

  /*
    createRows creates an array of row objects from gridData students array
    each object contains a properties that matches column id's
    so every row has a student property that matches the 
    column id student and the value is placed in that cell
  */
  createRows = () => {
    let row = [];
    let originalRows = row;

    for(let i = 0; i < this.gridData.Students.length; i++) 
    {

      // sets row to an object that has 1 property "student"
      row = {
        student: this.gridData.Students[i].Name 
      }

      // adds property "id"
      row["id"] = this.gridData.Students[i].ID;

      // adds property "bc"
      if(this.gridData.Students[i].BC === 1)
      {
        row["bc"] = "Y";
      }
      else
      {
        row["bc"] = "N";
      }

      // adds property "term" if current term is spring
      if(this.gridData.Term === "Spring")
      {
        let term = '';
        if(this.gridData.Students[i].CanDoSummer)
        {
          if(this.gridData.Students[i].CanDoFall)
          {
            term = "Either";
          }
          else
          {
            term = "Summer";
          }
        }
        else
        {
          term = "Fall";
        }
        row["term"] = term;
      }

      // adds property "projectX" for every project in gridData Projects
      for(let j = 0; j < this.gridData.Students[i].PriorityList.length; j++)
      {
        if(this.gridData.Students[i].PriorityList[j] === 0 || this.gridData.Students[i].PriorityList[j] === 20)
        {
          row["project"+(j+1)] = "-";
        }
        else
        {
          row["project"+(j+1)] = this.gridData.Students[i].PriorityList[j];
        }
      }

      // sets property "projectX" if student is assigned to it
      if(this.gridData.Students[i].ProjectID > -1)
      {
        for(let j = 0; j < this.gridData.Projects.length; j++)
        {
          if(this.gridData.Projects[j].ID === this.gridData.Students[i].ProjectID)
          {
            row["project"+(j+1)] = 'Assigned';
          }
        }
        row["assigned"] = 'Y';
      }
      else
        row["assigned"] = 'N';
      
      // sets property "projectX" if student is blocked from it
      let bList = this.gridData.Students[i].BlockedList;
      for(let j = 0; j < this.gridData.Projects.length; j++)
      {
        if(bList.indexOf(this.gridData.Projects[j].ID)>-1)
        {
          row["project"+(j+1)] = 'Blocked';
        }
      }

      // adds created row to array of rows
      originalRows.push(row);
    }

    let rows = originalRows.slice(0);
    return rows;
  };

  /*
    sortRows is passed into ReactDataGrid to be used to sort rows for selected column
  */
  sortRows = (sortColumn, sortDirection) => {
    const comparer = (a, b) => {
      if (sortDirection === "NONE") 
      {
        return a["student"] > b["student"] ? 1 : -1;
      } 
      else if (a[sortColumn] === vAssigned || b[sortColumn] === "-" || b[sortColumn] === vBlocked ) 
      {
        return -1;
      } 
      else if (b[sortColumn] === vAssigned || a[sortColumn] === "-" || a[sortColumn] === vBlocked ) 
      {
        return 1;
      }
      else if (sortDirection === "ASC") 
      {
        return a[sortColumn] > b[sortColumn] ? 1 : -1;
      } 
      else if (sortDirection === "DESC") 
      {
        return a[sortColumn] < b[sortColumn] ? 1 : -1;
      } 
    };
    const rows = this.state.rows.sort(comparer);

    this.setState({ rows });
  };

  /*
    mapStudentIDsToRows takes each row and grabs the id property
  */
  mapStudentIDsToRows = () =>
  {
    let rows = this.getRows();
    let newStudentIds = [];
    for(let i = 0; i < rows.length; i++)
    {
      newStudentIds.push(rows[i].id);
    }
    this.studentIDs = newStudentIds;
  }

  /*
    handleFilterChange is passed into ReactDataGrid to be used to filter
  */
  handleFilterChange = (filter) => {
    let newFilters = Object.assign({}, this.state.filters);
    if (filter.filterTerm) {
      newFilters[filter.column.key] = filter;
    } else {
      delete newFilters[filter.column.key];
    }
    this.setState({ filters: newFilters }, ()=>{this.mapStudentIDsToRows()});

    
  };

  /*
    getValidFilterValues is passed into ReactDataGrid to be used to filter
  */
  getValidFilterValues = (columnId) => {
    let values = this.state.rows.map(r => r[columnId]);
    return values.filter((item, i, a) => { return i === a.indexOf(item); });
  };

  /*
    onClearFilters is passed into ReactDataGrid to be used on filters being removed
  */
  onClearFilters = () => {
    // all filters removed
    this.setState({filters: {} }, ()=>{this.mapStudentIDsToRows()});
  };

  /*
    onCellSelected grabs relevant information on the student and project 
    selected based on rows and column id's
  */
  onCellSelected = ({ rowIdx, idx }) => {

    //rows contains all the rows in Grid's current state
    let rows = this.state.rows.slice(0);
    //filteredRows contains all the rows that are viewable based on filters
    let filteredRows = this.getRows();

    // the selected student id is filteredRows[rowIdx]['id']
    // so search fullStudentIDs for the index that matches that id
    // studentIndex is the index of the student in gridData.Students
    let studentIndex = 0;
    for(let i = 0; i < this.gridData.Students.length; i++)
    {
      if(filteredRows[rowIdx]['id'] === this.fullStudentIDs[i])
      {
        studentIndex = i;
      }
    }

    // sets studentLockState based on if the student has a locked project
    let studentLockState = false;
    if(this.gridData.Students[studentIndex].Locked > 0)
    {
      studentLockState = true;
    }

    // sets currentProject to corresponding project of selected column
    this.currentProject = this.gridData.Projects[idx-this.columnOffset];

    // called to set project display info
    this.props.handleGetProjectByID(idx-this.columnOffset);

    // sets display info of student priority for selected project if hidden in the case of being assigned or blocked
    if(rows[rowIdx]["project"+(idx-this.columnOffset+1)] === vAssigned || rows[rowIdx]["project"+(idx-this.columnOffset+1)] === vBlocked)
      this.props.setStudentPriority(this.gridData.Students[studentIndex].PriorityList[idx-this.columnOffset]);
    else
      this.props.setStudentPriority(20);
    
    // sets state properties to be used in other functions then once done calls handleGetStudentByID()
    this.setState({selectedRow: rowIdx, selectedColumn: idx, isStudentLocked: studentLockState}, ()=>{this.handleGetStudentByID()});
  };

  /*
    onGridRowsUpdated is passed into the props of ReactDataGrid
    it is called on cell edits such as the dropdown menu selection

    onGridRowsUpdated does two things
    1st update the grid visually based on changes passed
    2nd edit gridData to reflect the changes on the grid visually
  */
  onGridRowsUpdated = ({ fromRow, toRow, updated}) => {

    //rows contains all the rows in Grid's current state
    let rows = this.state.rows.slice();
    //filteredRows contains all the rows that are viewable based on filters
    let filteredRows = this.getRows();
    
    // the selected student id is filteredRows[this.state.selectedRow]['id']
    // so search fullStudentIDs for the index that matches that id
    // studentIndex is the index of the student in gridData.Students
    // originalRowPosition is the index of the row selected in the non-filtered rows array
    let studentIndex = 0;
    let originalRowPosition = 0;
    for(let i = 0; i < this.gridData.Students.length; i++)
    {
      if(filteredRows[this.state.selectedRow]['id'] === this.fullStudentIDs[i])
      {
        studentIndex = i;
      }
      if(rows[i]['id'] === filteredRows[this.state.selectedRow]['id'])
      {
        originalRowPosition = i;
      }
    }

    // oldAssignedID is what the student is currently assigned to if at all
    let oldAssignedID = this.gridData.Students[studentIndex].ProjectID;

    // oldAssignedIndex is the index of the project for oldAssignedID  
    let oldAssignedIndex = -1;
    for(let i = 0; i < this.gridData.Projects.length; i++)
    {
      if(this.gridData.Projects[i].ID === oldAssignedID)
      {
        oldAssignedIndex = i;
        break;
      }
    }

    // places changes set by updated
    let rowToUpdate = rows[originalRowPosition];
    let updatedRow = update(rowToUpdate, {$merge: updated});
    rows[originalRowPosition] = updatedRow;


    // removes selected project from student blockedList
    let blockIndex = this.gridData.Students[studentIndex].BlockedList.indexOf((this.gridData.Projects[this.state.selectedColumn-this.columnOffset].ID));
    if(blockIndex > -1)
      this.gridData.Students[studentIndex].BlockedList.splice(blockIndex, 1);

    // if the change was to vAssinged
    if(rows[originalRowPosition][this._columns[this.state.selectedColumn].key] === vAssigned)
    {
      // this.gridData.Students[studentIndex].ProjectID is the project that student is assigned to
      this.gridData.Students[studentIndex].ProjectID = this.gridData.Projects[this.state.selectedColumn-this.columnOffset].ID;
      
      // add a student to the surrent students of that project
      this.gridData.Projects[(this.state.selectedColumn-this.columnOffset)].CurrentStudents++;

      // if there was a previous assigned project
      if(oldAssignedIndex > -1)
      {
        // subtract 1 from old projects current student
        this.gridData.Projects[oldAssignedIndex].CurrentStudents--;
        // set old assigned column to students listed priority
        rows[originalRowPosition][this._columns[oldAssignedIndex+this.columnOffset].key] = this.gridData.Students[studentIndex].PriorityList[oldAssignedIndex];
        // set updated
        updated[this._columns[oldAssignedIndex+this.columnOffset].key] = this.gridData.Students[studentIndex].PriorityList[oldAssignedIndex];
      }
    }
    // if the change was to vBlocked
    else if(rows[originalRowPosition][this._columns[this.state.selectedColumn].key] === vBlocked)
    {
      // if this column was the previous assigned project
      if((this.state.selectedColumn-this.columnOffset) === oldAssignedIndex)
      {
        this.gridData.Projects[oldAssignedIndex].CurrentStudents--;
        this.gridData.Students[studentIndex].ProjectID = -1;
      }

      // push selected project id into students blocked list
      this.gridData.Students[studentIndex].BlockedList.push(this.gridData.Projects[this.state.selectedColumn-this.columnOffset].ID);
    }
    // if the change was to unassigned
    else if(rows[originalRowPosition][this._columns[this.state.selectedColumn].key] === '-')
    {
      // if this column was the previous assigned project
      if((this.state.selectedColumn-this.columnOffset) === oldAssignedIndex)
      {
        this.gridData.Projects[oldAssignedIndex].CurrentStudents--;
        this.gridData.Students[studentIndex].ProjectID = -1;
      }

      // scheduler algorithm denotes ignored projects in priority list as 20
      this.gridData.Students[studentIndex].PriorityList[this.state.selectedColumn-this.columnOffset] = 20;
    }
    else
    {
      // if this column was the previous assigned project
      if((this.state.selectedColumn-this.columnOffset) === oldAssignedIndex)
      {
        this.gridData.Projects[oldAssignedIndex].CurrentStudents--;
        this.gridData.Students[studentIndex].ProjectID = -1;
      }
      this.gridData.Students[studentIndex].PriorityList[this.state.selectedColumn-this.columnOffset] = Number(rows[originalRowPosition][this._columns[this.state.selectedColumn].key]);
    }

    // If there is a project assigned auto lock this student
    this.gridData.Students[studentIndex].Locked = this.gridData.Students[studentIndex].ProjectID;
    
    // changes assigned column to Y if student was assigned
    // else N
    if(this.gridData.Students[studentIndex].ProjectID > -1)
    {
      rows[originalRowPosition]['assigned'] =  'Y';
      updated['assigned'] = 'Y';

      this.setState({isStudentLocked: true});
    }
    else
    {
      rows[originalRowPosition]['assigned'] =  'N';
      updated['assigned'] = 'N';
      this.setState({isStudentLocked: true});
    }

    this.setState({ rows });
    this.changeStyle(); 
  };
  
  /*
    changeStyle is used to change the css of select cells from the grid
    this is done because there is no way listed that i could find to set 
    a className or style individually for each cell based on value of cell.
    so to work around this I pull arrays of the classNames of the cells and 
    check the value and the gridData corresponding to each cell. Then I add
    another className which I can set properties of in GridStyles.css.

    to change styles for cells look at GridStyles.css
  */
  changeStyle = (props) => {

    // arrays for all elements with given classNames
    let allCells = document.getElementsByClassName('react-grid-Cell');
    let allHeader = document.getElementsByClassName('react-grid-HeaderCell');
    
    //for every non-header cell
    for(let i = 0; i < allCells.length; i++)
    {
      
      // grabs visual value
      let currentValue = allCells[i].getAttribute('value');

      // if the current cell left to right is alphabetical
      // ie is a name, "Assigned", "Blocked"
      if((i+1) < allCells.length && !isNaN(currentValue))
      {
        // always set to default to revert
        allCells[i].className = 'react-grid-Cell';

        // this only works if the current cell is an id and the next cell is a name
        // it sets j to the index of the given id
        let nextValue = allCells[i+1].getAttribute('value');
        let j = this.studentIDs.indexOf(Number(currentValue));

        // if current cell is an id for 
        if(j > -1)
        {
          // checks if the name is correct in case the unique id is somehow in other parts of the grid 
          if(nextValue === this.gridData.Students[j].Name)
          {
            let currentGPA = this.gridData.Students[j].GPA;
            let isLocked = this.gridData.Students[j].Locked;

            allCells[i+1].className = 'react-grid-Cell';
            
            // sets name cell to change styles based on gpa and if it is locked
            if(currentGPA >= this.props.highGPA)
              allCells[i+1].className = 'react-grid-Cell high-gpa';
            else if(currentGPA <= this.props.lowGPA)
              allCells[i+1].className = 'react-grid-Cell low-gpa';
            else if(currentGPA < this.props.averageGPA)
              allCells[i+1].className = 'react-grid-Cell below-average-gpa';
            else
              allCells[i+1].className = 'react-grid-Cell above-average-gpa';
            if(isLocked > -1 && !(allCells[i].className.includes('locked-cell')))
              allCells[i+1].className += ' locked-cell';

          }
        }
        
      }
      // if the cell is assigned
      else if(allCells[i].getAttribute('value') === vAssigned && !(allCells[i].className.includes('assigned-cell')))
      {
        allCells[i].className = 'react-grid-Cell assigned-cell';
      }
      // if the cell is blocked
      else if(allCells[i].getAttribute('value') === vBlocked && !(allCells[i].className.includes('blocked-cell')))
      {
        allCells[i].className = 'react-grid-Cell blocked-cell';
      }
      // if the cell is unassigned
      else if(allCells[i].getAttribute('value') === '-' && !(allCells[i].className.includes('non-priority-cell')))
      {
        allCells[i].className = 'react-grid-Cell non-priority-cell';
      }
    }
    
    // current calculations for priority value of a project is a sum for the top 3 picks for that project
    // every 1st choice adds 1
    // every 2nd choice adds .5
    // every 3rd choice adds .25
    // 7 1st choices and 2 2nd choices would be high priority ranked
    // 7 3rd choices would be 1.75 and low priority ranked
    for(let i = 0; i < this.gridData.Projects.length; i++)
    {
      let projectDesire = 0.0;
      for(let j = 0; j < this.gridData.Students.length; j++)
      {
        if(this.gridData.Students[j].PriorityList[i] === 1)
          projectDesire += this.props.choice1st;
        else if(this.gridData.Students[j].PriorityList[i] === 2)
          projectDesire += this.props.choice2nd;
        else if(this.gridData.Students[j].PriorityList[i] === 3)
          projectDesire += this.props.choice3rd;
      }

      if(projectDesire >= this.props.highPriorityValue ) 
      {
        allHeader[i].className = 'react-grid-HeaderCell header-oversaturated-project';
      }
      else if(projectDesire < this.props.lowPriorityValue)
      {
        allHeader[i].className = 'react-grid-HeaderCell header-undersaturated-project';
      }
      else
      {
        allHeader[i].className = 'react-grid-HeaderCell';
      }

      // if the current students assigned is more than max 
      if(this.gridData.Projects[i].CurrentStudents > this.gridData.Projects[i].Max)
        allHeader[i].className = 'react-grid-HeaderCell header-over-capacity-project';
      // if the current students assigned is at max 
      else if(this.gridData.Projects[i].CurrentStudents === this.gridData.Projects[i].Max)
        allHeader[i].className = 'react-grid-HeaderCell header-full-project';
      // if the current students assigned is atleast at or more than min 
      else if(this.gridData.Projects[i].CurrentStudents >= this.gridData.Projects[i].Min)
        allHeader[i].className = 'react-grid-HeaderCell header-minimum-satisfied-project';
    }

  };
  
  /*
    getRows returns array of rows that can be selected
  */
  getRows = () => {
    return Selectors.getRows(this.state);
  };

  /*
    rowGetter selected row based on row index rowIdx
  */
  rowGetter = (rowIdx) => {
    let rows = this.getRows();
    return rows[rowIdx];
  };

  /*
    componentDidMount runs once component is rendered/mounted
    it will set an interval to run changeStyle every tenth of a second
  */
  componentDidMount()
  {
    this.interval = setInterval(() => {this.changeStyle()}, 100);
  }

  /*
    componentWillUnmount runs once component is unrendered/unmounted
    it will remove the set interval
  */
  componentWillUnmount() 
  {
    clearInterval(this.interval);
  }

  /*
    RowRenderer is used by ReactDataGrid for rendering rows
  */
  RowRenderer = ({ renderBaseRow, ...props }) => {
    return renderBaseRow(props);
  };

  /*
    toggleLock toggles the lock on editing the grid
  */
  toggleLock = () =>
  {
    let toggle = this.state.isLocked;
    this.setState({isLocked: !toggle});
  };

  /*
    lockStudent toggles the lock on student
    if student is to be locked it finds the assigned project id and sets that as the lock
    if student is to be unlocked it sets locked to be -1
  */
  lockStudent = () =>
  {
    let filteredRows = this.getRows();
    let studentIndex = 0;

    //finds index of student in gridData
    for(let i = 0; i < this.gridData.Students.length; i++)
    {
      if(filteredRows[this.state.selectedRow]['id'] === this.fullStudentIDs[i])
      {
        studentIndex = i;
      }
    }

    let lockState = false;
    let studentLock = this.gridData.Students[studentIndex].Locked;
    if(studentLock > -1)
    {
      this.gridData.Students[studentIndex].Locked = -1;
    }
    else
    {
      this.gridData.Students[studentIndex].Locked = this.gridData.Students[studentIndex].ProjectID
      lockState = true;
    }

    // sets visual button representation
    this.setState({isStudentLocked: lockState});
  };

  /*
    toggleProjectOptionsLock toggles the the rendering of project options for CustomToolbar
  */
  toggleProjectOptionsLock = (e) => {
    let toggle = this.state.isProjectOptionsLocked;
    this.setState({isProjectOptionsLocked: !toggle, isStudentOptionsLocked: true});
  };

  /*
    toggleStudentOptionsLock toggles the the rendering of student options for CustomToolbar
  */
  toggleStudentOptionsLock = (e) => {
    let toggle = this.state.isStudentOptionsLocked;
    this.setState({isStudentOptionsLocked: !toggle, isProjectOptionsLocked: true});
  };

  /*
    changeMin sets min of selected project to be incremented or decremented by value
  */
  changeMin = (value) => {
    this.gridData.Projects[this.state.selectedColumn-this.columnOffset].Min += value;
    if(this.gridData.Projects[this.state.selectedColumn-this.columnOffset].Min<0)
      this.gridData.Projects[this.state.selectedColumn-this.columnOffset].Min = 0;
    else if(this.gridData.Projects[this.state.selectedColumn-this.columnOffset].Min>this.gridData.Projects[this.state.selectedColumn-this.columnOffset].Max)
      this.gridData.Projects[this.state.selectedColumn-this.columnOffset].Min--;
      this.props.handleGetProjectByID(this.state.selectedColumn-this.columnOffset);
  }

  /*
    changeMax sets max of selected project to be incremented or decremented by value
  */
  changeMax = (value) => {
    this.gridData.Projects[this.state.selectedColumn-this.columnOffset].Max += value;
    if(this.gridData.Projects[this.state.selectedColumn-this.columnOffset].Max<0)
      this.gridData.Projects[this.state.selectedColumn-this.columnOffset].Max = 0;
    else if(this.gridData.Projects[this.state.selectedColumn-this.columnOffset].Max<this.gridData.Projects[this.state.selectedColumn-this.columnOffset].Min)
      this.gridData.Projects[this.state.selectedColumn-this.columnOffset].Max++;
      this.props.handleGetProjectByID(this.state.selectedColumn-this.columnOffset);
  }

  /*
    props call to handleRunAlg if it exists
  */
  handleRunAlg= () => {
    if (typeof(this.props.handleRunAlg) === 'function') {
      this.props.handleRunAlg();
    }
  };

  /*
    props call to toggleVersions if it exists
  */
  toggleVersions= () => {
    if (typeof(this.props.toggleVersions) === 'function') {
      this.props.toggleVersions();
    }
  };

  /*
    props call to handleGetStudentByID if it exists
  */
  handleGetStudentByID= () => {
    let filteredRows = this.getRows();
    let id = filteredRows[this.state.selectedRow]['id'];
    if (typeof(this.props.handleGetStudentByID) === 'function') {
      this.props.handleGetStudentByID(id);
    }
  };

  /*
    props call to handleGetUnassignedSchedule if it exists
  */
  handleGetUnassignedSchedule= () => {
    if (typeof(this.props.handleGetUnassignedSchedule) === 'function') {
      this.props.handleGetUnassignedSchedule();
    }
  };

  /*
    props call to handleGetSchedulerRunVersions if it exists
  */
  handleGetSchedulerRunVersions= () => {
    if (typeof(this.props.handleGetSchedulerRunVersions) === 'function') {
      this.props.handleGetSchedulerRunVersions();
    }
  };

  /*
    props call to handleGetSchedule if it exists
  */
  handleGetSchedule= () => {
    if (typeof(this.props.handleGetSchedule) === 'function') {
      this.props.handleGetSchedule();
    }
  };

  /*
    props call to handleGetScheduleByVersion if it exists
  */
  handleGetScheduleByVersion= () => {
    if (typeof(this.props.handleGetScheduleByVersion) === 'function') {
      this.props.handleGetScheduleByVersion();
    }
  };

  /*
    props call to handleFinalizeSchedule if it exists
  */
  handleFinalizeSchedule= () => {
    if (typeof(this.props.handleFinalizeSchedule) === 'function') {
      this.props.handleFinalizeSchedule();
    }
  };

  /*
    props call to toggleShowStudent if it exists
  */
  toggleShowStudent= () => {
    if (typeof(this.props.toggleShowStudent) === 'function') {
      this.props.toggleShowStudent();
    }
  };

  /*
    props call to toggleShowProject if it exists
  */
  toggleShowProject= () => {
    if (typeof(this.props.toggleShowProject) === 'function') {
      this.props.toggleShowProject();
    }
  };

  /*
    lockProject toggles whether a project will be assigned students
    when creating this I wasn't given much information on how it works and little testing went into this
    all I was told was -2 means project is not considered and 0 is default
  */
  lockProject = () => {
    let priority = this.gridData.Projects[this.state.selectedColumn-this.columnOffset].Priority; 
    if(priority === 0)
      this.gridData.Projects[this.state.selectedColumn-this.columnOffset].Priority = -2;
    else
      this.gridData.Projects[this.state.selectedColumn-this.columnOffset].Priority = 0;

    this.props.handleGetProjectByID(this.state.selectedColumn-this.columnOffset);
  }

  render() {
    return (
    <div id="parentDivOfGrid">
      <ReactDataGrid
        ref={ node => this.grid = node }
        columns={this._columns}
        rowGetter={this.rowGetter}
        rowsCount={this.state.rows.length}
        minHeight={500}
        minColumnWidth={0}
        enableCellSelect={!(this.state.isLocked)}
        onCellSelected={this.onCellSelected}
        onGridRowsUpdated={this.onGridRowsUpdated}
        onGridSort={this.sortRows}

        toolbar={(props) => 
          <CustomToolbar {...props} 
          enableFilter={true} 
          testPrint={this.testPrint} 
          toggleLock={this.toggleLock} 
          changeMin={this.changeMin}
          changeMax={this.changeMax}
          lockState={this.state.isLocked} 
          toggleStudentLock={this.lockStudent} 
          isStudentLocked={this.state.isStudentLocked} 
          toggleStudentOptionsLock={this.toggleStudentOptionsLock}
          toggleProjectOptionsLock={this.toggleProjectOptionsLock}
          isStudentOptionsLocked={this.state.isStudentOptionsLocked}
          isProjectOptionsLocked={this.state.isProjectOptionsLocked}
          currentStudent={this.state.currentStudent}
          handleRunAlg={this.handleRunAlg}
          toggleVersions={this.toggleVersions}
          handleGetStudentByID={this.handleGetStudentByID}
          handleGetUnassignedSchedule={this.handleGetUnassignedSchedule}
          handleGetSchedulerRunVersions={this.handleGetSchedulerRunVersions}
          handleGetSchedule={this.handleGetSchedule}
          handleGetScheduleByVersion={this.handleGetScheduleByVersion}
          handleFinalizeSchedule={this.handleFinalizeSchedule}
          toggleShowStudent = {this.toggleShowStudent}
          toggleShowProject = {this.toggleShowProject}
          lockProject = {this.lockProject}
          />
        }

        onAddFilter={this.handleFilterChange}
        getValidFilterValues={this.getValidFilterValues}
        onClearFilters={this.onClearFilters}
        rowRenderer={this.RowRenderer}
      />
    </div>
    );
    
  }
}

export default Grid;