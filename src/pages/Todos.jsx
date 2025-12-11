import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
const API_URL = '/api/todos';
// const API_URL = import.meta.env.VITE_API_URL + '/todos';

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
];

const STATUS_OPTIONS = [
  'To Do',
  'In Progress',
  'Blocked',
  'Done',
];

// Add a function to map status to color classes
const statusColor = (status) => {
  switch (status) {
    case 'To Do': return 'border-blue-400 bg-blue-50';
    case 'In Progress': return 'border-yellow-400 bg-yellow-50';
    case 'Blocked': return 'border-red-400 bg-red-50';
    case 'Done': return 'border-green-400 bg-green-50';
    default: return 'border-blue-100 bg-white';
  }
};

const Todos = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newStatus, setNewStatus] = useState('To Do');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [editingStatus, setEditingStatus] = useState('To Do');
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('list'); // 'list' or 'kanban'
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const toastTimeout = useRef();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchTodos();
    // eslint-disable-next-line
  }, []);

  const fetchTodos = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      setError('Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToast(null), 2500);
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    setError('');
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTodo, description: newDescription, status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to add todo');
      setNewTodo('');
      setNewDescription('');
      setNewStatus('To Do');
      fetchTodos();
      showToast('Task added!', 'success');
    } catch (err) {
      setError(err.message);
      showToast('Failed to add task', 'error');
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}/complete`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to toggle todo');
      fetchTodos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete todo');
      fetchTodos();
      showToast('Task deleted!', 'success');
    } catch (err) {
      setError(err.message);
      showToast('Failed to delete task', 'error');
    }
  };

  const handleEdit = (id, title, description, status) => {
    setEditingId(id);
    setEditingTitle(title);
    setEditingDescription(description || '');
    setEditingStatus(status || 'To Do');
  };

  const handleEditChange = (e) => {
    setEditingTitle(e.target.value);
  };

  const handleEditSubmit = async (id) => {
    if (!editingTitle.trim()) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: editingTitle, description: editingDescription, status: editingStatus }),
      });
      if (!res.ok) throw new Error('Failed to update todo');
      setEditingId(null);
      setEditingTitle('');
      setEditingDescription('');
      setEditingStatus('To Do');
      fetchTodos();
      showToast('Task updated!', 'success');
    } catch (err) {
      setError(err.message);
      showToast('Failed to update task', 'error');
    }
  };

  const handleEditKeyDown = (e, id) => {
    if (e.key === 'Enter') {
      handleEditSubmit(id);
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditingTitle('');
      setEditingDescription('');
      setEditingStatus('To Do');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const todo = todos.find((t) => t._id === id);
      if (!todo) return;
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: todo.title,
          description: todo.description,
          status: newStatus,
        }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      fetchTodos();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  // Dashboard stats
  const total = todos.length;
  const perStatus = STATUS_OPTIONS.map((status) => ({
    status,
    count: todos.filter((t) => t.status === status).length,
  }));
  const completedToday = todos.filter((t) => t.completed && dayjs(t.updatedAt).isSame(dayjs(), 'day')).length;

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return;
    await handleStatusChange(draggableId, destination.droppableId);
  };

  return (
    <div className="font-sans min-h-[calc(100vh-80px)] w-full px-2 sm:px-6 py-8 bg-white/90 rounded-none shadow-none border-0">
      {/* Toast banner */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-semibold transition-all duration-300 ${toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}>{toast.msg}</div>
      )}
      {/* Dashboard summary */}
      <div className="flex flex-wrap gap-4 justify-center mb-8">
        <div className="bg-blue-600 text-white rounded-xl px-6 py-4 shadow text-center min-w-[120px]">
          <div className="text-lg font-bold">Total</div>
          <div className="text-2xl font-extrabold">{total}</div>
        </div>
        {perStatus.map((s) => (
          <div key={s.status} className="bg-blue-100 text-blue-800 rounded-xl px-6 py-4 shadow text-center min-w-[120px]">
            <div className="text-lg font-bold">{s.status}</div>
            <div className="text-2xl font-extrabold">{s.count}</div>
          </div>
        ))}
        <div className="bg-green-100 text-green-800 rounded-xl px-6 py-4 shadow text-center min-w-[120px]">
          <div className="text-lg font-bold">Done Today</div>
          <div className="text-2xl font-extrabold">{completedToday}</div>
        </div>
      </div>
      <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-700 tracking-tight">Welcome to my todo list test1</h2>
      <form onSubmit={handleAddTodo} className="flex flex-col gap-2 mb-6 max-w-2xl mx-auto">
        <div className="flex gap-2">
          <input
            className="flex-1 p-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition"
            type="text"
            placeholder="Add a new todo"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
          />
          <select
            className="p-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        <textarea
          className="w-full p-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition"
          placeholder="Description (optional)"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          rows={2}
        />
        <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 hover:shadow-xl transition self-end" type="submit">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add
        </button>
      </form>
      <div className="flex justify-between items-center mb-4 max-w-2xl mx-auto">
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              className={`px-3 py-1 rounded-full font-medium border transition ${filter === f.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-50'}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          className={`px-3 py-1 rounded-full font-medium border transition ${view === 'kanban' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-50'}`}
          onClick={() => setView(view === 'list' ? 'kanban' : 'list')}
        >
          {view === 'kanban' ? 'List View' : 'Kanban View'}
        </button>
      </div>
      {error && <div className="text-red-600 mb-2 text-center">{error}</div>}
      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : (
        view === 'list' ? (
          <ul className="flex flex-wrap gap-4 max-w-6xl mx-auto pb-2 justify-center">
            {filteredTodos.length === 0 && (
              <li className="text-gray-400 text-center flex flex-col items-center gap-2 py-8 min-w-[320px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6m9-9v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h7l5 5z" /></svg>
                <span>No todos found. Add your first task!</span>
              </li>
            )}
            {filteredTodos.map((todo) => (
              <li
                key={todo._id}
                className={`flex flex-col justify-between p-3 rounded-lg border-2 transition hover:shadow-xl hover:-translate-y-1 duration-200 ${statusColor(todo.status)} flex-grow flex-shrink-0 basis-[320px] max-w-xs`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggle(todo._id)}
                    className="w-5 h-5 accent-blue-600 cursor-pointer"
                  />
                  {editingId === todo._id ? (
                    <div className="flex-1 flex flex-col gap-2">
                      <input
                        className="p-2 border rounded focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400"
                        value={editingTitle}
                        onChange={handleEditChange}
                        onBlur={() => handleEditSubmit(todo._id)}
                        onKeyDown={(e) => handleEditKeyDown(e, todo._id)}
                        autoFocus
                      />
                      <select
                        className="p-2 border rounded focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400"
                        value={editingStatus}
                        onChange={(e) => setEditingStatus(e.target.value)}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      <textarea
                        className="p-2 border rounded focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400"
                        value={editingDescription}
                        onChange={(e) => setEditingDescription(e.target.value)}
                        rows={2}
                      />
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col gap-1">
                      <span
                        className={`cursor-pointer text-lg ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'} hover:underline`}
                        onDoubleClick={() => handleEdit(todo._id, todo.title, todo.description, todo.status)}
                        title="Double-click to edit"
                      >
                        {todo.title}
                      </span>
                      <span className="text-xs text-gray-500">{todo.status}</span>
                      {todo.description && <span className="text-sm text-gray-600 whitespace-pre-line">{todo.description}</span>}
                    </div>
                  )}
                </div>
                <button
                  className="ml-4 flex items-center gap-1 text-red-600 hover:text-red-800 px-2 py-1 rounded transition hover:bg-red-50"
                  onClick={() => handleDelete(todo._id)}
                  title="Delete"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-6 overflow-x-auto pb-2 w-full">
              {STATUS_OPTIONS.map((status) => (
                <Droppable droppableId={status} key={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 min-w-[260px] bg-blue-50 rounded-xl p-3 shadow border border-blue-100 transition ${snapshot.isDraggingOver ? 'bg-blue-100' : ''}`}
                    >
                      <h3 className="text-lg font-bold text-blue-700 mb-2 text-center">{status}</h3>
                      <div className="space-y-2">
                        {todos.filter((todo) => todo.status === status).length === 0 && (
                          <div className="text-gray-400 text-center text-sm flex flex-col items-center gap-2 py-8">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6m9-9v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h7l5 5z" /></svg>
                            <span>No tasks</span>
                          </div>
                        )}
                        {todos.filter((todo) => todo.status === status).map((todo, idx) => (
                          <Draggable draggableId={todo._id} index={idx} key={todo._id}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white rounded-lg p-3 shadow flex flex-col gap-1 border-2 border-blue-100 relative group hover:shadow-xl hover:-translate-y-1 transition duration-200 ${snapshot.isDragging ? 'ring-2 ring-blue-400' : ''}`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <input
                                    type="checkbox"
                                    checked={todo.completed}
                                    onChange={() => handleToggle(todo._id)}
                                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                                  />
                                  <span className={`font-semibold ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>{todo.title}</span>
                                </div>
                                <span className="text-xs text-gray-500">{todo.status}</span>
                                {todo.description && <span className="text-sm text-gray-600 whitespace-pre-line">{todo.description}</span>}
                                <div className="flex gap-1 mt-2">
                                  {STATUS_OPTIONS.filter((s) => s !== status).map((s) => (
                                    <button
                                      key={s}
                                      className="text-xs px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-200 transition"
                                      onClick={() => handleStatusChange(todo._id, s)}
                                    >
                                      {s}
                                    </button>
                                  ))}
                                  <button
                                    className="ml-auto flex items-center gap-1 text-green-600 hover:text-red-800 px-2 py-1 rounded transition hover:bg-red-50"
                                    onClick={() => handleDelete(todo._id)}
                                    title="Delete"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        )
      )}
    </div>
  );
};

export default Todos; 