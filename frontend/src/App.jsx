import { useState, useEffect } from 'react'
import io from 'socket.io-client'

const socket = io('http://localhost:5001')

function App() {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [newPriority, setNewPriority] = useState('medium')
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
      body: JSON.stringify({ title: newTask, priority: newPriority })
    })

    if (res.ok) {
      setNewTask('')
      setNewPriority('medium')
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
    const newStatus = prompt('Enter new status (todo/in-progress/done):', task.status)
    const newPriority = prompt('Enter new priority (low/medium/high):', task.priority)

    if (!newTitle || !newTitle.trim()) return

    const res = await fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title: newTitle.trim(), 
        status: newStatus?.trim() || task.status,
        priority: newPriority?.trim() || task.priority
      })
    })

    if (!res.ok) {
      alert('Failed to update task')
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

  const updatePriority = async (taskId, newPriority) => {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority: newPriority })
    })

    if (!res.ok) {
      alert('Failed to update priority')
    }
  }

  const groupedTasks = {
  todo: (tasks || []).filter(task => task.status === 'todo'),
  'in-progress': (tasks || []).filter(task => task.status === 'in-progress'),
  done: (tasks || []).filter(task => task.status === 'done')
}

  const getColumnStyle = (status) => {
    switch (status) {
      case 'todo':
        return {
          backgroundColor: '#fff8e1',
          borderTop: '6px solid #f59e0b'
        }
      case 'in-progress':
        return {
          backgroundColor: '#eff6ff',
          borderTop: '6px solid #3b82f6'
        }
      case 'done':
        return {
          backgroundColor: '#ecfdf5',
          borderTop: '6px solid #10b981'
        }
      default:
        return {
          backgroundColor: '#f9fafb',
          borderTop: '6px solid #9ca3af'
        }
    }
  }

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'todo':
        return {
          backgroundColor: '#fef3c7',
          color: '#92400e'
        }
      case 'in-progress':
        return {
          backgroundColor: '#dbeafe',
          color: '#1d4ed8'
        }
      case 'done':
        return {
          backgroundColor: '#d1fae5',
          color: '#065f46'
        }
      default:
        return {
          backgroundColor: '#e5e7eb',
          color: '#374151'
        }
    }
  }

  const getPriorityBadgeStyle = (priority) => {
    switch (priority) {
      case 'low':
        return {
          backgroundColor: '#d1fae5',
          color: '#065f46'
        }
      case 'medium':
        return {
          backgroundColor: '#fef3c7',
          color: '#92400e'
        }
      case 'high':
        return {
          backgroundColor: '#fee2e2',
          color: '#dc2626'
        }
      default:
        return {
          backgroundColor: '#e5e7eb',
          color: '#374151'
        }
    }
  }

  const renderColumn = (title, statusKey, items) => (
    <div
      style={{
        ...getColumnStyle(statusKey),
        borderRadius: '14px',
        padding: '16px',
        minHeight: '420px',
        boxShadow: '0 6px 18px rgba(0,0,0,0.05)'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: '20px',
            color: '#111827'
          }}
        >
          {title}
        </h2>

        <span
          style={{
            backgroundColor: '#111827',
            color: 'white',
            borderRadius: '999px',
            padding: '4px 10px',
            fontSize: '12px',
            fontWeight: '600'
          }}
        >
          {items.length}
        </span>
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        {items.map(task => (
          <div
            key={task.id}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '14px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 3px 10px rgba(0,0,0,0.04)'
            }}
          >
            <h3
              style={{
                margin: '0 0 8px 0',
                fontSize: '17px',
                color: '#111827'
              }}
            >
              {task.title}
            </h3>

            <div
              style={{
                display: 'inline-block',
                padding: '5px 10px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: '600',
                marginBottom: '6px',
                ...getStatusBadgeStyle(task.status)
              }}
            >
              {task.status}
            </div>

            <div
              style={{
                display: 'inline-block',
                padding: '5px 10px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: '600',
                marginBottom: '10px',
                ...getPriorityBadgeStyle(task.priority)
              }}
            >
              {task.priority}
            </div>

            {task.description && (
              <p
                style={{
                  margin: '0 0 10px 0',
                  color: '#4b5563',
                  fontSize: '14px'
                }}
              >
                {task.description}
              </p>
            )}

            <div style={{ marginBottom: '10px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '13px',
                  color: '#374151',
                  fontWeight: '600'
                }}
              >
                Change status
              </label>

              <select
                value={task.status}
                onChange={(e) => updateStatus(task.id, e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px'
                }}
              >
                <option value="todo">todo</option>
                <option value="in-progress">in-progress</option>
                <option value="done">done</option>
              </select>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '13px',
                  color: '#374151',
                  fontWeight: '600'
                }}
              >
                Change priority
              </label>

              <select
                value={task.priority}
                onChange={(e) => updatePriority(task.id, e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px'
                }}
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
            </div>

            <p
              style={{
                margin: '0 0 12px 0',
                fontSize: '12px',
                color: '#6b7280'
              }}
            >
              Updated: {new Date(task.updated_at).toLocaleString()}
            </p>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => editTask(task)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Edit
              </button>

              <button
                onClick={() => deleteTask(task.id)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.7)',
              border: '1px dashed #cbd5e1',
              borderRadius: '12px',
              padding: '18px',
              color: '#6b7280',
              fontSize: '14px',
              textAlign: 'center'
            }}
          >
            No tasks in this column
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f3f4f6',
        padding: '32px 20px',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
          }}
        >
          <h1
            style={{
              margin: '0 0 8px 0',
              fontSize: '34px',
              color: '#111827'
            }}
          >
            🚀 COM6102 Task Manager
          </h1>

          <p
            style={{
              margin: '0 0 20px 0',
              color: '#6b7280'
            }}
          >
            Real-time collaborative Kanban board (Board {boardId})
          </p>

          <form
            onSubmit={addTask}
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap'
            }}
          >
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task..."
              style={{
                flex: '1 1 300px',
                padding: '14px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '10px',
                fontSize: '15px'
              }}
            />

            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              style={{
                padding: '14px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '10px',
                fontSize: '15px',
                backgroundColor: 'white'
              }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <button
              type="submit"
              style={{
                padding: '14px 20px',
                backgroundColor: '#111827',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Add Task
            </button>
          </form>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}
        >
          {renderColumn('To Do', 'todo', groupedTasks.todo)}
          {renderColumn('In Progress', 'in-progress', groupedTasks['in-progress'])}
          {renderColumn('Done', 'done', groupedTasks.done)}
        </div>

        <p
          style={{
            marginTop: '20px',
            color: '#6b7280',
            fontStyle: 'italic'
          }}
        >
          Open 2 browser tabs to test real-time Kanban sync.
        </p>
      </div>
    </div>
  )
}

export default App