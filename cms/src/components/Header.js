import React from 'react';
import { Container, Nav, Navbar, NavbarBrand, NavItem, NavLink } from 'reactstrap';


class Header extends React.Component {
    render() {
        return <>
            <Navbar id="keeks" color="dark" dark expand="md">
            <Container>
                <NavbarBrand href="/">
                Computer Science Senior Design
                </NavbarBrand>

                <Nav navbar>
                <NavItem>
                    <NavLink href="/">Home</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink href="/outline">Outline</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink href="/projects">Projects</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink href="/sponsors">Sponsors</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink href="/students">Students</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink href="/contact">Contact</NavLink>
                </NavItem>
                </Nav>
                
            </Container>
            </Navbar>

        </>
    }
}

export default Header;