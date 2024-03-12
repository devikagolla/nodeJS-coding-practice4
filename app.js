const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const convertDbObjectToResponseObject = dbobj => {
  return {
    playerId: dbobj.playerId,
    playerName: dbobj.playerName,
    jerseyNumber: dbobj.jerseyNumber,
    role: dbobj.role,
  }
}

//API1
app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
      cricket_team`
  const playersArray = await db.all(getPlayersQuery)
  response.send(
    playersArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

//API2
app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addPlayerQuery = `
    INSERT INTO
      cricket_team (playerName,jerseyNumber,role)
    VALUES
      (
        '${playerName}',
         ${jerseyNumber},
         '${role}',
      );`
  await db.run(addPlayerQuery)
  response.send('Player Added to Team')
})

//API3
app.get('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const getReqPlayerQuery = `
    SELECT
     *
    FROM
     cricket_team
    WHERE
      player_id = ${playerId};`
  const reqplayerDetails = await db.get(getReqPlayerQuery)
  response.send(convertDbObjectToResponseObject(reqplayerDetails))
})

//API4
app.put('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const {playerName, jerseyNumber, role} = request.body
  const updatePlayerQuery = `
    UPDATE
      cricket_team
    SET
      playerName='${playerName}',
      jerseyNumber=${jerseyNumber},
      role=${role},
    WHERE
      player_id = ${playerId};`
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

//API5
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `
    DELETE FROM
      cricket_team
    WHERE
      player_id = ${playerId};`
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
