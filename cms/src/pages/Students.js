import React from 'react';
import { Alert, Button } from 'reactstrap';

import Page from '../components/Page';
import { contactDrHeinrich } from '../App';


class Students extends React.Component {
  render() {
    return <Page title="Information for Students">
      <p>These are resources for students currently enrolled within <strong>Computer Science Senior Design I (COP 4934)</strong> and <strong>Senior Design II (COP 4935)</strong>. If the information below does not answer your question, please reach out to {contactDrHeinrich()} for further assistance. Do not reach out to other university or department resources without first speaking with Dr. Heinrich.</p><br />

      <Alert color="warning"><h3 className="text-center">Senior Design Lab: HEC 102</h3></Alert>
      <h4>Rules</h4>
      <p>Failure to follow any of the rules listed here and posted in the lab can result in your team losing access to the space.</p>
      <ul>
        <li>Absolutely no food is allowed in the lab. Drinks are okay.</li>
        <li>The resources in the room should only be used for academic purposes.</li>
        <li>Keep noise to a minimum. Please use headphones when listening to audio.</li>
        <li>No pets or children are allowed in the lab.</li>
        <li>Return chairs, throw out trash, and turn off the lights when you are finished using the space.</li>
      </ul><br />
      
      <h4>Lockers</h4>
      <p>Lockers with combination locks or keys are available for projects that require them. It might be necessary for teams to share locker space when possible to accomodate all projects. Do not use these spaces to store personal items or food.<br /><br />

      For lockers with keys, students will have a hold placed on their account in the amount of $20 for each key they do not return at the end of the semester.<br /><br />

      Items should not be left unattended in the room, you are reponsible for your own personal belongings.</p><br />

      <h4>Security</h4>
      <p>Electrontic key card access to HEC 102 is granted near the beginning of each semester. If you need access outside of those times, or if your access is not working, please contact Dr. Heinrich.<br /><br />

      To access the room you will need to either swipe your card, or if the card is newer than July 2018 you can simply hold the card near the keypard. After the light flashes green you will be required to enter your 6 digit PIN that was emailed to you. Please check your junk, spam, and clutter email folders under your Knights email account for the email containing your PIN. The email is commonly marked as spam.<br /><br />

      The room is under 24 hour video survelliance. The university controls the archives of these videos, so there is no way for use to delete or alter them. These cameras and recordings will be used to monitor any issuses that arise in the lab.</p><br />


      <Alert color="warning"><h3 className="text-center">Senior Design Showcase</h3></Alert>
      <p>
        Do not remove any chairs, TVs, or computers from HEC 102. Senior Design 1 students are still working on their projects and will be using the space. We cannot allow it to be cannibalized.<br /><br />

        <strong>Displays</strong>: We have at least one monitor for each group for Senior Design Day. If you do not need/want a monitor, please send Michael Powell an email with your group number and he will let another group use it as a second monitor.<br /><br />

        The monitor's resolution is 1680x1050 (16:10). Make sure your PowerPoint presentations and demos are sized correctly.<br /><br />

        The monitors only support VGA and DVI. We do not have adapters for HDMI, Mini DisplayPort, or USB-C. Most of the DVI cables have a full sized DisplayPort adapter attached.<br /><br />

        If you are taking only one monitor, please take the monitor labeled with your group's number. Second monitors will be provided on a first come first served basis, starting at 9:00am. You will be asked for your student ID and will be assigned one of the remaining monitors above #46. The limit is two per team.<br /><br />

        <strong>Wireless Access Points</strong>: If your project requires a device that is unable to connect to the UCF wireless, please contact Dr. Heinrich at least 24 hours in advance. We have a limited number of access points we can setup for the event, depending on your table location.<br /><br />

        <strong>Accessories</strong>: We have plenty of Dell keyboards, Dell mice, standard power cables, VGA cables, and DVI cables. They are available in the cabinets and bins next to the left door when entering HEC 102. You are welcome to take what you need for the day, but please make sure they are returned to their proper location.<br /><br />
      </p>
      
      <Alert color="warning"><h3 className="text-center">Available Resources</h3></Alert>
      <h4>Computers</h4>
      <p>All of the computers in the lab are free for any group to use. If you need any special software installed, please contact Dr. Heinrich. Software that has not been requested is not installed on the machines. Please feel free to reach out if you are curious about what software is available.<br /><br />

      For Adobe products, we suggest using the Technology Commons for free access.</p><br />

      <h4>CPU/GPU</h4>
      <p>We have three higher end workstations in the room. Teams that show an academic need for access will be given their own account. You cannot access these machines remotely, as we cannot guarantee uptime or prevent local interaction with them.</p><br />

      <h4>AR/VR</h4>
      <p>We have a small selection of resources for mixed-reality projects. Please reach out to Dr. Heinrich with your specific needs. Our campus has additional resources available; you will be directed to them as necessary.</p><br />

      <h4>Microsoft Software Suite</h4>
      <p>Microsoft Imagine, previously Microsoft Dreamspark, offers free software to students through our license agreement with them. As students of the Computer Science department, enrolled in a Computer Science course, you should receive an automated email with your access information one to two weeks after the Add/Drop period. Once you receive your login information, you will need to use the <a href="https://e5.onthehub.com/WebStore/Welcome.aspx?ws=48858cba-c19b-e011-969d-0030487d8897&vsro=8">UCF Computer Science's Microsoft Imagine Portal</a>. There is an <a href="http://www.cs.ucf.edu/dreamspark/">additional FAQ</a> if you have any issues with the service.</p><br />

      <h4>Cloud Services</h4>
      <p>Many cloud service providers offer free credits for students. Please contact Dr. Heinrich if you would like more details or need assistance signing up.</p><br />

      <h4>Virtual Machines</h4>
      <p>If you are looking to host a virtual server to run a website, database, or other computing need, please contact Dr. Heinrich to schedule a brief 20-40 minute meeting with him. A minimum of two members need to attend, but all group members who will interface with the virtual machine should attend.</p><br />

      <h4>GitHub</h4>
      We ask that all students put their project work on the <a href="https://github.com/ucfcs">University of Central Florida Department of Computer Science GitHub repository</a> so that teaching assistants, professor, and staff can help with the code and review it as necessary. To gain access, please email Dr. Heinrich with your current course (COP 4934 or COP 4935) and the GitHub usernames or associated emails of your team members. You will then be added to the department resources, where you can create your private or public repos under UCFCS.<br /><br />

      <div className="text-center">
        <Button color="warning" href="/submissions">Submit Documents</Button>
      </div>
    </Page>

  }
}

export default Students;