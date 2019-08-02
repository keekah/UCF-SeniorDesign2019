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
  FormFeedback,
  CustomInput
} from "reactstrap";
import "./SDForm.css";
import logo from "./UCFLogo.png";
import "./index.css";
import "./App.css";
import { year, term } from "./AdminApp";
import Axios from 'axios';
const FileDownload = require('js-file-download');


class ViewStudents extends Component {
  constructor(props) {
    super(props);

    this.state = {
      students: [],
      year: year,
      term: term,
      IDs: [],
      checked: false
    }
    this.handleDelete = this.handleDelete.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.renderTableData = this.renderTableData.bind(this);
  }

  getData= () => {
    fetch("http://10.171.204.211/GetStudents/", {
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
        students: data.map(item => ({
          firstName: item.fields.firstName,
          lastName: item.fields.lastName,
          UCFID: item.fields.UCFID,
          term: item.fields.term,
          year: item.fields.year,
          id: item.fields.authID,
        }))
      })
    })
    .catch( err => {
        console.log(err)
      })
  }

  componentWillMount() {
    this.getData();
  }

  handleDelete = event => {
    var arr = this.state.IDs
    if(arr.includes(event.target.value)) {
      var index = arr.indexOf(event.target.value);
      arr.splice(index, 1);
    }
    else
      arr.push(event.target.value)        
    this.setState({
      IDs: arr
    })
  }

  printToConsole = () => {
    console.log(this.state) 
  }

  downloadResume = event => {
    var stID = event.target.value;

    Axios.get('http://10.171.204.211/DownloadStudentResume/', {
      responseType: 'arraybuffer',
      params: {
        ID: stID
      }
    })
   .then((response) => {
        console.log(response)
        FileDownload(response.data, 'resume.pdf');
   })
   .catch( err =>
      alert("No resume submitted")
    )
  }

  handleSubmit() {
    console.log(this.state);

    fetch("http://10.171.204.211/DeleteStudent/", { ///////// change 
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.state)
    })
    .then(() => {
      this.getData();
    })
  }

  renderTableData() {
    return this.state.students.map((student, index) => {
       const { firstName, lastName, UCFID, term, year, id } = student //destructuring
       return (
          <tr>
             <td>{firstName}</td>
             <td>{lastName}</td>
             <td>{UCFID}</td>
             <td>{term}</td>
             <td>{year}</td>
             <td><Button onClick={this.downloadResume.bind(this)} name={id} value={id}>X</Button></td>
             <td><label>
                    <input className="checkboxes" type="checkbox" name={id} value={id} 
                    onChange={this.handleDelete.bind(this)} />
                </label></td>
          </tr>
       )
    })
  }

  render() {
    return (
      <Container>
        <Form className="SDForm">
          <Col  className="subTitle">
            <h1 className="mainTitles">View Students</h1>
          </Col>
          <div>
          <table id='projects'>
               <tbody>
               <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>UCFID</th>
                <th>Term</th>
                <th>Year</th>
                <th>Resume</th>
                <th>Delete</th>
               </tr>
               {this.renderTableData()}
               </tbody>
            </table>
          </div>
          <Button onClick={this.handleSubmit}>Delete</Button>
        </Form> 
      </Container>
    );
  }
}

export default ViewStudents;