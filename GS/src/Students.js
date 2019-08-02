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
  FormFeedback
} from "reactstrap";
import "./SDForm.css";
import logo from "./UCFLogo.png";
import "./index.css";
import axios from 'axios';

class Students extends Component {
  constructor(props) {
    super(props);

    this.state = {
      stuText: "",
      emails: [],
      file: null,
      subMsg: {}
    }
    this.printToConsole = this.printToConsole.bind(this);
    this.handleEmails = this.handleEmails.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
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
  axios.post("http://10.171.204.211/SubmitStudentRoster/", formData)
  }

  handleSubmit(e) {
    e.preventDefault();
    this.handleEmails();

    if(this.validateForm()){
    fetch("http://10.171.204.211/CreateUser/", { ///////// change 
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.state)
    })
    alert('Student accounts have been created and emails have been sent!');
    }
  }

  validateForm() {
    let fields = this.state;
    let subMsg = {};
    let formIsValid = true;
    
    if(!(fields.emails.length > 1) && !(fields.emails[0] !== "")) {
      console.log(fields.emails[0])
      formIsValid = false;
      subMsg["subMsg"] = "Please enter at least one email";
    }

    this.setState({
      subMsg: subMsg
    });
    return formIsValid;
  }

  handleEmails = () => {
    var students = this.state.stuText;
    var ar = students.split(' '); 
    this.state.emails = ar;
  };
  
  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  printToConsole = () => {
    console.log(this.state);
  }


  render() {
    return (
      <Container>

        <Form className="SDForm">
          <Col>
            <h1 className="mainTitles">Add Students</h1>
          </Col>
          <Col> 
            <FormGroup>
              <Label for="file">Class Roster CSV</Label>
              <Input type="file" onChange={this.fileChangedHandler}/>
            </FormGroup>
            <Button onClick={this.uploadHandler}>Upload CSV</Button>
            <FormGroup>
              <Label>Student Emails</Label>
              <FormText className="text-muted">
                Enter emails separated with a space
              </FormText>
              <Input type="text" id="stuText" onChange={this.handleChange.bind(this)} value={this.state.stuText}/>
            </FormGroup>
            <Button onClick={this.handleSubmit}>Add</Button>
            <div className="errorMsg">{this.state.subMsg.subMsg}</div>

              
            </Col>
        </Form>
      </Container>
    );
  }
}

export default Students;