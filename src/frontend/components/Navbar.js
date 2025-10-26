import {
    Link
} from "react-router-dom";
import { Navbar, Nav, Button, Container } from 'react-bootstrap'

const Navigation = ({ web3Handler, account }) => {
    return (
        <Navbar expand="lg" bg="dark" variant="dark" className="py-3 shadow-sm">
            <Container>
                <Navbar.Brand as={Link} to="/" className="fw-bold fs-4">
                    <span className="text-primary">🔒</span> SafeVault
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="me-auto ms-4">
                        <Nav.Link as={Link} to="/" className="mx-2 fw-semibold">
                            Home
                        </Nav.Link>
                        <Nav.Link as={Link} to="/create" className="mx-2 fw-semibold">
                            Create
                        </Nav.Link>
                        <Nav.Link as={Link} to="/my-listed-items" className="mx-2 fw-semibold">
                            My Items
                        </Nav.Link>
                    </Nav>
                    <Nav>
                        {account ? (
                            <Nav.Link
                                href={`https://etherscan.io/address/${account}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-decoration-none">
                                <Button variant="outline-primary" size="sm" className="px-3">
                                    <span className="me-2">🟢</span>
                                    {account.slice(0, 6) + '...' + account.slice(-4)}
                                </Button>
                            </Nav.Link>
                        ) : (
                            <Button 
                                onClick={web3Handler} 
                                variant="primary" 
                                className="px-4 fw-semibold">
                                Connect Wallet
                            </Button>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
            
            <style >{`
                .navbar {
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .nav-link {
                    transition: all 0.3s ease;
                    position: relative;
                }
                
                .nav-link:hover {
                    color: #0d6efd !important;
                    transform: translateY(-2px);
                }
                
                .nav-link::after {
                    content: '';
                    position: absolute;
                    width: 0;
                    height: 2px;
                    bottom: 0;
                    left: 50%;
                    background-color: #0d6efd;
                    transition: all 0.3s ease;
                    transform: translateX(-50%);
                }
                
                .nav-link:hover::after {
                    width: 80%;
                }
                
                .btn {
                    transition: all 0.3s ease;
                    border-radius: 8px;
                }
                
                .btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(13, 110, 253, 0.4);
                }
                
                .navbar-brand {
                    transition: all 0.3s ease;
                }
                
                .navbar-brand:hover {
                    transform: scale(1.05);
                }
            `}</style>
        </Navbar>
    )
}

export default Navigation; 