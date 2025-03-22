import React from 'react';
import { FacebookOutlined, TwitterOutlined, InstagramOutlined, GithubOutlined } from '@ant-design/icons';
import './Footer.css';  // We will define the styles in the accompanying CSS file

const Footer = () => {
  return (
    <div className="footer-container">
      <div className="footer-content">
        <div className="footer-text">
          <p>&copy; {new Date().getFullYear()} Ishas Songothon. All rights reserved.  || Developed by: ZUBAYER HOSSEN</p>
        </div>
        <div className="footer-socials">
          <a href="https://www.facebook.com/ishasOrganization/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <FacebookOutlined className="footer-icon" />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
            <TwitterOutlined className="footer-icon" />
          </a>
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <InstagramOutlined className="footer-icon" />
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <GithubOutlined className="footer-icon" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Footer;
