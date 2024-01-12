const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const databasePath = path.join(__dirname, 'todoApplication.db')

const app = express()

app.use(express.json())

let database = null

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

// Get list of all todos whose status is 'TO DO' API 1

app.get('/todos/', async (request, response) => {
  const {status, priority, search_q = ''} = request.query
  let getTodoStatusQuery = null
  switch (true) {
    case status !== undefined && priority !== undefined:
      getTodoStatusQuery = `
      SELECT *
      FROM todo
      WHERE status = "${status}" AND 
      priority = "${priority}";
      `
      break
    case status !== undefined:
      getTodoStatusQuery = `
      SELECT *
      FROM todo
      WHERE status = "${status}";
      `
      break
    case priority !== undefined:
      getTodoStatusQuery = `
      SELECT *
      FROM todo
      WHERE priority = "${priority}";
      `
      break
    default:
      getTodoStatusQuery = `
      SELECT *
      FROM todo
      WHERE todo LIKE "%${search_q}%";
      `
      break
  }

  const todoStatusResponse = await database.all(getTodoStatusQuery)
  response.send(todoStatusResponse)
})

// Get a specific todo based on the todo ID API 2
app.get('/todos/:todoId', async (request, response) => {
  const {todoId} = request.params
  const getTodoQuery = `
  SELECT *
  FROM todo
  WHERE id = ${todoId};
  `
  const todoResponse = await database.get(getTodoQuery)
  response.send(todoResponse)
})

// Post a todo in the todo table API 3
app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const addTodoQuery = `
  INSERT INTO 
  todo (id, todo, priority, status)
  VALUES (${id}, "${todo}", "${priority}", "${status}");
  `
  await database.run(addTodoQuery)
  response.send('Todo Successfully Added')
})

// Updates the details of a specific todo based on the todo ID API 4
app.put('/todos/:todoId', async (request, response) => {
  const {todoId} = request.params
  const {todo, priority, status} = request.body
  let updateTodoQuery = null
  switch (true) {
    case todo !== undefined:
      updateTodoQuery = `
      UPDATE todo 
      SET todo = "${todo}";
      `
      await database.get(updateTodoQuery)
      response.send('Todo Updated')
      break
    case priority !== undefined:
      updateTodoQuery = `
      UPDATE todo 
      SET priority = "${priority}";
      `
      await database.get(updateTodoQuery)
      response.send('Priority Updated')
      break
    case status !== undefined:
      updateTodoQuery = `
      UPDATE todo 
      SET status = "${status}";
      `
      await database.get(updateTodoQuery)
      response.send('Status Updated')
      break
  }
})

// Delete a todo from the todo table based on the todo ID API 5
app.delete('/todos/:todoId', async (request, response) => {
  const {todoId} = request.params
  const deleteTodoQuery = `
  DELETE FROM todo
  WHERE id = ${todoId};
  `
  await database.run(deleteTodoQuery)
  response.send('Todo Deleted')
})

module.exports = app
