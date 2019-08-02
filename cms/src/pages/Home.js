import React from 'react';
import { Jumbotron, UncontrolledCarousel } from 'reactstrap';

import Page from '../components/Page';
import { projectProposalForm, contactDrHeinrich } from '../App';


const carouselImages = [
    {
      src: '../images/showcase1.jpg',
      altText: 'Virtual Reality Training Demo',
      header: 'Florida Power & Light Showcase',
      caption: 'Virtual Reality Training Demo'
    },
    {
      src: '../images/showcase2.jpg',
      altText: 'Limbitless 2D/3D Arm Tracking',
      header: 'Limbitless 2D/3D Arm Tracking',
      caption: '',
    },
    {
      src: '../images/showcase3.jpg',
      altText: 'FL Power & Light Award',
      header: 'Florida Power & Light Award',
      caption: 'Senior Design Team Wins State Award'
    },
  ];

class Home extends React.Component {

  render() {
    return <>
      <Page>
        <Jumbotron className="text-center">
          <h1>UCF Computer Science Senior Design</h1>
          <em>Design, Entrepreneurship, Fun, Teamwork, Leadership</em>
          <UncontrolledCarousel items={carouselImages} className="mt-4" />
          <p className="mt-4 text-left">In the two-semester long Senior Design program at UCF, Computer Science students are tasked with using the skills they have learned to solve a realistic and meaningful problem. Professor Mark Heinrich is seeking companies with a substantial software design challenge to propose a scope of work for student teams to tackle. The proposed project should be a substantial piece of work appropriate for a student team to design and implement over the program of roughly eight months.</p>
        </Jumbotron>


       <h2>How It Works</h2>
       <ul>
         <li>Interested companies should submit a completed {projectProposalForm()} to {contactDrHeinrich()} at least one week prior to the beginning of the Fall or Spring semester in which the project will start.</li>
         <li>If the proposal is accepted, the company will be invited to appear in class and deliver a 15-minute pitch of their project to the student teams (not all proposals may be selected).</li>
         <li>If selected by a student team, the company will provide limited guidance and mentoring to the student teams as they work to solve the challenge over two semesters consisting of two courses.</li>
       </ul><br />


      <h2>Project Timeline</h2>
      <p>During the first semester, students choose their projects and carry out the design of the project (determining objectives, tasks, task assignment to group members, programming language and technology determination, researching and solving design problems, documenting related and prior work, etc.).</p>
      <ul>
        <li>Final Design Document (at least 30 pages per team member) is submitted at end of semester.</li>
      </ul>
      <p>During the second semester, the primary task is project implementation.</p>
      <ul> <li>Formal in-class design review presentation is held two months into the second semester, where sponsors are encouraged to attend.</li></ul>
      At the end of the semester, student teams make a final presentation to a faculty panel and their sponsor, and participate in the UCF CECS Senior Design Day.
      <ul><li>Final project documentation is due and a Web page for the project is launched.</li></ul><br />


      <h2>Submission Criteria</h2>
      <p>Proposed projects should contain a significant amount of design, where students are presented with an open-ended problem that they have to figure out how best to solve, make design decisions regarding what languages, technologies, services or systems to use, etc. Proposed projects should not serve as a company's attempt to hire contract workers.</p>

      <p>Dr. Heinrich will work with each potential sponsor company to tailor the proposal so that the project is the appropriate amount of work for the design teams. It is encouraged that sponsors provide a team donation of $2,000 to help defray the costs of running the CS Senior Design program. The intellectual property for any sponsored projects stays with the sponsor unless different arrangements are made between the sponsor and the project team. Sponsors may optionally require team members to sign NDAs.</p><br />


      <h2>Questions</h2>
      <p>For questions about the program or to seek assistance in completing the {projectProposalForm()}, please contact {contactDrHeinrich()}.</p><br />
      
      </Page>
    </>
  }
}

export default Home;