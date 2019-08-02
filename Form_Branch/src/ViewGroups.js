import React, { Component } from "react";
import { Row, Container, Col, Form, Button } from "reactstrap";
import "./SDForm.css";
import "./index.css";
import { year, term } from "./AdminApp";
import withAuth from './withAuth'; 


class ViewGroups extends Component {
  constructor(props) {
    super(props);

    this.state = {
      groups: [],
      year: year,
      term: term
    }
    this.printToConsole = this.printToConsole.bind(this);
  }
  
  
  componentDidMount() {
    fetch("http://10.171.204.211/GetGroups/", {
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
      console.log(data)
      this.setState({
        groups: data.Groups.map(item => ({
          projectName: item.projectName,
          groupNumber: item.groupNumber,
          students: item.studentList.map(stu => ({
            name: stu.studentName,
            GPA: stu.GPA,
            bootcamp: stu.BC,
          }))
        }))
      })
    })
    .catch( err => {
        console.log(err)
      })
  }

  renderTableData() {
    return this.state.groups.map((group, index) => {
      const { projectName, groupNumber, students } = group
      return (
        <tbody>
          <tr>
            <th>Group {groupNumber}: {projectName}</th>
            <th>GPA</th>
          </tr>
          {students.map((student) => (
            <tr key={student.name}>
              <td>{student.name}</td>
              <td>{student.GPA}</td>
            </tr>
          ))} 
        </tbody>
      )
    })
  }

  printToConsole() {
    console.log(this.state);
  }

  render() {
    return (
      <Container>
        <Form className="SDForm">
          <Col className="subTitle">
            <h1 className="mainTitles">Groups</h1>
          </Col>
          <div>
          <table id="groups">
              {this.renderTableData()} 
            </table>
          </div>
\        </Form>
      </Container>
    );
  }
}

export default withAuth(ViewGroups);