import React from 'react';

import Page from '../components/Page';

import { projectProposalForm, contactDrHeinrich } from '../App';



class Sponsors extends React.Component {

  render() {
    return <>
      <Page title="Sponsoring a CS Senior Design Project">

        <em>Professor Mark Heinrich, Updated July 23, 2013</em><br /><br />

        There are several ways to get involved in CS Senior Design at UCF. You may choose any combination of the following:<br />

        <ul>
          <li>Donate your time and mentor a group</li>
          <li>Sponsor a group by donating time, money, equipment and/or space</li>
          <li>Suggest a project to the course instructor</li>
        </ul>

        If you would like to contribute in any of the ways listed above, or have other ideas about ways you would like to contribute, to CS Senior Design please download the {projectProposalForm()} or contact {contactDrHeinrich()}.<br /><br />

        <strong>Please note that any projects must be approved by the instructor.</strong> Once approved, a synopsis of the potential project will be posted to the website (see the Projects tab above), which may include a further link to a more complete project specification. All projects should contain components of design and analysis and be feasible by a small team of 3 or 4 students in 4-5 months (including both design and implementation).<br /><br />

        <strong>How much does it cost to sponsor a project?</strong> There is no single answer to this question—it depends on the project and the sponsor. We currently request an optional $2000 project donation from those companies willing and able to do so. Whether or not you choose to make that donation, even "all software" projects may incur web hosting or web service costs (e.g. from Amazon Web Services), software licensing costs, or other incidental expenses. Projects with a hardware component (e.g. sensors, mobile devices used for prototype development) may have additional costs. These costs are typically small, especially in relation to the value of the braintrust and exposure that the sponsor is receiving.<br /><br />

        <strong>Students MUST complete a functional prototype or they will not graduate.</strong> As such, all project ideas are urged to have a structure that includes a base-level of "must have" or minimum requirements and further levels of "and it would be awesome if..." that the students may include as time and previous progress permit.<br /><br />

      </Page>
    </>;
  }
}

export default Sponsors;