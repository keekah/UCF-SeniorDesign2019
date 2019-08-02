import React from 'react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Form, Input, Row, Table} from 'reactstrap';
import { Redirect } from 'react-router-dom';

import Page from '../components/Page';

const SearchFilterMode = {
  All: 1,
  ProjectName: 2,
  GroupMembers: 3,
  Keyword: 4
}

class Projects extends React.Component {

  state = { 
    isLoaded: false,
    projects: [],
    searchFilter: '',
    searchFilterMode: SearchFilterMode.All,
    filterDropdownOpen: false,
    termDropdownOpen: false,
    selectedProject: null,
    termFilter: null,
    termList: [],
  }

  fetchWithTimeout = (url, options, timeout = 3000) => {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout( () => reject(new Error('timeout')), timeout)
      )
    ]);
  }

  toggleFilterDropdown = () => this.setState({filterDropdownOpen: !this.state.filterDropdownOpen});

  toggleTermDropdown = () => this.setState({termDropdownOpen: !this.state.termDropdownOpen});


  componentDidMount() {
    this.fetchWithTimeout('http://10.171.204.211/GetCMSProjects/', {}, 3000)
      .then(res => res.json())
      .then(json => {
        let termList = json.project_list.map(element => ({term: element.term, year: element.year}));
        let uniqueTerms = {};
        termList.forEach(term => {
          var key = term.year.toString();
          if (term.term.toLowerCase() === "fall")
          {
            key += "c";
          }
          if (term.term.toLowerCase() === "summer")
          {
            key += "b";
          }
          if (term.term.toLowerCase() === "spring")
          {
            key += "a";
          }
          uniqueTerms[key] = term;
        });
        let sortedArray = [];
        for (var key in uniqueTerms){
          sortedArray.push(key);
        }
        sortedArray.sort();
        sortedArray.reverse();

        sortedArray = sortedArray.map(key => {
          let term = uniqueTerms[key];
          return term.term + " " + term.year;
        });

        let currentTerm = json.currentTerm + " " + json.currentYear;
        sortedArray.forEach(element => {
          if (element.toLowerCase() === currentTerm.toLowerCase())
            currentTerm = element;
        });
        this.setState( { isLoaded: true, projects: json.project_list, termList: sortedArray, termFilter: currentTerm});
        console.log(json.project_list.length);
      })
      .catch(err => {
        console.log("looks like the backend is being worked on");
      });
  }

  updateSearchFilter = evt => this.setState({searchFilter: evt.target.value});

  createTermDropdownItem(str) {
    return <DropdownItem key={str} onClick={() => this.setState({termFilter: str})} active={this.state.termFilter.toLowerCase() === str.toLowerCase()}>{str}</DropdownItem>;
  }

  render() {

    if (this.state.selectedProject) {
      return <Redirect to={'/projects/' + this.state.selectedProject.project_id} push />;
    }

    let { isLoaded, projects, searchFilter, searchFilterMode, termFilter } = this.state;

    let filterString = "";

    if (searchFilterMode === SearchFilterMode.All)
      filterString = "All";
    else if (searchFilterMode === SearchFilterMode.ProjectName)
      filterString = "Project Name";
    else if (searchFilterMode === SearchFilterMode.GroupMembers)
      filterString = "Group Members";
    else if (searchFilterMode === SearchFilterMode.Keyword)
      filterString = "Keyword";

    let projectList = <></>;

    let groupContainsMemberNamed = (project, partialName) => {
      return project.group_members.filter(member => {
        return (member.first_name.toLowerCase().includes(partialName.toLowerCase())
                || member.last_name.toLowerCase().includes(partialName.toLowerCase()))
      }).length > 0;
    }


   let createRowForTable = (project, index) =>
        <tr key={index} onClick={() => this.setState({selectedProject: project})}>
          <td>
            {project.project_name}
          </td>
          <td>
            {project.group_members.map(item => item.first_name + " " + item.last_name).join(', ')}
          </td>
        </tr>;


    if (searchFilter) {
      if (searchFilterMode === SearchFilterMode.ProjectName)
        projects = projects.filter(project => project.project_name.toLowerCase().includes(searchFilter.toLowerCase()));
      else if (searchFilterMode === SearchFilterMode.GroupMembers)
        projects = projects.filter(project => (groupContainsMemberNamed(project, searchFilter)));
      else if (searchFilterMode === SearchFilterMode.Keyword)
        projects = projects.filter(project => project.keywords.toLowerCase().includes(searchFilter.toLowerCase()));
      else if (searchFilterMode === SearchFilterMode.All)
        projects = projects.filter(project => project.project_name.toLowerCase().includes(searchFilter.toLowerCase())
                                              || groupContainsMemberNamed(project, searchFilter)
                                              || project.keywords.toLowerCase().includes(searchFilter.toLowerCase()));
    }

    projects = projects.filter(project => (project.term + " " + project.year).toLowerCase() === termFilter.toLowerCase());
    
    if (isLoaded) {
      projectList = (
          <Table hover>
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Group Members</th>
              </tr>
            </thead>

            <tbody>
              {projects.map(createRowForTable)}
            </tbody>
          </Table>
      );
    }

    return <>
      <Page>
        <Row >
          <h2>Projects: {this.state.termFilter}</h2> 
        </Row>
        <Row className="mb-4">
          <Form className="ml-auto" inline>
            <Input name="search" placeholder="Search projects" value={this.state.searchFilter} onChange={evt => this.updateSearchFilter(evt)} />
            <Dropdown isOpen={this.state.filterDropdownOpen} toggle={this.toggleFilterDropdown}>
              <DropdownToggle caret id="project-search-button" >
                Search: <b>{filterString}</b>
              </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem onClick={() => this.setState({searchFilterMode: SearchFilterMode.All})} active={searchFilterMode === SearchFilterMode.All}>All</DropdownItem>
                  <DropdownItem onClick={() => this.setState({searchFilterMode: SearchFilterMode.ProjectName})} active={searchFilterMode === SearchFilterMode.ProjectName}>Project Name</DropdownItem>
                  <DropdownItem onClick={() => this.setState({searchFilterMode: SearchFilterMode.GroupMembers})} active={searchFilterMode === SearchFilterMode.GroupMembers}>Group Members</DropdownItem>
                  <DropdownItem onClick={() => this.setState({searchFilterMode: SearchFilterMode.Keyword})} active={searchFilterMode === SearchFilterMode.Keyword}>Keyword</DropdownItem>
                </DropdownMenu>
            </Dropdown>
            <Dropdown isOpen={this.state.termDropdownOpen} toggle={this.toggleTermDropdown}>
              <DropdownToggle caret id="project-search-button" >
                Term: <b>{termFilter}</b>
              </DropdownToggle>
                <DropdownMenu>
                  {
                    this.state.termList.map(element => this.createTermDropdownItem(element))
                  }
                </DropdownMenu>
            </Dropdown>
          </Form>
        </Row>
     
        {projectList}
        
      </Page>
    </>
  }
}

export default Projects;