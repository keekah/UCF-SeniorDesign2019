import React from 'react';
import { Alert, Button, Card, Col, Collapse, Form, FormText, Input, Label, Spinner, Row } from 'reactstrap';
import $ from 'jquery';

import Page from '../components/Page';
import { contactDrHeinrich } from '../App';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


class Submissions extends React.Component {

  state = {
    sd1CollapseOpen: false,
    sd2CollapseOpen: false,
    projectSD1: null,
    projectSD2: null,
    isLoaded: false,
    projects: [],
    invalidGroupNumberSD1: false,
    invalidGroupNumberSD2: false,
    currentTerm: null,
    currentYear: null,
    designDocStatus: {
      uploadInProgress: false,
      uploadError: false,
      uploadSuccess: false,
    },
    finalDocStatus: {
      uploadInProgress: false,
      uploadError: false,
      uploadSuccess: false,
    },
    presentationDocStatus: {
      uploadInProgress: false,
      uploadError: false,
      uploadSuccess: false,
    },
    conferenceDocStatus: {
      uploadInProgress: false,
      uploadError: false,
      uploadSuccess: false,
    },
  };

  componentDidMount() {
    this.fetchWithTimeout('http://10.171.204.211/GetCMSProjects/', {}, 3000)
      .then(res => res.json())
      .then(json => {
        this.setState( { isLoaded: true, 
                         projects: json.project_list, 
                         currentYear: json.currentYear,
                         currentTerm: json.currentTerm  });
        console.log(json);
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

  updateProject() {
    $.ajax({
      url: 'http://10.171.204.211/UpdateCMSProject/',
      type: 'POST',

      data: JSON.stringify({
        project_id: this.state.projectSD2.project_id,
        project_description: $('#project-description-input').val(),
        keywords: $('#keywords-input').val()
      }),
      contentType: "application/json; charset=utf-8",
      dataType: "json",

      cache: false
    });
  }


  uploadDoc(endpoint, fileId, statusName, project) {
    if (project)
    {
      $.ajax({
        // Your server script to process the upload
        url: 'http://10.171.204.211/' + endpoint + '/?project_id=' + project.project_id,
        type: 'POST',

        // Form data
        data: new FormData($('#'+fileId)[0]),

        // Tell jQuery not to process data or worry about content-type
        // You *must* include these options!
        cache: false,
        contentType: false,
        processData: false,

        // Custom XMLHttpRequest
        xhr: () => {
          var myXhr = $.ajaxSettings.xhr();
          if (myXhr.upload) {
            this.setState({[statusName]: { uploadInProgress: true, uploadError: false, uploadSuccess: false }});
            // For handling the progress of the upload
            myXhr.upload.addEventListener('progress', function (e) {
              if (e.lengthComputable) {
                $('progress').attr({
                  value: e.loaded,
                  max: e.total,
                });
              }
            }, false);
          }
          return myXhr;
        },

        success: (e) => {
          this.setState({[statusName]: {uploadInProgress: false, uploadError: false, uploadSuccess: true}});
        },
        error: (e) => {
          this.setState({[statusName]: {uploadInProgress: false, uploadError: true, uploadSuccess: false}});
        }
      });
    }
  }

  toggleCollapse1 = () => this.setState({ sd1CollapseOpen: !this.state.sd1CollapseOpen });
  toggleCollapse2 = () => this.setState({ sd2CollapseOpen: !this.state.sd2CollapseOpen });


  updateGroupNumberSD1 = (event) => {
    let { currentTerm, currentYear } = this.state;

    if (!isNaN(event.target.value))
    {
      let projectsArray = this.state.projects.filter(project => project.group_number === parseInt(event.target.value, 10)
                                                                && parseInt(project.year, 10)  === currentYear
                                                                && project.term.toLowerCase() === currentTerm.toLowerCase());

      if (projectsArray.length === 1) {
        this.setState({projectSD1: projectsArray[0], invalidGroupNumberSD1: false});
      }
      else {
        this.setState({invalidGroupNumberSD1: true, projectSD1: null});
      }
    }
    else {
      this.setState({invalidGroupNumberSD1: true, projectSD1: null});
    }
  };

  updateGroupNumberSD2 = (event) => {
    let { currentTerm, currentYear } = this.state;
    if (!isNaN(event.target.value))
    {
      let projectsArray = this.state.projects.filter(project => project.group_number === parseInt(event.target.value, 10)
                                                                && parseInt(project.year, 10)  === currentYear
                                                                && project.term.toLowerCase() === currentTerm.toLowerCase());

        if (projectsArray.length === 1) {
          this.setState({projectSD2: projectsArray[0], invalidGroupNumberSD2: false});
        }
        else {
          this.setState({invalidGroupNumberSD2: true, projectSD2: null});
        }
    }
    else {
      this.setState({invalidGroupNumberSD2: true, projectSD2: null});
    }
  };

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


  render() {

    return <Page title="Submit Documents">

      <p>Please complete the forms below. Only the most recent submission will count towards your grade. Make sure all required items are included with your final submission. If you encounter any issues, please email {contactDrHeinrich()} about the issue you experienced.</p>

      <Alert color="warning" onClick={this.toggleCollapse1}><h5>Senior Design I</h5></Alert>
      <Collapse isOpen={this.state.sd1CollapseOpen}>
        <Card body outline color="warning">
  
 
            <Row className="mb-3">
              <Label sm={2}>Group Number</Label>
              <Col sm={1}>
                <Input type="text" onBlur={this.updateGroupNumberSD1} onKeyUp={(event) => {
                  if (event.keyCode === 13)
                  {
                    event.preventDefault();
                    this.updateGroupNumberSD1(event);
                  }
                }}/>
              </Col>
              <Col>
              {this.state.projectSD1 ? this.state.projectSD1.project_name : ""}
              {this.state.invalidGroupNumberSD1 ? "Error: invalid group number" : ""}
              </Col>
            </Row>

            {this.state.projectSD1 ?
              <Form id="final-design-doc-form">
                <Row className="mb-3">
                  {/*<Input type="text" name="project_id" value={this.state.projectSD1.project_id} hidden />*/}
                  <Label sm={3}>Final Design Document (PDF)</Label>
                  {this.state.designDocStatus.uploadInProgress ?
                    <Spinner color="warning" />
                  :
                    null
                  }

                  {this.state.designDocStatus.uploadSuccess  || this.fixDocumentURL(this.state.projectSD1.design_doc_url) ?
                    <FontAwesomeIcon icon="check" color="green" size="lg" />
                  :
                    null        
                  }

                  {this.state.designDocStatus.uploadError ?
                    <FontAwesomeIcon icon="times" color="red" size="lg" />
                  :
                    null
                  } 
                  <Col>
                    <Input type="file" name="file" />
                    <FormText color="muted">maximum size 20MB</FormText>
                  </Col>
                  
                </Row>  
              </Form>
              
            :
              null
            }

          <hr />
          <Button color="warning" id="submit-button" disabled={!this.state.projectSD1} onClick={() => {this.uploadDoc("UploadCMSDesignDoc", "final-design-doc-form", "designDocStatus", this.state.projectSD1)}}>Submit</Button>
          
        </Card>
        <br /><br />
      </Collapse>


      <Alert color="warning" onClick={this.toggleCollapse2}><h5>Senior Design II</h5></Alert>
      <Collapse isOpen={this.state.sd2CollapseOpen}>
        <Card body outline color="warning">

             <Row className="mb-3">
              <Label sm={2}>Group Number</Label>
              <Col sm={1}>
                <Input type="text" onBlur={this.updateGroupNumberSD2} onKeyUp={(event) => {
                  if (event.keyCode === 13)
                  {
                    event.preventDefault();
                    this.updateGroupNumberSD2(event);
                  }
                }}/>
              </Col>
              <Col>
              {this.state.projectSD2 ? this.state.projectSD2.project_name : ""}
              {this.state.invalidGroupNumberSD2 ? "Error: invalid group number" : ""}
              </Col>
            </Row>

      

            {this.state.projectSD2 ?
              <>
              <Row className="mb-3">
                <Label sm={2}>Project Description</Label>
                <Col sm={5}>
                  <Input type="textarea" id="project-description-input" defaultValue={this.state.projectSD2.project_description} />
                </Col>
                <FormText color="muted">(approximately 200 words)</FormText>
              </Row>

              <Row className="mb-3">
                <Label sm={2}>Keywords</Label>
                <Col sm={5}>
                  <Input type="text" id="keywords-input" defaultValue={this.state.projectSD2.keywords} />       
                </Col>
              </Row>

              <br />
            

              <Form id="final-project-doc-form">
                <Row className="mb-3">
                  {/*<Input type="text" name="project_id" value={this.state.projectSD1.project_id} hidden />*/}
                  <Label sm={3}>Final Project Document (PDF)</Label>
                  {this.state.finalDocStatus.uploadInProgress ?
                    <Spinner color="warning" />
                  :
                    null
                  }

                  {this.state.finalDocStatus.uploadSuccess || this.fixDocumentURL(this.state.projectSD2.final_doc_url) ?
                    <FontAwesomeIcon icon="check" color="green" size="lg" />
                  :
                    null        
                  }

                  {this.state.finalDocStatus.uploadError ?
                    <FontAwesomeIcon icon="times" color="red" size="lg" />
                  :
                    null
                  } 
                  <Col>
                    <Input type="file" name="file" />
                    <FormText color="muted">maximum size 20MB</FormText>
                  </Col>
                  
                </Row>  
              </Form>

              <Form id="presentation-doc-form">
                <Row className="mb-3">
                  {/*<Input type="text" name="project_id" value={this.state.projectSD1.project_id} hidden />*/}
                  <Label sm={3}>Project Presentation (PDF/PPTX)</Label>
                  {this.state.presentationDocStatus.uploadInProgress ?
                    <Spinner color="warning" />
                  :
                    null
                  }

                  {this.state.presentationDocStatus.uploadSuccess || this.fixDocumentURL(this.state.projectSD2.presentation_url) ?
                    <FontAwesomeIcon icon="check" color="green" size="lg" />
                  :
                    null        
                  }

                  {this.state.presentationDocStatus.uploadError ?
                    <FontAwesomeIcon icon="times" color="red" size="lg" />
                  :
                    null
                  } 
                  <Col>
                    <Input type="file" name="file" />
                    <FormText color="muted">maximum size 20MB</FormText>
                  </Col>
                  
                </Row>  
              </Form>

              <Form id="conference-doc-form">
                <Row className="mb-3">
                  {/*<Input type="text" name="project_id" value={this.state.projectSD1.project_id} hidden />*/}
                  <Label sm={3}>Conference Paper (PDF)</Label>
                  {this.state.conferenceDocStatus.uploadInProgress ?
                    <Spinner color="warning" />
                  :
                    null
                  }

                  {this.state.conferenceDocStatus.uploadSuccess || this.fixDocumentURL(this.state.projectSD2.conference_paper_url) ?
                    <FontAwesomeIcon icon="check" color="green" size="lg" />
                  :
                    null        
                  }

                  {this.state.conferenceDocStatus.uploadError ?
                    <FontAwesomeIcon icon="times" color="red" size="lg" />
                  :
                    null
                  } 
                  <Col>
                    <Input type="file" name="file" />
                    <FormText color="muted">maximum size 20MB</FormText>
                  </Col>
                  
                </Row>  

                </Form>
                
            </>
            :
              null
            }
            <hr />
            <Button color="warning" id="submit-button" disabled={!this.state.projectSD2} onClick={() => {
              this.uploadDoc("UploadCMSFinalDoc", "final-project-doc-form", "finalDocStatus", this.state.projectSD2);
              this.uploadDoc("UploadCMSPresentation", "presentation-doc-form", "presentationDocStatus", this.state.projectSD2);
              this.uploadDoc("UploadCMSConferencePaper", "conference-doc-form", "conferenceDocStatus", this.state.projectSD2);
              this.updateProject();
            }}>Submit</Button>

        </Card>
        
      </Collapse>


    </Page>
  }
}

export default Submissions;