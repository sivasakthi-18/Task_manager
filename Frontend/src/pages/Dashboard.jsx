import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import {
  Plus, Edit3, Trash2, Calendar, Clock, CheckCircle2,
  Loader2, AlertTriangle, ListTodo, Flag, Search, LogOut, Sun, Moon, Tag
} from "lucide-react";

const API = "http://localhost:5000/api/tasks";

const statusConfig = {
  "Pending": { color: "bg-yellow-100 text-yellow-800 border-yellow-300", icon: Clock },
  "In Progress": { color: "bg-blue-100 text-blue-800 border-blue-300", icon: Loader2 },
  "Completed": { color: "bg-green-100 text-green-800 border-green-300", icon: CheckCircle2 },
};

const priorityConfig = {
  "Low": { color: "bg-gray-100 text-gray-700 border-gray-300", emoji: "🟢" },
  "Medium": { color: "bg-orange-100 text-orange-700 border-orange-300", emoji: "🟡" },
  "High": { color: "bg-red-100 text-red-700 border-red-300", emoji: "🔴" },
};

const categoryConfig = {
  "Work": "bg-indigo-100 text-indigo-700 border-indigo-300",
  "Personal": "bg-pink-100 text-pink-700 border-pink-300",
  "Study": "bg-teal-100 text-teal-700 border-teal-300",
  "Other": "bg-gray-100 text-gray-600 border-gray-300",
};

const cardAccents = {
  "Low": "border-l-gray-400",
  "Medium": "border-l-orange-400",
  "High": "border-l-red-400",
};

function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "Pending",
    priority: "Medium",
    category: "Other",
    dueDate: "",
  });
  const [editId, setEditId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

  const authHeader = { headers: { Authorization: `Bearer ${user.token}` } };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(API, authHeader);
      setTasks(response.data);
    } catch (error) {
      toast.error("Failed to load tasks");
    }
  };

  const resetForm = () => {
    setForm({ title: "", description: "", status: "Pending", priority: "Medium", category: "Other", dueDate: "" });
    setEditId(null);
  };

  const createTask = async () => {
    if (!form.title) return toast.error("Title is required!");
    try {
      if (editId) {
        await axios.put(`${API}/${editId}`, form, authHeader);
        toast.success("Task updated! ✏️");
      } else {
        await axios.post(API, form, authHeader);
        toast.success("Task added! 🎉");
      }
      resetForm();
      fetchTasks();
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API}/${id}`, authHeader);
      toast.success("Task deleted 🗑️");
      fetchTasks();
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  const startEdit = (task) => {
    setForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      category: task.category || "Other",
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
    });
    setEditId(task._id);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const isOverdue = (task) => {
    if (!task.dueDate || task.status === "Completed") return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(task.dueDate) < today;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const filteredTasks = tasks.filter((task) => {
    const statusMatch = statusFilter === "All" || task.status === statusFilter;
    const priorityMatch = priorityFilter === "All" || task.priority === priorityFilter;
    const categoryMatch = categoryFilter === "All" || task.category === categoryFilter;
    const searchMatch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      (task.description || "").toLowerCase().includes(search.toLowerCase());
    return statusMatch && priorityMatch && categoryMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-8 px-4 transition-colors">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
              <ListTodo className="text-purple-500" size={28} />
              Task Manager
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Hi {user.name} 👋 Stay awesome ✨</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-md text-gray-600 dark:text-yellow-300 hover:scale-105 transition"
              title="Toggle theme"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => { logout(); toast.success("Logged out 👋"); }}
              className="p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-md text-red-500 hover:scale-105 transition"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Create / Edit Task Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 border-2 border-purple-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-700 dark:text-gray-100 mb-4 flex items-center gap-2">
            {editId ? <Edit3 size={20} className="text-blue-500" /> : <Plus size={20} className="text-purple-500" />}
            {editId ? "Edit Task" : "Add New Task"}
          </h2>

          <div className="space-y-3">
            <input
              className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              placeholder="✏️ Task title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <input
              className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              placeholder="📝 Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <div className="flex gap-3 flex-wrap">
              <select
                className="flex-1 min-w-[120px] border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="Pending">⏳ Pending</option>
                <option value="In Progress">🔄 In Progress</option>
                <option value="Completed">✅ Completed</option>
              </select>

              <select
                className="flex-1 min-w-[120px] border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="Low">🟢 Low</option>
                <option value="Medium">🟡 Medium</option>
                <option value="High">🔴 High</option>
              </select>

              <select
                className="flex-1 min-w-[120px] border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="Work">💼 Work</option>
                <option value="Personal">🏠 Personal</option>
                <option value="Study">📚 Study</option>
                <option value="Other">📌 Other</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                <Calendar size={14} /> Due Date
              </label>
              <input
                type="date"
                className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={createTask}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl py-2.5 font-semibold hover:opacity-90 hover:shadow-md transition flex items-center justify-center gap-2"
              >
                {editId ? <Edit3 size={18} /> : <Plus size={18} />}
                {editId ? "Update Task" : "Add Task"}
              </button>
              {editId && (
                <button
                  onClick={resetForm}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 text-gray-600 rounded-xl py-2.5 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-3 mb-4 flex items-center gap-2 border-2 border-blue-50 dark:border-gray-700">
          <Search size={18} className="text-gray-400 ml-1" />
          <input
            className="w-full bg-transparent focus:outline-none text-gray-700 dark:text-white"
            placeholder="Search tasks by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 mb-6 flex items-center gap-3 flex-wrap border-2 border-blue-50 dark:border-gray-700">
          <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1">
            <Flag size={16} className="text-purple-400" /> Filters:
          </span>

          <select
            className="border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Pending">⏳ Pending</option>
            <option value="In Progress">🔄 In Progress</option>
            <option value="Completed">✅ Completed</option>
          </select>

          <select
            className="border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="All">All Priority</option>
            <option value="Low">🟢 Low</option>
            <option value="Medium">🟡 Medium</option>
            <option value="High">🔴 High</option>
          </select>

          <select
            className="border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Work">💼 Work</option>
            <option value="Personal">🏠 Personal</option>
            <option value="Study">📚 Study</option>
            <option value="Other">📌 Other</option>
          </select>

          <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Task List */}
        {filteredTasks.length === 0 && (
          <div className="text-center text-gray-400 dark:text-gray-500 py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
            <ListTodo size={40} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p>No tasks match this filter 🤷</p>
          </div>
        )}

        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const StatusIcon = statusConfig[task.status]?.icon || Clock;
            const overdue = isOverdue(task);

            return (
              <div
                key={task._id}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5 flex justify-between items-start border-l-4 hover:shadow-lg transition ${cardAccents[task.priority]} ${overdue ? "ring-2 ring-red-300" : ""}`}
              >
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 dark:text-white text-lg">{task.title}</h3>
                  {task.description && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{task.description}</p>
                  )}

                  <div className="flex gap-2 flex-wrap items-center mt-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1 ${statusConfig[task.status]?.color}`}>
                      <StatusIcon size={12} className={task.status === "In Progress" ? "animate-spin" : ""} />
                      {task.status}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${priorityConfig[task.priority]?.color}`}>
                      {priorityConfig[task.priority]?.emoji} {task.priority}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1 ${categoryConfig[task.category] || categoryConfig["Other"]}`}>
                      <Tag size={12} /> {task.category || "Other"}
                    </span>
                    {task.dueDate && (
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1 ${overdue ? "bg-red-100 text-red-700 border-red-300" : "bg-purple-50 text-purple-600 border-purple-200"}`}>
                        {overdue ? <AlertTriangle size={12} /> : <Calendar size={12} />}
                        {overdue ? "Overdue: " : ""}{formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-3">
                  <button onClick={() => startEdit(task)} className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 transition" title="Edit">
                    <Edit3 size={18} />
                  </button>
                  <button onClick={() => deleteTask(task._id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 transition" title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;