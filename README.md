# What is blacktea
Blacktea is a simple word association game that you can play with your friends!

# deployment
```
npm i
npm run deploy
```
# technical stack
Not anything really crazy:			

[nodejs](https://nodejs.org/en)			

[ejs](https://www.npmjs.com/package/ejs)			

[express](https://www.npmjs.com/package/express)			

You might realized that there is no databased used here at all and that is because there is no real need to actually have a database

# general docs
The event table will be here soon

# progress
About 90%

# things to note
This project is completely in development, so please ignore this


# flaws (data)
This is a prototype version, and there are a lot of areas to improve on. For example socket events and the way the data structures are built. Many of the changes are made on the fly and this is evident from the room and player management (the room a player is in). In general the architecture of socket interactions are pretty bad and there are many things to work on. (It primarily centers on the data structure.)

# flaws (codebase)
Certain files were too big and organisation of certain things were done horribly.

# flaws (frontEnd and backEnd)
Many of the frontEnd components could actually be simplified, but I made it complicated for no real reason. Escially with the create room component. (I need to use API routes instead of socket.io to do it. The moment I reload a page the socket id is invalidated, this is one of the late developed parts and this should be avoided.)

# v2
Version 2 of this game will resolve the flaws above and add on time limits before the next turn. I am also considering of making this game have multiple game modes and a bit more customizable.