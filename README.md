# Spring2019-Group04
Stephen Powell<br />
Tyler Cuervo<br />
Mariana Gomez Kusnecov<br />
Jessica Wingert<br />
Iryna Protasova<br />

# Senior Design Group Scheduling Algorithm and Content Management System
This project was split into two parts.<br />
**Group Scheduler** and **Content Management System**

The **Group Scheduler** was meant to shorten the time it takes to assign students to projects for UCF CS Senior Design<br />
The **Content Management System** was meant to remake the UCF CS Senior Design website and display groups better

# Installation

Running the django server
1) make sure the VM IP is in "ALLOWED_HOSTS" in settings.py
2) run "sudo python manage.py makemigrations"
    -this will create the db. 
3) run "sudo python manage.py migrate"
    -this will apply changes to db or actually create the db
4) run "sudo python manage.py runserver 0.0.0.0:{port number you wish to use}
5) server should be running<br />
Note: If you ever add changes to the db manually or by making a change in models.py, run steps
    2 and 3 again before starting server

Running the reactJS servers
1) install node.js onto the server
2) navigate to react project directory (contains package.json) in terminal
3) run "npm install" ( this will install all dependencies for the project you can ignore vulnerabilities)
4) run "sudo PORT={port number you want to run on} npm start" to test the server
5) if there is any dependencies that it cannot locate such as "@css/normalize.css" you can install them with "npm i @css/normalize.css"
6) repeat 4-5 until webpage loads on localhost:{port#}
7) to build the project you run "npm run build" in the terminal
8) you will then have a build folder inside the project directory. put all of the contents of the build directory (such as index.html) inside the root directory