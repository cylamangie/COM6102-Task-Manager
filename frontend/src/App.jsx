import { useState, useEffect } from 'react'
import io from 'socket.io-client'

const socket = io('http://localhost:5001')

function App() {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const boardId = 1

  useEffect(() => {
    fetch(`/api/boards/${boardId}/tasks`)
      .then(res => res.json())
      .then(setTasks)

    socket.on('taskCreated', (task) => {
      setTasks(prev => [task, ...prev])
    })

    socket.on('taskDeleted', (deletedTaskId) => {
      setTasks(prev => prev.filter(task => task.id !== deletedTaskId))
    })

    socket.on('taskUpdated', (updatedTask) => {
      setTasks(prev =>
        prev.map(task => task.id === updatedTask.id ? updatedTask : task)
      )
    })

    return () => {
      socket.off('taskCreated')
      socket.off('taskDeleted')
      socket.off('taskUpdated')
    }
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

  const deleteTask = async (taskId) => {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE'
    })

    if (!res.ok) {
      alert('Failed to delete task')
    }
  }

  const editTask = async (task) => {
    const newTitle = prompt('Enter new task title:', task.title)

    if (!newTitle || !newTitle.trim()) return

    const res = await fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle })
    })

    if (!res.ok) {
      alert('Failed to update task title')
    }
  }

  const updateStatus = async (taskId, newStatus) => {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })

    if (!res.ok) {
      alert('Failed to update status')
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
        <button type="submit" style={{ padding: '10px 20px' }}>
          Add Task
        </button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tasks.map(task => (
          <li
            key={task.id}
            style={{
              padding: '12px',
              border: '1px solid #ccc',
              margin: '8px 0',
              borderRadius: '8px'
            }}
          >
            <strong>{task.title}</strong>
            {task.description && <p>{task.description}</p>}

            <div style={{ marginTop: '8px', marginBottom: '8px' }}>
              <label style={{ marginRight: '8px' }}>Status:</label>
              <select
                value={task.status}
                onChange={(e) => updateStatus(task.id, e.target.value)}
                style={{ padding: '6px' }}
              >
                <option value="todo">todo</option>
                <option value="in-progress">in-progress</option>
                <option value="done">done</option>
              </select>
            </div>

            <small>
              Updated: {new Date(task.updated_at).toLocaleString()}
            </small>
            <br />

            <button
              onClick={() => editTask(task)}
              style={{
                marginTop: '8px',
                marginRight: '8px',
                padding: '6px 12px',
                backgroundColor: '#0275d8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Edit
            </button>

            <button
              onClick={() => deleteTask(task.id)}
              style={{
                marginTop: '8px',
                padding: '6px 12px',
                backgroundColor: '#d9534f',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      <p><em>Open 2 browser tabs to test real-time sync!</em></p>
    </div>
  )
}

export default App