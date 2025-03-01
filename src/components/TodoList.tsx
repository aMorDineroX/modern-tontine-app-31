import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getTodos() {
      try {
        setLoading(true)
        const { data, error } = await supabase.from('todos').select('*')

        if (error) {
          throw error
        }

        if (data) {
          setTodos(data)
        }
      } catch (error) {
        console.error('Error fetching todos:', error)
      } finally {
        setLoading(false)
      }
    }

    getTodos()
  }, [])

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Todo List</h2>
      {loading ? (
        <p>Loading todos...</p>
      ) : (
        <ul className="space-y-2">
          {todos.length > 0 ? (
            todos.map((todo) => (
              <li key={todo.id} className="p-2 border rounded">
                <span className={todo.completed ? 'line-through' : ''}>
                  {todo.title}
                </span>
              </li>
            ))
          ) : (
            <p>No todos found</p>
          )}
        </ul>
      )}
    </div>
  )
}

export default TodoList