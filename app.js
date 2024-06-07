const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
const dbPath = path.join(__dirname, 'covid19India.db')
app.use(express.json())
let db = null
const intilizerserver = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server is running at http://localhost:3000')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
intilizerserver()

//get all states
app.get('/states/', async (request, response) => {
  const statesquery = `
SELECT
     *
FROM 
    state
ORDER BY
    state_id`
  const allstates = await db.all(statesquery)
  response.send(allstates)
})

//states with id

app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const statewithid = `
  SELECT 
      * 
  FROM
      state
  WHERE 
    state_id = ${stateId}; `

  const dbresponse = await db.get(statewithid)
  response.send(dbresponse)
})

//creating a districts in the district table

app.post('/districts/', async (request, response) => {
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const addDistricts = `
  INSERT INTO 
    district (district_name,state_id,cases,cured,active,deaths)
  VALUES (
        '${districtName}',
        ${stateId},
        ${cases},
        ${cured},
        ${active},
        ${deaths}
  );`
  await db.run(addDistricts)
  response.send('District Successfully Added')
})

//getting districts with id

app.get('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const districtswithid = `
  SELECT * FROM district WHERE district_id = ${districtId};`
  const dbresponse = await db.all(districtswithid)
  response.send(dbresponse)
})

//deleting districts with id

app.delete('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const deltedistricts = `
  DELETE FROM district WHERE 
  district_id = ${districtId}`
  await db.run(deltedistricts)
  response.send('District Removed')
})

//districts update with id

app.put('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const updatingthedistricts = `
  UPDATE
   district 
  SET 
   district_name = '${districtName}',
   state_id = ${stateId},
   cases = ${cases},
   cured = ${cured},
   active = ${active},
   deaths = ${deaths}
   WHERE 
   district_id = ${districtId}
  `
  await db.run(updatingthedistricts)
  response.send('District Details Updated')
})

//stats

app.get('/states/:stateId/stats/', async (request, response) => {
  const {stateId} = request.params
  const sumquery = `
  SELECT 
    SUM(cases)
    SUM(cured)
    SUM(active)
    SUM(deaths)
    FROM
    district
    WHERE
    state_id = ${stateId}`
  const stats = await db.get(sumquery)
  console.log(stats)
  response.send({
    totalCases: stats[' SUM(cases)'],
    totalCured: stats[' SUM(cured)'],
    totalActive: stats[' SUM(active)'],
    totalDeaths: stats[' SUM(deaths)'],
  })
})

//districts details

app.get('/districts/:districtId/details/', async (request, response) => {
  const {districtId} = request.params
  const getDistrictIdQuery = `
    SELECT state_id FROM district
    WHERE district_id = ${districtId};
    `
  const getDistrictIdQueryResponse = await database.get(getDistrictIdQuery)
  const getStateNameQuery = `
    SELECT state_name as stateName FROM state
    WHERE state_id = ${getDistrictIdQueryResponse.state_id};
    `
  const getStateNameQueryResponse = await database.get(getStateNameQuery)
  response.send(getStateNameQueryResponse)
})

module.exports = app
