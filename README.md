## To run this project 

- node v8.9.3 or greater is required 

- npm v5.5.1 or greater is required 


## Steps to run API server  on local environment

- Clone this repository

- cd into root directory of a project

```no-highlight 
npm install
```

```no-highlight 
node server.js
```

- Server will accept request on port 3000

- Port can be changed By editing environment specific file in configs folder

## Test Cases

- I have covered testing of this assignment's use cases by implementing test cases
- To Test use cases run the following command. (make sure API server is up and running)
```no-highlight 
npm test
```


## Steps to run API server in a docker

- clone this repository

- cd into root directory of a project

- Before running on a docker make sure to change mongodb connection settings in a config to allow docker to connect to host database

- Reference :  https://stackoverflow.com/questions/24319662/from-inside-of-a-docker-container-how-do-i-connect-to-the-localhost-of-the-mach

```no-highlight 
docker build -t approval-system-apis .
```

```no-highlight 
docker run -p 3000:3000 -d --name approval-system-container approval-system-apis
```


- Refer to mongoSchema.txt File for better understanding of code and logic written in API.



## API Collection And Details

- Postman Collection Link : https://www.getpostman.com/collections/453ab18d3f889fc7b5a5

- Environment file : approvalSystem.postman_environment.json (root directory of a project)
