'use client';

import { useState, useEffect } from 'react';
import { Plus, CheckCircle, Trash2, Clock, Calendar, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Themes ---
const themes = {
  noir: { bg: 'bg-zinc-950', text: 'text-zinc-100', accent: 'bg-zinc-700' },
  sunset: { bg: 'bg-orange-50', text: 'text-orange-950', accent: 'bg-orange-500' },
  forest: { bg: 'bg-emerald-50', text: 'text-emerald-950', accent: 'bg-emerald-600' },
  ocean: { bg: 'bg-blue-50', text: 'text-blue-950', accent: 'bg-blue-600' },
  neon: { bg: 'bg-purple-900', text: 'text-purple-50', accent: 'bg-pink-500' },
};

// --- Types ---
type Priority = 'high' | 'medium' | 'low';
type ThemeName = keyof typeof themes;

interface Task {
  id: string;
  title: string;
  folder: string;
  priority: Priority;
  status: 'pending' | 'done';
  dueDate: string; // YYYY-MM-DD
  dueTime: string;
}

// --- Main Application ---
export default function TomoDoApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [folders] = useState(['General', 'Work', 'Personal']);
  const [activeFolder, setActiveFolder] = useState('General');
  const [activeTheme, setActiveTheme] = useState<ThemeName>('noir');
  const [showHistory, setShowHistory] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium' as Priority, date: new Date().toISOString().split('T')[0], time: '09:00' });

  const theme = themes[activeTheme];

  useEffect(() => {
    const savedTasks = localStorage.getItem('tomo-do-tasks');
    if (savedTasks) setTasks(JSON.parse(savedTasks));
  }, []);

  useEffect(() => {
    localStorage.setItem('tomo-do-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!newTask.title) return;
    
    const taskDateTime = new Date(`${newTask.date}T${newTask.time}`);
    const now = new Date();
    
    // Check if in past
    if (taskDateTime <= now) {
      alert("Uh oh! Cannot set a task in the past. Please select a future time.");
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      folder: activeFolder,
      priority: newTask.priority,
      status: 'pending',
      dueDate: newTask.date,
      dueTime: newTask.time,
    };
    setTasks([...tasks, task]);
    setNewTask({ title: '', priority: 'medium', date: new Date().toISOString().split('T')[0], time: '09:00' });
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t));
  };
  
  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const filteredTasks = tasks.filter(t => t.folder === activeFolder && (showHistory ? t.status === 'done' : t.status === 'pending'));

  return (
    <div className={cn("min-h-screen p-4 transition-colors duration-300", theme.bg, theme.text)}>
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">TOMO-DO</h1>
          <p className="text-sm opacity-70">{new Date().toDateString()}</p>
        </div>
        <div className="flex gap-2">
            {Object.keys(themes).map(t => (
                <button key={t} onClick={() => setActiveTheme(t as ThemeName)} className={cn("w-6 h-6 rounded-full border-2", themes[t as ThemeName].accent)}/>
            ))}
        </div>
      </header>
      
      {/* Add Task Form */}
      <div className={cn("p-4 rounded-xl mb-6", `${theme.accent}/20`)}>
        <input type="text" placeholder="Task title..." value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="w-full bg-transparent border-b outline-none mb-2 placeholder-zinc-400" />
        <div className="flex flex-wrap gap-2 text-sm bg-black/10 p-2 rounded-lg items-center">
          <div className="flex items-center gap-1 border-r border-black/10 pr-2">
            <Calendar size={14} className="opacity-70" />
            <input type="date" value={newTask.date} onChange={e => setNewTask({...newTask, date: e.target.value})} className="bg-transparent outline-none"/>
          </div>
          <div className="flex items-center gap-1 border-r border-black/10 pr-2">
            <Clock size={14} className="opacity-70" />
            <input type="time" value={newTask.time} onChange={e => setNewTask({...newTask, time: e.target.value})} className="bg-transparent outline-none"/>
          </div>
          <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value as Priority})} className="bg-transparent outline-none">
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
          </select>
          <button onClick={addTask} className="ml-auto p-2 rounded-full bg-black/20"><Plus size={16}/></button>
        </div>
      </div>

      <nav className="flex gap-2 mb-4 overflow-x-auto">
        {folders.map(f => (
          <button key={f} onClick={() => setActiveFolder(f)} className={cn("px-4 py-2 rounded-full text-sm font-semibold", activeFolder === f ? theme.accent : "opacity-50")}>{f}</button>
        ))}
      </nav>

      <div className="flex gap-4 mb-4 text-sm font-semibold opacity-70">
        <button onClick={() => setShowHistory(false)} className={!showHistory ? "border-b-2" : ""}>Pending</button>
        <button onClick={() => setShowHistory(true)} className={showHistory ? "border-b-2" : ""}>History</button>
      </div>

      <main className="space-y-3">
        {filteredTasks.map(task => (
          <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-black bg-opacity-5">
            <button onClick={() => toggleTask(task.id)}><CheckCircle className={task.status === 'done' ? "text-green-500" : "opacity-30"}/></button>
            <div className='flex-grow'>
              <div className="font-semibold">{task.title}</div>
              <div className="text-xs opacity-60 flex gap-2"><Calendar size={12}/>{task.dueDate} <Clock size={12}/> {task.dueTime}</div>
            </div>
            <span className={cn("text-[10px] px-2 py-0.5 rounded uppercase font-bold", task.priority === 'high' ? "bg-red-500" : task.priority === 'medium' ? "bg-orange-500" : "bg-emerald-500")}>{task.priority}</span>
            <button onClick={() => deleteTask(task.id)}><Trash2 size={16} className="opacity-50 hover:text-red-500"/></button>
          </div>
        ))}
      </main>
    </div>
  );
}
