import styled from "styled-components";
import { useState } from "react";

const Bar = styled.nav`
  background-image: linear-gradient(260deg, #2af498 0%, #3498db 100%);
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
`;

const MainNav = styled.ul`
  list-style-type: none;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.5);
  position: absolute;
  width: 100%;
  left: 0;
  top: 60px;
  margin: 0;
  padding: 0;
  overflow: hidden;
  max-height: ${({ isOpen }) => (isOpen ? "300px" : "0")};
  transition: max-height 0.3s ease-in-out;

  @media (min-width: 768px) {
    flex-direction: row;
    background: none;
    position: static;
    align-items: center;
    max-height: none;
  }
`;

const NavLi = styled.li`
  text-align: center;
  padding: 10px 20px;

  @media (min-width: 768px) {
    margin: 0 10px;
  }
`;

const NavLink = styled.a`
  color: white;
  text-decoration: none;
  font-weight: bold;

  &:hover {
    text-decoration: underline;
  }
`;

const Logo = styled.a`
  display: inline-block;
  font-size: 24px;
  padding-top: 10px; // Adjust as needed
`;

const NavBarToggle = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 30px;
  display: inline-block;
  cursor: pointer;

  @media (min-width: 768px) {
    display: none;
  }
`;

const HamburgerIcon = styled.div`
  width: 30px;
  height: 3px;
  background-color: white;
  position: relative;
  transition: all 0.3s ease-in-out;

  &::before,
  &::after {
    content: "";
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: white;
    transition: all 0.3s ease-in-out;
  }

  &::before {
    transform: translateY(-10px);
  }

  &::after {
    transform: translateY(10px);
  }

  ${({ isOpen }) =>
    isOpen &&
    `
    transform: rotate(45deg);
    &::before {
      transform: rotate(90deg) translateX(-10px);
    }
    &::after {
      opacity: 0;
    }
  `}
`;

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNav = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Bar>
      <Logo href="#">
        <img
          src="../../assets/Politico.png"
          alt="Logo"
          style={{ height: "40px" }}
        />
      </Logo>
      <NavBarToggle onClick={toggleNav}>
        <HamburgerIcon isOpen={isOpen} />
      </NavBarToggle>
      <MainNav isOpen={isOpen}>
        <NavLi>
          <NavLink href="#">Main</NavLink>
        </NavLi>
        <NavLi>
          <NavLink href="#">Laws</NavLink>
        </NavLi>
        <NavLi>
          <NavLink href="#">Politicians</NavLink>
        </NavLi>
        <NavLi>
          <NavLink href="#">Login</NavLink>
        </NavLi>
      </MainNav>
    </Bar>
  );
}

export default Navbar;
