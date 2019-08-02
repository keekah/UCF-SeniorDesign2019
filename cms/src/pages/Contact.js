import React from 'react';
import { Col, Container, Nav, NavItem, NavLink,  Row, TabContent, TabPane } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classnames from 'classnames';

import Page from '../components/Page';

class Contact extends React.Component {

  constructor(props) {
    super(props);

    let person = window.location.hash;
    if (person === "#leinecker")
      this.state = {activeTab: '2'}
    else
      this.state = {activeTab: '1'}
  }

  toggle(tab) {
    if (this.state.activeTab !== tab)
      this.setState( {activeTab: tab} );
  }


  render() {
    return <>
      <Page title="Senior Design Organizers">

        <Nav tabs>
          {/*Dr Heinrich*/}
          <NavItem>
            <NavLink
              className={classnames({active: this.state.activeTab === '1'})}
              onClick={() => this.toggle('1')}>
              <strong>Dr. Mark Heinrich</strong>
            </NavLink>
          </NavItem>

          {/*Dr Leinecker*/}
          <NavItem>
            <NavLink
              className={classnames({active: this.state.activeTab === '2'})}
              onClick={() => this.toggle('2')}>
              <strong>Dr. Richard Leinecker</strong>
              </NavLink>
          </NavItem>
        </Nav>

        <TabContent activeTab={this.state.activeTab}>

          {/*Dr Mark Heinrich*/}
          <TabPane tabId='1'>
            <br />
            <Container>
              <Row>
                <Col xs="auto">
                  <FontAwesomeIcon icon="envelope" onClick={() => document.execCommand('copy')}/> heinrich@cs.ucf.edu
                </Col>
                <Col xs="auto">
                  <FontAwesomeIcon icon="phone-alt" /> (407) 882-0138
                </Col>
                <Col xs="auto">
                  <FontAwesomeIcon icon="building" /> HEC 433
                </Col>
                <Col xs="auto">
                  <FontAwesomeIcon icon={['fab', 'google']} /> <a href="https://scholar.google.com/citations?user=ENsrFlsAAAAJ&hl=en&oi=ao">Google Scholar</a><br />
                </Col>
                <Col xs="auto">
                  <FontAwesomeIcon icon="globe" /> <a href="http://csl.cs.ucf.edu/~heinrich/">ucf.edu/heinrich</a> <br />
                </Col>
              </Row>
            </Container>
        
            <br />
            <img src="../images/tortoise.jpg" alt="Dr. Heinrich with a tortoise" id="heinrich"></img><br /><br />
            <p>Dr. Heinrich received his BS in Electrical Engineering and Computer Science (double major) from Duke University in 1991, where he graduated first in his class and summa cum laude. He earned his M.S. and Ph.D. in Electrical Engineering from Stanford University in 1993 and 1998, respectively. At Stanford while studying under John Hennessy, he was a principal designer of the FLASH multiprocessor, designed and evaluated several protocols for the machine and wrote its system-level simulator. His research interests include novel parallel computer architectures, data-intensive computing, energy-efficient architectures, and scalable web services.<br /><br />

            Dr. Heinrich was an Assistant Professor in ECE at Cornell University (1998-2002) and a co-founder of its Computer Systems Laboratory. He received the Cornell IEEE Teacher of the Year Award (1999) and a College of Engineering Teaching Award (2001). He was also the co-founder and Chief Architect of Flashbase, Inc. (1998-2000, acquired by DoubleClick in May 2000) specializing in automated sweepstakes and database-backed forms and tools for customer acquisition.<br /><br />

            Dr. Heinrich joined UCF CS in 2002 as an Associate Professor, founding its Computer Systems Lab. He became Director of the School of Computer Science in 2005 and after a merger with ECE, served as Associate Director of the School of EECS at UCF until 2007. From 2004-2011 he was also the co-founder and CTO of Phanfare, Inc., a premium online photo and video hosting solution. Phanfare was acquired by Carbonite in August 2011. As of September 2019, Dr. Heinrich assumes the role of Undergraduate Coordinator for Computer Science and Information Technology in addition to his role as Computer Science Senior Design Coordinator.<br /><br />

            Dr. Heinrich is the recipient of an NSF Graduate Fellowship, IBM T.J. Watson Scholarship, General Motors Scholarship, an NSF CAREER Award supporting novel research in data-intensive systems, and an IBM Faculty Award (2004). His scholarly publications have been cited more than 1600 times. He is a Senior Member of the IEEE and a regular member of the ACM. He is a member of Phi Beta Kappa, Tau Beta Pi, and Eta Kappa Nu, and is the faculty advisor for the UCF Geocaching Club.<br /><br /></p>
          </TabPane>
          
          {/*Dr Richard Leinecker*/}
          <TabPane tabId='2'>
            <br />
            <Container>
              <Row>
                <Col xs="auto">
                  <FontAwesomeIcon icon="envelope" onClick={() => document.execCommand('copy')}/> richard.leinecker@ucf.edu
                </Col>
                <Col xs="auto">
                  <FontAwesomeIcon icon="phone-alt" /> (407) 823-0169
                </Col>
                <Col xs="auto">
                  <FontAwesomeIcon icon="building" /> HEC 328
                </Col>
                <Col xs="auto">
                  <FontAwesomeIcon icon={['fab', 'linkedin']} /> <a href="https://www.linkedin.com/in/rickleinecker">Linked in</a><br />
                </Col>
                <Col xs="auto">
                  <FontAwesomeIcon icon="globe" /> <a href="http://www.rickleinecker.com/">rickleinecker.com</a> <br />
                </Col>
              </Row>
            </Container>

            <br />
            <img src="../images/leinecker.png" alt="Dr. Heinrich with a tortoise" id="heinrich"></img><br /><br />
            <p>Dr. Leinecker is a seasoned software engineer with many prestigious accomplishments and positions. In addition to his skills as an enterprise-level software architect and engineer, he writes, consults, and serves as an industry expert in many areas. His expertise spans the following skill sets:</p>
            <ul>
              <li>Strong language skills: Intel assembly, C++, C#, and Java</li>
              <li>Digital imaging: image processing and computer vision</li>
              <li>Artificial intelligence: neural networks, binary search, natural language processing, Markov</li>
              <li>Mobile development: iOS, Android, Windows 8</li>
              <li>Supporting technologies: SQL, COM+, HTML, ASP.NET</li>
            </ul>

            <p>Dr. Leinecker's previous positions include Senior Programmer at Capstone, Senior Software Engineer at MCI, Senior Software Engineer at Landmark Communications, and Chief Technology Officer at Strategic Annotation. Duties included high-level software design, programming, staff management, and interaction with C-Level executives.<br /><br />

            The apex of Dr. Leinecker's education is a Ph.D. in Information Technology. His dissertation covered a new approach to reducing data entropy which increases the ratio of data compression, thus reducing payload sizes. This experience in the academic world allows him to be both a practitioner and an academic. In addition to the mountains of incredible software that he has created, he has written hundreds of print articles, 23 technical books, and dozens of online articles. With his fabulous track record, publishers seek him out to tackle the most important assignments. As a member of Mensa, Dr. Leinecker meets interesting and challenging people. These connections allow him to remain steeped in contemporary thought. This contributes immensely to his ability to apply these paradigms to software engineering.<br /><br />
            
            When he is not creating top-level software and writing, Rick can be found playing racquetball, backpacking, writing music, playing the guitar or french horn, and seeking creative expression in other ways.<br /><br /></p>
          </TabPane>

        </TabContent>       
     
      </Page>
    </>
  }
}

export default Contact;