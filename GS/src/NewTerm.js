import React, { Component } from "react";
import { Container, Col, Form, FormGroup, Label, Input, Button } from "reactstrap";
import "./SDForm.css";
import "./index.css"
import "./App.css"

class NewTerm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sponsor: "",
      sponsor2: "",
      projectName: "",
      year: "",
      term: [],
      min: "",
      max: "",
      errors: {}
    }
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  cancelCourse = () => { 
    this.setState({
      sponsor: "",
      sponsor2: "",
      projectName: "",
      year: "",
      term: [],
      min: "",
      max: "",
      errors: {}
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    let userData = this.state;

    if(this.validateForm()) {
    fetch("http://10.171.204.211/SubmitProject/", {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    })
    this.cancelCourse();
    }
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
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

  validateForm() {

    let fields = this.state;
    let errors = {};
    let formIsValid = true;

    if (!fields.sponsor) {
      formIsValid = false;
      errors["sponsor"] = "*Please enter at least one sponsor";
    }

    if (!fields.projectName) {
      formIsValid = false;
      errors["projectName"] = "*Please enter a project name";
    }

    if (!fields.year) {
      formIsValid = false;
      errors["year"] = "*Please enter year";
    }

    if (fields.term.length === 0) {
      formIsValid = false;
      errors["term"] = "*Please select at least one term";
    }

    if (!fields.min) {
      formIsValid = false;
      errors["min"] = "*Please enter minimun amount of students in project";
    }

    if (!fields.max) {
      formIsValid = false;
      errors["max"] = "*Please enter maximum amount of students in project";
    }

    if(formIsValid === false) {
      errors["errorFound"] = "*Please check for errors in red above"
    }

    this.setState({
      errors: errors
    });
    return formIsValid;
  }

  render() {
    return (
      <Container>
        <Form className="SDForm">
          <Col >
            <h1 className="mainTitles">Add Project</h1>
          </Col>

          <Col>
            <FormGroup>
              <Label>Project Name</Label>
              <Input className="textObject" type="text" id="projectName" onChange={this.handleChange.bind(this)} value={this.state.projectName} />
              <div className="errorMsg">{this.state.errors.projectName}</div>
            </FormGroup>
          </Col>
          <Col>
            <FormGroup>
              <Label>Sponsor 1</Label>
              <Input className="textObject" type="text" id="sponsor" onChange={this.handleChange.bind(this)} value={this.state.sponsor} />
              <div className="errorMsg">{this.state.errors.sponsor}</div>
            </FormGroup>
            <FormGroup>
              <Label>Sponsor 2</Label>
              <Input className="textObject" type="text" id="sponsor2" onChange={this.handleChange.bind(this)} value={this.state.sponsor2} />
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
                  <Input type="checkbox" name="term" id="term" onChange={this.handleMultTerms.bind(this)} value="spring" />{' '}
                  Spring
                </Label>
              </FormGroup>
              <FormGroup check>
                <Label check>
                  <Input type="checkbox" name="term" id="term" onChange={this.handleMultTerms.bind(this)} value="summer" />{' '}
                  Summer
                </Label>
              </FormGroup>
              <FormGroup check>
                <Label check>
                  <Input type="checkbox" name="term" id="term" onChange={this.handleMultTerms.bind(this)} value="fall" />{' '}
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
          <Col className="subTitle">
            <Button onClick={this.handleSubmit}>Add</Button>
            <div className="errorMsg">{this.state.errors.errorFound}</div>
          </Col>
        </Form>
      </Container>
    );
  }
}

export default NewTerm;