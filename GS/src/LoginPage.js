import React, { Component } from 'react';
import { Container, Col, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import './SDForm.css';
import logo from'./UCFLogo.png';
import AuthService from './AuthService';

let ID = "";

 
class LoginPage extends Component {
  constructor(props) {
    super(props);
      this.state = {
      username: '',
      password: ''
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.Auth = new AuthService();
  }

  componentWillMount(){
    if(this.Auth.loggedIn())
      this.props.history.replace('/');
  }

  handleFormSubmit(e){
    e.preventDefault();
  
    this.Auth.login(this.state.username,this.state.password)
        .then(res =>{
          if(this.Auth.state.isA)
           this.props.history.push('/AdminApp');
          else if(this.Auth.state.isA === 0 && this.Auth.state.sub === 0)
          { // changed
            ID = this.Auth.state.userID;
            console.log(ID);
            this.props.history.push('/SDForm')
          }
          else if(this.Auth.state.isA === 0 && this.Auth.state.sub === 1)
            this.props.history.push('/FormSubmitted')
        })
        .catch(err =>{
            alert("Incorrect login info");
        })
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  render() {
    return (
     <Container>
        <Col className="UCFLogo"><img src={logo} /></Col>
        <Form className="LoginForm">
          <Col>
            <h1 className="mainTitles">Senior Design Project Selection</h1>
            <h3 className="subTitle">Sign In</h3>
          </Col>
 
          <Col>
            <FormGroup className="LoginPad">
              <Label className="subTitle">Knights Email</Label>
              <Input className="LoginInfo" type="text" name="username" id="username" onChange={this.handleChange.bind(this)} value={this.state.username} />
            </FormGroup>
          </Col>
          
          <Col>
            <FormGroup>
              <Label className="subTitle" for="password">Password</Label>
              <Input className="LoginInfo" type="password" name="password" id="password" onChange={this.handleChange.bind(this)} value={this.state.password} />
            </FormGroup>
          </Col>

          <Button className="subTitle" onClick={this.handleFormSubmit}>Submit</Button>

        </Form>
      </Container>
    );
  }
}

export default LoginPage;
export {ID}; 