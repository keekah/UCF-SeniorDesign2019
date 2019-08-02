import React, { Component } from 'react';
import { Container, Col, Form, Label } from 'reactstrap';
import './SDForm.css';
import logo from'./UCFLogo.png';
import './App.css';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import NewTerm from './NewTerm';
import TermView from './TermView';
import Students from './Students';
import ViewStudents from './ViewStudents';
import Select from 'react-select';
import ViewGroups from './ViewGroups';
import withAuth from './withAuth'; 

let year = "2019";    // Change this to change default year
let term = "fall";    // Change this to change default term

const yearOptions = [
  { value: '2017', label: '2017' },
  { value: '2018', label: '2018' },
  { value: '2019', label: '2019' },
  { value: '2020', label: '2020' },
  { value: '2021', label: '2021' },
];

const termOptions = [
  { value: 'spring', label: 'Spring' },
  { value: 'summer', label: 'Summer' },
  { value: 'fall', label: 'Fall' },
];

class AdminApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTermOption: null,
      selectedYearOption: null,
      dropdownOpen: false
    }
    this.toggle = this.toggle.bind(this);
    this.handleGrid = this.handleGrid.bind(this);
    
  }

  handleTermChange = selectedTermOption => {
    this.setState({ selectedTermOption });
    term = selectedTermOption.value;
  }
  
  handleYearChange = selectedYearOption => {
    this.setState({ selectedYearOption });
    year = selectedYearOption.value;
  }
  
  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  select(event) {
      term = event.target.innerText;
  }

  handleGrid() {
    this.props.history.push('/GridContainerPage');
  }
  

  render() {
    const { selectedTermOption, selectedYearOption } = this.state;

    return (
      <Container>
        <Router>
          <Col className="UCFLogo">
            <img src={logo} />
          </Col>
          <Form className="adminBar">
            <div>
              <nav  className="navbar navbar-expand-lg navbar-light">
            <ul className="navbar-nav mr-auto">
            <li><Link to={'/newterm'} className="nav-link">Add Project</Link></li>
            <li><Link to={'/viewterms'} className="nav-link">View Projects</Link></li>
            <li><Link to={'/students'} className="nav-link">Add Students</Link></li>
            <li><Link to={'/viewstudents'} className="nav-link">View Students</Link></li>
            <li><Link to={'/viewgroups'} className="nav-link">Groups</Link></li>
            <li><Label onClick={this.handleGrid} className="nav-link">Grid</Label></li>
            <li><Select className="setApp2"
                  value={selectedTermOption}
                  onChange={this.handleTermChange}
                  options={termOptions}
                  placeholder="Term" />
            </li>
            <li><Select className="setApp"
                  value={selectedYearOption}
                  onChange={this.handleYearChange}
                  options={yearOptions}
                  placeholder="Year" />
            </li>
            </ul>
            </nav>
            <hr />
          <Switch>
              <Route exact path='/' component={AdminDashboard} />
              <Route path='/newterm' component={NewTerm} />
              <Route path='/viewterms' component={TermView} />
              <Route path='/students' component={Students} />
              <Route path='/viewstudents' component={ViewStudents} />
              <Route path='/viewgroups' component={ViewGroups} />
          </Switch>     
            </div>
          </Form>
        </Router>
        <h6 className="subTitle">Select a Year and Term to begin</h6>
      </Container>
    );
  }
}

export default withAuth(AdminApp);
export { year, term };