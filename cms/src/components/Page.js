import React from 'react';
import { Container } from 'reactstrap';

import Header from './Header';
import Footer from './Footer';


class Page extends React.Component {

  render() {
    return <>
      <Header />

      <Container className="mt-4" >
            {this.props.title ? 
              <h2 className="mb-4">{this.props.title}</h2>
            :
              <></>
            }
          
            {this.props.children}
      </Container>

     <Footer />
    </>
  }

}

export default Page;