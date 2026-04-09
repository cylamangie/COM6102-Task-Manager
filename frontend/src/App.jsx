import { useState, useEffect } from 'react'
import io from 'socket.io-client'

const socket = io('http://localhost:5001')

function App() {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const boardId = 1

  useEffect(() => {
    // Load initial tasks
    fetch(`/api/boards/${boardId}/tasks`)
      .then(res => res.json())
      .then(setTasks)

    // Socket listeners
    socket.on('taskCreated', (task) => {
      setTasks(prev => [task, ...prev])
    })

    return () => socket.off('taskCreated')
  }, [])

  const addTask = async (e) => {
    e.preventDefault()
    if (!newTask.trim()) return

    const res = await fetch(`/api/boards/${boardId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTask })
    })

    if (res.ok) {
      setNewTask('')
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🚀 COM6102 Task Manager (Board {boardId})</h1>
      
      <form onSubmit={addTask} style={{ marginBottom: '20px' }}>
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add new task..."
          style={{ padding: '10px', width: '300px', marginRight: '10px' }}
        />
        <button type="submit" style={{ padding: '10px 20px' }}>Add Task</button>
      </form>

      <ul>
        {tasks.map(task => (
          <li key={task.id} style={{ padding: '10px', border: '1px solid #ccc', margin: '5px 0' }}>
            <strong>{task.title}</strong>
            {task.description && <p>{task.description}</p>}
            <small>Status: {task.status} | {new Date(task.updated_at).toLocaleString()}</small>
          </li>
        ))}
      </ul>

      <p><em>Open 2 browser tabs to test real-time sync!</em></p>
    </div>
  )
}

export default App
