import React, { Component } from "react";
import {
  Row,
  Container,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  FormText,
  FormFeedback, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import "./SDForm.css";
import "./index.css"
import "./App.css"
import { year, term } from "./AdminApp";

const title_URL = "http://10.171.204.211/GetProjects/";

class TermView extends Component {
  constructor(props){
    super(props);

    this.state = {
      projects: [],
      year: year,
      term: term,
      modal: false,
      ID: "",
      sponsor: "",
      sponsor2: "",
      projectName: "",
      min: "",
      max: "",
      errors: {}
    }
    this.toggle = this.toggle.bind(this);
    this.printToConsole = this.printToConsole.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  cancelCourse = () => { 
    this.setState({
      sponsor: "",
      sponsor2: "",
      projectName: "",
      min: "",
      max: "",
    });
  }

  handleSubmit() {
    let userData = this.state;
    console.log(this.state)

    fetch("http://10.171.204.211/EditProject/", {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    })
    .then(() => {
      this.getData();
    })
    .catch(err => {
      alert("Fill out all items")
    })
    this.cancelCourse();
    this.toggle()
    
  } 

  toggle() {
    this.setState(prevState => ({
      modal: !prevState.modal
    }));
  }

  getData= () => {
    fetch(title_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        year: this.state.year,
        term: this.state.term
      })
    })
      .then(response => {
        return response.json();
      })
      .then(data => {
        this.setState({
          projects: data.results.map(item => ({
            Sponsor: item.Sponsor,
            Sponsor2: item.Sponsor2,
            ProjectName: item.ProjectName,
            Year: item.Year,
            Term: item.Term,
            ID: item.ID,
          }))
        })
        console.log(data);
      });
  }

  componentWillMount() {
    this.getData();
  }

  editProject = event => {
    
    var projectID = event.target.value
    this.state.ID = projectID;
    this.toggle();
    console.log(this.state)
  }
  
  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  printToConsole() {
    console.log(this.state);
  }

  renderTableData() {
    return this.state.projects.map((project, index) => {
       const { Sponsor, Sponsor2, ProjectName, Year, Term, ID } = project //destructuring
       return (
          <tr>
             <td>{Sponsor}</td>
             <td>{Sponsor2}</td>
             <td>{ProjectName}</td>
             <td>{Year}</td>
             <td>{Term}</td>
             <td><Button onClick={this.editProject.bind(this)} name={ID} value={ID}>-</Button></td>
          </tr>
       )
    })
 }

  render() {
    return (
      <Container>

        <Form className="SDForm">
          <Col>
            <h1 className="mainTitles">Projects</h1>
          </Col>
          <div>
          <table id='projects'>
               <tbody>
               <tr>
                <th>Sponsor 1</th>
                <th>Sponsor 2</th>
                <th>Project Name</th>
                <th>Year</th>
                <th>Term</th>
                <th>Edit</th>
              </tr>
                  {this.renderTableData()}  
               </tbody>
            </table>
          </div>
          <div>

        <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
          <ModalHeader toggle={this.toggle}>Edit Project</ModalHeader>
          <ModalBody>
          <Col>
            <FormGroup>
              <Label>Project Name</Label>
              <Input className="textObjectModal" type="text" id="projectName" onChange={this.handleChange.bind(this)} value={this.state.projectName} />
            </FormGroup>
          </Col>
          <Col>
            <FormGroup>
              <Label>Sponsor 1</Label>
              <Input className="textObjectModal" type="text" id="sponsor" onChange={this.handleChange.bind(this)} value={this.state.sponsor} />
              <div className="errorMsg">{this.state.errors.sponsor}</div>
            </FormGroup>
            <FormGroup>
              <Label>Sponsor 2</Label>
              <Input className="textObjectModal" type="text" id="sponsor2" onChange={this.handleChange.bind(this)} value={this.state.sponsor2} />
            </FormGroup>
          </Col>
          <Col>
            <FormGroup>
              <Label>Year</Label>
              <Input className="textObjectNum" type="number" id="year" onChange={this.handleChange.bind(this)} value={this.state.year} />
              <div className="errorMsg">{this.state.errors.year}</div>
            </FormGroup>
          </Col>
          <Col xs="6">
            <FormGroup tag="fieldset">
              <Label>Term</Label>
              <FormGroup check>
                <Label check>
                  <Input type="checkbox" name="term" id="term" onChange={this.handleChange.bind(this)} value="spring" />{' '}
                  Spring
                </Label>
              </FormGroup>
              <FormGroup check>
                <Label check>
                  <Input type="checkbox" name="term" id="term" onChange={this.handleChange.bind(this)} value="summer" />{' '}
                  Summer
                </Label>
              </FormGroup>
              <FormGroup check>
                <Label check>
                  <Input type="checkbox" name="term" id="term" onChange={this.handleChange.bind(this)} value="fall" />{' '}
                  Fall
                </Label>
              </FormGroup>
              <div className="errorMsg">{this.state.errors.term}</div>
            </FormGroup>
          </Col>
          <Col>
            <FormGroup>
              <Label>Minimum Students</Label>
              <Input className="textObjectNum" type="number" id="min" onChange={this.handleChange.bind(this)} value={this.state.min} />
              <div className="errorMsg">{this.state.errors.min}</div>
            </FormGroup>
          </Col>
          <Col>
            <FormGroup>
              <Label>Maximum Students</Label>
              <Input className="textObjectNum" type="number" id="max" onChange={this.handleChange.bind(this)} value={this.state.max} />
              <div className="errorMsg">{this.state.errors.max}</div>
            </FormGroup>
          </Col>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={this.handleSubmit}>Submit</Button>
          </ModalFooter>
        </Modal>
      </div>
        </Form> 
      </Container>
    );
  }
}

export default TermView;