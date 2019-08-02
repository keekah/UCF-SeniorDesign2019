import React from 'react';
import { Button, Col, Jumbotron, Row } from 'reactstrap';


import Page from '../components/Page';

class Project extends React.Component {

  state = {
    isLoaded: false,
    projects: []
  }

  fixDocumentURL(url) {
    if (url.startsWith("submit"))
    {
      return "http://sdw.cs.ucf.edu/" + url;
    }
    else if(url.startsWith("/DownloadCMSProjectResource")){
      return "http://10.171.204.211" + url;
    }
    else return null;
  }

  componentDidMount() {
    this.fetchWithTimeout('http://10.171.204.211/GetCMSProjects/', {}, 3000)
      .then(res => res.json())
      .then(json => {
        this.setState( { isLoaded: true, projects: json.project_list, })
      })
      .catch(err => {
        console.log("looks like the backend is being worked on");
      });
  }

  fetchWithTimeout = (url, options, timeout = 3000) => {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout( () => reject(new Error('timeout')), timeout)
      )
    ]);
  }

  render() {
    const {project_id} = this.props.match.params;

    if (this.state.isLoaded) {

      let projectsArray = this.state.projects.filter(project => project.project_id === parseInt(project_id, 10));

      if (projectsArray.length === 1) {
        var project = projectsArray[0];

        return <Page>
        <Jumbotron>
          <Row>
            <Col sm={9}>
              <h2><strong>{project.project_name}</strong></h2>
              <h4 className="mb-4">Group {project.group_number}</h4>
            </Col>
            <Col sm={3} className="text-right">
              <h4 id="project-header">{project.term} {project.year}</h4>
            </Col>
          </Row>

          <Row>
            <Col>
              <p>{project.project_description}</p>
            </Col>
          </Row>

          <h3 className="mb-3">Group Members</h3>
          {project.group_members.map((member, index) => {
          return <Row key={index}>
            <Col>
              <h5>{member.first_name} {member.last_name}</h5>
            </Col>
            <Col>
              <em>{member.email}</em>
            </Col>
           <Col sm={6}>

           </Col>
            </Row>
          })}

          <Row className="mt-5">
            <Col>
            </Col>
            <Col xs="auto">
              <Button color="warning" href={this.fixDocumentURL(project.design_doc_url)} disabled={!this.fixDocumentURL(project.design_doc_url)}>Design Document</Button>
            </Col>
            <Col xs="auto">
              <Button color="warning" href={this.fixDocumentURL(project.final_doc_url)} disabled={!this.fixDocumentURL(project.final_doc_url)}>Final Document</Button>
            </Col>
            <Col xs="auto">
              <Button color="warning" href={this.fixDocumentURL(project.presentation_url)} disabled={!this.fixDocumentURL(project.presentation_url)}>Presentation</Button>
            </Col>
            <Col xs="auto">
              <Button color="warning" href={this.fixDocumentURL(project.conference_paper_url)} disabled={!this.fixDocumentURL(project.conference_paper_url)}>Conference Paper</Button>
            </Col>
            <Col>
            </Col>
          </Row>
          </Jumbotron>
        </Page>
      } 
    }

    return null;  
  }

}

export default Project;