import React from 'react';
import { Container, Col, Row } from 'reactstrap';
import { contactDrHeinrich, contactDrLeinecker } from '../App';

const Footer = () => <Container>

  <hr />
  <Row>
    <Col xs="6">
      <h4>Did you know?</h4>
      <p>UCF was the first university in Florida to offer a Ph.D. in Computer Science, and the CS Ph.D. program was also the first Ph.D. program of any kind at UCF.</p>
    </Col>
    <Col xs="6">
      <h4>Contact</h4>
      <p>We would love to hear from you regarding your ideas for supporting, mentoring, or sponsoring Computer Science Senior Design teams at UCF. You can contact either {contactDrHeinrich()} or {contactDrLeinecker()}.</p>
    </Col>
  </Row>
</Container>

export default Footer;