# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["screenshot of URLs page"](https://github.com/BENcao318/tinyapp/blob/master/docs/urls-page.png?raw=true)
!["screenshot of Register page"](https://github.com/BENcao318/tinyapp/blob/master/docs/register-page.png?raw=true)
!["screenshot of Login page"](https://github.com/BENcao318/tinyapp/blob/master/docs/login-page.png?raw=true)
!["screenshot of Create URL page"](https://github.com/BENcao318/tinyapp/blob/master/docs/createURL-page.png?raw=true)
!["screenshot of logged in URLs page"](https://github.com/BENcao318/tinyapp/blob/master/docs/urls-page2.png?raw=true)
!["screenshot of Editing page"](https://github.com/BENcao318/tinyapp/blob/master/docs/edit-page.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session
- method-override


## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

## Introduction

This web app will allow you to create your unique user account in the database and generate as many short URLs as you want! 

Each user will have his/her own list of URLs and the app allows editting at any time. 

You can also track the time and visitor info in the editing page to understand how poplular the URL is.

We hash your password and encrypt every cookie to ensure the security of your information. 