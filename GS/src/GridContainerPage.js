/*
    GridContainerPage is a component that fetchs information from the API and uses it to build the Grid
    from Grid.js. Everything that is displayed but not inside the Grid is handled on this page. To use 
    the functions in this file from buttons like in the CustomToolbar.js we pass the function calls down
    through props of the Grid component inside the return.
*/

import React from "react";
import { Row, Container, Col, Form, Input} from "reactstrap";
import { BrowserRouter as Router} from 'react-router-dom';
import Grid from './Grid';
import withAuth from './withAuth'; 
import "./GridStyles.css";

// domain is the domain where the API is located
const domain = "http://10.171.204.211";

// constant for easy to edit defaults of color codes for Grid
const defaultHighGPA = 3.5;
const defaultAverageGPA = 3.0;
const defaultLowGPA = 2.5;
// current calculations for priority value of a project is a sum for the top 3 picks for that project
// every 1st choice adds 1
// every 2nd choice adds .5
// every 3rd choice adds .25
// 7 1st choices and 2 2nd choices would be high priority ranked
// 7 3rd choices would be 1.75 and low priority ranked
const defaultHighPriorityValue = 8;
const defaultLowPriorityValue = 2;
const default1stChoice = 1;
const default2ndChoice = .5;
const default3rdChoice = .25;

class GridContainerPage extends React.Component {
    constructor(props) {
        super(props);

        // setting functions inside GridContainerPage to be able to use (this) keyword to reference GridContainerPage
        this.handleBack = this.handleBack.bind(this);
        this.handleVersionChange = this.handleVersionChange.bind(this);
        this.handleYearChange = this.handleYearChange.bind(this);
        this.handleTermChange = this.handleTermChange.bind(this);
        this.findVersions = this.findVersions.bind(this);
        this.toggleVersions = this.toggleVersions.bind(this);
        this.handleGetSchedulerRunVersions = this.handleGetSchedulerRunVersions.bind(this);
        this.handleGetSchedule = this.handleGetSchedule.bind(this);
        this.handleRunAlg = this.handleRunAlg.bind(this);
        this.handleGetScheduleByVersion = this.handleGetScheduleByVersion.bind(this);
        this.handleGetUnassignedSchedule = this.handleGetUnassignedSchedule.bind(this);
        this.handleGetStudentByID = this.handleGetStudentByID.bind(this);
        this.handleGetProjectByID = this.handleGetProjectByID.bind(this);
        this.handleFinalizeSchedule = this.handleFinalizeSchedule.bind(this);
        this.toggleShowStudent = this.toggleShowStudent.bind(this);
        this.toggleShowProject = this.toggleShowProject.bind(this);
        this.setStudentPriority = this.setStudentPriority.bind(this);
        this.toggleHelp = this.toggleHelp.bind(this);
        this.toggleLegend = this.toggleLegend.bind(this);

        // initial state declarations 
        this.state = { 
            gridData: {},
            versionData: [],
            selectedYear: "",
            selectedTerm: "",
            versionOptions: [],
            selectedVersion:"",
            VersionSelectToggle: false, 
            gridLoadToggle: false,
            noError: true,
            currentStudent: {},
            currentProject: {},
            errorMessage: "",
            showStudent: false,
            showProject: false,
            studentPriorityValue: 20,
            helpToggle: false,
            legendToggle: false,
            highPriorityValue: defaultHighPriorityValue,
            lowPriorityValue: defaultLowPriorityValue,
            choice1st: default1stChoice,
            choice2nd: default2ndChoice,
            choice3rd: default3rdChoice,
            highGPA: defaultHighGPA,
            averageGPA: defaultAverageGPA,
            lowGPA: defaultLowGPA
        }

        // on consturction of GridContainerPage build list of years semesters and versions of schedule data
        this.handleGetSchedulerRunVersions();
    }

    /*
        handleSetStatesToDefault is used to set states of GridContainerPage and Grid to default when schedule
        data used is changed. 
    */
    handleSetStatesToDefault() {
        this.setState({
            gridData: {},
            gridLoadToggle: false,
            noError: true,
            currentStudent: {},
            currentProject: {},
            errorMessage: "",
            showStudent: false,
            showProject: false,
            studentPriorityValue: 20,
            helpToggle: false,
            legendToggle: false
        });
    }

    /*
        handleVersionChange is used by the option list to select versions for selected year and term of schedule data.
    */
    handleVersionChange(event) {
        this.setState({ selectedVersion: event.currentTarget.value });
    }

    /*
        handleYearChange is used by the option list to select which year of schedule data.
        it sets the state of selectedYear to corresponding option 
        then triggers functions findVersions() and handleGetSchedule
    */
    handleYearChange(event) {
        this.setState({ selectedYear: event.currentTarget.value },() => { this.findVersions(); this.handleGetSchedule();});
    }

    /*
        handleTermChange is used by the option list to select which term of schedule data.
        it sets the state of selectedTerm to corresponding option 
        then triggers functions findVersions() and handleGetSchedule
    */
    handleTermChange(event) {
        this.setState({ selectedTerm: event.currentTarget.value },() => { this.findVersions(); this.handleGetSchedule();});
    }

    /*
        findVersions used to build the version options for the selected year and selected term.
        checks the versionData fetched by GetSchedulerRunVersions for the selected year and term
        if the selected year and term has version data that array is set to be built into the options
    */
    findVersions() {
        this.state.versionData.forEach(yearData => {
            if(yearData.year === this.state.selectedYear) {
                yearData.terms.forEach(termData => {
                    if(termData.term === this.state.selectedTerm.toLowerCase()) {
                        this.setState({ versionOptions: termData.versions }, 
                            // below sets the default selected to the first entry so if Load Version is pressed 
                            // without a version being selected by the user the latest version is loaded
                            () => {if(termData.versions.length>0) this.setState({selectedVersion: termData.versions[0]})}
                            );
                    }
                });
            }
        });
    }

    /*
        handleBack is called to return to admin portal
    */
    handleBack() {
        this.props.history.push('/AdminApp');
    }

    /*
        handleGetSchedulerRunVersions is an API call to GET the version data for every year and term
    */
    handleGetSchedulerRunVersions() {

        fetch(domain+"/GetSchedulerRunVersions/", {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        })
        .then((response => {
            response.json().then(data =>{
                // getting/adding current and next year in case version data does not include latest year data
                // this is because version data is created on run so the first time the grid data is pulled
                // there might not be any version data for that year or term and wont be in the version data
                // if there becomes an API call that can give all years and terms that have schedule data
                // then this could be removed
                let currentYear = new Date().getFullYear().toString();
                let nextYear = (new Date().getFullYear()+1).toString();

                // in case of no version data at all
                if(data.fullDirectory.length === 0)
                    data.fullDirectory.unshift( { year: currentYear, terms:[]} );
                if(data.fullDirectory[0].year !== nextYear)
                    data.fullDirectory.unshift( { year: nextYear, terms:[]} );

                // sort all versions latest to oldest 
                data.fullDirectory.forEach( year => {
                    year.terms.forEach(term =>{
                        term.versions.sort();
                        term.versions.reverse();
                    });
                    
                })

                // version data is set in the state and call findVersions to load version options
                this.setState({versionData: data.fullDirectory}, ()=>{this.findVersions()});
            })
          })
        ).catch(err => err);
    }

    /*
        handleGetSchedule is an API call to POST
        grabs loaded grid data from database for selected year and term

        params to be sent are in JSON
        { "year": "20XX", "term":"fall" }

        response is in JSON
        { 
            "Projects":[],
            "Students":[],
            "studentsFirstChoice": 0,
            "studentsSecondChoice": 0, 
            "studentsThirdChoice": 0, 
            "totalStudents": 0
        }
    */
    handleGetSchedule() {
        this.handleSetStatesToDefault();
        if(this.state.selectedYear !== "" && this.state.selectedTerm !== "") 
        {
            this.setState({noError: true});
            let postBody = { year:this.state.selectedYear, term:this.state.selectedTerm }

            fetch(domain+"/GetSchedule/", {
                method: 'POST',
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(postBody)
            })
            .then((response => { 
                if((response.status === 200)) 
                response.json().then(data =>{
                    data["Term"] = this.state.selectedTerm;

                    // sets state for gridData and tells component Grid is ready to be mounted
                    if(data.Students.length > 0 && data.Projects.length > 0)
                        this.setState({gridData: data}, () => {this.setState( {gridLoadToggle: true} ) } );       
                    this.setState( {VersionSelectToggle: true});
                });
                else
                    this.setState({noError: false, selectedVersion: "", errorMessage: "No Valid Grid Data"});
                this.handleGetSchedulerRunVersions();
                
            })
            ).catch(err => err);
            this.setState( {gridLoadToggle: false} );
        }
    }

    /*
        handleGetScheduleByVersion is an API call to POST
        grabs grid data from database for selected year and term and version

        params to be sent are in JSON
        { "year": "20XX", "term":"fall", "fileName":"20XX-XX-XX_XX_XX_XX.txt" }

        response is in JSON
        { 
            "Projects":[],
            "Students":[],
            "studentsFirstChoice": 0,
            "studentsSecondChoice": 0, 
            "studentsThirdChoice": 0, 
            "totalStudents": 0
        }
    */
    handleGetScheduleByVersion() {
        this.handleSetStatesToDefault();
        if(this.state.selectedYear !== "" && this.state.selectedTerm !== "" && this.state.selectedVersion !== "") 
        {
            this.setState({noError: true});
            let postBody = { fileName:this.state.selectedVersion, year:this.state.selectedYear, term:this.state.selectedTerm }

            fetch(domain+"/LoadPreviousRunVersion/", {
                method: 'POST',
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(postBody)
            })
            .then((response => { 
                if((response.status === 200)) 
                response.json().then(data =>{
                    data["Term"] = this.state.selectedTerm;

                    // sets state for gridData and tells component Grid is ready to be mounted
                    if(data.Students.length > 0 && data.Projects.length > 0)
                        this.setState({gridData: data}, () => {this.setState( {gridLoadToggle: true} ) } );       
                });
                else
                    this.setState({noError: false, errorMessage: "No Valid Grid Data"});
                this.handleGetSchedulerRunVersions();
            })
            ).catch(err => err);
            this.setState( {gridLoadToggle: false} );
        }
    }

    /*
        handleGetUnassignedSchedule is an API call to POST
        grabs grid data that has no assignment from database for selected year and term

        params to be sent are in JSON
        { "year": "20XX", "term":"fall" }

        response is in JSON
        { 
            "Projects":[],
            "Students":[]
        }
    */
    handleGetUnassignedSchedule() {
        this.handleSetStatesToDefault();
        if(this.state.selectedYear !== "" && this.state.selectedTerm !== "") 
        {
            this.setState({noError: true});
            let postBody = { year:this.state.selectedYear, term:this.state.selectedTerm }

            fetch(domain+"/GetInitialGridBuild/", {
                method: 'POST',
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(postBody)
            })
            .then((response => {
                response.json().then(data =>{
                    data["Term"] = this.state.selectedTerm;
                    if(data.Students.length > 0 && data.Projects.length > 0)
                        this.setState({gridData: data, validGridData: true}, () => {this.setState( {gridLoadToggle: true} ) } );
                    else
                        this.setState({noError: false, errorMessage: "No Valid Grid Data"});
                });
                this.handleGetSchedulerRunVersions();
            })
            ).catch(err => err);
            this.setState( {gridLoadToggle: false} );
        }
    }

    /*
        handleRunAlg is an API call to POST
        sends current gridData to backend to run through algorithm and returns new gridData

        params to be sent are in JSON
        { 
            "year": "20XX",
             "term":"fall",
            "Projects":[],
            "Students":[]

        }
        response is in JSON
        { 
            "Projects":[],
            "Students":[],
            "studentsFirstChoice": 0,
            "studentsSecondChoice": 0, 
            "studentsThirdChoice": 0, 
            "totalStudents": 0
        }
    */
    handleRunAlg() {
        this.handleSetStatesToDefault();
        if(this.state.selectedYear !== "" && this.state.selectedTerm !== "") 
        {
            
            let postBody = { 
                Projects:this.state.gridData.Projects, 
                Students:this.state.gridData.Students, 
                term:this.state.gridData.Term,  
                year:this.state.selectedYear
            }
            fetch(domain+"/RunAlg/", {
                method: 'POST',
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(postBody)
            })
            .then((response => {
                response.json().then(data =>{
                    data["Term"] = this.state.selectedTerm;
                    this.setState({gridData: data}, () => {this.setState( {gridLoadToggle: true} ) } );
                });
                this.handleGetSchedulerRunVersions();
            })
            ).catch(err => err);
            this.setState( {gridLoadToggle: false} );
        }
    }

    /*
        handleGetStudentByID is an API call to POST
        grabs selected student data by id

        params to be sent are in JSON
        { "ID": X}

        response is in JSON
        {
            "model": "quickstart.student", 
            "pk": X, 
            "fields": 
            {
                "firstName": "",
                "lastName": "", 
                "knightsEmail": "X@a.com",
                "term": "",
                "year": "20XX", 
                "UCFID": X, 
                "overallGPA": X.X, 
                "majorGPA": X.X, 
                "intrestArea": "", 
                "technicalSkills": "", 
                "knownLanguages": "", 
                "workExperience": "", 
                "resumeLink": "N/A", 
                "authID": X, 
                "CanDoBoth": true, 
                "Bootcamp": true, 
                "CurrentTerm": "fall", 
                "CurrentYear": "20XX", 
                "OpenQuestion": ""
            }
        }
    */
    handleGetStudentByID(id) {
            let postBody = { 
                ID: id
            }
            fetch(domain+"/GetStudentByID/", {
                method: 'POST',
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(postBody)
            })
            .then((response => {
                response.json().then(data =>{
                    this.setState({currentStudent: data[0].fields});
                });
            })
            ).catch(err => err);
    }

    /*
        handleGetProjectByID grabs current project data from gridData based on id
    */
    handleGetProjectByID(id) {
        if(id >= 0 && id < this.state.gridData.Projects.length)
            this.setState({currentProject: this.state.gridData.Projects[id]});
    }

    /*
        handleFinalizeSchedule is an API call to POST
        tells backend which version for that year and term to use as final teams

        params to be sent are in JSON
        { "year": "20XX", "term":"fall", "fileName":"20XX-XX-XX_XX_XX_XX.txt" }

        response only looks for 200 response for success
        else there was an error
    */
    handleFinalizeSchedule() {
        this.handleSetStatesToDefault();
        if(this.state.selectedYear !== "" && this.state.selectedTerm !== "" && this.state.selectedVersion !== "") 
        {
            this.setState({noError: true});
            let postBody = { version:this.state.selectedVersion, year:this.state.selectedYear, term:this.state.selectedTerm }
            fetch(domain+"/FinalizeScheduleVersion/", {
                method: 'POST',
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(postBody)
            })
            .then((response => { 
                if(response.status !== 200) 
                    this.setState({noError: false, errorMessage: "Version Finalize Failed " + response.statusText});
                this.handleGetSchedulerRunVersions();
            })
            ).catch(err => err);
            this.setState( {gridLoadToggle: false} );
        }
        else
            this.setState({errorMessage: "select Version to Finalize"});
    }

    /*
        toggleVersions sets the version options to be rendered for selection
    */
    toggleVersions() {
        let newState = !(this.state.VersionSelectToggle);
        this.handleGetSchedulerRunVersions();
        this.setState( {VersionSelectToggle: newState});
    }

    /*
        toggleShowStudent sets the student data to be rendered for view
    */
    toggleShowStudent() {
        let newState = !(this.state.showStudent);
        this.setState( {showStudent: newState, showProject: false} );
    }

    /*
        toggleShowProject sets the project data to be rendered for view
    */
    toggleShowProject() {
        let newState = !(this.state.showProject);
        this.setState( {showProject: newState, showStudent: false} );
    }

    /*
        toggleHelp sets the help dialogue to be rendered for view
    */
    toggleHelp() {
        let newState = !(this.state.helpToggle);
        this.setState( {helpToggle: newState} );
    }

    /*
        toggleLegend sets the legend dialogue to be rendered for view
    */
    toggleLegend() {
        let newState = !(this.state.legendToggle);
        this.setState( {legendToggle: newState} );
    }

    /*
        setStudentPriority sets the selected students priority to be shown if assigned or blocked in Grid
    */
    setStudentPriority(value) {
        this.setState({studentPriorityValue: value});
    }

    render() {

        //maps every year in versionData to be selected
        let optionYears = this.state.versionData.map((item)=> <option key={item.year}>{item.year}</option>)

        //maps every version in versionOptions to be selected
        let optionVersions = this.state.versionOptions.map((item)=> {
            return <option key={item} value={item}>{item}</option>
        } )

        //renders version select if toggle is true
        let selectVersions = ( this.state.VersionSelectToggle ? 
            <Input defaultValue="null" onChange={this.handleVersionChange} value={this.state.value} type="select" name="selectVersion" style={{ width: '20%' }} >
                <option disabled value="null">Select Version</option>
                {optionVersions}
            </Input> 
            : null)
        
        //renders Grid component if toggle is true and roster statistics if applicable
        let gridLoad = ( this.state.gridLoadToggle ? 
        <div>
            {((this.state.gridData.hasOwnProperty("totalStudents")) ? 
            //statistics display
            <div className="display-student-outer">
                <div className="display-student-inner">
                    <Container >
                        <Row>
                            <Col>Total Students<br/>{this.state.gridData.totalStudents}</Col>
                            <Col>Percentage Assigned One of Their Top Three Priorities<br/>
                                {((this.state.gridData.studentsFirstChoice + this.state.gridData.studentsSecondChoice 
                                    + this.state.gridData.studentsThirdChoice)/(this.state.gridData.totalStudents))*100}%
                            </Col>
                        </Row>
                        <Row>
                            <Col>1st Priority Assigned: {this.state.gridData.studentsFirstChoice}</Col>
                            <Col>2nd Priority Assigned: {this.state.gridData.studentsSecondChoice}</Col>
                            <Col>3rd Priority Assigned: {this.state.gridData.studentsThirdChoice}</Col>
                        </Row>
                    {(this.state.studentPriorityValue !== 20 ? 
                        <Row>
                            <Col>Priority Was {this.state.studentPriorityValue}</Col>
                        </Row> : null) }
                    </Container>
                </div>
            </div> : null)}

            <Grid 
                // props are passed into Grid here to be accessed with this.props inside Grid
                gridData={this.state.gridData}
                currentStudent={this.state.currentStudent} 
                currentProject={this.state.currentProject} 
                handleRunAlg={this.handleRunAlg} 
                toggleVersions={this.toggleVersions} 
                handleGetStudentByID={this.handleGetStudentByID} 
                handleGetProjectByID={this.handleGetProjectByID}
                handleGetUnassignedSchedule={this.handleGetUnassignedSchedule} 
                handleGetSchedulerRunVersions={this.handleGetSchedulerRunVersions} 
                handleGetSchedule={this.handleGetSchedule} 
                handleGetScheduleByVersion={this.handleGetScheduleByVersion} 
                handleFinalizeSchedule={this.handleFinalizeSchedule} 
                toggleShowStudent = {this.toggleShowStudent}
                toggleShowProject = {this.toggleShowProject}
                setStudentPriority = {this.setStudentPriority}
                highPriorityValue = {this.state.highPriorityValue}
                lowPriorityValue = {this.state.lowPriorityValue}
                choice1st = {this.state.choice1st}
                choice2nd = {this.state.choice2nd}
                choice3rd = {this.state.choice3rd}
                highGPA = {this.state.highGPA}
                averageGPA = {this.state.averageGPA}
                lowGPA = {this.state.lowGPA}
                />
            </div>
            : null)
        
        //renders errorlog if noError is false
        let errorLog = (!this.state.noError ?
            <div className="isa-error">{this.state.errorMessage}</div>
            : null)

        //renders helpDisplay if helpToggle is true
        let helpDisplay = (this.state.helpToggle ?
            <div className="display-student-outer">
                <div className="display-student-inner">
                    <Container >
                        <Row>
                            <Col>Step 1: Load Year and Term </Col>
                        </Row>
                        <Row>
                            <Col>Step 2: Unlock Grid to Edit</Col>
                        </Row>
                        <Row>
                            <Col>Step 3: Manipulate Students by Double Clicking Cells or Locking in Students Through Student Options</Col>
                        </Row>
                        <Row>
                            <Col>Step 4: Click Run to Send Data Through Algorithm to Create a Version</Col>
                        </Row>
                        <Row>
                            <Col>Step 5: Repeat Step 2-4 Until Desired Results</Col>
                        </Row>
                        <Row>
                            <Col>Step 6: Select Desired Version and Finalize to Issue Groups</Col>
                        </Row>
                    </Container>
                </div>
            </div>
            : null)
        
        //renders legendDisplay if legendToggle is true
        let legendDisplay = (this.state.legendToggle ?
            <div className="display-student-outer">
                <div className="display-student-inner" style={{width:"100%"}}>
                    <Container>
                        <Row>
                        <Col >Student Key
                            <br />
                            <Col style={{borderRadius: "0px"}}>
                                <div className="legend-wrapper">Student Assignment is Locked In<div className="locked-cell div-right">John Doe</div></div>
                            </Col>
                            <Col style={{borderRadius: "0px"}}>
                                <div className="legend-wrapper">Students GPA is Higher than {this.state.highGPA}<div className="high-gpa div-right">John Doe</div></div>
                            </Col>
                            <Col style={{borderRadius: "0px"}}>
                                <div className="legend-wrapper">Students GPA is Between {this.state.highGPA} and {this.state.averageGPA}<div className="above-average-gpa div-right">John Doe</div></div>
                            </Col>
                            <Col style={{borderRadius: "0px"}}>
                                <div className="legend-wrapper">Students GPA is Between {this.state.averageGPA} and {this.state.lowGPA}<div className="below-average-gpa div-right">John Doe</div></div>
                            </Col>
                            <Col style={{borderRadius: "0px"}}>
                                <div className="legend-wrapper">Students GPA is Lower than {this.state.lowGPA}<div className="low-gpa div-right">John Doe</div></div>
                            </Col>
                        </Col>

                        <Col >Project Key
                            <br />
                            <Col style={{borderRadius: "0px"}}>
                                <div className="legend-wrapper">Many Students Highly Prioritize this Project<div className="header-oversaturated-project div-right">Assigned</div></div>
                            </Col>
                            <Col style={{borderRadius: "0px"}}>
                                <div className="legend-wrapper">Few Students Highly Prioritize this Project<div className="header-undersaturated-project div-right">Blocked</div></div>
                            </Col>
                            <Col style={{borderRadius: "0px"}}> 
                                <div className="legend-wrapper">Project is at Max Capacity<div className="header-full-project div-right">-</div></div>
                            </Col>
                            <Col style={{borderRadius: "0px"}}> 
                                <div className="legend-wrapper">Project Meets or is Above Min Capacity<div className="header-minimum-satisfied-project div-right">-</div></div>
                            </Col>
                            <Col style={{borderRadius: "0px"}}> 
                                <div className="legend-wrapper">Project is Over Max Capacity<div className="header-over-capacity-project div-right">-</div></div>
                            </Col>
                        </Col>

                        <Col >Cross Section Key
                            <br />
                            <Col style={{borderRadius: "0px"}}>
                                <div className="legend-wrapper">Student Assigned to Project<div className="assigned-cell div-right">Assigned</div></div>
                            </Col>
                            <Col style={{borderRadius: "0px"}}>
                                <div className="legend-wrapper">Student Blocked from Project<div className="blocked-cell div-right">Blocked</div></div>
                            </Col>
                            <Col style={{borderRadius: "0px"}}> 
                                <div className="legend-wrapper">Project Not in Students Priority List<div className="non-priority-cell div-right">-</div></div>
                            </Col>
                        </Col>
                        
                        </Row>
                    </Container>
                </div>
            </div>
            : null)

        //renders studentInfo if there is a current student selected on the grid and the toggle showStudent is true
        let studentInfo = ((Object.entries(this.state.currentStudent).length!== 0 && this.state.showStudent) ?
        <div className="display-student-outer">
            <div className="display-student-inner">
        <Container >
        <Row>
          <Col>{this.state.currentStudent.firstName} {this.state.currentStudent.lastName}</Col>
        </Row>
        <Row></Row>
        <Row>
          <Col>UCFID: {this.state.currentStudent.UCFID}</Col>
          <Col>Knights Email: {this.state.currentStudent.knightsEmail}</Col>
        </Row>
        <Row>
          <Col>{(this.state.currentStudent.bootcamp ? "Attending Bootcamp": "Not Attending Bootcamp")}</Col>
          <Col>Major GPA: {this.state.currentStudent.majorGPA}</Col>
          <Col>Overall GPA: {this.state.currentStudent.overallGPA}</Col>
          <Col>Wants {this.state.currentStudent.term.charAt(0).toUpperCase()+this.state.currentStudent.term.slice(1)} SD2 Term</Col>
        </Row>
        <Row>
            <Col >Technical Skills: <br/> {this.state.currentStudent.technicalSkills}</Col>
            <Col >Work Experience: <br/> {this.state.currentStudent.workExperience}</Col>
            <Col >Known Languages: <br/> {this.state.currentStudent.knownLanguages}</Col>
        </Row>
        <Row>
            <Col >Open-ended Response: <br/> {this.state.currentStudent.OpenQuestion}</Col>
        </Row>
        </Container>
        </div>
        </div>
        : null)

        //renders projectInfo if there is a current project selected on the grid and the toggle showProject is true
        let projectInfo = ((Object.entries(this.state.currentProject).length!== 0 && this.state.showProject) ?
        <div className="display-student-outer">
            <div className="display-student-inner">
        <Container >
        <Row>
          <Col>{this.state.currentProject.Name}</Col>
        </Row>

        {( this.state.gridData.term === "Spring" ?
        <Row>
            {((this.state.currentProject.canDoFall === 1 && this.state.currentProject.canDoSummer === 1) ?
            <Col>Either Fall or Summer Project</Col>
            : 
            (this.state.currentProject.canDoFall === 1) ? 
                <Col>Fall Project</Col>
                : 
                <Col>Summer Project</Col>
            )}
        </Row> 
        : null)}

        <Row>
          <Col>Maximum Students: {this.state.currentProject.Max}</Col>
          <Col>Minimum Student: {this.state.currentProject.Min}</Col>
          <Col>Current Students: {this.state.currentProject.CurrentStudents}</Col>
        </Row>
        <Row>
            {((this.state.currentProject.Priority === -2) ?
            <Col >Project Cannot be Selected by Algorithm</Col>
            :<Col >Priority: {this.state.currentProject.Priority}</Col>
            )}
        </Row>
        </Container>
        </div>
        </div>
        : null)

        return (
            <Container>
                <Row>
                    <Router>
                        <Form className="adminBar" style={{ width: '100%',  height:'100%' }}>
                            <div>
                            
                                <nav className="navbar navbar-expand-lg navbar-light">
                                    <ul className="navbar-nav mr-auto">
                                        <li><button type="button" className="button" onClick={this.handleBack}>Return</button></li>
                                        <li><button type="button" className="small button" onClick={this.toggleHelp}>
                                            Help
                                            </button>
                                        </li>
                                        <li><button type="button" className="small button" onClick={this.toggleLegend}>
                                            Legend
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                                
                                <nav className="navbar navbar-expand-lg navbar-light">
                                <Input defaultValue="null" onChange={this.handleYearChange} value={this.state.value} type="select" name="selectYear" style={{ width: '20%' }} >
                                    <option disabled value="null">Select Year</option>
                                    {optionYears}
                                </Input>
                                
                                <Input defaultValue="null" onChange={this.handleTermChange} value={this.state.value} type="select" name="selectTerm" style={{ width: '20%' }} >
                                    <option disabled value="null">Select Term</option>
                                    <option key="Spring" value="Spring">Spring</option>
                                    <option key="Summer" value="Summer">Summer</option>
                                    <option key="Fall" value="Fall">Fall</option>
                                </Input>
                                {selectVersions}
                                </nav>
                                
                                {errorLog}
                                {helpDisplay}
                                {legendDisplay}
                                {studentInfo}
                                {projectInfo}
                                {gridLoad}
                            </div>
                        </Form>
                    </Router>
                </Row>
            </Container>
        );
    }
}

// GridContainerPage will only be accessable if authentication passes
export default withAuth(GridContainerPage);