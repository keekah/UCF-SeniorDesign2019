import React, { Component } from 'react';
import {
  Row, Container, Col, Form,
  FormGroup, Label, Input,
  Button, FormText, FormFeedback,
} from 'reactstrap';
import './SDForm.css';
import logo from'./UCFLogo.png';
import './App.css';
import ReactDOM from 'react-dom';
import { withRouter } from 'react-router-dom';
import { ReactComponent as DragnDrop } from "./dnd.svg";
import AuthService from './AuthService';
import withAuth from './withAuth'; 
import { ID } from './LoginPage';
import axios from 'axios';

const title_URL = "http://10.171.204.211/GetProjects/";
const Auth = new AuthService();



class SDForm extends Component {
  constructor(props) { 
    super(props);

    this.state = {
      firstName: "",
      lastName: "",
      knightsEmail: "",
      UCFID: "",
      overallGPA: "",
      majorGPA: "",
      term: [],
      year: "2020",         // Update this variable for the semester SD 2 is going to take place
      bootcamp: "",
      interestArea: "",
      technicalSkills: "",
      knownLanguages: "",
      workExperience: "",
      OpenQuestion: "",
      studentRanking: [],
      items: [],
      other: [],
      file: null,
      currTerm: "fall",     // Update for current term being submitted to
      currYear: "2019",     // Update for current term being submitted to
      ID: "",
      errors: {},
    }
    this.Auth = new AuthService();
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }

  componentDidMount() {
    fetch(title_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        year: this.state.currYear,
        term: this.state.currTerm
      })
      })
      .then(response => {
        return response.json();
      })
      .then(data => {
        this.setState({
          other: data.results.map(({ ProjectName }) => ProjectName)
        })
      }) 
  }

  handleFormSubmit(e) {
    e.preventDefault();
    if(this.validateForm()){
      console.log(this.state);
    
    this.state.ID = ID;
    let userData = this.state;
    this.uploadHandler();
    
    fetch("http://10.171.204.211/SubmitAssignmentOne/", {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    })
    .then(
        this.props.history.push('/FormSubmitted')
      );
    }
  }

  fileChangedHandler = event => {
    this.setState({ file: event.target.files[0] })
  }

  uploadHandler = () => {
    console.log(this.state.file)
    const formData = new FormData()
    formData.append(
    'file',
    this.state.file,
    this.state.file.name
  )
  axios.post(('http://10.171.204.211/UploadStudentResume/?ID=' + ID), formData)
  }
  

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
    
  }

  handleArrChange = (item,event) => {
    const value = event.target.value
    this.setState(prev => {
      const idx = prev.studentRanking.findIndex(obj => obj.ProjectName === item)
      if(idx > -1) {
           return {
            studentRanking: [...prev.studentRanking.slice(0, idx), {ProjectName: item, priority: value}, ...prev.studentRanking.slice(idx + 1,)]
           }
      } else {
          return {
            studentRanking: prev.studentRanking.concat([{ProjectName: item, priority: value}])
           }
      }

    });
  }

  validateForm() {

    let fields = this.state;
    let errors = {};
    let formIsValid = true;

    if (!fields.firstName) {
      formIsValid = false;
      errors["firstName"] = "*Please enter your first name.";
    }

    if (typeof fields.firstName !== "undefined") {
      if (!fields.firstName.match(/^[a-zA-Z ]*$/)) {
        formIsValid = false;
        errors["firstName"] = "*Please enter alphabet characters only.";
      }
    }

    if (!fields.lastName) {
      formIsValid = false;
      errors["lastName"] = "*Please enter your last name.";
    }

    if (typeof fields.lastName !== "undefined") {
      if (!fields.lastName.match(/^[a-zA-Z ]*$/)) {
        formIsValid = false;
        errors["lastName"] = "*Please enter alphabet characters only.";
      }
    }

    if (!fields.knightsEmail) {
      formIsValid = false;
      errors["knightsEmail"] = "*Please enter your knights email.";
    }

    if (typeof fields.knightsEmail !== "undefined") {
      var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
      if (!pattern.test(fields.knightsEmail)) {
        formIsValid = false;
        errors["knightsEmail"] = "*Please enter valid knights email.";
      }
    }

    if (!fields.UCFID) {
      formIsValid = false;
      errors["UCFID"] = "*Please enter your UCFID";
    }

    if (typeof fields.UCFID !== "undefined") {
      if (!fields.UCFID.match(/^[0-9]{7}$/)) {
        formIsValid = false;
        errors["UCFID"] = "*Please enter a valid UCFID";
      }
    }

    if (!fields.overallGPA) {
      formIsValid = false;
      errors["overallGPA"] = "*Please enter overall GPA";
    }

    if (typeof fields.overallGPA !== "undefined") {
      if(!fields.overallGPA.match(/^[-+]?[0-9]+\.[0-9]+$/) || (fields.overallGPA > 5) || (fields.overallGPA < 0)) {
        formIsValid = false;
        errors["overallGPA"] = "*Please enter a valid GPA on a 4.0 scale"
      }
    }

    if (!fields.majorGPA) {
      formIsValid = false;
      errors["majorGPA"] = "*Please enter major GPA";
    }

    if (typeof fields.majorGPA !== "undefined") {
      if(!fields.majorGPA.match(/^[-+]?[0-9]+\.[0-9]+$/) || (fields.majorGPA > 5) || (fields.majorGPA < 0)) {
        formIsValid = false;
        errors["majorGPA"] = "*Please enter a valid GPA on a 4.0 scale"
      }
    }

    if (fields.term.length === 0) {
      formIsValid = false;
      errors["term"] = "*Please select at least one term";
    }

    if (!fields.bootcamp) {
      formIsValid = false;
      errors["bootcamp"] = "*Please select an option";
    }

    if (!fields.interestArea) {
      formIsValid = false;
      errors["interestArea"] = "*Please enter some relevant information";
    }

    if (!fields.technicalSkills) {
      formIsValid = false;
      errors["technicalSkills"] = "*Please enter some relevant information";
    }

    if (!fields.knownLanguages) {
      formIsValid = false;
      errors["knownLanguages"] = "*Please enter some relevant information";
    }

    if (!fields.workExperience) {
      formIsValid = false;
      errors["workExperience"] = "*Please enter some relevant information";
    }

    if(fields.studentRanking.length !== fields.other.length) {
      formIsValid = false
      errors["studentRanking"] = "*Please rank all projects from 0-10"
    }

    if(fields.studentRanking.length === fields.other.length) {
      for(var i = 0; i < fields.studentRanking.length; i++) {
        if(fields.studentRanking[i].priority === "" || fields.studentRanking[i].priority > 10 || fields.studentRanking[i].priority < 0) {
          formIsValid = false
          errors["studentRanking"] = "*Please rank ALL projects from 0-10"
        }
      }
    }

    if(fields.file === "") {
      formIsValid = false;
      errors["file"] = "*Please add your resume"
    }

    if(formIsValid === false) {
      errors["errorFound"] = "*Please check for errors in red above"
    }

    this.setState({
      errors: errors
    });
    return formIsValid;


  }

  handleMultTerms = event => {
    var arr = this.state.term
    if(arr.includes(event.target.value)) {
      var index = arr.indexOf(event.target.value);
      arr.splice(index, 1);
    }
    else
      arr.push(event.target.value)        
    this.setState({
      term: arr
    })
  }


  printToConsole = () => {
    console.log(this.state.file) 
  }
  
  render() {
    return (
      <Container>
        <Col className="UCFLogo"><img src={logo} /></Col> 
        
        <Form className="SDForm">
          <Col>
            <h1 className="mainTitles">Senior Design Project Selection</h1>
          </Col>
          <Row className="form">
            <Col> 
              <FormGroup>
                <Label>First Name</Label>
                <Input type="text" id="firstName" onChange={this.handleChange.bind(this)} value={this.state.firstName}/>
                <div className="errorMsg">{this.state.errors.firstName}</div>
              </FormGroup>
            </Col>
            <Col> 
              <FormGroup>
                <Label>Last Name</Label>
                <Input type="text" id="lastName" onChange={this.handleChange.bind(this)} value={this.state.lastName} />
                <div className="errorMsg">{this.state.errors.lastName}</div>
              </FormGroup>
            </Col>
          </Row>

          <Col xs="6">
            <FormGroup>
              <Label>UCF ID</Label>
              <Input type="number" id="UCFID" onChange={this.handleChange.bind(this)} value={this.state.UCFID} />
              <FormText className="text-muted">
                7 digit student ID
              </FormText>
              <div className="errorMsg">{this.state.errors.UCFID}</div>
            </FormGroup>

            <FormGroup>
              <Label>Knights Email</Label>
              <Input type="email" id="knightsEmail" onChange={this.handleChange.bind(this)} value={this.state.knightsEmail} />
              <FormText className="text-muted">
                example@knights.ucf.edu
              </FormText>
              <div className="errorMsg">{this.state.errors.knightsEmail}</div>
            </FormGroup>
          </Col>

          <Row className="form">
            <Col> 
              <FormGroup>
                <Label>Overall GPA</Label>
                <Input type="number" id="overallGPA" onChange={this.handleChange.bind(this)} value={this.state.overallGPA} />
                <div className="errorMsg">{this.state.errors.overallGPA}</div>
              </FormGroup>
            </Col>
            <Col> 
              <FormGroup>
                <Label>Major GPA</Label>
                <Input type="number" id="majorGPA" onChange={this.handleChange.bind(this)} value={this.state.majorGPA} />
                <div className="errorMsg">{this.state.errors.majorGPA}</div>
              </FormGroup>
            </Col>
          </Row>

          <Col xs="6">
            <FormGroup tag="fieldset">
              <Label>Will you attend Bootcamp?</Label>
              <FormGroup check>
                <Label check>
                  <Input type="radio" name="bootcamp" id="bootcamp" onChange={this.handleChange.bind(this)} value="True" checked={this.state.bootcamp === "True"} />{' '}
                  Yes
                </Label>
              </FormGroup>
              <FormGroup check>
                <Label check>
                  <Input type="radio" name="bootcamp" id="bootcamp" onChange={this.handleChange.bind(this)} value="False" checked={this.state.bootcamp ==="False"} />{' '}
                  No
                </Label>
              </FormGroup>
            </FormGroup>
            <div className="errorMsg">{this.state.errors.bootcamp}</div>
          </Col>

          <Col xs="6">
            <FormGroup tag="fieldset">
              <Label>Which semester will you be taking Senior Design 2?</Label>
              <FormGroup check>
                <Label check>
                  <Input type="checkbox" name="term" id="term" onChange={this.handleMultTerms.bind(this)} value="Spring" />{' '}
                  Spring
                </Label>
              </FormGroup>
              <FormGroup check>
                <Label check>
                  <Input type="checkbox" name="term" id="term" onChange={this.handleMultTerms.bind(this)} value="Summer" />{' '}
                  Summer
                </Label>
              </FormGroup>
              <FormGroup check>
                <Label check>
                  <Input type="checkbox" name="term" id="term" onChange={this.handleMultTerms.bind(this)} value="Fall" />{' '}
                  Fall
                </Label>
              </FormGroup>
            </FormGroup>
            <div className="errorMsg">{this.state.errors.term}</div>
          </Col>

          <Col xs="9">
            <FormGroup>
              <Label> Area(s) of Interest</Label>
              <Input type="textarea" id="interestArea" onChange={this.handleChange.bind(this)} value={this.state.interestArea} />
              <div className="errorMsg">{this.state.errors.interestArea}</div>
            </FormGroup>
            <FormGroup>
              <Label> Technical Skills/Strengths</Label>
              <Input type="textarea" id="technicalSkills" onChange={this.handleChange.bind(this)} value={this.state.technicalSkills} />
              <div className="errorMsg">{this.state.errors.technicalSkills}</div>
            </FormGroup>
            <FormGroup>
              <Label> Known Programming Languages</Label>
              <Input type="textarea" id="knownLanguages" onChange={this.handleChange.bind(this)} value={this.state.knownLanguages} />
              <div className="errorMsg">{this.state.errors.knownLanguages}</div>
            </FormGroup>
            <FormGroup>
              <Label> Relevant Work Experience</Label>
              <Input type="textarea" id="workExperience" onChange={this.handleChange.bind(this)} value={this.state.workExperience} />
              <div className="errorMsg">{this.state.errors.workExperience}</div>
            </FormGroup>
            <FormGroup>
              <Label> Other Information (Optional)</Label>
              <FormText className="text-muted">
                Here, you may enter any other relevant information you'd like the instructor to know about yourself or your project choosings
              </FormText>
              <Input type="textarea" id="OpenQuestion" onChange={this.handleChange.bind(this)} value={this.state.OpenQuestion} />
              <div className="errorMsg">{this.state.errors.OpenQuestion}</div>
            </FormGroup>
          </Col>


          <Col>
              <h1 className="rankTitles">Project Rankings</h1>
              <h6 className="otherText">Please rank the projects below based on your preference, the lower number being the one you most desperately want to undertake, and the highest, the least. You must rank at least 10 projects. You may rank multiple projects with the same level of preference.</h6>
          </Col>


            
          <div className="borderRank">
          <Row className="App">
            <ul>
              {this.state.other.map((item, index) =>
                <li key={index}>{item}<Input className="rankCols" type="number" id="ranking" onChange={this.handleArrChange.bind(this, item)} /></li>
              )}
            </ul>
          </Row>
          <Row className="subTitle">
            <div className="errorMsg">{this.state.errors.studentRanking}</div>
          </Row>
          
          </div>
      
        
        <Col>
          <FormGroup>
            <Label for="file">Resume</Label>
            <Input type="file" onChange={this.fileChangedHandler}></Input>
            <FormText className="text-muted">
              Upload your resume
            </FormText>
            <div className="errorMsg">{this.state.errors.file}</div>
          </FormGroup>
        </Col>
          

        <Col className="subTitle">
          <Button onClick={this.handleFormSubmit}>Submit</Button>
          <div className="errorMsg">{this.state.errors.errorFound}</div>
        </Col>
      </Form>
      </Container>
    );
  }
}

export default withAuth(SDForm); 