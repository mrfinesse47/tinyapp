# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).
Super secure application, REST assured your data will be safe from attacks.

## Final Product

##### An overview of the users control panel:
##### The control panel now tracks unique views and total views

!["An overview of the users control panel"](https://github.com/mrfinesse47/tinyapp/blob/master/docs/4.png?raw=true)

##### You can update existing URLS:
##### The edit page now tracks all visitors to the short URL, by their visitor cookie ID, and visit Date.

!["You can update existing URLS"](https://github.com/mrfinesse47/tinyapp/blob/master/docs/3.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session
- uuid
- method-override

## Issues/Bugs

- There is no database as of yet implemented, server must stay up in order for data to persist.

## Recent Changes

- Now supports PUT and Delete.

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
