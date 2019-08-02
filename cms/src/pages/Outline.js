import React from 'react';

import Page from '../components/Page';
import { projectProposalForm } from '../App';

class Outline extends React.Component {

  render() {
    return <Page title="Course Outline">
      In the first semester (<strong>COP 4934: Senior Design I</strong>), students are rapidly exposed to a variety of potential project topics from faculty members and representatives from local industry or non-profit organizations. There are also lecture topics on intellectual property, information privacy, security, entrepreneurship, and exposure to a wide range of relevant software environments and technologies from mobile development environments to database-backed web services. Students form groups and jointly agree on a project topic with the instructor. At the end of the first semester, the overall approach and design/architecture of the project must be completed so that it can be effectively implemented in the second semester.<br /><br />

      In the second semester (<strong>COP 4935: Senior Design II</strong>), the students must implement their chosen project to functional completion. Students will encounter the need to assign responsibilities to team members and to rely on other individuals to perform necessary work for the successful completion of team goals. It is this interaction with other team members, working toward a common goal that typically proves most memorable and rewarding. Teams must give a formal final project presentation to the instructor, sponsor (if applicable), and two other faculty members, each of whom will evaluate the project and the presentation. A written final project document is also submitted to both the instructor and the project sponsor (if applicable).<br /><br />

      Interested in sponsoring a project? Download the {projectProposalForm()} now!<br /><br />

      <img src="../images/hec.jpg" alt="Harris Corporation Engineering Center" id="hec"></img><br />
      <p className="text-center"><em>Harris Corporation Engineering Center is home to Computer Science and our Senior Design Lab</em></p><br />

    </Page>
  }

}

export default Outline;