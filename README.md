# Resapp 📅

By **@alexisreis**, updated in August 2023

Web application to allow users to book resources on shared machines.

This application was developed as part of an **internship at Worldline Labs**, 
Villeurbanne in 2023. It was developed using **React**, **NodeJS** and **Remult**.  

2021.


## Functionalities implemented so far : 🏁
* Known users can **log in** to access the app and API methods
* Authenticated users can see the list of **resource reservations in a calendar** (day, week, and month view)
* Authenticated users can **request a new resource reservation** (with start time, end time, duration and resources needed) 
* For a request, **the service proposes a list of possible reservation slots**, the user can then **choose the best slot and book the reservation**, at booking a mail is sent to the user with a `.ics` file
* Admins have access to a dashboard and restricted **API methods to manage machines** (**block** them for further reservations, **add** new machines and **delete** them)
* Admins have access to **statistics** about the usage of the service and the machines
* Admins can **change the admin status** of other users


## How to run the app ? 🚀

If you are running this locally on your machine don't forget to set the environment variables or the server won't start.
Example :
```
ENV=DEV (or PROD)
DEFAULT_ADMIN_ACCOUNT=areis                       # must be your flastname (infra logs)
DEFAULT_ADMIN_NAME=Alexis Reis                    # must be your name
DEFAULT_ADMIN_MAIL=alexis.reis@mail.com           # must be your mail
```


### Manual run (development mode) ✋
First thing you need to do is to install the dependencies :

```bash
npm install 
```

You can run both the client and the server manually and locally in development mode using these two command in two separate terminals :

* React client :

```bash
npm run dev
```

* NodeJS + Remult server :

```bash
npm run dev-node
```

* Run tests :

```bash
npm run test
```

This command will run the tests using Playwright and generate a report.

### With Docker 🐳

Just run this command : (don't forget to set the environment variables).

```bash
docker compose up
```

Alternatively you can also create the server container using these commands :  
It will install the dependencies, build the client and then run the server. 


```bash
docker build -f Dockerfile -t server .
docker run -it -p 3002:3002 server
```

The NodeJS client will be running and accessible on `localhost:3002`.


## Todo list 📝
* [x] Create a basic React + NodeJS + Remult app (Todo list)
* [x] Create a `Dockerfile` + `docker-compose.yml` file
* [x] Create a Reservation object in Remult
* [x] Create a form to add a Reservation
* [x] Create a Machine object in Remult
* [x] Bind a Machine to a Reservation
* [x] Display Reservations in a calendar
* [x] Create a User object in Remult
* [x] Create a login form, User authentication and context
* [x] Bind a User to a Reservation
* [x] Create a dashboard for admin users
* [x] Create admin restricted API method to add a Machine
* [x] Create a form to add a Machine as an Admin
* [x] Create admin restricted API methods to block and delete a Machine
* [x] Create admin restricted API method to display currently used resources on each Machine
* [x] Create a Log object in Remult and add logs at the end of each user API calls
* [x] Create an API method that for a reservation request, returns a list of possible reservation slots
* [x] Create a form to request resources for a duration in a time range
* [x] Display possible reservation slots in a list and allow users to choose one of them and book it
* [x] Display errors in a fancy PopUp
* [x] Show / hide user's own reservations in the calendar
* [x] Allow users to delete their own reservations
* [x] Use Docker Environment variables and Docker Secrets to store sensitive data
* [x] At booking, send a `.ics` file to user mail
* [x] Handle CSP rules
* [x] Set up the Gitlab CI to deploy automatically (on push on main)
* [x] Dark mode
* [x] Test the app functionalities with Playwright
* [x] Document the app
* [ ] Send reminder email before the reservation begins (with node-schedule)
* [ ] Return hash in reservation slots to allow users to book a slot (optional)
* [ ] Allow admin to add / remove resources to a Machine
* [ ] If no booking slots are available, allow the user to start later