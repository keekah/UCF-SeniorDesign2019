import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import LoginPage from './LoginPage';
import SDForm from './SDForm';
import AdminApp from './AdminApp';
import FormSubmitted from './FormSubmitted';
import GridContainerPage from './GridContainerPage';

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <ul className="navbar-nav mr-auto">
            <li><Link to={'/'} className="nav-link">Login</Link></li>
            
          </ul>
          </nav>
          <hr />
          <Switch>
              <Route exact path='/' component={LoginPage} />
              <Route path='/sdForm' component={SDForm} />
              <Route path='/AdminApp' component={AdminApp} />
              <Route path='/FormSubmitted' component={FormSubmitted} />
              <Route path='/GridContainerPage' component={GridContainerPage} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;