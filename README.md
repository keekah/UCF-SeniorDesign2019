# Spring2019-Group04
Stephen Powell<br />
Tyler Cuervo
Mariana Gomez Kusnecov
Jessica Wingert
Iryna Protasova

# Senior Design Group Scheduling Algorithm and Content Management System
This project was split into two parts.
**Group Scheduler** and **Content Management System**

The **Group Scheduler** was meant to shorten the time it takes to assign students to projects for UCF CS Senior Design 
The **Content Management System** was meant to remake the UCF CS Senior Design website and display groups better

# Installation

Running the django server
1) make sure the VM IP is in "ALLOWED_HOSTS" in settings.py
2) run "sudo python manage.py makemigrations"
    -this will create the db. 
3) run "sudo python manage.py migrate"
    -this will apply changes to db or actually create the db
4) run "sudo python manage.py runserver 0.0.0.0:{port number you wish to use}
5) server should be running
Note: If you ever add changes to the db manually or by making a change in models.py, run steps
    2 and 3 again before starting server

Running the reactJS servers
Note: hopefully the other members have written how to compile their projects as I won't be covering
    that here
1) Navigate to where the project file is "cms" or "csform" unless they have changed it
2) run "sudo PORT={port number you want to run on} npm start