import express, { json } from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { dbAll, initializeDatabase, dbGet, dbRun } from './Util/database.js';

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'Public')));

app.use((err, req, res, next) => {
    if(err)
        res.status(500).json({message: `Error: ${err.message}`});
});

app.get('/classes', async (_, res) => {
    const classes = await dbAll('SELECT * FROM timetable');
    res.status(200).json(classes);
});

app.get('/classes/:day', async (req, res) => {
    const day = req.params.day;
    const classes = await dbGet('SELECT * FROM timetable WHERE day = ?', [day]);
    if (classes.length === 0) // Fixed condition
        return res.status(404).json({ message: 'Classes not found' });

    res.status(200).json(classes);
})

app.get('/class/:id', async (req, res) => {
    const id = req.params.id;
    const cls = await dbGet('SELECT * FROM timetable WHERE id = ?', [id]);
  
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    res.status(200).json(cls);
});

app.post('/class', async (req, res) => {
    const classModel = req.body;
    if(!classModel.day || !classModel.classNumber || !classModel.className)
        return res.status(400).json({message: 'Day, class number and class are required'});
    const result = await dbRun('INSERT INTO timetable (day, classNumber, className) VALUES (?, ?, ?)', [classModel.day, classModel.classNumber, classModel.className]);
    return res.status(201).json({ id: result.lastID, ...classModel });
});

app.put('/class/:id', async (req, res) => {
    const id = req.params.id;
    const selectedClass = await dbGet('SELECT * FROM timetable WHERE id = ?', [id]);
    if (!selectedClass) 
        return res.status(404).json({ message: 'Class not found' });

    const { day, classNumber, className } = req.body;
    if (!day || !classNumber || !className)
        return res.status(400).json({ message: 'Day, class number, and class name are required' });

    await dbRun('UPDATE timetable SET day = ?, classNumber = ?, className = ? WHERE id = ?', [day, classNumber, className, id]);
    const updatedClass = { id: +id, day, classNumber, className };
    console.log('Updated class data:', updatedClass);
    res.status(200).json(updatedClass);

    const response = await fetch(`/class/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedClass),
    });

    const responseData = await response.json();
    console.log('Server response:', responseData);
});

app.delete('/timetable/:id', async (req, res) => {
    const id = req.params.id;
    const user = await dbGet('SELECT * FROM timetable WHERE id = ?', [id]);
    if(!user)
        return res.status(404).json({message: 'User not found'});
    await dbRun('DELETE FROM timetable WHERE id = ?', [id]);
    res.status(200).json({message: 'User deleted'});
});

async function startServer() {
    await initializeDatabase();
    app.listen(3000, ()=>
        {
            console.log('Server is running on port 3000');
        })
}

await startServer();