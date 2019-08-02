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

class Schedule extends Component {

  render() {
    return (
      <Container>
        <Form className="SDForm">
          <Col className="subTitle">
            <Button><h1 className="mainTitles">Schedule</h1></Button>
          </Col>
        </Form>
      </Container>
    );
  }
}

export default Schedule;