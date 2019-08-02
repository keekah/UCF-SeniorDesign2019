/*
  CustomToolbar is a component made to be the toolbar for Grid.js.
  this was based off of the custom toolbar inside ReactDataGrid addons
  
  all functions inside just call functions from parent component passed through props
*/
import React from "react";
import PropTypes from 'prop-types';

class CustomToolbar extends React.Component {
  static propTypes = {
    onToggleFilter: PropTypes.func,
    toggleStudentLock: PropTypes.func,
    enableFilter: PropTypes.bool,
    numberOfRows: PropTypes.number,
    filterRowsButtonText: PropTypes.string,
    toggleLock: PropTypes.func,
    lockState: PropTypes.bool,
    isStudentLocked: PropTypes.bool,
    children: PropTypes.any,
    toggleProjectOptionsLock: PropTypes.func,
    toggleStudentOptionsLock: PropTypes.func,
    changeMax: PropTypes.func,
    changeMin: PropTypes.func,
    isProjectOptionsLocked: PropTypes.bool,
    isStudentOptionsLocked: PropTypes.bool,
    currentStudent: PropTypes.object,
    handleRunAlg: PropTypes.func,
    toggleVersions: PropTypes.func,
    handleGetStudentByID: PropTypes.func,
    handleGetUnassignedSchedule: PropTypes.func,
    handleGetSchedulerRunVersions: PropTypes.func,
    handleGetSchedule: PropTypes.func,
    handleGetScheduleByVersion: PropTypes.func,
    handleFinalizeSchedule: PropTypes.func,
    toggleShowStudent: PropTypes.func,
    toggleShowProject: PropTypes.func,
    lockProject: PropTypes.func
  };
  

  renderToggleFilterButton = () => {
    if (this.props.enableFilter) {
      return (<button type="button" className="small button" onClick={this.props.onToggleFilter}>
      Filter
    </button>);
    }
  };

  toggleLock = (e) => {
    if (typeof(this.props.toggleLock) === 'function') {
      this.props.toggleLock();
    }
  };

  toggleStudentLock = (e) => {
    if (typeof(this.props.toggleStudentLock) === 'function') {
      this.props.toggleStudentLock();
    }
  };

  toggleProjectOptionsLock = (e) => {
    if (typeof(this.props.toggleProjectOptionsLock) === 'function') {
      this.props.toggleProjectOptionsLock();
    }
  };

  toggleStudentOptionsLock = (e) => {
    if (typeof(this.props.toggleStudentOptionsLock) === 'function') {
      this.props.toggleStudentOptionsLock();
    }
  };

  changeMin = (data) => {
    if (typeof(this.props.changeMin) === 'function') {
      this.props.changeMin(data);
    }
  }

  changeMax = (data) => {
    if (typeof(this.props.changeMax) === 'function') {
      this.props.changeMax(data);
    }
  }

  handleRunAlg= () => {
    if (typeof(this.props.handleRunAlg) === 'function') {
      this.props.handleRunAlg();
    }
  };

  toggleVersions= () => {
    if (typeof(this.props.toggleVersions) === 'function') {
      this.props.toggleVersions();
    }
  };

  handleGetStudentByID= () => {
    let filteredRows = this.getRows();
    let id = filteredRows[this.state.selectedRow]['id'];
    if (typeof(this.props.handleGetStudentByID) === 'function') {
      this.props.handleGetStudentByID(id);
    }
  };

  handleGetUnassignedSchedule= () => {
    if (typeof(this.props.handleGetUnassignedSchedule) === 'function') {
      this.props.handleGetUnassignedSchedule();
    }
  };

  handleGetSchedulerRunVersions= () => {
    if (typeof(this.props.handleGetSchedulerRunVersions) === 'function') {
      this.props.handleGetSchedulerRunVersions();
    }
  };

  handleGetSchedule= () => {
    if (typeof(this.props.handleGetSchedule) === 'function') {
      this.props.handleGetSchedule();
    }
  };

  handleGetScheduleByVersion= () => {
    if (typeof(this.props.handleGetScheduleByVersion) === 'function') {
      this.props.handleGetScheduleByVersion();
    }
  };

  handleFinalizeSchedule= () => {
    if (typeof(this.props.handleFinalizeSchedule) === 'function') {
      this.props.handleFinalizeSchedule();
    }
  };

  toggleShowStudent= () => {
    if (typeof(this.props.toggleShowStudent) === 'function') {
      this.props.toggleShowStudent();
    }
  };

  toggleShowProject= () => {
    if (typeof(this.props.toggleShowProject) === 'function') {
      this.props.toggleShowProject();
    }
  };

  lockProject= () => {
    if (typeof(this.props.lockProject) === 'function') {
      this.props.lockProject();
    }
  };

  render() {
    let lockText = (this.props.lockState ? "Unlock Grid" : "Lock Grid");
    let studentLockText = (this.props.isStudentLocked ? "Locked In" : "Not Locked In");
    let projectOptions = ( !this.props.isProjectOptionsLocked ?
          <div>
          <ul className="button-group">
          <li><button type="button" className="small button" onClick={this.toggleShowProject}>
            Show Project Info
          </button></li>
          </ul>
          <ul className="button-group">
          <li>
          <button type="button" className="small button" onClick={()=> this.changeMax(1)}>
            Increase Max
          </button>
          </li>
          <li>
          <button type="button" className="small button" onClick={()=> this.changeMax(-1)}>
            Decrease Max
          </button>
          </li>
          <li>
          <button type="button" className="small button" onClick={()=> this.changeMin(1)}>
            Increase Min
          </button>
          </li>
          <li>
          <button type="button" className="small button" onClick={()=> this.changeMin(-1)}>
            Decrease Min
          </button>
          </li>
          </ul>
          <ul className="button-group">
          <li>
          <button type="button" className="small button" onClick={this.lockProject}>
            Project Lock
          </button>
          </li>
          </ul>
          </div>
          : null);
    
    let studentOptions = ( !this.props.isStudentOptionsLocked ?
        <div>
      <ul className="button-group">
      <li>
      <button type="button" className="small button" onClick={this.toggleShowStudent}>
        Show Student Info
      </button>
      </li>
      </ul>
      <ul className="button-group">
      <li><button type="button" className="small button" onClick={this.toggleStudentLock} >
        {studentLockText}
      </button></li>
      </ul>
      </div>
        : null);

    return (
      <div className="react-grid-Toolbar-left" style={{height:"100%", width:"100%"}}>
        <div className="tools"> 
          <ul className="button-group">
          <li><button type="button" className="small button" onClick={this.toggleStudentOptionsLock}>
            Student Options
          </button></li>
          <li><button type="button" className="small button" onClick={this.toggleProjectOptionsLock}>
            Project Options
          </button></li>
          <li><button type="button" className="small button" onClick={this.handleGetUnassignedSchedule}>
            Get Unassigned Schedule
          </button></li>
          <li><button type="button" className="small button" onClick={this.handleGetScheduleByVersion}>
            Load Version
          </button></li>
          <li><button type="button" className="small button" onClick={this.handleRunAlg}>
            Run
          </button></li>
          <li><button type="button" className="small button" onClick={this.handleFinalizeSchedule}>
            Finalize Schedule
          </button></li>
          </ul >
          {projectOptions}
          {studentOptions}
          <ul className="button-group">
          <li>{this.renderToggleFilterButton()}</li>
          {this.props.children}
          <li><button type="button" className="small button" onClick={this.toggleLock} >
            {lockText}
          </button></li>
          </ul>
        </div>
        
      </div>
      
      );
  }
}

export default CustomToolbar;