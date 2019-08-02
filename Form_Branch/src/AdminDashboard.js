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
import "./index.css"

class AdminDashboard extends Component {

  render() {
    return (
      <Container>

        <Form>
          

          <Col  className="SDForm">
            <h1 className="mainTitles">Dashboard</h1>

          </Col>
        </Form>
      </Container>
    );
  }
}

export default AdminDashboard;
