import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import Navbar from "@/components/Navbar";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

function SupabaseDemo() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [newTodo, setNewTodo] = useState('')

  useEffect(() => {
    getTodos()
  }, [])

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

  async function addTodo() {
    if (!newTodo.trim()) return

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([{ title: newTodo, completed: false }])
        .select()

      if (error) {
        throw error
      }

      if (data) {
        setTodos([...todos, ...data])
        setNewTodo('')
      }
    } catch (error) {
      console.error('Error adding todo:', error)
    }
  }

  async function toggleTodo(id: number, completed: boolean) {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed: !completed })
        .eq('id', id)

      if (error) {
        throw error
      }

      setTodos(
        todos.map((todo) => {
          if (todo.id === id) {
            return { ...todo, completed: !completed }
          }
          return todo
        })
      )
    } catch (error) {
      console.error('Error updating todo:', error)
    }
  }

  async function deleteTodo(id: number) {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      setTodos(todos.filter((todo) => todo.id !== id))
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Supabase Todo Demo</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex mb-6">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new todo..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addTodo()
                }
              }}
            />
            <button
              onClick={addTodo}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-r-md transition-colors"
            >
              Add
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <ul className="space-y-2">
              {todos.length > 0 ? (
                todos.map((todo) => (
                  <li
                    key={todo.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id, todo.completed)}
                        className="h-5 w-5 text-purple-600 rounded focus:ring-purple-500 dark:bg-gray-600"
                      />
                      <span
                        className={`ml-3 ${
                          todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-white'
                        }`}
                      >
                        {todo.title}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </li>
                ))
              ) : (
                <p className="text-center py-4 text-gray-500 dark:text-gray-400">No todos yet. Add one above!</p>
              )}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}

export default SupabaseDemo